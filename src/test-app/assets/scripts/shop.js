let activeCategory = 'all';

function renderFilters() {
  const container = document.getElementById('filters');
  container.innerHTML = getCategories().map(cat =>
    '<button class="filter-btn ' + (cat === activeCategory ? 'active' : '') + '" ' +
      'data-category="' + escapeHtml(cat) + '" ' +
      'onclick="setCategory(\'' + escapeHtml(cat) + '\')">' +
      escapeHtml(cat === 'all' ? 'All' : cat) +
    '</button>'
  ).join('');
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  const products = getProductsByCategory(activeCategory);
  if (products.length === 0) {
    grid.innerHTML = '<p class="empty-state">No products found.</p>';
    return;
  }
  grid.innerHTML = products.map(p =>
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

function setCategory(category) {
  activeCategory = category;
  renderFilters();
  renderProducts();
}

document.addEventListener('DOMContentLoaded', () => {
  renderFilters();
  renderProducts();
  document.getElementById('cart-count').textContent = getCartCount();
});
