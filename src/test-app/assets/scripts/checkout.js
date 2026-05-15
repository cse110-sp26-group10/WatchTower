let surveyRating = 0;

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCard(card) {
  const digits = card.replace(/\s/g, '');
  return digits.length === 16 && /^\d+$/.test(digits);
}

function setFieldError(fieldId, errorId, hasError) {
  document.getElementById(fieldId).classList.toggle('error', hasError);
  document.getElementById(errorId).classList.toggle('visible', hasError);
}

function handleSubmit(e) {
  e.preventDefault();
  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const card    = document.getElementById('card').value.trim();

  const nameErr    = name.length < 2;
  const emailErr   = !validateEmail(email);
  const addressErr = address.length < 5;
  const cardErr    = !validateCard(card);

  setFieldError('name',    'name-error',    nameErr);
  setFieldError('email',   'email-error',   emailErr);
  setFieldError('address', 'address-error', addressErr);
  setFieldError('card',    'card-error',    cardErr);

  if (nameErr || emailErr || addressErr || cardErr) return;

  clearCart();
  document.getElementById('checkout-form-section').hidden = true;
  document.getElementById('survey-section').hidden = false;
  document.getElementById('cart-count').textContent = '0';
}

function initStars() {
  document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('mouseover', () => highlightStars(Number(star.dataset.value)));
    star.addEventListener('mouseout',  () => highlightStars(surveyRating));
    star.addEventListener('click',     () => {
      surveyRating = Number(star.dataset.value);
      highlightStars(surveyRating);
    });
  });
}

function highlightStars(upTo) {
  document.querySelectorAll('.star').forEach(star => {
    star.classList.toggle('selected', Number(star.dataset.value) <= upTo);
  });
}

function submitSurvey() {
  if (surveyRating === 0) return;
  // Comment goes to console only — not rendered into the DOM
  const comment = document.getElementById('survey-comment').value.trim();
  console.log('WatchTower survey signal:', { rating: surveyRating, comment });
  document.getElementById('survey-thanks').style.display = 'block';
  document.getElementById('survey-submit-btn').disabled = true;
}

// Deliberately throws so WatchTower's window.onerror handler captures it
function triggerTestError() {
  throw new Error('WatchTower manual test error — triggered from checkout page');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cart-count').textContent = getCartCount();
  document.getElementById('checkout-form').addEventListener('submit', handleSubmit);
  document.getElementById('card').addEventListener('input', e => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
    e.target.value = digits.replace(/(.{4})/g, '$1 ').trim();
  });
  initStars();
});
