import { getHistoryStats } from "./history.js";

function countTypes(items) {
  return items.reduce((accumulator, item) => {
    accumulator[item.type] = (accumulator[item.type] || 0) + 1;
    return accumulator;
  }, {});
}

export function getAnalyticsSnapshot(historyItems = [], downloadCount = 0) {
  const typeCounts = countTypes(historyItems);
  const mostUsedType =
    Object.entries(typeCounts).sort((left, right) => right[1] - left[1])[0]?.[0] || "—";
  const stats = getHistoryStats();

  return {
    totalGenerated: stats.totalGenerated,
    totalDownloads: downloadCount,
    mostUsedType,
    totalHistory: historyItems.length,
  };
}

export function updateAnalyticsView({ generatedEl, downloadsEl, topTypeEl, historyEl }, snapshot) {
  if (generatedEl) generatedEl.textContent = String(snapshot.totalGenerated);
  if (downloadsEl) downloadsEl.textContent = String(snapshot.totalDownloads);
  if (topTypeEl) topTypeEl.textContent = formatTypeName(snapshot.mostUsedType);
  if (historyEl) historyEl.textContent = String(snapshot.totalHistory);
}

export function formatTypeName(type) {
  const map = {
    website: "Website URL",
    text: "Plain Text",
    email: "Email",
    phone: "Phone Number",
    sms: "SMS",
    whatsapp: "WhatsApp",
    wifi: "Wi-Fi",
    vcard: "Contact Card",
  };

  return map[type] || type || "—";
}
