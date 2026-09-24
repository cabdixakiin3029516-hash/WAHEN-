/* =========================================================
   WAHEN MARKETPLACE — SCRIPT.JS
   Supabase + Products + Search + Cart + Auth + Navigation
   ========================================================= */

"use strict";

/* =========================================================
   SUPABASE
   ========================================================= */

const SB =
  window.supabaseClient ||
  window.supabase ||
  null;

let currentUser = null;
let currentProfile = null;

let products = [];
let brands = [];
let cartItems = [];

let activeCategory = "all";
let searchTimer = null;


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);

const qs = (selector) =>
  document.querySelector(selector);

const qsa = (selector) =>
  document.querySelectorAll(selector);


/* =========================================================
   APP START
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  console.log("WAHEN APP STARTED");

  setupNavigation();
  setupSearch();
  setupCategories();
  setupButtons();
  setupAuth();
  setupModals();

  await checkUser();
  await loadInitialData();

});


/* =========================================================
   SUPABASE CHECK
   ========================================================= */

function hasSupabase() {

  if (!SB) {

    console.warn(
      "Supabase client lama helin. Hubi supabase-client.js"
    );

    showToast(
      "Supabase connection lama helin."
    );

    return false;
  }

  return true;
}


/* =========================================================
   USER / AUTH
   ========================================================= */

async function checkUser() {

  if (!hasSupabase()) return;

  try {

    const { data, error } =
      await SB.auth.getSession();

    if (error) {
      console.error(error);
      return;
    }

    currentUser =
      data?.session?.user || null;

    if (currentUser) {

      await loadProfile();

      updateAccountUI();

      await loadCart();

    } else {

      updateGuestUI();

    }

    SB.auth.onAuthStateChange(
      async (_event, session) => {

        currentUser =
          session?.user || null;

        if (currentUser) {

          await loadProfile();
          updateAccountUI();
          await loadCart();

        } else {

          currentProfile = null;
          cartItems = [];

          updateGuestUI();
          updateCartCount();
        }

      }
    );

  } catch (error) {

    console.error(
      "Auth error:",
      error
    );

  }

}


/* =========================================================
   PROFILE
   ========================================================= */

async function loadProfile() {

  if (!currentUser || !hasSupabase()) return;

  try {

    const { data, error } =
      await SB
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

    if (error) {

      console.warn(
        "Profile lama helin:",
        error.message
      );

      return;
    }

    currentProfile = data || null;

  } catch (error) {

    console.error(error);

  }

}


/* =========================================================
   ACCOUNT UI
   ========================================================= */

function updateAccountUI() {

  const menuGuest =
    $("menuGuest");

  if (!menuGuest) return;

  if (!currentUser) {

    menuGuest.innerHTML = `
      <div class="menu-avatar">👤</div>

      <div>
        <strong>Ku soo dhawoow</strong>
        <small>Soo gal ama samee account</small>
      </div>
    `;

    return;
  }

  const name =
    currentProfile?.full_name ||
    currentUser.email ||
    "WaHeN User";

  menuGuest.innerHTML = `
    <div class="menu-avatar">👤</div>

    <div>
      <strong>${escapeHTML(name)}</strong>
      <small>Account-kaaga</small>
    </div>
  `;

}


/* =========================================================
   GUEST UI
   ========================================================= */

function updateGuestUI() {

  updateAccountUI();

}


/* =========================================================
   INITIAL DATA
   ========================================================= */

async function loadInitialData() {

  showLoading(true);

  try {

    await Promise.all([
      loadProducts(),
      loadBrands()
    ]);

    renderProducts(products);
    renderBrands(brands);

  } catch (error) {

    console.error(
      "Initial data error:",
      error
    );

  } finally {

    showLoading(false);

  }

}


/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

async function loadProducts() {

  if (!hasSupabase()) return;

  try {

    const result =
      await SB
        .from("products")
        .select(`
          *,
          brands (
            id,
            name,
            logo_url
          )
        `)
        .eq("is_active", true)
        .order("created_at", {
          ascending: false
        })
        .limit(100);

    if (result.error) {

      console.error(
        "Products error:",
        result.error
      );

      products = [];

      renderEmptyProducts(
        "Alaabooyin lama helin"
      );

      return;
    }

    products =
      result.data || [];

  } catch (error) {

    console.error(
      "Products exception:",
      error
    );

    products = [];

  }

}


/* =========================================================
   LOAD BRANDS
   ========================================================= */

async function loadBrands() {

  if (!hasSupabase()) return;

  try {

    const result =
      await SB
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .order("name", {
          ascending: true
        });

    if (result.error) {

      console.warn(
        "Brands error:",
        result.error.message
      );

      brands = [];

      return;
    }

    brands =
      result.data || [];

  } catch (error) {

    console.error(error);

    brands = [];

  }

}


