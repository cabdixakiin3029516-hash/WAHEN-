/* =========================================================
   WaHeN Marketplace
   MAIN JAVASCRIPT
   Production Structure — Supabase Ready
========================================================= */


/* =========================================================
   1. CONFIGURATION
========================================================= */

const DELIVERY_FEE = 5;
const COMMISSION_RATE = 0.05;

const COUPONS = {
  WAHEN10: {
    percent: 10,
    minimum: 50,
    maximum: 20
  }
};

const ORDER_STATES = [
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "SELLER_CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "REVIEWED"
];


/* =========================================================
   2. SUPABASE
========================================================= */

const supabaseClient =
  window.WAHEN_SUPABASE_CLIENT || null;


/* =========================================================
   3. APPLICATION DATA
========================================================= */

let sellers = [];
let products = [];
let brands = [];
let manufacturers = [];


/* =========================================================
   4. CATEGORY INFORMATION
========================================================= */

const categoryNames = {
  unique: "Naadir / Unique",
  men: "Men",
  women: "Women",
  electronics: "Electronics",
  transport: "Qalabka Gadiidka",
  food: "Cunto",
  baby: "Baby",
  construction: "Qalabka Dhismaha",
  others: "Others"
};


/* =========================================================
   5. APPLICATION STATE
========================================================= */

const state = {
  activeView: "home",
  activeCategory: "all",
  query: "",
  selectedProduct: null,

  cart: [],
cartId: null,
  wishlist: new Set(),

  compare: new Set(),

  orders: [],

  notifications: [],

  dark:
    localStorage.getItem("wahen-theme") === "dark",

  user: {
    id: null,
    name: "",
    phone: "",
    city: "",
    address: "",
    role: null
  },

  coupon: null
};


/* =========================================================
   6. HELPERS
========================================================= */

const $ = (selector) =>
  document.querySelector(selector);

const $$ = (selector) =>
  [...document.querySelectorAll(selector)];

const money = (value) =>
  `$${Number(value || 0).toFixed(2)}`

function sellerOf(product) {
  if (!product) {
    return null;
  }

  return sellers.find(
    (seller) =>
      String(seller.id) ===
      String(product.sellerId)
  );
}

function getProduct(id) {
  return products.find(
    (product) =>
      String(product.id) ===
      String(id)
  );
}


/* =========================================================
   7. LOCAL SETTINGS ONLY
========================================================= */

function saveLocalSettings() {
  localStorage.setItem(
    "wahen-theme",
    state.dark ? "dark" : "light"
  );
}


/* =========================================================
   8. NOTIFICATION / TOAST
========================================================= */

function toast(message) {
  const element = $("#toast");

  if (!element) {
    alert(message);
    return;
  }

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toast.timer);

  toast.timer = setTimeout(() => {
    element.classList.remove("show");
  }, 2400);
}

function notify(message, type = "info") {
  state.notifications.unshift({
    id: Date.now(),
    message,
    type,
    time: new Date().toLocaleString()
  });

  toast(message);
}


/* =========================================================
   9. SUPABASE CONNECTION TEST
========================================================= */

async function testSupabaseConnection() {
  try {
    if (!supabaseClient) {
      throw new Error(
        "Supabase Client lama helin."
      );
    }

    const {
      data,
      error
    } =
      await supabaseClient
        .auth
        .getSession();

    if (error) {
      throw error;
    }

    console.log(
      "WaHeN Supabase connection: OK"
    );

    console.log(
      "Session:",
      data?.session
        ? "User session ayaa jirta."
        : "Connection waa shaqaynaysaa."
    );

    return true;

  } catch (error) {

    console.error(
      "WaHeN Supabase Connection Error:",
      error
    );

    return false;
  }
}


/* =========================================================
   10. LOAD CURRENT USER
========================================================= */

async function loadCurrentUser() {
  if (!supabaseClient) {
    return;
  }

  try {
    const {
      data,
      error
    } =
      await supabaseClient
        .auth
        .getUser();

    if (error) {
      return;
    }

    if (!data?.user) {
      state.user = {
        id: null,
        name: "",
        phone: "",
        city: "",
        address: "",
        role: null
      };

      return;
    }

    const user =
      data.user;

    state.user = {
      id: user.id,
      name:
        user.user_metadata?.full_name ||
        user.email ||
        "",
      phone:
        user.user_metadata?.phone ||
        "",
      city:
        user.user_metadata?.city ||
        "",
      address:
        user.user_metadata?.address ||
        "",
      role:
        user.user_metadata?.role ||
        "customer"
    };

  } catch (error) {

    console.error(
      "User load error:",
      error
    );
  }
}


/* =========================================================
   11. LOAD SELLERS
========================================================= */

async function loadSellers() {
  if (!supabaseClient) {
    sellers = [];
    return;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("sellers")
        .select("*")
        .order("created_at", {
          ascending: false
        });

    if (error) {
      console.error(
        "Sellers load error:",
        error
      );

      sellers = [];
      return;
    }

    sellers =
      Array.isArray(data)
        ? data.map((seller) => ({
            id: seller.id,
            name:
              seller.name ||
              seller.store_name ||
              "Seller",
            owner:
              seller.owner ||
              "",
            city:
              seller.city ||
              "",
            category:
              seller.category ||
              "",
            verified:
              Boolean(
                seller.verified
              ),
            rating:
              Number(
                seller.rating || 0
              )
          }))
        : [];

  } catch (error) {

    console.error(
      "Sellers error:",
      error
    );

    sellers = [];
  }
}


/* =========================================================
   12. LOAD PRODUCTS
========================================================= */

async function loadProducts() {
  if (!supabaseClient) {
    products = [];
    return;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", {
          ascending: false
        });

    if (error) {
      console.error(
        "Products load error:",
        error
      );

      products = [];
      return;
    }

    products =
      Array.isArray(data)
        ? data.map((product) => ({
            id:
              product.id,

            name:
              product.name ||
              "",

            price:
              Number(
                product.price || 0
              ),

            stock:
              Number(
                product.stock || 0
              ),

            category:
              product.category ||
              "others",

            subcategory:
              product.subcategory ||
              "",

            rating:
              Number(
                product.rating || 0
              ),

            sellerId:
              product.seller_id ||
              product.sellerId,

            icon:
              product.icon ||
              "📦",

            image:
              product.image ||
              product.image_url ||
              "",

            specs:
              product.specs ||
              product.description ||
              "",

            description:
              product.description ||
              "",

            condition:
              product.condition ||
              "New"
          }))
        : [];

  } catch (error) {

    console.error(
      "Products error:",
      error
    );

    products = [];
  }
}


/* =========================================================
   13. LOAD BRANDS
========================================================= */

async function loadBrands() {
  if (!supabaseClient) {
    brands = [];
    return;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("brands")
        .select("*")
        .order("name");

    if (error) {
      console.error(
        "Brands load error:",
        error
      );

      brands = [];
      return;
    }

    brands =
      Array.isArray(data)
        ? data.map((brand) => ({
            id: brand.id,
            name:
              brand.name ||
              "",
            icon:
              brand.icon ||
              "🏷️",
            description:
              brand.description ||
              ""
          }))
        : [];

  } catch (error) {

    console.error(
      "Brands error:",
      error
    );

    brands = [];
  }
}


