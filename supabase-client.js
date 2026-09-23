// WaHeN - Supabase Client

if (!window.WAHEN_SUPABASE) {
  throw new Error("❌ WAHEN_SUPABASE configuration lama helin.");
}

if (!window.supabase) {
  throw new Error("❌ Supabase library lama helin.");
}

window.WAHEN_SUPABASE_CLIENT = window.supabase.createClient(
  window.WAHEN_SUPABASE.url,
  window.WAHEN_SUPABASE.anonKey
);

console.log("✅ WaHeN Supabase Client waa diyaar.");
