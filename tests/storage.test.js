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
