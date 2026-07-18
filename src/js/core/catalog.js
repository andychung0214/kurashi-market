function searchableText(product) {
  return [product.name, product.summary, product.description, ...(product.tags ?? []), ...Object.values(product.details ?? {})]
    .join(' ')
    .toLocaleLowerCase('zh-Hant');
}

export function filterProducts(products, { query = '', category = 'all', minPrice = '', maxPrice = '' } = {}) {
  const needle = query.trim().toLocaleLowerCase('zh-Hant');
  const minimum = minPrice === '' ? Number.NEGATIVE_INFINITY : Number(minPrice);
  const maximum = maxPrice === '' ? Number.POSITIVE_INFINITY : Number(maxPrice);

  return products.filter((product) => {
    const categoryMatches = category === 'all' || !category || product.category === category;
    const queryMatches = !needle || searchableText(product).includes(needle);
    const priceMatches = product.kind === 'service' || (product.price >= minimum && product.price <= maximum);
    return categoryMatches && queryMatches && priceMatches;
  });
}

export function sortProducts(products, sort = 'featured') {
  const next = [...products];
  const compare = {
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name, 'zh-Hant'),
    featured: (a, b) => Number(b.featured) - Number(a.featured)
  }[sort] ?? ((a, b) => Number(b.featured) - Number(a.featured));
  return next.sort(compare);
}

export function paginate(items, page = 1, pageSize = 8) {
  const safeSize = Math.max(1, Number(pageSize) || 8);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));
  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const start = (safePage - 1) * safeSize;
  return { items: items.slice(start, start + safeSize), page: safePage, pageSize: safeSize, totalItems, totalPages };
}
