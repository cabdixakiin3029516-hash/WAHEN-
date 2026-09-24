/* =========================================================
   WAHEN MARKETPLACE — MAIN APP
   ========================================================= */

const SB = window.wahenSupabase;

let currentUser = null;
let products = [];
let categories = [];
let cart = [];
let currentProduct = null;
let authMode = "login";

const $ = id => document.getElementById(id);


/* =========================================================
   START
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  if (!SB) {
    toast("Supabase lama xiriirin.");
    return;
  }

  setupNavigation();
  setupButtons();
  setupSearch();
  setupAuth();

  loadLocalCart();

  await checkSession();
  await loadCategories();
  await loadProducts();

});


/* =========================================================
   SESSION
   ========================================================= */

async function checkSession() {

  const { data, error } = await SB.auth.getSession();

  if (error) {
    console.error(error);
    return;
  }

  currentUser = data.session?.user || null;

  updateAccountUI();

  SB.auth.onAuthStateChange(async (_event, session) => {

    currentUser = session?.user || null;

    updateAccountUI();

    if (currentUser) {
      await loadProfile();
    }

  });

}


/* =========================================================
   PRODUCTS
   ========================================================= */

async function loadProducts() {

  const { data, error } = await SB
    .from("products")
    .select(`
      id,
      seller_id,
      category_id,
      brand_id,
      manufacturer_id,
      name,
      slug,
      description,
      price,
      old_price,
      stock,
      sku,
      condition,
      rating,
      total_reviews,
      city,
      icon,
      is_active,
      is_featured,
      is_wholesale,
      wholesale_price,
      min_wholesale_quantity,
      views_count,
      sales_count,
      quality_rating,
      image_url,
      created_at
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {

    console.error("Products:", error);

    renderProducts([], $("homeProducts"));
    renderProducts([], $("productsList"));

    toast("Alaabaha lama soo qaadi karin.");
    return;
  }

  products = data || [];

  renderProducts(products.slice(0, 12), $("homeProducts"));
  renderProducts(products, $("productsList"));
}


/* =========================================================
   CATEGORIES
   ========================================================= */

async function loadCategories() {

  const { data, error } = await SB
    .from("categories")
    .select("*")
    .limit(100);

  if (error) {
    console.error("Categories:", error);
    return;
  }

  categories = data || [];

  renderCategories();
}


function renderCategories() {

  const box = $("categories");

  if (!box) return;

  const icons = [
    "💎","👔","👗","📱","🚗",
    "🍎","👶","🧱","📦"
  ];

  box.innerHTML = categories.slice(0, 9).map((c, i) => {

    return `
      <button class="category"
        data-category-id="${c.id}">
        <span>${icons[i] || "📦"}</span>
        <span>${escapeHTML(c.name || "Qayb")}</span>
      </button>
    `;

  }).join("");

  box.querySelectorAll(".category").forEach(btn => {

    btn.addEventListener("click", () => {

      const id = btn.dataset.categoryId;

      const result = products.filter(
        p => String(p.category_id) === String(id)
      );

      showPage("productsPage");

      renderProducts(result, $("productsList"));

    });

  });

}


/* =========================================================
   PRODUCT UI
   ========================================================= */

function renderProducts(list, container) {

  if (!container) return;

  if (!list || !list.length) {

    container.innerHTML = `
      <div class="empty">
        <div style="font-size:40px">📦</div>
        <p>Weli alaab lama helin.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = list.map(productCard).join("");

  container.querySelectorAll("[data-product]").forEach(btn => {

    btn.addEventListener("click", () => {

      const product = products.find(
        p => p.id === btn.dataset.product
      );

      if (product) openProduct(product);

    });

  });

  container.querySelectorAll("[data-cart]").forEach(btn => {

    btn.addEventListener("click", event => {

      event.stopPropagation();

      const product = products.find(
        p => p.id === btn.dataset.cart
      );

      if (product) addToCart(product);

    });

  });

}


function productCard(p) {

  const image = p.image_url;

  return `
    <article class="product" data-product="${p.id}">

      ${
        image
        ? `<img class="product-img"
             src="${escapeAttr(image)}"
             alt="${escapeAttr(p.name)}"
             loading="lazy">`
        : `<div class="product-placeholder">${escapeHTML(p.icon || "🛍️")}</div>`
      }

      <div class="product-body">

        <div class="product-name">
          ${escapeHTML(p.name || "Alaab")}
        </div>

        <div class="price">
          $${Number(p.price || 0).toFixed(2)}
        </div>

        <div class="product-meta">
          <span>⭐ ${Number(p.rating || 0).toFixed(1)}</span>
          <span>${Number(p.stock || 0)} stock</span>
        </div>

        <div class="product-actions">

          <button data-cart="${p.id}">
            🛒 Ku dar
          </button>

          <button data-product="${p.id}">
            Arag
          </button>

        </div>

      </div>

    </article>
  `;
}


/* =========================================================
   PRODUCT DETAIL
   ========================================================= */

function openProduct(product) {

  currentProduct = product;

  showPage("detailPage");

  const box = $("productDetail");

  box.innerHTML = `

    ${
      product.image_url
      ? `<img class="detail-image"
           src="${escapeAttr(product.image_url)}"
           alt="${escapeAttr(product.name)}">`
      : `<div class="product-placeholder"
           style="border-radius:24px">
           ${escapeHTML(product.icon || "🛍️")}
         </div>`
    }

    <h1 class="detail-title">
      ${escapeHTML(product.name)}
    </h1>

    <div class="detail-price">
      $${Number(product.price || 0).toFixed(2)}
    </div>

    <div class="product-meta">
      <span>⭐ ${Number(product.rating || 0).toFixed(1)}</span>
      <span>Stock: ${Number(product.stock || 0)}</span>
    </div>

    <p class="detail-description">
      ${escapeHTML(product.description || "Faahfaahin alaabta lama gelin.")}
    </p>

    <button class="primary full"
      id="detailAddCart">
      🛒 Ku dar Gaadhiga
    </button>

  `;

  $("detailAddCart").onclick = () => addToCart(product);
}


/* =========================================================
   CART
   ========================================================= */

function loadLocalCart() {

  try {

    cart = JSON.parse(
      localStorage.getItem("wahen_cart") || "[]"
    );

  } catch {

    cart = [];

  }

  updateCartCount();
}


function saveLocalCart() {

  localStorage.setItem(
    "wahen_cart",
    JSON.stringify(cart)
  );

}


function addToCart(product) {

  const existing = cart.find(
    item => item.product_id === product.id
  );

  if (existing) {

    existing.quantity += 1;

  } else {

    cart.push({
      product_id: product.id,
      name: product.name,
      price: Number(product.price || 0),
      image_url: product.image_url || null,
      quantity: 1
    });

  }

  saveLocalCart();
  updateCartCount();

  toast("Alaabta gaadhiga ayaa lagu daray.");

}


function updateCartCount() {

  const count = cart.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  if ($("cartCount")) {
    $("cartCount").textContent = count;
  }

}


function renderCart() {

  const box = $("cartItems");

  if (!box) return;

  if (!cart.length) {

    box.innerHTML = `
      <div class="empty">
        🛒
        <p>Gaadhigaagu waa madhan yahay.</p>
      </div>
    `;

    $("cartSummary").innerHTML = "";
    return;
  }

  box.innerHTML = cart.map((item, index) => {

    return `
      <div class="order-card">

        <div class="order-top">

          <strong>
            ${escapeHTML(item.name)}
          </strong>

          <span class="status">
            $${(item.price * item.quantity).toFixed(2)}
          </span>

        </div>

        <p style="margin-top:8px;color:#777">
          Qty: ${item.quantity}
        </p>

        <div class="product-actions">

          <button onclick="changeCart(${index},-1)">
            −
          </button>

          <button onclick="changeCart(${index},1)">
            +
          </button>

          <button onclick="removeCart(${index})">
            🗑
          </button>

        </div>

      </div>
    `;

  }).join("");

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  $("cartSummary").innerHTML = `

    <div style="display:flex;justify-content:space-between">
      <strong>Total</strong>
      <strong style="color:#4338CA">
        $${total.toFixed(2)}
      </strong>
    </div>

    <button class="primary full"
      style="margin-top:14px"
      id="checkoutBtn">
      Checkout →
    </button>

  `;

  $("checkoutBtn").onclick = () => {

    if (!currentUser) {

      toast("Fadlan marka hore login samee.");
      showPage("authPage");
      return;

    }

    showPage("checkoutPage");

  };

}


window.changeCart = function(index, amount) {

  cart[index].quantity += amount;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveLocalCart();
  updateCartCount();
  renderCart();

};


window.removeCart = function(index) {

  cart.splice(index, 1);

  saveLocalCart();
  updateCartCount();
  renderCart();

};


/* =========================================================
   CHECKOUT / ORDER
   ========================================================= */

async function createOrder(event) {

  event.preventDefault();

  if (!currentUser) {

    toast("Login ayaa loo baahan yahay.");
    return;

  }

  if (!cart.length) {

    toast("Gaadhigaagu waa madhan yahay.");
    return;

  }

  const name = $("deliveryName").value.trim();
  const phone = $("deliveryPhone").value.trim();
  const city = $("deliveryCity").value.trim();
  const region = $("deliveryRegion").value.trim();
  const address = $("deliveryAddress").value.trim();
  const note = $("deliveryNote").value.trim();
  const method = $("paymentMethod").value;

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const deliveryFee = 0;

  const total = subtotal + deliveryFee;


  const { data: order, error } = await SB
    .from("orders")
    .insert({
      user_id: currentUser.id,
      status: "pending",
      payment_status: "unpaid",
      payment_method: method,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: total,
      delivery_name: name,
      delivery_phone: phone,
      delivery_city: city,
      delivery_region: region,
      delivery_address: address,
      delivery_note: note
    })
    .select()
    .single();


  if (error) {

    console.error(error);
    toast("Order-ka lama samayn. Hubi login/RLS.");
    return;

  }


  const orderItems = cart.map(item => ({

    order_id: order.id,
    product_id: item.product_id,
    product_name: item.name,
    unit_price: item.price,
    quantity: item.quantity,
    line_total: item.price * item.quantity

  }));


  const { error: itemError } = await SB
    .from("order_items")
    .insert(orderItems);


  if (itemError) {

    console.error(itemError);
    toast("Order waa la sameeyay laakiin items-ka lama gelin.");
    return;

  }


  cart = [];

  saveLocalCart();
  updateCartCount();

  $("checkoutForm").reset();

  toast("🎉 Dalabkaaga waa la diray.");

  await loadOrders();

  showPage("ordersPage");

}


/* =========================================================
   ORDERS
   ========================================================= */

async function loadOrders() {

  const box = $("ordersList");

  if (!box || !currentUser) return;

  const { data, error } = await SB
    .from("orders")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {

    console.error(error);

    box.innerHTML = `
      <div class="empty">
        Dalabyada lama soo qaadi karin.
      </div>
    `;

    return;
  }

  if (!data?.length) {

    box.innerHTML = `
      <div class="empty">
        📦
        <p>Weli ma lihid dalab.</p>
      </div>
    `;

    return;

  }

  box.innerHTML = data.map(order => `

    <div class="order-card">

      <div class="order-top">

        <strong>
          Order #${String(order.id).slice(0,8)}
        </strong>

        <span class="status">
          ${escapeHTML(order.status)}
        </span>

      </div>

      <p style="margin-top:10px">
        Total:
        <strong>
          $${Number(order.total_amount || 0).toFixed(2)}
        </strong>
      </p>

      <p style="margin-top:5px;color:#777;font-size:11px">
        ${new Date(order.created_at).toLocaleString()}
      </p>

    </div>

  `).join("");

}


/* =========================================================
   AUTH
   ========================================================= */

function setupAuth() {

  $("authForm").addEventListener(
    "submit",
    handleAuth
  );

  $("authSwitch").onclick = () => {

    authMode =
      authMode === "login"
      ? "register"
      : "login";

    updateAuthUI();

  };

  $("loginBtn").onclick = () => {

    authMode = "login";
    updateAuthUI();
    showPage("authPage");

  };

  $("registerBtn").onclick = () => {

    authMode = "register";
    updateAuthUI();
    showPage("authPage");

  };

  $("logoutBtn").onclick = logout;

}


function updateAuthUI() {

  const register = authMode === "register";

  $("authTitle").textContent =
    register
    ? "Samee Account"
    : "Ku soo gal WaHeN";

  $("authSubtitle").textContent =
    register
    ? "Samee account cusub oo WaHeN ah."
    : "Geli account-kaaga si aad u sii wadato.";

  $("authSubmit").textContent =
    register
    ? "Create Account"
    : "Login";

  $("fullNameWrap").classList.toggle(
    "hidden",
    !register
  );

  $("authSwitch").textContent =
    register
    ? "Waxaan hore u leeyahay account"
    : "Samee account cusub";

}


async function handleAuth(event) {

  event.preventDefault();

  const email = $("authEmail").value.trim();
  const password = $("authPassword").value;
  const fullName = $("authFullName").value.trim();

  $("authMessage").textContent = "Fadlan sug...";

  if (authMode === "register") {

    const { data, error } =
      await SB.auth.signUp({

        email,
        password,

        options: {
          data: {
            full_name: fullName
          }
        }

      });

    if (error) {

      $("authMessage").textContent = error.message;
      return;

    }

    $("authMessage").textContent =
      data.session
      ? "Account-ka waa la sameeyay."
      : "Account-ka waa la sameeyay. Hubi email-ka haddii loo baahdo.";

    return;
  }


  const { error } =
    await SB.auth.signInWithPassword({
      email,
      password
    });


  if (error) {

    $("authMessage").textContent = error.message;
    return;

  }

  $("authMessage").textContent =
    "Login waa guulaystay.";

  showPage("accountPage");

}


async function logout() {

  await SB.auth.signOut();

  currentUser = null;

  updateAccountUI();

  toast("Waad ka baxday account-ka.");

  showPage("homePage");

}


/* =========================================================
   PROFILE
   ========================================================= */

async function loadProfile() {

  if (!currentUser) return;

  const { data, error } = await SB
    .from("profiles")
    .select("*")
    .eq("id", currentUser.id)
    .maybeSingle();

  if (error) {

    console.error("Profile:", error);
    return;

  }

  if (data) {

    $("accountName").textContent =
      data.full_name ||
      currentUser.email ||
      "User";

    $("accountPhone").textContent =
      data.phone ||
      currentUser.email ||
      "";

  }

}


function updateAccountUI() {

  const logged =
    !!currentUser;

  $("guestActions")
    .classList.toggle("hidden", logged);

  $("userActions")
    .classList.toggle("hidden", !logged);

  $("accountName").textContent =
    logged
    ? (currentUser.user_metadata?.full_name ||
       currentUser.email ||
       "User")
    : "Guest";

  $("accountPhone").textContent =
    logged
    ? currentUser.email
    : "Soo gal ama samee account";

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

  $("searchInput").addEventListener(
    "input",
    event => {

      const query =
        event.target.value
          .trim()
          .toLowerCase();

      if (!query) {

        renderProducts(
          products,
          $("productsList")
        );

        return;

      }

      const result = products.filter(p =>

        String(p.name || "")
          .toLowerCase()
          .includes(query)

        ||

        String(p.description || "")
          .toLowerCase()
          .includes(query)

        ||

        String(p.city || "")
          .toLowerCase()
          .includes(query)

      );

      showPage("productsPage");

      $("productResultText").textContent =
        `${result.length} alaab ayaa la helay`;

      renderProducts(
        result,
        $("productsList")
      );

    }
  );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

  document.querySelectorAll(".nav")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        showPage(btn.dataset.page);

      });

    });

}