/* =========================================================
   PRODUCT IMAGE
   ========================================================= */

function getProductImage(product) {

  if (
    product?.image_url &&
    typeof product.image_url === "string"
  ) {

    return product.image_url;
  }

  if (
    product?.icon &&
    typeof product.icon === "string" &&
    product.icon.startsWith("http")
  ) {

    return product.icon;
  }

  return "";

}


/* =========================================================
   PRODUCT CARD
   ========================================================= */

function productCard(product) {

  const image =
    getProductImage(product);

  const price =
    Number(product?.price || 0);

  const oldPrice =
    Number(product?.old_price || 0);

  const rating =
    Number(product?.rating || 0);

  const name =
    product?.name ||
    "Alaab aan magac lahayn";

  const category =
    product?.category ||
    product?.category_name ||
    "Alaab";

  const imageHTML =
    image
      ? `
        <img
          src="${escapeAttribute(image)}"
          alt="${escapeAttribute(name)}"
          loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
        >

        <div
          class="product-placeholder"
          style="display:none"
        >
          🛍️
        </div>
      `
      : `
        <div class="product-placeholder">
          🛍️
        </div>
      `;

  const ratingHTML =
    rating > 0
      ? `
        <span class="stars">
          ${getStars(rating)}
        </span>
        <span>${rating.toFixed(1)}</span>
      `
      : `
        <span class="stars">☆☆☆☆☆</span>
        <span>New</span>
      `;

  const oldPriceHTML =
    oldPrice > price
      ? `
        <span class="product-old-price">
          ${formatMoney(oldPrice)}
        </span>
      `
      : "";

  const badge =
    product?.is_featured
      ? `<span class="product-badge">FEATURED</span>`
      : "";

  return `
    <article
      class="product-card"
      data-product-id="${escapeAttribute(product.id)}"
    >

      <div class="product-image">

        ${imageHTML}

        ${badge}

        <button
          class="product-favorite"
          data-favorite="${escapeAttribute(product.id)}"
          aria-label="Favorite"
        >
          ♡
        </button>

      </div>

      <div class="product-body">

        <span class="product-category">
          ${escapeHTML(category)}
        </span>

        <h3 class="product-name">
          ${escapeHTML(name)}
        </h3>

        <div class="product-rating">
          ${ratingHTML}
        </div>

        <div class="product-price-row">

          <div>
            <span class="product-price">
              ${formatMoney(price)}
            </span>

            ${oldPriceHTML}
          </div>

          <button
            class="add-product-btn"
            data-add-cart="${escapeAttribute(product.id)}"
            aria-label="Ku dar cart"
          >
            +
          </button>

        </div>

      </div>

    </article>
  `;
}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts(list) {

  const grid =
    $("productGrid");

  if (!grid) return;

  if (!list || list.length === 0) {

    renderEmptyProducts(
      "Alaabooyin lama helin"
    );

    return;
  }

  grid.innerHTML =
    list.map(productCard).join("");

  attachProductEvents(grid);

}


/* =========================================================
   EMPTY PRODUCTS
   ========================================================= */

function renderEmptyProducts(message) {

  const grid =
    $("productGrid");

  if (!grid) return;

  grid.innerHTML = `
    <div class="search-result-empty">

      <span>🛍️</span>

      <strong>
        ${escapeHTML(message)}
      </strong>

      <p>
        Alaabooyin cusub ayaa halkan kasoo muuqan doona.
      </p>

    </div>
  `;

}


/* =========================================================
   PRODUCT EVENTS
   ========================================================= */

function attachProductEvents(container) {

  container
    .querySelectorAll("[data-add-cart]")
    .forEach(button => {

      button.addEventListener(
        "click",
        async event => {

          event.stopPropagation();

          const id =
            button.dataset.addCart;

          await addToCart(id);

        }
      );

    });


  container
    .querySelectorAll("[data-favorite]")
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          toggleFavorite(
            button.dataset.favorite,
            button
          );

        }
      );

    });


  container
    .querySelectorAll(".product-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        event => {

          if (
            event.target.closest(
              "button"
            )
          ) {
            return;
          }

          const id =
            card.dataset.productId;

          openProduct(id);

        }
      );

    });

}


/* =========================================================
   OPEN PRODUCT
   ========================================================= */

