import test from 'node:test';
import assert from 'node:assert/strict';
import { addCartItem, updateCartQuantity, removeCartItem, calculateCart } from '../src/js/core/cart.js';

const product = { id: 'book-1', name: '山之書', price: 600, stock: 2, images: ['book.jpg'] };

test('購物車合併相同規格並限制庫存', () => {
  const once = addCartItem([], product, 1, '預設');
  const twice = addCartItem(once, product, 9, '預設');
  assert.equal(twice.length, 1);
  assert.equal(twice[0].quantity, 2);
});

test('不同規格分開保存', () => {
  const first = addCartItem([], product, 1, '白色');
  const second = addCartItem(first, product, 1, '藍色');
  assert.equal(second.length, 2);
});

test('更新數量限制庫存，零以下移除商品', () => {
  const items = addCartItem([], product, 1, '預設');
  assert.equal(updateCartQuantity(items, 'book-1', '預設', 8, 2)[0].quantity, 2);
  assert.deepEqual(updateCartQuantity(items, 'book-1', '預設', 0, 2), []);
  assert.deepEqual(removeCartItem(items, 'book-1', '預設'), []);
});

test('購物車正確計算免運門檻與折扣', () => {
  const items = addCartItem([], product, 2, '預設');
  assert.deepEqual(calculateCart(items, { coupon: 'kurashi100' }), {
    subtotal: 1200,
    discount: 100,
    shipping: 100,
    total: 1200,
    remainingForFreeShipping: 800
  });
});

test('空購物車不收取運費', () => {
  assert.equal(calculateCart([]).total, 0);
  assert.equal(calculateCart([]).shipping, 0);
});

test('客製商品強制最低訂購量', () => {
  const invitation = { ...product, id: 'invite-1', stock: 500, minimumQuantity: 50 };
  const items = addCartItem([], invitation, 1, '月白');
  assert.equal(items[0].quantity, 50);
  assert.equal(items[0].minimumQuantity, 50);
  assert.equal(updateCartQuantity(items, 'invite-1', '月白', 2, 500, 50)[0].quantity, 50);
});
