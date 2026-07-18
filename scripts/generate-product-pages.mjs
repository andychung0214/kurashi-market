import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createProductSchema } from '../src/js/core/schema.js';
import { filterProductsByCategories, resolveEnabledCategories } from '../src/js/core/storefront.js';
import { categories, products } from '../src/js/data/products.js';
import { storefrontConfig } from '../src/js/data/storefront.js';

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[character]);

function productHtml(product, siteUrl, brand) {
  const url = `${siteUrl}/products/${product.id}.html`;
  const schema = JSON.stringify(createProductSchema(product, url, brand)).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="zh-Hant" data-theme="forest"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="../">
  <title>${escapeHtml(product.name)}｜${escapeHtml(brand.chineseName)}</title>
  <meta name="description" content="${escapeHtml(product.summary)}">
  <meta property="og:type" content="${product.kind === 'service' ? 'website' : 'product'}">
  <meta property="og:title" content="${escapeHtml(product.name)}｜${escapeHtml(brand.chineseName)}">
  <meta property="og:description" content="${escapeHtml(product.summary)}">
  <meta property="og:image" content="${escapeHtml(product.images[0])}">
  <meta property="og:url" content="${url}"><link rel="canonical" href="${url}">
  <script type="application/ld+json">${schema}</script>
  <link rel="stylesheet" href="src/css/tokens.css"><link rel="stylesheet" href="src/css/base.css"><link rel="stylesheet" href="src/css/components.css"><link rel="stylesheet" href="src/css/pages.css">
  <script type="module" src="src/js/pages/product.js"></script>
</head><body><header class="site-header" data-site-header></header><main id="main-content" class="page-shell" data-product-detail data-product-id="${escapeHtml(product.id)}"></main><footer class="site-footer" data-site-footer></footer></body></html>
`;
}

export async function generateStaticCatalog({
  categoryData = categories,
  productData = products,
  enabledCategoryIds = storefrontConfig.enabledCategoryIds,
  productDirectory = fileURLToPath(new URL('../products/', import.meta.url)),
  sitemapPath = fileURLToPath(new URL('../sitemap.xml', import.meta.url)),
  siteUrl = 'https://andychung0214.github.io/kurashi-market',
  brand = storefrontConfig.brand
} = {}) {
  const enabledCategories = resolveEnabledCategories(categoryData, enabledCategoryIds);
  const visibleProducts = filterProductsByCategories(productData, enabledCategories);
  const normalizedSiteUrl = siteUrl.replace(/\/$/, '');
  const expectedFiles = new Set(visibleProducts.map(({ id }) => `${id}.html`));

  await mkdir(productDirectory, { recursive: true });
  const existingFiles = (await readdir(productDirectory)).filter((name) => name.endsWith('.html'));
  await Promise.all(existingFiles.filter((name) => !expectedFiles.has(name))
    .map((name) => unlink(join(productDirectory, name))));
  await Promise.all(visibleProducts.map((product) =>
    writeFile(join(productDirectory, `${product.id}.html`), productHtml(product, normalizedSiteUrl, brand), 'utf8')));

  const urls = ['', 'products.html', 'about.html', 'faq.html', ...visibleProducts.map((product) => `products/${product.id}.html`)];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${normalizedSiteUrl}/${path}</loc></url>`).join('\n')}
</urlset>
`;
  await mkdir(dirname(sitemapPath), { recursive: true });
  await writeFile(sitemapPath, sitemap, 'utf8');
  return { categories: enabledCategories, products: visibleProducts };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await generateStaticCatalog();
}
