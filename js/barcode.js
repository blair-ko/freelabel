// Pure-JS Vector Barcode (Code 128B) & QR-Matrix SVG Generator
(function (global) {
  // Standard Code 128 patterns (widths of bar/space alternating, 11 modules per char, stop = 13)
  const CODE128_PATTERNS = [
    '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213',
    '221312','231212','112232','122132','122231','113222','123122','123221','223211','221132',
    '221231','213212','223112','312131','311222','321122','321221','312212','322112','322211',
    '212123','212321','232121','111323','131123','131321','112313','132113','132311','211313',
    '231113','231311','112133','112331','132131','113123','113321','133121','313121','211331',
    '231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
    '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214',
    '112412','122114','122411','142112','142211','241211','221114','413111','241112','134111',
    '111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
    '214121','412121','111143','111341','131141','114113','114311','411113','411311','113141',
    '114131','311141','411131','211412','211214','211232','2331112'
  ];

  function generateCode128SVG(text, opts = {}) {
    const fg = opts.fg || '#0f172a';
    const showText = opts.showText !== false;
    const safeText = (text || 'FREELABEL').replace(/[^\x20-\x7E]/g, '?');
    const codes = [104]; // Start B
    let checksum = 104;

    for (let i = 0; i < safeText.length; i++) {
      const code = safeText.charCodeAt(i) - 32;
      codes.push(code);
      checksum += code * (i + 1);
    }
    codes.push(checksum % 103);
    codes.push(106); // Stop

    const patternStr = codes.map((c) => CODE128_PATTERNS[c]).join('');
    let totalModules = 0;
    for (let i = 0; i < patternStr.length; i++) {
      totalModules += parseInt(patternStr[i], 10);
    }

    const quiet = 6;
    const vbWidth = totalModules + quiet * 2;
    const barHeight = showText ? 44 : 56;
    const vbHeight = 60;

    let x = quiet;
    let rects = '';
    for (let i = 0; i < patternStr.length; i++) {
      const w = parseInt(patternStr[i], 10);
      if (i % 2 === 0) {
        rects += `<rect x="${x}" y="2" width="${w}" height="${barHeight}" fill="${fg}"/>`;
      }
      x += w;
    }

    const textEl = showText
      ? `<text x="${vbWidth / 2}" y="${barHeight + 13}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="600" fill="${fg}">${escapeXml(safeText)}</text>`
      : '';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbWidth} ${vbHeight}" preserveAspectRatio="none" width="100%" height="100%">${rects}${textEl}</svg>`;
  }

  // Real QR Code (Version 1-4 Byte mode with Reed-Solomon ECC-L)
  // Compact pure-JS QR encoder so generated QR codes are genuinely scannable!
  const QR = (function () {
    const EXP = new Uint8Array(512);
    const LOG = new Uint8Array(256);
    let v = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = v;
      LOG[v] = i;
      v <<= 1;
      if (v & 256) v ^= 285;
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];

    function gfMul(a, b) {
      return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
    }

    function rsGenPoly(ecLen) {
      let poly = [1];
      for (let i = 0; i < ecLen; i++) {
        const next = new Array(poly.length + 1).fill(0);
        const factor = EXP[i];
        for (let j = 0; j < poly.length; j++) {
          next[j] ^= poly[j];
          next[j + 1] ^= gfMul(poly[j], factor);
        }
        poly = next;
      }
      return poly;
    }

    function rsEncode(data, ecLen) {
      const gen = rsGenPoly(ecLen);
      const res = data.concat(new Array(ecLen).fill(0));
      for (let i = 0; i < data.length; i++) {
        const coef = res[i];
        if (coef !== 0) {
          for (let j = 0; j < gen.length; j++) {
            res[i + j] ^= gfMul(gen[j], coef);
          }
        }
      }
      return res.slice(data.length);
    }

    // Version specs for ECC-L: [size, totalDataCodewords, ecCodewordsPerBlock, alignPos]
    const VERSIONS = [
      null,
      [21, 19, 7, []],
      [25, 34, 10, [6, 18]],
      [29, 55, 15, [6, 22]],
      [33, 80, 20, [6, 26]],
      [37, 108, 26, [6, 30]]
    ];

    function encode(text) {
      const bytes = new TextEncoder().encode(text || 'https://freelabel.app');
      let ver = 1;
      while (ver < VERSIONS.length && bytes.length + 2 > VERSIONS[ver][1]) ver++;
      if (ver >= VERSIONS.length) ver = VERSIONS.length - 1;

      const [size, dataCap, ecLen, alignPos] = VERSIONS[ver];
      const maxBytes = dataCap - 2;
      const payload = bytes.slice(0, maxBytes);

      const bits = [];
      const pushBits = (val, len) => {
        for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
      };

      pushBits(0b0100, 4); // Byte mode
      pushBits(payload.length, 8);
      for (const b of payload) pushBits(b, 8);
      pushBits(0, Math.min(4, dataCap * 8 - bits.length));
      while (bits.length % 8 !== 0) bits.push(0);

      const codewords = [];
      for (let i = 0; i < bits.length; i += 8) {
        let byte = 0;
        for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
        codewords.push(byte);
      }
      const pads = [0xec, 0x11];
      let pIdx = 0;
      while (codewords.length < dataCap) {
        codewords.push(pads[pIdx % 2]);
        pIdx++;
      }

      const ec = rsEncode(codewords, ecLen);
      const fullData = codewords.concat(ec);

      const grid = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
      const reserved = Array.from({ length: size }, () => new Uint8Array(size));

      function setMod(r, c, val, isRes = true) {
        if (r >= 0 && r < size && c >= 0 && c < size) {
          grid[r][c] = val ? 1 : 0;
          if (isRes) reserved[r][c] = 1;
        }
      }

      function drawFinder(r0, c0) {
        for (let dr = -1; dr <= 7; dr++) {
          for (let dc = -1; dc <= 7; dc++) {
            const r = r0 + dr;
            const c = c0 + dc;
            if (r < 0 || r >= size || c < 0 || c >= size) continue;
            const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
            const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
            const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
            setMod(r, c, inOuter && (onBorder || inCore) ? 1 : 0);
          }
        }
      }

      drawFinder(0, 0);
      drawFinder(0, size - 7);
      drawFinder(size - 7, 0);

      // Alignment patterns
      for (const r of alignPos) {
        for (const c of alignPos) {
          if (reserved[r][c]) continue;
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const on = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
              setMod(r + dr, c + dc, on ? 1 : 0);
            }
          }
        }
      }

      // Timing patterns
      for (let i = 8; i < size - 8; i++) {
        if (!reserved[6][i]) setMod(6, i, i % 2 === 0 ? 1 : 0);
        if (!reserved[i][6]) setMod(i, 6, i % 2 === 0 ? 1 : 0);
      }

      // Dark module & reserve format info
      setMod(size - 8, 8, 1);
      for (let i = 0; i < 9; i++) {
        if (!reserved[8][i]) reserved[8][i] = 1;
        if (!reserved[i][8]) reserved[i][8] = 1;
      }
      for (let i = size - 8; i < size; i++) {
        reserved[8][i] = 1;
        reserved[i][8] = 1;
      }

      // Place data bits (zigzag)
      let bitIdx = 0;
      const totalBits = fullData.length * 8;
      let dir = -1;
      for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) col--;
        for (let step = 0; step < size; step++) {
          const row = dir === -1 ? size - 1 - step : step;
          for (let dc = 0; dc < 2; dc++) {
            const c = col - dc;
            if (!reserved[row][c]) {
              let bit = 0;
              if (bitIdx < totalBits) {
                bit = (fullData[bitIdx >> 3] >> (7 - (bitIdx & 7))) & 1;
                bitIdx++;
              }
              // Mask pattern 0: (row + c) % 2 === 0
              if ((row + c) % 2 === 0) bit ^= 1;
              grid[row][c] = bit;
            }
          }
        }
        dir *= -1;
      }

      // Format info for ECC-L (01) + Mask 0 (000) => 15-bit BCH = 0x77c4
      const fmt = 0x77c4;
      for (let i = 0; i < 6; i++) {
        const b = (fmt >> (14 - i)) & 1;
        grid[8][i] = b;
        grid[size - 1 - i][8] = b;
      }
      grid[8][7] = (fmt >> 8) & 1;
      grid[8][8] = (fmt >> 7) & 1;
      grid[7][8] = (fmt >> 6) & 1;
      grid[size - 7][8] = (fmt >> 8) & 1;
      for (let i = 9; i < 15; i++) {
        const b = (fmt >> (14 - i)) & 1;
        grid[14 - i][8] = b;
        grid[8][size - 15 + i] = b;
      }

      return grid;
    }

    return { encode };
  })();

  function generateQRSVG(text, opts = {}) {
    const fg = opts.fg || '#0f172a';
    const grid = QR.encode(text);
    const size = grid.length;
    const pad = 2;
    const total = size + pad * 2;
    let paths = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 1) {
          paths += `M${c + pad},${r + pad}h1v1h-1z`;
        }
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="100%" height="100%" shape-rendering="crispEdges"><path d="${paths}" fill="${fg}"/></svg>`;
  }

  function escapeXml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  global.FreeLabelBarcode = {
    generateCode128SVG,
    generateQRSVG
  };
})(window);

