/* WaHeN Marketplace demo interactions */
document.addEventListener('DOMContentLoaded', () => {
  const products = [...document.querySelectorAll('.prod-card')];
  const search = document.querySelector('#product-search');
  const cartButton = document.querySelector('.cart-button');
  const categoryButtons = [...document.querySelectorAll('.category')];
  const state = { cart: [], favorites: new Set(), activeCategory: 'all', query: '' };

  const money = value => `$${Number(value).toFixed(2)}`;
  const productInfo = card => ({
    name: card.querySelector('h3')?.textContent.trim() || 'Alaab',
    price: parseFloat(card.querySelector('.prod-price')?.textContent.replace(/[^0-9.]/g, '')) || 0,
    icon: card.querySelector('.prod-image')?.textContent.trim() || '🛍️',
    category: card.dataset.category || 'wax-kale',
    rating: card.querySelector('.prod-rating')?.textContent.trim() || '★ 4.8'
  });

  const inject = html => {
    const node = document.createElement('div');
    node.innerHTML = html.trim();
    document.body.appendChild(node.firstElementChild);
    return document.body.lastElementChild;
  };
  const close = event => event.target.closest('.wh-close')?.closest('.wh-overlay')?.remove();

  // Extra UI is generated here so the existing catalogue remains backwards compatible.
  const style = document.createElement('style');
  style.textContent = `
    .wh-overlay{position:fixed;inset:0;background:#16132999;z-index:100;display:grid;place-items:center;padding:16px}
    .wh-panel{background:#fff;color:#1e1b2e;border-radius:20px;width:min(620px,100%);max-height:90vh;overflow:auto;padding:22px;box-shadow:0 20px 60px #1115}
    .wh-panel h2{margin:0 0 8px}.wh-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.wh-close{border:0;background:#f0f1f8;border-radius:50%;width:34px;height:34px;font-size:20px;cursor:pointer}
    .wh-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #edf0f7}.wh-muted{color:#74738a;font-size:13px}.wh-btn{border:0;border-radius:10px;padding:11px 15px;background:#4338ca;color:#fff;font-weight:700;cursor:pointer}.wh-btn.alt{background:#edf0ff;color:#4338ca}.wh-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.wh-field{display:block;width:100%;padding:11px;border:1px solid #d8dcf0;border-radius:10px;margin:8px 0}.wh-product{display:flex;gap:16px;align-items:center;padding:10px 0}.wh-product-icon{font-size:52px;background:#eef2ff;border-radius:14px;padding:12px}.wh-stars{color:#efa900;letter-spacing:2px}.wh-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}.wh-stat{background:#f5f6ff;border-radius:14px;padding:14px}.wh-stat strong{font-size:22px;display:block}@media(max-width:500px){.wh-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function openPanel(title, body) {
    const overlay = inject(`<div class="wh-overlay"><section class="wh-panel" role="dialog" aria-modal="true"><div class="wh-head"><h2>${title}</h2><button class="wh-close" aria-label="Xir">×</button></div>${body}</section></div>`);
    overlay.addEventListener('click', close);
    return overlay;
  }

  function renderProducts() {
    products.forEach(card => {
      const info = productInfo(card);
      const matchesQuery = !state.query || info.name.toLowerCase().includes(state.query);
      const matchesCategory = state.activeCategory === 'all' || info.category === state.activeCategory;
      card.style.display = matchesQuery && matchesCategory ? '' : 'none';
    });
  }
  search?.addEventListener('input', e => { state.query = e.target.value.toLowerCase().trim(); renderProducts(); });
  categoryButtons.forEach(button => button.addEventListener('click', () => {
    state.activeCategory = button.dataset.category || 'all';
    renderProducts();
    document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' });
  }));

  function updateCart() {
    const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartButton) cartButton.textContent = `🛒 ${count}`;
  }
  function addToCart(card) {
    const info = productInfo(card);
    const found = state.cart.find(item => item.name === info.name);
    found ? found.qty++ : state.cart.push({ ...info, qty: 1 });
    updateCart();
    cartButton?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 250 });
  }
  products.forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      const info = productInfo(card);
      const similar = products.filter(p => p !== card && p.dataset.category === info.category).slice(0, 3).map(p => productInfo(p).name).join(', ') || 'Alaabooyin kale';
      openPanel(info.name, `<div class="wh-product"><div class="wh-product-icon">${info.icon}</div><div><h3>${info.name}</h3><strong>${money(info.price)}</strong><p class="wh-stars">★★★★★</p><p class="wh-muted">Iibiye: WaHeN Verified Seller · 4.8/5</p></div></div><p>Faahfaahin: Alaab tayo leh, la hubiyey, waxaana lagu geyn karaa gobollada iyo magaalooyinka adeegga WaHeN.</p><p class="wh-muted">Waxyaabaha la midka ah: ${similar}</p><div class="wh-actions"><button class="wh-btn wh-buy">Hadda iibso</button><button class="wh-btn alt wh-add">Gaadhiga ku dar</button><button class="wh-btn alt wh-share">🔗 La wadaag</button></div><hr><h3>Faallooyinka macaamiisha</h3><p>★★★★★ “Alaab fiican iyo adeeg degdeg ah.”</p><button class="wh-btn alt wh-review">★ Qiimee alaabtan</button>`).querySelector('.wh-panel')?.addEventListener('click', event => {
        if (event.target.closest('.wh-add')) addToCart(card);
        if (event.target.closest('.wh-buy')) { addToCart(card); showCart(); }
        if (event.target.closest('.wh-share')) navigator.clipboard?.writeText(location.href).then(() => alert('Linkiga waa la koobiyeeyay.'));
        if (event.target.closest('.wh-review')) alert('Mahadsanid! Qiimayntaada waa la kaydin doonaa marka aad gasho account-ka.');
      });
    });
  });
  products.forEach(card => {
    const fav = document.createElement('button'); fav.className = 'favorite-btn'; fav.type = 'button'; fav.textContent = '♡'; fav.setAttribute('aria-label', 'Ku dar kuwa la jecel yahay');
    fav.addEventListener('click', e => { e.stopPropagation(); const name = productInfo(card).name; state.favorites.has(name) ? (state.favorites.delete(name), fav.textContent = '♡') : (state.favorites.add(name), fav.textContent = '♥'); });
    card.appendChild(fav);
    const add = document.createElement('button'); add.className = 'product-cart-btn'; add.type = 'button'; add.textContent = '🛒 Gaadhiga ku dar'; add.addEventListener('click', e => { e.stopPropagation(); addToCart(card); });
    card.querySelector('.prod-body')?.appendChild(add);
  });

  function showCart() {
    const total = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const rows = state.cart.length ? state.cart.map((item, index) => `<div class="wh-row"><span>${item.icon} ${item.name} × ${item.qty}</span><strong>${money(item.price * item.qty)}</strong><button class="wh-close wh-remove" data-index="${index}" aria-label="Ka saar">×</button></div>`).join('') : '<p class="wh-muted">Gaadhigu wuu madhan yahay.</p>';
    const panel = openPanel('Gaadhiga wax iibsiga', `${rows}<div class="wh-row"><strong>Wadarta</strong><strong>${money(total)}</strong></div>${state.cart.length ? '<h3>Gaarsiinta</h3><select class="wh-field"><option>Hargeisa (1–2 maalmood)</option><option>Boorama (2–4 maalmood)</option><option>Berbera (2–3 maalmood)</option><option>Gobollada kale (3–7 maalmood)</option></select><input class="wh-field" placeholder="Magaca qofka loo dirayo / recipient"><select class="wh-field"><option>Zaad</option><option>e-Dahab</option><option>Premier Wallet</option><option>Visa / Mastercard</option></select><div class="wh-actions"><button class="wh-btn wh-checkout">Dalbo oo bixi</button><button class="wh-btn alt wh-track">La soco dalabka</button></div>' : ''}`);
    panel.querySelectorAll('.wh-remove').forEach(btn => btn.addEventListener('click', () => { state.cart.splice(Number(btn.dataset.index), 1); panel.closest('.wh-overlay').remove(); updateCart(); showCart(); }));
    panel.querySelector('.wh-checkout')?.addEventListener('click', () => { panel.closest('.wh-overlay').remove(); openPanel('Dalabka waa la helay ✅', '<p>Waad ku mahadsan tahay. Lambarka dalabka: <strong>WH-2026-001</strong></p><p class="wh-muted">Waxaad kala socon kartaa: Processing → Shipped → Out for Delivery → Delivered.</p><button class="wh-btn wh-track">Track order</button>'); });
    panel.querySelector('.wh-track')?.addEventListener('click', () => { panel.closest('.wh-overlay').remove(); showTracking(); });
  }
  cartButton?.addEventListener('click', showCart);

  function showTracking() { openPanel('Dabagalka dalabka', '<p><strong>WH-2026-001</strong> · Darawal: Maxamed A. · ETA: 2 maalmood</p><div class="wh-grid"><div class="wh-stat">✅<strong>Processing</strong><span class="wh-muted">Dalabka waa la xaqiijiyey</span></div><div class="wh-stat">📦<strong>Shipped</strong><span class="wh-muted">Alaabtu way baxday</span></div><div class="wh-stat">🚚<strong>Out for Delivery</strong><span class="wh-muted">Darawalku wuu wadaa</span></div><div class="wh-stat">🏠<strong>Delivered</strong><span class="wh-muted">Weli lama gaadhsiin</span></div></div>'); }

  document.querySelector('.icon-btn')?.addEventListener('click', () => openPanel('WaHeN Menu', '<div class="wh-actions"><button class="wh-btn wh-account">Buyer account</button><button class="wh-btn alt wh-seller">Seller Dashboard</button><button class="wh-btn alt wh-admin">Admin Dashboard</button></div><p class="wh-muted">Dooro account-ka aad rabto inaad isticmaasho. Buyer wuxuu alaab u diri karaa qof kale (recipient).</p>'));
  document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', () => { const label = item.textContent.trim().toLowerCase(); if (label.includes('cart')) showCart(); else if (label.includes('order')) showTracking(); else if (label.includes('account')) openPanel('Account & Support', '<p>Buyer · Seller · Family account</p><button class="wh-btn wh-support">La xidhiidh taageerada</button><p class="wh-muted">Salaan! WaHeN Support waxay diyaar u tahay inay kaa caawiso.</p>'); else if (label.includes('qayb')) document.querySelector('#categories-title')?.scrollIntoView({ behavior: 'smooth' }); }));
  document.querySelector('.hero-cta')?.addEventListener('click', () => document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' }));
  updateCart();
});
