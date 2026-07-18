import test from 'node:test';
import assert from 'node:assert/strict';
import { filterProducts, sortProducts, paginate } from '../src/js/core/catalog.js';
import { products } from '../src/js/data/products.js';

test('商品可依關鍵字與分類篩選', () => {
  const result = filterProducts(products, { query: '山', category: 'books' });
  assert.ok(result.length > 0);
  assert.ok(result.every((item) => item.category === 'books'));
});

test('商品可依價格區間篩選且服務案例保留', () => {
  const goods = filterProducts(products, { category: 'goods', minPrice: 600, maxPrice: 800 });
  assert.ok(goods.every((item) => item.price >= 600 && item.price <= 800));
  const services = filterProducts(products, { category: 'interiors' });
  assert.ok(services.every((item) => item.kind === 'service'));
});

test('價格排序不修改原始陣列', () => {
  const input = [{ price: 30 }, { price: 10 }, { price: 20 }];
  const sorted = sortProducts(input, 'price-asc');
  assert.deepEqual(sorted.map((item) => item.price), [10, 20, 30]);
  assert.deepEqual(input.map((item) => item.price), [30, 10, 20]);
});

test('分頁限制頁碼並回傳頁數資訊', () => {
  const result = paginate([1, 2, 3, 4, 5], 9, 2);
  assert.deepEqual(result, { items: [5], page: 3, pageSize: 2, totalItems: 5, totalPages: 3 });
});
