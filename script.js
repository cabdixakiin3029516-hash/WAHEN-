/* ==========================================================================
   WAHEN MARKETPLACE — FRONTEND CORE LOGIC (script.js)
   ========================================================================== */

// STATE MANAGEMENT
let cart = [];
let activeCategory = 'all';
let isRegisterMode = false;

// DOM ELEMENTS
const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const categoryPills = document.getElementById('categoryPills');
const cartBadge = document.getElementById('cartBadge');
const cartModal = document.getElementById('cartModal');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const checkoutFields = document.getElementById('checkoutFields');
const checkoutBtn = document.getElementById('checkoutBtn');

const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const registerFields = document.getElementById('registerFields');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const authTitle = document.getElementById('authTitle');

const menuUserName = document.getElementById('menuUserName');
const menuUserRole = document.getElementById('menuUserRole');
const logoutItem = document.getElementById('logoutItem');

/* --------------------------------------------------------------------------
   INITIALIZATION
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await checkUserProfile();
  await loadProducts();
});

/* --------------------------------------------------------------------------
   EVENT LISTENERS SETUP
   -------------------------------------------------------------------------- */
function setupEventListeners() {
  // Navigation & Drawers
  document.getElementById('openMenu').addEventListener('click', openMenu);
  document.getElementById('closeMenu').addEventListener('click', closeDrawers);
  document.getElementById('openCart').addEventListener('click', openCart);
  document.getElementById('closeCartModal').addEventListener('click', closeDrawers);
  document.getElementById('openAuthModal').addEventListener('click', openAuth);
  document.getElementById('closeAuthModal').addEventListener('click', closeDrawers);
  overlay.addEventListener('click', closeDrawers);

  // Search Input Engine
  let debounceTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      loadProducts(activeCategory, e.target.value);
    }, 300);
  });

  // Category Filtering
  categoryPills.addEventListener('click', (e) => {
    if (e.target.classList.contains('pill-btn')) {
      document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.dataset.category;
      loadProducts(activeCategory, searchInput.value);
    }
  });

  // Authentication Switch (Login vs Register)
  toggleAuthMode.addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    if (isRegisterMode) {
      authTitle.textContent = "Is-diiwaangeli WAHEN";
      registerFields.style.display = 'flex';
      toggleAuthMode.textContent = "Zuu leedahay Akown? Soo gal hal kan";
    } else {
      authTitle.textContent = "Soo Gal WAHEN";
      registerFields.style.display = 'none';
      toggleAuthMode.textContent = "Miyaanad lahayn Akown? Is-diiwaangeli";
    }
  });

  // Submit Authentication Form
  authForm.addEventListener('submit', handleAuthSubmit);

  // Logout Event
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await logoutUser();
  });

  // Checkout Handler
  checkoutBtn.addEventListener('click', handleCheckout);
}

/* --------------------------------------------------------------------------
   DRAWER / MODAL CONTROL
   -------------------------------------------------------------------------- */
function openMenu() { closeDrawers(); sideMenu.classList.add('open'); overlay.classList.add('show'); }
function openCart() { closeDrawers(); cartModal.classList.add('open'); overlay.classList.add('show'); }
function openAuth() { closeDrawers(); authModal.classList.add('open'); overlay.classList.add('show'); }

function closeDrawers() {
  sideMenu.classList.remove('open');
  cartModal.classList.remove('open');
  authModal.classList.remove('open');
  overlay.classList.remove('show');
}

/* --------------------------------------------------------------------------
   USER PROFILE & AUTH LOGIC
   -------------------------------------------------------------------------- */
