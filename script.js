/* =========================================================
   WaHeN Marketplace
   STEP 3 — Main JavaScript
   Local Demo / Prototype

   IMPORTANT:
   This is still local demo logic.
   Authentication, payments, roles, permissions and
   permanent database storage should later move to Supabase.
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
   2. DEMO SELLERS
========================================================= */

const sellers = [
  {
    id: "s1",
    name: "Hargeisa Mobile Center",
    owner: "Mohamed Ali",
    city: "Hargeisa",
    category: "Electronics",
    verified: true,
    rating: 4.7
  },
  {
    id: "s2",
    name: "Hargeisa Fashion House",
    owner: "Amina Mohamed",
    city: "Hargeisa",
    category: "Fashion",
    verified: true,
    rating: 4.8
  },
  {
    id: "s3",
    name: "Somaliland Home & Furniture",
    owner: "Abdi Hassan",
    city: "Hargeisa",
    category: "Home & Furniture",
    verified: true,
    rating: 4.6
  }
];


/* =========================================================
   3. DEMO PRODUCTS
========================================================= */

const products = [
  {
    id: 1,
    name: "Samsung Galaxy A15",
    price: 180,
    stock: 12,
    category: "electronics",
    subcategory: "Phones",
    rating: 4.6,
    sellerId: "s1",
    icon: "📱",
    specs: "128GB · 4GB RAM",
    condition: "New"
  },
  {
    id: 2,
    name: "Redmi Note 13",
    price: 195,
    stock: 8,
    category: "electronics",
    subcategory: "Phones",
    rating: 4.5,
    sellerId: "s1",
    icon: "📱",
    specs: "128GB · AMOLED",
    condition: "New"
  },
  {
    id: 3,
    name: "Oraimo Power Bank 20,000mAh",
    price: 25,
    stock: 30,
    category: "electronics",
    subcategory: "Accessories",
    rating: 4.4,
    sellerId: "s1",
    icon: "🔋",
    specs: "20,000mAh · USB-C",
    condition: "New"
  },
  {
    id: 4,
    name: "Type-C Fast Charger",
    price: 12,
    stock: 50,
    category: "electronics",
    subcategory: "Accessories",
    rating: 4.3,
    sellerId: "s1",
    icon: "🔌",
    specs: "25W fast charge",
    condition: "New"
  },
  {
    id: 5,
    name: "Men's Formal Suit",
    price: 85,
    stock: 15,
    category: "men",
    subcategory: "Fashion",
    rating: 4.5,
    sellerId: "s2",
    icon: "🕴️",
    specs: "Formal · Premium fabric",
    condition: "New"
  },
  {
    id: 6,
    name: "Women's Abaya",
    price: 35,
    stock: 25,
    category: "women",
    subcategory: "Fashion",
    rating: 4.7,
    sellerId: "s2",
    icon: "👗",
    specs: "Modest · Black",
    condition: "New"
  },
  {
    id: 7,
    name: "Men's Shoes",
    price: 30,
    stock: 20,
    category: "men",
    subcategory: "Shoes",
    rating: 4.4,
    sellerId: "s2",
    icon: "👞",
    specs: "Leather · Sizes 40-45",
    condition: "New"
  },
  {
    id: 8,
    name: "Women's Handbag",
    price: 28,
    stock: 18,
    category: "women",
    subcategory: "Fashion",
    rating: 4.5,
    sellerId: "s2",
    icon: "👜",
    specs: "Leather finish",
    condition: "New"
  },
  {
    id: 9,
    name: "Men's Shirt",
    price: 18,
    stock: 35,
    category: "men",
    subcategory: "Fashion",
    rating: 4.3,
    sellerId: "s2",
    icon: "👔",
    specs: "Cotton · Multiple sizes",
    condition: "New"
  },
  {
    id: 10,
    name: "Sofa Set",
    price: 450,
    stock: 5,
    category: "others",
    subcategory: "Home & Furniture",
    rating: 4.6,
    sellerId: "s3",
    icon: "🛋️",
    specs: "7 seats · Modern design",
    condition: "New"
  },
  {
    id: 11,
    name: "Office Chair",
    price: 75,
    stock: 15,
    category: "others",
    subcategory: "Home & Furniture",
    rating: 4.4,
    sellerId: "s3",
    icon: "🪑",
    specs: "Ergonomic · Adjustable",
    condition: "New"
  },
  {
    id: 12,
    name: "Dining Table",
    price: 220,
    stock: 7,
    category: "others",
    subcategory: "Home & Furniture",
    rating: 4.5,
    sellerId: "s3",
    icon: "🪵",
    specs: "6 seats · Wood",
    condition: "New"
  },
  {
    id: 13,
    name: "Bed",
    price: 300,
    stock: 6,
    category: "others",
    subcategory: "Home & Furniture",
    rating: 4.4,
    sellerId: "s3",
    icon: "🛏️",
    specs: "King size",
    condition: "New"
  },
  {
    id: 14,
    name: "Carpet",
    price: 60,
    stock: 20,
    category: "others",
    subcategory: "Home & Furniture",
    rating: 4.2,
    sellerId: "s3",
    icon: "🧶",
    specs: "3×4m · Washable",
    condition: "New"
  }
];


