/* global getProducts, getCartCount, escapeHtml */

function renderFeatured() {
  const grid = document.getElementById('featured-grid');
  const featured = getProducts().slice(0, 4);
  grid.innerHTML = featured.map(p =>
    '<a class="product-card" href="product.html?id=' + escapeHtml(p.id) + '">' +
      '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" />' +
      '<div class="product-card-body">' +
        '<div class="product-card-name">' + escapeHtml(p.name) + '</div>' +
        '<div class="product-card-category">' + escapeHtml(p.category) + '</div>' +
        '<div class="product-card-price">$' + escapeHtml(p.price.toFixed(2)) + '</div>' +
      '</div>' +
    '</a>'
  ).join('');
}

function updateCartCount() {
  document.getElementById('cart-count').textContent = getCartCount();
}

document.addEventListener('DOMContentLoaded', () => {
  renderFeatured();
  updateCartCount();
});
