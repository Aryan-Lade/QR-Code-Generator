let scannerInstance = null;
let scannerActive = false;

function isLikelyUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function stopButtonState(startButton, stopButton, active) {
  if (startButton) {
    startButton.disabled = active;
  }
  if (stopButton) {
    stopButton.disabled = !active;
  }
}

export function initScanner({
  regionId,
  startButton,
  stopButton,
  resultElement,
  onDecoded,
  onStatus,
}) {
  const setStatus = (message, type = "info") => {
    if (typeof onStatus === "function") {
      onStatus(message, type);
    }
  };

  const renderResult = (text) => {
    if (!resultElement) {
      return;
    }

    const linkMarkup = isLikelyUrl(text)
      ? `<a href="${escapeHtml(text)}" target="_blank" rel="noreferrer">${escapeHtml(text)}</a>`
      : `<p>${escapeHtml(text)}</p>`;

    resultElement.innerHTML = `
      <div class="history-meta">
        <span class="meta-label">Decoded Content</span>
        ${linkMarkup}
      </div>
    `;
  };

  async function stopScanner() {
    if (!scannerInstance || !scannerActive) {
      return;
    }

    try {
      await scannerInstance.stop();
    } catch {
      // Ignore stop errors caused by the stream ending while stopping.
    }

    try {
      await scannerInstance.clear();
    } catch {
      // Ignore clear errors for browsers that already released the stream.
    }

    scannerActive = false;
    stopButtonState(startButton, stopButton, false);
    setStatus("Scanner stopped.", "info");
  }

  async function startScanner() {
    if (!window.Html5Qrcode) {
      setStatus("Scanner library failed to load.", "error");
      return;
    }

    if (scannerActive) {
      return;
    }

    scannerInstance = new Html5Qrcode(regionId);
    stopButtonState(startButton, stopButton, true);

    try {
      scannerActive = true;
      await scannerInstance.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1,
        },
        async (decodedText) => {
          await stopScanner();
          renderResult(decodedText);
          if (typeof onDecoded === "function") {
            onDecoded(decodedText);
          }
          setStatus("QR code decoded successfully.", "success");
        },
        () => {
          // Ignore decode noise; successful scans are handled above.
        },
      );

      setStatus("Scanner started. Point your camera at a QR code.", "success");
    } catch (error) {
      scannerActive = false;
      stopButtonState(startButton, stopButton, false);
      setStatus(
        error?.message || "Camera access was denied or unavailable.",
        "error",
      );
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  startButton?.addEventListener("click", startScanner);
  stopButton?.addEventListener("click", stopScanner);

  return {
    startScanner,
    stopScanner,
    renderResult,
    isActive: () => scannerActive,
  };
}
