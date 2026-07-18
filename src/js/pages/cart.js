import { calculateCart } from '../core/cart.js';
import { createSafeStorage } from '../core/storage.js';
import { createShopState } from '../core/shop-state.js';
import { initShell } from '../ui/shell.js';

initShell();
const state = createShopState(createSafeStorage());
const itemsNode = document.querySelector('[data-cart-items]');
const summaryNode = document.querySelector('[data-cart-summary]');
let coupon = '';
const money = (value) => `NT$${value.toLocaleString('zh-TW')}`;

function render() {
  const items = state.getCart();
  const totals = calculateCart(items, { coupon });
  itemsNode.innerHTML = items.length ? items.map((item) => `
    <article class="cart-item">
      <img src="${item.image}" alt="${item.name}" width="160" height="200" onerror="this.onerror=null;this.src='src/assets/placeholder-product.svg'">
      <div><h2>${item.name}</h2><p class="muted">規格：${item.variant}</p><p>${money(item.price)}</p>
        <div class="quantity-control"><label for="qty-${item.productId}">數量</label><input id="qty-${item.productId}" data-quantity data-product-id="${item.productId}" data-variant="${item.variant}" data-stock="${item.stock}" type="number" min="1" max="${item.stock}" value="${item.quantity}">
        <button class="text-link" data-remove data-product-id="${item.productId}" data-variant="${item.variant}" type="button">移除</button></div>
      </div><strong>${money(item.price * item.quantity)}</strong>
    </article>`).join('') : '<div class="empty-state"><h2>購物車還是空的</h2><p>從一本書或一件器物開始。</p><a class="button" href="products.html">看看所有選物</a></div>';

  summaryNode.innerHTML = `<h2>金額摘要</h2>
    ${totals.remainingForFreeShipping > 0 && items.length ? `<p class="shipping-note">再選 ${money(totals.remainingForFreeShipping)} 即享免運。</p>` : items.length ? '<p class="shipping-note">已達免運門檻。</p>' : ''}
    <dl class="totals"><div><dt>商品小計</dt><dd>${money(totals.subtotal)}</dd></div><div><dt>優惠折抵</dt><dd>− ${money(totals.discount)}</dd></div><div><dt>運費</dt><dd>${money(totals.shipping)}</dd></div><div class="totals__grand"><dt>合計</dt><dd>${money(totals.total)}</dd></div></dl>
    <form class="coupon-form" data-coupon-form><div class="form-field"><label for="coupon">測試優惠碼</label><input id="coupon" name="coupon" value="${coupon}" placeholder="KURASHI100"></div><button class="button button--ghost" type="submit">套用</button></form>
    ${items.length ? '<a class="button button--ink checkout-button" href="checkout.html">前往測試結帳</a>' : ''}<p class="muted">結帳流程不會產生真實交易。</p>`;

  itemsNode.querySelectorAll('[data-quantity]').forEach((input) => input.addEventListener('change', () => {
    state.updateQuantity(input.dataset.productId, input.dataset.variant, Number(input.value), Number(input.dataset.stock)); render();
  }));
  itemsNode.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => {
    state.removeFromCart(button.dataset.productId, button.dataset.variant); render();
  }));
  summaryNode.querySelector('[data-coupon-form]')?.addEventListener('submit', (event) => {
    event.preventDefault(); coupon = String(new FormData(event.currentTarget).get('coupon') ?? '').trim(); render();
  });
}

render();
