import { products } from '../data/products.js';
import { filterProducts, sortProducts, paginate } from '../core/catalog.js';
import { initShell } from '../ui/shell.js';
import { renderProductCard } from '../ui/product-card.js';

initShell({ active: 'products' });

const params = new URLSearchParams(location.search);
const form = document.querySelector('[data-filter-form]');
const sort = document.querySelector('[data-sort]');
const resultNode = document.querySelector('[data-product-results]');
const countNode = document.querySelector('[data-results-count]');
const paginationNode = document.querySelector('[data-pagination]');

for (const name of ['query', 'category', 'minPrice', 'maxPrice']) {
  const field = form?.elements.namedItem(name);
  if (field && params.has(name)) field.value = params.get(name);
}
if (sort) sort.value = params.get('sort') ?? 'featured';

function pageUrl(page) {
  const next = new URLSearchParams(params);
  next.set('page', page);
  return `products.html?${next}`;
}

function render() {
  const filters = {
    query: params.get('query') ?? '', category: params.get('category') ?? 'all',
    minPrice: params.get('minPrice') ?? '', maxPrice: params.get('maxPrice') ?? ''
  };
  const filtered = sortProducts(filterProducts(products, filters), params.get('sort') ?? 'featured');
  const page = paginate(filtered, params.get('page') ?? 1, 8);
  countNode.textContent = `找到 ${page.totalItems} 件選物`;
  resultNode.innerHTML = page.items.length
    ? page.items.map(renderProductCard).join('')
    : '<div class="empty-state"><h2>這次沒有找到相符選物</h2><p>試著放寬價格或改用其他關鍵字。</p><a class="button" href="products.html">清除所有條件</a></div>';
  paginationNode.innerHTML = page.totalPages <= 1 ? '' : Array.from({ length: page.totalPages }, (_, index) => {
    const number = index + 1;
    return `<a href="${pageUrl(number)}"${number === page.page ? ' aria-current="page"' : ''} aria-label="第 ${number} 頁">${number}</a>`;
  }).join('');
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const next = new URLSearchParams();
  for (const [key, value] of data) if (String(value).trim() && value !== 'all') next.set(key, value);
  if (sort?.value && sort.value !== 'featured') next.set('sort', sort.value);
  location.href = `products.html${next.size ? `?${next}` : ''}`;
});

sort?.addEventListener('change', () => {
  const next = new URLSearchParams(params);
  sort.value === 'featured' ? next.delete('sort') : next.set('sort', sort.value);
  next.delete('page');
  location.href = `products.html${next.size ? `?${next}` : ''}`;
});

render();
