import { initTheme } from "./theme.js";
import {
  DEFAULT_SETTINGS, buildPayload, collectFormValues, getDefaultFieldValues,
  getPreviewSummary, getTypeTitle, renderFields, renderQrCode, validateForm,
} from "./generator.js";
import {
  addHistoryItem, clearHistoryItems, deleteHistoryItem, formatHistoryTimestamp,
  getDownloadCount, getHistoryItems, incrementDownloadCount,
} from "./history.js";
import {
  copyText, createDownloadName, downloadPng, downloadSvg, shareQr,
} from "./download.js";
import { initScanner } from "./scanner.js";
import { getAnalyticsSnapshot, updateAnalyticsView } from "./analytics.js";

const state = {
  currentType: "website",
  currentPayload: "",
  currentSummary: "",
  currentSvg: "",
  currentDataUrl: "",
  currentTimestamp: Date.now(),
  currentLogoDataUrl: "",
  currentSettings: { ...DEFAULT_SETTINGS },
  history: [],
  lastScanText: "",
};

const dom = {};

function cacheDom() {
  dom.loadingOverlay = document.getElementById("loadingOverlay");
  dom.themeToggle = document.getElementById("themeToggle");
  dom.generatorForm = document.getElementById("generatorForm");
  dom.qrType = document.getElementById("qrType");
  dom.dynamicFields = document.getElementById("dynamicFields");
  dom.qrSize = document.getElementById("qrSize");
  dom.qrForeground = document.getElementById("qrForeground");
  dom.qrBackground = document.getElementById("qrBackground");
  dom.qrMargin = document.getElementById("qrMargin");
  dom.qrMarginValue = document.getElementById("qrMarginValue");
  dom.errorCorrection = document.getElementById("errorCorrection");
  dom.logoUpload = document.getElementById("logoUpload");
  dom.formErrors = document.getElementById("formErrors");
  dom.generateBtn = document.getElementById("generateBtn");
  dom.resetBtn = document.getElementById("resetBtn");
  dom.previewStage = document.getElementById("previewStage");
  dom.previewPlaceholder = document.getElementById("previewPlaceholder");
  dom.previewLoading = document.getElementById("previewLoading");
  dom.qrCanvas = document.getElementById("qrCanvas");
  dom.previewType = document.getElementById("previewType");
  dom.previewContent = document.getElementById("previewContent");
  dom.downloadPngBtn = document.getElementById("downloadPngBtn");
  dom.downloadSvgBtn = document.getElementById("downloadSvgBtn");
  dom.copyContentBtn = document.getElementById("copyContentBtn");
  dom.shareBtn = document.getElementById("shareBtn");
  dom.historyGrid = document.getElementById("historyGrid");
  dom.clearHistoryBtn = document.getElementById("clearHistoryBtn");
  dom.startScanBtn = document.getElementById("startScanBtn");
  dom.stopScanBtn = document.getElementById("stopScanBtn");
  dom.scanResult = document.getElementById("scanResult");
  dom.openLinkBtn = document.getElementById("openLinkBtn");
  dom.copyResultBtn = document.getElementById("copyResultBtn");
  dom.statGenerated = document.getElementById("statGenerated");
  dom.statDownloads = document.getElementById("statDownloads");
  dom.statTopType = document.getElementById("statTopType");
  dom.statHistory = document.getElementById("statHistory");
  dom.copyrightYear = document.getElementById("copyrightYear");
}