/* =========================================================
   4. DEMO BRAND / FACTORY DATA
========================================================= */

const brands = [
  {
    id: "samsung",
    name: "Samsung",
    icon: "📱",
    description: "Samsung electronics"
  },
  {
    id: "apple",
    name: "Apple",
    icon: "🍎",
    description: "Apple products"
  },
  {
    id: "xiaomi",
    name: "Xiaomi",
    icon: "📱",
    description: "Xiaomi devices"
  },
  {
    id: "oraimo",
    name: "Oraimo",
    icon: "🔋",
    description: "Accessories"
  }
];

const manufacturers = [
  {
    id: "samsung-factory",
    name: "Samsung",
    icon: "🏭",
    description: "Electronics manufacturer"
  },
  {
    id: "xiaomi-factory",
    name: "Xiaomi",
    icon: "🏭",
    description: "Technology manufacturer"
  },
  {
    id: "oraimo-factory",
    name: "Oraimo",
    icon: "🏭",
    description: "Accessories manufacturer"
  },
  {
    id: "local-factory",
    name: "Local Manufacturers",
    icon: "🏭",
    description: "Local Somaliland businesses"
  }
];


/* =========================================================
   5. CATEGORY INFORMATION
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
   6. LOCAL STORAGE
========================================================= */

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};


/* =========================================================
   7. APPLICATION STATE
========================================================= */

const state = {
  activeView: "home",
  activeCategory: "all",
  query: "",
  selectedProduct: null,

  cart: read("wahen-cart", []),

  wishlist: new Set(
    read("wahen-wishlist", [])
  ),

  compare: new Set(
    read("wahen-compare", [])
  ),

  orders: read("wahen-orders", []),

  notifications: read(
    "wahen-notifications",
    []
  ),

  dark:
    localStorage.getItem("wahen-theme") === "dark",

  user: read("wahen-user", {
    id: "buyer-1",
    name: "Ahmed Hassan",
    phone: "+252 63 7000000",
    city: "Hargeisa",
    address: "Jigjiga Yar, Hargeisa",
    role: "customer"
  }),

  coupon: null
};


/* =========================================================
   8. HELPERS
========================================================= */

const $ = (selector) =>
  document.querySelector(selector);

const $$ = (selector) =>
  [...document.querySelectorAll(selector)];

const money = (value) =>
  `$${Number(value || 0).toFixed(2)}`;

const sellerOf = (product) =>
  sellers.find(
    (seller) => seller.id === product?.sellerId
  );

function getProduct(id) {
  return products.find(
    (product) => product.id === Number(id)
  );
}

function save() {
  localStorage.setItem(
    "wahen-cart",
    JSON.stringify(state.cart)
  );

  localStorage.setItem(
    "wahen-wishlist",
    JSON.stringify([...state.wishlist])
  );

  localStorage.setItem(
    "wahen-compare",
    JSON.stringify([...state.compare])
  );

  localStorage.setItem(
    "wahen-orders",
    JSON.stringify(state.orders)
  );

  localStorage.setItem(
    "wahen-notifications",
    JSON.stringify(state.notifications)
  );

  localStorage.setItem(
    "wahen-theme",
    state.dark ? "dark" : "light"
  );

  localStorage.setItem(
    "wahen-user",
    JSON.stringify(state.user)
  );
}


/* =========================================================
   9. NOTIFICATION / TOAST
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

  save();
  toast(message);
}


/* =========================================================
   10. THEME
========================================================= */

function updateTheme() {
  document.body.classList.toggle(
    "dark",
    state.dark
  );

  const button = $("#theme-toggle");

  if (button) {
    button.textContent =
      state.dark ? "☀️" : "🌙";
  }

  save();
}


/* =========================================================
   11. VIEW NAVIGATION
========================================================= */

function setActiveView(view) {
  const target =
    document.querySelector(
      `.view[data-view="${view}"]`
    );

  if (!target) {
    return;
  }

  state.activeView = view;

  $$(".view").forEach((element) => {
    element.classList.toggle(
      "active",
      element.dataset.view === view
    );
  });

  $$(".tab, .nav-item").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.view === view
    );
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   12. CART
========================================================= */

function updateCartCount() {
  const element = $("#cart-count");

  if (!element) {
    return;
  }

  const count = state.cart.reduce(
    (total, item) => total + item.qty,
    0
  );

  element.textContent = count;
}

