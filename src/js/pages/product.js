import { products, categories } from '../data/products.js';
import { createSafeStorage } from '../core/storage.js';
import { createShopState } from '../core/shop-state.js';
import { initShell } from '../ui/shell.js';
import { renderProductCard } from '../ui/product-card.js';

initShell({ active: 'products' });
const storage = createSafeStorage();
const state = createShopState(storage);
const root = document.querySelector('[data-product-detail]');
const id = new URLSearchParams(location.search).get('id') ?? root?.dataset.productId;
const product = products.find((item) => item.id === id);
const detailLabels = {
  condition: '書況', author: '作者', publisher: '出版社', year: '出版年份', paper: '紙材', size: '尺寸', minimum: '最低訂購量', leadTime: '客製期程',
  spaceType: '空間類型', area: '坪數', style: '風格', service: '服務', material: '材質', origin: '產地', care: '照護方式'
};

if (!product) {
  document.title = '找不到商品｜暮集選物所';
  root.innerHTML = '<section class="empty-state"><p class="eyebrow">Not found</p><h1>這件選物不在架上</h1><p>它可能已下架，或網址不完整。</p><a class="button" href="products.html">回到所有選物</a></section>';
} else {
  state.addRecent(product.id);
  const category = categories.find((item) => item.id === product.category)?.name ?? '';
  const isService = product.kind === 'service';
  const favorites = state.getFavorites();
  document.title = `${product.name}｜暮集選物所`;
  document.querySelector('meta[name="description"]').content = product.summary;
  document.querySelector('meta[property="og:title"]').content = product.name;
  document.querySelector('meta[property="og:description"]').content = product.summary;
  const canonical = root.dataset.productId
    ? `https://andychung0214.github.io/kurashi-market/products/${encodeURIComponent(product.id)}.html`
    : `https://andychung0214.github.io/kurashi-market/product.html?id=${encodeURIComponent(product.id)}`;
  document.querySelector('link[rel="canonical"]').href = canonical;
  if (!document.querySelector('script[type="application/ld+json"]')) {
    const schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': isService ? 'Service' : 'Product', name: product.name, description: product.summary, image: product.images,
      ...(isService ? { serviceType: '室內設計諮詢' } : { offers: { '@type': 'Offer', priceCurrency: 'TWD', price: product.price, availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: canonical } }) });
    document.head.append(schema);
  }

  root.innerHTML = `
    <nav class="breadcrumbs" aria-label="麵包屑"><a href="index.html">首頁</a><span>/</span><a href="products.html?category=${product.category}">${category}</a><span>/</span><span aria-current="page">${product.name}</span></nav>
    <article class="product-detail">
      <div class="product-gallery">${product.images.map((image, index) => `<img src="${image}" alt="${product.name}${index ? `細節 ${index + 1}` : ''}" width="900" height="1100" ${index ? 'loading="lazy"' : ''} onerror="this.onerror=null;this.src='src/assets/placeholder-product.svg'">`).join('')}</div>
      <div class="product-info">
        <p class="eyebrow">${category}・${product.badge}</p><h1>${product.name}</h1><p class="lede">${product.summary}</p>
        ${isService ? '<p class="product-price">依需求正式估價</p>' : `<p class="product-price">NT$${product.price.toLocaleString('zh-TW')}</p>`}
        <p>${product.description}</p>
        <dl class="detail-list">${Object.entries(product.details).map(([key, value]) => `<div><dt>${detailLabels[key] ?? key}</dt><dd>${value}</dd></div>`).join('')}</dl>
        ${isService ? `<a class="button" href="mailto:hello@example.com?subject=${encodeURIComponent(`預約諮詢：${product.name}`)}">預約這個空間的初談</a><p class="muted">我們會先了解成員、生活習慣、地點與預算，再安排初談。</p>` : `
          <form class="purchase-box" data-purchase-form><div class="form-field"><label for="variant">規格</label><select id="variant" name="variant">${product.variants.map((variant) => `<option value="${variant}">${variant}</option>`).join('')}</select></div><div class="form-field"><label for="quantity">數量（庫存 ${product.stock}）</label><input id="quantity" name="quantity" type="number" min="${product.minimumQuantity}" max="${product.stock}" value="${product.minimumQuantity}" inputmode="numeric">${product.minimumQuantity > 1 ? `<small>最低訂購 ${product.minimumQuantity} 份</small>` : ''}</div>
          <button class="button" type="submit">加入購物車</button></form>`}
        <button class="favorite-button button button--ghost" type="button" data-favorite aria-pressed="${favorites.includes(product.id)}">${favorites.includes(product.id) ? '已收藏' : '加入收藏'}</button>
        <p class="status-message" data-product-status role="status"></p>
      </div>
    </article>
    <section class="section section--rule"><div class="section-heading"><h2>也許會喜歡</h2></div><div class="product-grid">${products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4).map(renderProductCard).join('')}</div></section>`;

  root.querySelector('[data-purchase-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const quantity = Number(formData.get('quantity'));
    const cart = state.addToCart(product, quantity, String(formData.get('variant') ?? '預設'));
    root.querySelector('[data-product-status]').textContent = `已加入購物車，目前共 ${cart.reduce((sum, item) => sum + item.quantity, 0)} 件。`;
  });
  root.querySelector('[data-favorite]')?.addEventListener('click', (event) => {
    const favoritesNext = state.toggleFavorite(product.id);
    const selected = favoritesNext.includes(product.id);
    event.currentTarget.setAttribute('aria-pressed', String(selected));
    event.currentTarget.textContent = selected ? '已收藏' : '加入收藏';
  });
}
