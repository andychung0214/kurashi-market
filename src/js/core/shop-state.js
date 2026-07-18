import { addCartItem, updateCartQuantity, removeCartItem } from './cart.js';

const keys = {
  cart: 'kurashi.cart',
  favorites: 'kurashi.favorites',
  recent: 'kurashi.recent'
};

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
    getCart: () => storage.get(keys.cart, []),
    addToCart(product, quantity, variant = '預設') {
      return save(keys.cart, addCartItem(storage.get(keys.cart, []), product, quantity, variant));
    },
    updateQuantity(productId, variant, quantity, stock) {
      return save(keys.cart, updateCartQuantity(storage.get(keys.cart, []), productId, variant, quantity, stock));
    },
    removeFromCart(productId, variant) {
      return save(keys.cart, removeCartItem(storage.get(keys.cart, []), productId, variant));
    },
    getFavorites: () => storage.get(keys.favorites, []),
    toggleFavorite(productId) {
      const favorites = storage.get(keys.favorites, []);
      const next = favorites.includes(productId)
        ? favorites.filter((id) => id !== productId)
        : [productId, ...favorites];
      return save(keys.favorites, next);
    },
    getRecent: () => storage.get(keys.recent, []),
    addRecent(productId) {
      const recent = storage.get(keys.recent, []).filter((id) => id !== productId);
      return save(keys.recent, [productId, ...recent].slice(0, 8));
    }
  };
}