/* =========================================================
   14. LOAD MANUFACTURERS
========================================================= */

async function loadManufacturers() {
  if (!supabaseClient) {
    manufacturers = [];
    return;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("manufacturers")
        .select("*")
        .order("name");

    if (error) {
      console.error(
        "Manufacturers load error:",
        error
      );

      manufacturers = [];
      return;
    }

    manufacturers =
      Array.isArray(data)
        ? data.map((factory) => ({
            id: factory.id,
            name:
              factory.name ||
              "",
            icon:
              factory.icon ||
              "🏭",
            description:
              factory.description ||
              ""
          }))
        : [];

  } catch (error) {

    console.error(
      "Manufacturers error:",
      error
    );

    manufacturers = [];
  }
}


/* =========================================================
15. LOAD CART
========================================================= */

async function getOrCreateCart() {

  if (!supabaseClient || !state.user.id) {
    return null;
  }

  try {

    const { data: carts, error } =
      await supabaseClient
        .from("carts")
        .select("*")
        .eq("user_id", state.user.id)
        .order("created_at", { ascending: false })
        .limit(1);

    if (error) {
      throw error;
    }

    let cart = carts?.[0] || null;

    if (!cart) {

      const result =
        await supabaseClient
          .from("carts")
          .insert({
            user_id: state.user.id,
            status: "active"
          })
          .select()
          .single();

      if (result.error) {
        throw result.error;
      }

      cart = result.data;
    }

    state.cartId = cart.id;

    return cart;

  } catch (error) {

    console.error(
      "Cart create/load error:",
      error
    );

    state.cartId = null;

    return null;
  }
}


async function loadCart() {

  if (!supabaseClient || !state.user.id) {

    state.cart = [];
    state.cartId = null;

    return;
  }

  try {

    const cart =
      await getOrCreateCart();

    if (!cart) {

      state.cart = [];

      return;
    }

    const {
      data,
      error
    } =
      await supabaseClient
        .from("cart_items")
        .select(`
          id,
          cart_id,
          product_id,
          quantity
        `)
        .eq(
          "cart_id",
          cart.id
        );

    if (error) {
      throw error;
    }

    state.cart =
      Array.isArray(data)
        ? data.map((item) => ({
            id: item.product_id,
            qty: Number(
              item.quantity || 1
            )
          }))
        : [];

  } catch (error) {

    console.error(
      "Cart load error:",
      error
    );

    state.cart = [];
  }
}


/* =========================================================
   16. LOAD WISHLIST
========================================================= */

async function loadWishlist() {
  if (!supabaseClient || !state.user.id) {
    state.wishlist = new Set();
    return;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("wishlists")
        .select("product_id")
        .eq(
          "user_id",
          state.user.id
        );

    if (error) {
      console.error(
        "Wishlist load error:",
        error
      );

      state.wishlist =
        new Set();

      return;
    }

    state.wishlist =
      new Set(
        (data || []).map(
          (item) =>
            item.product_id
        )
      );

  } catch (error) {

    console.error(
      "Wishlist error:",
      error
    );

    state.wishlist =
      new Set();
  }
}


/* =========================================================
   17. LOAD ORDERS
========================================================= */

async function loadOrders() {
  if (!supabaseClient || !state.user.id) {
    state.orders = [];
    return;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq(
          "buyer_id",
          state.user.id
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );

    if (error) {
      console.error(
        "Orders load error:",
        error
      );

      state.orders = [];
      return;
    }

    state.orders =
      Array.isArray(data)
        ? data
        : [];

  } catch (error) {

    console.error(
      "Orders error:",
      error
    );

    state.orders = [];
  }
}


/* =========================================================
   18. LOAD ALL DATA
========================================================= */

async function loadAppData() {

  await loadCurrentUser();

  await Promise.all([
    loadSellers(),
    loadProducts(),
    loadBrands(),
    loadManufacturers()
  ]);

  await Promise.all([
    loadCart(),
    loadWishlist(),
    loadOrders()
  ]);
}


/* =========================================================
   19. THEME
========================================================= */

function updateTheme() {

  document.body.classList.toggle(
    "dark",
    state.dark
  );

  const button =
    $("#theme-toggle");

  if (button) {
    button.textContent =
      state.dark
        ? "☀️"
        : "🌙";
  }

  saveLocalSettings();
}


/* =========================================================
   20. VIEW NAVIGATION
========================================================= */

