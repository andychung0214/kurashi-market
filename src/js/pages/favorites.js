import { products } from '../data/products.js';
import { createSafeStorage } from '../core/storage.js';
import { createShopState } from '../core/shop-state.js';
import { initShell } from '../ui/shell.js';
import { renderProductCard } from '../ui/product-card.js';

initShell({ active: 'favorites' });
const state = createShopState(createSafeStorage());
const renderList = (ids, emptyMessage) => {
  const items = ids.map((id) => products.find((product) => product.id === id)).filter(Boolean);
  return items.length ? items.map(renderProductCard).join('') : `<div class="empty-state"><p>${emptyMessage}</p><a class="button" href="products.html">逛逛所有選物</a></div>`;
};
document.querySelector('[data-favorites]').innerHTML = renderList(state.getFavorites(), '還沒有收藏，遇見喜歡的物件時把它留下來。');
document.querySelector('[data-recent]').innerHTML = renderList(state.getRecent(), '最近還沒有看過任何選物。');
