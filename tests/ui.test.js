import test from 'node:test';
import assert from 'node:assert/strict';
import { shellMarkup } from '../src/js/ui/shell.js';
import { renderProductCard } from '../src/js/ui/product-card.js';

test('網站外框包含主要導覽與購物車數量', () => {
  const markup = shellMarkup({ active: 'products', cartCount: 3 });
  assert.match(markup.header, /aria-current="page"/);
  assert.match(markup.header, /購物車 <span[^>]*>3<\/span>/);
  assert.match(markup.footer, /未產生真實交易/);
});

test('設計案例卡片使用諮詢文案而非價格', () => {
  const markup = renderProductCard({
    id: 'case-1', kind: 'service', category: 'interiors', name: '雨庭町屋', price: 0,
    summary: '老屋再生', badge: '住宅案例', images: ['case.jpg']
  });
  assert.match(markup, /查看案例/);
  assert.doesNotMatch(markup, /NT\$/);
});

test('商品卡片跳脫不可信任文字', () => {
  const markup = renderProductCard({
    id: 'book-1', kind: 'product', category: 'books', name: '<script>alert(1)</script>', price: 420,
    summary: '選書', badge: '二手書', images: ['book.jpg']
  });
  assert.doesNotMatch(markup, /<script>/);
  assert.match(markup, /NT\$420/);
});