function setActiveView(view) {

  const target =
    document.querySelector(
      `.view[data-view="${view}"]`
    );

  if (!target) {
    return;
  }

  state.activeView =
    view;

  $$(".view").forEach(
    (element) => {

      element.classList.toggle(
        "active",
        element.dataset.view ===
          view
      );
    }
  );

  $$(".tab, .nav-item").forEach(
    (button) => {

      button.classList.toggle(
        "active",
        button.dataset.view ===
          view
      );
    }
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   21. CART TOTALS
========================================================= */

function updateCartCount() {

  const element =
    $("#cart-count");

  if (!element) {
    return;
  }

  const count =
    state.cart.reduce(
      (total, item) =>
        total +
        Number(item.qty || 0),
      0
    );

  element.textContent =
    count;
}

function cartTotals() {

  const subtotal =
    state.cart.reduce(
      (total, item) => {

        const product =
          getProduct(item.id);

        return (
          total +
          (product?.price || 0) *
            Number(item.qty || 0)
        );

      },
      0
    );

  const discount =
    state.coupon &&
    subtotal >=
      state.coupon.minimum
      ? Math.min(
          (
            subtotal *
            state.coupon.percent
          ) / 100,
          state.coupon.maximum
        )
      : 0;

  const delivery =
    state.cart.length
      ? DELIVERY_FEE
      : 0;

  return {
    subtotal,
    discount,
    delivery,
    total:
      subtotal -
      discount +
      delivery
  };
}


/* =========================================================
22. ADD TO CART
========================================================= */

async function addToCart(id) {

  const product =
    getProduct(id);

  if (!product) {
    return toast(
      "Alaabta lama helin."
    );
  }

  if (product.stock < 1) {
    return toast(
      "Alaabtan stock ma hayso."
    );
  }

  if (!state.user.id) {
    return toast(
      "Fadlan marka hore account samee ama soo gal."
    );
  }

  const cart =
    state.cartId
      ? { id: state.cartId }
      : await getOrCreateCart();

  if (!cart) {
    return toast(
      "Cart-ka lama diyaarin."
    );
  }

  const existing =
    state.cart.find(
      (item) =>
        String(item.id) ===
        String(product.id)
    );

  const newQty =
    existing
      ? Number(existing.qty) + 1
      : 1;

  if (newQty > product.stock) {
    return toast(
      "Stock-ka intii uu hayay ayaa la gaadhay."
    );
  }

  try {

    const {
      error
    } =
      await supabaseClient
        .from("cart_items")
        .upsert(
          {
            cart_id:
              cart.id,

            product_id:
              product.id,

            quantity:
              newQty
          },
          {
            onConflict:
              "cart_id,product_id"
          }
        );

    if (error) {
      throw error;
    }

    if (existing) {

      existing.qty =
        newQty;

    } else {

      state.cart.push({
        id:
          product.id,

        qty:
          newQty
      });
    }

    updateCartCount();

    toast(
      `${product.name} ayaa lagu daray cart-ka.`
    );

  } catch (error) {

    console.error(
      "Cart save error:",
      error
    );

    toast(
      "Alaabta Cart-ka laguma darin."
    );
  }
}


/* =========================================================
   23. PRODUCT CARD
========================================================= */

function productCard(product) {

  const seller =
    sellerOf(product);

  const liked =
    state.wishlist.has(
      product.id
    );

  const compared =
    state.compare.has(
      product.id
    );

  const image =
    product.image;

  return `
    <article
      class="product-card"
      data-product-id="${escapeHTML(product.id)}"
    >

      <button
        class="favorite-btn ${liked ? "liked" : ""}"
        data-favorite="${escapeHTML(product.id)}"
        type="button"
        aria-label="Wishlist"
      >
        ${liked ? "♥" : "♡"}
      </button>

      <div class="product-figure">

        ${
          image
            ? `
              <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(product.name)}"
                loading="lazy"
              >
            `
            : `
              ${product.icon || "📦"}
            `
        }

      </div>

      <div class="product-body">

        <h3 class="product-name">
          ${escapeHTML(product.name)}
        </h3>

        <div class="product-price">
          ${money(product.price)}
        </div>

        <div class="product-rating">
          ★ ${product.rating || 0}
          ·
          ${
            product.stock
              ? `${product.stock} available`
              : "OUT OF STOCK"
          }
        </div>

        <small>
          ${escapeHTML(
            seller?.name ||
            "Seller"
          )}

          ${
            seller?.verified
              ? " ✓"
              : ""
          }
        </small>

        <button
          class="product-add"
          data-add="${escapeHTML(product.id)}"
          type="button"
          ${
            product.stock < 1
              ? "disabled"
              : ""
          }
        >
          ${
            product.stock
              ? "🛒 Add to cart"
              : "Out of stock"
          }
        </button>

        <button
          class="text-btn"
          data-compare="${escapeHTML(product.id)}"
          type="button"
        >
          ${
            compared
              ? "✓ Compared"
              : "Compare"
          }
        </button>

      </div>

    </article>
  `;
}


/* =========================================================
   24. PRODUCT FILTERING
========================================================= */

function filteredProducts() {

  const query =
    state.query
      .toLowerCase()
      .trim();

  return products.filter(
    (product) => {

      const seller =
        sellerOf(product);

      const searchable = `
        ${product.name}
        ${product.subcategory}
        ${product.specs}
        ${product.description}
        ${seller?.name || ""}
        ${seller?.city || ""}
        ${categoryNames[
          product.category
        ] || ""}
      `.toLowerCase();

      const queryMatch =
        !query ||
        searchable.includes(
          query
        );

      const categoryMatch =
        state.activeCategory ===
          "all" ||
        product.category ===
          state.activeCategory;

      return (
        queryMatch &&
        categoryMatch
      );
    }
  );
}


/* =========================================================
   25. RENDER PRODUCTS
========================================================= */

function renderProducts() {

  const grid =
    $("#product-grid");

  if (!grid) {
    return;
  }

  const filtered =
    filteredProducts();

  grid.innerHTML =
    filtered.length
      ? filtered
          .map(productCard)
          .join("")
      : `
        <div
          class="empty-text"
          style="grid-column:1/-1"
        >
          ${
            products.length
              ? "Alaab lama helin."
              : "Alaabooyin weli lama gelin."
          }
        </div>
      `;
}


/* =========================================================
   26. RENDER ALL PRODUCTS
========================================================= */

function renderAllProducts() {

  const container =
    $("#all-products");

  if (!container) {
    return;
  }

  const list =
    state.query
      ? filteredProducts()
      : products;

  container.innerHTML =
    list.length
      ? list
          .map(productCard)
          .join("")
      : `
        <div
          class="empty-text"
          style="grid-column:1/-1"
        >
          ${
            products.length
              ? "Alaab lama helin."
              : "Alaabooyin weli lama gelin."
          }
        </div>
      `;
}


/* =========================================================
   27. WHOLESALE
========================================================= */

function renderWholesale() {

  const container =
    $("#wholesale-products");

  if (!container) {
    return;
  }

  const wholesaleProducts =
    products.filter(
      (product) =>
        Number(product.stock) >=
        10
    );

  container.innerHTML =
    wholesaleProducts.length
      ? wholesaleProducts
          .map(productCard)
          .join("")
      : `
        <p class="empty-text">
          Alaab jumlo ah weli lama hayo.
        </p>
      `;
}


/* =========================================================
   28. BRANDS
========================================================= */

function renderBrands() {

  const container =
    $("#brand-list");

  if (!container) {
    return;
  }

  container.innerHTML =
    brands.length
      ? brands
          .map(
            (brand) => `
              <button
                class="brand-card"
                type="button"
                data-brand="${escapeHTML(brand.id)}"
              >

                <span>
                  ${brand.icon || "🏷️"}
                </span>

                <strong>
                  ${escapeHTML(brand.name)}
                </strong>

                <small>
                  ${escapeHTML(
                    brand.description ||
                    ""
                  )}
                </small>

              </button>
            `
          )
          .join("")
      : `
        <p class="empty-text">
          Brands weli lama gelin.
        </p>
      `;
}


function showBrandProducts(
  brandId
) {

  const container =
    $("#brand-products");

  if (!container) {
    return;
  }

  const brand =
    brands.find(
      (item) =>
        String(item.id) ===
        String(brandId)
    );

  if (!brand) {
    return;
  }

  const brandProducts =
    products.filter(
      (product) => {

        const text =
          `
            ${product.name}
            ${product.brand || ""}
          `.toLowerCase();

        return text.includes(
          brand.name.toLowerCase()
        );
      }
    );

  container.innerHTML = `
    <div class="section-head">

      <h3>
        ${escapeHTML(brand.name)}
      </h3>

      <button
        class="text-btn"
        data-view="brands"
        type="button"
      >
        Back
      </button>

    </div>

    ${
      brandProducts.length
        ? brandProducts
            .map(productCard)
            .join("")
        : `
          <p class="empty-text">
            Alaab ${escapeHTML(
              brand.name
            )}
            hadda lama hayo.
          </p>
        `
    }
  `;
}


/* =========================================================
   29. MANUFACTURERS
========================================================= */

function renderManufacturers() {

  const container =
    $("#manufacturer-list");

  if (!container) {
    return;
  }

  container.innerHTML =
    manufacturers.length
      ? manufacturers
          .map(
            (factory) => `
              <button
                class="manufacturer-card"
                type="button"
                data-manufacturer="${escapeHTML(factory.id)}"
              >

                <span>
                  ${factory.icon || "🏭"}
                </span>

                <strong>
                  ${escapeHTML(factory.name)}
                </strong>

                <small>
                  ${escapeHTML(
                    factory.description ||
                    ""
                  )}
                </small>

              </button>
            `
          )
          .join("")
      : `
        <p class="empty-text">
          Warshado weli lama gelin.
        </p>
      `;
}


function showManufacturer(id) {

  const container =
    $("#manufacturer-products");

  if (!container) {
    return;
  }

  const factory =
    manufacturers.find(
      (item) =>
        String(item.id) ===
        String(id)
    );

  if (!factory) {
    return;
  }

  container.innerHTML = `
    <div class="section-head">

      <h3>
        ${escapeHTML(factory.name)}
      </h3>

    </div>

    <div class="info-card">

      <div class="info-icon">
        ${factory.icon || "🏭"}
      </div>

      <h3>
        ${escapeHTML(factory.name)}
      </h3>

      <p>
        ${escapeHTML(
          factory.description ||
          ""
        )}
      </p>

    </div>
  `;
}


/* =========================================================
   30. PRODUCT DETAIL
========================================================= */

function openProduct(id) {

  const product =
    getProduct(id);

  if (!product) {
    return;
  }

  state.selectedProduct =
    product.id;

  renderProductDetail();

  setActiveView(
    "product-detail"
  );
}


function renderProductDetail() {

  const container =
    $("#product-detail");

  const product =
    getProduct(
      state.selectedProduct
    );

  if (
    !container ||
    !product
  ) {
    return;
  }

  const seller =
    sellerOf(product);

  container.innerHTML = `
    <div class="product-detail-card">

      <div class="product-detail-icon">

        ${
          product.image
            ? `
              <img
                src="${escapeHTML(product.image)}"
                alt="${escapeHTML(product.name)}"
              >
            `
            : (
                product.icon ||
                "📦"
              )
        }

      </div>

      <div>

        <span class="eyebrow">
          ${
            categoryNames[
              product.category
            ] ||
            "Product"
          }
        </span>

        <h2>
          ${escapeHTML(product.name)}
        </h2>

        <div class="product-price">
          ${money(product.price)}
        </div>

        <div class="product-rating">
          ★ ${product.rating || 0}
        </div>

        <p>
          ${escapeHTML(
            product.description ||
            product.specs ||
            ""
          )}
        </p>

        <p>
          Xaalad:
          <strong>
            ${escapeHTML(
              product.condition ||
              "New"
            )}
          </strong>
        </p>

        <p>
          Stock:
          <strong>
            ${product.stock}
          </strong>
        </p>

        <p>
          Seller:
          <strong>
            ${escapeHTML(
              seller?.name ||
              "Seller"
            )}
          </strong>

          ${
            seller?.verified
              ? " ✓ Verified"
              : ""
          }
        </p>

        <p>
          Magaalada:
          ${escapeHTML(
            seller?.city ||
            "Somaliland"
          )}
        </p>

        <div class="modal-actions">

          <button
            class="primary-btn"
            data-add="${escapeHTML(product.id)}"
            type="button"
          >
            🛒 Ku dar Cart
          </button>

          <button
            class="secondary-btn"
            data-buy="${escapeHTML(product.id)}"
            type="button"
          >
            Iibso hadda
          </button>

          <button
            class="secondary-btn"
            data-favorite="${escapeHTML(product.id)}"
            type="button"
          >
            ${
              state.wishlist.has(
                product.id
              )
                ? "♥ Wishlist"
                : "♡ Wishlist"
            }
          </button>

        </div>

      </div>

    </div>
  `;

  renderRelatedProducts(
    product
  );

  renderComplementaryProducts(
    product
  );

  renderPriceComparison(
    product
  );
}


/* =========================================================
   31. RELATED PRODUCTS
========================================================= */

function renderRelatedProducts(
  product
) {

  const container =
    $("#related-products");

  if (!container) {
    return;
  }

  const related =
    products
      .filter(
        (item) =>
          item.id !==
            product.id &&
          (
            item.category ===
              product.category ||
            item.subcategory ===
              product.subcategory
          )
      )
      .slice(0, 4);

  container.innerHTML =
    related.length
      ? related
          .map(productCard)
          .join("")
      : `
        <p class="empty-text">
          Alaabooyin la mid ah
          hadda lama hayo.
        </p>
      `;
}


/* =========================================================
   32. COMPLEMENTARY PRODUCTS
========================================================= */

function renderComplementaryProducts(
  product
) {

  const container =
    $("#complementary-products");

  if (!container) {
    return;
  }

  let complementary =
    products.filter(
      (item) =>
        item.id !==
        product.id
    );

  if (
    product.subcategory ===
    "Phones"
  ) {

    complementary =
      complementary.filter(
        (item) =>
          item.subcategory ===
          "Accessories"
      );

  } else if (
    product.subcategory ===
    "Accessories"
  ) {

    complementary =
      complementary.filter(
        (item) =>
          item.subcategory ===
          "Phones"
      );

  } else {

    complementary =
      complementary.filter(
        (item) =>
          item.category ===
          product.category
      );
  }

  complementary =
    complementary.slice(0, 4);

  container.innerHTML =
    complementary.length
      ? complementary
          .map(productCard)
          .join("")
      : `
        <p class="empty-text">
          Alaabooyin lala isticmaalo
          hadda lama hayo.
        </p>
      `;
}


/* =========================================================
   33. PRICE COMPARISON
========================================================= */

function renderPriceComparison(
  product
) {

  const container =
    $("#price-comparison");

  if (!container) {
    return;
  }

  const seller =
    sellerOf(product);

  container.innerHTML = `
    <div class="price-table">

      <div class="price-table-head">
        <span>Seller</span>
        <span>Price</span>
        <span>Delivery</span>
        <span>Rating</span>
      </div>

      <div class="price-table-row">

        <strong>
          ${escapeHTML(
            seller?.name ||
            "Seller"
          )}
        </strong>

        <span>
          ${money(product.price)}
        </span>

        <span>
          ${money(DELIVERY_FEE)}
        </span>

        <span>
          ★ ${
            seller?.rating ||
            product.rating ||
            0
          }
        </span>

      </div>

    </div>
  `;
}


/* =========================================================
   34. WISHLIST
========================================================= */

async function toggleWishlist(
  id
) {

  const productId =
    id;

  if (!state.user.id) {
    return toast(
      "Fadlan marka hore soo gal."
    );
  }

  if (
    state.wishlist.has(
      productId
    )
  ) {

    state.wishlist.delete(
      productId
    );

    if (supabaseClient) {

      await supabaseClient
        .from("wishlists")
        .delete()
        .eq(
          "user_id",
          state.user.id
        )
        .eq(
          "product_id",
          productId
        );
    }

    toast(
      "Wishlist ayaa laga saaray."
    );

  } else {

    state.wishlist.add(
      productId
    );

    if (supabaseClient) {

      const {
        error
      } =
        await supabaseClient
          .from("wishlists")
          .upsert(
            {
              user_id:
                state.user.id,
              product_id:
                productId
            },
            {
              onConflict:
                "user_id,product_id"
            }
          );

      if (error) {
        console.error(
          "Wishlist save error:",
          error
        );
      }
    }

    toast(
      "Wishlist ayaa lagu daray."
    );
  }

  renderProducts();
  renderAllProducts();

  if (
    state.selectedProduct ===
    productId
  ) {
    renderProductDetail();
  }
}


/* =========================================================
   35. MODAL
========================================================= */

function openModal(
  title,
  body,
  after
) {

  const overlay =
    document.createElement(
      "div"
    );

  overlay.className =
    "overlay";

  overlay.innerHTML = `
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
    >

      <div class="modal-head">

        <h2>
          ${title}
        </h2>

        <button
          class="modal-close"
          type="button"
        >
          ×
        </button>

      </div>

      <div class="modal-body">
        ${body}
      </div>

    </div>
  `;

  document.body.appendChild(
    overlay
  );

  overlay
    .querySelector(
      ".modal-close"
    )
    .onclick = () =>
      overlay.remove();

  overlay.onclick =
    (event) => {

      if (
        event.target ===
        overlay
      ) {
        overlay.remove();
      }
    };

  after?.(overlay);

  return overlay;
}


/* =========================================================
   36. CART MODAL
========================================================= */

function openCart() {

  if (!state.user.id) {
    return toast(
      "Fadlan marka hore soo gal."
    );
  }

  const totals =
    cartTotals();

  const rows =
    state.cart.length
      ? state.cart
          .map((item) => {

            const product =
              getProduct(
                item.id
              );

            return `
              <div class="cart-row">

                <span>

                  ${
                    product?.icon ||
                    "📦"
                  }

                  ${escapeHTML(
                    product?.name ||
                    "Product"
                  )}

                  <br>

                  <small>

                    ${money(
                      product?.price
                    )}

                    ×

                    <button
                      data-qty="${escapeHTML(product?.id)}"
                      data-delta="-1"
                    >
                      −
                    </button>

                    ${item.qty}

                    <button
                      data-qty="${escapeHTML(product?.id)}"
                      data-delta="1"
                    >
                      +
                    </button>

                  </small>

                </span>

                <strong>
                  ${money(
                    (product?.price || 0) *
                    item.qty
                  )}
                </strong>

              </div>
            `;
          })
          .join("")
      : `
        <p class="empty-text">
          Gaadhigu wuu madhan yahay.
        </p>
      `;

  openModal(
    "Gaadhiga wax iibsiga",

    `
      ${rows}

      ${
        state.cart.length
          ? `

            <label>
              Coupon

              <input
                id="coupon-input"
                placeholder="WAHEN10"
                value="${
                  state.coupon
                    ? "WAHEN10"
                    : ""
                }"
              >

              <button
                class="secondary-btn"
                id="apply-coupon"
                type="button"
              >
                Apply
              </button>

            </label>

            <div class="checkout-line">

              <span>
                Subtotal
              </span>

              <strong>
                ${money(
                  totals.subtotal
                )}
              </strong>

            </div>

            <div class="checkout-line">

              <span>
                Discount
              </span>

              <strong>
                -${money(
                  totals.discount
                )}
              </strong>

            </div>

            <div class="checkout-line">

              <span>
                Delivery
              </span>

              <strong>
                ${money(
                  totals.delivery
                )}
              </strong>

            </div>

            <div class="checkout-line">

              <strong>
                Total
              </strong>

              <strong>
                ${money(
                  totals.total
                )}
              </strong>

            </div>

            <div class="modal-actions">

              <button
                class="primary-btn"
                id="checkout"
                type="button"
              >
                Checkout
              </button>

              <button
                class="secondary-btn"
                id="compare"
                type="button"
              >
                Compare
                (${state.compare.size})
              </button>

            </div>
          `
          : ""
      }
    `,

    (modal) => {

      modal
        .querySelectorAll(
          "[data-qty]"
        )
        .forEach(
          (button) => {

            button.onclick =
              async () => {

                const item =
                  state.cart.find(
                    (cartItem) =>
                      String(
                        cartItem.id
                      ) ===
                      String(
                        button.dataset.qty
                      )
                  );

                if (!item) {
                  return;
                }

                const product =
                  getProduct(
                    item.id
                  );

                item.qty =
                  Math.max(
                    0,
                    Math.min(
                      product?.stock ||
                        0,
                      item.qty +
                        Number(
                          button.dataset
                            .delta
                        )
                    )
                  );

                if (!item.qty) {

                  state.cart =
                    state.cart.filter(
                      (cartItem) =>
                        cartItem !==
                        item
                    );
                }

                if (supabaseClient) {

                  if (item.qty) {

                    await supabaseClient
                      .from(
                        "cart_items"
                      )
                      .update({
                        quantity:
                          item.qty
                      })
                      .eq(
                        "cart_id",
                        state.cartId
                      )
                      .eq(
                        "product_id",
                        item.id
                      );

                  } else {

                    await supabaseClient
                      .from(
                        "cart_items"
                      )
                      .delete()
                      .eq(
                        "cart_id",
                        state.cartId
                      )
                      .eq(
                        "product_id",
                        item.id
                      );
                  }
                }

                updateCartCount();

                modal.remove();

                openCart();
              };
          }
        );

      modal
        .querySelector(
          "#apply-coupon"
        )
        ?.addEventListener(
          "click",
          () => {

            const code =
              modal
                .querySelector(
                  "#coupon-input"
                )
                .value
                .trim()
                .toUpperCase();

            const coupon =
              COUPONS[code];

            if (!coupon) {
              return toast(
                "Coupon-ku ma shaqaynayo."
              );
            }

            if (
              cartTotals()
                .subtotal <
              coupon.minimum
            ) {
              return toast(
                "Minimum purchase waa $50."
              );
            }

            state.coupon =
              coupon;

            modal.remove();

            openCart();
          }
        );

      modal
        .querySelector(
          "#checkout"
        )
        ?.addEventListener(
          "click",
          () => {

            modal.remove();

            openCheckout();
          }
        );

      modal
        .querySelector(
          "#compare"
        )
        ?.addEventListener(
          "click",
          () => {

            modal.remove();

            openCompare();
          }
        );
    }
  );
}

