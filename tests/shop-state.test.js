import test from 'node:test';
import assert from 'node:assert/strict';
import { createSafeStorage } from '../src/js/core/storage.js';
import { createShopState } from '../src/js/core/shop-state.js';
import { calculateCart } from '../src/js/core/cart.js';

const blockedStorage = {
  getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); }
};
const product = { id: 'book-1', name: '山之書', price: 600, stock: 2, images: ['book.jpg'], kind: 'product' };

test('加入同規格商品會合併且不超過庫存', () => {
  const state = createShopState(createSafeStorage(blockedStorage), () => {});
  state.addToCart(product, 1, '預設');
  state.addToCart(product, 2, '預設');
  assert.equal(state.getCart()[0].quantity, 2);
});

test('購物車可更新數量與移除商品', () => {
  const state = createShopState(createSafeStorage(blockedStorage), () => {});
  state.addToCart(product, 1, '預設');
  state.updateQuantity('book-1', '預設', 2, 2);
  assert.equal(state.getCart()[0].quantity, 2);
  state.removeFromCart('book-1', '預設');
  assert.deepEqual(state.getCart(), []);
});

test('收藏切換會加入再移除識別碼', () => {
  const state = createShopState(createSafeStorage(blockedStorage), () => {});
  assert.deepEqual(state.toggleFavorite('book-1'), ['book-1']);
  assert.deepEqual(state.toggleFavorite('book-1'), []);
});

test('最近瀏覽去除重複並只保留八筆', () => {
  const state = createShopState(createSafeStorage(blockedStorage), () => {});
  for (let index = 0; index < 10; index += 1) state.addRecent(`item-${index}`);
  state.addRecent('item-4');
  assert.equal(state.getRecent().length, 8);
  assert.equal(state.getRecent()[0], 'item-4');
});

test('完成結帳後可保存訂單並清空購物車', () => {
  const state = createShopState(createSafeStorage(blockedStorage), () => {});
  state.addToCart(product, 1, '預設');
  state.saveOrder({
    id: 'KM-TEST', createdAt: new Date().toISOString(), status: '測試訂單', items: [], totals: { total: 700 },
    payment: { method: 'atm', reference: 'TEST-ATM', isSimulation: true }
  });
  state.clearCart();
  assert.equal(state.getOrders()[0].id, 'KM-TEST');
  assert.deepEqual(state.getCart(), []);
});

test('優惠碼跨頁保存在共用狀態', () => {
  const state = createShopState(createSafeStorage(blockedStorage), () => {});
  state.addToCart(product, 2, '預設');
  state.setCoupon(' kurashi100 ');
  assert.equal(state.getCoupon(), 'KURASHI100');
  assert.equal(calculateCart(state.getCart(), { coupon: state.getCoupon() }).total, 1200);
});

test('損壞的持久資料會被安全丟棄', () => {
  const malformedStorage = createSafeStorage({
    getItem(key) {
      if (key === 'kurashi.cart') return JSON.stringify({ not: 'an array' });
      if (key === 'kurashi.orders') return JSON.stringify([{ id: '<img onerror=alert(1)>', totals: null }]);
      return null;
    },
    setItem() {}, removeItem() {}
  });
  const state = createShopState(malformedStorage, () => {});
  assert.deepEqual(state.getCart(), []);
  assert.deepEqual(state.getOrders(), []);
});
