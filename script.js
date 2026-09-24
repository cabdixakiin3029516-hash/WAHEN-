/* ==========================================================================
   WAHEN MARKETPLACE — HYBRID MOBILE & WEB ENGINE (script.js)
   Compatible with: iOS, Android (WebView/PWA), and Web Browsers
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. SUPABASE CONFIGURATION (Anon Key & Public URL)
// --------------------------------------------------------------------------
const SUPABASE_URL = "https://hkmtlyknwsqxuxmvfaqv.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE"; // Ku beddel Anon Public Key-gaaga Supabase Project Settings

let supabaseClient = null;

if (typeof supabase !== "undefined") {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
} else {
  console.error("Supabase SDK laguma soo shubin HTML-ka! Fadlan ku dar CDN-ka Supabase.");
}

// --------------------------------------------------------------------------
// 2. GLOBAL APP STATE MANAGEMENT
// --------------------------------------------------------------------------
const AppState = {
  products: [],
  filteredProducts: [],
  categories: [],
  cart: JSON.parse(localStorage.getItem("wahen_cart")) || [],
  currentUser: JSON.parse(localStorage.getItem("wahen_user")) || null,
  userProfile: JSON.parse(localStorage.getItem("wahen_profile")) || null,
  activeCategory: "all",
  searchQuery: "",
  deliveryFee: 2.00,
  unreadNotifications: 0
};

// --------------------------------------------------------------------------
// 3. API & BACKEND SERVICES (Supabase Integration)
// --------------------------------------------------------------------------
const ApiService = {
  // --- Products & Categories ---
  async fetchProducts() {
    if (!supabaseClient) return [];
    try {
      const { data, error } = await supabaseClient
        .from("products")
        .select(`
          *,
          shops (id, name, seller_id),
          categories (id, name)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching products:", err.message);
      UI.showToast("Cillad ayaa ka dhacday soo qaadista alaabta", "error");
      return [];
    }
  },

  async fetchCategories() {
    if (!supabaseClient) return [];
    try {
      const { data, error } = await supabaseClient
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching categories:", err.message);
      return [];
    }
  },

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

  // --- Atomic RPC Checkout ---
  async executeAtomicCheckout(deliveryAddressId, paymentMethod) {
    if (!supabaseClient) return { success: false, error: "Supabase client not initialized" };
    if (!AppState.currentUser) return { success: false, error: "Fadlan soo gal si aad u iibsato alaabta" };
    if (AppState.cart.length === 0) return { success: false, error: "Cart-kaagu waa faaruq!" };

    const formattedCartItems = AppState.cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: parseFloat(item.price)
    }));

    const payload = {
      p_buyer_id: AppState.currentUser.id,
      p_shop_id: AppState.cart[0].shop_id || AppState.cart[0].shops?.id,
      p_delivery_address_id: deliveryAddressId,
      p_payment_method: paymentMethod,
      p_cart_items: formattedCartItems,
      p_delivery_fee: AppState.deliveryFee
    };

    try {
      const { data, error } = await supabaseClient.rpc("process_checkout", payload);
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Checkout RPC Error:", err.message);
      return { success: false, error: err.message };
    }
  },

  // --- Auth & User Profile ---
  async login(email, password) {
    if (!supabaseClient) return { error: { message: "Backend offline" } };
    const res = await supabaseClient.auth.signInWithPassword({ email, password });
    if (res.data?.user) {
      AppState.currentUser = res.data.user;
      localStorage.setItem("wahen_user", JSON.stringify(res.data.user));
      await this.fetchUserProfile(res.data.user.id);
    }
    return res;
  },

  async signUp(email, password, fullName, phone) {
    if (!supabaseClient) return { error: { message: "Backend offline" } };
    return await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phone
        }
      }
    });
  },

  async logout() {
    if (supabaseClient) await supabaseClient.auth.signOut();
    AppState.currentUser = null;
    AppState.userProfile = null;
    localStorage.removeItem("wahen_user");
    localStorage.removeItem("wahen_profile");
    window.location.reload();
  },

  async fetchUserProfile(userId) {
    if (!supabaseClient || !userId) return;
    try {
      const { data } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        AppState.userProfile = data;
        localStorage.setItem("wahen_profile", JSON.stringify(data));
      }
    } catch (err) {
      console.error("Error fetching profile:", err.message);
    }
  },

  // --- Real-time Notifications ---
  async fetchNotifications() {
    if (!supabaseClient || !AppState.currentUser) return [];
    try {
      const { data, error } = await supabaseClient
        .from("notifications")
        .select("*")
        .eq("user_id", AppState.currentUser.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error notifications:", err.message);
      return [];
    }
  }
};

// --------------------------------------------------------------------------
// 4. SHOPPING CART MANAGER
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
            <button type="button" onclick="CartManager.updateQuantity('${item.id}', -1)">-</button>
            <span>${item.quantity}</span>
            <button type="button" onclick="CartManager.updateQuantity('${item.id}', 1)">+</button>
          </div>
          <button type="button" class="remove-btn" onclick="CartManager.removeItem('${item.id}')">×</button>
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
// 5. USER INTERFACE (UI) & EVENT CONTROLLER
// --------------------------------------------------------------------------
const UI = {
  async init() {
    this.bindGlobalEvents();
    this.updateCartBadge();
    this.checkAuthStatus();
    await this.loadInitialPageData();
    this.initRealtimeNotifications();
  },

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
            <span class="category-tag">${p.categories?.name || 'WaHeN'}</span>
            <h3 class="product-title">${p.name}</h3>
            <div class="product-bottom">
              <span class="price">$${parseFloat(p.price || 0).toFixed(2)}</span>
              <button type="button" class="add-to-cart-btn" onclick='CartManager.addItem(${JSON.stringify(p).replace(/'/g, "&apos;")})'>🛒 +</button>
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
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
      toast.className = "toast";
    }, 3500);
  },

  checkAuthStatus() {
    const guestMenu = document.getElementById("menuGuest");
    if (guestMenu && AppState.currentUser) {
      guestMenu.innerHTML = `
        <div class="menu-avatar">👤</div>
        <div>
          <strong>${AppState.userProfile?.full_name || AppState.currentUser.email}</strong>
          <small>${AppState.currentUser.email}</small>
        </div>
      `;
    }
  },

  async loadInitialPageData() {
    const grid = document.getElementById("productGrid");
    if (grid) {
      grid.innerHTML = `<div class="loading-card"><div class="loading-spinner"></div><p>Raadinaya alaabo...</p></div>`;
    }

    AppState.products = await ApiService.fetchProducts();
    AppState.filteredProducts = AppState.products;
    this.renderProducts(AppState.filteredProducts);
  },

  // --- Real-time Websocket Notification Listener ---
  initRealtimeNotifications() {
    if (!supabaseClient || !AppState.currentUser) return;

    supabaseClient
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${AppState.currentUser.id}`
        },
        (payload) => {
          const notif = payload.new;
          this.showToast(`${notif.title}: ${notif.message}`, "info");

          const badge = document.getElementById("notifCountBadge");
          if (badge) {
            AppState.unreadNotifications += 1;
            badge.textContent = AppState.unreadNotifications;
            badge.style.display = "inline-block";
          }
        }
      )
      .subscribe();
  },

  bindGlobalEvents() {
    // 1. Menu Controls
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
    if (overlay) overlay.addEventListener("click", () => {
      toggleMenu(false);
      this.closeAllModals();
    });

    // 2. Cart Modal Controls
    const cartBtn = document.getElementById("cartBtn");
    const closeCartModal = document.getElementById("closeCartModal");
    const cartModal = document.getElementById("cartModal");

    if (cartBtn) {
      cartBtn.addEventListener("click", () => {
        CartManager.renderCartItems();
        if (cartModal) cartModal.classList.add("open");
        if (overlay) overlay.classList.add("show");
      });
    }

    if (closeCartModal) {
      closeCartModal.addEventListener("click", () => {
        if (cartModal) cartModal.classList.remove("open");
        if (overlay) overlay.classList.remove("show");
      });
    }

    // 3. Search Input Debounce
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
        }, 300);
      });
    }

    // 4. Checkout Handler (Atomic Execution)
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", async () => {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = "Iibintu wey socotaa...";

        // Address ID iyo Payment Method (Badal ama ka saar UI-gaaga)
        const addressId = "00000000-0000-0000-0000-000000000000"; 
        const paymentMethod = "Zaad / eDahab";

        const res = await ApiService.executeAtomicCheckout(addressId, paymentMethod);

        if (res.success) {
          this.showToast(res.message || "Order-kaagu si guul leh ayaa loo kaydiyay!", "success");
          CartManager.clearCart();
          if (cartModal) cartModal.classList.remove("open");
          if (overlay) overlay.classList.remove("show");
        } else {
          this.showToast(res.error || "Cillad ayaa ka dhacday checkout-ka", "error");
        }

        checkoutBtn.disabled = false;
        checkoutBtn.textContent = "Dhammaystir Iibsiga";
      });
    }
  },

  closeAllModals() {
    document.querySelectorAll(".modal").forEach(m => m.classList.remove("open"));
    const sideMenu = document.getElementById("sideMenu");
    const overlay = document.getElementById("overlay");
    if (sideMenu) sideMenu.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
  }
};

// --------------------------------------------------------------------------
// 6. INITIALIZE APPLICATION ENGINE ON DOM LOAD
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  UI.init();
});
