const products = [
  { id: 1, name: "Men's Jacket", price: 135, icon: "🧥", category: "ragga", rating: 4.5 },
  { id: 2, name: "Women's Dress", price: 145, icon: "👗", category: "haween", rating: 4.8 },
  { id: 3, name: "Sport Shoes", price: 200, icon: "👟", category: "ragga", rating: 4.6 },
  { id: 4, name: "Men Shirt", price: 35, icon: "👔", category: "ragga", rating: 4.5 },
  { id: 5, name: "Kids Toy", price: 18, icon: "🧸", category: "caruur", rating: 4.7 },
  { id: 6, name: "Perfume", price: 28, icon: "🧴", category: "beauty", rating: 4.8 },
  { id: 7, name: "Rice", price: 32, icon: "🍚", category: "cunto", rating: 4.4 },
  { id: 8, name: "Smartphone", price: 180, icon: "📱", category: "electronics", rating: 4.7 },
  { id: 9, name: "Headphones", price: 35, icon: "🎧", category: "electronics", rating: 4.5 },
  { id: 10, name: "Laptop", price: 450, icon: "💻", category: "electronics", rating: 4.8 },
  { id: 11, name: "Sofa", price: 250, icon: "🛋️", category: "guri", rating: 4.6 },
  { id: 12, name: "Work Tools", price: 75, icon: "🧰", category: "dhisme", rating: 4.6 },
  { id: 13, name: "Women's Bag", price: 40, icon: "👜", category: "haween", rating: 4.6 },
  { id: 14, name: "Fashion Glasses", price: 20, icon: "🕶️", category: "beauty", rating: 4.5 }
];

const orders = [
  { name: "Men's Jacket", code: "WH-2026-001", status: "Shipped", cls: "shipped" },
  { name: "Smartphone", code: "WH-2026-014", status: "Pending", cls: "pending" },
  { name: "Women's Bag", code: "WH-2026-021", status: "Delivered", cls: "delivered" }
];

const state = {
  activeView: "home",
  activeCategory: "all",
  query: "",
  cart: JSON.parse(localStorage.getItem("wahen-cart") || "[]"),
  favorites: new Set(JSON.parse(localStorage.getItem("wahen-favorites") || "[]")),
  dark: localStorage.getItem("wahen-theme") === "dark"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const money = (value) => `$${Number(value).toFixed(2)}`;

function saveState() {
  localStorage.setItem("wahen-cart", JSON.stringify(state.cart));
  localStorage.setItem("wahen-favorites", JSON.stringify([...state.favorites]));
  localStorage.setItem("wahen-theme", state.dark ? "dark" : "light");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function updateTheme() {
  document.body.classList.toggle("dark", state.dark);
  const toggle = document.getElementById("theme-toggle");
  toggle.textContent = state.dark ? "☀️" : "🌙";
  saveState();
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  const filtered = products.filter((product) => {
    const matchesQuery = !state.query || product.name.toLowerCase().includes(state.query);
    const matchesCategory = state.activeCategory === "all" || product.category === state.activeCategory;
    return matchesQuery && matchesCategory;
  });

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-text" style="grid-column: 1 / -1; padding: 12px 0;">Alaab lama helin.</div>';
    return;
  }

  grid.innerHTML = filtered.map((product) => {
    const isLiked = state.favorites.has(product.name);
    return `
      <article class="product-card" data-product-id="${product.id}">
        <button class="favorite-btn ${isLiked ? "liked" : ""}" type="button" data-favorite="${product.id}" aria-label="Add to favorites">
          ${isLiked ? "♥" : "♡"}
        </button>
        <div class="product-figure" aria-hidden="true">${product.icon}</div>
        <div class="product-body">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-price">${money(product.price)}</div>
          <div class="product-rating">★ ${product.rating}</div>
          <button class="product-add" type="button" data-add="${product.id}">🛒 Add to cart</button>
        </div>
      </article>
    `;
  }).join("");
}

function updateCartCount() {
  const total = state.cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cart-count").textContent = total;
}

function renderBuyerOrders() {
  const list = document.getElementById("buyer-order-list");
  list.innerHTML = orders.map((order) => `
    <div class="order-item">
      <div class="order-meta">
        <strong>${order.name}</strong>
        <small>${order.code}</small>
      </div>
      <span class="status-tag ${order.cls}">${order.status}</span>
    </div>
  `).join("");

  const favoriteTotal = document.getElementById("favorite-total");
  if (favoriteTotal) favoriteTotal.textContent = state.favorites.size;
}

function setActiveView(viewName) {
  state.activeView = viewName;
  $$('.view').forEach((view) => view.classList.toggle("active", view.dataset.view === viewName));
  $$('.tab').forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewName));
  $$('.nav-item').forEach((nav) => {
    const active = nav.dataset.view === viewName;
    nav.classList.toggle("active", active);
  });
}

