import { categories } from '../data/products.js';
import { storefrontConfig } from '../data/storefront.js';
import { escapeHtml } from '../core/html.js';
import { resolveEnabledCategories } from '../core/storefront.js';
import { initShell } from '../ui/shell.js';

export function categoryFaqMarkup(items) {
  return items.filter((category) => category.faq?.length).map((category) => `
    <section id="category-${escapeHtml(category.id)}">
      <p class="eyebrow">Category guide</p>
      <h2>${escapeHtml(category.name)}</h2>
      ${category.faq.map(({ question, answer }, index) => `<details${index === 0 ? ' open' : ''}><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join('')}
    </section>`).join('');
}

function initFaq() {
  initShell({ active: 'faq' });
  const enabledCategories = resolveEnabledCategories(categories, storefrontConfig.enabledCategoryIds);
  const categoryNav = document.querySelector('[data-category-faq-nav]');
  const categoryList = document.querySelector('[data-category-faq-list]');
  if (categoryNav) {
    categoryNav.innerHTML = enabledCategories.filter((category) => category.faq?.length)
      .map((category) => `<a href="#category-${escapeHtml(category.id)}">${escapeHtml(category.name)}</a>`).join('');
  }
  if (categoryList) categoryList.innerHTML = categoryFaqMarkup(enabledCategories);
}

if (typeof document !== 'undefined') initFaq();
