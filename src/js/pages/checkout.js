import { calculateCart } from '../core/cart.js';
import { validateCheckout, createSimulationOrder } from '../core/checkout.js';
import { createSafeStorage } from '../core/storage.js';
import { createShopState } from '../core/shop-state.js';
import { initShell } from '../ui/shell.js';

initShell();
const state = createShopState(createSafeStorage());
const cart = state.getCart();
const root = document.querySelector('[data-checkout-root]');
const form = document.querySelector('[data-checkout-form]');
const summary = document.querySelector('[data-checkout-summary]');
const money = (value) => `NT$${value.toLocaleString('zh-TW')}`;

if (!cart.length) {
  root.innerHTML = '<div class="empty-state"><h2>購物車是空的</h2><p>結帳前先選一件適合日常的物件。</p><a class="button" href="products.html">瀏覽所有選物</a></div>';
} else {
  const totals = calculateCart(cart);
  summary.innerHTML = `<h2>訂單摘要</h2><ul class="summary-items">${cart.map((item) => `<li><span>${item.name} × ${item.quantity}</span><strong>${money(item.price * item.quantity)}</strong></li>`).join('')}</ul><dl class="totals"><div><dt>商品小計</dt><dd>${money(totals.subtotal)}</dd></div><div><dt>運費</dt><dd>${money(totals.shipping)}</dd></div><div class="totals__grand"><dt>測試合計</dt><dd>${money(totals.total)}</dd></div></dl><p class="simulation-note">本頁不會把資料送往綠界或其他金流服務。</p>`;

  function updatePaymentFields() {
    const method = form.elements.paymentMethod.value;
    document.querySelector('[data-card-fields]').hidden = method !== 'card';
  }
  form.elements.paymentMethod.forEach((radio) => radio.addEventListener('change', updatePaymentFields));
  updatePaymentFields();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const submit = document.querySelector('[data-submit-order]');
    if (submit.disabled) return;
    const input = Object.fromEntries(new FormData(form));
    const errors = validateCheckout(input);
    if (!form.elements.simulationConsent.checked) errors.simulationConsent = '請確認了解這是模擬付款';
    document.querySelectorAll('.error-text').forEach((node) => { node.textContent = ''; });
    for (const [field, message] of Object.entries(errors)) {
      const errorNode = document.querySelector(`#error-${field}`);
      if (errorNode) errorNode.textContent = message;
      form.elements[field]?.setAttribute?.('aria-invalid', 'true');
      form.elements[field]?.setAttribute?.('aria-describedby', `error-${field}`);
    }
    const errorSummary = document.querySelector('[data-error-summary]');
    if (Object.keys(errors).length) {
      errorSummary.hidden = false;
      errorSummary.innerHTML = `<strong>請修正 ${Object.keys(errors).length} 個欄位</strong><p>${Object.values(errors)[0]}</p>`;
      errorSummary.focus();
      form.elements[Object.keys(errors)[0]]?.focus?.();
      return;
    }
    errorSummary.hidden = true;
    submit.disabled = true;
    submit.textContent = '正在建立測試訂單…';
    const order = createSimulationOrder(input, cart, totals);
    state.saveOrder(order);
    state.clearCart();
    location.href = `order-complete.html?id=${encodeURIComponent(order.id)}`;
  });
}
