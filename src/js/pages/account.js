import { createSafeStorage } from '../core/storage.js';
import { createShopState } from '../core/shop-state.js';
import { initShell } from '../ui/shell.js';
import { escapeHtml } from '../core/html.js';

initShell();
const orders = createShopState(createSafeStorage()).getOrders();
const root = document.querySelector('[data-order-list]');
const methods = { card: '信用卡測試', atm: 'ATM 測試', cvs: '超商代碼測試' };
root.innerHTML = orders.length ? orders.map((order) => `<article class="order-card"><div><p class="eyebrow">${new Date(order.createdAt).toLocaleDateString('zh-TW')}</p><h2>${escapeHtml(order.id)}</h2><p>${order.items.length} 種商品・${methods[order.payment.method]}</p></div><div><strong>NT$${order.totals.total.toLocaleString('zh-TW')}</strong><a class="text-link" href="order-complete.html?id=${encodeURIComponent(order.id)}">查看測試訂單</a></div></article>`).join('') : '<div class="empty-state"><h2>還沒有測試訂單</h2><p>完成一次測試結帳後，訂單會出現在這裡。</p><a class="button" href="products.html">瀏覽所有選物</a></div>';