function cartTotals() {
  const subtotal =
    state.cart.reduce((total, item) => {
      const product = getProduct(item.id);

      return (
        total +
        (product?.price || 0) * item.qty
      );
    }, 0);

  const discount =
    state.coupon &&
    subtotal >= state.coupon.minimum
      ? Math.min(
          (subtotal *
            state.coupon.percent) /
            100,
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

function addToCart(id) {
  const product = getProduct(id);

  if (!product) {
    return;
  }

  if (product.stock < 1) {
    return toast(
      "Alaabtan hadda stock ma hayso."
    );
  }

  const item = state.cart.find(
    (cartItem) =>
      cartItem.id === product.id
  );

  if (
    item &&
    item.qty >= product.stock
  ) {
    return toast(
      `Stock-ka ${product.name} intii uu hayay ayaa la gaadhay.`
    );
  }

  if (item) {
    item.qty++;
  } else {
    state.cart.push({
      id: product.id,
      qty: 1
    });
  }

  save();
  updateCartCount();

  toast(
    `${product.name} ayaa lagu daray cart-ka.`
  );
}


/* =========================================================
   13. PRODUCT CARD
========================================================= */

function productCard(product) {
  const seller = sellerOf(product);

  const liked =
    state.wishlist.has(product.id);

  const compared =
    state.compare.has(product.id);

  return `
    <article
      class="product-card"
      data-product-id="${product.id}"
    >

      <button
        class="favorite-btn ${liked ? "liked" : ""}"
        data-favorite="${product.id}"
        type="button"
        aria-label="Wishlist"
      >
        ${liked ? "♥" : "♡"}
      </button>

      <div class="product-figure">
        ${product.icon}
      </div>

      <div class="product-body">

        <h3 class="product-name">
          ${product.name}
        </h3>

        <div class="product-price">
          ${money(product.price)}
        </div>

        <div class="product-rating">
          ★ ${product.rating}
          ·
          ${
            product.stock
              ? `${product.stock} available`
              : "OUT OF STOCK"
          }
        </div>

        <small>
          ${seller?.name || "Seller"}
          ${seller?.verified ? " ✓" : ""}
        </small>

        <button
          class="product-add"
          data-add="${product.id}"
          type="button"
          ${product.stock < 1 ? "disabled" : ""}
        >
          ${
            product.stock
              ? "🛒 Add to cart"
              : "Out of stock"
          }
        </button>

        <button
          class="text-btn"
          data-compare="${product.id}"
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
   14. PRODUCT FILTERING
========================================================= */

function filteredProducts() {
  const query =
    state.query
      .toLowerCase()
      .trim();

  return products.filter((product) => {
    const seller =
      sellerOf(product);

    const searchable = `
      ${product.name}
      ${product.subcategory}
      ${product.specs}
      ${seller?.name || ""}
      ${seller?.city || ""}
      ${categoryNames[product.category] || ""}
    `.toLowerCase();

    const queryMatch =
      !query ||
      searchable.includes(query) ||
      (
        query === "phone" &&
        product.subcategory === "Phones"
      );

    const categoryMatch =
      state.activeCategory === "all" ||
      product.category ===
        state.activeCategory;

    return (
      queryMatch &&
      categoryMatch
    );
  });
}


/* =========================================================
   15. RENDER HOME PRODUCTS
========================================================= */

function renderProducts() {
  const grid = $("#product-grid");

  if (!grid) {
    return;
  }

  const filtered =
    filteredProducts();

  grid.innerHTML =
    filtered.length
      ? filtered.map(productCard).join("")
      : `
        <div
          class="empty-text"
          style="grid-column:1/-1"
        >
          Alaab lama helin.
        </div>
      `;
}


/* =========================================================
   16. RENDER ALL PRODUCTS
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
      ? list.map(productCard).join("")
      : `
        <div
          class="empty-text"
          style="grid-column:1/-1"
        >
          Alaab lama helin.
        </div>
      `;
}


/* =========================================================
   17. RENDER WHOLESALE
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
        product.stock >= 10
    );

  container.innerHTML =
    wholesaleProducts
      .map(productCard)
      .join("");
}


/* =========================================================
   18. RENDER BRANDS
========================================================= */

function renderBrands() {
  const container =
    $("#brand-list");

  if (!container) {
    return;
  }

  container.innerHTML =
    brands.map((brand) => `
      <button
        class="brand-card"
        type="button"
        data-brand="${brand.id}"
      >
        <span>
          ${brand.icon}
        </span>

        <strong>
          ${brand.name}
        </strong>

        <small>
          ${brand.description}
        </small>
      </button>
    `).join("");
}

function showBrandProducts(brandId) {
  const container =
    $("#brand-products");

  if (!container) {
    return;
  }

  const brand =
    brands.find(
      (item) => item.id === brandId
    );

  if (!brand) {
    return;
  }

  let brandProducts = [];

  if (brandId === "samsung") {
    brandProducts =
      products.filter(
        (p) =>
          p.name
            .toLowerCase()
            .includes("samsung")
      );
  }

  if (brandId === "xiaomi") {
    brandProducts =
      products.filter(
        (p) =>
          p.name
            .toLowerCase()
            .includes("redmi")
      );
  }

  if (brandId === "oraimo") {
    brandProducts =
      products.filter(
        (p) =>
          p.name
            .toLowerCase()
            .includes("oraimo")
      );
  }

  if (brandId === "apple") {
    brandProducts = [];
  }

  container.innerHTML = `
    <div class="section-head">
      <h3>${brand.name}</h3>
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
            Alaab ${brand.name}
            hadda lama hayo.
          </p>
        `
    }
  `;
}


/* =========================================================
   19. RENDER MANUFACTURERS
========================================================= */

function renderManufacturers() {
  const container =
    $("#manufacturer-list");

  if (!container) {
    return;
  }

  container.innerHTML =
    manufacturers.map((factory) => `
      <button
        class="manufacturer-card"
        type="button"
        data-manufacturer="${factory.id}"
      >
        <span>
          ${factory.icon}
        </span>

        <strong>
          ${factory.name}
        </strong>

        <small>
          ${factory.description}
        </small>
      </button>
    `).join("");
}

function showManufacturer(id) {
  const container =
    $("#manufacturer-products");

  if (!container) {
    return;
  }

  const factory =
    manufacturers.find(
      (item) => item.id === id
    );

  if (!factory) {
    return;
  }

  container.innerHTML = `
    <div class="section-head">
      <h3>${factory.name}</h3>
    </div>

    <div class="info-card">
      <div class="info-icon">
        🏭
      </div>

      <h3>
        ${factory.name}
      </h3>

      <p>
        ${factory.description}
      </p>

      <p>
        Warshadaha iyo shirkadaha
        lagu daro WaHeN waxaa lagu
        maamuli doonaa xog rasmi ah
        marka backend-ka la xiro.
      </p>
    </div>
  `;
}


/* =========================================================
   20. PRODUCT DETAIL
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

  if (!container || !product) {
    return;
  }

  const seller =
    sellerOf(product);

  container.innerHTML = `
    <div class="product-detail-card">

      <div class="product-detail-icon">
        ${product.icon}
      </div>

      <div>

        <span class="eyebrow">
          ${categoryNames[product.category] || "Product"}
        </span>

        <h2>
          ${product.name}
        </h2>

        <div class="product-price">
          ${money(product.price)}
        </div>

        <div class="product-rating">
          ★ ${product.rating}
        </div>

        <p>
          ${product.specs}
        </p>

        <p>
          Xaalad:
          <strong>${product.condition}</strong>
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
            ${seller?.name || "Seller"}
          </strong>
          ${seller?.verified ? " ✓ Verified" : ""}
        </p>

        <p>
          Magaalada:
          ${seller?.city || "Somaliland"}
        </p>

        <div class="modal-actions">

          <button
            class="primary-btn"
            data-add="${product.id}"
            type="button"
          >
            🛒 Ku dar Cart
          </button>

          <button
            class="secondary-btn"
            data-buy="${product.id}"
            type="button"
          >
            Iibso hadda
          </button>

          <button
            class="secondary-btn"
            data-favorite="${product.id}"
            type="button"
          >
            ${
              state.wishlist.has(product.id)
                ? "♥ Wishlist"
                : "♡ Wishlist"
            }
          </button>

        </div>

      </div>

    </div>
  `;

  renderRelatedProducts(product);
  renderComplementaryProducts(product);
  renderPriceComparison(product);
}


/* =========================================================
   21. RELATED PRODUCTS
========================================================= */

function renderRelatedProducts(product) {
  const container =
    $("#related-products");

  if (!container) {
    return;
  }

  const related =
    products
      .filter(
        (item) =>
          item.id !== product.id &&
          (
            item.category === product.category ||
            item.subcategory === product.subcategory
          )
      )
      .slice(0, 4);

  container.innerHTML =
    related.length
      ? related.map(productCard).join("")
      : `
        <p class="empty-text">
          Alaabooyin la mid ah hadda lama hayo.
        </p>
      `;
}


/* =========================================================
   22. COMPLEMENTARY PRODUCTS
========================================================= */

function renderComplementaryProducts(product) {
  const container =
    $("#complementary-products");

  if (!container) {
    return;
  }

  let complementary = [];

  if (
    product.subcategory === "Phones"
  ) {
    complementary =
      products.filter(
        (item) =>
          item.subcategory ===
          "Accessories"
      );
  } else if (
    product.subcategory ===
    "Accessories"
  ) {
    complementary =
      products.filter(
        (item) =>
          item.subcategory ===
          "Phones"
      );
  } else {
    complementary =
      products.filter(
        (item) =>
          item.id !== product.id &&
          item.category ===
            product.category
      );
  }

  complementary =
    complementary
      .filter(
        (item) =>
          item.id !== product.id
      )
      .slice(0, 4);

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
   23. PRICE COMPARISON
========================================================= */

/*
   Demo comparison data.
   Later this will come from Supabase:
   product_offers / seller_products.
*/

const demoOffers = {
  1: [
    {
      seller: "Hargeisa Mobile Center",
      price: 180,
      delivery: 5,
      rating: 4.7
    },
    {
      seller: "Somaliland Tech Store",
      price: 185,
      delivery: 4,
      rating: 4.5
    },
    {
      seller: "City Electronics",
      price: 190,
      delivery: 3,
      rating: 4.4
    }
  ],

  2: [
    {
      seller: "Hargeisa Mobile Center",
      price: 195,
      delivery: 5,
      rating: 4.7
    },
    {
      seller: "Somaliland Tech Store",
      price: 200,
      delivery: 4,
      rating: 4.5
    }
  ],

  3: [
    {
      seller: "Hargeisa Mobile Center",
      price: 25,
      delivery: 5,
      rating: 4.7
    },
    {
      seller: "City Electronics",
      price: 28,
      delivery: 3,
      rating: 4.4
    }
  ]
};

function renderPriceComparison(product) {
  const container =
    $("#price-comparison");

  if (!container) {
    return;
  }

  const offers =
    demoOffers[product.id] || [
      {
        seller:
          sellerOf(product)?.name ||
          "Seller",
        price: product.price,
        delivery: DELIVERY_FEE,
        rating:
          sellerOf(product)?.rating ||
          product.rating
      }
    ];

  container.innerHTML = `
    <div class="price-table">

      <div class="price-table-head">
        <span>Seller</span>
        <span>Price</span>
        <span>Delivery</span>
        <span>Rating</span>
      </div>

      ${offers.map((offer) => `
        <div class="price-table-row">

          <strong>
            ${offer.seller}
          </strong>

          <span>
            ${money(offer.price)}
          </span>

          <span>
            ${money(offer.delivery)}
          </span>

          <span>
            ★ ${offer.rating}
          </span>

        </div>
      `).join("")}

    </div>

    <small class="muted">
      Qiimayaasha kore waa demo data.
      Production-ka waxaa si toos ah
      looga soo qaadan doonaa sellers-ka
      WaHeN.
    </small>
  `;
}


/* =========================================================
   24. WISHLIST
========================================================= */

function toggleWishlist(id) {
  const productId =
    Number(id);

  if (
    state.wishlist.has(productId)
  ) {
    state.wishlist.delete(
      productId
    );

    toast(
      "Wishlist ayaa laga saaray."
    );
  } else {
    state.wishlist.add(
      productId
    );

    toast(
      "Wishlist ayaa lagu daray."
    );
  }

  save();

  renderProducts();
  renderAllProducts();

  if (state.selectedProduct === productId) {
    renderProductDetail();
  }
}


/* =========================================================
   25. MODAL
========================================================= */

function openModal(
  title,
  body,
  after
) {
  const overlay =
    document.createElement("div");

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
    .querySelector(".modal-close")
    .onclick = () =>
      overlay.remove();

  overlay.onclick = (event) => {
    if (
      event.target === overlay
    ) {
      overlay.remove();
    }
  };

  after?.(overlay);

  return overlay;
}


/* =========================================================
   26. CART MODAL
========================================================= */

function openCart() {
  const totals =
    cartTotals();

  const rows =
    state.cart.length
      ? state.cart.map((item) => {

          const product =
            getProduct(item.id);

          return `
            <div class="cart-row">

              <span>
                ${product?.icon || "📦"}
                ${product?.name || "Product"}

                <br>

                <small>
                  ${money(product?.price)}
                  ×

                  <button
                    data-qty="${product?.id}"
                    data-delta="-1"
                  >
                    −
                  </button>

                  ${item.qty}

                  <button
                    data-qty="${product?.id}"
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
        }).join("")
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
                ${money(totals.subtotal)}
              </strong>
            </div>

            <div class="checkout-line">
              <span>
                Discount
              </span>

              <strong>
                -${money(totals.discount)}
              </strong>
            </div>

            <div class="checkout-line">
              <span>
                Delivery
              </span>

              <strong>
                ${money(totals.delivery)}
              </strong>
            </div>

            <div class="checkout-line">
              <strong>
                Total
              </strong>

              <strong>
                ${money(totals.total)}
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
                Compare (${state.compare.size})
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
        .forEach((button) => {

          button.onclick = () => {

            const item =
              state.cart.find(
                (cartItem) =>
                  cartItem.id ===
                  Number(
                    button.dataset.qty
                  )
              );

            if (!item) {
              return;
            }

            const product =
              getProduct(item.id);

            item.qty = Math.max(
              0,
              Math.min(
                product.stock,
                item.qty +
                  Number(
                    button.dataset.delta
                  )
              )
            );

            if (!item.qty) {
              state.cart =
                state.cart.filter(
                  (cartItem) =>
                    cartItem !== item
                );
            }

            save();
            updateCartCount();

            modal.remove();
            openCart();
          };
        });

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
              cartTotals().subtotal <
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
   27. CHECKOUT
========================================================= */

function openCheckout() {
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
            value="${state.user.name}"
            required
          >
        </label>

        <label>
          Phone

          <input
            name="phone"
            value="${state.user.phone}"
            required
          >
        </label>

        <label>
          Address

          <input
            name="address"
            value="${state.user.address}"
            required
          >
        </label>

        <label>
          City

          <select name="city">

            <option>Hargeisa</option>
            <option>Berbera</option>
            <option>Borama</option>
            <option>Burco</option>
            <option>Ceerigaabo</option>
            <option>Laascaanood</option>

          </select>
        </label>

        <label>
          Delivery

          <select name="delivery">

            <option>
              Standard Delivery — $5
            </option>

            <option>
              Inter-city — calculated
            </option>

          </select>
        </label>

        <label>
          Payment

          <select name="payment">

            <option>
              ZAAD Test Payment
            </option>

            <option>
              E-Dahab Test Payment
            </option>

            <option>
              Premier Test Payment
            </option>

          </select>
        </label>

        <div class="checkout-line">

          <strong>
            Total
          </strong>

          <strong>
            ${money(totals.total)}
          </strong>

        </div>

        <button
          class="primary-btn"
          type="submit"
        >
          Continue to secure test payment
        </button>

      </form>
    `,

    (modal) => {

      modal
        .querySelector(
          "#checkout-form"
        )
        .onsubmit = (event) => {

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

          openPayment(
            data,
            totals
          );
        };
    }
  );
}


/* =========================================================
   28. TEST PAYMENT
========================================================= */

function openPayment(
  data,
  totals
) {
  openModal(
    "ZAAD Test Payment",

    `
      <p>
        Payment-kan waa
        <strong>MOCK / SANDBOX</strong>.
        Lacag dhab ah lagama jarayo.
      </p>

      <p>
        Amount:
        <strong>
          ${money(totals.total)}
        </strong>
      </p>

      <p>
        Transaction status:
        <strong>
          PENDING
        </strong>
      </p>

      <div class="modal-actions">

        <button
          class="primary-btn"
          id="pay-success"
          type="button"
        >
          Simulate SUCCESS
        </button>

        <button
          class="secondary-btn"
          id="pay-fail"
          type="button"
        >
          Simulate FAILED
        </button>

        <button
          class="secondary-btn"
          id="pay-timeout"
          type="button"
        >
          Simulate TIMEOUT
        </button>

      </div>
    `,

    (modal) => {

      modal
        .querySelector(
          "#pay-success"
        )
        .onclick = () => {

          createOrder(
            data,
            totals,
            "SUCCESS"
          );

          modal.remove();
        };

      modal
        .querySelector(
          "#pay-fail"
        )
        .onclick = () => {

          notify(
            "Payment failed. Order-ka lama xaqiijin.",
            "error"
          );

          modal.remove();
        };

      modal
        .querySelector(
          "#pay-timeout"
        )
        .onclick = () => {

          notify(
            "Payment timeout. Fadlan mar kale isku day.",
            "error"
          );

          modal.remove();
        };
    }
  );
}


/* =========================================================
   29. CREATE ORDER
========================================================= */

function createOrder(
  data,
  totals,
  paymentStatus
) {
  const orderId =
    `WH${10001 + state.orders.length}`;

  const items =
    state.cart.map((item) => {

      const product =
        getProduct(item.id);

      return {
        ...item,
        name: product.name,
        price: product.price,
        sellerId: product.sellerId
      };
    });

  items.forEach((item) => {

    const product =
      getProduct(item.id);

    if (product) {
      product.stock -=
        item.qty;
    }
  });

  const initialStatus =
    paymentStatus === "SUCCESS"
      ? "PAID"
      : "PAYMENT_PENDING";

  const order = {
    id: orderId,

    buyerId:
      state.user.id,

    buyer:
      data.name,

    phone:
      data.phone,

    address:
      data.address,

    city:
      data.city,

    items,

    subtotal:
      totals.subtotal,

    discount:
      totals.discount,

    delivery:
      totals.delivery,

    total:
      totals.total,

    paymentStatus,

    paymentId:
      `TX-${Date.now()}`,

    status:
      initialStatus,

    history: [
      {
        status:
          initialStatus,

        at:
          new Date().toISOString()
      }
    ],

    sellerNotified: true,

    reviewed: false
  };

  state.orders.unshift(
    order
  );

  state.cart = [];
  state.coupon = null;

  save();

  updateCartCount();
  renderProducts();
  renderAllProducts();

  notify(
    `Payment successful. Order ${orderId} ayaa la sameeyay.`
  );

  openOrder(orderId);
}


/* =========================================================
   30. ORDER TRACKING
========================================================= */

function openOrder(id) {
  const order =
    state.orders.find(
      (item) =>
        item.id === id
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

  const canAdvance =
    order.status !==
      "REVIEWED" &&
    order.status !==
      "DELIVERED" &&
    order.paymentStatus ===
      "SUCCESS";

  openModal(
    `Order ${order.id}`,

    `
      <p>

        <strong>
          Status:
        </strong>

        ${order.status}

        <br>

        <strong>
          Payment:
        </strong>

        ${order.paymentStatus}

        <br>

        <strong>
          Delivery:
        </strong>

        ${order.address},
        ${order.city}

        <br>

        <strong>
          Total:
        </strong>

        ${money(order.total)}

      </p>

      <div class="order-list">

        ${order.history
          .map(
            (history) => `
              <div class="order-item">

                <span>
                  ${history.status}
                </span>

                <small>
                  ${new Date(
                    history.at
                  ).toLocaleString()}
                </small>

              </div>
            `
          )
          .join("")}

      </div>

      ${
        canAdvance
          ? `
            <button
              class="primary-btn"
              id="advance"
              type="button"
            >
              Demo:
              move to ${next}
            </button>
          `
          : ""
      }

      ${
        order.status ===
          "DELIVERED" &&
        !order.reviewed
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
          "#advance"
        )
        ?.addEventListener(
          "click",
          () => {

            const index =
              ORDER_STATES.indexOf(
                order.status
              );

            order.status =
              ORDER_STATES[
                Math.min(
                  index + 1,
                  ORDER_STATES.length - 1
                )
              ];

            order.history.push({
              status:
                order.status,

              at:
                new Date().toISOString()
            });

            if (
              order.status ===
              "DELIVERED"
            ) {
              settleWallet(
                order
              );
            }

            save();

            notify(
              `${order.id}: ${order.status}`
            );

            modal.remove();

            openOrder(
              order.id
            );
          }
        );

      modal
        .querySelector(
          "#review"
        )
        ?.addEventListener(
          "click",
          () => {

            order.reviewed =
              true;

            order.status =
              "REVIEWED";

            order.history.push({
              status:
                "REVIEWED",

              at:
                new Date().toISOString()
            });

            save();

            modal.remove();

            notify(
              "Review-ga waa la diray."
            );
          }
        );
    }
  );
}


/* =========================================================
   31. SELLER COMMISSION DEMO
========================================================= */

function settleWallet(order) {

  order.items.forEach(
    (item) => {

      const product =
        getProduct(item.id);

      const seller =
        sellerOf(product);

      if (!seller) {
        return;
      }

      seller.wallet =
        (seller.wallet || 0) +
        item.price *
          item.qty *
          (1 - COMMISSION_RATE);
    }
  );

  order.commission =
    order.subtotal *
    COMMISSION_RATE;

  notify(
    `Seller revenue iyo ${money(order.commission)} commission ayaa la diiwaangeliyay.`
  );
}


/* =========================================================
   32. COMPARE
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

        ${list.map(
          (product) => `
            <div>

              <h3>
                ${product.name}
              </h3>

              <p>
                Price:
                <strong>
                  ${money(product.price)}
                </strong>
              </p>

              <p>
                Rating:
                ★ ${product.rating}
              </p>

              <p>
                Stock:
                ${product.stock}
              </p>

              <p>
                Seller:
                ${sellerOf(product)?.name}
              </p>

              <p>
                Specs:
                ${product.specs}
              </p>

            </div>
          `
        ).join("")}

      </div>

      <p>
        Comparison-ku wuxuu muujinayaa
        xogta alaabta si loo fududeeyo
        go'aanka macmiilka.
      </p>
    `
  );
}


/* =========================================================
   33. AUTH / ACCOUNT
========================================================= */

function openAuth() {
  openModal(
    "Soo gal WaHeN",

    `
      <form
        id="auth-form"
        class="form-grid"
      >

        <label>
          Email

          <input
            name="email"
            type="email"
            value="ahmed.test@wahen.example"
            required
          >
        </label>

        <label>
          Password

          <input
            name="password"
            type="password"
            required
          >
        </label>

        <button
          class="primary-btn"
          type="submit"
        >
          Soo gal
        </button>

      </form>

      <p>
        Demo account:
        Ahmed Hassan
      </p>
    `,

    (modal) => {

      modal
        .querySelector(
          "#auth-form"
        )
        .onsubmit = (event) => {

          event.preventDefault();

          state.user = {
            ...state.user,
            role: "customer"
          };

          save();

          modal.remove();

          notify(
            "WaHeN account-ka waa la soo galay."
          );

          renderAccount();
        };
    }
  );
}


/* =========================================================
   34. ACCOUNT VIEW
========================================================= */

function renderAccount() {
  const guest =
    $("#account-guest");

  const customer =
    $("#account-customer");

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
      state.user.name;
  }
}


/* =========================================================
   35. CHAT
========================================================= */

function openChat(type) {

  const names = {
    support: "WaHeN Support",
    seller: "Seller",
    delivery: "Delivery"
  };

  const title =
    names[type] ||
    "WaHeN Chat";

  openModal(
    title,

    `
      <div
        class="chat-box"
      >

        <div class="chat-message received">
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
              ${escapeHTML(message)}
            </div>
          `;

          input.value = "";

          setTimeout(() => {

            messages.innerHTML += `
              <div class="chat-message received">
                Waad ku mahadsan tahay.
                Fariintaada waa la helay.
              </div>
            `;

          }, 500);
        };
    }
  );
}


/* =========================================================
   36. HTML ESCAPE
========================================================= */

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   37. SETTINGS
========================================================= */

function openSettingsAction(type) {

  if (type === "account") {
    setActiveView("account");
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

        <small>
          Language selector-ka
          production-ka waxaa lagu
          xiri doonaa translation system.
        </small>
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
                    ${item.message}
                  </span>
                  <small>
                    ${item.time}
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
          WaHeN waxay u baahan tahay
          authentication iyo RLS
          marka Supabase lagu xiro.
        </p>

        <p>
          Seller iyo Admin roles
          waa in backend-ku maamulo.
        </p>
      `
    );

    return;
  }

  if (type === "support") {
    openChat("support");
  }
}


/* =========================================================
   38. GENERAL ACTIONS
========================================================= */

function action(name) {

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

    openOrder(order.id);
    return;
  }

  if (name === "favorites") {
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

    return;
  }

  if (
    name === "become-seller"
  ) {
    openModal(
      "Noqo Seller",

      `
        <p>
          Seller ahaan waxaad
          marka hore sameysanaysaa
          customer account.
        </p>

        <p>
          Kadib waxaad diraysaa
          codsiga shop-ka.
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
          .onclick = () => {

            modal.remove();

            notify(
              "Seller application demo ayaa la diray."
            );
          };
      }
    );

    return;
  }

  if (
    name === "logout"
  ) {
    state.user = {
      id: null,
      name: "Guest",
      phone: "",
      city: "",
      address: "",
      role: null
    };

    save();

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
    dashboardActions.includes(name)
  ) {
    openModal(
      name.replaceAll("-", " "),

      `
        <p>
          Qaybtan waxay diyaar u tahay
          backend-ka production.
        </p>

        <p>
          Demo data:
          ${state.orders.length}
          orders,
          ${products.length}
          products,
          ${state.notifications.length}
          notifications.
        </p>
      `
    );
  }
}