function openProduct(id) {

  const product =
    products.find(
      item => String(item.id) === String(id)
    );

  if (!product) {

    showToast(
      "Alaabta lama helin."
    );

    return;
  }

  const container =
    $("productDetail");

  if (!container) return;

  const image =
    getProductImage(product);

  const price =
    Number(product.price || 0);

  const rating =
    Number(product.rating || 0);

  container.innerHTML = `

    <div class="detail-image">

      ${
        image
          ? `
            <img
              src="${escapeAttribute(image)}"
              alt="${escapeAttribute(product.name || "")}"
            >
          `
          : `
            <div class="product-placeholder">
              🛍️
            </div>
          `
      }

    </div>

    <div class="detail-info">

      <span class="detail-category">
        ${escapeHTML(
          product.category_name ||
          product.category ||
          "ALAAB"
        )}
      </span>

      <h2 class="detail-name">
        ${escapeHTML(
          product.name ||
          "Alaab"
        )}
      </h2>

      <div class="product-rating">

        <span class="stars">
          ${getStars(rating)}
        </span>

        <span>
          ${
            rating
              ? rating.toFixed(1)
              : "New"
          }
        </span>

      </div>

      <div class="detail-price">
        ${formatMoney(price)}
      </div>

      <p class="detail-description">
        ${escapeHTML(
          product.description ||
          "Macluumaad dheeraad ah oo ku saabsan alaabtan ayaa halkan lagu soo bandhigi doonaa."
        )}
      </p>

      <div class="detail-meta">

        <div>
          <small>Stock</small>
          <strong>
            ${Number(product.stock || 0)}
          </strong>
        </div>

        <div>
          <small>City</small>
          <strong>
            ${escapeHTML(
              product.city || "Somaliland"
            )}
          </strong>
        </div>

        <div>
          <small>Quality</small>
          <strong>
            ${
              product.quality_rating
                ? product.quality_rating
                : "—"
            }
          </strong>
        </div>

        <div>
          <small>SKU</small>
          <strong>
            ${escapeHTML(
              product.sku || "—"
            )}
          </strong>
        </div>

      </div>

      <div class="detail-actions">

        <button
          class="secondary-btn"
          onclick="toggleFavorite('${escapeAttribute(product.id)}')"
        >
          ♡ Favorite
        </button>

        <button
          class="primary-btn"
          style="margin-top:0"
          onclick="addToCart('${escapeAttribute(product.id)}'); closeProductModal();"
        >
          🛒 Ku dar Cart
        </button>

      </div>

    </div>
  `;

  openModal("productModal");

}


/* =========================================================
   BRANDS
   ========================================================= */

function renderBrands(list) {

  const grid =
    $("brandGrid");

  if (!grid || !list?.length) {
    return;
  }

  grid.innerHTML =
    list
      .slice(0,8)
      .map(brand => {

        return `
          <button
            class="brand-item"
            data-brand-id="${escapeAttribute(brand.id)}"
          >
            ${
              brand.logo_url
                ? `
                  <img
                    src="${escapeAttribute(brand.logo_url)}"
                    alt="${escapeAttribute(brand.name)}"
                    style="max-height:32px;max-width:90px"
                  >
                `
                : `
                  <strong>
                    ${escapeHTML(
                      brand.name
                    )}
                  </strong>
                `
            }
          </button>
        `;

      })
      .join("");

  grid
    .querySelectorAll("[data-brand-id]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            button.dataset.brandId;

          filterByBrand(id);

        }
      );

    });

}


/* =========================================================
   BRAND FILTER
   ========================================================= */

function filterByBrand(id) {

  const filtered =
    products.filter(
      product =>
        String(product.brand_id) ===
        String(id)
    );

  renderProducts(filtered);

  scrollToProducts();

  showToast(
    `${filtered.length} alaabood ayaa la helay`
  );

}


/* =========================================================
   CATEGORY
   ========================================================= */

function setupCategories() {

  qsa(
    ".category-card"
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        qsa(
          ".category-card"
        ).forEach(item =>
          item.classList.remove("active")
        );

        button.classList.add("active");

        activeCategory =
          button.dataset.category ||
          "all";

        filterCategory(
          activeCategory
        );

      }
    );

  });

}


/* =========================================================
   FILTER CATEGORY
   ========================================================= */

