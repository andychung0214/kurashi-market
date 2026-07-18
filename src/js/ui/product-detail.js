import { escapeHtml } from '../core/html.js';

export function renderProductBreadcrumb(product, categoryName) {
  return `<nav class="breadcrumbs" aria-label="麵包屑"><a href="index.html">首頁</a><span>/</span><a href="products.html?category=${encodeURIComponent(product.category)}">${escapeHtml(categoryName)}</a><span>/</span><span aria-current="page">${escapeHtml(product.name)}</span></nav>`;
}