/* =========================================================
   37. CHECKOUT
========================================================= */

function openCheckout() {

  if (!state.user.id) {
    return toast(
      "Fadlan marka hore soo gal."
    );
  }

  if (!state.cart.length) {
    return toast(
      "Cart-ku waa madhan yahay."
    );
  }

  const totals =
    cartTotals();

  openModal(
    "Checkout",

    `
      <form
        id="checkout-form"
        class="form-grid"
      >

        <label>
          Magaca

          <input
            name="name"
            value="${escapeHTML(
              state.user.name
            )}"
            required
          >
        </label>

        <label>
          Phone

          <input
            name="phone"
            value="${escapeHTML(
              state.user.phone
            )}"
            required
          >
        </label>

        <label>
          Address

          <input
            name="address"
            value="${escapeHTML(
              state.user.address
            )}"
            required
          >
        </label>

        <label>
          City

          <select name="city">

            <option>
              Hargeisa
            </option>

            <option>
              Berbera
            </option>

            <option>
              Borama
            </option>

            <option>
              Burco
            </option>

            <option>
              Ceerigaabo
            </option>

            <option>
              Laascaanood
            </option>

          </select>

        </label>

        <label>
          Delivery

          <select name="delivery">

            <option>
              Standard Delivery
            </option>

            <option>
              Inter-city Delivery
            </option>

          </select>

        </label>

        <label>
          Payment

          <select name="payment">

            <option>
              ZAAD
            </option>

            <option>
              E-Dahab
            </option>

            <option>
              Premier
            </option>

          </select>

        </label>

        <div class="checkout-line">

          <strong>
            Total
          </strong>

          <strong>
            ${money(
              totals.total
            )}
          </strong>

        </div>

        <button
          class="primary-btn"
          type="submit"
        >
          Continue
        </button>

      </form>
    `,

    (modal) => {

      modal
        .querySelector(
          "#checkout-form"
        )
        .onsubmit =
        async (event) => {

          event.preventDefault();

          const data =
            Object.fromEntries(
              new FormData(
                event.target
              )
            );

          const invalid =
            state.cart.some(
              (item) => {

                const product =
                  getProduct(
                    item.id
                  );

                return (
                  !product ||
                  product.stock <
                    item.qty
                );
              }
            );

          if (invalid) {

            return toast(
              "Qaar ka mid ah alaabtu stock ma hayso."
            );
          }

          modal.remove();

          await createOrder(
            data,
            totals
          );
        };
    }
  );
}