function filterCategory(category) {

  if (
    !category ||
    category === "all"
  ) {

    renderProducts(products);

    return;
  }

  const searchTerms = {

    men:[
      "men",
      "rag",
      "ragga",
      "male"
    ],

    women:[
      "women",
      "haween",
      "dumar",
      "female"
    ],

    electronics:[
      "electronics",
      "phone",
      "mobile",
      "computer",
      "electronic"
    ],

    food:[
      "food",
      "cunto",
      "raashin"
    ],

    baby:[
      "baby",
      "caruur",
      "child"
    ],

    construction:[
      "construction",
      "d hismaha",
      "dhismaha",
      "building"
    ],

    transport:[
      "transport",
      "gadiid",
      "car",
      "vehicle"
    ]

  };

  const terms =
    searchTerms[category] ||
    [category];

  const filtered =
    products.filter(product => {

      const text = `
        ${product.name || ""}
        ${product.description || ""}
        ${product.category || ""}
        ${product.category_name || ""}
      `.toLowerCase();

      return terms.some(
        term =>
          text.includes(
            term.toLowerCase()
          )
      );

    });

  renderProducts(filtered);

  scrollToProducts();

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

  const input =
    $("searchInput");

  if (!input) return;

  input.addEventListener(
    "input",
    () => {

      const value =
        input.value.trim();

      const clear =
        $("clearSearch");

      if (clear) {

        clear.style.display =
          value
            ? "block"
            : "none";

      }

      clearTimeout(
        searchTimer
      );

      searchTimer =
        setTimeout(
          () => {

            performSearch(value);

          },
          250
        );

    }
  );

}


/* =========================================================
   SEARCH FUNCTION
   ========================================================= */

function performSearch(query) {

  if (!query) {

    const section =
      $("searchResultsSection");

    if (section) {
      section.classList.add("hidden");
    }

    renderProducts(
      activeCategory === "all"
        ? products
        : products
    );

    return;
  }

  const words =
    query
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

  const results =
    products.filter(product => {

      const text = `
        ${product.name || ""}
        ${product.description || ""}
        ${product.category || ""}
        ${product.category_name || ""}
        ${product.city || ""}
        ${product.sku || ""}
      `.toLowerCase();

      return words.every(
        word => text.includes(word)
      );

    });

  const section =
    $("searchResultsSection");

  const grid =
    $("searchResults");

  if (!section || !grid) return;

  section.classList.remove("hidden");

  if (!results.length) {

    grid.innerHTML = `
      <div class="search-result-empty">

        <span>🔎</span>

        <strong>
          Wax natiijo ah lama helin
        </strong>

        <p>
          Isku day erey kale.
        </p>

      </div>
    `;

  } else {

    grid.innerHTML =
      results.map(productCard).join("");

    attachProductEvents(grid);

  }

  section.scrollIntoView({
    behavior:"smooth",
    block:"start"
  });

}


/* =========================================================
   CART
   ========================================================= */

async function loadCart() {

  if (!currentUser || !hasSupabase()) {

    cartItems = [];

    updateCartCount();

    return;
  }

  try {

    const cartResult =
      await SB
        .from("carts")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("status", "active")
        .maybeSingle();

    if (
      cartResult.error ||
      !cartResult.data
    ) {

      cartItems = [];

      updateCartCount();

      return;
    }

    const cartId =
      cartResult.data.id;

    const itemsResult =
      await SB
        .from("cart_items")
        .select(`
          id,
          quantity,
          product_id,
          products (
            id,
            name,
            price,
            image_url,
            stock
          )
        `)
        .eq("cart_id", cartId)
        .order("created_at", {
          ascending:false
        });

    if (itemsResult.error) {

      console.warn(
        "Cart items:",
        itemsResult.error.message
      );

      cartItems = [];

    } else {

      cartItems =
        itemsResult.data || [];

    }

    updateCartCount();

  } catch (error) {

    console.error(
      "Cart error:",
      error
    );

  }

}


/* =========================================================
   ADD TO CART
   ========================================================= */

async function addToCart(productId) {

  if (!currentUser) {

    openAuth();

    showToast(
      "Fadlan marka hore soo gal."
    );

    return;
  }

  if (!hasSupabase()) return;

  try {

    let cartId = null;

    const existingCart =
      await SB
        .from("carts")
        .select("id")
        .eq("user_id", currentUser.id)
        .eq("status", "active")
        .maybeSingle();

    if (existingCart.data) {

      cartId =
        existingCart.data.id;

    } else {

      const newCart =
        await SB
          .from("carts")
          .insert({
            user_id:currentUser.id,
            status:"active"
          })
          .select("id")
          .single();

      if (newCart.error) {
        throw newCart.error;
      }

      cartId =
        newCart.data.id;
    }


    const existingItem =
      await SB
        .from("cart_items")
        .select("*")
        .eq("cart_id", cartId)
        .eq("product_id", productId)
        .maybeSingle();


    if (existingItem.data) {

      const newQuantity =
        Number(
          existingItem.data.quantity || 0
        ) + 1;

      const update =
        await SB
          .from("cart_items")
          .update({
            quantity:newQuantity
          })
          .eq("id", existingItem.data.id);

      if (update.error) {
        throw update.error;
      }

    } else {

      const insert =
        await SB
          .from("cart_items")
          .insert({
            cart_id:cartId,
            product_id:productId,
            quantity:1
          });

      if (insert.error) {
        throw insert.error;
      }

    }


    await loadCart();

    showToast(
      "Alaabta Cart-ka ayaa lagu daray ✓"
    );

  } catch (error) {

    console.error(
      "Add cart error:",
      error
    );

    showToast(
      "Alaabta Cart-ka laguma darin."
    );

  }

}


