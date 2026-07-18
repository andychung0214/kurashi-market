import test from 'node:test';
import assert from 'node:assert/strict';
import { createSafeStorage } from '../src/js/core/storage.js';

test('儲存空間拒絕存取時退回記憶體內資料', () => {
  const blocked = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); },
    removeItem() { throw new Error('blocked'); }
  };
  const storage = createSafeStorage(blocked);
  storage.set('theme', 'forest');
  assert.equal(storage.get('theme', 'wine'), 'forest');
  storage.remove('theme');
  assert.equal(storage.get('theme', 'wine'), 'wine');
});

test('儲存空間可讀但拒絕寫入時仍讀得到記憶體資料', () => {
  const readOnly = {
    getItem() { return null; },
    setItem() { throw new Error('quota'); },
    removeItem() {}
  };
  const storage = createSafeStorage(readOnly);
  assert.equal(storage.set('cart', [{ id: 'book-1' }]), false);
  assert.deepEqual(storage.get('cart', []), [{ id: 'book-1' }]);
});

test('未提供瀏覽器儲存物件時使用記憶體', () => {
  const storage = createSafeStorage(undefined);
  storage.set('theme', 'wine');
  assert.equal(storage.get('theme', 'forest'), 'wine');
});
