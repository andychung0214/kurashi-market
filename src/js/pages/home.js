import { categories, products } from '../data/products.js';
import { storefrontConfig } from '../data/storefront.js';
import { escapeHtml } from '../core/html.js';
import { filterProductsByCategories, resolveEnabledCategories } from '../core/storefront.js';
import { initShell } from '../ui/shell.js';
import { renderProductCard } from '../ui/product-card.js';

export function categoryMarkup(items) {
  if (!items.length) {
    return '<div class="empty-state"><h3>目前尚無分類</h3><p>新的生活提案正在整理中，歡迎稍後再來看看。</p></div>';
  }
  return items.map((category) => `
    <a class="category-link" href="products.html?category=${encodeURIComponent(category.id)}">
      <span class="category-link__mark" aria-hidden="true">${escapeHtml(category.mark)}</span>
      <span><strong>${escapeHtml(category.name)}</strong><small>${escapeHtml(category.note)}</small></span>
      <span aria-hidden="true">→</span>
    </a>`).join('');
}

function initHome() {
  initShell({ active: 'home' });
  const enabledCategories = resolveEnabledCategories(categories, storefrontConfig.enabledCategoryIds);
  const visibleProducts = filterProductsByCategories(products, enabledCategories);
  const categoryGrid = document.querySelector('[data-category-grid]');
  if (categoryGrid) categoryGrid.innerHTML = categoryMarkup(enabledCategories);

  const featured = document.querySelector('[data-featured-products]');
  if (featured) {
    const featuredProducts = visibleProducts.filter((product) => product.featured).slice(0, 8);
    featured.innerHTML = featuredProducts.length
      ? featuredProducts.map(renderProductCard).join('')
      : '<div class="empty-state"><h3>本期內容準備中</h3><p>我們正在整理新的商品與服務。</p></div>';
  }
}

if (typeof document !== 'undefined') initHome();