/* =========================================================
   CART COUNT
   ========================================================= */

function updateCartCount() {

  const count =
    cartItems.reduce(
      (total,item) =>
        total +
        Number(item.quantity || 0),
      0
    );

  const badge =
    $("cartCount");

  if (badge) {
    badge.textContent =
      String(count);
  }

}


/* =========================================================
   RENDER CART
   ========================================================= */

function renderCart() {

  const container =
    $("cartItems");

  if (!container) return;

  if (!cartItems.length) {

    container.innerHTML = `
      <div class="search-result-empty">

        <span>🛒</span>

        <strong>
          Cart-kaagu waa madhan yahay
        </strong>

        <p>
          Ku dar alaabo si aad u dalbato.
        </p>

      </div>
    `;

    updateCartTotals();

    return;
  }


  container.innerHTML =
    cartItems.map(item => {

      const product =
        item.products || {};

      const image =
        product.image_url || "";

      return `
        <div
          class="cart-item"
          data-cart-item="${escapeAttribute(item.id)}"
        >

          <div class="cart-item-image">

            ${
              image
                ? `
                  <img
                    src="${escapeAttribute(image)}"
                    alt=""
                  >
                `
                : `
                  <div
                    class="product-placeholder"
                    style="font-size:25px"
                  >
                    🛍️
                  </div>
                `
            }

          </div>

          <div class="cart-item-info">

            <strong>
              ${escapeHTML(
                product.name || "Alaab"
              )}
            </strong>

            <small>
              ${formatMoney(
                Number(product.price || 0)
              )}
            </small>

          </div>

          <div class="quantity-control">

            <button
              data-minus="${escapeAttribute(item.id)}"
            >
              −
            </button>

            <span>
              ${Number(item.quantity || 1)}
            </span>

            <button
              data-plus="${escapeAttribute(item.id)}"
            >
              +
            </button>

          </div>

        </div>
      `;

    }).join("");


  container
    .querySelectorAll("[data-minus]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () =>
          changeCartQuantity(
            button.dataset.minus,
            -1
          )
      );

    });


  container
    .querySelectorAll("[data-plus]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () =>
          changeCartQuantity(
            button.dataset.plus,
            1
          )
      );

    });


  updateCartTotals();

}


/* =========================================================
   CHANGE CART QUANTITY
   ========================================================= */

async function changeCartQuantity(
  itemId,
  change
) {

  if (!hasSupabase()) return;

  const item =
    cartItems.find(
      row =>
        String(row.id) ===
        String(itemId)
    );

  if (!item) return;

  const quantity =
    Number(item.quantity || 1) +
    Number(change);

  try {

    if (quantity <= 0) {

      const result =
        await SB
          .from("cart_items")
          .delete()
          .eq("id", itemId);

      if (result.error) {
        throw result.error;
      }

    } else {

      const result =
        await SB
          .from("cart_items")
          .update({
            quantity
          })
          .eq("id", itemId);

      if (result.error) {
        throw result.error;
      }

    }

    await loadCart();

    renderCart();

  } catch (error) {

    console.error(error);

    showToast(
      "Cart-ka lama cusboonaysiin."
    );

  }

}


/* =========================================================
   CART TOTALS
   ========================================================= */

function updateCartTotals() {

  let subtotal = 0;

  cartItems.forEach(item => {

    const price =
      Number(
        item.products?.price || 0
      );

    const quantity =
      Number(item.quantity || 0);

    subtotal +=
      price * quantity;

  });

  const delivery = 0;

  const total =
    subtotal + delivery;

  if ($("cartSubtotal")) {

    $("cartSubtotal").textContent =
      formatMoney(subtotal);

  }

  if ($("cartDelivery")) {

    $("cartDelivery").textContent =
      formatMoney(delivery);

  }

  if ($("cartTotal")) {

    $("cartTotal").textContent =
      formatMoney(total);

  }

}


/* =========================================================
   FAVORITE
   ========================================================= */

