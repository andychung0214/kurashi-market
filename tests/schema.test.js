import test from 'node:test';
import assert from 'node:assert/strict';
import { createProductSchema } from '../src/js/core/schema.js';

test('商品結構化資料包含 AMUHARU 品牌', () => {
  const schema = createProductSchema(
    { kind: 'product', name: '商品', summary: '摘要', images: ['item.jpg'], price: 100, stock: 1 },
    'https://example.com/item.html',
    { englishName: 'AMUHARU', chineseName: '安暮恆生活' }
  );
  assert.deepEqual(schema.brand, { '@type': 'Brand', name: 'AMUHARU' });
  assert.equal(schema.offers.url, 'https://example.com/item.html');
});
