function createDownloadLink(href, fileName) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function sanitizeFileName(input) {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "qr-studio"
  );
}

export async function downloadPng(dataUrl, fileName = "qr-studio.png") {
  createDownloadLink(dataUrl, fileName);
}

export async function downloadSvg(svgMarkup, fileName = "qr-studio.svg") {
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  createDownloadLink(url, fileName);
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const temp = document.createElement("textarea");
  temp.value = text;
  temp.setAttribute("readonly", "true");
  temp.style.position = "fixed";
  temp.style.opacity = "0";
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  temp.remove();
}

export async function shareQr({ title, text, dataUrl }) {
  if (!navigator.share) {
    await copyText(text);
    return { fallback: true };
  }

  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], `${sanitizeFileName(title)}.png`, { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title, text, files: [file] });
      return { shared: true };
    }

    await navigator.share({ title, text });
    return { shared: true };
  } catch {
    await copyText(text);
    return { fallback: true };
  }
}

export function createDownloadName(type, timestamp, extension) {
  const date = new Date(timestamp || Date.now()).toISOString().replace(/[:.]/g, "-");
  return `${sanitizeFileName(`qr-studio-${type}-${date}`)}.${extension}`;
}
