/* ==========================================================================
   WAHEN MARKETPLACE — CORE APPLICATION ENGINE (script.js)
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. SUPABASE CONFIGURATION & INITIALIZATION
// --------------------------------------------------------------------------
// Ogow: Ku beddel URL-kaaga iyo Anon Key-gaaga rasmiga ah ee Supabase Dashboard
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-SUPABASE-ANON-KEY-HERE";

let supabaseClient = null;

if (typeof supabase !== "undefined") {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.error("Supabase SDK laguma soo shubin HTML-ka!");
}

// --------------------------------------------------------------------------
// 2. STATE MANAGEMENT (Xogta Guud ee App-ka)
// --------------------------------------------------------------------------
const AppState = {
  products: [],
  filteredProducts: [],
  cart: JSON.parse(localStorage.getItem("wahen_cart")) || [],
  currentUser: JSON.parse(localStorage.getItem("wahen_user")) || null,
  activeCategory: "all",
  activeBrand: null,
  searchQuery: "",
  deliveryFee: 2.00
};

// --------------------------------------------------------------------------
// 3. API SERVICE (Isku Xidhka Supabase Database-ka)
// --------------------------------------------------------------------------
const ApiService = {
  // Soo qaadida Dhammaan Alaabooyinka
  async fetchProducts() {
    if (!supabaseClient) return [];
    try {
      const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching products:", err.message);
      UI.showToast("Cillad ayaa ka dhacday soo qaadista alaabta", "error");
      return [];
    }
  },

  // Soo qaadida Alaabta loo eego Qaybta (Category)
  async fetchProductsByCategory(category) {
    if (!supabaseClient) return [];
    try {
      let query = supabaseClient.from("products").select("*");
      if (category !== "all") {
        query = query.eq("category", category);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error filtering category:", err.message);
      return [];
    }
  },

  // Raadinta Alaabta (Search)
  async searchProducts(keyword) {
    if (!supabaseClient) return [];
    try {
      const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .ilike("name", `%${keyword}%`);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error searching products:", err.message);
      return [];
    }
  },

  // Abuurida Dalab Cusub (Checkout / Order)
  async createOrder(orderData) {
    if (!supabaseClient) return null;
    try {
      const { data, error } = await supabaseClient
        .from("orders")
        .insert([orderData])
        .select();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error creating order:", err.message);
      UI.showToast("Dalabku ma samaysmin, fadlan dib u baroocad.", "error");
      return null;
    }
  },

  // Auth: Soo Gal / Login
  async login(email, password) {
    if (!supabaseClient) return { error: "Supabase laguma xidhin" };
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Auth: Account Samaysasho / SignUp
  async signUp(email, password, userData) {
    if (!supabaseClient) return { error: "Supabase laguma xidhin" };
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: userData }
    });
    return { data, error };
  }
};

// --------------------------------------------------------------------------
// 4. CART MANAGER (Maareynta Gaadhiga Iibsiga)
// --------------------------------------------------------------------------
const CartManager = {
  addItem(product) {
    const existing = AppState.cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      AppState.cart.push({ ...product, quantity: 1 });
    }
    this.saveCart();
    UI.updateCartBadge();
    UI.showToast(`${product.name || 'Alaabta'} waa ku dartay cart-ka!`);
  },

  removeItem(productId) {
    AppState.cart = AppState.cart.filter(item => item.id !== productId);
    this.saveCart();
    UI.updateCartBadge();
    this.renderCartItems();
  },

  updateQuantity(productId, delta) {
    const item = AppState.cart.find(item => item.id === productId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeItem(productId);
      } else {
        this.saveCart();
        UI.updateCartBadge();
        this.renderCartItems();
      }
    }
  },

  clearCart() {
    AppState.cart = [];
    this.saveCart();
    UI.updateCartBadge();
    this.renderCartItems();
  },

  saveCart() {
    localStorage.setItem("wahen_cart", JSON.stringify(AppState.cart));
  },

  getTotals() {
    const subtotal = AppState.cart.reduce(
      (sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity,
      0
    );
    const total = subtotal > 0 ? subtotal + AppState.deliveryFee : 0;
    return { subtotal, delivery: AppState.deliveryFee, total };
  },

  renderCartItems() {
    const container = document.getElementById("cartItems");
    if (!container) return;

    if (AppState.cart.length === 0) {
      container.innerHTML = `<p class="empty-cart-msg">Cart-kaagu waa faaruq!</p>`;
      this.updateSummaryHTML(0, 0, 0);
      return;
    }

    container.innerHTML = AppState.cart
      .map(
        item => `
        <div class="cart-item-card" data-id="${item.id}">
          <img src="${item.image || 'logo.png'}" alt="${item.name}" onerror="this.src='logo.png'">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <span class="price">$${parseFloat(item.price).toFixed(2)}</span>
          </div>
          <div class="cart-qty-controls">
            <button onclick="CartManager.updateQuantity('${item.id}', -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="CartManager.updateQuantity('${item.id}', 1)">+</button>
          </div>
          <button class="remove-btn" onclick="CartManager.removeItem('${item.id}')">×</button>
        </div>
      `
      )
      .join("");

    const totals = this.getTotals();
    this.updateSummaryHTML(totals.subtotal, totals.delivery, totals.total);
  },

  updateSummaryHTML(sub, del, tot) {
    const subEl = document.getElementById("cartSubtotal");
    const delEl = document.getElementById("cartDelivery");
    const totEl = document.getElementById("cartTotal");

    if (subEl) subEl.textContent = `$${sub.toFixed(2)}`;
    if (delEl) delEl.textContent = `$${del.toFixed(2)}`;
    if (totEl) totEl.textContent = `$${tot.toFixed(2)}`;
  }
};

// --------------------------------------------------------------------------
// 5. UI & ROUTING CONTROLLER
// --------------------------------------------------------------------------
const UI = {
  init() {
    this.bindGlobalEvents();
    this.updateCartBadge();
    this.checkAuthStatus();
    this.loadInitialPageData();
  },

  // Soo Muujinta Kaadhadhka Alaabta (Products Grid)
  renderProducts(products, containerId = "productGrid") {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!products || products.length === 0) {
      container.innerHTML = `<div class="no-results"><p>Wax alaab ah ma la helin.</p></div>`;
      return;
    }

    container.innerHTML = products
      .map(
        p => `
        <div class="product-card" data-id="${p.id}">
          <div class="product-image-wrap">
            <img src="${p.image || 'logo.png'}" alt="${p.name}" onerror="this.src='logo.png'">
          </div>
          <div class="product-details">
            <span class="category-tag">${p.category || 'WaHeN'}</span>
            <h3 class="product-title">${p.name}</h3>
            <div class="product-bottom">
              <span class="price">$${parseFloat(p.price || 0).toFixed(2)}</span>
              <button class="add-to-cart-btn" onclick="CartManager.addItem(${JSON.stringify(p).replace(/"/g, '&quot;')})">🛒 +</button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  },

  updateCartBadge() {
    const badge = document.getElementById("cartCount");
    if (badge) {
      const count = AppState.cart.reduce((total, item) => total + item.quantity, 0);
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
    }
  },

  showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
      toast.className = "toast";
    }, 3000);
  },

  checkAuthStatus() {
    const guestMenu = document.getElementById("menuGuest");
    if (guestMenu && AppState.currentUser) {
      guestMenu.innerHTML = `
        <div class="menu-avatar">👤</div>
        <div>
          <strong>${AppState.currentUser.user_metadata?.full_name || 'Macmiil'}</strong>
          <small>${AppState.currentUser.email}</small>
        </div>
      `;
    }
  },

  async loadInitialPageData() {
    const currentPage = window.location.pathname.split("/").pop();

    // Loading State
    const grid = document.getElementById("productGrid");
    if (grid) {
      grid.innerHTML = `<div class="loading-card"><div class="loading-spinner"></div><p>Raadinaya alaabo...</p></div>`;
    }

    // Xogta bogga Index/Home ka soo qaad
    if (currentPage === "" || currentPage === "index.html" || currentPage === "home.html") {
      AppState.products = await ApiService.fetchProducts();
      AppState.filteredProducts = AppState.products;
      this.renderProducts(AppState.filteredProducts);
    }
  },

  // ------------------------------------------------------------------------
  // 6. EVENT LISTENERS (Dhagaysiga Taabashada)
  // ------------------------------------------------------------------------
  bindGlobalEvents() {
    // Menu Controls
    const menuBtn = document.getElementById("menuBtn");
    const closeMenu = document.getElementById("closeMenu");
    const sideMenu = document.getElementById("sideMenu");
    const overlay = document.getElementById("overlay");

    const toggleMenu = (show) => {
      if (sideMenu) sideMenu.classList.toggle("open", show);
      if (overlay) overlay.classList.toggle("show", show);
    };

    if (menuBtn) menuBtn.addEventListener("click", () => toggleMenu(true));
    if (closeMenu) closeMenu.addEventListener("click", () => toggleMenu(false));
    if (overlay) overlay.addEventListener("click", () => toggleMenu(false));

    // Cart Modal Controls
    const cartBtn = document.getElementById("cartBtn");
    const closeCartModal = document.getElementById("closeCartModal");
    const cartModal = document.getElementById("cartModal");

    if (cartBtn) {
      cartBtn.addEventListener("click", () => {
        CartManager.renderCartItems();
        if (cartModal) cartModal.classList.add("open");
      });
    }

    if (closeCartModal) {
      closeCartModal.addEventListener("click", () => {
        if (cartModal) cartModal.classList.remove("open");
      });
    }

    // Search Input Debounce
    const searchInput = document.getElementById("searchInput");
    let searchTimeout;
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        searchTimeout = setTimeout(async () => {
          if (query.length > 0) {
            const results = await ApiService.searchProducts(query);
            this.renderProducts(results);
          } else {
            this.renderProducts(AppState.products);
          }
        }, 350);
      });
    }

    // Navigation Links (Routing dhammaan pages-ka HTML)
    document.querySelectorAll("[data-menu], [data-bottom]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const target = btn.dataset.menu || btn.dataset.bottom;
        this.navigateToPage(target);
      });
    });

    // Checkout Action
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", async () => {
        if (AppState.cart.length === 0) {
          this.showToast("Cart-kaagu waa faaruq!", "error");
          return;
        }
        
        const totals = CartManager.getTotals();
        const orderData = {
          items: AppState.cart,
          total_amount: totals.total,
          status: "pending",
          user_id: AppState.currentUser ? AppState.currentUser.id : null,
          created_at: new Date()
        };

        const res = await ApiService.createOrder(orderData);
        if (res) {
          this.showToast("Dalabkaaga waa la guddoomay!", "success");
          CartManager.clearCart();
          if (cartModal) cartModal.classList.remove("open");
        }
      });
    }
  },

  // Bogagga HTML Routing-kooda
  navigateToPage(pageKey) {
    const routes = {
      home: "home.html",
      index: "index.html",
      admin: "admin.html",
      buyer: "buyer.html",
      contact: "contact.html",
      signup: "create-account.html",
      login: "login.html",
      seller: "seller.html",
      support: "support.html"
    };

    if (routes[pageKey]) {
      window.location.href = routes[pageKey];
    }
  }
};

// --------------------------------------------------------------------------
// 7. INITIALIZE ENGINE ON DOM LOADED
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  UI.init();
});
