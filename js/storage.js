const memoryStore = new Map();

let cachedStorage = null;
let storageChecked = false;

function createMemoryStorage() {
  return {
    getItem(key) {
      return memoryStore.has(key) ? memoryStore.get(key) : null;
    },
    setItem(key, value) {
      memoryStore.set(key, String(value));
    },
    removeItem(key) {
      memoryStore.delete(key);
    },
    clear() {
      memoryStore.clear();
    },
  };
}

export function getStorage() {
  if (storageChecked) {
    return cachedStorage;
  }

  storageChecked = true;

  if (typeof window === "undefined") {
    cachedStorage = createMemoryStorage();
    return cachedStorage;
  }

  try {
    const storage = window.localStorage;
    const probeKey = "__qrstudio_storage_probe__";
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    cachedStorage = storage;
  } catch {
    cachedStorage = createMemoryStorage();
  }

  return cachedStorage;
}
