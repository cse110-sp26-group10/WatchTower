/* global getCart, getCartCount, getProductById, escapeHtml, removeFromCart */

function renderCart() {
  const items = getCart();
  const itemsEl = document.getElementById('cart-items');
  const totalsEl = document.getElementById('cart-totals');
  document.getElementById('cart-count').textContent = getCartCount();

  if (items.length === 0) {
    itemsEl.innerHTML =
      '<div class="empty-state"><p>Your cart is empty. <a href="shop.html">Start shopping</a></p></div>';
    totalsEl.innerHTML = '';
    return;
  }

  let subtotal = 0;
  const rows = items.map(item => {
    const product = getProductById(item.productId);
    if (!product) return '';
    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    return '<div class="cart-item">' +
      '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '" />' +
      '<div class="cart-item-info">' +
        '<div class="cart-item-name">' + escapeHtml(product.name) + '</div>' +
        '<div class="cart-item-meta">Size: ' + escapeHtml(item.size) +
          ' &nbsp;·&nbsp; Qty: ' + escapeHtml(String(item.quantity)) + '</div>' +
      '</div>' +
      '<div>' +
        '<div style="font-weight:700;margin-bottom:0.5rem">$' + escapeHtml(lineTotal.toFixed(2)) + '</div>' +
        '<button class="btn btn-outline" style="font-size:0.8rem;padding:0.3rem 0.7rem" ' +
          'onclick="handleRemove(\'' + escapeHtml(item.productId) + '\',\'' + escapeHtml(item.size) + '\')">' +
          'Remove' +
        '</button>' +
      '</div>' +
    '</div>';
  });

  itemsEl.innerHTML = rows.join('');
  totalsEl.innerHTML =
    '<div class="cart-total-line">Subtotal: $' + subtotal.toFixed(2) + '</div>' +
    '<a class="btn btn-primary" href="checkout.html" style="margin-top:1rem;display:inline-block">Proceed to Checkout</a>';
}

function handleRemove(productId, size) {
  removeFromCart(productId, size);
  renderCart();
}

document.addEventListener('DOMContentLoaded', renderCart);
