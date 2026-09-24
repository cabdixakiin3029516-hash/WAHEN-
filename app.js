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
    AppState.cart = AppState.cart.filter(item => item.id === productId);
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
          <p style="color: #6B7280; font-size: 13px;">Cart-kaagu wuu madhan yahay.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = AppState.cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.image_url || 'https://via.placeholder.com/60'}" alt="${item.name}" />
        </div>
        <div class="cart-item-info">
          <strong>${item.name}</strong>
          <small>$${item.price.toFixed(2)}</small>
        </div>
        <div class="quantity-control">
          <button onclick="CartManager.updateQuantity(${item.id}, -1)" style="padding: 2px 8px; border-radius: 6px; background: #eee;">-</button>
          <span style="font-size: 12px; font-weight: bold;">${item.quantity}</span>
          <button onclick="CartManager.updateQuantity(${item.id}, 1)" style="padding: 2px 8px; border-radius: 6px; background: #eee;">+</button>
          <button onclick="CartManager.removeItem(${item.id})" style="color: red; background: none; margin-left: 8px; font-size: 16px;">×</button>
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
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 85px;
        left: 50%;
        transform: translateX(-50%);
        background: #4338CA;
        color: white;
        padding: 10px 20px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
        z-index: 2000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        transition: opacity 0.3s ease;
        opacity: 0;
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.backgroundColor = type === 'error' ? '#DC2626' : '#4338CA';
    toast.style.opacity = '1';

    setTimeout(() => {
      toast.style.opacity = '0';
    }, 3000);
  },

  // Render Product Cards Grid
  renderProducts(productsList, targetContainerId = 'productGrid') {
    const container = document.getElementById(targetContainerId);
    if (!container) return;

    if (!productsList || productsList.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">
          <p>Dhaman alaab ah ma la helin.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = productsList.map(product => `
      <div class="product-card" onclick="UI.openProductModal(${product.id})">
        <div class="product-image">
          <img src="${product.image_url || 'https://via.placeholder.com/200'}" alt="${product.name}" loading="lazy">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
          <button class="product-favorite" onclick="event.stopPropagation(); UI.showToast('Waa lagu daray kuwa aad jeceshahay!')">♥</button>
        </div>
        <div class="product-body">
          <span class="product-category">${product.category || 'NAADIR'}</span>
          <h3 class="product-name">${product.name}</h3>
          <div class="product-price-row">
            <span class="product-price">$${Number(product.price).toFixed(2)}</span>
            <button 
              class="add-product-btn"
              onclick="event.stopPropagation(); CartManager.addItem(${JSON.stringify(product).replace(/"/g, '&quot;')})"
            >
              +
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

    if (!detailContainer) return;

    detailContainer.innerHTML = `
      <div class="detail-image">
        <img src="${product.image_url || 'https://via.placeholder.com/300'}" alt="${product.name}">
      </div>
      <div class="detail-info">
        <span class="detail-category">${product.category || 'NAADIR'}</span>
        <h2 class="detail-name">${product.name}</h2>
        <p class="detail-description">${product.description || 'Alaab tayo sare leh oo WaHeN Marketplace laga heli karo.'}</p>
        <div class="detail-price">$${Number(product.price).toFixed(2)}</div>
        
        <div class="detail-actions">
          <button 
            onclick="CartManager.addItem(${JSON.stringify(product).replace(/"/g, '&quot;')}); UI.closeModal('productModal');" 
            style="flex: 1; background: var(--primary); color: white; padding: 14px; border-radius: 14px; font-weight: bold; border: none; font-size: 14px;"
          >
            Ku Dar Cart-ka 🛒
          </button>
        </div>
      </div>
    `;

    this.openModal('productModal');
  },

  // Modal Controllers
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');
    if (modal) modal.classList.add('show');
    if (overlay) overlay.classList.add('show');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');
    if (modal) modal.classList.remove('show');
    
    // Haddii ayan jirin modal kale oo furan, overlay-ga xidh
    const activeModals = document.querySelectorAll('.modal.show');
    if (activeModals.length === 0 && overlay) {
      overlay.classList.remove('show');
    }
  },

  closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
    document.getElementById('sideMenu')?.classList.remove('open');
    document.getElementById('overlay')?.classList.remove('show');
  }
};

// ==========================================================================
// 5. EVENT LISTENERS SETUP
// ==========================================================================
function setupEventListeners() {
  // Navigation & Side Menu Toggle
  document.getElementById('menuBtn')?.addEventListener('click', () => {
    document.getElementById('sideMenu')?.classList.add('open');
    document.getElementById('overlay')?.classList.add('show');
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

  // Bottom Navigation (5 Qaybood)
  const bottomItems = document.querySelectorAll('.bottom-item');
  bottomItems.forEach(item => {
    item.addEventListener('click', (e) => {
      bottomItems.forEach(b => b.classList.remove('active'));
      const btn = e.currentTarget;
      btn.classList.add('active');

      const targetSection = btn.dataset.target;
      if (targetSection === 'naadir') {
        UI.renderProducts(AppState.products);
      } else if (targetSection === 'jumlo') {
        const wholesale = AppState.products.filter(p => p.category === 'jumlo');
        UI.renderProducts(wholesale);
      } else if (targetSection === 'support') {
        UI.showToast('Nala soo xidhiidh Support: +252 63 XXXXXXX');
      } else if (targetSection === 'settings') {
        UI.openModal('authModal');
      }
    });
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

  // Search Input with Debounce
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  let searchDebounceTimeout;

  searchInput?.addEventListener('input', (e) => {
    const term = e.target.value.trim();
    if (clearSearchBtn) clearSearchBtn.style.display = term ? 'block' : 'none';

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
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    UI.renderProducts(AppState.products);
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
  console.log('[WaHeN Marketplace] Engine initializing...');

  // 1. Initialize Cart
  CartManager.init();

  // 2. Setup Events
  setupEventListeners();

  // 3. Fetch Products
  UI.setLoading(true);
  const products = await ApiService.fetchProducts();
  AppState.products = products;
  AppState.filteredProducts = products;

  // 4. Render Initial Grid
  UI.renderProducts(products);
  UI.setLoading(false);

  console.log('[WaHeN Marketplace] Fully active and running!');
});
