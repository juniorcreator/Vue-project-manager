export const applySavedOrder = <T extends { id: string }>(items: T[], storageKey: string): T[] => {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return items;
    const orderIds: string[] = JSON.parse(saved);
    const map = new Map(items.map((item) => [item.id, item]));
    const ordered: T[] = [];
    for (const id of orderIds) {
      const item = map.get(id);
      if (item) {
        ordered.push(item);
        map.delete(id);
      }
    }
    for (const item of map.values()) {
      ordered.push(item);
    }
    return ordered;
  } catch {
    return items;
  }
};
