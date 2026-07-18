import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const rootFiles = [
  'index.html', 'products.html', 'product.html', 'cart.html', 'checkout.html',
  'order-complete.html', 'favorites.html', 'account.html', 'about.html', 'faq.html'
];

test('使用者可見頁面不含舊品牌或固定四分類文案', async () => {
  for (const file of rootFiles) {
    const content = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(content, /KURASHI MARKET|暮集選物所|四大分類|四種生活|Four collections/, file);
  }
});

test('所有根頁面使用新品牌名稱', async () => {
  for (const file of rootFiles) {
    const content = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(content, /安暮恆生活/, file);
  }
});
