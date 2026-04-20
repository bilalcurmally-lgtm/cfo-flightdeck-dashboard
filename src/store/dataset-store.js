const DB_NAME = "cfo-flight-deck";
const DB_VERSION = 1;
const STORE_NAME = "datasets";
const CATALOG_KEY = "__catalog__";
const MAX_DATASETS = 3;

function openDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open IndexedDB."));
  });
}

async function withStore(mode, callback) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
      const result = callback(store);
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction failed."));
      tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted."));
    });
  } finally {
    db.close();
  }
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed."));
  });
}

function datasetId(fileName) {
  return `${Date.now()}-${fileName.replace(/[^a-z0-9._-]+/gi, "-").slice(0, 80)}`;
}

export async function getDatasetCatalog() {
  try {
    const catalog = await withStore("readonly", (store) => requestToPromise(store.get(CATALOG_KEY)));
    return Array.isArray(catalog) ? catalog : [];
  } catch {
    return [];
  }
}

export async function saveDataset(fileName, rows) {
  const catalog = await getDatasetCatalog();
  const id = datasetId(fileName || "dataset.csv");
  const entry = {
    id,
    fileName: fileName || "dataset.csv",
    rowCount: rows.length,
    savedAt: new Date().toISOString()
  };

  const nextCatalog = [entry, ...catalog.filter((item) => item.fileName !== entry.fileName)].slice(0, MAX_DATASETS);
  const keepIds = new Set(nextCatalog.map((item) => item.id));

  await withStore("readwrite", (store) => {
    store.put(rows, id);
    store.put(nextCatalog, CATALOG_KEY);
    catalog.forEach((item) => {
      if (!keepIds.has(item.id)) store.delete(item.id);
    });
  });

  return entry;
}

export async function loadDataset(id) {
  if (!id) return null;
  try {
    return await withStore("readonly", (store) => requestToPromise(store.get(id)));
  } catch {
    return null;
  }
}
