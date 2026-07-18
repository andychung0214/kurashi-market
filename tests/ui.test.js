import test from 'node:test';
import assert from 'node:assert/strict';
import { shellMarkup } from '../src/js/ui/shell.js';
import { renderProductCard } from '../src/js/ui/product-card.js';
import { categoryMarkup } from '../src/js/pages/home.js';
import { categoryOptionsMarkup } from '../src/js/pages/products.js';
import { categoryFaqMarkup } from '../src/js/pages/faq.js';

test('網站外框包含主要導覽與購物車數量', () => {
  const markup = shellMarkup({ active: 'products', cartCount: 3 });
  assert.match(markup.header, /aria-current="page"/);
  assert.match(markup.header, /購物車 <span[^>]*>3<\/span>/);
  assert.match(markup.footer, /未產生真實交易/);
  assert.match(markup.header, /AMUHARU/);
  assert.match(markup.header, /安暮恆生活/);
  assert.doesNotMatch(markup.header + markup.footer, /KURASHI|暮集選物所/);
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

test('分類卡與篩選選項依傳入分類產生', () => {
  const input = [
    { id: 'one', name: '分類一', mark: '一', note: '第一段說明' },
    { id: 'two', name: '分類二', mark: '二', note: '第二段說明' }
  ];
  assert.match(categoryMarkup(input), /category=one/);
  assert.doesNotMatch(categoryMarkup(input), /category=three/);
  assert.match(categoryOptionsMarkup(input), /value="two">分類二/);
});

test('分類畫面會跳脫設定資料', () => {
  const input = [{ id: 'one', name: '<script>分類</script>', mark: '<', note: '安全 & 清楚' }];
  const markup = categoryMarkup(input) + categoryOptionsMarkup(input);
  assert.doesNotMatch(markup, /<script>/);
  assert.match(markup, /&lt;script&gt;分類&lt;\/script&gt;/);
});

test('零分類使用明確空狀態', () => {
  assert.match(categoryMarkup([]), /目前尚無分類/);
});

test('分類常見問題只呈現有內容的啟用分類並跳脫文字', () => {
  const markup = categoryFaqMarkup([
    { id: 'one', name: '分類一', faq: [{ question: '<問題>', answer: '答案 & 說明' }] },
    { id: 'two', name: '分類二', faq: [] }
  ]);
  assert.match(markup, /分類一/);
  assert.match(markup, /&lt;問題&gt;/);
  assert.match(markup, /答案 &amp; 說明/);
  assert.doesNotMatch(markup, /分類二/);
});
