import { getStorage } from "./storage.js";

const HISTORY_KEY = "qrstudio-history";
const DOWNLOADS_KEY = "qrstudio-downloads";
const GENERATED_KEY = "qrstudio-generated";
const HISTORY_LIMIT = 80;

function readJson(key, fallback) {
  try {
    const stored = getStorage().getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  getStorage().setItem(key, JSON.stringify(value));
}

export function getHistoryItems() {
  return readJson(HISTORY_KEY, []);
}

export function saveHistoryItems(items) {
  writeJson(HISTORY_KEY, items.slice(0, HISTORY_LIMIT));
}

export function addHistoryItem(record) {
  const items = getHistoryItems();
  items.unshift(record);
  saveHistoryItems(items);
  incrementGeneratedCount();
  return items;
}

export function deleteHistoryItem(id) {
  const items = getHistoryItems().filter((item) => item.id !== id);
  saveHistoryItems(items);
  return items;
}

export function clearHistoryItems() {
  saveHistoryItems([]);
  return [];
}

export function incrementDownloadCount() {
  const current = getDownloadCount();
  const next = current + 1;
  getStorage().setItem(DOWNLOADS_KEY, String(next));
  return next;
}

export function getDownloadCount() {
  return Number(getStorage().getItem(DOWNLOADS_KEY) || 0);
}

export function getGeneratedCount() {
  return Number(getStorage().getItem(GENERATED_KEY) || 0);
}

export function setGeneratedCount(value) {
  getStorage().setItem(GENERATED_KEY, String(value));
}

export function incrementGeneratedCount() {
  const next = getGeneratedCount() + 1;
  setGeneratedCount(next);
  return next;
}

export function getHistoryStats() {
  const items = getHistoryItems();
  const typeCounts = items.reduce((accumulator, item) => {
    accumulator[item.type] = (accumulator[item.type] || 0) + 1;
    return accumulator;
  }, {});

  const mostUsedType =
    Object.entries(typeCounts).sort((left, right) => right[1] - left[1])[0]?.[0] || "—";

  return {
    totalHistory: items.length,
    totalGenerated: getGeneratedCount() || items.length,
    totalDownloads: getDownloadCount(),
    mostUsedType,
  };
}

export function formatHistoryTimestamp(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}