function toggleFavorite(
  productId,
  button = null
) {

  const key =
    "wahen_favorites";

  let favorites =
    JSON.parse(
      localStorage.getItem(key) || "[]"
    );

  const index =
    favorites.indexOf(
      String(productId)
    );

  if (index >= 0) {

    favorites.splice(index,1);

    if (button) {
      button.textContent = "♡";
    }

    showToast(
      "Favorite-ka waa laga saaray."
    );

  } else {

    favorites.push(
      String(productId)
    );

    if (button) {
      button.textContent = "♥";
    }

    showToast(
      "Favorite-ka ayaa lagu daray."
    );

  }

  localStorage.setItem(
    key,
    JSON.stringify(favorites)
  );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

  const menuBtn =
    $("menuBtn");

  const closeMenu =
    $("closeMenu");

  const sideMenu =
    $("sideMenu");

  const overlay =
    $("overlay");

  if (menuBtn) {

    menuBtn.addEventListener(
      "click",
      () => {

        sideMenu?.classList.add(
          "open"
        );

        overlay?.classList.add(
          "show"
        );

      }
    );

  }

  if (closeMenu) {

    closeMenu.addEventListener(
      "click",
      closeSideMenu
    );

  }

  if (overlay) {

    overlay.addEventListener(
      "click",
      closeSideMenu
    );

  }


  qsa(
    "[data-menu]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        closeSideMenu();

        navigateTo(
          button.dataset.menu
        );

      }
    );

  });


  qsa(
    "[data-bottom]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        qsa(
          ".bottom-item"
        ).forEach(item =>
          item.classList.remove("active")
        );

        button.classList.add(
          "active"
        );

        navigateTo(
          button.dataset.bottom
        );

      }
    );

  });

}


/* =========================================================
   CLOSE SIDE MENU
   ========================================================= */

function closeSideMenu() {

  $("sideMenu")
    ?.classList.remove("open");

  $("overlay")
    ?.classList.remove("show");

}


/* =========================================================
   NAVIGATE
   ========================================================= */

function navigateTo(page) {

  switch(page){

    case "home":

      window.scrollTo({
        top:0,
        behavior:"smooth"
      });

      break;


    case "products":

      scrollToProducts();

      break;


    case "categories":

      $("categoryGrid")
        ?.scrollIntoView({
          behavior:"smooth"
        });

      break;


    case "wholesale":

      $("wholesaleBtn")
        ?.scrollIntoView({
          behavior:"smooth"
        });

      break;


    case "brands":

      $("brandGrid")
        ?.scrollIntoView({
          behavior:"smooth"
        });

      break;


    case "orders":

      if (!currentUser) {

        openAuth();

        showToast(
          "Soo gal si aad u aragto orders-ka."
        );

      } else {

        showToast(
          "Orders-kaaga ayaa la diyaarinayaa."
        );

      }

      break;


    case "account":

      openAuth();

      break;


    case "chat":

      showToast(
        "Chat-ka WaHeN ayaa la diyaarinayaa."
      );

      break;


    case "settings":

      showToast(
        "Settings-ka ayaa la diyaarinayaa."
      );

      break;


    case "favorites":

      showFavorites();

      break;


    case "manufacturers":

      showToast(
        "Warshadaha ayaa la diyaarinayaa."
      );

      break;


    case "support":

      showToast(
        "Customer Support."
      );

      break;

  }

}


/* =========================================================
   BUTTONS
   ========================================================= */