function showPage(pageId) {

  document.querySelectorAll(".page")
    .forEach(page =>
      page.classList.remove("active")
    );

  const page = $(pageId);

  if (page) {
    page.classList.add("active");
  }

  document.querySelectorAll(".nav")
    .forEach(nav => {

      nav.classList.toggle(
        "active",
        nav.dataset.page === pageId
      );

    });

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });


  if (pageId === "cartPage") {
    renderCart();
  }

  if (pageId === "ordersPage") {
    loadOrders();
  }

  if (pageId === "accountPage") {
    loadProfile();
  }

}


/* =========================================================
   BUTTONS
   ========================================================= */

function setupButtons() {

  $("homeBtn").onclick =
    () => showPage("homePage");

  $("accountBtn").onclick =
    () => showPage("accountPage");

  $("cartBtn").onclick =
    () => showPage("cartPage");

  $("shopNowBtn").onclick =
    () => showPage("productsPage");

  $("allProductsBtn").onclick =
    () => showPage("productsPage");

  $("ordersBtn").onclick =
    () => showPage("ordersPage");

  $("favoritesBtn").onclick =
    () => showPage("favoritesPage");

  $("detailBack").onclick =
    () => showPage("productsPage");

  $("checkoutForm").addEventListener(
    "submit",
    createOrder
  );

  document.querySelectorAll(".backBtn")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        showPage("homePage");

      });

    });

}


/* =========================================================
   UTILITIES
   ========================================================= */

function toast(message) {

  const box = $("toast");

  box.textContent = message;

  box.classList.add("show");

  setTimeout(() => {

    box.classList.remove("show");

  }, 2500);

}


function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


function escapeAttr(value) {

  return escapeHTML(value);

}