/* =========================================================
   38. CREATE ORDER
========================================================= */

async function createOrder(
  data,
  totals
) {

  if (
    !supabaseClient ||
    !state.user.id
  ) {
    return toast(
      "Account ama Supabase connection ayaa maqan."
    );
  }

  const orderItems =
    state.cart.map(
      (item) => {

        const product =
          getProduct(
            item.id
          );

        return {
          product_id:
            product.id,

          seller_id:
            product.sellerId,

          quantity:
            item.qty,

          unit_price:
            product.price
        };
      }
    );

  try {

    const {
      data: order,
      error
    } =
      await supabaseClient
        .from("orders")
        .insert({
          buyer_id:
            state.user.id,

          buyer_name:
            data.name,

          phone:
            data.phone,

          address:
            data.address,

          city:
            data.city,

          subtotal:
            totals.subtotal,

          discount:
            totals.discount,

          delivery_fee:
            totals.delivery,

          total:
            totals.total,

          payment_method:
            data.payment,

          payment_status:
            "PENDING",

          status:
            "PENDING"
        })
        .select()
        .single();

    if (error) {
      throw error;
    }

    const items =
      orderItems.map(
        (item) => ({
          ...item,
          order_id:
            order.id
        })
      );

    const {
      error:
        itemsError
    } =
      await supabaseClient
        .from("order_items")
        .insert(items);

    if (itemsError) {
      throw itemsError;
    }

    state.cart = [];

    state.coupon = null;

    await supabaseClient
      .from("cart_items")
      .delete()
      .eq(
        "user_id",
        state.user.id
      );

    updateCartCount();

    await loadOrders();

    notify(
      `Order ${order.id} waa la sameeyay.`
    );

    openOrder(
      order.id
    );

  } catch (error) {

    console.error(
      "Create order error:",
      error
    );

    toast(
      "Order-ka lama samayn. Fadlan mar kale isku day."
    );
  }
}


