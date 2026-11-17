# FreeLabel Studio — Web-Based Continuous Label Designer & Printer

[繁體中文](README.md) | [English](README.en.md)

**FreeLabel Studio** is a zero-build, pure client-side web application for designing and printing continuous labels. Built with thermal label printers (such as the GoDEX G500) and adhesive label rolls in mind, it offers millimeter-accurate (`mm`) layout, vector SVG icons, rich CJK/Latin typography, text effects, Code 128 / QR Code generation, and selective multi-label printing.

---

## Features

- **Continuous Label Printing & Queue Management**
  - Built-in label size presets (`40×25 mm`, `60×40 mm`, `50×30 mm`, `40×30 mm`, `80×50 mm`, `100×150 mm`, `40×40 mm` circle, `24mm`/`12mm` continuous tape) plus custom width, height, and corner radius in `mm`.
  - **Continuous Strip Queue** at the bottom lets you add, duplicate, delete, and selectively check labels to print (**only selected labels are printed**, with a quick **Select All / Current Only** toggle).
  - **Batch Sequence Generator**: Replace `{n}` placeholders in text or barcodes to generate numbered label series in one click.
  - **Print Offset Calibration (`X / Y mm`)** and **Thermal B&W Preview** mode, backed by zero-margin `@media print` pagination.
- **Rich Vector SVG Icons & Barcodes**
  - **34 built-in vector SVG icons** across 5 categories (Logistics, Retail & Promo, Food & Bakery, Office & Storage, Cute & Decor) with search and custom coloring.
  - **Custom SVG Import**: Paste raw SVG markup or upload `.svg` files.
  - Pure-JS vector **Code 128 Barcode** and scannable **QR Code** SVG generators.
- **Versatile Shape Styles**
  - Solid/rounded rectangles, dashed cut frames, pills, ellipses, triangles, diamonds, hexagons, stars, sale burst badges, ribbon banners, hang tags, speech bubbles, and solid/dashed/wavy dividers.
- **Typography, Text Boxes & Text Effects**
  - 12 curated CJK & Latin fonts (`Noto Sans TC`, `Noto Serif TC`, `Zen Maru Gothic`, `Klee One`, `Mochiy Pop One`, `Inter`, `Playfair Display`, `Bebas Neue`, `Oswald`, `Pacifico`, `Fredoka`, `JetBrains Mono`).
  - 8 text box presets (pill badge, double-border stamp, dashed coupon box, key-value spec box, curved arc text, etc.) with customizable background, border color/width/radius, and solid/dashed/dotted/double borders.
  - 8 text effects: **None, Outline, Drop Shadow, 3D Block, Neon Glow, Gradient Fill, Highlight, Inverted Stamp**, plus **SVG Curved TextPath**.
- **Interactive Canvas Editor**
  - Drag to move with center snap guides, 8-handle resize, free rotation, double-click inline text editing, layer ordering/lock/hide, 5mm grid overlay, and Undo/Redo (`Ctrl+Z` / `Ctrl+Y`).
  - Export to **SVG**, high-res **PNG**, or **JSON** project files, with automatic `localStorage` persistence.

---

## Project Structure

```text
freelabel/
├── index.html       # Main studio UI & dialogs
├── styles.css       # Editor styling & @media print rules
├── README.md        # Traditional Chinese documentation
├── README.en.md     # English documentation
└── js/
    ├── fonts.js     # Font definitions
    ├── assets.js    # SVG icon library, shapes, text boxes, effects & templates
    ├── barcode.js   # Pure-JS Code 128 barcode & QR Code SVG generator
    └── app.js       # Canvas interaction, state management, print & export engine
```

---

## Quick Start

No build step or dependencies required — serve the directory with any static HTTP server:

```bash
git clone https://github.com/blair-ko/freelabel.git
cd freelabel
python3 -m http.server 8766
```

Then open `http://localhost:8766` in your browser.

---

## Thermal Printer Tips (e.g., GoDEX G500)

1. In your browser print dialog, set **Margins** to **None**, disable **Headers and footers**, and keep **Scale** at `100%`.
2. Enter the **actual sticker dimensions** (e.g. `40 × 25 mm`) without including liner margins or inter-label gaps.
3. If minor alignment shifts occur, use the **Print Offset X / Y (mm)** fields in the right-hand label settings panel for `0.5 mm` fine-tuning.
