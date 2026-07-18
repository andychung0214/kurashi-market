import { addCartItem, updateCartQuantity, removeCartItem } from './cart.js';

const keys = {
  cart: 'kurashi.cart',
  favorites: 'kurashi.favorites',
  recent: 'kurashi.recent',
  orders: 'kurashi.orders',
  coupon: 'kurashi.coupon'
};

function safeString(value, maximum = 240) {
  return typeof value === 'string' ? value.slice(0, maximum) : '';
}

function sanitizeCart(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const price = Number(item.price);
    const stock = Number(item.stock);
    const minimumQuantity = Math.max(1, Number(item.minimumQuantity) || 1);
    const quantity = Number(item.quantity);
    if (!safeString(item.productId) || !safeString(item.name) || !Number.isFinite(price) || price < 0 ||
        !Number.isFinite(stock) || stock < minimumQuantity || !Number.isFinite(quantity) || quantity < minimumQuantity) return [];
    return [{
      productId: safeString(item.productId, 100), name: safeString(item.name), price,
      image: safeString(item.image, 500), stock, minimumQuantity,
      variant: safeString(item.variant, 100) || '預設', quantity: Math.min(Math.floor(quantity), Math.floor(stock))
    }];
  });
}

function sanitizeOrders(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((order) => {
    const total = Number(order?.totals?.total);
    if (!order || typeof order !== 'object' || !safeString(order.id, 100) || !Number.isFinite(total) || total < 0 ||
        !order.payment || order.payment.isSimulation !== true) return [];
    return [{
      ...order,
      id: safeString(order.id, 100), status: safeString(order.status, 100) || '測試訂單',
      createdAt: safeString(order.createdAt, 50), items: sanitizeCart(order.items),
      totals: { ...order.totals, total },
      payment: {
        method: ['card', 'atm', 'cvs'].includes(order.payment.method) ? order.payment.method : 'card',
        reference: safeString(order.payment.reference, 100), expiresAt: safeString(order.payment.expiresAt, 50),
        bankCode: safeString(order.payment.bankCode, 20), account: safeString(order.payment.account, 100),
        paymentCode: safeString(order.payment.paymentCode, 100), isSimulation: true,
        notice: safeString(order.payment.notice)
      }
    }];
  });
}

function browserNotify() {
  globalThis.dispatchEvent?.(new Event('kurashi:state-change'));
}

export function createShopState(storage, notify = browserNotify) {
  const save = (key, value) => {
    storage.set(key, value);
    notify();
    return value;
  };

  return {
    getCart: () => sanitizeCart(storage.get(keys.cart, [])),
    addToCart(product, quantity, variant = '預設') {
      return save(keys.cart, addCartItem(sanitizeCart(storage.get(keys.cart, [])), product, quantity, variant));
    },
    updateQuantity(productId, variant, quantity, stock) {
      const cart = sanitizeCart(storage.get(keys.cart, []));
      const current = cart.find((item) => item.productId === productId && item.variant === variant);
      return save(keys.cart, updateCartQuantity(cart, productId, variant, quantity, stock, current?.minimumQuantity ?? 1));
    },
    removeFromCart(productId, variant) {
      return save(keys.cart, removeCartItem(sanitizeCart(storage.get(keys.cart, [])), productId, variant));
    },
    getFavorites: () => {
      const value = storage.get(keys.favorites, []);
      return Array.isArray(value) ? value.filter((id) => typeof id === 'string').slice(0, 100) : [];
    },
    toggleFavorite(productId) {
      const favorites = Array.isArray(storage.get(keys.favorites, [])) ? storage.get(keys.favorites, []) : [];
      const next = favorites.includes(productId)
        ? favorites.filter((id) => id !== productId)
        : [productId, ...favorites];
      return save(keys.favorites, next);
    },
    getRecent: () => {
      const value = storage.get(keys.recent, []);
      return Array.isArray(value) ? value.filter((id) => typeof id === 'string').slice(0, 8) : [];
    },
    addRecent(productId) {
      const recent = (Array.isArray(storage.get(keys.recent, [])) ? storage.get(keys.recent, []) : []).filter((id) => typeof id === 'string' && id !== productId);
      return save(keys.recent, [productId, ...recent].slice(0, 8));
    },
    getOrders: () => sanitizeOrders(storage.get(keys.orders, [])),
    saveOrder(order) {
      return save(keys.orders, [order, ...sanitizeOrders(storage.get(keys.orders, []))].slice(0, 20));
    },
    clearCart() {
      return save(keys.cart, []);
    },
    getCoupon: () => safeString(storage.get(keys.coupon, ''), 40).trim().toUpperCase() === 'AMUHARU100' ? 'AMUHARU100' : '',
    setCoupon(coupon) {
      const normalized = safeString(coupon, 40).trim().toUpperCase();
      return save(keys.coupon, normalized === 'AMUHARU100' ? normalized : '');
    }
  };
}
