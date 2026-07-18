import { categories, products } from '../data/products.js';
import { initShell } from '../ui/shell.js';
import { renderProductCard } from '../ui/product-card.js';

initShell({ active: 'home' });

const categoryMarks = { books: '本', invitations: '紙', interiors: '間', goods: '器' };
const categoryGrid = document.querySelector('[data-category-grid]');
if (categoryGrid) {
  categoryGrid.innerHTML = categories.map((category) => `
    <a class="category-link" href="products.html?category=${category.id}">
      <span class="category-link__mark" aria-hidden="true">${categoryMarks[category.id]}</span>
      <span><strong>${category.name}</strong><small>${category.note}</small></span>
      <span aria-hidden="true">→</span>
    </a>`).join('');
}

const featured = document.querySelector('[data-featured-products]');
if (featured) featured.innerHTML = products.filter((product) => product.featured).slice(0, 8).map(renderProductCard).join('');
