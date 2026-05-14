// Shared XSS escape helper — call this on any value before inserting into innerHTML.
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CART_KEY = 'wt_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function addToCart(productId, size) {
  const items = getCart();
  const existing = items.find(i => i.productId === productId && i.size === size);
  if (existing) {
    existing.quantity += 1;
  } else {
    items.push({ productId, size, quantity: 1 });
  }
  saveCart(items);
}

function removeFromCart(productId, size) {
  saveCart(getCart().filter(i => !(i.productId === productId && i.size === size)));
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
}

function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}