/* =========================================================
   39. ORDER TRACKING
========================================================= */

function openOrder(id) {

  const order =
    state.orders.find(
      (item) =>
        String(item.id) ===
        String(id)
    );

  if (!order) {
    return;
  }

  const currentIndex =
    ORDER_STATES.indexOf(
      order.status
    );

  const next =
    ORDER_STATES[
      Math.min(
        currentIndex + 1,
        ORDER_STATES.length - 1
      )
    ];

  openModal(
    `Order ${escapeHTML(
      order.id
    )}`,

    `
      <p>

        <strong>
          Status:
        </strong>

        ${escapeHTML(
          order.status ||
          "PENDING"
        )}

        <br>

        <strong>
          Payment:
        </strong>

        ${escapeHTML(
          order.payment_status ||
          order.paymentStatus ||
          "PENDING"
        )}

        <br>

        <strong>
          Delivery:
        </strong>

        ${escapeHTML(
          order.address ||
          ""
        )},
        ${escapeHTML(
          order.city ||
          ""
        )}

        <br>

        <strong>
          Total:
        </strong>

        ${money(
          order.total
        )}

      </p>

      ${
        order.status ===
          "DELIVERED"
          ? `
            <button
              class="primary-btn"
              id="review"
              type="button"
            >
              Leave review
            </button>
          `
          : ""
      }

    `,

    (modal) => {

      modal
        .querySelector(
          "#review"
        )
        ?.addEventListener(
          "click",
          () => {

            modal.remove();

            toast(
              "Review system-ka waa la diyaarin doonaa."
            );
          }
        );
    }
  );
}


/* =========================================================
   40. COMPARE
========================================================= */

function openCompare() {

  const list =
    [...state.compare]
      .map(getProduct)
      .filter(Boolean);

  if (!list.length) {
    return toast(
      "Dooro ugu yaraan hal product."
    );
  }

  openModal(
    "Compare Products",

    `
      <div class="compare-grid">

        ${list
          .map(
            (product) => `
              <div>

                <h3>
                  ${escapeHTML(
                    product.name
                  )}
                </h3>

                <p>
                  Price:
                  <strong>
                    ${money(
                      product.price
                    )}
                  </strong>
                </p>

                <p>
                  Rating:
                  ★ ${
                    product.rating ||
                    0
                  }
                </p>

                <p>
                  Stock:
                  ${product.stock}
                </p>

                <p>
                  Seller:
                  ${escapeHTML(
                    sellerOf(
                      product
                    )?.name ||
                    ""
                  )}
                </p>

                <p>
                  Specs:
                  ${escapeHTML(
                    product.specs ||
                    ""
                  )}
                </p>

              </div>
            `
          )
          .join("")}

      </div>
    `
  );
}


/* =========================================================
   41. AUTHENTICATION
========================================================= */

