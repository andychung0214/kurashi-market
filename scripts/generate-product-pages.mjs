import { mkdir, writeFile } from 'node:fs/promises';
import { products } from '../src/js/data/products.js';
import { storefrontConfig } from '../src/js/data/storefront.js';

const site = 'https://andychung0214.github.io/kurashi-market';
const brandName = storefrontConfig.brand.chineseName;
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[character]);

function schemaFor(product, url) {
  return {
    '@context': 'https://schema.org', '@type': product.kind === 'service' ? 'Service' : 'Product',
    name: product.name, description: product.summary, image: product.images,
    ...(product.kind === 'service'
      ? { serviceType: '室內設計諮詢', url }
      : { offers: { '@type': 'Offer', priceCurrency: 'TWD', price: product.price,
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url } })
  };
}

function productHtml(product) {
  const url = `${site}/products/${product.id}.html`;
  const schema = JSON.stringify(schemaFor(product, url)).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="zh-Hant" data-theme="forest"><head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="../">
  <title>${escapeHtml(product.name)}｜${escapeHtml(brandName)}</title>
  <meta name="description" content="${escapeHtml(product.summary)}">
  <meta property="og:type" content="${product.kind === 'service' ? 'website' : 'product'}">
  <meta property="og:title" content="${escapeHtml(product.name)}｜${escapeHtml(brandName)}">
  <meta property="og:description" content="${escapeHtml(product.summary)}">
  <meta property="og:image" content="${escapeHtml(product.images[0])}">
  <meta property="og:url" content="${url}"><link rel="canonical" href="${url}">
  <script type="application/ld+json">${schema}</script>
  <link rel="stylesheet" href="src/css/tokens.css"><link rel="stylesheet" href="src/css/base.css"><link rel="stylesheet" href="src/css/components.css"><link rel="stylesheet" href="src/css/pages.css">
  <script type="module" src="src/js/pages/product.js"></script>
</head><body><header class="site-header" data-site-header></header><main id="main-content" class="page-shell" data-product-detail data-product-id="${escapeHtml(product.id)}"></main><footer class="site-footer" data-site-footer></footer></body></html>
`;
}

await mkdir(new URL('../products/', import.meta.url), { recursive: true });
await Promise.all(products.map((product) => writeFile(new URL(`../products/${product.id}.html`, import.meta.url), productHtml(product), 'utf8')));

const urls = ['', 'products.html', 'about.html', 'faq.html', ...products.map((product) => `products/${product.id}.html`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${site}/${path}</loc></url>`).join('\n')}
</urlset>
`;
await writeFile(new URL('../sitemap.xml', import.meta.url), sitemap, 'utf8');
