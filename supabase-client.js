/* ==========================================================================
   WAHEN MARKETPLACE — SUPABASE BACKEND & AUTH CORE ENGINE (supabase-client.js)
   ========================================================================== */

// 1. Supabase Credentials
const SUPABASE_URL = "https://hkmtlyknwsqxuxmvfaqv.supabase.co";
const SUPABASE_ANON_KEY = "0JW5GQQnLPwmyRRbNQOBHg_QoBdH01S";

// Initialize Supabase Client
if (typeof window.supabase === 'undefined') {
  console.error("Supabase SDK ma rogan! Hubi CDN-ka.");
}

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* --------------------------------------------------------------------------
   AUTHENTICATION & USER ROLE MANAGEMENT (CEO, ADMIN, EMPLOYEE, SELLER, BUYER)
   -------------------------------------------------------------------------- */

// Hel User-ka hadda Logged-in ka ah iyo Profile-kiisa
async function getCurrentUser() {
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) return null;
  
  const { data: profile } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
    
  return { ...user, profile: profile || { role: 'buyer', full_name: user.email } };
}

// User Registration oo leh Role Selection
async function registerUser(email, password, fullName, role = 'buyer', storeName = '') {
  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: {
      data: { 
        full_name: fullName, 
        role: role,
        store_name: storeName
      }
    }
  });

  if (!error && data.user) {
    // Ku dhiib Profile Table-ka
    await db.from("profiles").upsert([{
      id: data.user.id,
      email: email,
      full_name: fullName,
      role: role,
      store_name: storeName,
      created_at: new Date()
    }]);
  }

  return { data, error };
}

// Login
async function loginUser(email, password) {
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  return { data, error };
}

// Logout
async function logoutUser() {
  await db.auth.signOut();
  window.location.href = "index.html";
}

/* --------------------------------------------------------------------------
   PRODUCT MANAGEMENT (MULTI-VENDOR / SELLER / ADMIN / BUYER)
   -------------------------------------------------------------------------- */

// Soo jiid Alaabta (Filtered by Category or Search)
async function getProducts(category = 'all', searchQuery = '') {
  let query = db.from("products").select("*, profiles(store_name)").order("created_at", { ascending: false });
  
  if (category !== 'all') {
    query = query.eq("category", category);
  }
  
  if (searchQuery.trim() !== '') {
    query = query.ilike("name", `%${searchQuery}%`);
  }

  const { data, error } = await query;
  return { data, error };
}

// Soo jiid Alaabaha u gaarka ah Seller-ka logged-in ka ah
async function getSellerProducts(sellerId) {
  const { data, error } = await db
    .from("products")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  return { data, error };
}

// Ku dar Alaab Cusub (Seller / Admin)
async function addProduct(productData) {
  const user = await getCurrentUser();
  if (!user) return { error: { message: "Fadlan soo gal akownkaaga si aad alaab u darto." } };

  const payload = {
    name: productData.name,
    price: parseFloat(productData.price),
    category: productData.category,
    image_url: productData.image_url,
    description: productData.description || '',
    stock: parseInt(productData.stock) || 10,
    seller_id: user.id,
    created_at: new Date()
  };

  const { data, error } = await db.from("products").insert([payload]).select();
  return { data, error };
}

// Tirtir Alaab
async function deleteProduct(productId) {
  const { error } = await db.from("products").delete().eq("id", productId);
  return { error };
}

/* --------------------------------------------------------------------------
   ORDERS & CHECKOUT MANAGEMENT
   -------------------------------------------------------------------------- */

// Abuur Order Cusub
async function createOrder(cartItems, totalAmount, deliveryInfo) {
  const user = await getCurrentUser();
  
  const payload = {
    user_id: user ? user.id : null,
    customer_name: deliveryInfo.fullName,
    customer_phone: deliveryInfo.phone,
    delivery_address: deliveryInfo.address,
    city: deliveryInfo.city || 'Hargeysa',
    total_amount: totalAmount,
    status: 'pending',
    items: cartItems,
    created_at: new Date()
  };

  const { data, error } = await db.from("orders").insert([payload]).select();
  return { data, error };
}

// Soo jiid Amarrada (Admin, CEO, Employee, Seller View)
async function getAllOrders() {
  const { data, error } = await db
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
}

// Beddel Status-ka Order-ka
async function updateOrderStatus(orderId, newStatus) {
  const { data, error } = await db
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);
  return { data, error };
}

/* --------------------------------------------------------------------------
   CEO & ADMIN ANALYTICS METRICS
   -------------------------------------------------------------------------- */

async function getDashboardMetrics() {
  const { data: products } = await db.from("products").select("id");
  const { data: orders } = await db.from("orders").select("total_amount, status");
  const { data: profiles } = await db.from("profiles").select("role");

  const totalSales = orders ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) : 0;
  const pendingOrders = orders ? orders.filter(o => o.status === 'pending').length : 0;

  return {
    totalProducts: products ? products.length : 0,
    totalOrders: orders ? orders.length : 0,
    totalSales: totalSales,
    pendingOrders: pendingOrders,
    totalUsers: profiles ? profiles.length : 0
  };
}
