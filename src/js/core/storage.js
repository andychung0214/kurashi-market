export function createSafeStorage(storage = globalThis.localStorage) {
  const memory = new Map();

  return {
    get(key, fallback) {
      if (memory.has(key)) return memory.get(key);
      try {
        const value = storage?.getItem(key);
        return value === null || value === undefined ? fallback : JSON.parse(value);
      } catch {
        return memory.has(key) ? memory.get(key) : fallback;
      }
    },
    set(key, value) {
      memory.set(key, value);
      try {
        if (!storage?.setItem) return false;
        storage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      memory.delete(key);
      try {
        storage?.removeItem(key);
      } catch {
        // 瀏覽器拒絕存取時，記憶體內狀態仍可正常移除。
      }
    }
  };
}
