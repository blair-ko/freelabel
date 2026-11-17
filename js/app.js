(function () {
  const PX_PER_MM = 3.7795275591;
  const STORAGE_KEY = 'freelabel_studio_v1';

  const uid = () => 'el_' + Math.random().toString(36).slice(2, 9);
  const clone = (obj) => JSON.parse(JSON.stringify(obj));

  const state = {
    labels: [],
    activeLabelIndex: 0,
    selectedLabelIds: new Set(),
    selectedId: null,
    activeTab: 'templates',
    iconCat: '全部',
    iconQuery: '',
    zoom: 1.8,
    showGrid: true,
    thermalPreview: false,
    history: [],
    future: [],
    editingTextId: null
  };

  // DOM References
  const $ = (sel) => document.querySelector(sel);
  const elPaper = $('#label-paper');
  const elGrid = $('#label-grid');
  const elElements = $('#label-elements');
  const elSnap = $('#snap-guides');
  const elSelection = $('#selection-overlay');
  const elDimTag = $('#paper-dimensions-tag');
  const elLeftDrawer = $('#left-drawer');
  const elRightPanel = $('#right-panel');
  const elStripTrack = $('#strip-track');
  const elStripMeta = $('#strip-meta');
  const elPrintBadge = $('#print-count-badge');
  const elZoomLabel = $('#zoom-label');

  // --- Initialization ---
  function init() {
    loadFromStorage();
    if (!state.labels.length) {
      const tpl = FreeLabelAssets.templates[0];
      state.labels.push(createLabelFromTemplate(tpl));
    }
    state.selectedLabelIds = new Set([activeLabel().id]);
    bindGlobalEvents();
    renderAll();
    fitZoomToViewport();
  }

  function createLabelFromTemplate(tpl) {
    const lbl = clone(tpl.label);
    lbl.id = uid();
    lbl.name = tpl.name;
    lbl.elements = lbl.elements.map((e) => ({
      id: uid(),
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      ...e
    }));
    return lbl;
  }

  function createBlankLabel(w = 40, h = 25, radius = 2) {
    return {
      id: uid(),
      name: `標籤 ${state.labels.length + 1}`,
      w,
      h,
      radius,
      bg: '#ffffff',
      elements: [
        {
          id: uid(),
          type: 'text',
          text: '雙擊編輯標籤內容',
          x: Math.round((w * PX_PER_MM - 140) / 2),
          y: Math.round((h * PX_PER_MM - 32) / 2),
          w: 140,
          h: 32,
          fontSize: 14,
          fontWeight: '700',
          fontFamily: "'Noto Sans TC', sans-serif",
          color: '#0f172a',
          textAlign: 'center',
          rotation: 0,
          opacity: 1,
          effect: 'none'
        }
      ]
    };
  }

  function activeLabel() {
    return state.labels[state.activeLabelIndex] || state.labels[0];
  }

  function selectedElement() {
    const lbl = activeLabel();
    return lbl.elements.find((e) => e.id === state.selectedId) || null;
  }

  // --- History & Persistence ---
  function pushHistory() {
    state.history.push(JSON.stringify({ labels: state.labels, activeLabelIndex: state.activeLabelIndex }));
    if (state.history.length > 40) state.history.shift();
    state.future = [];
    updateUndoButtons();
    saveToStorage();
  }

  function undo() {
    if (!state.history.length) return;
    state.future.push(JSON.stringify({ labels: state.labels, activeLabelIndex: state.activeLabelIndex }));
    const prev = JSON.parse(state.history.pop());
    state.labels = prev.labels;
    state.activeLabelIndex = Math.min(prev.activeLabelIndex, state.labels.length - 1);
    state.selectedId = null;
    renderAll();
    updateUndoButtons();
    saveToStorage();
  }

  function redo() {
    if (!state.future.length) return;
    state.history.push(JSON.stringify({ labels: state.labels, activeLabelIndex: state.activeLabelIndex }));
    const next = JSON.parse(state.future.pop());
    state.labels = next.labels;
    state.activeLabelIndex = Math.min(next.activeLabelIndex, state.labels.length - 1);
    state.selectedId = null;
    renderAll();
    updateUndoButtons();
    saveToStorage();
  }

  function updateUndoButtons() {
    $('#btn-undo').disabled = state.history.length === 0;
    $('#btn-redo').disabled = state.future.length === 0;
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ labels: state.labels, activeLabelIndex: state.activeLabelIndex }));
    } catch (_) {}
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.labels) && parsed.labels.length) {
          state.labels = parsed.labels;
          state.activeLabelIndex = Math.min(parsed.activeLabelIndex || 0, state.labels.length - 1);
        }
      }
    } catch (_) {}
  }

  // --- Rendering ---
  function renderAll() {
    renderLeftDrawer();
    renderCanvas();
    renderStrip();
    renderInspector();
    updateUndoButtons();
  }

  function renderCanvas() {
    const lbl = activeLabel();
    const wPx = Math.round(lbl.w * PX_PER_MM);
    const hPx = Math.round(lbl.h * PX_PER_MM);
    const rPx = Math.round((lbl.radius || 0) * PX_PER_MM);

    elPaper.style.width = `${wPx}px`;
    elPaper.style.height = `${hPx}px`;
    elPaper.style.borderRadius = `${rPx}px`;
    elPaper.style.background = lbl.bg || '#ffffff';
    elPaper.style.transform = `scale(${state.zoom})`;
    elPaper.classList.toggle('thermal-preview', state.thermalPreview);

    elGrid.classList.toggle('visible', state.showGrid);
    const gridStep = Math.round(5 * PX_PER_MM); // 5mm grid
    elGrid.style.backgroundSize = `${gridStep}px ${gridStep}px`;

    elDimTag.textContent = `${lbl.w} × ${lbl.h} mm (${wPx} × ${hPx} px)`;
    elZoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;

    // Render elements
    elElements.innerHTML = '';
    lbl.elements.forEach((el) => {
      const node = buildElementDOM(el, false);
      elElements.appendChild(node);
    });

    renderSelectionOverlay();
  }

  function buildElementDOM(el, isPrint = false) {
    const div = document.createElement('div');
    div.className = 'canvas-el';
    if (el.locked && !isPrint) div.classList.add('locked');
    if (el.hidden && !isPrint) div.classList.add('hidden-el');
    if (el.hidden && isPrint) div.style.display = 'none';

    div.dataset.id = el.id;
    div.style.left = `${el.x}px`;
    div.style.top = `${el.y}px`;
    div.style.width = `${el.w}px`;
    div.style.height = `${el.h}px`;
    div.style.opacity = el.opacity ?? 1;
    div.style.transform = el.rotation ? `rotate(${el.rotation}deg)` : '';

    if (el.type === 'text') {
      div.appendChild(buildTextDOM(el, isPrint));
    } else if (el.type === 'icon') {
      div.innerHTML = getIconSVG(el);
    } else if (el.type === 'shape') {
      div.innerHTML = buildShapeSVG(el);
    } else if (el.type === 'barcode') {
      div.innerHTML = FreeLabelBarcode.generateCode128SVG(el.value, {
        fg: el.color || '#0f172a',
        showText: el.showText !== false
      });
    } else if (el.type === 'qr') {
      div.innerHTML = FreeLabelBarcode.generateQRSVG(el.value, {
        fg: el.color || '#0f172a'
      });
    }

    if (!isPrint) {
      div.addEventListener('pointerdown', (e) => onElementPointerDown(e, el));
      if (el.type === 'text') {
        div.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          if (!el.locked && !el.curved) startInlineTextEdit(el.id);
        });
      }
    }

    return div;
  }

  function buildTextDOM(el, isPrint) {
    const box = document.createElement('div');
    box.className = 'text-content-box';
    box.style.background = el.boxBg || 'transparent';
    box.style.borderRadius = `${el.boxRadius || 0}px`;
    if (el.boxBorderWidth > 0 && el.boxBorder && el.boxBorder !== 'transparent') {
      const style = el.boxDash || 'solid';
      box.style.border = `${el.boxBorderWidth}px ${style} ${el.boxBorder}`;
    }
    box.style.padding = `${el.padding ?? 4}px`;

    if (el.curved) {
      box.innerHTML = buildCurvedTextSVG(el);
      return box;
    }

    const inner = document.createElement('div');
    inner.className = 'text-inner';
    inner.textContent = el.text || '';
    inner.style.fontFamily = el.fontFamily || "'Noto Sans TC', sans-serif";
    inner.style.fontSize = `${el.fontSize || 14}px`;
    inner.style.fontWeight = el.fontWeight || '600';
    inner.style.fontStyle = el.italic ? 'italic' : 'normal';
    inner.style.textDecoration = el.underline ? 'underline' : 'none';
    inner.style.letterSpacing = el.letterSpacing ? `${el.letterSpacing}px` : '0px';
    inner.style.lineHeight = el.lineHeight || 1.25;
    inner.style.textAlign = el.textAlign || 'center';
    inner.style.color = el.color || '#0f172a';

    applyTextEffectStyles(inner, el);

    if (!isPrint && state.editingTextId === el.id) {
      inner.contentEditable = 'true';
      inner.addEventListener('blur', () => {
        state.editingTextId = null;
        if (inner.textContent !== el.text) {
          pushHistory();
          el.text = inner.textContent;
        }
        renderAll();
      });
      inner.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Escape') inner.blur();
      });
      requestAnimationFrame(() => {
        inner.focus();
        const range = document.createRange();
        range.selectNodeContents(inner);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });
    }

    box.appendChild(inner);
    return box;
  }

  function applyTextEffectStyles(node, el) {
    const eff = el.effect || 'none';
    const effCol = el.effectColor || '#2563eb';
    const col = el.color || '#0f172a';

    if (eff === 'outline') {
      node.style.webkitTextStroke = `${el.effectSize || 1.5}px ${effCol}`;
      node.style.paintOrder = 'stroke fill';
    } else if (eff === 'shadow') {
      node.style.textShadow = `2px 2px 4px ${effCol}`;
    } else if (eff === '3d') {
      node.style.textShadow = `1px 1px 0 ${effCol}, 2px 2px 0 ${effCol}, 3px 3px 0 ${effCol}`;
    } else if (eff === 'neon') {
      node.style.textShadow = `0 0 6px ${effCol}, 0 0 14px ${effCol}`;
    } else if (eff === 'gradient') {
      node.style.backgroundImage = `linear-gradient(135deg, ${col}, ${effCol})`;
      node.style.webkitBackgroundClip = 'text';
      node.style.backgroundClip = 'text';
      node.style.color = 'transparent';
    } else if (eff === 'highlight') {
      node.style.background = `linear-gradient(transparent 55%, ${effCol} 55%)`;
      node.style.display = 'inline';
    } else if (eff === 'stamp') {
      node.style.background = col;
      node.style.color = '#ffffff';
      node.style.padding = '2px 6px';
      node.style.borderRadius = '3px';
    }
  }

  function buildCurvedTextSVG(el) {
    const w = Math.max(40, el.w);
    const h = Math.max(30, el.h);
    const curve = el.curveAmount ?? 40;
    const pathId = 'curve_' + el.id + '_' + Math.random().toString(36).slice(2, 6);
    const midY = h / 2 + curve * 0.3;
    const ctrlY = h / 2 - curve;
    const d = `M 8,${midY} Q ${w / 2},${ctrlY} ${w - 8},${midY}`;
    const ff = (el.fontFamily || "'Noto Sans TC', sans-serif").replace(/"/g, "'");
    const safeText = escapeHtml(el.text || '');

    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" overflow="visible">
      <defs><path id="${pathId}" d="${d}" /></defs>
      <text fill="${el.color || '#0f172a'}" font-family="${ff}" font-size="${el.fontSize || 13}" font-weight="${el.fontWeight || '700'}" text-anchor="middle">
        <textPath href="#${pathId}" startOffset="50%">${safeText}</textPath>
      </text>
    </svg>`;
  }

  function getIconSVG(el) {
    let raw = el.customSvg;
    if (!raw) {
      const found = FreeLabelAssets.icons.find((i) => i.id === el.iconId);
      raw = found ? found.svg : FreeLabelAssets.icons[0].svg;
    }
    return `<div style="width:100%;height:100%;color:${el.color || '#0f172a'};display:flex;align-items:center;justify-content:center;">${raw.replace('<svg ', '<svg width="100%" height="100%" ')}</div>`;
  }

  function buildShapeSVG(el) {
    const w = Math.max(10, el.w);
    const h = Math.max(10, el.h);
    const sw = el.strokeWidth ?? 2;
    const pad = sw / 2 + 1;
    const fill = el.fill || 'transparent';
    const stroke = el.stroke || '#0f172a';
    const dash = el.dash ? `stroke-dasharray="${el.dash}"` : '';
    const t = el.shapeType;
    let body = '';

    if (t === 'rect') {
      const r = Math.min(el.radius || 0, Math.min(w, h) / 2);
      body = `<rect x="${pad}" y="${pad}" width="${w - pad * 2}" height="${h - pad * 2}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash}/>`;
    } else if (t === 'ellipse') {
      body = `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2 - pad}" ry="${h / 2 - pad}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash}/>`;
    } else if (t === 'triangle') {
      body = `<polygon points="${w / 2},${pad} ${w - pad},${h - pad} ${pad},${h - pad}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" ${dash}/>`;
    } else if (t === 'diamond') {
      body = `<polygon points="${w / 2},${pad} ${w - pad},${h / 2} ${w / 2},${h - pad} ${pad},${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" ${dash}/>`;
    } else if (t === 'hexagon') {
      const dx = (w - pad * 2) * 0.25;
      body = `<polygon points="${pad + dx},${pad} ${w - pad - dx},${pad} ${w - pad},${h / 2} ${w - pad - dx},${h - pad} ${pad + dx},${h - pad} ${pad},${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" ${dash}/>`;
    } else if (t === 'star') {
      body = `<polygon points="${starPoints(w / 2, h / 2, 5, Math.min(w, h) / 2 - pad, Math.min(w, h) / 4.5)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    } else if (t === 'burst') {
      body = `<polygon points="${starPoints(w / 2, h / 2, 14, Math.min(w, h) / 2 - pad, Math.min(w, h) / 2.6)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    } else if (t === 'ribbon') {
      const notch = Math.min(14, w * 0.14);
      body = `<polygon points="${pad},${pad} ${w - pad},${pad} ${w - pad - notch},${h / 2} ${w - pad},${h - pad} ${pad},${h - pad} ${pad + notch},${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    } else if (t === 'tag') {
      const tip = Math.min(18, w * 0.2);
      body = `<path d="M ${pad},${pad} L ${w - tip},${pad} L ${w - pad},${h / 2} L ${w - tip},${h - pad} L ${pad},${h - pad} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/><circle cx="${w - tip * 0.85}" cy="${h / 2}" r="3.5" fill="#ffffff" stroke="${stroke}" stroke-width="1.5"/>`;
    } else if (t === 'bubble') {
      const bh = h - 10;
      body = `<path d="M ${pad + 8},${pad} H ${w - pad - 8} Q ${w - pad},${pad} ${w - pad},${pad + 8} V ${bh - 8} Q ${w - pad},${bh} ${w - pad - 8},${bh} H ${w * 0.35} L ${w * 0.22},${h - pad} L ${w * 0.25},${bh} H ${pad + 8} Q ${pad},${bh} ${pad},${bh - 8} V ${pad + 8} Q ${pad},${pad} ${pad + 8},${pad} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    } else if (t === 'line') {
      body = `<line x1="0" y1="${h / 2}" x2="${w}" y2="${h / 2}" stroke="${stroke}" stroke-width="${sw}" ${dash}/>`;
    } else if (t === 'wave') {
      let d = `M 0,${h / 2}`;
      const step = 16;
      for (let x = 0; x < w; x += step) {
        d += ` Q ${x + step / 4},${h / 2 - 5} ${x + step / 2},${h / 2} T ${x + step},${h / 2}`;
      }
      body = `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>`;
    }

    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" overflow="visible">${body}</svg>`;
  }

  function starPoints(cx, cy, spikes, outerR, innerR) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    const pts = [];
    for (let i = 0; i < spikes; i++) {
      pts.push(`${(cx + Math.cos(rot) * outerR).toFixed(1)},${(cy + Math.sin(rot) * outerR).toFixed(1)}`);
      rot += step;
      pts.push(`${(cx + Math.cos(rot) * innerR).toFixed(1)},${(cy + Math.sin(rot) * innerR).toFixed(1)}`);
      rot += step;
    }
    return pts.join(' ');
  }

  function renderSelectionOverlay() {
    elSelection.innerHTML = '';
    const el = selectedElement();
    if (!el || state.editingTextId === el.id) return;

    const box = document.createElement('div');
    box.className = 'sel-box';
    box.style.left = `${el.x}px`;
    box.style.top = `${el.y}px`;
    box.style.width = `${el.w}px`;
    box.style.height = `${el.h}px`;
    if (el.rotation) box.style.transform = `rotate(${el.rotation}deg)`;

    if (!el.locked) {
      ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach((dir) => {
        const h = document.createElement('div');
        h.className = `sel-handle ${dir}`;
        h.addEventListener('pointerdown', (e) => onResizePointerDown(e, el, dir));
        box.appendChild(h);
      });

      const rot = document.createElement('div');
      rot.className = 'sel-rotate';
      rot.title = '拖曳旋轉';
      rot.addEventListener('pointerdown', (e) => onRotatePointerDown(e, el));
      box.appendChild(rot);
    }

    elSelection.appendChild(box);
  }

  // --- Drag, Resize, Rotate ---
  function onElementPointerDown(e, el) {
    if (state.editingTextId === el.id) return;
    e.stopPropagation();
    state.selectedId = el.id;
    renderSelectionOverlay();
    renderInspector();
    if (state.activeTab === 'layers') renderLeftDrawer();

    if (el.locked) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const origX = el.x;
    const origY = el.y;
    const lbl = activeLabel();
    const paperW = Math.round(lbl.w * PX_PER_MM);
    const paperH = Math.round(lbl.h * PX_PER_MM);
    let moved = false;

    const onMove = (ev) => {
      const dx = (ev.clientX - startX) / state.zoom;
      const dy = (ev.clientY - startY) / state.zoom;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
      let nx = Math.round(origX + dx);
      let ny = Math.round(origY + dy);

      // Snap to center guides
      elSnap.innerHTML = '';
      const centerX = paperW / 2;
      const centerY = paperH / 2;
      if (Math.abs(nx + el.w / 2 - centerX) < 5) {
        nx = Math.round(centerX - el.w / 2);
        elSnap.innerHTML += `<div class="snap-line-v" style="left:${centerX}px"></div>`;
      }
      if (Math.abs(ny + el.h / 2 - centerY) < 5) {
        ny = Math.round(centerY - el.h / 2);
        elSnap.innerHTML += `<div class="snap-line-h" style="top:${centerY}px"></div>`;
      }

      el.x = nx;
      el.y = ny;
      const domEl = elElements.querySelector(`[data-id="${el.id}"]`);
      if (domEl) {
        domEl.style.left = `${nx}px`;
        domEl.style.top = `${ny}px`;
      }
      renderSelectionOverlay();
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      elSnap.innerHTML = '';
      if (moved) {
        pushHistory();
        renderStrip();
        renderInspector();
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function onResizePointerDown(e, el, dir) {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const orig = { x: el.x, y: el.y, w: el.w, h: el.h };

    const onMove = (ev) => {
      const dx = (ev.clientX - startX) / state.zoom;
      const dy = (ev.clientY - startY) / state.zoom;
      let { x, y, w, h } = orig;

      if (dir.includes('e')) w = Math.max(14, Math.round(orig.w + dx));
      if (dir.includes('s')) h = Math.max(10, Math.round(orig.h + dy));
      if (dir.includes('w')) {
        const nw = Math.max(14, Math.round(orig.w - dx));
        x = Math.round(orig.x + (orig.w - nw));
        w = nw;
      }
      if (dir.includes('n')) {
        const nh = Math.max(10, Math.round(orig.h - dy));
        y = Math.round(orig.y + (orig.h - nh));
        h = nh;
      }

      el.x = x;
      el.y = y;
      el.w = w;
      el.h = h;
      renderCanvas();
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      pushHistory();
      renderStrip();
      renderInspector();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function onRotatePointerDown(e, el) {
    e.stopPropagation();
    const rect = elPaper.getBoundingClientRect();
    const cx = rect.left + (el.x + el.w / 2) * state.zoom;
    const cy = rect.top + (el.y + el.h / 2) * state.zoom;

    const onMove = (ev) => {
      const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI) + 90;
      el.rotation = Math.round(angle);
      renderCanvas();
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      pushHistory();
      renderStrip();
      renderInspector();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function startInlineTextEdit(id) {
    state.editingTextId = id;
    renderCanvas();
  }

  // --- Left Drawer (Templates, TextBoxes, Icons, Shapes, Codes, Layers) ---
  function renderLeftDrawer() {
    const tab = state.activeTab;
    document.querySelectorAll('.rail-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });

    if (tab === 'templates') {
      elLeftDrawer.innerHTML = `
        <div class="drawer-header"><h2 class="drawer-title">精選標籤範本</h2></div>
        ${FreeLabelAssets.templates
          .map(
            (t) => `
          <button class="template-card" data-tpl="${t.id}">
            <div class="template-preview">
              <span>${t.name}</span>
            </div>
            <div class="template-meta">
              <span class="template-name">${t.name}</span>
              <span class="template-size">${t.size}</span>
            </div>
          </button>`
          )
          .join('')}
      `;
      elLeftDrawer.querySelectorAll('[data-tpl]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tpl = FreeLabelAssets.templates.find((x) => x.id === btn.dataset.tpl);
          if (!tpl) return;
          pushHistory();
          const newLbl = createLabelFromTemplate(tpl);
          state.labels[state.activeLabelIndex] = newLbl;
          state.selectedLabelIds = new Set([newLbl.id]);
          state.selectedId = null;
          renderAll();
        });
      });
    } else if (tab === 'textboxes') {
      elLeftDrawer.innerHTML = `
        <div class="drawer-header"><h2 class="drawer-title">文字框與文字特效</h2></div>
        ${FreeLabelAssets.textBoxPresets
          .map(
            (p) => `
          <button class="textbox-preset-card" data-tb="${p.id}">
            <div>
              <div style="font-weight:700;font-size:12.5px;">${p.name}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${p.desc}</div>
            </div>
            <span style="font-size:16px;color:var(--accent);">+</span>
          </button>`
          )
          .join('')}
      `;
      elLeftDrawer.querySelectorAll('[data-tb]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const preset = FreeLabelAssets.textBoxPresets.find((x) => x.id === btn.dataset.tb);
          if (preset) addElement({ type: 'text', w: 140, h: 36, ...clone(preset.props) });
        });
      });
    } else if (tab === 'icons') {
      const q = state.iconQuery.trim().toLowerCase();
      const filtered = FreeLabelAssets.icons.filter((ic) => {
        const matchCat = state.iconCat === '全部' || ic.cat === state.iconCat;
        const matchQ = !q || ic.name.toLowerCase().includes(q) || ic.cat.toLowerCase().includes(q);
        return matchCat && matchQ;
      });

      elLeftDrawer.innerHTML = `
        <div class="drawer-header">
          <h2 class="drawer-title">SVG 向量圖示庫</h2>
          <button class="mini-btn primary" id="btn-open-svg-modal">+ 自訂 SVG</button>
        </div>
        <input class="search-input" id="icon-search" type="search" placeholder="搜尋圖示（例如：易碎、咖啡、愛心）" value="${escapeHtml(state.iconQuery)}" />
        <div class="chip-row">
          ${FreeLabelAssets.iconCategories
            .map((c) => `<button class="chip ${state.iconCat === c ? 'active' : ''}" data-icat="${c}">${c}</button>`)
            .join('')}
        </div>
        <div class="asset-grid-3">
          ${filtered
            .map(
              (ic) => `
            <button class="asset-card" data-icon="${ic.id}" title="${ic.name}">
              ${ic.svg}
              <span class="asset-card-label">${ic.name}</span>
            </button>`
            )
            .join('')}
        </div>
      `;

      $('#icon-search').addEventListener('input', (e) => {
        state.iconQuery = e.target.value;
        renderLeftDrawer();
        $('#icon-search').focus();
      });
      $('#btn-open-svg-modal').addEventListener('click', () => $('#svg-modal').showModal());
      elLeftDrawer.querySelectorAll('[data-icat]').forEach((c) => {
        c.addEventListener('click', () => {
          state.iconCat = c.dataset.icat;
          renderLeftDrawer();
        });
      });
      elLeftDrawer.querySelectorAll('[data-icon]').forEach((btn) => {
        btn.addEventListener('click', () => {
          addElement({ type: 'icon', iconId: btn.dataset.icon, w: 36, h: 36, color: '#0f172a' });
        });
      });
    } else if (tab === 'shapes') {
      elLeftDrawer.innerHTML = `
        <div class="drawer-header"><h2 class="drawer-title">圖形樣式與分隔線</h2></div>
        <div class="asset-grid-2">
          ${FreeLabelAssets.shapes
            .map(
              (s) => `
            <button class="asset-card" data-shape="${s.id}">
              <div style="width:44px;height:30px;">${buildShapeSVG({ ...s, w: 44, h: 30 })}</div>
              <span class="asset-card-label">${s.name}</span>
            </button>`
            )
            .join('')}
        </div>
      `;
      elLeftDrawer.querySelectorAll('[data-shape]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const s = FreeLabelAssets.shapes.find((x) => x.id === btn.dataset.shape);
          if (!s) return;
          const isLine = s.shapeType === 'line' || s.shapeType === 'wave';
          addElement({
            type: 'shape',
            shapeType: s.shapeType,
            fill: s.fill || 'transparent',
            stroke: s.stroke || '#0f172a',
            strokeWidth: s.strokeWidth ?? 2,
            radius: s.radius || 0,
            dash: s.dash || '',
            w: isLine ? 140 : 64,
            h: isLine ? 16 : 48
          });
        });
      });
    } else if (tab === 'codes') {
      elLeftDrawer.innerHTML = `
        <div class="drawer-header"><h2 class="drawer-title">條碼與 QR Code</h2></div>
        <button class="textbox-preset-card" id="btn-add-barcode">
          <div>
            <div style="font-weight:700;">一維條碼 (Code 128)</div>
            <div style="font-size:11px;color:var(--text-muted);">支援英數字與序號追蹤</div>
          </div>
          <span>+</span>
        </button>
        <button class="textbox-preset-card" id="btn-add-qr">
          <div>
            <div style="font-weight:700;">二維條碼 (QR Code)</div>
            <div style="font-size:11px;color:var(--text-muted);">支援網址、商品資訊掃描</div>
          </div>
          <span>+</span>
        </button>
      `;
      $('#btn-add-barcode').addEventListener('click', () => {
        addElement({ type: 'barcode', value: 'FL-2026-001', w: 150, h: 48, color: '#0f172a', showText: true });
      });
      $('#btn-add-qr').addEventListener('click', () => {
        addElement({ type: 'qr', value: 'https://freelabel.app', w: 64, h: 64, color: '#0f172a' });
      });
    } else if (tab === 'layers') {
      const lbl = activeLabel();
      const reversed = [...lbl.elements].reverse();
      elLeftDrawer.innerHTML = `
        <div class="drawer-header"><h2 class="drawer-title">圖層順序 (${lbl.elements.length})</h2></div>
        <div class="layer-list">
          ${reversed
            .map(
              (el) => `
            <div class="layer-item ${state.selectedId === el.id ? 'selected' : ''}" data-layer="${el.id}">
              <span class="layer-name">${getElementDisplayName(el)}</span>
              <div class="layer-actions">
                <button data-act="up" title="上移">↑</button>
                <button data-act="down" title="下移">↓</button>
                <button data-act="lock" title="鎖定">${el.locked ? '🔒' : '🔓'}</button>
                <button data-act="hide" title="顯示/隱藏">${el.hidden ? '🙈' : '👁'}</button>
              </div>
            </div>`
            )
            .join('')}
        </div>
      `;
      elLeftDrawer.querySelectorAll('.layer-item').forEach((row) => {
        const id = row.dataset.layer;
        row.addEventListener('click', (e) => {
          if (e.target.closest('button')) return;
          state.selectedId = id;
          renderCanvas();
          renderInspector();
          renderLeftDrawer();
        });
        row.querySelectorAll('button').forEach((b) => {
          b.addEventListener('click', () => handleLayerAction(id, b.dataset.act));
        });
      });
    }
  }

  function getElementDisplayName(el) {
    if (el.type === 'text') return `T ${el.text.slice(0, 14)}`;
    if (el.type === 'icon') return `★ 圖示 (${el.iconId || '自訂'})`;
    if (el.type === 'shape') return `◆ 圖形 (${el.shapeType})`;
    if (el.type === 'barcode') return `||| 條碼 (${el.value})`;
    if (el.type === 'qr') return `⊞ QR (${el.value})`;
    return el.type;
  }

  function handleLayerAction(id, act) {
    const lbl = activeLabel();
    const idx = lbl.elements.findIndex((e) => e.id === id);
    if (idx < 0) return;
    pushHistory();
    const el = lbl.elements[idx];
    if (act === 'up' && idx < lbl.elements.length - 1) {
      [lbl.elements[idx], lbl.elements[idx + 1]] = [lbl.elements[idx + 1], lbl.elements[idx]];
    } else if (act === 'down' && idx > 0) {
      [lbl.elements[idx], lbl.elements[idx - 1]] = [lbl.elements[idx - 1], lbl.elements[idx]];
    } else if (act === 'lock') {
      el.locked = !el.locked;
    } else if (act === 'hide') {
      el.hidden = !el.hidden;
    }
    renderAll();
  }

  function addElement(props) {
    const lbl = activeLabel();
    const wPx = Math.round(lbl.w * PX_PER_MM);
    const hPx = Math.round(lbl.h * PX_PER_MM);
    const w = props.w || 60;
    const h = props.h || 40;
    const newEl = {
      id: uid(),
      x: Math.max(4, Math.round((wPx - w) / 2)),
      y: Math.max(4, Math.round((hPx - h) / 2)),
      w,
      h,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      ...props
    };
    pushHistory();
    lbl.elements.push(newEl);
    state.selectedId = newEl.id;
    renderAll();
  }

  // --- Right Inspector ---
  function renderInspector() {
    const el = selectedElement();
    if (!el) {
      renderLabelSettingsInspector();
      return;
    }

    let html = `
      <div class="inspector-section">
        <h3 class="section-title">位置與尺寸 (px / °)</h3>
        <div class="prop-row-3">
          <div class="prop-field"><label>X</label><input type="number" id="prop-x" value="${Math.round(el.x)}" /></div>
          <div class="prop-field"><label>Y</label><input type="number" id="prop-y" value="${Math.round(el.y)}" /></div>
          <div class="prop-field"><label>旋轉°</label><input type="number" id="prop-rot" value="${Math.round(el.rotation || 0)}" /></div>
        </div>
        <div class="prop-row-3">
          <div class="prop-field"><label>寬度</label><input type="number" id="prop-w" value="${Math.round(el.w)}" min="10" /></div>
          <div class="prop-field"><label>高度</label><input type="number" id="prop-h" value="${Math.round(el.h)}" min="8" /></div>
          <div class="prop-field"><label>透明度</label><input type="number" id="prop-op" value="${el.opacity ?? 1}" min="0.1" max="1" step="0.1" /></div>
        </div>
      </div>
    `;

    if (el.type === 'text') {
      html += `
        <div class="inspector-section">
          <h3 class="section-title">文字內容與字體</h3>
          <div class="prop-field">
            <textarea id="prop-text" rows="2">${escapeHtml(el.text || '')}</textarea>
          </div>
          <div class="prop-field">
            <label>字型 (支援中英文)</label>
            <select id="prop-font">
              ${window.FreeLabelFonts.map(
                (f) => `<option value="${escapeHtml(f.family)}" ${el.fontFamily === f.family ? 'selected' : ''}>${f.name}</option>`
              ).join('')}
            </select>
          </div>
          <div class="prop-row-3">
            <div class="prop-field"><label>大小</label><input type="number" id="prop-fsize" value="${el.fontSize || 14}" min="6" max="120" /></div>
            <div class="prop-field">
              <label>粗細</label>
              <select id="prop-fweight">
                <option value="400" ${el.fontWeight === '400' ? 'selected' : ''}>細體</option>
                <option value="600" ${el.fontWeight === '600' ? 'selected' : ''}>中粗</option>
                <option value="700" ${el.fontWeight === '700' ? 'selected' : ''}>粗體</option>
                <option value="900" ${el.fontWeight === '900' ? 'selected' : ''}>特粗</option>
              </select>
            </div>
            <div class="prop-field"><label>字距</label><input type="number" id="prop-lspace" value="${el.letterSpacing || 0}" min="-2" max="20" /></div>
          </div>
          <div class="prop-row">
            <div class="prop-field">
              <label>對齊</label>
              <div class="seg-group">
                <button class="seg-btn ${el.textAlign === 'left' ? 'active' : ''}" data-align="left">左</button>
                <button class="seg-btn ${(!el.textAlign || el.textAlign === 'center') ? 'active' : ''}" data-align="center">中</button>
                <button class="seg-btn ${el.textAlign === 'right' ? 'active' : ''}" data-align="right">右</button>
              </div>
            </div>
            <div class="prop-field">
              <label>文字顏色</label>
              <div class="color-row">
                <input type="color" id="prop-color" value="${el.color || '#0f172a'}" />
                <input type="text" id="prop-color-hex" value="${el.color || '#0f172a'}" />
              </div>
            </div>
          </div>
          <div class="prop-row">
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;">
              <input type="checkbox" id="prop-curved" ${el.curved ? 'checked' : ''} /> 弧形文字路徑
            </label>
            ${
              el.curved
                ? `<div class="prop-field"><label>彎曲度</label><input type="range" id="prop-curve-amt" min="-90" max="90" value="${el.curveAmount ?? 40}" /></div>`
                : ''
            }
          </div>
        </div>

        <div class="inspector-section">
          <h3 class="section-title">文字特效</h3>
          <div class="effect-chips">
            ${FreeLabelAssets.textEffects
              .map(
                (ef) => `<button class="effect-chip ${(el.effect || 'none') === ef.id ? 'active' : ''}" data-eff="${ef.id}">${ef.name}</button>`
              )
              .join('')}
          </div>
          ${
            el.effect && el.effect !== 'none' && el.effect !== 'stamp'
              ? `<div class="prop-row">
                  <div class="prop-field">
                    <label>特效輔助色</label>
                    <div class="color-row">
                      <input type="color" id="prop-eff-color" value="${el.effectColor || '#2563eb'}" />
                      <input type="text" id="prop-eff-hex" value="${el.effectColor || '#2563eb'}" />
                    </div>
                  </div>
                </div>`
              : ''
          }
        </div>

        <div class="inspector-section">
          <h3 class="section-title">文字框樣式</h3>
          <div class="prop-row">
            <div class="prop-field">
              <label>框底色</label>
              <div class="color-row">
                <input type="color" id="prop-boxbg" value="${el.boxBg && el.boxBg !== 'transparent' ? el.boxBg : '#ffffff'}" />
                <button class="mini-btn" id="btn-clear-boxbg">透明</button>
              </div>
            </div>
            <div class="prop-field">
              <label>框線色</label>
              <div class="color-row">
                <input type="color" id="prop-boxbd" value="${el.boxBorder && el.boxBorder !== 'transparent' ? el.boxBorder : '#0f172a'}" />
              </div>
            </div>
          </div>
          <div class="prop-row-3">
            <div class="prop-field"><label>框線粗</label><input type="number" id="prop-boxbw" value="${el.boxBorderWidth || 0}" min="0" max="10" /></div>
            <div class="prop-field"><label>圓角</label><input type="number" id="prop-boxrad" value="${el.boxRadius || 0}" min="0" max="999" /></div>
            <div class="prop-field">
              <label>線型</label>
              <select id="prop-boxdash">
                <option value="solid" ${el.boxDash === 'solid' ? 'selected' : ''}>實線</option>
                <option value="dashed" ${el.boxDash === 'dashed' ? 'selected' : ''}>虛線</option>
                <option value="dotted" ${el.boxDash === 'dotted' ? 'selected' : ''}>點線</option>
                <option value="double" ${el.boxDash === 'double' ? 'selected' : ''}>雙線</option>
              </select>
            </div>
          </div>
        </div>
      `;
    } else if (el.type === 'shape') {
      html += `
        <div class="inspector-section">
          <h3 class="section-title">圖形樣式</h3>
          <div class="prop-row">
            <div class="prop-field">
              <label>填滿色</label>
              <div class="color-row">
                <input type="color" id="prop-sfill" value="${el.fill && el.fill !== 'transparent' ? el.fill : '#e2e8f0'}" />
                <button class="mini-btn" id="btn-clear-sfill">無填滿</button>
              </div>
            </div>
            <div class="prop-field">
              <label>邊框色</label>
              <div class="color-row">
                <input type="color" id="prop-sstroke" value="${el.stroke && el.stroke !== 'transparent' ? el.stroke : '#0f172a'}" />
              </div>
            </div>
          </div>
          <div class="prop-row-3">
            <div class="prop-field"><label>線寬</label><input type="number" id="prop-ssw" value="${el.strokeWidth ?? 2}" min="0" max="16" /></div>
            <div class="prop-field"><label>圓角</label><input type="number" id="prop-srad" value="${el.radius || 0}" min="0" max="200" /></div>
            <div class="prop-field">
              <label>虛線</label>
              <select id="prop-sdash">
                <option value="" ${!el.dash ? 'selected' : ''}>實線</option>
                <option value="6 4" ${el.dash === '6 4' ? 'selected' : ''}>虛線</option>
                <option value="2 3" ${el.dash === '2 3' ? 'selected' : ''}>點線</option>
              </select>
            </div>
          </div>
        </div>
      `;
    } else if (el.type === 'icon') {
      html += `
        <div class="inspector-section">
          <h3 class="section-title">SVG 圖示顏色</h3>
          <div class="prop-field">
            <label>圖示色彩</label>
            <div class="color-row">
              <input type="color" id="prop-color" value="${el.color || '#0f172a'}" />
              <input type="text" id="prop-color-hex" value="${el.color || '#0f172a'}" />
            </div>
          </div>
        </div>
      `;
    } else if (el.type === 'barcode' || el.type === 'qr') {
      html += `
        <div class="inspector-section">
          <h3 class="section-title">${el.type === 'qr' ? 'QR Code 設定' : '一維條碼設定'}</h3>
          <div class="prop-field">
            <label>條碼內容</label>
            <input type="text" id="prop-code-val" value="${escapeHtml(el.value || '')}" />
          </div>
          <div class="prop-field">
            <label>條碼顏色</label>
            <div class="color-row">
              <input type="color" id="prop-color" value="${el.color || '#0f172a'}" />
              <input type="text" id="prop-color-hex" value="${el.color || '#0f172a'}" />
            </div>
          </div>
        </div>
      `;
    }

    html += `
      <div class="inspector-section">
        <div class="prop-row">
          <button class="pill-btn" id="btn-dup-el">複製元件</button>
          <button class="danger-btn" id="btn-del-el">刪除元件</button>
        </div>
      </div>
    `;

    elRightPanel.innerHTML = html;
    bindElementInspectorEvents(el);
  }

  function renderLabelSettingsInspector() {
    const lbl = activeLabel();
    elRightPanel.innerHTML = `
      <div class="inspector-section">
        <h3 class="section-title">標籤紙張規格 (連續列印)</h3>
        <div class="prop-field">
          <label>常用紙捲尺寸</label>
          <select id="lbl-preset">
            <option value="">自訂尺寸...</option>
            ${FreeLabelAssets.sizePresets
              .map(
                (p) => `<option value="${p.id}" ${p.w === lbl.w && p.h === lbl.h && p.radius === lbl.radius ? 'selected' : ''}>${p.name}</option>`
              )
              .join('')}
          </select>
        </div>
        <div class="prop-row-3">
          <div class="prop-field"><label>寬 (mm)</label><input type="number" id="lbl-w" value="${lbl.w}" min="10" max="210" /></div>
          <div class="prop-field"><label>高 (mm)</label><input type="number" id="lbl-h" value="${lbl.h}" min="10" max="297" /></div>
          <div class="prop-field"><label>圓角 (mm)</label><input type="number" id="lbl-rad" value="${lbl.radius || 0}" min="0" max="50" /></div>
        </div>
        <div class="prop-row">
          <div class="prop-field"><label>列印偏移 X (mm)</label><input type="number" id="lbl-ox" value="${lbl.offsetX ?? 0}" min="-10" max="10" step="0.5" /></div>
          <div class="prop-field"><label>列印偏移 Y (mm)</label><input type="number" id="lbl-oy" value="${lbl.offsetY ?? 0}" min="-10" max="10" step="0.5" /></div>
        </div>
        <div class="prop-field">
          <label>紙張底色</label>
          <div class="color-row">
            <input type="color" id="lbl-bg" value="${lbl.bg || '#ffffff'}" />
            <input type="text" id="lbl-bg-hex" value="${lbl.bg || '#ffffff'}" />
          </div>
        </div>
      </div>
      <div class="inspector-section">
        <h3 class="section-title">快速操作提示</h3>
        <p style="margin:0;font-size:12px;color:var(--text-muted);line-height:1.55;">
          • 點擊畫布上的元件即可調整字型、特效與外框。<br/>
          • 雙擊文字框可直接進行內文編輯。<br/>
          • 下方「連續標籤紙捲佇列」可新增多張不同內容的標籤，一鍵連續列印！
        </p>
      </div>
    `;

    $('#lbl-preset').addEventListener('change', (e) => {
      const p = FreeLabelAssets.sizePresets.find((x) => x.id === e.target.value);
      if (!p) return;
      pushHistory();
      lbl.w = p.w;
      lbl.h = p.h;
      lbl.radius = p.radius;
      renderAll();
      fitZoomToViewport();
    });

    const bindNum = (id, key) => {
      $(id).addEventListener('change', (e) => {
        pushHistory();
        lbl[key] = Math.max(0, Number(e.target.value) || 0);
        renderAll();
      });
    };
    bindNum('#lbl-w', 'w');
    bindNum('#lbl-h', 'h');
    bindNum('#lbl-rad', 'radius');

    const bindSigned = (id, key) => {
      $(id).addEventListener('change', (e) => {
        pushHistory();
        lbl[key] = Number(e.target.value) || 0;
        saveToStorage();
      });
    };
    bindSigned('#lbl-ox', 'offsetX');
    bindSigned('#lbl-oy', 'offsetY');

    $('#lbl-bg').addEventListener('input', (e) => {
      lbl.bg = e.target.value;
      $('#lbl-bg-hex').value = e.target.value;
      renderCanvas();
      renderStrip();
    });
    $('#lbl-bg').addEventListener('change', () => pushHistory());
  }

  function bindElementInspectorEvents(el) {
    const bindNum = (id, key, min = -9999) => {
      const node = $(id);
      if (!node) return;
      node.addEventListener('input', (e) => {
        el[key] = Math.max(min, Number(e.target.value) || 0);
        renderCanvas();
      });
      node.addEventListener('change', () => {
        pushHistory();
        renderStrip();
      });
    };

    bindNum('#prop-x', 'x');
    bindNum('#prop-y', 'y');
    bindNum('#prop-rot', 'rotation');
    bindNum('#prop-w', 'w', 10);
    bindNum('#prop-h', 'h', 8);

    const op = $('#prop-op');
    if (op) {
      op.addEventListener('input', (e) => {
        el.opacity = Number(e.target.value);
        renderCanvas();
      });
    }

    if (el.type === 'text') {
      $('#prop-text').addEventListener('input', (e) => {
        el.text = e.target.value;
        renderCanvas();
      });
      $('#prop-text').addEventListener('change', () => {
        pushHistory();
        renderStrip();
      });
      $('#prop-font').addEventListener('change', (e) => {
        pushHistory();
        el.fontFamily = e.target.value;
        renderAll();
      });
      bindNum('#prop-fsize', 'fontSize', 6);
      $('#prop-fweight').addEventListener('change', (e) => {
        pushHistory();
        el.fontWeight = e.target.value;
        renderAll();
      });
      bindNum('#prop-lspace', 'letterSpacing', -4);

      elRightPanel.querySelectorAll('[data-align]').forEach((b) => {
        b.addEventListener('click', () => {
          pushHistory();
          el.textAlign = b.dataset.align;
          renderAll();
        });
      });

      $('#prop-curved').addEventListener('change', (e) => {
        pushHistory();
        el.curved = e.target.checked;
        if (el.curved && el.curveAmount === undefined) el.curveAmount = 40;
        renderAll();
      });
      const curveAmt = $('#prop-curve-amt');
      if (curveAmt) {
        curveAmt.addEventListener('input', (e) => {
          el.curveAmount = Number(e.target.value);
          renderCanvas();
        });
      }

      elRightPanel.querySelectorAll('[data-eff]').forEach((b) => {
        b.addEventListener('click', () => {
          pushHistory();
          el.effect = b.dataset.eff;
          renderAll();
        });
      });

      const effCol = $('#prop-eff-color');
      if (effCol) {
        effCol.addEventListener('input', (e) => {
          el.effectColor = e.target.value;
          $('#prop-eff-hex').value = e.target.value;
          renderCanvas();
        });
      }

      $('#prop-boxbg').addEventListener('input', (e) => {
        el.boxBg = e.target.value;
        renderCanvas();
      });
      $('#btn-clear-boxbg').addEventListener('click', () => {
        pushHistory();
        el.boxBg = 'transparent';
        renderAll();
      });
      $('#prop-boxbd').addEventListener('input', (e) => {
        el.boxBorder = e.target.value;
        if (!el.boxBorderWidth) el.boxBorderWidth = 2;
        renderCanvas();
      });
      bindNum('#prop-boxbw', 'boxBorderWidth', 0);
      bindNum('#prop-boxrad', 'boxRadius', 0);
      $('#prop-boxdash').addEventListener('change', (e) => {
        pushHistory();
        el.boxDash = e.target.value;
        renderAll();
      });
    }

    if (el.type === 'shape') {
      $('#prop-sfill').addEventListener('input', (e) => {
        el.fill = e.target.value;
        renderCanvas();
      });
      $('#btn-clear-sfill').addEventListener('click', () => {
        pushHistory();
        el.fill = 'transparent';
        renderAll();
      });
      $('#prop-sstroke').addEventListener('input', (e) => {
        el.stroke = e.target.value;
        renderCanvas();
      });
      bindNum('#prop-ssw', 'strokeWidth', 0);
      bindNum('#prop-srad', 'radius', 0);
      $('#prop-sdash').addEventListener('change', (e) => {
        pushHistory();
        el.dash = e.target.value;
        renderAll();
      });
    }

    const colInput = $('#prop-color');
    if (colInput) {
      colInput.addEventListener('input', (e) => {
        el.color = e.target.value;
        if ($('#prop-color-hex')) $('#prop-color-hex').value = e.target.value;
        renderCanvas();
      });
      colInput.addEventListener('change', () => {
        pushHistory();
        renderStrip();
      });
    }

    const codeInput = $('#prop-code-val');
    if (codeInput) {
      codeInput.addEventListener('input', (e) => {
        el.value = e.target.value;
        renderCanvas();
      });
      codeInput.addEventListener('change', () => {
        pushHistory();
        renderStrip();
      });
    }

    $('#btn-dup-el').addEventListener('click', () => duplicateSelectedElement());
    $('#btn-del-el').addEventListener('click', () => deleteSelectedElement());
  }

  function duplicateSelectedElement() {
    const el = selectedElement();
    if (!el) return;
    pushHistory();
    const copy = clone(el);
    copy.id = uid();
    copy.x += 12;
    copy.y += 12;
    activeLabel().elements.push(copy);
    state.selectedId = copy.id;
    renderAll();
  }

  function deleteSelectedElement() {
    const lbl = activeLabel();
    const idx = lbl.elements.findIndex((e) => e.id === state.selectedId);
    if (idx < 0) return;
    pushHistory();
    lbl.elements.splice(idx, 1);
    state.selectedId = null;
    renderAll();
  }

  // --- Continuous Strip Queue ---
  function getLabelsToPrint() {
    const picked = state.labels.filter((l) => state.selectedLabelIds.has(l.id));
    return picked.length ? picked : [activeLabel()];
  }

  function renderStrip() {
    const toPrint = getLabelsToPrint();
    elStripMeta.textContent = `共 ${state.labels.length} 張，已選 ${toPrint.length} 張列印`;
    elPrintBadge.textContent = toPrint.length;
    elStripTrack.innerHTML = '';

    const selectAllBtn = $('#btn-select-all-labels');
    if (selectAllBtn) {
      const allSelected = state.labels.length > 0 && state.labels.every((l) => state.selectedLabelIds.has(l.id));
      selectAllBtn.textContent = allSelected ? '僅印目前' : '全選';
    }

    state.labels.forEach((lbl, idx) => {
      if (idx > 0) {
        const conn = document.createElement('div');
        conn.className = 'strip-connector';
        elStripTrack.appendChild(conn);
      }

      const isChecked = state.selectedLabelIds.has(lbl.id);
      const item = document.createElement('div');
      item.className = `strip-item ${idx === state.activeLabelIndex ? 'active' : ''} ${isChecked ? 'for-print' : ''}`;

      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.className = 'strip-check';
      chk.checked = isChecked;
      chk.title = '勾選列印此張';
      chk.addEventListener('click', (e) => {
        e.stopPropagation();
        if (chk.checked) {
          state.selectedLabelIds.add(lbl.id);
        } else {
          state.selectedLabelIds.delete(lbl.id);
        }
        renderStrip();
      });

      const thumb = document.createElement('div');
      thumb.className = 'strip-thumb';
      thumb.style.background = lbl.bg || '#ffffff';

      const wPx = lbl.w * PX_PER_MM;
      const hPx = lbl.h * PX_PER_MM;
      const scale = Math.min(98 / wPx, 58 / hPx);

      const mini = document.createElement('div');
      mini.style.width = `${wPx}px`;
      mini.style.height = `${hPx}px`;
      mini.style.position = 'relative';
      mini.style.transform = `scale(${scale})`;
      mini.style.transformOrigin = 'center center';
      mini.style.flexShrink = '0';
      mini.style.pointerEvents = 'none';

      lbl.elements.forEach((el) => mini.appendChild(buildElementDOM(el, true)));
      thumb.appendChild(mini);

      const labelTag = document.createElement('span');
      labelTag.className = 'strip-item-label';
      labelTag.textContent = `#${idx + 1} (${lbl.w}×${lbl.h})`;

      item.appendChild(chk);
      item.appendChild(thumb);
      item.appendChild(labelTag);

      if (state.labels.length > 1) {
        const del = document.createElement('button');
        del.className = 'strip-del-btn';
        del.textContent = '✕';
        del.title = '移除此標籤';
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          pushHistory();
          state.selectedLabelIds.delete(lbl.id);
          state.labels.splice(idx, 1);
          state.activeLabelIndex = Math.min(state.activeLabelIndex, state.labels.length - 1);
          if (!state.selectedLabelIds.size) state.selectedLabelIds.add(activeLabel().id);
          state.selectedId = null;
          renderAll();
        });
        item.appendChild(del);
      }

      item.addEventListener('click', () => {
        state.activeLabelIndex = idx;
        state.selectedLabelIds = new Set([lbl.id]);
        state.selectedId = null;
        renderAll();
      });

      elStripTrack.appendChild(item);
    });
  }

  // --- Print Engine ---
  function printLabels() {
    const sheet = $('#print-sheet');
    sheet.innerHTML = '';
    const list = getLabelsToPrint();
    const first = list[0];

    let styleTag = document.getElementById('dynamic-page-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-page-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `@media print { @page { size: ${first.w}mm ${first.h}mm; margin: 0; } }`;

    list.forEach((lbl) => {
      const page = document.createElement('div');
      page.className = 'print-label-page' + (state.thermalPreview ? ' bw-mode' : '');
      page.style.width = `${lbl.w}mm`;
      page.style.height = `${lbl.h}mm`;
      page.style.borderRadius = `${lbl.radius || 0}mm`;
      page.style.background = lbl.bg || '#ffffff';

      const ox = lbl.offsetX ?? 0;
      const oy = lbl.offsetY ?? 0;
      const inner = document.createElement('div');
      inner.className = 'print-label-inner';
      inner.style.width = `${lbl.w}mm`;
      inner.style.height = `${lbl.h}mm`;
      if (ox !== 0 || oy !== 0) {
        inner.style.transform = `translate(${ox}mm, ${oy}mm)`;
      }

      lbl.elements.forEach((el) => inner.appendChild(buildElementDOM(el, true)));
      page.appendChild(inner);
      sheet.appendChild(page);
    });

    window.print();
  }

  // --- Export PNG / SVG / JSON ---
  function exportCurrentSVG() {
    const lbl = activeLabel();
    const wPx = Math.round(lbl.w * PX_PER_MM);
    const hPx = Math.round(lbl.h * PX_PER_MM);

    const wrapper = document.createElement('div');
    wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    wrapper.style.width = `${wPx}px`;
    wrapper.style.height = `${hPx}px`;
    wrapper.style.position = 'relative';
    wrapper.style.background = lbl.bg || '#ffffff';
    wrapper.style.borderRadius = `${Math.round((lbl.radius || 0) * PX_PER_MM)}px`;
    wrapper.style.overflow = 'hidden';
    lbl.elements.forEach((el) => wrapper.appendChild(buildElementDOM(el, true)));

    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${wPx}" height="${hPx}" viewBox="0 0 ${wPx} ${hPx}">
      <foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(wrapper)}</foreignObject>
    </svg>`;
    downloadBlob(new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' }), `label-${lbl.w}x${lbl.h}.svg`);
  }

  function exportCurrentPNG() {
    const lbl = activeLabel();
    const wPx = Math.round(lbl.w * PX_PER_MM);
    const hPx = Math.round(lbl.h * PX_PER_MM);
    const scale = 3;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    wrapper.style.width = `${wPx}px`;
    wrapper.style.height = `${hPx}px`;
    wrapper.style.position = 'relative';
    wrapper.style.background = lbl.bg || '#ffffff';
    wrapper.style.overflow = 'hidden';
    lbl.elements.forEach((el) => wrapper.appendChild(buildElementDOM(el, true)));

    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${wPx * scale}" height="${hPx * scale}" viewBox="0 0 ${wPx} ${hPx}">
      <foreignObject width="${wPx}" height="${hPx}">${new XMLSerializer().serializeToString(wrapper)}</foreignObject>
    </svg>`;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = wPx * scale;
      canvas.height = hPx * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, `label-${lbl.w}x${lbl.h}.png`);
      }, 'image/png');
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Zoom & Global Events ---
  function fitZoomToViewport() {
    const vp = $('#canvas-viewport');
    const lbl = activeLabel();
    const wPx = lbl.w * PX_PER_MM;
    const hPx = lbl.h * PX_PER_MM;
    const maxW = vp.clientWidth - 96;
    const maxH = vp.clientHeight - 96;
    const z = Math.min(2.6, Math.max(0.6, Math.min(maxW / wPx, maxH / hPx)));
    state.zoom = Math.round(z * 20) / 20;
    renderCanvas();
  }

  function bindGlobalEvents() {
    // Left rail tabs
    document.querySelectorAll('.rail-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeTab = btn.dataset.tab;
        renderLeftDrawer();
      });
    });

    // Deselect on background click
    $('#canvas-viewport').addEventListener('pointerdown', (e) => {
      if (e.target === $('#canvas-viewport') || e.target === elPaper || e.target === elElements) {
        state.selectedId = null;
        renderSelectionOverlay();
        renderInspector();
      }
    });

    // Topbar actions
    $('#btn-undo').addEventListener('click', undo);
    $('#btn-redo').addEventListener('click', redo);
    $('#btn-toggle-grid').addEventListener('click', (e) => {
      state.showGrid = !state.showGrid;
      e.currentTarget.classList.toggle('active', state.showGrid);
      renderCanvas();
    });
    $('#btn-toggle-grid').classList.add('active');

    $('#btn-toggle-thermal').addEventListener('click', (e) => {
      state.thermalPreview = !state.thermalPreview;
      e.currentTarget.classList.toggle('active', state.thermalPreview);
      renderCanvas();
    });

    $('#btn-zoom-in').addEventListener('click', () => {
      state.zoom = Math.min(4, Math.round((state.zoom + 0.15) * 20) / 20);
      renderCanvas();
    });
    $('#btn-zoom-out').addEventListener('click', () => {
      state.zoom = Math.max(0.4, Math.round((state.zoom - 0.15) * 20) / 20);
      renderCanvas();
    });
    $('#btn-zoom-fit').addEventListener('click', fitZoomToViewport);

    // Export dropdown
    const exportMenu = $('#export-menu');
    $('#btn-export-menu').addEventListener('click', (e) => {
      e.stopPropagation();
      exportMenu.classList.toggle('open');
    });
    window.addEventListener('click', () => exportMenu.classList.remove('open'));

    $('#btn-export-svg').addEventListener('click', exportCurrentSVG);
    $('#btn-export-png').addEventListener('click', exportCurrentPNG);
    $('#btn-export-json').addEventListener('click', () => {
      downloadBlob(
        new Blob([JSON.stringify({ labels: state.labels }, null, 2)], { type: 'application/json' }),
        'freelabel-project.json'
      );
    });
    $('#input-import-json').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      file.text().then((txt) => {
        const data = JSON.parse(txt);
        if (Array.isArray(data.labels) && data.labels.length) {
          pushHistory();
          state.labels = data.labels;
          state.activeLabelIndex = 0;
          state.selectedId = null;
          renderAll();
        }
      });
    });

    // Print
    $('#btn-print').addEventListener('click', printLabels);

    // Strip actions
    $('#btn-select-all-labels').addEventListener('click', () => {
      const allSelected = state.labels.every((l) => state.selectedLabelIds.has(l.id));
      state.selectedLabelIds = allSelected
        ? new Set([activeLabel().id])
        : new Set(state.labels.map((l) => l.id));
      renderStrip();
    });
    $('#btn-add-label').addEventListener('click', () => {
      pushHistory();
      const cur = activeLabel();
      const newLbl = createBlankLabel(cur.w, cur.h, cur.radius);
      state.labels.push(newLbl);
      state.activeLabelIndex = state.labels.length - 1;
      state.selectedLabelIds = new Set([newLbl.id]);
      state.selectedId = null;
      renderAll();
    });
    $('#btn-dup-label').addEventListener('click', () => {
      pushHistory();
      const copy = clone(activeLabel());
      copy.id = uid();
      copy.elements.forEach((el) => (el.id = uid()));
      state.labels.splice(state.activeLabelIndex + 1, 0, copy);
      state.activeLabelIndex += 1;
      state.selectedLabelIds = new Set([copy.id]);
      renderAll();
    });

    // Batch Sequence Modal
    const batchModal = $('#batch-modal');
    $('#btn-batch-modal').addEventListener('click', () => batchModal.showModal());
    $('#btn-close-batch').addEventListener('click', () => batchModal.close());
    $('#btn-cancel-batch').addEventListener('click', () => batchModal.close());
    $('#batch-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const start = parseInt($('#batch-start').value, 10) || 1;
      const count = Math.min(100, Math.max(1, parseInt($('#batch-count').value, 10) || 5));
      const pad = Math.min(8, Math.max(1, parseInt($('#batch-pad').value, 10) || 3));
      const pattern = $('#batch-pattern').value || 'NO.{n}';

      pushHistory();
      const base = activeLabel();
      for (let i = 0; i < count; i++) {
        const numStr = String(start + i).padStart(pad, '0');
        const copy = clone(base);
        copy.id = uid();
        let replaced = false;
        copy.elements.forEach((el) => {
          el.id = uid();
          if (el.type === 'text' && el.text.includes('{n}')) {
            el.text = el.text.replaceAll('{n}', numStr);
            replaced = true;
          }
          if ((el.type === 'barcode' || el.type === 'qr') && el.value.includes('{n}')) {
            el.value = el.value.replaceAll('{n}', numStr);
            replaced = true;
          }
        });
        if (!replaced) {
          const txtEl = copy.elements.find((el) => el.type === 'text');
          if (txtEl) txtEl.text = `${txtEl.text} ${pattern.replaceAll('{n}', numStr)}`;
        }
        state.labels.push(copy);
      }
      batchModal.close();
      renderAll();
    });

    // Custom SVG Modal
    const svgModal = $('#svg-modal');
    $('#btn-close-svg').addEventListener('click', () => svgModal.close());
    $('#btn-cancel-svg').addEventListener('click', () => svgModal.close());
    $('#custom-svg-file').addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (!f) return;
      f.text().then((txt) => ($('#custom-svg-code').value = txt));
    });
    $('#svg-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const code = $('#custom-svg-code').value.trim();
      if (!code.includes('<svg')) return;
      addElement({ type: 'icon', customSvg: code, w: 48, h: 48, color: '#0f172a' });
      $('#custom-svg-code').value = '';
      svgModal.close();
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (state.editingTextId) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelectedElement();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedId) {
          e.preventDefault();
          deleteSelectedElement();
        }
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && state.selectedId) {
        const el = selectedElement();
        if (!el || el.locked) return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowUp') el.y -= step;
        if (e.key === 'ArrowDown') el.y += step;
        if (e.key === 'ArrowLeft') el.x -= step;
        if (e.key === 'ArrowRight') el.x += step;
        renderCanvas();
      }
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  init();
})();

