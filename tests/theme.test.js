import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTheme, applyTheme } from '../src/js/ui/theme.js';

test('未知主題退回森林綠', () => {
  assert.equal(normalizeTheme('neon'), 'forest');
  assert.equal(normalizeTheme('wine'), 'wine');
});

test('套用主題會更新根元素資料屬性', () => {
  const root = { dataset: {} };
  assert.equal(applyTheme('london', root), 'london');
  assert.equal(root.dataset.theme, 'london');
});