/* =========================================================
   39. CATEGORY SELECTION
========================================================= */

function selectCategory(category) {

  state.activeCategory =
    category;

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
}


/* =========================================================
   40. GLOBAL EVENT BINDING
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


  /* Menu / Account */
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


  /* Bottom navigation */
  $$(".tab, .nav-item[data-view]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const view =
            button.dataset.view;

          setActiveView(view);

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
    });


  /* Categories */
  $$(".category")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          selectCategory(
            button.dataset.category
          );
        }
      );
    });


  /* Global clicks */
  document.addEventListener(
    "click",
    (event) => {

      /* Add to cart */
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


      /* Buy now */
      const buy =
        event.target.closest(
          "[data-buy]"
        );

      if (buy) {
        event.stopPropagation();

        const product =
          getProduct(
            buy.dataset.buy
          );

        if (!product) {
          return;
        }

        addToCart(
          product.id
        );

        openCheckout();

        return;
      }


      /* Wishlist */
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
          Number(
            compare.dataset.compare
          );

        if (
          state.compare.has(id)
        ) {
          state.compare.delete(id);

          toast(
            "Compare laga saaray."
          );
        } else {
          state.compare.add(id);

          toast(
            "Compare lagu daray."
          );
        }

        save();

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


      /* General actions */
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


      /* Product card */
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
   41. INITIALIZATION
========================================================= */

function init() {

  updateTheme();

  renderProducts();

  renderAllProducts();

  renderWholesale();

  renderBrands();

  renderManufacturers();

  renderAccount();

  updateCartCount();

  bind();
}


/* =========================================================
   42. START APP
========================================================= */

init();
