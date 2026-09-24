/* =========================================================
   WAHEN MARKETPLACE
   COMPLETE SCRIPT.JS
   M.3 / SUPABASE CONNECTED VERSION
   ========================================================= */

"use strict";

/* =========================================================
   1. SUPABASE CLIENT
   ========================================================= */

const supabase =
  window.supabaseClient ||
  window.supabase ||
  window._supabase ||
  null;

if (!supabase) {
  console.error("WAHEN: Supabase client lama helin.");
}


/* =========================================================
   2. APP STATE
   ========================================================= */

const WAHEN = {
  user: null,
  profile: null,
  products: [],
  orders: [],
  cart: [],
  favorites: [],
  currentPage: "home",
  search: "",
  category: "",
  loading: false
};

const CART_KEY = "wahen_cart";
const FAVORITES_KEY = "wahen_favorites";


/* =========================================================
   3. BASIC HELPERS
   ========================================================= */

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return [...document.querySelectorAll(selector)];
}

function safeText(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function escapeHTML(value) {
  return safeText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPrice(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(number);
}

function getProductId(product) {
  return (
    product?.id ??
    product?.product_id ??
    product?.uuid ??
    null
  );
}

function getProductName(product) {
  return (
    product?.name ||
    product?.product_name ||
    product?.title ||
    product?.product_title ||
    "Alaab"
  );
}

function getProductPrice(product) {
  return (
    product?.price ??
    product?.selling_price ??
    product?.sale_price ??
    product?.amount ??
    0
  );
}

function getProductImage(product) {
  return (
    product?.image_url ||
    product?.image ||
    product?.photo_url ||
    product?.thumbnail ||
    product?.cover_image ||
    "https://placehold.co/600x600/EEF0FE/4338CA?text=WAHEN"
  );
}

function getCategory(product) {
  return (
    product?.category_name ||
    product?.category ||
    product?.category_id ||
    "Others"
  );
}


/* =========================================================
   4. TOAST
   ========================================================= */

function toast(message, type = "info") {
  let box = document.getElementById("wahen-toast");

  if (!box) {
    box = document.createElement("div");
    box.id = "wahen-toast";

    Object.assign(box.style, {
      position: "fixed",
      left: "50%",
      bottom: "80px",
      transform: "translateX(-50%)",
      zIndex: "99999",
      maxWidth: "90%",
      padding: "13px 18px",
      borderRadius: "14px",
      color: "#fff",
      fontSize: "14px",
      fontWeight: "600",
      boxShadow: "0 10px 30px rgba(0,0,0,.2)",
      transition: "all .25s ease",
      textAlign: "center"
    });

    document.body.appendChild(box);
  }

  box.textContent = message;

  if (type === "success") {
    box.style.background = "#16a34a";
  } else if (type === "error") {
    box.style.background = "#dc2626";
  } else {
    box.style.background = "#4338CA";
  }

  box.style.opacity = "1";

  clearTimeout(box._timer);

  box._timer = setTimeout(() => {
    box.style.opacity = "0";
  }, 2800);
}


/* =========================================================
   5. LOADING
   ========================================================= */

function showLoading(text = "Fadlan sug...") {
  let loader = document.getElementById("wahen-loading");

  if (!loader) {
    loader = document.createElement("div");
    loader.id = "wahen-loading";

    Object.assign(loader.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(255,255,255,.92)",
      zIndex: "99998",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "12px"
    });

    loader.innerHTML = `
      <div style="
        width:48px;
        height:48px;
        border:4px solid #EEF0FE;
        border-top-color:#4338CA;
        border-radius:50%;
        animation:wahenSpin .8s linear infinite;
      "></div>
      <div id="wahen-loading-text"
           style="font-weight:600;color:#333;">
        ${escapeHTML(text)}
      </div>
    `;

    document.body.appendChild(loader);

    if (!document.getElementById("wahen-spin-style")) {
      const style = document.createElement("style");
      style.id = "wahen-spin-style";
      style.textContent = `
        @keyframes wahenSpin {
          to { transform:rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  loader.style.display = "flex";

  const textEl = document.getElementById("wahen-loading-text");
  if (textEl) textEl.textContent = text;
}

function hideLoading() {
  const loader = document.getElementById("wahen-loading");

  if (loader) {
    loader.style.display = "none";
  }
}


/* =========================================================
   6. WAHEN LOGO
   ========================================================= */

function wahenLogo(size = 42) {
  return `
    <div
      class="wahen-logo-js"
      style="
        width:${size}px;
        height:${size}px;
        min-width:${size}px;
        border-radius:${Math.round(size * .24)}px;
        background:#4338CA;
        color:white;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:900;
        font-size:${Math.round(size * .34)}px;
        letter-spacing:-1px;
        box-shadow:0 5px 15px rgba(67,56,202,.25);
      "
      aria-label="WaHeN"
    >
      W
    </div>
  `;
}

function injectLogo() {
  const possible = [
    "#logo",
    ".logo",
    ".brand-logo",
    ".app-logo",
    "[data-wahen-logo]"
  ];

  for (const selector of possible) {
    $$(selector).forEach(el => {
      if (!el.dataset.wahenLogoReady) {
        el.innerHTML = wahenLogo(40);
        el.dataset.wahenLogoReady = "true";
      }
    });
  }
}


/* =========================================================
   7. LOCAL STORAGE
   ========================================================= */

function loadLocalData() {
  try {
    WAHEN.cart = JSON.parse(
      localStorage.getItem(CART_KEY) || "[]"
    );

    WAHEN.favorites = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "[]"
    );

    if (!Array.isArray(WAHEN.cart)) WAHEN.cart = [];
    if (!Array.isArray(WAHEN.favorites)) WAHEN.favorites = [];

  } catch (error) {
    WAHEN.cart = [];
    WAHEN.favorites = [];
  }
}

function saveCart() {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify(WAHEN.cart)
  );

  updateCartCount();
}

function saveFavorites() {
  localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(WAHEN.favorites)
  );
}

function updateCartCount() {
  const count = WAHEN.cart.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  $$("[data-cart-count], .cart-count, #cartCount").forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}


/* =========================================================
   8. AUTH SESSION
   ========================================================= */

async function loadCurrentUser() {
  if (!supabase) return;

  try {
    const {
      data,
      error
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Session error:", error);
      return;
    }

    WAHEN.user = data?.session?.user || null;

    if (WAHEN.user) {
      await loadProfile();
    }

    updateAccountUI();

  } catch (error) {
    console.error("loadCurrentUser:", error);
  }
}


/* =========================================================
   9. PROFILE
   ========================================================= */

async function loadProfile() {
  if (!supabase || !WAHEN.user) return;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", WAHEN.user.id)
      .maybeSingle();

    if (error) {
      console.warn("Profile:", error.message);
      return;
    }

    WAHEN.profile = data || null;

  } catch (error) {
    console.error("loadProfile:", error);
  }
}


/* =========================================================
   10. ACCOUNT UI
   ========================================================= */

function updateAccountUI() {
  const name =
    WAHEN.profile?.full_name ||
    WAHEN.profile?.name ||
    WAHEN.user?.user_metadata?.full_name ||
    WAHEN.user?.email?.split("@")[0] ||
    "Marti";

  const email =
    WAHEN.profile?.email ||
    WAHEN.user?.email ||
    "";

  $$("[data-user-name], #userName, .user-name").forEach(el => {
    el.textContent = name;
  });

  $$("[data-user-email], #userEmail, .user-email").forEach(el => {
    el.textContent = email;
  });

  $$("[data-login-button], #loginButton").forEach(el => {
    el.textContent = WAHEN.user ? "Account" : "Login";
  });
}


/* =========================================================
   11. PRODUCTS
   ========================================================= */

async function loadProducts() {
  if (!supabase) {
    toast("Supabase lama xidhmin.", "error");
    return;
  }

  showLoading("Alaabta ayaa la soo gelinayaa...");

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) {
      console.error("Products error:", error);
      toast("Alaabta lama soo qaadi karin.", "error");
      return;
    }

    WAHEN.products = Array.isArray(data) ? data : [];

    renderProducts();
    renderCategories();

  } catch (error) {
    console.error("loadProducts:", error);
    toast("Cilad ayaa dhacday.", "error");
  } finally {
    hideLoading();
  }
}


/* =========================================================
   12. PRODUCT FILTER
   ========================================================= */

function getFilteredProducts() {
  let products = [...WAHEN.products];

  if (WAHEN.category) {
    products = products.filter(product => {
      return safeText(getCategory(product)).toLowerCase() ===
        safeText(WAHEN.category).toLowerCase();
    });
  }

  if (WAHEN.search) {
    const query = WAHEN.search.toLowerCase();

    products = products.filter(product => {
      const text = [
        getProductName(product),
        getCategory(product),
        product.description,
        product.brand,
        product.shop_name
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }

  return products;
}


/* =========================================================
   13. PRODUCT CARD
   ========================================================= */

function productCard(product) {
  const id = getProductId(product);
  const name = getProductName(product);
  const price = getProductPrice(product);
  const image = getProductImage(product);
  const category = getCategory(product);

  const favorite = WAHEN.favorites.includes(String(id));

  return `
    <article
      class="wahen-product-card"
      data-product-id="${escapeHTML(id)}"
      style="
        position:relative;
        background:#fff;
        border-radius:18px;
        overflow:hidden;
        box-shadow:0 5px 20px rgba(0,0,0,.07);
        border:1px solid #eee;
      "
    >

      <button
        type="button"
        onclick="WAHEN.toggleFavorite('${escapeHTML(id)}')"
        style="
          position:absolute;
          top:10px;
          right:10px;
          z-index:3;
          width:36px;
          height:36px;
          border:0;
          border-radius:50%;
          background:white;
          box-shadow:0 3px 10px rgba(0,0,0,.12);
          cursor:pointer;
          font-size:18px;
        "
        aria-label="Favorite"
      >
        ${favorite ? "❤️" : "♡"}
      </button>

      <button
        type="button"
        onclick="WAHEN.showProduct('${escapeHTML(id)}')"
        style="
          width:100%;
          padding:0;
          border:0;
          background:white;
          cursor:pointer;
        "
      >
        <img
          src="${escapeHTML(image)}"
          alt="${escapeHTML(name)}"
          loading="lazy"
          style="
            width:100%;
            aspect-ratio:1/1;
            object-fit:cover;
            display:block;
          "
          onerror="
            this.src='https://placehold.co/600x600/EEF0FE/4338CA?text=WAHEN'
          "
        >
      </button>

      <div style="padding:12px">

        <div style="
          color:#777;
          font-size:11px;
          margin-bottom:5px;
        ">
          ${escapeHTML(category)}
        </div>

        <div style="
          font-size:15px;
          font-weight:700;
          color:#222;
          min-height:40px;
        ">
          ${escapeHTML(name)}
        </div>

        <div style="
          color:#4338CA;
          font-weight:900;
          font-size:17px;
          margin-top:7px;
        ">
          $${formatPrice(price)}
        </div>

        <button
          type="button"
          onclick="WAHEN.addToCart('${escapeHTML(id)}')"
          style="
            width:100%;
            margin-top:10px;
            padding:10px;
            border:0;
            border-radius:11px;
            background:#4338CA;
            color:#fff;
            font-weight:700;
            cursor:pointer;
          "
        >
          🛒 Ku dar Cart
        </button>

      </div>
    </article>
  `;
}


/* =========================================================
   14. RENDER PRODUCTS
   ========================================================= */

function renderProducts() {
  const products = getFilteredProducts();

  const containers = [
    "#products",
    "#productGrid",
    ".product-grid",
    "[data-products]"
  ];

  let rendered = false;

  containers.forEach(selector => {
    $$(selector).forEach(container => {
      rendered = true;

      if (!products.length) {
        container.innerHTML = `
          <div style="
            grid-column:1/-1;
            text-align:center;
            padding:40px 20px;
            color:#777;
          ">
            <div style="font-size:45px">🛍️</div>
            <h3>Alaab lama helin</h3>
            <p>Isku day search kale ama category kale.</p>
          </div>
        `;
      } else {
        container.innerHTML =
          products.map(productCard).join("");
      }
    });
  });

  if (!rendered) {
    console.warn("Product container lama helin.");
  }
}


/* =========================================================
   15. CATEGORIES
   ========================================================= */

function renderCategories() {
  const categories = [
    ...new Set(
      WAHEN.products
        .map(getCategory)
        .filter(Boolean)
        .map(value => safeText(value))
    )
  ];

  const defaultCategories = [
    "Ragga",
    "Haweenka",
    "Carruurta",
    "Cuntada",
    "Electronics",
    "Qalabka Dhismaha",
    "Others"
  ];

  const list = categories.length
    ? categories
    : defaultCategories;

  $$("#categories, #categoryGrid, [data-categories]").forEach(container => {

    container.innerHTML = list.map(category => `
      <button
        type="button"
        onclick="WAHEN.selectCategory('${escapeHTML(category)}')"
        style="
          border:0;
          background:#EEF0FE;
          color:#4338CA;
          padding:12px 14px;
          border-radius:14px;
          font-weight:700;
          cursor:pointer;
          white-space:nowrap;
        "
      >
        ${escapeHTML(category)}
      </button>
    `).join("");

  });
}


/* =========================================================
   16. SELECT CATEGORY
   ========================================================= */

function selectCategory(category) {
  WAHEN.category = category;

  renderProducts();

  scrollToProducts();

  toast(`Category: ${category}`, "success");
}


/* =========================================================
   17. SEARCH
   ========================================================= */

function setupSearch() {
  const inputs = [
    ...$$(
      'input[type="search"], input[placeholder*="Maxaad"], #searchInput, #search'
    )
  ];

  inputs.forEach(input => {

    input.addEventListener("input", event => {
      WAHEN.search = event.target.value.trim();
      renderProducts();
    });

    input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        WAHEN.search = event.target.value.trim();
        renderProducts();
        scrollToProducts();
      }
    });

  });
}

function scrollToProducts() {
  const target =
    $("#products") ||
    $("#productGrid") ||
    $(".product-grid");

  if (target) {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}


/* =========================================================
   18. CART
   ========================================================= */

function addToCart(productId) {
  const product = WAHEN.products.find(
    item => String(getProductId(item)) === String(productId)
  );

  if (!product) {
    toast("Alaabta lama helin.", "error");
    return;
  }

  const existing = WAHEN.cart.find(
    item => String(item.id) === String(productId)
  );

  if (existing) {
    existing.quantity =
      Number(existing.quantity || 1) + 1;
  } else {
    WAHEN.cart.push({
      id: productId,
      name: getProductName(product),
      price: Number(getProductPrice(product)),
      image: getProductImage(product),
      quantity: 1
    });
  }

  saveCart();

  toast("Alaabta Cart ayaa lagu daray.", "success");
}


/* =========================================================
   19. CART PAGE
   ========================================================= */

function showCart() {
  const total = WAHEN.cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
      Number(item.quantity || 1),
    0
  );

  const items = WAHEN.cart.map((item, index) => `
    <div style="
      display:flex;
      gap:12px;
      padding:12px;
      background:#fff;
      border-radius:15px;
      margin-bottom:10px;
      border:1px solid #eee;
      align-items:center;
    ">

      <img
        src="${escapeHTML(item.image)}"
        style="
          width:65px;
          height:65px;
          object-fit:cover;
          border-radius:12px;
        "
      >

      <div style="flex:1">

        <strong>
          ${escapeHTML(item.name)}
        </strong>

        <div style="
          color:#4338CA;
          font-weight:800;
          margin-top:4px;
        ">
          $${formatPrice(item.price)}
        </div>

        <div style="
          display:flex;
          align-items:center;
          gap:8px;
          margin-top:6px;
        ">

          <button
            onclick="WAHEN.changeCartQuantity(${index},-1)"
            style="
              width:30px;
              height:30px;
              border:0;
              border-radius:8px;
            "
          >−</button>

          <span>${item.quantity}</span>

          <button
            onclick="WAHEN.changeCartQuantity(${index},1)"
            style="
              width:30px;
              height:30px;
              border:0;
              border-radius:8px;
            "
          >+</button>

        </div>

      </div>

      <button
        onclick="WAHEN.removeFromCart(${index})"
        style="
          border:0;
          background:#fee2e2;
          color:#dc2626;
          width:35px;
          height:35px;
          border-radius:9px;
        "
      >
        ×
      </button>

    </div>
  `).join("");

  openModal(`
    <div style="
      max-height:85vh;
      overflow:auto;
    ">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:15px;
      ">
        <h2 style="margin:0">🛒 Cart-ka</h2>

        <button
          onclick="WAHEN.closeModal()"
          style="
            border:0;
            background:#eee;
            width:35px;
            height:35px;
            border-radius:50%;
          "
        >×</button>
      </div>

      ${
        items ||
        `
        <div style="
          text-align:center;
          padding:40px 10px;
          color:#777;
        ">
          <div style="font-size:45px">🛒</div>
          <h3>Cart-ku waa madhan yahay</h3>
        </div>
        `
      }

      ${
        WAHEN.cart.length
          ? `
            <div style="
              margin-top:15px;
              padding:15px;
              background:#EEF0FE;
              border-radius:14px;
            ">

              <div style="
                display:flex;
                justify-content:space-between;
                font-weight:800;
                font-size:18px;
              ">
                <span>Total</span>
                <span>$${formatPrice(total)}</span>
              </div>

              <button
                onclick="WAHEN.checkout()"
                style="
                  width:100%;
                  margin-top:12px;
                  padding:13px;
                  border:0;
                  border-radius:12px;
                  background:#4338CA;
                  color:#fff;
                  font-weight:800;
                "
              >
                Proceed to Order
              </button>

            </div>
          `
          : ""
      }

    </div>
  `);
}

function changeCartQuantity(index, amount) {
  if (!WAHEN.cart[index]) return;

  WAHEN.cart[index].quantity =
    Number(WAHEN.cart[index].quantity || 1) + amount;

  if (WAHEN.cart[index].quantity <= 0) {
    WAHEN.cart.splice(index, 1);
  }

  saveCart();
  showCart();
}

function removeFromCart(index) {
  WAHEN.cart.splice(index, 1);
  saveCart();
  showCart();
}


/* =========================================================
   20. FAVORITES
   ========================================================= */

function toggleFavorite(productId) {
  const id = String(productId);

  if (WAHEN.favorites.includes(id)) {
    WAHEN.favorites =
      WAHEN.favorites.filter(item => item !== id);

    toast("Favorites laga saaray.", "info");
  } else {
    WAHEN.favorites.push(id);
    toast("Favorites ayaa lagu daray.", "success");
  }

  saveFavorites();
  renderProducts();
}

function showFavorites() {
  const products = WAHEN.products.filter(product =>
    WAHEN.favorites.includes(
      String(getProductId(product))
    )
  );

  openModal(`
    <div style="max-height:85vh;overflow:auto">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
      ">
        <h2>❤️ Favorites</h2>

        <button
          onclick="WAHEN.closeModal()"
          style="
            border:0;
            background:#eee;
            width:35px;
            height:35px;
            border-radius:50%;
          "
        >×</button>
      </div>

      <div
        style="
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:10px;
        "
      >
        ${
          products.length
            ? products.map(productCard).join("")
            : `
              <div style="
                grid-column:1/-1;
                text-align:center;
                padding:40px 10px;
                color:#777;
              ">
                ❤️<br>
                Favorites-ku waa madhan yahay.
              </div>
            `
        }
      </div>

    </div>
  `);
}


/* =========================================================
   21. PRODUCT DETAILS
   ========================================================= */

function showProduct(productId) {
  const product = WAHEN.products.find(
    item =>
      String(getProductId(item)) ===
      String(productId)
  );

  if (!product) {
    toast("Alaabta lama helin.", "error");
    return;
  }

  const name = getProductName(product);
  const price = getProductPrice(product);
  const image = getProductImage(product);

  openModal(`
    <div style="max-height:88vh;overflow:auto">

      <button
        onclick="WAHEN.closeModal()"
        style="
          float:right;
          border:0;
          background:#eee;
          width:35px;
          height:35px;
          border-radius:50%;
        "
      >×</button>

      <img
        src="${escapeHTML(image)}"
        style="
          width:100%;
          max-height:320px;
          object-fit:cover;
          border-radius:18px;
        "
      >

      <h2>
        ${escapeHTML(name)}
      </h2>

      <div style="
        color:#4338CA;
        font-size:24px;
        font-weight:900;
      ">
        $${formatPrice(price)}
      </div>

      <p style="color:#666;line-height:1.6">
        ${escapeHTML(
          product.description ||
          "Macluumaadka alaabta ayaa halkan kasoo muuqan doona."
        )}
      </p>

      <button
        onclick="WAHEN.addToCart('${escapeHTML(productId)}')"
        style="
          width:100%;
          padding:14px;
          border:0;
          border-radius:13px;
          background:#4338CA;
          color:white;
          font-size:16px;
          font-weight:800;
        "
      >
        🛒 Ku dar Cart
      </button>

    </div>
  `);
}


/* =========================================================
   22. ORDERS FROM SUPABASE
   ========================================================= */

async function loadOrders() {
  if (!supabase || !WAHEN.user) {
    WAHEN.orders = [];
    return;
  }

  try {

    /*
      Waxaan marka hore soo qaadanaynaa orders-ka.
      Tani waxay ka dhigaysaa script-ka mid u dulqaata
      haddii schema-ga orders uu leeyahay columns dheeraad ah.
    */

    const { data, error } = await supabase
      .from("orders")
      .select("*");

    if (error) {
      console.warn("Orders:", error.message);
      WAHEN.orders = [];
      return;
    }

    const allOrders = Array.isArray(data) ? data : [];

    WAHEN.orders = allOrders.filter(order => {

      const possibleUserIds = [
        order.user_id,
        order.customer_id,
        order.profile_id,
        order.buyer_id
      ]
        .filter(Boolean)
        .map(String);

      return possibleUserIds.includes(
        String(WAHEN.user.id)
      );
    });

  } catch (error) {
    console.error("loadOrders:", error);
    WAHEN.orders = [];
  }
}


/* =========================================================
   23. SHOW ORDERS
   ========================================================= */

async function showOrders() {
  if (!WAHEN.user) {
    showLogin();
    return;
  }

  showLoading("Orders ayaa la soo qaadanayaa...");

  await loadOrders();

  hideLoading();

  const orderHTML = WAHEN.orders.map(order => {

    const id =
      order.id ||
      order.order_id ||
      "Order";

    const status =
      order.status ||
      order.order_status ||
      "Pending";

    const total =
      order.total ||
      order.total_amount ||
      order.amount ||
      0;

    return `
      <div style="
        background:#fff;
        border:1px solid #eee;
        border-radius:15px;
        padding:15px;
        margin-bottom:10px;
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          gap:10px;
        ">
          <strong>
            Order #${escapeHTML(id)}
          </strong>

          <span style="
            padding:5px 9px;
            background:#EEF0FE;
            color:#4338CA;
            border-radius:8px;
            font-size:12px;
            font-weight:700;
          ">
            ${escapeHTML(status)}
          </span>
        </div>

        <div style="
          margin-top:8px;
          font-weight:800;
        ">
          Total: $${formatPrice(total)}
        </div>

      </div>
    `;
  }).join("");

  openModal(`
    <div style="max-height:85vh;overflow:auto">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
      ">
        <h2>📦 Orders</h2>

        <button
          onclick="WAHEN.closeModal()"
          style="
            border:0;
            background:#eee;
            width:35px;
            height:35px;
            border-radius:50%;
          "
        >×</button>
      </div>

      ${
        orderHTML ||
        `
        <div style="
          text-align:center;
          padding:45px 15px;
          color:#777;
        ">
          <div style="font-size:48px">📦</div>
          <h3>Orders ma jiraan</h3>
          <p>Markaad wax dalbato halkan ayay kasoo muuqanayaan.</p>
        </div>
        `
      }

    </div>
  `);
}


/* =========================================================
   24. CHECKOUT
   ========================================================= */

async function checkout() {

  if (!WAHEN.user) {
    closeModal();
    showLogin();
    return;
  }

  if (!WAHEN.cart.length) {
    toast("Cart-ku waa madhan yahay.", "error");
    return;
  }

  const total = WAHEN.cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
      Number(item.quantity || 1),
    0
  );

  openModal(`
    <div>

      <h2>🧾 Order</h2>

      <p>
        Total-ka order-ka:
        <strong>$${formatPrice(total)}</strong>
      </p>

      <label style="display:block;margin-top:15px">
        Delivery address
      </label>

      <textarea
        id="wahen-order-address"
        placeholder="Geli meesha laguu keenayo..."
        style="
          width:100%;
          min-height:90px;
          margin-top:7px;
          padding:12px;
          border:1px solid #ddd;
          border-radius:12px;
          box-sizing:border-box;
        "
      ></textarea>

      <label style="
        display:block;
        margin-top:15px;
      ">
        Payment
      </label>

      <select
        id="wahen-payment-method"
        style="
          width:100%;
          padding:12px;
          margin-top:7px;
          border:1px solid #ddd;
          border-radius:12px;
        "
      >
        <option value="ZAAD">ZAAD</option>
        <option value="E-Dahab">E-Dahab</option>
        <option value="EVC">EVC</option>
        <option value="Premier">Premier</option>
      </select>

      <button
        onclick="WAHEN.submitOrder()"
        style="
          width:100%;
          margin-top:18px;
          padding:14px;
          border:0;
          border-radius:13px;
          background:#4338CA;
          color:#fff;
          font-weight:800;
        "
      >
        Confirm Order
      </button>

    </div>
  `);
}


/* =========================================================
   25. SUBMIT ORDER
   ========================================================= */

async function submitOrder() {

  if (!supabase || !WAHEN.user) {
    toast("Login ayaa loo baahan yahay.", "error");
    return;
  }

  const address =
    $("#wahen-order-address")?.value.trim() || "";

  const payment =
    $("#wahen-payment-method")?.value || "ZAAD";

  if (!address) {
    toast("Fadlan geli delivery address.", "error");
    return;
  }

  const total = WAHEN.cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
      Number(item.quantity || 1),
    0
  );

  showLoading("Order ayaa la dirayaa...");

  try {

    /*
      Waxaan isticmaalaynaa fields-ka aasaasiga ah.
      Haddii database-kaaga orders table-ku leeyahay
      trigger/function u gaar ah, RLS ayaa weli ilaalinaya.
    */

    const payload = {
      user_id: WAHEN.user.id,
      total: total,
      status: "pending",
      payment_method: payment,
      delivery_address: address
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(payload)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Order insert:", error);

      toast(
        "Order lama gelin database-ka. Hubi orders columns-ka.",
        "error"
      );

      return;
    }

    WAHEN.cart = [];
    saveCart();

    closeModal();

    toast(
      "Order-ka si guul leh ayaa loo diray.",
      "success"
    );

    await loadOrders();

  } catch (error) {
    console.error(error);
    toast("Order error ayaa dhacay.", "error");
  } finally {
    hideLoading();
  }
}


/* =========================================================
   26. LOGIN / SIGNUP
   ========================================================= */

function showLogin() {

  openModal(`
    <div>

      <div style="
        text-align:center;
        margin-bottom:20px;
      ">
        ${wahenLogo(60)}

        <h2 style="
          margin:10px 0 5px;
          color:#4338CA;
        ">
          WAHEN
        </h2>

        <p style="
          color:#777;
          margin:0;
        ">
          Hal meel wax walba ka hel
        </p>
      </div>

      <input
        id="wahen-auth-email"
        type="email"
        placeholder="Email"
        style="
          width:100%;
          box-sizing:border-box;
          padding:13px;
          border:1px solid #ddd;
          border-radius:12px;
          margin-bottom:10px;
        "
      >

      <input
        id="wahen-auth-password"
        type="password"
        placeholder="Password"
        style="
          width:100%;
          box-sizing:border-box;
          padding:13px;
          border:1px solid #ddd;
          border-radius:12px;
        "
      >

      <button
        onclick="WAHEN.login()"
        style="
          width:100%;
          margin-top:15px;
          padding:14px;
          border:0;
          border-radius:13px;
          background:#4338CA;
          color:white;
          font-weight:800;
        "
      >
        Login
      </button>

      <button
        onclick="WAHEN.signup()"
        style="
          width:100%;
          margin-top:9px;
          padding:13px;
          border:1px solid #4338CA;
          border-radius:13px;
          background:white;
          color:#4338CA;
          font-weight:800;
        "
      >
        Create Account
      </button>

    </div>
  `);
}


/* =========================================================
   27. LOGIN
   ========================================================= */

async function login() {

  if (!supabase) {
    toast("Supabase lama diyaar.", "error");
    return;
  }

  const email =
    $("#wahen-auth-email")?.value.trim();

  const password =
    $("#wahen-auth-password")?.value || "";

  if (!email || !password) {
    toast("Geli email iyo password.", "error");
    return;
  }

  showLoading("Login...");

  try {

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      toast(error.message, "error");
      return;
    }

    WAHEN.user = data.user;

    await loadProfile();

    closeModal();

    updateAccountUI();

    toast("Ku soo dhawoow WaHeN.", "success");

  } catch (error) {
    console.error(error);
    toast("Login error.", "error");
  } finally {
    hideLoading();
  }
}


/* =========================================================
   28. SIGNUP
   ========================================================= */

async function signup() {

  if (!supabase) return;

  const email =
    $("#wahen-auth-email")?.value.trim();

  const password =
    $("#wahen-auth-password")?.value || "";

  if (!email || !password) {
    toast("Geli email iyo password.", "error");
    return;
  }

  if (password.length < 6) {
    toast("Password-ku ugu yaraan 6 xaraf ha noqdo.", "error");
    return;
  }

  showLoading("Account ayaa la samaynayaa...");

  try {

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password
      });

    if (error) {
      toast(error.message, "error");
      return;
    }

    WAHEN.user = data.user || null;

    if (WAHEN.user) {
      await loadProfile();
    }

    closeModal();

    toast(
      "Account-ka waa la sameeyay.",
      "success"
    );

  } catch (error) {
    console.error(error);
    toast("Signup error.", "error");
  } finally {
    hideLoading();
  }
}


/* =========================================================
   29. LOGOUT
   ========================================================= */

async function logout() {

  if (!supabase) return;

  showLoading("Logout...");

  try {

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      toast(error.message, "error");
      return;
    }

    WAHEN.user = null;
    WAHEN.profile = null;
    WAHEN.orders = [];

    updateAccountUI();

    closeModal();

    toast("Waad ka baxday account-ka.", "success");

  } catch (error) {
    console.error(error);
    toast("Logout error.", "error");
  } finally {
    hideLoading();
  }
}


/* =========================================================
   30. ACCOUNT
   ========================================================= */

function showAccount() {

  if (!WAHEN.user) {
    showLogin();
    return;
  }

  const name =
    WAHEN.profile?.full_name ||
    WAHEN.profile?.name ||
    WAHEN.user.email?.split("@")[0] ||
    "Marti";

  const email =
    WAHEN.profile?.email ||
    WAHEN.user.email ||
    "";

  openModal(`
    <div>

      <div style="
        text-align:center;
        padding:10px 0 20px;
      ">
        ${wahenLogo(65)}

        <h2 style="margin:10px 0 4px">
          ${escapeHTML(name)}
        </h2>

        <div style="color:#777">
          ${escapeHTML(email)}
        </div>
      </div>

      <button
        onclick="WAHEN.showOrders()"
        style="
          width:100%;
          padding:13px;
          margin-bottom:9px;
          border:0;
          border-radius:12px;
          background:#EEF0FE;
          color:#4338CA;
          font-weight:800;
        "
      >
        📦 My Orders
      </button>

      <button
        onclick="WAHEN.showFavorites()"
        style="
          width:100%;
          padding:13px;
          margin-bottom:9px;
          border:0;
          border-radius:12px;
          background:#EEF0FE;
          color:#4338CA;
          font-weight:800;
        "
      >
        ❤️ Favorites
      </button>

      <button
        onclick="WAHEN.showSupport()"
        style="
          width:100%;
          padding:13px;
          margin-bottom:9px;
          border:0;
          border-radius:12px;
          background:#EEF0FE;
          color:#4338CA;
          font-weight:800;
        "
      >
        💬 Customer Support
      </button>

      <button
        onclick="WAHEN.logout()"
        style="
          width:100%;
          padding:13px;
          border:0;
          border-radius:12px;
          background:#fee2e2;
          color:#dc2626;
          font-weight:800;
        "
      >
        🚪 Logout
      </button>

    </div>
  `);
}


/* =========================================================
   31. CUSTOMER SUPPORT
   ========================================================= */

function showSupport() {

  openModal(`
    <div>

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
      ">
        <h2>💬 Customer Support</h2>

        <button
          onclick="WAHEN.closeModal()"
          style="
            border:0;
            background:#eee;
            width:35px;
            height:35px;
            border-radius:50%;
          "
        >×</button>
      </div>

      <p style="color:#666">
        Maxaan kaa caawin karnaa?
      </p>

      <button
        onclick="WAHEN.supportMessage('Order')"
        style="
          width:100%;
          padding:13px;
          margin-bottom:9px;
          border:1px solid #eee;
          background:white;
          border-radius:12px;
          text-align:left;
        "
      >
        📦 Order problem
      </button>

      <button
        onclick="WAHEN.supportMessage('Payment')"
        style="
          width:100%;
          padding:13px;
          margin-bottom:9px;
          border:1px solid #eee;
          background:white;
          border-radius:12px;
          text-align:left;
        "
      >
        💳 Payment problem
      </button>

      <button
        onclick="WAHEN.supportMessage('Delivery')"
        style="
          width:100%;
          padding:13px;
          margin-bottom:9px;
          border:1px solid #eee;
          background:white;
          border-radius:12px;
          text-align:left;
        "
      >
        🚚 Delivery problem
      </button>

      <textarea
        id="wahen-support-text"
        placeholder="Qor fariintaada..."
        style="
          width:100%;
          min-height:100px;
          box-sizing:border-box;
          padding:12px;
          border:1px solid #ddd;
          border-radius:12px;
        "
      ></textarea>

      <button
        onclick="WAHEN.sendSupport()"
        style="
          width:100%;
          margin-top:10px;
          padding:13px;
          border:0;
          border-radius:12px;
          background:#4338CA;
          color:white;
          font-weight:800;
        "
      >
        Send Message
      </button>

    </div>
  `);
}

function supportMessage(type) {
  const textarea = $("#wahen-support-text");

  if (textarea) {
    textarea.value =
      `${type} problem: `;
    textarea.focus();
  }
}

function sendSupport() {

  const text =
    $("#wahen-support-text")?.value.trim();

  if (!text) {
    toast("Fadlan qor fariinta.", "error");
    return;
  }

  /*
    Haddii support table-ka M.4 dambe lagu xiro,
    function-kan waxaa lagu dari karaa insert-ka.
    Hadda UI-ga iyo button-ku si buuxda ayay u shaqaynayaan.
  */

  toast(
    "Fariintaada waa la helay. WaHeN Support ayaa kula soo xiriiri doona.",
    "success"
  );

  closeModal();
}


/* =========================================================
   32. MODAL
   ========================================================= */

function openModal(content) {

  closeModal();

  const overlay = document.createElement("div");

  overlay.id = "wahen-modal";

  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,.55)",
    zIndex: "99990",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px",
    boxSizing: "border-box"
  });

  const modal = document.createElement("div");

  Object.assign(modal.style, {
    width: "100%",
    maxWidth: "430px",
    maxHeight: "90vh",
    overflow: "auto",
    background: "#fff",
    borderRadius: "22px",
    padding: "20px",
    boxSizing: "border-box",
    boxShadow: "0 20px 60px rgba(0,0,0,.25)"
  });

  modal.innerHTML = content;

  overlay.appendChild(modal);

  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  document.body.appendChild(overlay);
}

function closeModal() {
  const modal = document.getElementById("wahen-modal");

  if (modal) {
    modal.remove();
  }
}


/* =========================================================
   33. NAVIGATION
   ========================================================= */

function goHome() {

  WAHEN.currentPage = "home";
  WAHEN.category = "";
  WAHEN.search = "";

  renderProducts();

  const home =
    $("#home") ||
    document.querySelector("[data-page='home']") ||
    document.body;

  if (home && home !== document.body) {
    home.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  } else {
    window.scrollTo({
      top:0,
      behavior:"smooth"
    });
  }

  setActiveNav("home");
}

function goCategories() {

  WAHEN.currentPage = "categories";

  const target =
    $("#categories") ||
    $("#categoryGrid") ||
    document.querySelector("[data-categories]");

  if (target) {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  setActiveNav("categories");
}

function goOrders() {
  WAHEN.currentPage = "orders";
  showOrders();
  setActiveNav("orders");
}

function goAccount() {
  WAHEN.currentPage = "account";
  showAccount();
  setActiveNav("account");
}

function setActiveNav(page) {

  $$(
    "[data-nav], .bottom-nav button, .bottom-navigation button"
  ).forEach(button => {

    const target =
      button.dataset.nav ||
      button.dataset.page ||
      button.getAttribute("data-target");

    if (target === page) {
      button.classList.add("active");

      button.style.color = "#4338CA";
      button.style.fontWeight = "900";
    } else {
      button.classList.remove("active");
    }

  });
}


/* =========================================================
   34. BUTTON AUTO CONNECTION
   ========================================================= */

function setupButtons() {

  $$("button, a").forEach(element => {

    const textValue =
      safeText(element.textContent)
        .trim()
        .toLowerCase();

    const aria =
      safeText(element.getAttribute("aria-label"))
        .toLowerCase();

    const combined =
      `${textValue} ${aria}`;

    /*
      Home
    */
    if (
      combined === "home" ||
      combined.includes("home")
    ) {
      element.addEventListener("click", event => {
        if (!element.getAttribute("onclick")) {
          event.preventDefault();
          goHome();
        }
      });
    }

    /*
      Categories
    */
    if (
      combined.includes("categories") ||
      combined.includes("category")
    ) {
      element.addEventListener("click", event => {
        if (!element.getAttribute("onclick")) {
          event.preventDefault();
          goCategories();
        }
      });
    }

    /*
      Orders
    */
    if (
      combined.includes("orders") ||
      combined.includes("order")
    ) {
      element.addEventListener("click", event => {
        if (!element.getAttribute("onclick")) {
          event.preventDefault();
          goOrders();
        }
      });
    }

    /*
      Account
    */
    if (
      combined.includes("account") ||
      combined.includes("profile")
    ) {
      element.addEventListener("click", event => {
        if (!element.getAttribute("onclick")) {
          event.preventDefault();
          goAccount();
        }
      });
    }

    /*
      Cart
    */
    if (
      combined.includes("cart") ||
      combined.includes("shopping")
    ) {
      element.addEventListener("click", event => {
        if (!element.getAttribute("onclick")) {
          event.preventDefault();
          showCart();
        }
      });
    }

    /*
      Favorites
    */
    if (
      combined.includes("favorite") ||
      combined.includes("wishlist")
    ) {
      element.addEventListener("click", event => {
        if (!element.getAttribute("onclick")) {
          event.preventDefault();
          showFavorites();
        }
      });
    }

    /*
      Customer Support
    */
    if (
      combined.includes("support") ||
      combined.includes("customer service")
    ) {
      element.addEventListener("click", event => {
        if (!element.getAttribute("onclick")) {
          event.preventDefault();
          showSupport();
        }
      });
    }

    /*
      Login
    */
    if (
      combined.includes("login") ||
      combined.includes("sign in")
    ) {
      element.addEventListener("click", event => {
        if (!element.getAttribute("onclick")) {
          event.preventDefault();
          showLogin();
        }
      });
    }

  });
}


/* =========================================================
   35. AUTH LISTENER
   ========================================================= */

function setupAuthListener() {

  if (!supabase) return;

  supabase.auth.onAuthStateChange(
    async (event, session) => {

      WAHEN.user =
        session?.user || null;

      if (WAHEN.user) {
        await loadProfile();
        await loadOrders();
      } else {
        WAHEN.profile = null;
        WAHEN.orders = [];
      }

      updateAccountUI();
    }
  );
}


/* =========================================================
   36. KEYBOARD
   ========================================================= */

document.addEventListener("keydown", event => {

  if (event.key === "Escape") {
    closeModal();
  }

});


/* =========================================================
   37. INITIALIZE
   ========================================================= */

async function initWAHEN() {

  console.log("================================");
  console.log("WAHEN APP STARTING...");
  console.log("================================");

  loadLocalData();

  injectLogo();

  updateCartCount();

  setupSearch();

  setupButtons();

  setupAuthListener();

  await loadCurrentUser();

  await loadProducts();

  if (WAHEN.user) {
    await loadOrders();
  }

  updateAccountUI();

  console.log("WAHEN READY");
  console.log("User:", WAHEN.user);
  console.log("Products:", WAHEN.products.length);
  console.log("Cart:", WAHEN.cart.length);
}


/* =========================================================
   38. PUBLIC WAHEN API
   ========================================================= */

window.WAHEN = {

  state: WAHEN,

  init: initWAHEN,

  goHome,
  goCategories,
  goOrders,
  goAccount,

  selectCategory,

  addToCart,
  changeCartQuantity,
  removeFromCart,

  showCart,
  showFavorites,
  showProduct,
  showOrders,
  showAccount,
  showSupport,

  login,
  signup,
  logout,

  checkout,
  submitOrder,

  toggleFavorite,

  closeModal,

  refreshProducts: loadProducts,
  refreshOrders: loadOrders
};


/* =========================================================
   39. START
   ========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initWAHEN
  );

} else {

  initWAHEN();

}