async function checkUserProfile() {
  const user = await getCurrentUser();
  if (user) {
    menuUserName.textContent = user.profile.full_name || user.email;
    menuUserRole.textContent = `Role: ${user.profile.role.toUpperCase()}`;
    logoutItem.style.display = 'block';
  } else {
    menuUserName.textContent = "Ku soo dhaawow WAHEN";
    menuUserRole.textContent = "Guest / Bishen";
    logoutItem.style.display = 'none';
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;

  if (isRegisterMode) {
    const fullName = document.getElementById('authFullName').value;
    const role = document.getElementById('authRole').value;
    const { data, error } = await registerUser(email, password, fullName, role);
    if (error) return showToast(`Cilad: ${error.message}`);
    showToast("Guul! Diiwaangelintu waa ciyaartay.");
  } else {
    const { data, error } = await loginUser(email, password);
    if (error) return showToast(`Cilad: ${error.message}`);
    showToast("Guul! Waanu kuu soo saarnay.");
  }

  closeDrawers();
  await checkUserProfile();
}

/* --------------------------------------------------------------------------
   PRODUCT RENDERING ENGINE
   -------------------------------------------------------------------------- */
async function loadProducts(category = 'all', searchQuery = '') {
  productGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">Soo rogeysa alaabta...</div>`;

  const { data: products, error } = await getProducts(category, searchQuery);

  if (error || !products || products.length === 0) {
    productGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">Wax alaab ah ma jirtid meeshan!</div>`;
    return;
  }

  productGrid.innerHTML = products.map(product => `
    <div class="product-card">
      <div class="product-image-wrap">
        <img src="${product.image_url || 'https://via.placeholder.com/300'}" alt="${product.name}" loading="lazy">
        <span class="category-tag">${product.category}</span>
      </div>
      <div class="product-details">
        <h4 class="product-title">${product.name}</h4>
        <div class="product-vendor">${product.profiles?.store_name || 'WAHEN Merchant'}</div>
        <div class="product-bottom">
          <span class="price">$${parseFloat(product.price).toFixed(2)}</span>
          <button type="button" class="add-to-cart-btn" onclick="addToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image_url}')">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* --------------------------------------------------------------------------
   CART & CHECKOUT LOGIC
   -------------------------------------------------------------------------- */
window.addToCart = function(id, name, price, image_url) {
  const existingIndex = cart.findIndex(item => item.id === id);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({ id, name, price, image_url, quantity: 1 });
  }
  updateCartUI();
  showToast("Alaabta waa la dhex dhigay Cart-ka!");
};

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  cartBadge.textContent = totalItems;
  cartTotalEl.textContent = `$${totalPrice.toFixed(2)}`;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:20px;">Cart-kaagu waa faaruq!</p>`;
    checkoutFields.style.display = 'none';
    checkoutBtn.textContent = 'Koresho / Checkout';
    return;
  }

  cartItemsContainer.innerHTML = cart.map(item => `
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border-color);">
      <div style="display:flex; align-items:center; gap:10px;">
        <img src="${item.image_url || 'https://via.placeholder.com/50'}" style="width:40px; height:40px; border-radius:6px; object-fit:cover;">
        <div>
          <strong style="font-size:0.85rem; display:block;">${item.name}</strong>
          <small style="color:var(--text-muted);">$${item.price} x ${item.quantity}</small>
        </div>
      </div>
      <div>
        <button type="button" onclick="removeFromCart('${item.id}')" style="background:none; border:none; color:var(--danger); font-size:1.1rem; cursor:pointer;">🗑️</button>
      </div>
    </div>
  `).join('');
}

window.removeFromCart = function(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
};

async function handleCheckout() {
  if (cart.length === 0) return showToast("Fadlan marka hore alaab ku dar cart-ka!");

  if (checkoutFields.style.display === 'none') {
    checkoutFields.style.display = 'flex';
    checkoutBtn.textContent = 'Xaqiiji Dalabka (Confirm Order)';
    return;
  }

  const fullName = document.getElementById('custName').value;
  const phone = document.getElementById('custPhone').value;
  const address = document.getElementById('custAddress').value;

  if (!fullName || !phone || !address) {
    return showToast("Fadlan soo buuxi magaca, telefoonka iyo cinwaanka!");
  }

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryInfo = { fullName, phone, address };

  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Wa la diri doonaa...";

  const { data, error } = await createOrder(cart, totalPrice, deliveryInfo);

  checkoutBtn.disabled = false;

  if (error) {
    showToast(`Cilad: ${error.message}`);
  } else {
    showToast("Guul! Dalabkaagii waa la xaqiijiyay!");
    cart = [];
    updateCartUI();
    closeDrawers();
  }
}

/* --------------------------------------------------------------------------
   TOAST HELPER
   -------------------------------------------------------------------------- */
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
