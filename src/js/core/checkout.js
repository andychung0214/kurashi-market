const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^09\d{8}$/;

export function validateCheckout(input) {
  const errors = {};
  if (!input.name?.trim()) errors.name = '請輸入收件人姓名';
  if (!emailPattern.test(input.email?.trim() ?? '')) errors.email = '請輸入有效的電子郵件';
  if (!phonePattern.test((input.phone ?? '').replace(/[\s-]/g, ''))) errors.phone = '請輸入有效的台灣手機號碼';
  if (!input.address?.trim()) errors.address = '請輸入配送地址';
  if (!input.delivery) errors.delivery = '請選擇配送方式';
  if (!input.invoice) errors.invoice = '請選擇發票方式';
  if (!['card', 'atm', 'cvs'].includes(input.paymentMethod)) errors.paymentMethod = '請選擇付款方式';
  if (input.paymentMethod === 'card') {
    const digits = (input.cardNumber ?? '').replace(/\D/g, '');
    if (!/^4\d{15}$/.test(digits)) errors.cardNumber = '請輸入 16 位測試 Visa 卡號';
    if (!/^\d{3}$/.test(input.cvv ?? '')) errors.cvv = '請輸入 3 位測試安全碼';
  }
  return errors;
}

export function createTestPayment(method, order) {
  const label = { card: 'CARD', atm: 'ATM', cvs: 'CVS' }[method];
  if (!label) throw new Error('不支援的付款方式');
  const suffix = String(order.id).replace(/[^a-z0-9]/gi, '').slice(-8).toUpperCase().padStart(8, '0');
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  return {
    method,
    reference: `TEST-${label}-${suffix}`,
    expiresAt,
    isSimulation: true,
    notice: '測試付款模擬：未產生真實交易。'
  };
}
