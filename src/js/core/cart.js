const clampQuantity = (quantity, stock) => Math.min(Math.max(0, Number(quantity) || 0), Math.max(0, stock));

export function addCartItem(items, product, quantity = 1, variant = '預設') {
  if (product.kind === 'service' || product.stock <= 0) return [...items];
  const index = items.findIndex((item) => item.productId === product.id && item.variant === variant);
  const next = items.map((item) => ({ ...item }));

  if (index >= 0) {
    next[index].quantity = clampQuantity(next[index].quantity + Number(quantity), product.stock);
    return next;
  }

  const safeQuantity = clampQuantity(quantity, product.stock);
  if (safeQuantity === 0) return next;
  return [...next, {
    productId: product.id,
    name: product.name,
    price: product.price,
    image: product.images?.[0] ?? '',
    stock: product.stock,
    variant,
    quantity: safeQuantity
  }];
}

export function updateCartQuantity(items, productId, variant, quantity, stock) {
  const safeQuantity = clampQuantity(quantity, stock);
  if (safeQuantity === 0) return removeCartItem(items, productId, variant);
  return items.map((item) => item.productId === productId && item.variant === variant
    ? { ...item, quantity: safeQuantity, stock }
    : { ...item });
}

export function removeCartItem(items, productId, variant) {
  return items.filter((item) => !(item.productId === productId && item.variant === variant));
}

export function calculateCart(items, { coupon = '' } = {}) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = coupon.trim().toUpperCase() === 'KURASHI100' && subtotal >= 1000 ? 100 : 0;
  const shipping = subtotal === 0 || subtotal >= 2000 ? 0 : 100;
  return {
    subtotal,
    discount,
    shipping,
    total: Math.max(0, subtotal - discount + shipping),
    remainingForFreeShipping: Math.max(0, 2000 - subtotal)
  };
}
