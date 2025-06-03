<div align="center">

<img src="https://img.shields.io/badge/QR%20Studio-Premium%20Generator-7c6af7?style=for-the-badge&logo=qrcode&logoColor=white" alt="QR Studio" />

# ⬛ QR Studio

### A premium QR code generator & scanner — built with pure HTML, CSS, and JavaScript.

<br/>

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Backend](https://img.shields.io/badge/Backend-None-06d6a0?style=flat-square)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-f72585?style=flat-square)](LICENSE)

<br/>

> _Design beautiful QR codes. Scan with your webcam. Export instantly. No backend. No login. Just open and create._

<br/>

</div>

---

## ✨ What is QR Studio?

**QR Studio** is a zero-dependency, browser-only QR code platform that packs a full SaaS-quality experience into a single HTML file. It features a dark-first glassmorphic UI, live QR preview, persistent history, webcam scanning, PNG & SVG export — all running locally in your browser.

---

## 🚀 Features at a Glance

| Feature | Description |
|---|---|
| 🎨 **Live Customization** | Adjust QR colors with instant preview |
| 🕶️ **Dark / Light Theme** | Smooth toggle with localStorage persistence |
| 📷 **Webcam Scanner** | Decode any QR code using your camera |
| 🗂️ **Persistent History** | All generated QRs saved in your browser |
| 💾 **PNG & SVG Export** | Download in any format with one click |
| 📋 **Copy & Share** | Copy content or trigger the native share sheet |
| ⌨️ **Keyboard Shortcuts** | `Enter` to generate · `Ctrl+D` to download · `Esc` to reset |
| 📊 **Analytics Dashboard** | Live stats for generated, downloaded, and history counts |
| ♿ **Accessible** | Semantic HTML, ARIA labels, keyboard navigation |
| 📱 **Fully Responsive** | Works on desktop, tablet, and mobile |

---

## 🎯 Supported QR Types

<div align="center">

| 🌐 Website URL | ✏️ Plain Text | 📧 Email | 📞 Phone |
|:---:|:---:|:---:|:---:|
| **💬 SMS** | **🟢 WhatsApp** | **📶 Wi-Fi** | **👤 vCard Contact** |

</div>

---

## 🗂️ Project Structure

```
QR-Studio/
│
├── 📄 index.html          — App shell & all sections
│
├── 🎨 css/
│   └── style.css          — Full design system, animations, responsive
│
├── ⚙️ js/
│   ├── app.js             — Bootstrap, state, event bindings
│   ├── generator.js       — QR build logic, field rendering, validation
│   ├── scanner.js         — Webcam QR scanner wrapper
│   ├── history.js         — localStorage read/write for history
│   ├── download.js        — PNG, SVG, copy, share helpers
│   ├── theme.js           — Dark/light theme toggle & persistence
│   ├── analytics.js       — Stats snapshot & DOM update
│   └── cursor.js          — Custom animated cursor
│
└── 📁 assets/
    ├── icons/
    ├── images/
    └── logo/
```

---

## 📦 Libraries Used

| Library | Purpose | Load |
|---|---|---|
| [qrcode.js](https://github.com/soldair/node-qrcode) | QR code generation (canvas + SVG) | Local bundle |
| [html5-qrcode](https://github.com/mebjas/html5-qrcode) | Webcam QR decoding | CDN |
| [Font Awesome 6](https://fontawesome.com) | Icons throughout the UI | CDN |
| [Google Fonts](https://fonts.google.com) | Space Grotesk + Manrope | CDN |

---

## ⚡ Getting Started

**Option 1 — Just open it:**
```bash
# Clone the repo
git clone https://github.com/your-username/qr-studio.git

# Open directly in browser
open QR-Code-Generator/index.html
```

**Option 2 — Live Server (recommended):**
```bash
# Using VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

**Option 3 — Any local server:**
```bash
# Python
python -m http.server 3000

# Node (npx)
npx serve .
```

> ⚠️ Camera access for the scanner requires a **secure context** (`localhost` or `https://`). Opening as a raw `file://` URL will block webcam access in most browsers.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Enter` | Generate QR code |
| `Ctrl + D` | Download current QR as PNG |
| `Esc` | Reset the form |

---

## 💾 Data & Privacy

All data stays **100% on your device**:

- ✅ QR history → `localStorage`
- ✅ Theme preference → `localStorage`
- ✅ Download & generation counts → `localStorage`
- 🚫 Nothing is sent to any server
- 🚫 No tracking, no analytics calls, no login required

---

## 🛠️ Tech Highlights

```
✦ Vanilla JavaScript — zero frameworks, zero build step
✦ CSS custom properties — full design token system
✦ Glassmorphism + ambient gradient UI
✦ Modular ES module architecture
✦ Custom animated cursor (desktop only)
✦ Ripple effects, scroll reveal, QR pop animations
✦ IntersectionObserver-free scroll reveal via CSS
```

---

<div align="center">

Made with ❤️ using only HTML, CSS & JavaScript

⭐ **Star this repo if you found it useful!**

</div>