function getProductById(id) {
  return products.find((item) => item.id === Number(id));
}

function addToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const existing = state.cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id: product.id, qty: 1 });
  }

  updateCartCount();
  saveState();
  showToast(`${product.name} added to cart`);
}

function openModal(title, bodyHtml) {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-head">
        <h2>${title}</h2>
        <button class="modal-close" type="button" aria-label="Close">×</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
    </div>
  `;

  const closeBtn = overlay.querySelector(".modal-close");
  closeBtn.addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
  return overlay;
}

function openProductDetail(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const similar = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3)
    .map((item) => item.name)
    .join(", ");

  const panel = openModal(product.name, `
    <div class="modal-product">
      <div class="modal-product-icon" aria-hidden="true">${product.icon}</div>
      <div>
        <h3>${product.name}</h3>
        <div class="modal-price">${money(product.price)}</div>
        <div class="modal-rating">★★★★★ ${product.rating}</div>
        <p class="empty-text">${similar ? `Similar: ${similar}` : "More items in this category."}</p>
      </div>
    </div>
    <div class="modal-actions">
      <button class="primary-btn" type="button" data-buy="${product.id}">Buy now</button>
      <button class="secondary-btn" type="button" data-add-modal="${product.id}">Add to cart</button>
    </div>
  `);

  panel.querySelector("[data-buy]")?.addEventListener("click", () => {
    addToCart(product.id);
    overlayToCheckout();
    panel.remove();
  });

  panel.querySelector("[data-add-modal]")?.addEventListener("click", () => {
    addToCart(product.id);
    panel.remove();
  });
}

function openCart() {
  const total = state.cart.reduce((sum, item) => {
    const product = getProductById(item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);

  const rows = state.cart.length
    ? state.cart.map((item, index) => {
        const product = getProductById(item.id);
        return `
          <div class="cart-row">
            <span>${product ? product.icon : "🛍️"} ${product ? product.name : "Product"} × ${item.qty}</span>
            <div style="display:flex; align-items:center; gap:10px;">
              <strong>${money((product ? product.price : 0) * item.qty)}</strong>
              <button class="remove-btn" type="button" data-remove-index="${index}">Remove</button>
            </div>
          </div>
        `;
      }).join("")
    : '<p class="empty-text">Gaadhigu wuu madhan yahay.</p>';

  const panel = openModal("Gaadhiga wax iibsiga", `
    <div>${rows}</div>
    <div class="checkout-line">
      <strong>Wadarta</strong>
      <strong>${money(total)}</strong>
    </div>
    ${state.cart.length ? '<div class="modal-actions"><button class="primary-btn" type="button" data-checkout>Checkout</button><button class="secondary-btn" type="button" data-track>Track order</button></div>' : ''}
  `);

  panel.querySelectorAll("[data-remove-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.removeIndex);
      state.cart.splice(index, 1);
      updateCartCount();
      saveState();
      panel.remove();
      openCart();
    });
  });

  const checkoutBtn = panel.querySelector("[data-checkout]");
  if (checkoutBtn) checkoutBtn.addEventListener("click", () => {
    panel.remove();
    overlayToCheckout();
  });

  const trackBtn = panel.querySelector("[data-track]");
  if (trackBtn) trackBtn.addEventListener("click", () => {
    panel.remove();
    openTracking();
  });
}

function overlayToCheckout() {
  const total = state.cart.reduce((sum, item) => {
    const product = getProductById(item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);

  const panel = openModal("Checkout", `
    <form id="checkout-form" class="form-grid">
      <label>
        Magacaaga
        <input type="text" placeholder="Magaca oo buuxa" required />
      </label>
      <label>
        Taleefonka
        <input type="tel" placeholder="+252..." required />
      </label>
      <label>
        Cinwaanka keenista
        <input type="text" placeholder="Magaalada iyo booskayga" required />
      </label>
      <label>
        Habka lacag bixinta
        <select>
          <option>EVC Plus</option>
          <option>Zaad</option>
          <option>Cash on delivery</option>
        </select>
      </label>
      <div class="checkout-line">
        <strong>Wadarta</strong>
        <strong>${money(total)}</strong>
      </div>
      <button class="primary-btn" type="submit">Xaqiiji dalabka</button>
    </form>
  `);

  panel.querySelector("#checkout-form").addEventListener("submit", (event) => {
    event.preventDefault();
    panel.remove();
    state.cart = [];
    updateCartCount();
    saveState();
    showToast("Dalabka waa la xaqiijiyay");
    openModal("Dalabka waa la helay ✅", '<p>Waad ku mahadsan tahay. Lambarka dalabkaagu waa <strong>WH-2026-001</strong>.</p>');
  });
}

function openTracking() {
  openModal("Dabagalka dalabka", `
    <p><strong>WH-2026-001</strong> · Darawal: Maxamed A. · ETA: 2 maalmood</p>
    <div class="modal-actions">
      <button class="secondary-btn" type="button">✅ La soo saaray</button>
      <button class="secondary-btn" type="button">📦 La xajiray</button>
      <button class="secondary-btn" type="button">🚚 Jidka oo socota</button>
      <button class="secondary-btn" type="button">🏠 La keenay</button>
    </div>
  `);
}

function openMenu() {
  const panel = openModal("WaHeN Menu", `
    <div class="modal-actions">
      <button class="secondary-btn" type="button" data-menu-account>Buyer account</button>
      <button class="secondary-btn" type="button" data-menu-orders>My orders</button>
      <button class="secondary-btn" type="button" data-menu-favorites>Favorites</button>
    </div>
  `);

  panel.querySelector("[data-menu-account]")?.addEventListener("click", () => {
    panel.remove();
    openAuthModal();
  });

  panel.querySelector("[data-menu-orders]")?.addEventListener("click", () => {
    panel.remove();
    openTracking();
  });

  panel.querySelector("[data-menu-favorites]")?.addEventListener("click", () => {
    panel.remove();
    const items = state.favorites.size ? [...state.favorites].join(", ") : "Waxba ma jecel tahay hada.";
    openModal("Favorites", `<p>${items}</p>`);
  });
}

function openAuthModal(mode = "login") {
  const isLogin = mode === "login";

  const panel = openModal(isLogin ? "Soo gal" : "Samee account", `
    <form id="auth-form" class="form-grid">
      ${!isLogin ? '<label>Magaca<input type="text" placeholder="Magacaaga" required /></label>' : ""}
      <label>Email
        <input type="email" placeholder="email@example.com" required />
      </label>
      <label>Password
        <input type="password" placeholder="••••••••" required />
      </label>
      ${!isLogin ? '<label>Doorka<select><option>Buyer</option><option>Seller</option></select></label>' : ""}
      <button class="primary-btn" type="submit">${isLogin ? "Soo gal" : "Isdiiwaangeli"}</button>
      <button class="auth-link" type="button" data-auth-toggle>${isLogin ? "Samee account cusub" : "Haddii horeba aad leedahay account"}</button>
    </form>
  `);

  const form = panel.querySelector("#auth-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    panel.remove();
    showToast(isLogin ? "Logged in successfully" : "Account created successfully");
  });

  panel.querySelector("[data-auth-toggle]")?.addEventListener("click", () => {
    panel.remove();
    openAuthModal(isLogin ? "signup" : "login");
  });
}

function handleActionClick(action) {
  switch (action) {
    case "show-all":
      state.activeCategory = "all";
      document.querySelectorAll(".category").forEach((button) => button.classList.remove("active"));
      renderProducts();
      document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
      break;
    case "shop-now":
      setActiveView("home");
      document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
      break;
    case "view-orders":
      setActiveView("buyer");
      openTracking();
      break;
    case "favorites":
      if (!state.favorites.size) {
        showToast("Wax favorites ah ma jiraan");
        return;
      }
      openModal("Favorites", `<p>${[...state.favorites].join(", ")}</p>`);
      break;
    case "add-product":
      openModal("Add Product", `
        <form class="form-grid">
          <label>Product name<input type="text" value="New Product" required /></label>
          <label>Price<input type="number" value="99" required /></label>
          <label>Category<select><option>ragga</option><option>haween</option><option>electronics</option></select></label>
          <button class="primary-btn" type="submit">Save</button>
        </form>
      `);
      break;
    case "inventory":
      openModal("Inventory", '<p>Stock level: 500 items available.</p>');
      break;
    case "seller-orders":
      openModal("Orders", '<p>12 new orders pending.</p>');
      break;
    case "promotions":
      openModal("Promotions", '<p>Flash sale: 20% off this weekend.</p>');
      break;
    case "manage-users":
      openModal("Users", '<p>9,410 active users.</p>');
      break;
    case "manage-products":
      openModal("Products", '<p>1,245 products available.</p>');
      break;
    case "manage-orders":
      openModal("Orders", '<p>1,284 processed orders.</p>');
      break;
    case "settings":
      openModal("Settings", '<p>Marketplace controls are online.</p>');
      break;
    case "export":
      showToast("Sales report exported");
      break;
    case "store-profile":
      openModal("My Store", '<p>WaHeN Store — 4.8 rating | 248 reviews.</p>');
      break;
    case "categories":
      document.getElementById("category-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
      break;
    default:
      break;
  }
}

function bindEvents() {
  document.getElementById("theme-toggle").addEventListener("click", () => {
    state.dark = !state.dark;
    updateTheme();
  });

  document.getElementById("product-search").addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderProducts();
  });

  document.getElementById("search-form").addEventListener("submit", (event) => event.preventDefault());

  document.getElementById("cart-btn").addEventListener("click", openCart);
  document.getElementById("menu-btn").addEventListener("click", openMenu);

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setActiveView(tab.dataset.view));
  });

  document.querySelectorAll(".nav-item").forEach((nav) => {
    nav.addEventListener("click", () => {
      const view = nav.dataset.view;
      if (view) setActiveView(view);
      const action = nav.dataset.action;
      if (action) handleActionClick(action);
    });
  });

  document.querySelectorAll(".category").forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;
      state.activeCategory = category;
      document.querySelectorAll(".category").forEach((item) => item.classList.toggle("active", item === button));
      renderProducts();
      document.getElementById("product-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    if (action) {
      handleActionClick(action.dataset.action);
      return;
    }

    const addBtn = event.target.closest("[data-add]");
    if (addBtn) {
      addToCart(addBtn.dataset.add);
      return;
    }

    const favoriteBtn = event.target.closest("[data-favorite]");
    if (favoriteBtn) {
      const product = getProductById(favoriteBtn.dataset.favorite);
      if (!product) return;
      if (state.favorites.has(product.name)) {
        state.favorites.delete(product.name);
      } else {
        state.favorites.add(product.name);
      }
      saveState();
      renderProducts();
      renderBuyerOrders();
      return;
    }

    const productCard = event.target.closest(".product-card");
    if (productCard && !event.target.closest("button")) {
      openProductDetail(productCard.dataset.productId);
      return;
    }

    const authToggle = event.target.closest("[data-auth-toggle]");
    if (authToggle) {
      const mode = authToggle.textContent.includes("Samee") ? "signup" : "login";
      const modal = authToggle.closest(".modal");
      modal?.closest(".overlay")?.remove();
      openAuthModal(mode);
    }
  });

  document.querySelector("[data-view='home']").addEventListener("click", () => setActiveView("home"));
}

function init() {
  updateTheme();
  renderProducts();
  renderBuyerOrders();
  updateCartCount();
  bindEvents();
  setActiveView("home");
}

init();

