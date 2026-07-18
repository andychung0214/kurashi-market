import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCheckout, createTestPayment } from '../src/js/core/checkout.js';

const valid = {
  name: '林森', email: 'lin@example.com', phone: '0912345678', address: '台北市中山區一號',
  delivery: 'home', invoice: 'electronic', paymentMethod: 'atm'
};

test('結帳驗證回傳欄位錯誤', () => {
  const errors = validateCheckout({ ...valid, name: '', email: 'wrong', phone: '12' });
  assert.equal(errors.name, '請輸入收件人姓名');
  assert.equal(errors.email, '請輸入有效的電子郵件');
  assert.equal(errors.phone, '請輸入有效的台灣手機號碼');
});

test('有效結帳資料沒有錯誤', () => {
  assert.deepEqual(validateCheckout(valid), {});
});

test('ATM 只產生明確的測試付款資訊', () => {
  const payment = createTestPayment('atm', { id: 'KM-TEST-8X2', total: 1200 });
  assert.equal(payment.isSimulation, true);
  assert.match(payment.notice, /未產生真實交易/);
  assert.match(payment.reference, /^TEST-ATM-/);
});

test('不支援的付款方式會被拒絕', () => {
  assert.throws(() => createTestPayment('cash', { id: 'KM-1', total: 100 }), /不支援/);
});
