/* =========================================================
   WaHeN Marketplace
   T4-A — Supabase Connection
   ========================================================= */

window.WAHEN_SUPABASE = {
  url: 'https://hkmtlyknwsqxuxmvfaqv.supabase.co',
  anonKey: 'sb_publishable_0JW5GQQnLPwmyRRbNQOBHg_QoBdH01S'
};

/* =========================================================
   SUPABASE CLIENT
   ========================================================= */

if (!window.supabase) {
  console.error(
    'WaHeN T4-A ❌ Supabase library lama helin.'
  );
} else {
  window.wahenDB = window.supabase.createClient(
    window.WAHEN_SUPABASE.url,
    window.WAHEN_SUPABASE.anonKey
  );

  console.log(
    'WaHeN T4-A ✅ Supabase client waa diyaar.'
  );
}

/* =========================================================
   CONNECTION TEST
   ========================================================= */

async function testWaHeNSupabase() {
  if (!window.wahenDB) {
    console.error(
      'WaHeN T4-A ❌ Supabase client ma jiro.'
    );
    return false;
  }

  try {
    const { data, error } = await window.wahenDB
      .from('categories')
      .select('id')
      .limit(1);

    if (error) {
      console.error(
        'WaHeN T4-A ❌ Database connection error:',
        error.message
      );

      return false;
    }

    console.log(
      'WaHeN T4-A ✅ SUPABASE CONNECTION SUCCESS',
      data
    );

    return true;

  } catch (error) {
    console.error(
      'WaHeN T4-A ❌ Connection test failed:',
      error
    );

    return false;
  }
}

/* =========================================================
   RUN TEST AFTER PAGE LOAD
   ========================================================= */

window.addEventListener('load', async () => {
  await testWaHeNSupabase();
});
