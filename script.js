/**
 * WAHEN MARKETPLACE - CORE APPLICATION ENGINE
 * Pure Vanilla JavaScript ES6+ Architecture
 * Connected to Supabase Backend
 */

// ==========================================================================
// 1. STATE MANAGEMENT (GLOBAL STORE)
// ==========================================================================
const AppState = {
  user: null,
  session: null,
  products: [],
  filteredProducts: [],
  categories: [],
  brands: [],
  cart: [],
  currentCategory: 'all',
  currentBrand: null,
  searchQuery: '',
  location: 'Hargeysa',
  isLoading: false
};

// ==========================================================================
// 2. SUPABASE API SERVICE LAYER
// ==========================================================================
const ApiService = {
  // Fetch All Active Products
  async fetchProducts() {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[ApiService] Error fetching products:', err.message);
      UI.showToast('Cillad ayaa ka dhacday soo qaadista alaabta', 'error');
      return [];
    }
  },

  // Fetch Products by Category
  async fetchProductsByCategory(categorySlug) {
    try {
      let query = supabaseClient.from('products').select('*');
      if (categorySlug !== 'all') {
        query = query.eq('category', categorySlug);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[ApiService] Category fetch error:', err.message);
      return [];
    }
  },

  // Search Products using Supabase Text Match
  async searchProducts(searchTerm) {
    try {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .ilike('name', `%${searchTerm}%`);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[ApiService] Search error:', err.message);
      return [];
    }
  },

  // Submit New Order to Supabase
  async createOrder(orderPayload) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .insert([orderPayload])
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('[ApiService] Order creation error:', err.message);
      return { success: false, error: err.message };
    }
  },

  // Auth: Login
  async login(email, password) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Auth: Sign Up
  async signUp(email, password, metadata) {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};

// ==========================================================================
// 3. CART MANAGEMENT (LOCALSTORAGE + STATE SYNC)
// ==========================================================================
const CartManager = {
  init() {
    const savedCart = localStorage.getItem('wahen_cart');
    if (savedCart) {
      try {
        AppState.cart = JSON.parse(savedCart);
      } catch (e) {
        AppState.cart = [];
      }
    }
    this.updateCartUI();
  },

  saveCart() {
    localStorage.setItem('wahen_cart', JSON.stringify(AppState.cart));
    this.updateCartUI();
  },

  addItem(product, quantity = 1) {
    const existingIndex = AppState.cart.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      AppState.cart[existingIndex].quantity += quantity;
    } else {
      AppState.cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url,
        quantity: quantity
      });
    }
    this.saveCart();
    UI.showToast(`'${product.name}' waa lagu daray cart-ka!`);
  },

  removeItem(productId) {
    AppState.cart = AppState.cart.filter(item => item.id !== productId);
    this.saveCart();
  },

  updateQuantity(productId, delta) {
    const item = AppState.cart.find(item => item.id === productId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeItem(productId);
      } else {
        this.saveCart();
      }
    }
  },

  clearCart() {
    AppState.cart = [];
    this.saveCart();
  },

  getTotals() {
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = AppState.cart.length > 0 ? 2.00 : 0.00; // Flat $2 delivery rate
    return {
      subtotal: subtotal.toFixed(2),
      delivery: delivery.toFixed(2),
      total: (subtotal + delivery).toFixed(2),
      itemCount: AppState.cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  },

  updateCartUI() {
    const totals = this.getTotals();
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) cartCountEl.textContent = totals.itemCount;

    const cartSubtotalEl = document.getElementById('cartSubtotal');
    const cartDeliveryEl = document.getElementById('cartDelivery');
    const cartTotalEl = document.getElementById('cartTotal');

    if (cartSubtotalEl) cartSubtotalEl.textContent = `$${totals.subtotal}`;
    if (cartDeliveryEl) cartDeliveryEl.textContent = `$${totals.delivery}`;
    if (cartTotalEl) cartTotalEl.textContent = `$${totals.total}`;

    this.renderCartItems();
  },

  renderCartItems() {
    const container = document.getElementById('cartItems');
    if (!container) return;

    if (AppState.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 40px 10px;">
          <p style="font-size: 48px; margin-bottom: 10px;">🛒</p>
          <p style="color: #6B7280;">Cart-kaagu wuu madhan yahay.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = AppState.cart.map(item => `
      <div class="cart-item" style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 15px; border-bottom:1px solid #eee; padding-bottom:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${item.image_url || 'https://via.placeholder.com/50'}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;" />
          <div>
            <strong style="display:block; font-size:14px;">${item.name}</strong>
            <small style="color:#6366F1;">$${item.price} x ${item.quantity}</small>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button onclick="CartManager.updateQuantity(${item.id}, -1)" style="padding:2px 8px; border-radius:4px; border:1px solid #ccc;">-</button>
          <span>${item.quantity}</span>
          <button onclick="CartManager.updateQuantity(${item.id}, 1)" style="padding:2px 8px; border-radius:4px; border:1px solid #ccc;">+</button>
          <button onclick="CartManager.removeItem(${item.id})" style="color:red; background:none; border:none; margin-left:5px;">×</button>
        </div>
      </div>
    `).join('');
  }
};

