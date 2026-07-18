import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { categories, products } from '../src/js/data/products.js';
import { storefrontConfig } from '../src/js/data/storefront.js';
import { filterProductsByCategories, resolveEnabledCategories } from '../src/js/core/storefront.js';
import { generateStaticCatalog } from '../scripts/generate-product-pages.mjs';

const enabledCategories = resolveEnabledCategories(categories, storefrontConfig.enabledCategoryIds);
const visibleProducts = filterProductsByCategories(products, enabledCategories);

test('每個商品都有可索引的靜態頁與完整社群資料', async () => {
  for (const product of visibleProducts) {
    const html = await readFile(new URL(`../products/${product.id}.html`, import.meta.url), 'utf8');
    const escapedName = product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(html, new RegExp(`<title>${escapedName}｜安暮恆生活</title>`));
    assert.match(html, /property="og:title" content="[^"]+｜安暮恆生活"/);
    assert.match(html, /property="og:image"/);
    assert.match(html, /application\/ld\+json/);
    assert.match(html, /"brand":\{"@type":"Brand","name":"AMUHARU"\}/);
    assert.match(html, new RegExp(`data-product-id="${product.id}"`));
  }
});

test('首頁 Hero 圖片提供本機失敗預留圖', async () => {
  const home = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(home, /class="hero__media"[\s\S]+onerror="this\.onerror=null;this\.src='src\/assets\/placeholder-product\.svg'"/);
});

test('Sitemap 只包含目前可見商品網址', async () => {
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  for (const product of visibleProducts) assert.match(sitemap, new RegExp(`products/${product.id}\\.html`));
});

test('靜態產生器只保留啟用分類商品並清除舊頁', async (context) => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'amuharu-static-'));
  context.after(() => rm(temporaryRoot, { recursive: true, force: true }));
  const productDirectory = join(temporaryRoot, 'products');
  const sitemapPath = join(temporaryRoot, 'sitemap.xml');
  const categoryData = [{ id: 'one', name: '一' }, { id: 'two', name: '二' }];
  const productData = [
    { id: 'one-item', category: 'one', kind: 'product', name: '商品一', summary: '摘要一', images: ['one.jpg'], price: 100, stock: 1 },
    { id: 'two-item', category: 'two', kind: 'product', name: '商品二', summary: '摘要二', images: ['two.jpg'], price: 200, stock: 1 }
  ];

  await generateStaticCatalog({ categoryData, productData, enabledCategoryIds: ['one'], productDirectory, sitemapPath, siteUrl: 'https://example.com' });
  assert.deepEqual(await readdir(productDirectory), ['one-item.html']);
  const firstSitemap = await readFile(sitemapPath, 'utf8');
  assert.match(firstSitemap, /one-item\.html/);
  assert.doesNotMatch(firstSitemap, /two-item\.html/);

  await generateStaticCatalog({ categoryData, productData, enabledCategoryIds: [], productDirectory, sitemapPath, siteUrl: 'https://example.com' });
  assert.deepEqual(await readdir(productDirectory), []);
  assert.doesNotMatch(await readFile(sitemapPath, 'utf8'), /products\//);
});
