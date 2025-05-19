# QR Studio

QR Studio is a premium QR code generator and scanner built with HTML, CSS, and vanilla JavaScript only. It includes a polished glassmorphism interface, persistent history, theme switching, webcam scanning, analytics cards, and export actions for PNG and SVG.

## Features

- Website, text, email, phone, SMS, WhatsApp, Wi-Fi, and vCard QR generation
- Live customization for size, colors, margin, logo upload, and error correction
- Dark and light theme with local storage persistence
- QR history stored locally in the browser
- Webcam QR scanner using html5-qrcode
- PNG, SVG, copy, and share actions
- Keyboard shortcuts for faster workflows
- Accessible, responsive dashboard layout

## Project Structure

```text
QR-Studio/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── generator.js
│   ├── scanner.js
│   ├── history.js
│   ├── download.js
│   ├── theme.js
│   └── analytics.js
├── assets/
│   ├── icons/
│   ├── images/
│   └── logo/
└── README.md
```

## Libraries

The app loads the following browser libraries from CDNs:

- qrcode for QR generation
- html5-qrcode for webcam scanning
- Font Awesome for icons

## Running the App

1. Open `index.html` in a browser, or use Live Server in VS Code.
2. Allow camera access if you want to use the scanner.
3. Generate a QR code, customize it, and download or share the result.

## Notes

- Generated history, theme, download counts, and analytics are stored in `localStorage`.
- Logo uploads are used for live previews and generation, but uploaded files are not persisted.
- For best results, serve the project from a local web server instead of opening it as a raw file URL.
