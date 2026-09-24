/* =========================================================
   WAHEN MARKETPLACE
   SCRIPT.JS — M.3 MASTER APP CONTROLLER
   =========================================================
   IMPORTANT:
   - Uses existing Supabase configuration/client.
   - Does NOT replace database/backend.
   - Works with the supplied index.html.
   - Mobile-first: Android + iPhone.
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     1. SUPABASE CLIENT
     ========================================================= */

  const SB =
    window.supabaseClient ||
    window._supabase ||
    window.supabase;

  let db = null;

  if (SB && typeof SB.from === "function") {
    db = SB;
  } else if (
    SB &&
    typeof SB.createClient === "function" &&
    window.WAHEN_SUPABASE_URL &&
    window.WAHEN_SUPABASE_KEY
  ) {
    db = SB.createClient(
      window.WAHEN_SUPABASE_URL,
      window.WAHEN_SUPABASE_KEY
    );
  }

  /* =========================================================
     2. APP STATE
     ========================================================= */

  const state = {
    user: null,
    session: null,
    profile: null,

    products: [],
    categories: [],
    brands: [],
    manufacturers: [],
    wholesale: [],
    orders: [],
    favorites: [],

    cart: loadLocal("wahen_cart", []),
    favoriteIds: loadLocal("wahen_favorites", []),

    currentSection: "home",
    currentCategory: "all",
    currentBrand: null,

    searchText: "",
    deliveryLocation: "Hargeysa",

    authMode: "login",
    isLoading: false,

    initialized: false
  };

  /* =========================================================
     3. DOM HELPERS
     ========================================================= */

  const $ = (id) => document.getElementById(id);

  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  function exists(id) {
    return !!$(id);
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

  function firstValue(obj, keys, fallback = "") {
    for (const key of keys) {
      if (
        obj &&
        obj[key] !== undefined &&
        obj[key] !== null &&
        obj[key] !== ""
      ) {
        return obj[key];
      }
    }
    return fallback;
  }

  function numberValue(obj, keys, fallback = 0) {
    const value = firstValue(obj, keys, fallback);
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  /* =========================================================
     4. LOCAL STORAGE
     ========================================================= */

  function loadLocal(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveLocal(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Ignore storage errors */
    }
  }

  /* =========================================================
     5. TOAST
     ========================================================= */

  function toast(message, type = "info") {
    const el = $("toast");
    if (!el) return;

    el.textContent = message;

    el.classList.remove(
      "show",
      "success",
      "error",
      "warning",
      "info"
    );

    el.classList.add("show", type);

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
      el.classList.remove("show");
    }, 3000);
  }

  /* =========================================================
     6. GLOBAL LOADING
     ========================================================= */

  function loading(show, text = "WaHeN ayaa shaqaynaya...") {
    state.isLoading = show;

    const el = $("globalLoading");

    if (!el) return;

    const p = el.querySelector("p");

    if (p) p.textContent = text;

    el.classList.toggle("hidden", !show);
  }

  /* =========================================================
     7. INJECT SAFE APP CSS
     ========================================================= */

  function injectAppCSS() {
    if ($("wahenRuntimeCSS")) return;

    const style = document.createElement("style");
    style.id = "wahenRuntimeCSS";

    style.textContent = `
      .hidden {
        display:none !important;
      }

      body.wahen-locked {
        overflow:hidden;
      }

      .side-menu {
        z-index:5000 !important;
      }

      .overlay {
        z-index:4900 !important;
      }

      .modal {
        z-index:6000 !important;
      }

      .wahen-view-hidden {
        display:none !important;
      }

      .wahen-view-active {
        display:block !important;
        animation: wahenFade .18s ease;
      }

      @keyframes wahenFade {
        from {
          opacity:.35;
          transform:translateY(4px);
        }
        to {
          opacity:1;
          transform:translateY(0);
        }
      }

      .auth-password-wrap {
        position:relative;
      }

      .auth-password-wrap input {
        padding-right:48px;
      }

      .auth-password-toggle {
        position:absolute;
        right:10px;
        top:50%;
        transform:translateY(-50%);
        border:0;
        background:transparent;
        font-size:18px;
        cursor:pointer;
      }

      .wahen-auth-extra {
        display:flex;
        justify-content:flex-end;
        margin-top:-6px;
        margin-bottom:12px;
      }

      .wahen-link-btn {
        border:0;
        background:none;
        color:#4338CA;
        cursor:pointer;
        font-weight:600;
      }

      .wahen-page {
        padding:18px 16px 110px;
      }

      .wahen-page-header {
        margin-bottom:18px;
      }

      .wahen-page-header small {
        display:block;
        color:#777;
        margin-bottom:4px;
      }

      .wahen-page-header h2 {
        margin:0;
      }

      .wahen-page-card {
        background:#fff;
        border-radius:18px;
        padding:16px;
        margin-bottom:12px;
        box-shadow:0 5px 20px rgba(0,0,0,.06);
      }

      .wahen-empty {
        text-align:center;
        padding:35px 18px;
        color:#777;
      }

      .wahen-empty-icon {
        font-size:40px;
        margin-bottom:8px;
      }

      .wahen-action-grid {
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:10px;
      }

      .wahen-action {
        border:0;
        border-radius:15px;
        padding:15px;
        background:#f1f2ff;
        color:#25245d;
        text-align:left;
        font-weight:700;
        cursor:pointer;
      }

      .wahen-manufacturer-card {
        display:flex;
        align-items:center;
        gap:12px;
      }

      .wahen-manufacturer-logo {
        width:50px;
        height:50px;
        border-radius:14px;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#eef0fe;
        font-weight:800;
        color:#4338CA;
      }

      .wahen-order-status {
        display:inline-flex;
        padding:5px 9px;
        border-radius:999px;
        font-size:12px;
        font-weight:700;
        background:#eef0fe;
        color:#4338CA;
      }

      .wahen-user-box {
        display:flex;
        gap:12px;
        align-items:center;
      }

      .wahen-avatar {
        width:50px;
        height:50px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#4338CA;
        color:#fff;
        font-weight:800;
      }

      .wahen-cart-item {
        display:flex;
        gap:10px;
        align-items:center;
        padding:10px 0;
        border-bottom:1px solid #eee;
      }

      .wahen-cart-info {
        flex:1;
      }

      .wahen-qty {
        display:flex;
        align-items:center;
        gap:8px;
      }

      .wahen-qty button {
        width:30px;
        height:30px;
        border:0;
        border-radius:8px;
        background:#eee;
        cursor:pointer;
      }

      .wahen-danger {
        color:#d33;
      }

      .wahen-section-nav {
        position:sticky;
        top:0;
        z-index:100;
        background:#fff;
        display:flex;
        gap:7px;
        overflow:auto;
        padding:8px 10px;
        border-bottom:1px solid #eee;
      }

      .wahen-section-nav button {
        white-space:nowrap;
        border:0;
        padding:9px 13px;
        border-radius:999px;
        background:#f2f2f6;
        cursor:pointer;
        font-weight:700;
      }

      .wahen-section-nav button.active {
        background:#4338CA;
        color:#fff;
      }

      @media (min-width:700px) {
        .wahen-page {
          max-width:900px;
          margin:auto;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     8. AUTH
     ========================================================= */

  async function getSession() {
    if (!db || !db.auth) return null;

    try {
      const result = await db.auth.getSession();

      if (result.error) {
        console.warn("getSession:", result.error);
        return null;
      }

      return result.data?.session || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function loadProfile(userId) {
    if (!db || !userId) return null;

    try {
      const result = await db
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (result.error) {
        console.warn("Profile:", result.error);
        return null;
      }

      return result.data || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function refreshAuth() {
    state.session = await getSession();
    state.user = state.session?.user || null;

    if (state.user) {
      state.profile = await loadProfile(state.user.id);
    } else {
      state.profile = null;
    }

    updateAuthUI();
  }

  function updateAuthUI() {
    const guest = $("menuGuest");

    if (!guest) return;

    if (!state.user) {
      guest.innerHTML = `
        <div class="menu-avatar">👤</div>
        <div>
          <strong>Ku soo dhawoow</strong>
          <small>Soo gal ama samee account</small>
        </div>
      `;

      return;
    }

    const name =
      firstValue(
        state.profile,
        ["full_name", "name", "display_name"],
        state.user.email || "WaHeN User"
      );

    guest.innerHTML = `
      <div class="menu-avatar">👤</div>
      <div>
        <strong>${escapeHTML(name)}</strong>
        <small>${escapeHTML(state.user.email || "")}</small>
      </div>
    `;
  }

  function openAuth(mode = "login") {
    state.authMode = mode;

    const modal = $("authModal");
    if (!modal) return;

    setAuthMode(mode);

    modal.classList.add("open", "active");
    modal.style.display = "flex";

    document.body.classList.add("wahen-locked");
  }

  function closeAuth() {
    const modal = $("authModal");

    if (!modal) return;

    modal.classList.remove("open", "active");
    modal.style.display = "none";

    document.body.classList.remove("wahen-locked");

    const message = $("authMessage");
    if (message) {
      message.textContent = "";
    }
  }

  function setAuthMode(mode) {
    state.authMode = mode;

    const login = $("loginForm");
    const signup = $("signupForm");

    const title = $("authTitle");
    const description = $("authDescription");
    const switchText = $("authSwitchText");
    const switchBtn = $("authSwitchBtn");

    if (!login || !signup) return;

    const isLogin = mode === "login";

    login.classList.toggle("hidden", !isLogin);
    signup.classList.toggle("hidden", isLogin);

    if (title) {
      title.textContent = isLogin
        ? "Ku soo dhawoow WaHeN"
        : "Samee Account-kaaga";
    }

    if (description) {
      description.textContent = isLogin
        ? "Soo gal si aad u isticmaasho dhammaan adeegyada WaHeN."
        : "Samee account si aad u dalbato, u kaydsato alaabo iyo ula socoto orders-kaaga.";
    }

    if (switchText) {
      switchText.textContent = isLogin
        ? "Account ma lihid?"
        : "Account hore ma leedahay?";
    }

    if (switchBtn) {
      switchBtn.textContent = isLogin
        ? "Samee Account"
        : "Soo Gal";
    }
  }

  function authMessage(message, type = "error") {
    const el = $("authMessage");

    if (!el) return;

    el.textContent = message;
    el.className = `auth-message ${type}`;
  }

  async function login(email, password) {
    if (!db?.auth) {
      authMessage("Supabase Auth lama helin.");
      return;
    }

    loading(true, "Soo galaya...");

    try {
      const result = await db.auth.signInWithPassword({
        email,
        password
      });

      if (result.error) {
        authMessage(result.error.message || "Login-ku wuu fashilmay.");
        return;
      }

      await refreshAuth();

      closeAuth();

      toast("Si guul leh ayaad u soo gashay.", "success");

      await loadUserData();

      goToSection("home");
    } catch (error) {
      console.error(error);
      authMessage("Wax baa khaldamay. Fadlan isku day mar kale.");
    } finally {
      loading(false);
    }
  }

  async function signup(name, phone, email, password) {
    if (!db?.auth) {
      authMessage("Supabase Auth lama helin.");
      return;
    }

    loading(true, "Account-ka ayaa la samaynayaa...");

    try {
      const result = await db.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone
          }
        }
      });

      if (result.error) {
        authMessage(result.error.message || "Account lama samayn.");
        return;
      }

      if (result.data?.user) {
        await createProfileIfNeeded(
          result.data.user,
          name,
          phone
        );
      }

      if (result.data?.session) {
        await refreshAuth();
        closeAuth();
        toast("Account-ka waa la sameeyay.", "success");
        await loadUserData();
      } else {
        authMessage(
          "Account-ka waa la sameeyay. Fadlan email-kaaga xaqiiji kadibna soo gal.",
          "success"
        );
      }
    } catch (error) {
      console.error(error);
      authMessage("Account lama samayn. Fadlan isku day mar kale.");
    } finally {
      loading(false);
    }
  }

  async function createProfileIfNeeded(user, name, phone) {
    if (!db || !user) return;

    try {
      const existing = await db
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (existing.data) return;

      const payload = {
        id: user.id,
        full_name: name,
        phone: phone
      };

      const result = await db
        .from("profiles")
        .insert(payload);

      if (result.error) {
        console.warn(
          "Profile insert:",
          result.error
        );
      }
    } catch (error) {
      console.warn(error);
    }
  }

  async function logout() {
    if (!db?.auth) return;

    try {
      await db.auth.signOut();

      state.user = null;
      state.session = null;
      state.profile = null;
      state.orders = [];

      updateAuthUI();

      toast("Waad ka baxday account-ka.", "success");

      goToSection("home");
    } catch (error) {
      console.error(error);
      toast("Logout-ku wuu fashilmay.", "error");
    }
  }

  /* =========================================================
     9. PASSWORD UI
     ========================================================= */

  function enhancePasswordFields() {
    const fields = [
      $("loginPassword"),
      $("signupPassword")
    ];

    fields.forEach((input) => {
      if (!input || input.dataset.enhanced) return;

      input.dataset.enhanced = "1";

      const parent = input.parentElement;

      if (!parent) return;

      parent.classList.add("auth-password-wrap");

      const button = document.createElement("button");

      button.type = "button";
      button.className = "auth-password-toggle";
      button.textContent = "👁️";
      button.setAttribute(
        "aria-label",
        "Show password"
      );

      button.addEventListener("click", () => {
        const hidden = input.type === "password";

        input.type = hidden
          ? "text"
          : "password";

        button.textContent = hidden
          ? "🙈"
          : "👁️";
      });

      parent.appendChild(button);
    });
  }

  /* =========================================================
     10. PRODUCT NORMALIZATION
     ========================================================= */

  function normalizeProduct(row) {
    const price = numberValue(
      row,
      [
        "price",
        "selling_price",
        "sale_price",
        "unit_price"
      ],
      0
    );

    const oldPrice = numberValue(
      row,
      [
        "old_price",
        "compare_price",
        "regular_price"
      ],
      0
    );

    const name = firstValue(
      row,
      [
        "name",
        "product_name",
        "title",
        "product_title"
      ],
      "Alaab"
    );

    const image = firstValue(
      row,
      [
        "image_url",
        "image",
        "thumbnail",
        "photo",
        "product_image"
      ],
      ""
    );

    const category = firstValue(
      row,
      [
        "category",
        "category_name",
        "category_slug"
      ],
      ""
    );

    const brand = firstValue(
      row,
      [
        "brand",
        "brand_name"
      ],
      ""
    );

    return {
      ...row,

      _id: firstValue(
        row,
        ["id", "product_id"],
        cryptoSafeId()
      ),

      _name: name,
      _price: price,
      _oldPrice: oldPrice,
      _image: image,
      _category: category,
      _brand: brand,

      _description: firstValue(
        row,
        [
          "description",
          "details",
          "short_description"
        ],
        ""
      ),

      _stock: numberValue(
        row,
        [
          "stock",
          "quantity",
          "stock_quantity",
          "available_quantity"
        ],
        0
      ),

      _rating: numberValue(
        row,
        [
          "rating",
          "average_rating"
        ],
        0
      ),

      _shop: firstValue(
        row,
        [
          "shop_name",
          "store_name",
          "seller_name"
        ],
        ""
      )
    };
  }

  function cryptoSafeId() {
    if (
      window.crypto &&
      typeof window.crypto.randomUUID === "function"
    ) {
      return window.crypto.randomUUID();
    }

    return "local-" + Date.now() + "-" +
      Math.random().toString(36).slice(2);
  }

  /* =========================================================
     11. LOAD PRODUCTS
     ========================================================= */

  async function loadProducts() {
    if (!db) {
      renderProducts([]);
      return;
    }

    try {
      let query = db
        .from("products")
        .select("*");

      const result = await query;

      if (result.error) {
        console.warn(
          "Products:",
          result.error
        );

        renderProducts([]);
        return;
      }

      state.products = Array.isArray(result.data)
        ? result.data.map(normalizeProduct)
        : [];

      renderProducts(state.products);
      renderSearchResults();

    } catch (error) {
      console.error(error);
      renderProducts([]);
    }
  }

  /* =========================================================
     12. PRODUCT FILTER
     ========================================================= */

  function getFilteredProducts() {
    let products = [...state.products];

    if (state.currentCategory !== "all") {
      const wanted =
        normalizeText(state.currentCategory);

      products = products.filter((product) => {
        const category =
          normalizeText(product._category);

        const name =
          normalizeText(product._name);

        return (
          category.includes(wanted) ||
          name.includes(wanted) ||
          categoryMatches(
            wanted,
            category,
            name
          )
        );
      });
    }

    if (state.currentBrand) {
      const brand =
        normalizeText(state.currentBrand);

      products = products.filter((product) => {
        return normalizeText(product._brand)
          .includes(brand);
      });
    }

    if (state.searchText) {
      const search =
        normalizeText(state.searchText);

      products = products.filter((product) => {
        const haystack = [
          product._name,
          product._description,
          product._category,
          product._brand,
          product._shop
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(search);
      });
    }

    return products;
  }

  function normalizeText(value) {
    return safeText(value)
      .toLowerCase()
      .trim();
  }

  function categoryMatches(wanted, category, name) {
    const aliases = {
      men: [
        "rag",
        "men",
        "male",
        "mens"
      ],
      women: [
        "haween",
        "women",
        "woman",
        "female",
        "womens"
      ],
      electronics: [
        "electronic",
        "phone",
        "mobile",
        "computer"
      ],
      food: [
        "cunto",
        "food",
        "grocery"
      ],
      baby: [
        "caruur",
        "baby",
        "children"
      ],
      construction: [
        "dhismaha",
        "construction",
        "building"
      ],
      transport: [
        "gadiid",
        "vehicle",
        "car",
        "transport"
      ]
    };

    const list = aliases[wanted] || [];

    return list.some(
      (x) =>
        category.includes(x) ||
        name.includes(x)
    );
  }

  /* =========================================================
     13. PRODUCT RENDER
     ========================================================= */

  function renderProducts(products) {
    const grid = $("productGrid");

    if (!grid) return;

    if (!products.length) {
      grid.innerHTML = `
        <div class="wahen-empty">
          <div class="wahen-empty-icon">🛍️</div>
          <strong>Alaabooyin lama helin</strong>
          <p>
            Alaabo cusub ayaa halkan kasoo muuqan doona.
          </p>
        </div>
      `;

      return;
    }

    grid.innerHTML = products
      .map(productCard)
      .join("");

    bindProductCards(grid);
  }

  function productCard(product) {
    const favorite =
      state.favoriteIds.includes(product._id);

    const image = product._image
      ? `
        <img
          src="${escapeHTML(product._image)}"
          alt="${escapeHTML(product._name)}"
          loading="lazy"
        >
      `
      : `
        <div class="product-placeholder">
          🛍️
        </div>
      `;

    return `
      <article
        class="product-card"
        data-product-id="${escapeHTML(product._id)}"
      >

        <div class="product-image">
          ${image}

          <button
            class="product-favorite"
            data-favorite="${escapeHTML(product._id)}"
            aria-label="Favorite"
          >
            ${favorite ? "❤️" : "♡"}
          </button>
        </div>

        <div class="product-info">

          <small>
            ${escapeHTML(product._brand || product._category || "WaHeN")}
          </small>

          <h3>
            ${escapeHTML(product._name)}
          </h3>

          <div class="product-price">
            $${product._price.toFixed(2)}
          </div>

          ${
            product._rating
              ? `
                <div class="product-rating">
                  ⭐ ${product._rating.toFixed(1)}
                </div>
              `
              : ""
          }

        </div>

      </article>
    `;
  }

  function bindProductCards(parent) {
    $$(".product-card", parent).forEach((card) => {
      card.addEventListener("click", (event) => {
        if (
          event.target.closest(
            "[data-favorite]"
          )
        ) {
          return;
        }

        const id =
          card.dataset.productId;

        openProduct(id);
      });
    });

    $$("[data-favorite]", parent).forEach(
      (button) => {
        button.addEventListener(
          "click",
          (event) => {
            event.stopPropagation();

            toggleFavorite(
              button.dataset.favorite
            );
          }
        );
      }
    );
  }

  /* =========================================================
     14. PRODUCT DETAIL
     ========================================================= */

  function openProduct(id) {
    const product = state.products.find(
      (p) => String(p._id) === String(id)
    );

    if (!product) {
      toast("Alaabta lama helin.", "error");
      return;
    }

    const modal = $("productModal");
    const detail = $("productDetail");

    if (!modal || !detail) return;

    const image = product._image
      ? `
        <img
          src="${escapeHTML(product._image)}"
          alt="${escapeHTML(product._name)}"
          style="width:100%;max-height:300px;object-fit:contain;border-radius:16px"
        >
      `
      : `
        <div style="font-size:70px;text-align:center;padding:30px">
          🛍️
        </div>
      `;

    detail.innerHTML = `
      ${image}

      <div style="padding-top:14px">

        <small>
          ${escapeHTML(
            product._brand ||
            product._category ||
            "WaHeN"
          )}
        </small>

        <h2>
          ${escapeHTML(product._name)}
        </h2>

        <h3>
          $${product._price.toFixed(2)}
        </h3>

        ${
          product._rating
            ? `<p>⭐ ${product._rating.toFixed(1)} / 5</p>`
            : ""
        }

        ${
          product._description
            ? `
              <p>
                ${escapeHTML(product._description)}
              </p>
            `
            : ""
        }

        ${
          product._shop
            ? `
              <p>
                🏪 ${escapeHTML(product._shop)}
              </p>
            `
            : ""
        }

        <button
          class="primary-btn"
          id="detailAddCart"
        >
          🛒 Ku dar Cart-ka
        </button>

        <button
          class="primary-btn"
          id="detailBuyNow"
          style="margin-top:8px"
        >
          Iibso Hadda →
        </button>

      </div>
    `;

    $("detailAddCart")?.addEventListener(
      "click",
      () => {
        addToCart(product);
        closeModal("productModal");
      }
    );

    $("detailBuyNow")?.addEventListener(
      "click",
      () => {
        addToCart(product);
        closeModal("productModal");
        openCart();
      }
    );

    openModal("productModal");
  }

  /* =========================================================
     15. CART
     ========================================================= */

  function addToCart(product, quantity = 1) {
    const id = String(product._id);

    const existing = state.cart.find(
      (item) => String(item.id) === id
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      state.cart.push({
        id,
        name: product._name,
        price: product._price,
        image: product._image,
        quantity
      });
    }

    saveLocal("wahen_cart", state.cart);

    updateCartUI();

    toast(
      `${product._name} Cart-ka ayaa lagu daray.`,
      "success"
    );
  }

  function removeFromCart(id) {
    state.cart = state.cart.filter(
      (item) => String(item.id) !== String(id)
    );

    saveLocal("wahen_cart", state.cart);

    updateCartUI();
  }

  function changeCartQuantity(id, amount) {
    const item = state.cart.find(
      (x) => String(x.id) === String(id)
    );

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
      removeFromCart(id);
      return;
    }

    saveLocal("wahen_cart", state.cart);

    updateCartUI();
  }

  function cartSubtotal() {
    return state.cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
        Number(item.quantity || 0),
      0
    );
  }

  function updateCartUI() {
    const count = state.cart.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );

    const badge = $("cartCount");

    if (badge) {
      badge.textContent = count;
    }

    renderCart();
  }

  function renderCart() {
    const container = $("cartItems");

    if (!container) return;

    if (!state.cart.length) {
      container.innerHTML = `
        <div class="wahen-empty">
          <div class="wahen-empty-icon">🛒</div>
          <strong>Cart-ka waa madhan yahay</strong>
          <p>Alaabta aad doorato halkan ayay kasoo muuqanaysaa.</p>
        </div>
      `;
    } else {
      container.innerHTML = state.cart
        .map(
          (item) => `
          <div class="wahen-cart-item">

            <div style="font-size:30px">
              🛍️
            </div>

            <div class="wahen-cart-info">
              <strong>
                ${escapeHTML(item.name)}
              </strong>

              <div>
                $${Number(item.price).toFixed(2)}
              </div>

              <div class="wahen-qty">

                <button
                  data-cart-minus="${escapeHTML(item.id)}"
                >
                  −
                </button>

                <strong>
                  ${item.quantity}
                </strong>

                <button
                  data-cart-plus="${escapeHTML(item.id)}"
                >
                  +
                </button>

                <button
                  class="wahen-danger"
                  data-cart-remove="${escapeHTML(item.id)}"
                >
                  🗑️
                </button>

              </div>
            </div>

          </div>
        `
        )
        .join("");
    }

    const subtotal = cartSubtotal();

    const subtotalEl = $("cartSubtotal");
    const deliveryEl = $("cartDelivery");
    const totalEl = $("cartTotal");

    if (subtotalEl) {
      subtotalEl.textContent =
        `$${subtotal.toFixed(2)}`;
    }

    const delivery = state.cart.length
      ? 0
      : 0;

    if (deliveryEl) {
      deliveryEl.textContent =
        `$${delivery.toFixed(2)}`;
    }

    if (totalEl) {
      totalEl.textContent =
        `$${(subtotal + delivery).toFixed(2)}`;
    }

    if (container) {
      $$("[data-cart-minus]", container)
        .forEach((button) => {
          button.onclick = () =>
            changeCartQuantity(
              button.dataset.cartMinus,
              -1
            );
        });

      $$("[data-cart-plus]", container)
        .forEach((button) => {
          button.onclick = () =>
            changeCartQuantity(
              button.dataset.cartPlus,
              1
            );
        });

      $$("[data-cart-remove]", container)
        .forEach((button) => {
          button.onclick = () =>
            removeFromCart(
              button.dataset.cartRemove
            );
        });
    }
  }

  function openCart() {
    updateCartUI();
    openModal("cartModal");
  }

  /* =========================================================
     16. FAVORITES
     ========================================================= */

  function toggleFavorite(id) {
    const value = String(id);

    if (state.favoriteIds.includes(value)) {
      state.favoriteIds =
        state.favoriteIds.filter(
          (x) => String(x) !== value
        );

      toast("Favorites-ka waa laga saaray.");
    } else {
      state.favoriteIds.push(value);

      toast(
        "Alaabta Favorites ayaa lagu daray.",
        "success"
      );
    }

    saveLocal(
      "wahen_favorites",
      state.favoriteIds
    );

    renderProducts(
      getFilteredProducts()
    );
  }

  /* =========================================================
     17. SEARCH
     ========================================================= */

  function performSearch(value) {
    state.searchText = safeText(value).trim();

    const results =
      getFilteredProducts();

    const section =
      $("searchResultsSection");

    if (!state.searchText) {
      section?.classList.add("hidden");
      return;
    }

    section?.classList.remove("hidden");

    renderSearchResults();

    scrollToElement(
      "searchResultsSection"
    );
  }

  function renderSearchResults() {
    const container =
      $("searchResults");

    if (!container) return;

    if (!state.searchText) {
      container.innerHTML = "";
      return;
    }

    const results =
      getFilteredProducts();

    if (!results.length) {
      container.innerHTML = `
        <div class="wahen-empty">
          <div class="wahen-empty-icon">🔎</div>
          <strong>Natiijo lama helin</strong>
          <p>
            Isku day eray kale.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML =
      results.map(productCard).join("");

    bindProductCards(container);
  }

  /* =========================================================
     18. CATEGORY
     ========================================================= */

  function selectCategory(category) {
    state.currentCategory =
      category || "all";

    state.currentBrand = null;

    $$(".category-card").forEach(
      (button) => {
        button.classList.toggle(
          "active",
          button.dataset.category ===
            state.currentCategory
        );
      }
    );

    const filtered =
      getFilteredProducts();

    renderProducts(filtered);

    goToSection("products");
  }

  /* =========================================================
     19. BRANDS
     ========================================================= */

  function selectBrand(brand) {
    state.currentBrand = brand;
    state.currentCategory = "all";

    renderProducts(
      getFilteredProducts()
    );

    goToSection("products");
  }

  /* =========================================================
     20. DATA COLLECTION
     ========================================================= */

  async function loadTable(
    table,
    options = {}
  ) {
    if (!db) return [];

    try {
      let query =
        db.from(table).select(
          options.select || "*"
        );

      if (options.limit) {
        query = query.limit(
          options.limit
        );
      }

      if (options.orderBy) {
        query = query.order(
          options.orderBy,
          {
            ascending:
              options.ascending !== false
          }
        );
      }

      const result = await query;

      if (result.error) {
        console.warn(
          `${table}:`,
          result.error
        );

        return [];
      }

      return result.data || [];
    } catch (error) {
      console.warn(
        `${table}:`,
        error
      );

      return [];
    }
  }

  async function loadCategories() {
    const rows =
      await loadTable(
        "categories"
      );

    state.categories = rows;
  }

  async function loadBrands() {
    const rows =
      await loadTable(
        "brands"
      );

    state.brands = rows;
  }

  async function loadManufacturers() {
    const rows =
      await loadTable(
        "manufacturers"
      );

    state.manufacturers = rows;

    renderManufacturers();
  }

  async function loadWholesale() {
    const possibleTables = [
      "wholesale_products",
      "wholesale"
    ];

    for (const table of possibleTables) {
      const rows =
        await loadTable(table);

      if (rows.length) {
        state.wholesale = rows;
        break;
      }
    }

    renderWholesale();
  }

  /* =========================================================
     21. MANUFACTURERS
     ========================================================= */

  function renderManufacturers() {
    const existing =
      $("manufacturersRuntimePage");

    if (!existing) return;

    const rows =
      state.manufacturers || [];

    if (!rows.length) {
      existing.innerHTML = `
        <div class="wahen-page">
          <div class="wahen-page-header">
            <small>WARSHADO</small>
            <h2>Warshadaha</h2>
          </div>

          <div class="wahen-empty">
            <div class="wahen-empty-icon">🏭</div>
            <strong>Warshado weli lama gelin</strong>
            <p>
              Marka xogta warshaduhu ku jirto database-ka,
              halkan ayay kasoo muuqan doonaan.
            </p>
          </div>
        </div>
      `;

      return;
    }

    existing.innerHTML = `
      <div class="wahen-page">

        <div class="wahen-page-header">
          <small>WAHEEN</small>
          <h2>Warshadaha</h2>
          <p>
            Soo hel warshadaha iyo soo saarayaasha
            alaabta.
          </p>
        </div>

        ${rows
          .map(
            (row) => {
              const name =
                firstValue(
                  row,
                  [
                    "name",
                    "manufacturer_name",
                    "title"
                  ],
                  "Warshad"
                );

              const location =
                firstValue(
                  row,
                  [
                    "location",
                    "city",
                    "address"
                  ],
                  ""
                );

              return `
                <div class="wahen-page-card">
                  <div class="wahen-manufacturer-card">

                    <div class="wahen-manufacturer-logo">
                      🏭
                    </div>

                    <div>
                      <strong>
                        ${escapeHTML(name)}
                      </strong>

                      ${
                        location
                          ? `<small>${escapeHTML(location)}</small>`
                          : ""
                      }
                    </div>

                  </div>
                </div>
              `;
            }
          )
          .join("")}

      </div>
    `;
  }

  /* =========================================================
     22. WHOLESALE PAGE
     ========================================================= */

  function renderWholesale() {
    const existing =
      $("wholesaleRuntimePage");

    if (!existing) return;

    if (!state.wholesale.length) {
      existing.innerHTML = `
        <div class="wahen-page">

          <div class="wahen-page-header">
            <small>GANACSIGA</small>
            <h2>Jumlo</h2>
          </div>

          <div class="wahen-page-card">
            <div class="wahen-empty">
              <div class="wahen-empty-icon">📦</div>
              <strong>Jumlo weli lama helin</strong>
              <p>
                Alaabta jumlada waxay halkan kasoo muuqan doontaa.
              </p>
            </div>
          </div>

        </div>
      `;

      return;
    }

    existing.innerHTML = `
      <div class="wahen-page">

        <div class="wahen-page-header">
          <small>GANACSIGA</small>
          <h2>Alaabta Jumlada</h2>
        </div>

        ${state.wholesale
          .map((row) => {
            const name =
              firstValue(
                row,
                [
                  "name",
                  "product_name",
                  "title"
                ],
                "Alaab"
              );

            const price =
              numberValue(
                row,
                [
                  "wholesale_price",
                  "price",
                  "unit_price"
                ],
                0
              );

            return `
              <div class="wahen-page-card">

                <strong>
                  ${escapeHTML(name)}
                </strong>

                <p>
                  Qiimaha jumlada:
                  <strong>
                    $${price.toFixed(2)}
                  </strong>
                </p>

                <button
                  class="primary-btn"
                  data-wholesale-id="${escapeHTML(
                    firstValue(
                      row,
                      ["id"],
                      ""
                    )
                  )}"
                >
                  Faahfaahin →
                </button>

              </div>
            `;
          })
          .join("")}

      </div>
    `;
  }

  /* =========================================================
     23. ORDERS
     ========================================================= */

  async function loadOrders() {
    if (!db || !state.user) {
      state.orders = [];
      renderOrders();
      return;
    }

    try {
      let result =
        await db
          .from("orders")
          .select("*")
          .order(
            "created_at",
            { ascending: false }
          );

      if (result.error) {
        console.warn(
          "Orders:",
          result.error
        );

        state.orders = [];
        renderOrders();

        return;
      }

      const rows = result.data || [];

      state.orders = rows.filter(
        (row) => {
          const owner =
            firstValue(
              row,
              [
                "user_id",
                "customer_id",
                "profile_id",
                "buyer_id"
              ],
              null
            );

          return (
            !owner ||
            String(owner) ===
              String(state.user.id)
          );
        }
      );

      renderOrders();
    } catch (error) {
      console.error(error);

      state.orders = [];

      renderOrders();
    }
  }

  function renderOrders() {
    const page =
      $("ordersRuntimePage");

    if (!page) return;

    if (!state.user) {
      page.innerHTML = `
        <div class="wahen-page">

          <div class="wahen-page-header">
            <small>WAHEEN</small>
            <h2>Dalabyadayda</h2>
          </div>

          <div class="wahen-page-card">
            <div class="wahen-empty">
              <div class="wahen-empty-icon">🔐</div>

              <strong>
                Soo gal marka hore
              </strong>

              <p>
                Si aad u aragto dalabyadaada,
                fadlan soo gal account-kaaga.
              </p>

              <button
                class="primary-btn"
                id="ordersLoginBtn"
              >
                Soo Gal
              </button>
            </div>
          </div>

        </div>
      `;

      $("ordersLoginBtn")
        ?.addEventListener(
          "click",
          () => openAuth("login")
        );

      return;
    }

    if (!state.orders.length) {
      page.innerHTML = `
        <div class="wahen-page">

          <div class="wahen-page-header">
            <small>WAHEEN</small>
            <h2>Dalabyadayda</h2>
          </div>

          <div class="wahen-page-card">
            <div class="wahen-empty">
              <div class="wahen-empty-icon">📋</div>
              <strong>Dalab ma lihid weli</strong>
              <p>
                Dalabyada aad sameyso halkan ayay kasoo muuqan doonaan.
              </p>
            </div>
          </div>

        </div>
      `;

      return;
    }

    page.innerHTML = `
      <div class="wahen-page">

        <div class="wahen-page-header">
          <small>ACCOUNT</small>
          <h2>Dalabyadayda</h2>
        </div>

        ${state.orders
          .map((order) => {
            const id =
              firstValue(
                order,
                ["id", "order_id"],
                "Order"
              );

            const status =
              firstValue(
                order,
                ["status", "order_status"],
                "Pending"
              );

            const total =
              numberValue(
                order,
                [
                  "total",
                  "total_amount",
                  "grand_total"
                ],
                0
              );

            return `
              <div class="wahen-page-card">

                <div style="
                  display:flex;
                  justify-content:space-between;
                  gap:10px;
                ">

                  <strong>
                    #${escapeHTML(id)}
                  </strong>

                  <span class="wahen-order-status">
                    ${escapeHTML(status)}
                  </span>

                </div>

                <p>
                  Wadarta:
                  <strong>
                    $${total.toFixed(2)}
                  </strong>
                </p>

              </div>
            `;
          })
          .join("")}

      </div>
    `;
  }

  /* =========================================================
     24. CREATE ORDER
     ========================================================= */

  async function checkout() {
    if (!state.cart.length) {
      toast(
        "Cart-ka waa madhan yahay.",
        "warning"
      );
      return;
    }

    if (!state.user) {
      closeModal("cartModal");

      openAuth("login");

      toast(
        "Fadlan soo gal si aad u dalbato.",
        "warning"
      );

      return;
    }

    if (!db) {
      toast(
        "Database-ka lama helin.",
        "error"
      );
      return;
    }

    const total = cartSubtotal();

    loading(
      true,
      "Dalabka ayaa la dirayaa..."
    );

    try {
      const payload = {
        user_id: state.user.id,
        total,
        status: "pending",
        delivery_address:
          state.deliveryLocation
      };

      let result =
        await db
          .from("orders")
          .insert(payload)
          .select()
          .single();

      /*
       * If the current orders table uses a different
       * total column, we do NOT modify the database.
       * We simply report the real Supabase error.
       */

      if (result.error) {
        console.error(
          "Order insert:",
          result.error
        );

        toast(
          "Order-ka lama gelin. Supabase error-ka eeg.",
          "error"
        );

        return;
      }

      const order =
        result.data;

      /*
       * order_items insertion is attempted only if
       * an order was successfully created.
       */

      if (order?.id) {
        await insertOrderItems(
          order.id
        );
      }

      state.cart = [];

      saveLocal(
        "wahen_cart",
        state.cart
      );

      updateCartUI();

      closeModal("cartModal");

      await loadOrders();

      goToSection("orders");

      toast(
        "Dalabka si guul leh ayaa loo diray.",
        "success"
      );
    } catch (error) {
      console.error(error);

      toast(
        "Waxaa dhacay qalad intii dalabka la dirayay.",
        "error"
      );
    } finally {
      loading(false);
    }
  }

  async function insertOrderItems(orderId) {
    if (!db || !orderId) return;

    if (!state.cart.length) return;

    const items = state.cart.map(
      (item) => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      })
    );

    try {
      const result =
        await db
          .from("order_items")
          .insert(items);

      if (result.error) {
        console.warn(
          "order_items:",
          result.error
        );
      }
    } catch (error) {
      console.warn(error);
    }
  }

  /* =========================================================
     25. MODALS
     ========================================================= */

  function openModal(id) {
    const modal = $(id);

    if (!modal) return;

    modal.classList.add(
      "open",
      "active"
    );

    modal.style.display = "flex";

    document.body.classList.add(
      "wahen-locked"
    );
  }

  function closeModal(id) {
    const modal = $(id);

    if (!modal) return;

    modal.classList.remove(
      "open",
      "active"
    );

    modal.style.display = "none";

    document.body.classList.remove(
      "wahen-locked"
    );
  }

  /* =========================================================
     26. SIDE MENU
     ========================================================= */

  function openMenu() {
    const menu = $("sideMenu");
    const overlay = $("overlay");

    menu?.classList.add(
      "open",
      "active"
    );

    overlay?.classList.add(
      "open",
      "active"
    );

    if (menu) {
      menu.style.transform =
        "translateX(0)";
    }

    if (overlay) {
      overlay.style.display = "block";
    }
  }

  function closeMenu() {
    const menu = $("sideMenu");
    const overlay = $("overlay");

    menu?.classList.remove(
      "open",
      "active"
    );

    overlay?.classList.remove(
      "open",
      "active"
    );

    if (overlay) {
      overlay.style.display = "none";
    }
  }

  /* =========================================================
     27. FOUR MAIN VIEWS
     ========================================================= */

  function createRuntimeViews() {
    if ($("wahenRuntimeViews")) {
      return;
    }

    const main =
      document.querySelector("main");

    if (!main) return;

    const wrapper =
      document.createElement("div");

    wrapper.id =
      "wahenRuntimeViews";

    /*
     * We keep the existing home/main content.
     * Other pages are generated without deleting
     * the existing HTML.
     */

    const wholesale =
      document.createElement("section");

    wholesale.id =
      "wholesaleRuntimePage";

    wholesale.className =
      "wahen-view-hidden";

    const orders =
      document.createElement("section");

    orders.id =
      "ordersRuntimePage";

    orders.className =
      "wahen-view-hidden";

    const settings =
      document.createElement("section");

    settings.id =
      "settingsRuntimePage";

    settings.className =
      "wahen-view-hidden";

    const manufacturers =
      document.createElement("section");

    manufacturers.id =
      "manufacturersRuntimePage";

    manufacturers.className =
      "wahen-view-hidden";

    wrapper.appendChild(
      wholesale
    );

    wrapper.appendChild(
      orders
    );

    wrapper.appendChild(
      settings
    );

    wrapper.appendChild(
      manufacturers
    );

    main.appendChild(wrapper);

    renderSettings();
  }

  function hideHomeContent() {
    const main =
      document.querySelector("main");

    if (!main) return;

    const runtime =
      $("wahenRuntimeViews");

    Array.from(main.children)
      .forEach((child) => {
        if (child === runtime) return;

        child.classList.add(
          "wahen-view-hidden"
        );
      });
  }

  function showHomeContent() {
    const main =
      document.querySelector("main");

    if (!main) return;

    const runtime =
      $("wahenRuntimeViews");

    Array.from(main.children)
      .forEach((child) => {
        if (child === runtime) return;

        child.classList.remove(
          "wahen-view-hidden"
        );
      });
  }

  function showRuntimePage(id) {
    hideHomeContent();

    [
      "wholesaleRuntimePage",
      "ordersRuntimePage",
      "settingsRuntimePage",
      "manufacturersRuntimePage"
    ].forEach((pageId) => {
      const page = $(pageId);

      if (!page) return;

      page.classList.toggle(
        "wahen-view-active",
        pageId === id
      );

      page.classList.toggle(
        "wahen-view-hidden",
        pageId !== id
      );
    });
  }

  function goToSection(section) {
    state.currentSection =
      section || "home";

    closeMenu();

    updateBottomNavigation(
      state.currentSection
    );

    if (state.currentSection === "home") {
      showHomeContent();
      scrollTop();
      return;
    }

    if (
      state.currentSection ===
      "products"
    ) {
      showHomeContent();

      scrollToElement(
        "productGrid"
      );

      return;
    }

    if (
      state.currentSection ===
      "categories"
    ) {
      showHomeContent();

      scrollToElement(
        "categoryGrid"
      );

      return;
    }

    if (
      state.currentSection ===
      "brands"
    ) {
      showHomeContent();

      scrollToElement(
        "brandGrid"
      );

      return;
    }

    if (
      state.currentSection ===
      "wholesale"
    ) {
      showRuntimePage(
        "wholesaleRuntimePage"
      );

      renderWholesale();

      return;
    }

    if (
      state.currentSection ===
      "orders"
    ) {
      showRuntimePage(
        "ordersRuntimePage"
      );

      loadOrders();

      return;
    }

    if (
      state.currentSection ===
      "manufacturers"
    ) {
      showRuntimePage(
        "manufacturersRuntimePage"
      );

      renderManufacturers();

      return;
    }

    if (
      state.currentSection ===
      "settings" ||
      state.currentSection ===
      "account"
    ) {
      showRuntimePage(
        "settingsRuntimePage"
      );

      renderSettings();

      return;
    }

    if (
      state.currentSection ===
      "favorites"
    ) {
      showHomeContent();

      const favoriteProducts =
        state.products.filter(
          (product) =>
            state.favoriteIds.includes(
              String(product._id)
            )
        );

      renderProducts(
        favoriteProducts
      );

      scrollToElement(
        "productGrid"
      );

      return;
    }

    if (
      state.currentSection ===
      "chat" ||
      state.currentSection ===
      "support"
    ) {
      openSupport();

      return;
    }
  }

  /* =========================================================
     28. SETTINGS
     ========================================================= */

  function renderSettings() {
    const page =
      $("settingsRuntimePage");

    if (!page) return;

    if (!state.user) {
      page.innerHTML = `
        <div class="wahen-page">

          <div class="wahen-page-header">
            <small>WAHEEN</small>
            <h2>Account & Settings</h2>
          </div>

          <div class="wahen-page-card">

            <div class="wahen-empty">

              <div class="wahen-empty-icon">
                👤
              </div>

              <strong>
                Soo gal account-kaaga
              </strong>

              <p>
                Maamul profile-kaaga,
                orders-kaaga iyo settings-kaaga.
              </p>

              <button
                class="primary-btn"
                id="settingsLoginBtn"
              >
                Soo Gal
              </button>

            </div>

          </div>

          <div class="wahen-page-card">
            <strong>🎧 Customer Support</strong>
            <p>
              Haddii aad caawimo u baahan tahay,
              nala soo xiriir.
            </p>

            <button
              class="primary-btn"
              id="settingsSupportBtn"
            >
              La xiriir Support
            </button>
          </div>

        </div>
      `;

      $("settingsLoginBtn")
        ?.addEventListener(
          "click",
          () => openAuth("login")
        );

      $("settingsSupportBtn")
        ?.addEventListener(
          "click",
          openSupport
        );

      return;
    }

    const name =
      firstValue(
        state.profile,
        [
          "full_name",
          "name",
          "display_name"
        ],
        state.user.email
      );

    const phone =
      firstValue(
        state.profile,
        ["phone", "phone_number"],
        ""
      );

    const role =
      firstValue(
        state.profile,
        ["role", "user_role"],
        "customer"
      );

    page.innerHTML = `
      <div class="wahen-page">

        <div class="wahen-page-header">
          <small>WAHEEN</small>
          <h2>Account & Settings</h2>
        </div>

        <div class="wahen-page-card">

          <div class="wahen-user-box">

            <div class="wahen-avatar">
              ${escapeHTML(
                safeText(name)
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div>
              <strong>
                ${escapeHTML(name)}
              </strong>

              <small>
                ${escapeHTML(
                  state.user.email || ""
                )}
              </small>
            </div>

          </div>

        </div>

        <div class="wahen-action-grid">

          <button
            class="wahen-action"
            id="settingsOrdersBtn"
          >
            📋<br>
            Dalabyadayda
          </button>

          <button
            class="wahen-action"
            id="settingsFavoritesBtn"
          >
            ❤️<br>
            Favorites
          </button>

          <button
            class="wahen-action"
            id="settingsSecurityBtn"
          >
            🔐<br>
            Security
          </button>

          <button
            class="wahen-action"
            id="settingsNotificationsBtn"
          >
            🔔<br>
            Notifications
          </button>

          <button
            class="wahen-action"
            id="settingsSupportBtn"
          >
            🎧<br>
            Customer Support
          </button>

          <button
            class="wahen-action"
            id="settingsLogoutBtn"
          >
            🚪<br>
            Logout
          </button>

        </div>

        <div class="wahen-page-card">

          <strong>Profile</strong>

          <p>
            Magac:
            ${escapeHTML(name)}
          </p>

          ${
            phone
              ? `
                <p>
                  Phone:
                  ${escapeHTML(phone)}
                </p>
              `
              : ""
          }

          <p>
            Account:
            ${escapeHTML(role)}
          </p>

        </div>

      </div>
    `;

    $("settingsOrdersBtn")
      ?.addEventListener(
        "click",
        () => goToSection("orders")
      );

    $("settingsFavoritesBtn")
      ?.addEventListener(
        "click",
        () => goToSection("favorites")
      );

    $("settingsSecurityBtn")
      ?.addEventListener(
        "click",
        () =>
          toast(
            "Security settings ayaa imanaya qaybta account-ka.",
            "info"
          )
      );

    $("settingsNotificationsBtn")
      ?.addEventListener(
        "click",
        () =>
          toast(
            "Notifications-ka waxaa lagu xidhayaa backend-ka marka notification table/service la isticmaalo.",
            "info"
          )
      );

    $("settingsSupportBtn")
      ?.addEventListener(
        "click",
        openSupport
      );

    $("settingsLogoutBtn")
      ?.addEventListener(
        "click",
        logout
      );
  }

  /* =========================================================
     29. BOTTOM NAV
     ========================================================= */

  function updateBottomNavigation(
    section
  ) {
    $$("[data-bottom]")
      .forEach((button) => {
        const value =
          button.dataset.bottom;

        const active =
          (
            section === "home" &&
            value === "home"
          ) ||
          (
            section === "categories" &&
            value === "categories"
          ) ||
          (
            section === "orders" &&
            value === "orders"
          ) ||
          (
            (
              section === "account" ||
              section === "settings"
            ) &&
            value === "account"
          );

        button.classList.toggle(
          "active",
          active
        );
      });
 