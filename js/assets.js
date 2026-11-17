window.FreeLabelAssets = {
  sizePresets: [
    { id: '40x25', name: '40 × 25 mm (GoDEX G500 預設)', w: 40, h: 25, radius: 2 },
    { id: '60x40', name: '60 × 40 mm (標準熱感應)', w: 60, h: 40, radius: 2 },
    { id: '50x30', name: '50 × 30 mm (小貨品標籤)', w: 50, h: 30, radius: 2 },
    { id: '40x30', name: '40 × 30 mm (精巧貼紙)', w: 40, h: 30, radius: 2 },
    { id: '80x50', name: '80 × 50 mm (大物流貼紙)', w: 80, h: 50, radius: 2 },
    { id: '100x150', name: '100 × 150 mm (超商寄件單)', w: 100, h: 150, radius: 2 },
    { id: '40x40r', name: '40 × 40 mm (圓形貼紙)', w: 40, h: 40, radius: 20 },
    { id: '70x24', name: '70 × 24 mm (24mm 連續色帶)', w: 70, h: 24, radius: 1 },
    { id: '50x12', name: '50 × 12 mm (12mm 連續色帶)', w: 50, h: 12, radius: 1 }
  ],

  iconCategories: ['全部', '物流倉儲', '零售促銷', '食品烘焙', '辦公收納', '可愛裝飾'],

  icons: [
    // 物流倉儲
    {
      id: 'fragile', name: '易碎品', cat: '物流倉儲',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22h8"/><path d="M12 15v7"/><path d="M17 2H7l1 8a4 4 0 0 0 8 0l1-8z"/><path d="m11 5-1.5 2.5 3 1.5L11 11"/></svg>'
    },
    {
      id: 'keep-dry', name: '防潮雨傘', cat: '物流倉儲',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12a10.06 10.06 0 0 0-20 0Z"/><path d="M12 12v8a2 2 0 0 0 4 0"/><path d="M12 2v1"/></svg>'
    },
    {
      id: 'this-way-up', name: '向上箭頭', cat: '物流倉儲',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17V5m0 0L4 8m3-3 3 3"/><path d="M17 17V5m0 0-3 3m3-3 3 3"/><path d="M4 20h16"/></svg>'
    },
    {
      id: 'box', name: '包裹紙箱', cat: '物流倉儲',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>'
    },
    {
      id: 'truck', name: '貨運配送', cat: '物流倉儲',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>'
    },
    {
      id: 'recycle', name: '環保回收', cat: '物流倉儲',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/></svg>'
    },
    {
      id: 'scissors', name: '剪裁線', cat: '物流倉儲',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>'
    },
    {
      id: 'warning', name: '注意警告', cat: '物流倉儲',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
    },

    // 零售促銷
    {
      id: 'tag', name: '價格吊牌', cat: '零售促銷',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>'
    },
    {
      id: 'crown', name: '皇冠精選', cat: '零售促銷',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>'
    },
    {
      id: 'gift', name: '禮品包裝', cat: '零售促銷',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>'
    },
    {
      id: 'bag', name: '購物袋', cat: '零售促銷',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>'
    },
    {
      id: 'sparkles', name: '閃耀新品', cat: '零售促銷',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>'
    },
    {
      id: 'badge-check', name: '品質認證', cat: '零售促銷',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>'
    },
    {
      id: 'heart', name: '愛心手作', cat: '零售促銷',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
    },
    {
      id: 'percent', name: '折扣優惠', cat: '零售促銷',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>'
    },

    // 食品烘焙
    {
      id: 'coffee', name: '咖啡飲品', cat: '食品烘焙',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>'
    },
    {
      id: 'leaf', name: '天然有機', cat: '食品烘焙',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>'
    },
    {
      id: 'flame', name: '辣度/熱食', cat: '食品烘焙',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
    },
    {
      id: 'snowflake', name: '冷凍冷藏', cat: '食品烘焙',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>'
    },
    {
      id: 'cake', name: '烘焙甜點', cat: '食品烘焙',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>'
    },
    {
      id: 'utensils', name: '餐具美食', cat: '食品烘焙',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>'
    },

    // 辦公收納
    {
      id: 'folder', name: '檔案分類', cat: '辦公收納',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>'
    },
    {
      id: 'clock', name: '效期/時間', cat: '辦公收納',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
    },
    {
      id: 'calendar', name: '日期標記', cat: '辦公收納',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
    },
    {
      id: 'phone', name: '聯絡電話', cat: '辦公收納',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
    },
    {
      id: 'wifi', name: 'Wi-Fi', cat: '辦公收納',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>'
    },
    {
      id: 'lock', name: '機密/鎖定', cat: '辦公收納',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
    },

    // 可愛裝飾
    {
      id: 'smile', name: '微笑表情', cat: '可愛裝飾',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'
    },
    {
      id: 'paw', name: '寵物肉球', cat: '可愛裝飾',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>'
    },
    {
      id: 'sun', name: '陽光', cat: '可愛裝飾',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>'
    },
    {
      id: 'moon', name: '月亮星夜', cat: '可愛裝飾',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'
    },
    {
      id: 'flower', name: '小花朵', cat: '可愛裝飾',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/><path d="M12 7.5V9"/><path d="M7.5 12H9"/><path d="M16.5 12H15"/><path d="M12 16.5V15"/></svg>'
    },
    {
      id: 'zap', name: '閃電能量', cat: '可愛裝飾',
      svg: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
    }
  ],

  shapes: [
    { id: 'rect', name: '實心矩形', shapeType: 'rect', fill: '#e2e8f0', stroke: '#0f172a', strokeWidth: 0, radius: 0 },
    { id: 'round-rect', name: '圓角外框', shapeType: 'rect', fill: 'transparent', stroke: '#0f172a', strokeWidth: 2, radius: 8 },
    { id: 'dashed-frame', name: '虛線剪裁框', shapeType: 'rect', fill: 'transparent', stroke: '#0f172a', strokeWidth: 2, radius: 6, dash: '6 4' },
    { id: 'pill', name: '膠囊形', shapeType: 'rect', fill: '#0f172a', stroke: '#0f172a', strokeWidth: 0, radius: 999 },
    { id: 'circle', name: '圓形/橢圓', shapeType: 'ellipse', fill: '#dbeafe', stroke: '#2563eb', strokeWidth: 2 },
    { id: 'triangle', name: '三角形', shapeType: 'triangle', fill: '#fef3c7', stroke: '#d97706', strokeWidth: 2 },
    { id: 'diamond', name: '菱形徽章', shapeType: 'diamond', fill: '#fce7f3', stroke: '#db2777', strokeWidth: 2 },
    { id: 'hexagon', name: '六角形', shapeType: 'hexagon', fill: '#dcfce7', stroke: '#16a34a', strokeWidth: 2 },
    { id: 'star', name: '五角星', shapeType: 'star', fill: '#facc15', stroke: '#ca8a04', strokeWidth: 1.5 },
    { id: 'burst', name: '促銷爆炸貼', shapeType: 'burst', fill: '#ef4444', stroke: '#991b1b', strokeWidth: 0 },
    { id: 'ribbon', name: '橫幅彩帶', shapeType: 'ribbon', fill: '#0f172a', stroke: '#0f172a', strokeWidth: 0 },
    { id: 'tag-shape', name: '吊牌外框', shapeType: 'tag', fill: '#f8fafc', stroke: '#0f172a', strokeWidth: 2 },
    { id: 'bubble', name: '對話氣泡', shapeType: 'bubble', fill: '#ffffff', stroke: '#0f172a', strokeWidth: 2 },
    { id: 'line-solid', name: '實線分隔', shapeType: 'line', stroke: '#0f172a', strokeWidth: 2, dash: '' },
    { id: 'line-dashed', name: '虛線分隔', shapeType: 'line', stroke: '#64748b', strokeWidth: 2, dash: '6 4' },
    { id: 'line-wave', name: '波浪分隔線', shapeType: 'wave', stroke: '#0f172a', strokeWidth: 2 }
  ],

  textBoxPresets: [
    {
      id: 'plain',
      name: '純文字標題',
      desc: '自由排版與字體特效',
      props: {
        text: '雙擊編輯文字',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: "'Noto Sans TC', sans-serif",
        color: '#0f172a',
        boxBg: 'transparent',
        boxBorder: 'transparent',
        boxBorderWidth: 0,
        boxRadius: 0,
        boxDash: 'solid',
        effect: 'none'
      }
    },
    {
      id: 'pill-badge',
      name: '膠囊反白標籤框',
      desc: '高對比黑底白字膠囊',
      props: {
        text: 'NEW ARRIVAL',
        fontSize: 12,
        fontWeight: '700',
        fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
        color: '#ffffff',
        boxBg: '#0f172a',
        boxBorder: '#0f172a',
        boxBorderWidth: 0,
        boxRadius: 999,
        boxDash: 'solid',
        effect: 'none',
        w: 110,
        h: 28
      }
    },
    {
      id: 'double-stamp',
      name: '雙線印章文字框',
      desc: '復古雙線邊框設計',
      props: {
        text: 'HANDMADE\n純手工製作',
        fontSize: 13,
        fontWeight: '700',
        fontFamily: "'Noto Serif TC', serif",
        color: '#991b1b',
        boxBg: '#fff1f2',
        boxBorder: '#991b1b',
        boxBorderWidth: 3,
        boxRadius: 6,
        boxDash: 'double',
        effect: 'none',
        w: 120,
        h: 48
      }
    },
    {
      id: 'dashed-coupon',
      name: '虛線剪裁折價框',
      desc: '虛線外框適合促銷/備註',
      props: {
        text: '憑券享 85 折優惠',
        fontSize: 13,
        fontWeight: '700',
        fontFamily: "'Zen Maru Gothic', 'Noto Sans TC', sans-serif",
        color: '#b45309',
        boxBg: '#fffbeb',
        boxBorder: '#d97706',
        boxBorderWidth: 2,
        boxRadius: 8,
        boxDash: 'dashed',
        effect: 'none',
        w: 140,
        h: 36
      }
    },
    {
      id: 'kv-table',
      name: '品名規格欄位框',
      desc: '多行對齊商品明細',
      props: {
        text: '品名：精品手沖咖啡豆\n重量：227g ± 5%\n保存：2027/06/30',
        fontSize: 10,
        fontWeight: '500',
        fontFamily: "'Noto Sans TC', sans-serif",
        textAlign: 'left',
        color: '#0f172a',
        boxBg: '#f8fafc',
        boxBorder: '#0f172a',
        boxBorderWidth: 1.5,
        boxRadius: 4,
        boxDash: 'solid',
        effect: 'none',
        w: 150,
        h: 54
      }
    },
    {
      id: 'curved-arc',
      name: '弧形圓章文字',
      desc: 'SVG 路徑弧形文字特效',
      props: {
        text: '★ 100% HANDMADE ★',
        fontSize: 13,
        fontWeight: '800',
        fontFamily: "'Fredoka', 'Zen Maru Gothic', sans-serif",
        color: '#0f172a',
        curved: true,
        curveAmount: 45,
        boxBg: 'transparent',
        boxBorder: 'transparent',
        boxBorderWidth: 0,
        effect: 'none',
        w: 150,
        h: 64
      }
    },
    {
      id: 'effect-3d',
      name: '3D 復古立體字',
      desc: '硬邊層疊立體陰影',
      props: {
        text: 'SALE 50%',
        fontSize: 22,
        fontWeight: '900',
        fontFamily: "'Bebas Neue', 'Noto Sans TC', sans-serif",
        color: '#ef4444',
        effect: '3d',
        effectColor: '#0f172a',
        boxBg: 'transparent',
        boxBorder: 'transparent',
        boxBorderWidth: 0,
        w: 140,
        h: 42
      }
    },
    {
      id: 'effect-gradient',
      name: '漸層炫彩文字',
      desc: '線性雙色漸層填色',
      props: {
        text: 'LIMITED EDITION',
        fontSize: 18,
        fontWeight: '900',
        fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
        color: '#2563eb',
        effect: 'gradient',
        effectColor: '#ec4899',
        boxBg: 'transparent',
        boxBorder: 'transparent',
        boxBorderWidth: 0,
        w: 165,
        h: 36
      }
    }
  ],

  textEffects: [
    { id: 'none', name: '無特效' },
    { id: 'outline', name: '粗描邊' },
    { id: 'shadow', name: '柔和陰影' },
    { id: '3d', name: '3D 硬邊' },
    { id: 'neon', name: '霓虹發光' },
    { id: 'gradient', name: '雙色漸層' },
    { id: 'highlight', name: '螢光底色' },
    { id: 'stamp', name: '反白印章' }
  ],

  templates: [
    {
      id: 'tpl-shipping',
      name: '物流出貨標籤',
      size: '60×40 mm',
      label: {
        w: 60, h: 40, radius: 2, bg: '#ffffff',
        elements: [
          { type: 'shape', shapeType: 'rect', x: 6, y: 6, w: 214, h: 138, fill: 'transparent', stroke: '#0f172a', strokeWidth: 2, radius: 4 },
          { type: 'text', text: 'PRIORITY 出貨單', x: 12, y: 12, w: 136, h: 24, fontSize: 12, fontWeight: '800', fontFamily: "'Noto Sans TC', sans-serif", color: '#ffffff', boxBg: '#0f172a', boxRadius: 3, textAlign: 'center' },
          { type: 'icon', iconId: 'fragile', x: 154, y: 12, w: 24, h: 24, color: '#dc2626' },
          { type: 'icon', iconId: 'keep-dry', x: 184, y: 12, w: 24, h: 24, color: '#0f172a' },
          { type: 'text', text: '收件：王小明\n單號：TW-2026-001', x: 12, y: 42, w: 132, h: 42, fontSize: 10.5, fontWeight: '600', fontFamily: "'Noto Sans TC', sans-serif", color: '#0f172a', textAlign: 'left' },
          { type: 'qr', value: 'https://freelabel.app/track/001', x: 152, y: 42, w: 58, h: 58, color: '#0f172a' },
          { type: 'barcode', value: 'TW-2026-001', x: 12, y: 94, w: 134, h: 44, color: '#0f172a' }
        ]
      }
    },
    {
      id: 'tpl-bakery',
      name: '手作烘焙圓章貼',
      size: '40×40 mm',
      label: {
        w: 40, h: 40, radius: 20, bg: '#fffbeb',
        elements: [
          { type: 'shape', shapeType: 'ellipse', x: 8, y: 8, w: 135, h: 135, fill: 'transparent', stroke: '#92400e', strokeWidth: 2, dash: '4 3' },
          { type: 'text', text: '★ FRESH BAKED ★', x: 15, y: 18, w: 121, h: 46, fontSize: 11, fontWeight: '800', fontFamily: "'Fredoka', sans-serif", color: '#92400e', curved: true, curveAmount: 42 },
          { type: 'icon', iconId: 'cake', x: 55, y: 48, w: 40, h: 40, color: '#b45309' },
          { type: 'text', text: '職人手作烘焙', x: 24, y: 98, w: 103, h: 24, fontSize: 11, fontWeight: '700', fontFamily: "'Noto Serif TC', serif", color: '#ffffff', boxBg: '#92400e', boxRadius: 999 }
        ]
      }
    },
    {
      id: 'tpl-sale',
      name: '特價促銷爆炸貼',
      size: '50×30 mm',
      label: {
        w: 50, h: 30, radius: 2, bg: '#ffffff',
        elements: [
          { type: 'shape', shapeType: 'burst', x: 10, y: 10, w: 86, h: 86, fill: '#ef4444', stroke: '#991b1b', strokeWidth: 0 },
          { type: 'text', text: '50%\nOFF', x: 20, y: 26, w: 66, h: 54, fontSize: 17, fontWeight: '900', fontFamily: "'Bebas Neue', sans-serif", color: '#ffffff', effect: '3d', effectColor: '#7f1d1d', rotation: -8 },
          { type: 'text', text: '限時特惠價', x: 98, y: 16, w: 82, h: 24, fontSize: 13, fontWeight: '900', fontFamily: "'Mochiy Pop One', 'Noto Sans TC', sans-serif", color: '#dc2626' },
          { type: 'text', text: 'NT$ 299', x: 98, y: 46, w: 82, h: 34, fontSize: 19, fontWeight: '900', fontFamily: "'Inter', sans-serif", color: '#0f172a', effect: 'gradient', effectColor: '#dc2626' },
          { type: 'text', text: '數量有限 售完為止', x: 98, y: 82, w: 82, h: 18, fontSize: 8.5, fontWeight: '600', fontFamily: "'Noto Sans TC', sans-serif", color: '#ffffff', boxBg: '#0f172a', boxRadius: 3 }
        ]
      }
    },
    {
      id: 'tpl-asset',
      name: '資產序號條碼貼',
      size: '60×40 mm',
      label: {
        w: 60, h: 40, radius: 2, bg: '#ffffff',
        elements: [
          { type: 'shape', shapeType: 'rect', x: 0, y: 0, w: 227, h: 32, fill: '#0f172a', stroke: 'transparent', strokeWidth: 0 },
          { type: 'text', text: 'PROPERTY ASSET TAG', x: 10, y: 5, w: 207, h: 22, fontSize: 11, fontWeight: '700', fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' },
          { type: 'text', text: '編號：NO.{n}', x: 14, y: 42, w: 199, h: 26, fontSize: 14, fontWeight: '700', fontFamily: "'JetBrains Mono', 'Noto Sans TC', sans-serif", color: '#0f172a', boxBg: '#f1f5f9', boxBorder: '#cbd5e1', boxBorderWidth: 1, boxRadius: 4 },
          { type: 'barcode', value: 'ASSET-001', x: 14, y: 76, w: 199, h: 64, color: '#0f172a' }
        ]
      }
    },
    {
      id: 'tpl-cable',
      name: '線材電源整理貼',
      size: '40×25 mm',
      label: {
        w: 40, h: 25, radius: 2, bg: '#ffffff',
        elements: [
          { type: 'shape', shapeType: 'line', x: 8, y: 8, w: 135, h: 10, stroke: '#0f172a', strokeWidth: 2 },
          { type: 'icon', iconId: 'zap', x: 10, y: 33, w: 22, h: 22, color: '#0f172a' },
          { type: 'text', text: '電源線', x: 36, y: 29, w: 105, h: 30, fontSize: 15, fontWeight: '700', fontFamily: "'Noto Sans TC', sans-serif", color: '#ffffff', boxBg: '#0f172a', boxRadius: 999 },
          { type: 'shape', shapeType: 'line', x: 8, y: 74, w: 135, h: 10, stroke: '#0f172a', strokeWidth: 2 }
        ]
      }
    }
  ]
};