async function openAuth(mode = "login") {

  const isSignup =
    mode === "signup";

  openModal(
    isSignup
      ? "Samee Account-ka WaHeN"
      : "Soo gal WaHeN",

    `
      <form
        id="auth-form"
        class="form-grid"
      >

        ${
          isSignup
            ? `
              <label>
                Magaca oo dhan

                <input
                  name="full_name"
                  type="text"
                  required
                >
              </label>

              <label>
                Phone

                <input
                  name="phone"
                  type="tel"
                  required
                >
              </label>
            `
            : ""
        }

        <label>
          Email

          <input
            name="email"
            type="email"
            required
          >
        </label>

        <label>
          Password

          <input
            name="password"
            type="password"
            minlength="6"
            required
          >
        </label>

        <button
          class="primary-btn"
          type="submit"
        >
          ${
            isSignup
              ? "Samee Account"
              : "Soo gal"
          }
        </button>

        <button
          class="secondary-btn"
          id="auth-switch"
          type="button"
        >
          ${
            isSignup
              ? "Hore account ma u leedahay? Soo gal"
              : "Account ma lihid? Samee account"
          }
        </button>

      </form>
    `,

    (modal) => {

      const form =
        modal.querySelector(
          "#auth-form"
        );

      const switchButton =
        modal.querySelector(
          "#auth-switch"
        );

      switchButton?.addEventListener(
        "click",
        () => {

          modal.remove();

          openAuth(
            isSignup
              ? "login"
              : "signup"
          );
        }
      );

      form.onsubmit =
        async (event) => {

          event.preventDefault();

          if (!supabaseClient) {
            return toast(
              "Supabase lama helin."
            );
          }

          const formData =
            new FormData(
              event.target
            );

          const email =
            String(
              formData.get("email") || ""
            ).trim();

          const password =
            String(
              formData.get("password") || ""
            );

          if (isSignup) {

            const fullName =
              String(
                formData.get("full_name") || ""
              ).trim();

            const phone =
              String(
                formData.get("phone") || ""
              ).trim();

            const {
              data,
              error
            } =
              await supabaseClient
                .auth
                .signUp({
                  email,
                  password,
                  options: {
                    data: {
                      full_name:
                        fullName,
                      phone:
                        phone,
                      role:
                        "customer"
                    }
                  }
                });

            if (error) {

              console.error(
                "Signup error:",
                error
              );

              return toast(
                error.message
              );
            }

            if (!data?.user) {
              return toast(
                "Account lama samayn."
              );
            }

            modal.remove();

            await loadCurrentUser();

            renderAccount();

            notify(
              "Account-ka WaHeN waa la sameeyay."
            );

            return;
          }


          const {
            error
          } =
            await supabaseClient
              .auth
              .signInWithPassword({
                email,
                password
              });

          if (error) {

            return toast(
              error.message
            );
          }

          modal.remove();

          await loadAppData();

          renderAccount();

          updateCartCount();

          notify(
            "WaHeN account-ka waa la soo galay."
          );
        };
    }
  );
}
  

/* =========================================================
   42. ACCOUNT VIEW
========================================================= */ 
function renderAccount() {

  const guest =
    $("#account-guest") ||
    $("#guest-account-panel");

  const customer =
    $("#account-customer") ||
    $("#customer-account-panel");

  if (!guest || !customer) {
    return;
  }

  const loggedIn =
    Boolean(
      state.user &&
      state.user.id
    );

  guest.style.display =
    loggedIn
      ? "none"
      : "";

  customer.style.display =
    loggedIn
      ? ""
      : "none";

  const name =
    document.querySelector(
      "[data-account-name]"
    );

  if (name) {
    name.textContent =
      state.user.name ||
      "Customer";
  }
}


/* =========================================================
   43. CHAT
========================================================= */

function openChat(type) {

  const names = {
    support:
      "WaHeN Support",

    seller:
      "Seller",

    delivery:
      "Delivery"
  };

  const title =
    names[type] ||
    "WaHeN Chat";

  openModal(
    title,

    `
      <div class="chat-box">

        <div
          class="chat-message received"
        >
          Salaan 👋
          Sideen kuu caawin karnaa?
        </div>

        <div
          id="chat-messages"
        ></div>

      </div>

      <form
        id="chat-form"
        class="chat-form"
      >

        <input
          id="chat-input"
          placeholder="Qor fariinta..."
          required
        >

        <button
          class="primary-btn"
          type="submit"
        >
          Dir
        </button>

      </form>
    `,

    (modal) => {

      const form =
        modal.querySelector(
          "#chat-form"
        );

      const input =
        modal.querySelector(
          "#chat-input"
        );

      const messages =
        modal.querySelector(
          "#chat-messages"
        );

      form.onsubmit =
        (event) => {

          event.preventDefault();

          const message =
            input.value.trim();

          if (!message) {
            return;
          }

          messages.innerHTML += `
            <div class="chat-message sent">
              ${escapeHTML(
                message
              )}
            </div>
          `;

          input.value = "";
        };
    }
  );
}


/* =========================================================
   44. HTML ESCAPE
========================================================= */

function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


/* =========================================================
   45. SETTINGS
========================================================= */

function openSettingsAction(
  type
) {

  if (type === "account") {

    setActiveView(
      "account"
    );

    renderAccount();

    return;
  }

  if (type === "theme") {

    state.dark =
      !state.dark;

    updateTheme();

    return;
  }

  if (type === "language") {

    openModal(
      "Language",

      `
        <p>
          Af-Soomaali
        </p>

        <p>
          English
        </p>
      `
    );

    return;
  }

  if (type === "notifications") {

    openModal(
      "Notifications",

      state.notifications.length
        ? state.notifications
            .map(
              (item) => `
                <div class="order-item">

                  <span>
                    ${escapeHTML(
                      item.message
                    )}
                  </span>

                  <small>
                    ${escapeHTML(
                      item.time
                    )}
                  </small>

                </div>
              `
            )
            .join("")
        : `
          <p>
            Notifications ma jiraan.
          </p>
        `
    );

    return;
  }

  if (type === "privacy") {

    openModal(
      "Privacy & Security",

      `
        <p>
          Xogta muhiimka ah waxaa
          lagu maamulaa Supabase.
        </p>

        <p>
          Authentication iyo
          Row Level Security (RLS)
          ayaa backend-ka lagu
          xoojin doonaa.
        </p>
      `
    );

    return;
  }

  if (type === "support") {

    openChat(
      "support"
    );
  }
}


/* =========================================================
   46. GENERAL ACTIONS
========================================================= */

