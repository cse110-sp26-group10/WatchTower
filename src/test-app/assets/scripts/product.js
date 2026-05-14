let selectedSize = null;
let currentProductId = null;

function renderProduct(product) {
  currentProductId = product.id;
  const container = document.getElementById('product-container');
  const sizeBtns = product.sizes.map(s =>
    '<button class="size-btn" data-size="' + escapeHtml(s) + '" ' +
      'onclick="selectSize(\'' + escapeHtml(s) + '\')">' + escapeHtml(s) + '</button>'
  ).join('');

  container.innerHTML =
    '<div class="product-detail">' +
      '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '" />' +
      '<div class="product-info">' +
        '<p style="font-size:0.85rem;color:#888;margin-bottom:0.5rem">' + escapeHtml(product.category) + '</p>' +
        '<h1>' + escapeHtml(product.name) + '</h1>' +
        '<div class="price">$' + escapeHtml(product.price.toFixed(2)) + '</div>' +
        '<div class="size-label">Select Size</div>' +
        '<div class="size-grid" id="size-grid">' + sizeBtns + '</div>' +
        '<button class="btn btn-primary btn-full" onclick="handleAddToCart()">Add to Cart</button>' +
        '<p id="add-feedback" style="margin-top:0.75rem;font-size:0.85rem;color:#555;min-height:1.2em"></p>' +
      '</div>' +
    '</div>';
}

function selectSize(size) {
  selectedSize = size;
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.size === size);
  });
}

function handleAddToCart() {
  const feedback = document.getElementById('add-feedback');
  if (!selectedSize) {
    feedback.textContent = 'Please select a size.';
    return;
  }
  addToCart(currentProductId, selectedSize);
  document.getElementById('cart-count').textContent = getCartCount();
  feedback.textContent = 'Added to cart!';
  setTimeout(() => { feedback.textContent = ''; }, 2000);
}

function renderNotFound() {
  document.getElementById('product-container').innerHTML =
    '<div class="empty-state"><p>Product not found. <a href="shop.html">Back to shop</a></p></div>';
}

document.addEventListener('DOMContentLoaded', () => {
  const id = new URLSearchParams(window.location.search).get('id');
  const product = getProductById(id);
  if (!product) { renderNotFound(); return; }
  renderProduct(product);
  document.getElementById('cart-count').textContent = getCartCount();
});