// ==========================================================================
// 4. UI RENDERER & INTERACTION CONTROLLER
// ==========================================================================
const UI = {
  // Show Global Loading
  setLoading(status) {
    AppState.isLoading = status;
    const loader = document.getElementById('globalLoading');
    if (loader) {
      if (status) loader.classList.remove('hidden');
      else loader.classList.add('hidden');
    }
  },

  // Display Toast Notifications
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.style.backgroundColor = type === 'error' ? '#EF4444' : '#4338CA';
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  },

  // Render Product Cards Grid
  renderProducts(productsList, targetContainerId = 'productGrid') {
    const container = document.getElementById(targetContainerId);
    if (!container) return;

    if (!productsList || productsList.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
          <p>Diman alaab ah ma la helin.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = productsList.map(product => `
      <div class="product-card" onclick="UI.openProductModal(${product.id})" style="cursor:pointer;">
        <div class="product-img-wrapper" style="position:relative; width:100%; padding-top:100%; overflow:hidden; border-radius:12px; background:#f3f4f6;">
          <img src="${product.image_url || 'https://via.placeholder.com/200'}" alt="${product.name}" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover;">
        </div>
        <div style="padding: 10px 0;">
          <small style="color:#6B7280; text-transform:uppercase; font-size:10px;">${product.category || 'WaHeN'}</small>
          <h3 style="font-size:14px; margin: 4px 0; font-weight:600;">${product.name}</h3>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
            <strong style="color:#4338CA; font-size:16px;">$${Number(product.price).toFixed(2)}</strong>
            <button 
              onclick="event.stopPropagation(); CartManager.addItem(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
              style="background:#4338CA; color:#fff; border:none; border-radius:6px; padding:6px 10px; cursor:pointer;"
            >
              🛒 +
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  // Open Product Modal
  openProductModal(productId) {
    const product = AppState.products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('productModal');
    const detailContainer = document.getElementById('productDetail');

    detailContainer.innerHTML = `
      <div style="text-align:center;">
        <img src="${product.image_url || 'https://via.placeholder.com/300'}" style="width:100%; max-height:250px; object-fit:contain; border-radius:12px; margin-bottom:15px;">
        <h2>${product.name}</h2>
        <p style="color:#4338CA; font-size:22px; font-weight:bold; margin: 10px 0;">$${Number(product.price).toFixed(2)}</p>
        <p style="color:#4B5563; margin-bottom:20px;">${product.description || 'Alaab tayo sare leh oo WaHeN Marketplace laga heli karo.'}</p>
        <button 
          onclick="CartManager.addItem(${JSON.stringify(product).replace(/"/g, '&quot;')}); UI.closeModal('productModal');" 
          style="width:100%; background:#4338CA; color:white; padding:12px; border:none; border-radius:8px; font-weight:bold; font-size:16px; cursor:pointer;"
        >
          Ku Dar Cart-ka
        </button>
      </div>
    `;

    this.openModal('productModal');
  },

  // Modal Controllers
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');
    if (modal) modal.classList.add('active');
    if (overlay) overlay.classList.add('active');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');
    if (modal) modal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  },

  closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.getElementById('sideMenu')?.classList.remove('active');
    document.getElementById('overlay')?.classList.remove('active');
  }
};

// ==========================================================================
// 5. EVENT LISTENERS SETUP
// ==========================================================================
function setupEventListeners() {
  // Navigation & Side Menu Toggle
  document.getElementById('menuBtn')?.addEventListener('click', () => {
    document.getElementById('sideMenu')?.classList.add('active');
    document.getElementById('overlay')?.classList.add('active');
  });

  document.getElementById('closeMenu')?.addEventListener('click', () => {
    UI.closeAllModals();
  });

  document.getElementById('overlay')?.addEventListener('click', () => {
    UI.closeAllModals();
  });

  // Cart Modal Toggle
  document.getElementById('cartBtn')?.addEventListener('click', () => {
    UI.openModal('cartModal');
  });

  document.getElementById('closeCartModal')?.addEventListener('click', () => {
    UI.closeModal('cartModal');
  });

  document.getElementById('closeProductModal')?.addEventListener('click', () => {
    UI.closeModal('productModal');
  });

  // Category Selector Buttons
  const categoryButtons = document.querySelectorAll('.category-card');
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      categoryButtons.forEach(b => b.classList.remove('active'));
      const card = e.currentTarget;
      card.classList.add('active');

      const category = card.dataset.category;
      AppState.currentCategory = category;

      UI.setLoading(true);
      const products = await ApiService.fetchProductsByCategory(category);
      AppState.filteredProducts = products;
      UI.renderProducts(products);
      UI.setLoading(false);
    });
  });

  // Search Input with Debounce Logic
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  let searchDebounceTimeout;

  searchInput?.addEventListener('input', (e) => {
    const term = e.target.value.trim();
    clearTimeout(searchDebounceTimeout);

    searchDebounceTimeout = setTimeout(async () => {
      if (term.length > 0) {
        UI.setLoading(true);
        const results = await ApiService.searchProducts(term);
        UI.renderProducts(results);
        UI.setLoading(false);
      } else {
        UI.renderProducts(AppState.products);
      }
    }, 350);
  });

  clearSearchBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    UI.renderProducts(AppState.products);
  });

  // Auth Modal Triggers
  document.getElementById('menuGuest')?.addEventListener('click', () => {
    UI.openModal('authModal');
  });

  document.getElementById('closeAuthModal')?.addEventListener('click', () => {
    UI.closeModal('authModal');
  });

  // Toggle Login / Signup Forms
  const authSwitchBtn = document.getElementById('authSwitchBtn');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const authTitle = document.getElementById('authTitle');

  authSwitchBtn?.addEventListener('click', () => {
    const isLoginVisible = !loginForm.classList.contains('hidden');
    if (isLoginVisible) {
      loginForm.classList.add('hidden');
      signupForm.classList.remove('hidden');
      authTitle.textContent = 'Samee Account WaHeN';
      authSwitchBtn.textContent = 'Soo Gal';
    } else {
      signupForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      authTitle.textContent = 'Ku soo dhawoow WaHeN';
      authSwitchBtn.textContent = 'Samee Account';
    }
  });

  // Handle Login Submit
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    UI.setLoading(true);
    const res = await ApiService.login(email, password);
    UI.setLoading(false);

    if (res.success) {
      UI.showToast('Waad soo gashay!');
      UI.closeModal('authModal');
    } else {
      UI.showToast(`Cillad: ${res.error}`, 'error');
    }
  });

  // Checkout Button
  document.getElementById('checkoutBtn')?.addEventListener('click', async () => {
    if (AppState.cart.length === 0) {
      UI.showToast('Cart-kaagu waa madhan yahay!', 'error');
      return;
    }

    const totals = CartManager.getTotals();
    const orderPayload = {
      items: AppState.cart,
      total_price: Number(totals.total),
      delivery_address: AppState.location,
      status: 'pending'
    };

    UI.setLoading(true);
    const res = await ApiService.createOrder(orderPayload);
    UI.setLoading(false);

    if (res.success) {
      UI.showToast('Dalabkaagii si guul leh ayaa loo diray! 🎉');
      CartManager.clearCart();
      UI.closeModal('cartModal');
    } else {
      UI.showToast('Dalabku ma kicin. Fadlan soo gal account-kaaga.', 'error');
      UI.openModal('authModal');
    }
  });
}

// ==========================================================================
// 6. INITIALIZATION ENGINE
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[WaHeN Marketplace] Initializing core services...');
  
  // 1. Initialize Cart state from LocalStorage
  CartManager.init();

  // 2. Setup All Event Handlers
  setupEventListeners();

  // 3. Fetch Initial Products from Supabase
  UI.setLoading(true);
  const products = await ApiService.fetchProducts();
  AppState.products = products;
  AppState.filteredProducts = products;
  
  // 4. Render Initial Screen
  UI.renderProducts(products);
  UI.setLoading(false);

  console.log('[WaHeN Marketplace] Ready!');
});