function showToast(title, message, variant = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const icon =
    variant === "error" ? "fa-triangle-exclamation"
    : variant === "success" ? "fa-circle-check"
    : "fa-circle-info";

  const toast = document.createElement("div");
  toast.className = `toast ${variant === "error" ? "is-error" : "is-success"}`;
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <div>
      <span class="toast-title">${escapeHtml(title)}</span>
      <p class="toast-body">${escapeHtml(message)}</p>
    </div>
    <button class="icon-btn" type="button" aria-label="Dismiss notification"><i class="fa-solid fa-xmark"></i></button>
  `;

  container.appendChild(toast);
  toast.querySelector("button")?.addEventListener("click", () => toast.remove());

  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(12px) scale(0.98)";
    window.setTimeout(() => toast.remove(), 220);
  }, 3200);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setLoadingVisible(visible) {
  dom.previewLoading?.classList.toggle("is-visible", visible);
}

function setPreviewPlaceholderVisible(visible) {
  dom.previewPlaceholder?.classList.toggle("is-hidden", !visible);
  if (dom.previewPlaceholder) dom.previewPlaceholder.style.opacity = visible ? "1" : "0";
  if (dom.qrCanvas) dom.qrCanvas.style.opacity = visible ? "0" : "1";
}

function updateMarginLabel() {
  if (dom.qrMarginValue && dom.qrMargin) dom.qrMarginValue.textContent = dom.qrMargin.value;
}

function readLogoAsDataUrl(file) {
  if (!file) return Promise.resolve("");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read logo file."));
    reader.readAsDataURL(file);
  });
}

function collectSettings() {
  return {
    size: Number(dom.qrSize.value),
    foreground: dom.qrForeground.value,
    background: dom.qrBackground.value,
    margin: Number(dom.qrMargin.value),
    errorCorrectionLevel: dom.errorCorrection.value,
  };
}

function getFormState() {
  const type = dom.qrType.value;
  const data = collectFormValues(type, dom.generatorForm);
  return { type, data };
}

function renderTypeFields(type, values) {
  renderFields(type, dom.dynamicFields, values);
}

function renderHistory(items) {
  state.history = items;
  if (!items.length) {
    dom.historyGrid.innerHTML = `
      <div class="history-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
        <strong style="font-family: var(--font-heading); font-size: 1.2rem; display:block; margin-bottom:8px;">No saved QR codes yet.</strong>
        <p style="margin: 0; color: var(--text-soft);">Generated codes will appear here automatically and persist in your browser.</p>
      </div>
    `;
    return;
  }

  dom.historyGrid.innerHTML = items.map((item) => createHistoryCard(item)).join("");
}

function createHistoryCard(item) {
  return `
    <article class="history-card" data-id="${item.id}">
      <div class="history-preview">
        <img src="${item.previewDataUrl}" alt="Preview for ${escapeHtml(item.typeTitle)}" />
      </div>
      <div class="history-meta">
        <span class="meta-label">${escapeHtml(item.typeTitle)}</span>
        <h3>${escapeHtml(item.summaryTitle)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <small>${escapeHtml(formatHistoryTimestamp(item.timestamp))}</small>
      </div>
      <div class="history-actions">
        <button class="btn btn-secondary ripple" data-action="regenerate" type="button">Regenerate</button>
        <button class="btn btn-ghost ripple" data-action="download" type="button">Download</button>
        <button class="btn btn-ghost ripple" data-action="delete" type="button">Delete</button>
      </div>
    </article>
  `;
}

function updateAnalytics() {
  const snapshot = getAnalyticsSnapshot(state.history, getDownloadCount());
  updateAnalyticsView(
    { generatedEl: dom.statGenerated, downloadsEl: dom.statDownloads, topTypeEl: dom.statTopType, historyEl: dom.statHistory },
    snapshot,
  );
}

function updatePreviewMeta(type, summary) {
  if (dom.previewType) dom.previewType.textContent = getTypeTitle(type);
  if (dom.previewContent) dom.previewContent.textContent = summary || "—";
}

async function renderPreview({ showSuccess = false } = {}) {
  const { type, data } = getFormState();
  state.currentType = type;

  const validation = validateForm(type, data);
  if (!validation.valid) {
    if (showSuccess) renderErrors(validation.errors);
    return false;
  }

  renderErrors([]);

  const payload = buildPayload(type, data);
  const settings = collectSettings();

  state.currentPayload = payload;
  state.currentSummary = getPreviewSummary(type, data);
  state.currentSettings = settings;
  state.currentTimestamp = Date.now();

  setLoadingVisible(true);
  setPreviewPlaceholderVisible(false);

  try {
    const { dataUrl, svg } = await renderQrCode({
      canvas: dom.qrCanvas,
      payload,
      size: settings.size,
      margin: settings.margin,
      errorCorrectionLevel: settings.errorCorrectionLevel,
      foreground: settings.foreground,
      background: settings.background,
      logoDataUrl: state.currentLogoDataUrl,
    });

    state.currentDataUrl = dataUrl;
    state.currentSvg = svg;

    dom.previewStage?.classList.remove("is-generated");
    window.requestAnimationFrame(() => dom.previewStage?.classList.add("is-generated"));
    setPreviewPlaceholderVisible(false);
    updatePreviewMeta(type, state.currentSummary);

    if (showSuccess) showToast("QR generated", "Your QR code is ready for download and sharing.");

    return true;
  } catch (error) {
    showToast("Generation failed", error?.message || "Unable to generate the QR code.", "error");
    setPreviewPlaceholderVisible(true);
    return false;
  } finally {
    setLoadingVisible(false);
  }
}

function renderErrors(errors) {
  if (!dom.formErrors) return;
  if (!errors.length) { dom.formErrors.innerHTML = ""; return; }
  dom.formErrors.innerHTML = errors.map((e) => `<div class="form-error">${escapeHtml(e)}</div>`).join("");
}

function populateFormFromRecord(record) {
  dom.qrType.value = record.type;
  renderTypeFields(record.type, record.data);
  Object.entries(record.data || {}).forEach(([name, value]) => {
    const field = dom.generatorForm.elements.namedItem(name);
    if (field) field.value = value;
  });
  Object.entries(record.settings || {}).forEach(([key, value]) => {
    if (dom[key]) dom[key].value = value;
  });
  updateMarginLabel();
  state.currentLogoDataUrl = record.logoDataUrl || "";
  if (dom.logoUpload) dom.logoUpload.value = "";
}

async function generateAndSave({ showSuccess = true } = {}) {
  const { type, data } = getFormState();
  const validation = validateForm(type, data);
  if (!validation.valid) {
    renderErrors(validation.errors);
    showToast("Check your input", validation.errors[0], "error");
    return false;
  }

  renderErrors([]);
  const payload = buildPayload(type, data);
  const settings = collectSettings();
  const summary = getPreviewSummary(type, data);
  const timestamp = Date.now();

  setLoadingVisible(true);
  setPreviewPlaceholderVisible(false);

  try {
    const { dataUrl, svg } = await renderQrCode({
      canvas: dom.qrCanvas,
      payload,
      size: settings.size,
      margin: settings.margin,
      errorCorrectionLevel: settings.errorCorrectionLevel,
      foreground: settings.foreground,
      background: settings.background,
      logoDataUrl: state.currentLogoDataUrl,
    });

    const record = {
      id: crypto.randomUUID(),
      type,
      typeTitle: getTypeTitle(type),
      summaryTitle: summary,
      summary: payload,
      payload,
      data,
      settings,
      previewDataUrl: dataUrl,
      svgMarkup: svg,
      timestamp,
      logoDataUrl: state.currentLogoDataUrl,
    };

    addHistoryItem(record);
    state.history = getHistoryItems();
    renderHistory(state.history);
    updateAnalytics();
    state.currentType = type;
    state.currentPayload = payload;
    state.currentSummary = summary;
    state.currentDataUrl = dataUrl;
    state.currentSvg = svg;
    state.currentTimestamp = timestamp;
    updatePreviewMeta(type, summary);
    dom.previewStage?.classList.remove("is-generated");
    window.requestAnimationFrame(() => dom.previewStage?.classList.add("is-generated"));
    showToast("QR generated", "Saved to history and ready to use.");
    return true;
  } catch (error) {
    showToast("Generation failed", error?.message || "Could not create the QR code.", "error");
    return false;
  } finally {
    setLoadingVisible(false);
  }
}

function resetForm() {
  dom.qrType.value = "website";
  dom.qrSize.value = DEFAULT_SETTINGS.size;
  dom.qrForeground.value = DEFAULT_SETTINGS.foreground;
  dom.qrBackground.value = DEFAULT_SETTINGS.background;
  dom.qrMargin.value = DEFAULT_SETTINGS.margin;
  dom.errorCorrection.value = DEFAULT_SETTINGS.errorCorrectionLevel;
  dom.logoUpload.value = "";
  state.currentLogoDataUrl = "";
  updateMarginLabel();
  renderTypeFields("website", getDefaultFieldValues("website"));
  renderErrors([]);
  setPreviewPlaceholderVisible(true);
  dom.previewStage?.classList.remove("is-generated");
  updatePreviewMeta("website", "—");
  dom.previewContent.textContent = "—";
  showToast("Form cleared", "All input fields have been reset.");
}

async function handleGenerateSubmit(event) {
  event.preventDefault();
  await generateAndSave();
}

function bindInputEvents() {
  dom.qrType.addEventListener("change", () => {
    renderTypeFields(dom.qrType.value, getDefaultFieldValues(dom.qrType.value));
    renderErrors([]);
    scheduleLivePreview();
  });

  const previewFields = [dom.generatorForm, dom.qrSize, dom.qrForeground, dom.qrBackground, dom.qrMargin, dom.errorCorrection];
  previewFields.forEach((field) => {
    field.addEventListener("input", () => { updateMarginLabel(); scheduleLivePreview(); });
    field.addEventListener("change", () => { updateMarginLabel(); scheduleLivePreview(); });
  });

  dom.logoUpload.addEventListener("change", async () => {
    const [file] = dom.logoUpload.files || [];
    if (!file) { state.currentLogoDataUrl = ""; scheduleLivePreview(); return; }
    try {
      state.currentLogoDataUrl = await readLogoAsDataUrl(file);
      showToast("Logo uploaded", "The uploaded logo will appear in the QR center.");
      scheduleLivePreview();
    } catch (error) {
      showToast("Logo upload failed", error?.message || "Unable to read the selected file.", "error");
    }
  });
}

let livePreviewTimer = 0;
function scheduleLivePreview() {
  window.clearTimeout(livePreviewTimer);
  livePreviewTimer = window.setTimeout(() => renderPreview({ showSuccess: false }), 160);
}

function bindHistoryActions() {
  dom.historyGrid.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const card = button.closest("[data-id]");
    if (!card) return;
    const record = state.history.find((item) => item.id === card.dataset.id);
    if (!record) return;

    const action = button.dataset.action;
    if (action === "regenerate") {
      populateFormFromRecord(record);
      await generateAndSave({ showSuccess: true });
      showToast("Regenerated", "The selected history item has been recreated.");
    }
    if (action === "download") {
      await downloadPng(record.previewDataUrl, createDownloadName(record.type, record.timestamp, "png"));
      incrementDownloadCount();
      updateAnalytics();
      showToast("Downloaded", "Your history QR has been saved as PNG.");
    }
    if (action === "delete") {
      const remaining = deleteHistoryItem(record.id);
      state.history = remaining;
      renderHistory(remaining);
      updateAnalytics();
      showToast("Deleted", "The QR code was removed from history.");
    }
  });
}

function bindActionButtons(scannerApi) {
  dom.generatorForm.addEventListener("submit", handleGenerateSubmit);
  dom.resetBtn.addEventListener("click", resetForm);

  dom.downloadPngBtn.addEventListener("click", async () => {
    if (!state.currentDataUrl) { showToast("Nothing to download", "Generate a QR code first.", "error"); return; }
    await downloadPng(state.currentDataUrl, createDownloadName(state.currentType, state.currentTimestamp, "png"));
    incrementDownloadCount();
    updateAnalytics();
    showToast("Downloaded", "PNG download started.");
  });

  dom.downloadSvgBtn.addEventListener("click", async () => {
    if (!state.currentSvg) { showToast("Nothing to download", "Generate a QR code first.", "error"); return; }
    await downloadSvg(state.currentSvg, createDownloadName(state.currentType, state.currentTimestamp, "svg"));
    incrementDownloadCount();
    updateAnalytics();
    showToast("Downloaded", "SVG download started.");
  });

  dom.copyContentBtn.addEventListener("click", async () => {
    if (!state.currentPayload) { showToast("Nothing to copy", "Generate a QR code first.", "error"); return; }
    await copyText(state.currentPayload);
    showToast("Copied", "QR content copied to clipboard.");
  });

  dom.shareBtn.addEventListener("click", async () => {
    if (!state.currentPayload || !state.currentDataUrl) { showToast("Nothing to share", "Generate a QR code first.", "error"); return; }
    await shareQr({ title: "QR Studio QR Code", text: state.currentPayload, dataUrl: state.currentDataUrl });
    showToast("Shared", "Share flow has been opened or copied.");
  });

  dom.clearHistoryBtn.addEventListener("click", () => {
    clearHistoryItems();
    state.history = [];
    renderHistory([]);
    updateAnalytics();
    showToast("History cleared", "All stored QR codes have been removed.");
  });

  dom.openLinkBtn.addEventListener("click", () => {
    if (!state.lastScanText) return;
    window.open(state.lastScanText, "_blank", "noopener,noreferrer");
  });

  dom.copyResultBtn.addEventListener("click", async () => {
    if (!state.lastScanText) return;
    await copyText(state.lastScanText);
    showToast("Copied", "Decoded scan result copied to clipboard.");
  });

  document.addEventListener("keydown", async (event) => {
    if (event.defaultPrevented) return;
    const activeTag = document.activeElement?.tagName?.toLowerCase();
    const inTextArea = activeTag === "textarea";

    if (event.key === "Escape") { resetForm(); return; }
    if (event.ctrlKey && event.key.toLowerCase() === "d") { event.preventDefault(); dom.downloadPngBtn.click(); return; }
    if (event.key === "Enter" && !inTextArea && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault();
      await generateAndSave();
    }
  });

  initScanner({
    regionId: "qrScanner",
    startButton: dom.startScanBtn,
    stopButton: dom.stopScanBtn,
    resultElement: dom.scanResult,
    onDecoded: (text) => {
      state.lastScanText = text;
      dom.copyResultBtn.disabled = false;
      dom.openLinkBtn.disabled = !isUrl(text);
    },
    onStatus: (message, type) => {
      if (type === "error") showToast("Scanner error", message, "error");
      else if (message) showToast("Scanner", message, type === "success" ? "success" : "info");
    },
  });
}

function isUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function prepareInitialState() {
  dom.copyrightYear.textContent = String(new Date().getFullYear());
  renderTypeFields("website", getDefaultFieldValues("website"));
  updateMarginLabel();
  setPreviewPlaceholderVisible(true);
  dom.previewContent.textContent = "—";
  dom.previewType.textContent = "Website URL";
  state.history = getHistoryItems();
  renderHistory(state.history);
  updateAnalytics();
}

function bindRippleEffects() {
  document.addEventListener("pointerdown", (event) => {
    const target = event.target.closest(".ripple");
    if (!target) return;
    target.classList.remove("is-rippling");
    void target.offsetWidth;
    target.classList.add("is-rippling");
    window.setTimeout(() => target.classList.remove("is-rippling"), 680);
  });
}

function bindSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function finalizeStartup() {
  window.requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
    dom.loadingOverlay?.classList.add("is-hidden");
  });
}

async function bootstrap() {
  cacheDom();
  initTheme();
  prepareInitialState();
  updateMarginLabel();
  bindRippleEffects();
  bindSmoothScroll();
  bindInputEvents();
  bindHistoryActions();
  bindActionButtons();
  await renderPreview({ showSuccess: false });
  finalizeStartup();
}

bootstrap().catch((error) => {
  console.error(error);
  showToast("App failed to load", error.message || "Unknown startup error", "error");
  finalizeStartup();
});