async function action(name) {

  

  if (name === "login") {
    openAuth("login");
    return;
  }

  if (name === "create-account") {
    openAuth("signup");
    return;
  }

  if (
    name === "show-all" ||
    name === "shop-now"
  ) {

    state.activeCategory =
      "all";

    state.query = "";

    if ($("#product-search")) {
      $("#product-search").value =
        "";
    }

    renderProducts();
    renderAllProducts();

    setActiveView(
      "products"
    );

    return;
  }

  if (
    name === "view-orders" ||
    name === "track"
  ) {

    const order =
      state.orders[0];

    if (!order) {
      return toast(
        "Dalab weli ma jiro."
      );
    }

    openOrder(
      order.id
    );

    return;
  }

  if (
    name === "favorites"
  ) {

    const list =
      [...state.wishlist]
        .map(getProduct)
        .filter(Boolean);

    openModal(
      "Waxyaabaha aan jeclahay",

      list.length
        ? list
            .map(productCard)
            .join("")
        : `
          <p>
            Wishlist waa madhan.
          </p>
        `
    );

    return;
  }

  if (
    name === "categories"
  ) {

    setActiveView(
      "categories"
    );

    return;
  }

  if (
    name === "account"
  ) {

    setActiveView(
      "account"
    );

    renderAccount();

    return;
  }

  if (
    name === "become-seller"
  ) {

    if (!state.user.id) {
      return toast(
        "Fadlan marka hore samee account."
      );
    }

    openModal(
      "Noqo Seller",

      `
        <p>
          Seller ahaan waxaad
          dirsan kartaa codsiga
          shop-kaaga.
        </p>

        <button
          class="primary-btn"
          id="seller-apply"
          type="button"
        >
          Codso Seller
        </button>
      `,

      (modal) => {

        modal
          .querySelector(
            "#seller-apply"
          )
          .onclick =
          async () => {

            if (!supabaseClient) {
              return toast(
                "Supabase connection ayaa maqan."
              );
            }

            const {
              error
            } =
              await supabaseClient
                .from(
                  "seller_applications"
                )
                .insert({
                  user_id:
                    state.user.id,

                  status:
                    "PENDING"
                });

            if (error) {

              console.error(
                error
              );

              return toast(
                "Codsiga lama dirin."
              );
            }

            modal.remove();

            notify(
              "Codsiga Seller-ka waa la diray."
            );
          };
      }
    );

    return;
  }

  if (
    name === "logout"
  ) {

    if (supabaseClient) {

      await supabaseClient
        .auth
        .signOut();
    }

    state.user = {
      id: null,
      name: "",
      phone: "",
      city: "",
      address: "",
      role: null
    };

    state.cart = [];

    state.wishlist =
      new Set();

    state.orders = [];

    updateCartCount();

    renderAccount();

    notify(
      "WaHeN account-ka waa laga baxay."
    );

    return;
  }

  const dashboardActions = [
    "add-product",
    "inventory",
    "seller-orders",
    "promotions",
    "manage-users",
    "manage-products",
    "manage-orders",
    "store-profile"
  ];

  if (
    dashboardActions.includes(
      name
    )
  ) {

    openModal(
      name.replaceAll(
        "-",
        " "
      ),

      `
        <p>
          Qaybtan waxay ku xirmi
          doontaa dashboard-ka
          backend-ka WaHeN.
        </p>
      `
    );
  }
}


/* =========================================================
   47. CATEGORY SELECTION
========================================================= */

function selectCategory(
  category
) {

  state.activeCategory =
    category;

  state.query = "";

  if (
    $("#product-search")
  ) {
    $("#product-search").value =
      "";
  }

  renderProducts();

  renderAllProducts();

  setActiveView(
    "products"
  );
}


/* =========================================================
   48. GLOBAL EVENT BINDING
========================================================= */

function bind() {

  /* Theme */

  $("#theme-toggle")
    ?.addEventListener(
      "click",
      () => {

        state.dark =
          !state.dark;

        updateTheme();
      }
    );


  /* Cart */

  $("#cart-btn")
    ?.addEventListener(
      "click",
      openCart
    );


  /* Menu */

  $("#menu-btn")
    ?.addEventListener(
      "click",
      () => {

        setActiveView(
          "account"
        );

        renderAccount();
      }
    );


  /* Search */

  $("#product-search")
    ?.addEventListener(
      "input",
      (event) => {

        state.query =
          event.target.value
            .trim();

        renderProducts();

        renderAllProducts();
      }
    );


  /* Navigation */

  $$(".tab, .nav-item[data-view]")
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const view =
              button.dataset.view;

            setActiveView(
              view
            );

            if (
              view ===
              "products"
            ) {
              renderAllProducts();
            }

            if (
              view ===
              "account"
            ) {
              renderAccount();
            }
          }
        );
      }
    );


  /* Categories */

  $$(".category")
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            selectCategory(
              button.dataset.category
            );
          }
        );
      }
    );


  /* Global clicks */

  document.addEventListener(
    "click",
    (event) => {

      /* Add */

      const add =
        event.target.closest(
          "[data-add]"
        );

      if (add) {

        event.stopPropagation();

        addToCart(
          add.dataset.add
        );

        return;
      }


      /* Buy */

      const buy =
        event.target.closest(
          "[data-buy]"
        );

      if (buy) {

        event.stopPropagation();

        addToCart(
          buy.dataset.buy
        ).then(
          () =>
            openCheckout()
        );

        return;
      }


      /* Favorite */

      const favorite =
        event.target.closest(
          "[data-favorite]"
        );

      if (favorite) {

        event.stopPropagation();

        toggleWishlist(
          favorite.dataset.favorite
        );

        return;
      }


      /* Compare */

      const compare =
        event.target.closest(
          "[data-compare]"
        );

      if (compare) {

        event.stopPropagation();

        const id =
          compare.dataset.compare;

        if (
          state.compare.has(
            id
          )
        ) {

          state.compare.delete(
            id
          );

          toast(
            "Compare laga saaray."
          );

        } else {

          state.compare.add(
            id
          );

          toast(
            "Compare lagu daray."
          );
        }

        renderProducts();

        renderAllProducts();

        if (
          state.selectedProduct ===
          id
        ) {
          renderProductDetail();
        }

        return;
      }


      /* Brand */

      const brand =
        event.target.closest(
          "[data-brand]"
        );

      if (brand) {

        showBrandProducts(
          brand.dataset.brand
        );

        return;
      }


      /* Manufacturer */

      const manufacturer =
        event.target.closest(
          "[data-manufacturer]"
        );

      if (manufacturer) {

        showManufacturer(
          manufacturer.dataset.manufacturer
        );

        return;
      }


      /* Chat */

      const chat =
        event.target.closest(
          "[data-chat]"
        );

      if (chat) {

        openChat(
          chat.dataset.chat
        );

        return;
      }


      /* Settings */

      const setting =
        event.target.closest(
          "[data-setting]"
        );

      if (setting) {

        openSettingsAction(
          setting.dataset.setting
        );

        return;
      }


      /* Actions */

      const actionButton =
        event.target.closest(
          "[data-action]"
        );

      if (actionButton) {

        action(
          actionButton.dataset.action
        );

        return;
      }


      /* Product */

      const card =
        event.target.closest(
          ".product-card"
        );

      if (
        card &&
        !event.target.closest(
          "button"
        )
      ) {

        openProduct(
          card.dataset.productId
        );

        return;
      }
    }
  );
}


/* =========================================================
   49. INITIALIZATION
========================================================= */

async function init() {

  updateTheme();

  bind();

  await testSupabaseConnection();

  await loadAppData();

  renderProducts();

  renderAllProducts();

  renderWholesale();

  renderBrands();

  renderManufacturers();

  renderAccount();

  updateCartCount();
}


/* =========================================================
   50. START APP
========================================================= */

init();