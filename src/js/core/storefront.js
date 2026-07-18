export function resolveEnabledCategories(categories, enabledIds, warn = console.warn) {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const seen = new Set();
  return enabledIds.flatMap((id) => {
    if (seen.has(id)) return [];
    seen.add(id);
    const category = byId.get(id);
    if (category) return [category];
    warn(`忽略未知商品分類：${id}`);
    return [];
  });
}

export function filterProductsByCategories(products, enabledCategories) {
  const enabledIds = new Set(enabledCategories.map(({ id }) => id));
  return products.filter((product) => enabledIds.has(product.category));
}
