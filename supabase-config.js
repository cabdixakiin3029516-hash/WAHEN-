window.WAHEN_SUPABASE = {
  url: 'https://hkmtlyknwsqxuxmvfaqv.supabase.co',
  anonKey: 'sb_publishable_0JW5GQQnLPwmyRRbNQOBHg_QoBdH01S'
};

if (!window.supabase) {
  console.error('WaHeN: Supabase library lama helin.');
} else {
  window.wahenDB = window.supabase.createClient(
    window.WAHEN_SUPABASE.url,
    window.WAHEN_SUPABASE.anonKey
  );

  console.log('WaHeN: Supabase connected ✅');
}
