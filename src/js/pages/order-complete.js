import { createSafeStorage } from '../core/storage.js';
import { createShopState } from '../core/shop-state.js';
import { initShell } from '../ui/shell.js';
import { escapeHtml } from '../core/html.js';

initShell();
const state = createShopState(createSafeStorage());
const id = new URLSearchParams(location.search).get('id');
const order = state.getOrders().find((item) => item.id === id);
const root = document.querySelector('[data-order-result]');
const methodName = { card: '信用卡', atm: 'ATM', cvs: '超商代碼' };
const money = (value) => `NT$${value.toLocaleString('zh-TW')}`;

root.innerHTML = order ? `<section class="order-complete section">
  <span class="completion-mark" aria-hidden="true">済</span><p class="eyebrow">Simulation complete</p><h1>測試訂單已建立</h1>
  <div class="simulation-banner"><strong>未產生真實交易</strong><p>這筆資料只保存在你的瀏覽器，沒有送往綠界、銀行或超商。</p></div>
  <dl class="receipt"><div><dt>測試訂單編號</dt><dd>${escapeHtml(order.id)}</dd></div><div><dt>付款方式</dt><dd>${methodName[order.payment.method]}</dd></div><div><dt>測試參考碼</dt><dd>${escapeHtml(order.payment.reference)}</dd></div>${order.payment.method === 'atm' ? `<div><dt>測試銀行代碼</dt><dd>${escapeHtml(order.payment.bankCode)}</dd></div><div><dt>測試帳號</dt><dd>${escapeHtml(order.payment.account)}</dd></div>` : ''}${order.payment.method === 'cvs' ? `<div><dt>測試繳費代碼</dt><dd>${escapeHtml(order.payment.paymentCode)}</dd></div>` : ''}${order.payment.method !== 'card' ? `<div><dt>測試期限</dt><dd>${new Date(order.payment.expiresAt).toLocaleString('zh-TW')}</dd></div>` : ''}<div><dt>測試金額</dt><dd>${money(order.totals.total)}</dd></div><div><dt>狀態</dt><dd>${escapeHtml(order.status)}</dd></div></dl>
  <div class="button-row"><a class="button" href="account.html">查看本機訂單</a><a class="button button--ghost" href="products.html">繼續逛逛</a></div>
</section>` : '<section class="empty-state section"><h1>找不到這筆測試訂單</h1><p>訂單可能在另一台裝置，或瀏覽器資料已被清除。</p><a class="button" href="products.html">回到所有選物</a></section>';
