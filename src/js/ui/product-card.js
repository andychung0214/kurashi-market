const categoryNames = { books: '二手書', invitations: '喜帖', interiors: '室內設計', goods: '百貨雜物' };

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function formatPrice(price) {
  return `NT$${Number(price).toLocaleString('zh-TW')}`;
}

export function renderProductCard(product) {
  const isService = product.kind === 'service';
  const url = `product.html?id=${encodeURIComponent(product.id)}`;
  const image = escapeHtml(product.images?.[0] ?? 'src/assets/placeholder-product.svg');
  return `
    <article class="product-card" data-category="${escapeHtml(product.category)}">
      <a class="product-card__image" href="${url}" aria-label="${escapeHtml(isService ? `查看案例：${product.name}` : `查看商品：${product.name}`)}">
        <img src="${image}" alt="${escapeHtml(product.name)}" loading="lazy" width="640" height="800"
          onerror="this.onerror=null;this.src='src/assets/placeholder-product.svg'">
        <span class="product-card__stamp">${escapeHtml(product.badge ?? categoryNames[product.category])}</span>
      </a>
      <div class="product-card__body">
        <p class="eyebrow">${escapeHtml(categoryNames[product.category] ?? '')}</p>
        <h3><a href="${url}">${escapeHtml(product.name)}</a></h3>
        <p class="product-card__summary">${escapeHtml(product.summary)}</p>
        <div class="product-card__foot">
          ${isService ? '<span class="service-label">預約初談</span>' : `<strong>${formatPrice(product.price)}</strong>`}
          <a class="text-link" href="${url}">${isService ? '查看案例' : '查看商品'}<span aria-hidden="true"> →</span></a>
        </div>
      </div>
    </article>`;
}
