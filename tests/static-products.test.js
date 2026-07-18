import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { products } from '../src/js/data/products.js';

test('每個商品都有可索引的靜態頁與完整社群資料', async () => {
  for (const product of products) {
    const html = await readFile(new URL(`../products/${product.id}.html`, import.meta.url), 'utf8');
    assert.match(html, new RegExp(`<title>${product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}｜暮集選物所</title>`));
    assert.match(html, /property="og:image"/);
    assert.match(html, /application\/ld\+json/);
    assert.match(html, new RegExp(`data-product-id="${product.id}"`));
  }
});

test('Sitemap 包含全部靜態商品網址', async () => {
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  for (const product of products) assert.match(sitemap, new RegExp(`products/${product.id}\\.html`));
});
