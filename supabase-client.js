/* =========================================================
   WAHEN SUPABASE CLIENT
   ========================================================= */

(function () {

  if (!window.supabase) {
    console.error("Supabase library lama helin.");
    return;
  }

  let url = null;
  let key = null;

  /*
    Waxaan taageeraynaa magacyada caadiga ah ee
    supabase-config.js isticmaali karo.
  */

  if (window.SUPABASE_URL) {
    url = window.SUPABASE_URL;
  }

  if (window.SUPABASE_ANON_KEY) {
    key = window.SUPABASE_ANON_KEY;
  }

  if (window.supabaseConfig) {
    url =
      url ||
      window.supabaseConfig.url ||
      window.supabaseConfig.SUPABASE_URL;

    key =
      key ||
      window.supabaseConfig.key ||
      window.supabaseConfig.anonKey ||
      window.supabaseConfig.SUPABASE_ANON_KEY;
  }

  if (!url || !key) {
    console.error(
      "Supabase URL ama Publishable/Anon Key lama helin. Hubi supabase-config.js."
    );
    return;
  }

  window.wahenSupabase = window.supabase.createClient(url, key);

  console.log("WaHeN Supabase Client: CONNECTED");

})();