function setupButtons() {

  $("cartBtn")
    ?.addEventListener(
      "click",
      async () => {

        if (!currentUser) {

          openAuth();

          showToast(
            "Soo gal si aad u isticmaasho Cart."
          );

          return;
        }

        await loadCart();

        renderCart();

        openModal("cartModal");

      }
    );


  $("bottomSearch")
    ?.addEventListener(
      "click",
      () => {

        $("searchInput")
          ?.focus();

        window.scrollTo({
          top:0,
          behavior:"smooth"
        });

      }
    );


  $("heroShopBtn")
    ?.addEventListener(
      "click",
      () => {

        $("searchInput")
          ?.focus();

      }
    );


  $("allProductsBtn")
    ?.addEventListener(
      "click",
      () => {

        activeCategory = "all";

        renderProducts(
          products
        );

        scrollToProducts();

      }
    );


  $("allCategoriesBtn")
    ?.addEventListener(
      "click",
      () => {

        $("categoryGrid")
          ?.scrollIntoView({
            behavior:"smooth"
          });

      }
    );


  $("allBrandsBtn")
    ?.addEventListener(
      "click",
      () => {

        $("brandGrid")
          ?.scrollIntoView({
            behavior:"smooth"
          });

      }
    );


  $("wholesaleBtn")
    ?.addEventListener(
      "click",
      () => {

        const wholesale =
          products.filter(
            product =>
              product.is_wholesale === true
          );

        if (wholesale.length) {

          renderProducts(
            wholesale
          );

          scrollToProducts();

        } else {

          showToast(
            "Alaab jumlo ah hadda lama helin."
          );

        }

      }
    );


  $("offerBtn")
    ?.addEventListener(
      "click",
      () => {

        const offers =
          products.filter(
            product =>
              Number(
                product.old_price || 0
              ) >
              Number(
                product.price || 0
              )
          );

        if (offers.length) {

          renderProducts(
            offers
          );

          scrollToProducts();

        } else {

          showToast(
            "Dalabyo gaar ah hadda lama helin."
          );

        }

      }
    );


  $("clearSearch")
    ?.addEventListener(
      "click",
      () => {

        const input =
          $("searchInput");

        if (!input) return;

        input.value = "";

        $("clearSearch")
          .style.display = "none";

        $("searchResultsSection")
          ?.classList.add("hidden");

        renderProducts(
          products
        );

      }
    );


  $("closeSearchResults")
    ?.addEventListener(
      "click",
      () => {

        $("searchResultsSection")
          ?.classList.add("hidden");

      }
    );


  $("checkoutBtn")
    ?.addEventListener(
      "click",
      () => {

        if (!cartItems.length) {

          showToast(
            "Cart-kaagu waa madhan yahay."
          );

          return;
        }

        showToast(
          "Checkout-ka ayaa xiga."
        );

      }
    );


  $("notificationBtn")
    ?.addEventListener(
      "click",
      () => {

        showToast(
          "Ma jiraan notifications cusub."
        );

      }
    );


  $("changeLocation")
    ?.addEventListener(
      "click",
      () => {

        showToast(
          "Doorashada magaalada ayaa xigta."
        );

      }
    );


  $("filterBtn")
    ?.addEventListener(
      "click",
      () => {

        showToast(
          "Filter-ka ayaa xiga."
        );

      }
    );

}


/* =========================================================
   AUTH SETUP
   ========================================================= */

function setupAuth() {

  $("loginForm")
    ?.addEventListener(
      "submit",
      loginUser
    );


  $("signupForm")
    ?.addEventListener(
      "submit",
      signupUser
    );


  $("authSwitchBtn")
    ?.addEventListener(
      "click",
      toggleAuthMode
    );

}


/* =========================================================
   LOGIN
   ========================================================= */

async function loginUser(event) {

  event.preventDefault();

  if (!hasSupabase()) return;

  const email =
    $("loginEmail")
      ?.value
      .trim();

  const password =
    $("loginPassword")
      ?.value;

  if (!email || !password) {

    setAuthMessage(
      "Fadlan buuxi labada meelood."
    );

    return;
  }

  setAuthMessage(
    "Soo galaya..."
  );

  try {

    const result =
      await SB.auth.signInWithPassword({
        email,
        password
      });

    if (result.error) {

      setAuthMessage(
        result.error.message
      );

      return;
    }

    closeModal("authModal");

    showToast(
      "Si guul leh ayaad u soo gashay ✓"
    );

  } catch (error) {

    console.error(error);

    setAuthMessage(
      "Login-ku wuu fashilmay."
    );

  }

}


/* =========================================================
   SIGNUP
   ========================================================= */

async function signupUser(event) {

  event.preventDefault();

  if (!hasSupabase()) return;

  const name =
    $("signupName")
      ?.value
      .trim();

  const phone =
    $("signupPhone")
      ?.value
      .trim();

  const email =
    $("signupEmail")
      ?.value
      .trim();

  const password =
    $("signupPassword")
      ?.value;


  if (
    !name ||
    !phone ||
    !email ||
    !password
  ) {

    setAuthMessage(
      "Fadlan buuxi dhammaan xogta."
    );

    return;
  }


  setAuthMessage(
    "Account-ka ayaa la sameynayaa..."
  );


  try {

    const result =
      await SB.auth.signUp({

        email,
        password,

        options:{
          data:{
            full_name:name,
            phone:phone
          }
        }

      });


    if (result.error) {

      setAuthMessage(
        result.error.message
      );

      return;
    }


    if (result.data?.user) {

      setAuthMessage(
        "Account waa la sameeyay. Haddii email verification loo baahan yahay, email-ka hubi."
      );

    }

  } catch (error) {

    console.error(error);

    setAuthMessage(
      "Account-ka lama sameyn."
    );

  }

}


/* =========================================================
   AUTH MODE
   ========================================================= */

