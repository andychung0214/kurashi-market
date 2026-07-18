import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveEnabledCategories, filterProductsByCategories } from '../src/js/core/storefront.js';

const categories = Array.from({ length: 8 }, (_, index) => ({
  id: `category-${index + 1}`,
  name: `分類 ${index + 1}`
}));

for (const count of [2, 4, 8]) {
  test(`可依設定解析 ${count} 個分類且保留順序`, () => {
    const ids = categories.slice(0, count).map(({ id }) => id).reverse();
    assert.deepEqual(resolveEnabledCategories(categories, ids).map(({ id }) => id), ids);
  });
}

test('未知分類會被忽略並留下可讀警告', () => {
  const warnings = [];
  const result = resolveEnabledCategories(categories, ['category-2', 'missing'], (message) => warnings.push(message));
  assert.deepEqual(result.map(({ id }) => id), ['category-2']);
  assert.match(warnings[0], /missing/);
});

test('空設定不會擅自恢復全部分類', () => {
  assert.deepEqual(resolveEnabledCategories(categories, []), []);
});

test('商品只保留啟用分類', () => {
  const products = [{ id: 'a', category: 'category-1' }, { id: 'b', category: 'category-2' }];
  assert.deepEqual(filterProductsByCategories(products, [categories[1]]).map(({ id }) => id), ['b']);
});
