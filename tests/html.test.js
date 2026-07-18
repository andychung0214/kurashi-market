import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml } from '../src/js/core/html.js';

test('持久資料輸出前會跳脫 HTML 與屬性字元', () => {
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(escapeHtml("'預設'"), '&#39;預設&#39;');
});