function toggleAuthMode() {

  const login =
    $("loginForm");

  const signup =
    $("signupForm");

  const title =
    $("authTitle");

  const description =
    $("authDescription");

  const switchText =
    $("authSwitchText");

  const switchBtn =
    $("authSwitchBtn");

  const message =
    $("authMessage");


  if (
    !login ||
    !signup
  ) return;


  const signupVisible =
    !signup.classList.contains(
      "hidden"
    );


  if (signupVisible) {

    signup.classList.add("hidden");
    login.classList.remove("hidden");

    if (title)
      title.textContent =
        "Ku soo dhawoow WaHeN";

    if (description)
      description.textContent =
        "Soo gal si aad u isticmaasho dhammaan adeegyada WaHeN.";

    if (switchText)
      switchText.textContent =
        "Account ma lihid?";

    if (switchBtn)
      switchBtn.textContent =
        "Samee Account";

  } else {

    login.classList.add("hidden");
    signup.classList.remove("hidden");

    if (title)
      title.textContent =
        "Samee Account";

    if (description)
      description.textContent =
        "Samee account-kaaga WaHeN si aad u dalbato.";

    if (switchText)
      switchText.textContent =
        "Account ma leedahay?";

    if (switchBtn)
      switchBtn.textContent =
        "Soo Gal";

  }


  if (message)
    message.textContent = "";

}


/* =========================================================
   AUTH MESSAGE
   ========================================================= */

function setAuthMessage(message) {

  const element =
    $("authMessage");

  if (element) {

    element.textContent =
      message;

  }

}


/* =========================================================
   MODALS
   ========================================================= */

function setupModals() {

  $("closeProductModal")
    ?.addEventListener(
      "click",
      () =>
        closeModal(
          "productModal"
        )
    );


  $("closeCartModal")
    ?.addEventListener(
      "click",
      () =>
        closeModal(
          "cartModal"
        )
    );


  $("closeAuthModal")
    ?.addEventListener(
      "click",
      () =>
        closeModal(
          "authModal"
        )
    );


  qsa(".modal")
    .forEach(modal => {

      modal.addEventListener(
        "click",
        event => {

          if (
            event.target === modal
          ) {

            closeModal(
              modal.id
            );

          }

        }
      );

    });


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        qsa(".modal.show")
          .forEach(modal =>
            closeModal(
              modal.id
            )
          );

        closeSideMenu();

      }

    }
  );

}


/* =========================================================
   OPEN MODAL
   ========================================================= */

function openModal(id) {

  const modal =
    $(id);

  if (!modal) return;

  modal.classList.add(
    "show"
  );

  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal(id) {

  const modal =
    $(id);

  if (!modal) return;

  modal.classList.remove(
    "show"
  );

  if (
    !document.querySelector(
      ".modal.show"
    )
  ) {

    document.body.style.overflow =
      "";

  }

}


/* =========================================================
   OPEN AUTH
   ========================================================= */

function openAuth() {

  openModal(
    "authModal"
  );

}


/* =========================================================
   FAVORITES
   ========================================================= */

function showFavorites() {

  const favorites =
    JSON.parse(
      localStorage.getItem(
        "wahen_favorites"
      ) || "[]"
    );

  const list =
    products.filter(
      product =>
        favorites.includes(
          String(product.id)
        )
    );

  renderProducts(list);

  scrollToProducts();

  showToast(
    `${list.length} favorite ayaa la helay`
  );

}


/* =========================================================
   SCROLL PRODUCTS
   ========================================================= */

function scrollToProducts() {

  const grid =
    $("productGrid");

  if (!grid) return;

  grid.scrollIntoView({
    behavior:"smooth",
    block:"start"
  });

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading(show) {

  const loading =
    $("globalLoading");

  if (!loading) return;

  if (show) {

    loading.classList.remove(
      "hidden"
    );

  } else {

    loading.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;

function showToast(message) {

  const toast =
    $("toast");

  if (!toast) return;

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  clearTimeout(
    toastTimer
  );

  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2500
    );

}


/* =========================================================
   FORMAT MONEY
   ========================================================= */

function formatMoney(value) {

  const number =
    Number(value || 0);

  return `$${number.toFixed(2)}`;

}


/* =========================================================
   STARS
   ========================================================= */

function getStars(rating) {

  const rounded =
    Math.round(
      Number(rating || 0)
    );

  let result = "";

  for (
    let i = 1;
    i <= 5;
    i++
  ) {

    result +=
      i <= rounded
        ? "★"
        : "☆";

  }

  return result;

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


/* =========================================================
   ESCAPE ATTRIBUTE
   ========================================================= */

function escapeAttribute(value) {

  return escapeHTML(
    value
  );

}


/* =========================================================
   GLOBAL ACCESS
   ========================================================= */

window.WaHeN = {

  getProducts(){
    return products;
  },

  getUser(){
    return currentUser;
  },

  getProfile(){
    return currentProfile;
  },

  openProduct,
  addToCart,
  openAuth,
  showToast,
  loadProducts,
  loadCart

};


/* =========================================================
   END
   ========================================================= */

console.log(
  "WAHEN Marketplace script loaded successfully."
);