document.addEventListener('DOMContentLoaded', () => {
  const products = [
    ['Men\'s Jacket',135,'🧥','ragga','4.5'],['Women\'s Dress',145,'👗','haween','4.8'],['Sport Shoes',200,'👟','ragga','4.6'],['Men Shirt',35,'👔','ragga','4.5'],['Kids Toy',18,'🧸','caruur','4.7'],['Perfume',28,'🧴','beauty','4.8'],['Rice',32,'🍚','cunto','4.4'],['Smartphone',180,'📱','electronics','4.7'],['Headphones',35,'🎧','electronics','4.5'],['Laptop',450,'💻','electronics','4.8'],['Sofa',250,'🛋️','guri','4.6'],['Work Tools',75,'🧰','dhisme','4.6']
  ];
  const orders = [['Men\'s Jacket','#WH-2026-001','Shipped','shipped'],['Smartphone','#WH-2026-014','Pending','pending'],['Women\'s Bag','#WH-2026-021','Delivered','delivered']];
  const state = { cart: [], favorites: new Set(), page: 'home', query: '', category: 'all', dark: localStorage.getItem('wahen-dark') === '1' };
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const money = value => `$${Number(value).toFixed(2)}`;

  if (state.dark) document.body.classList.add('dark');
  document.body.insertAdjacentHTML('beforeend', '<button class="theme-toggle" id="theme-toggle" aria-label="Beddel muuqaalka">🌙</button>');

  function renderProducts() {
    const list = products.filter(item => {
      const matchesText = !state.query || item[0].toLowerCase().includes(state.query);
      const matchesCategory = state.category === 'all' || item[3] === state.category;
      return matchesText && matchesCategory;
    });
    $('#products').innerHTML = list.length ? list.map((item, index) => `
      <article class="product" data-product="${products.indexOf(item)}">
        <button class="heart" data-favorite="${products.indexOf(item)}">${state.favorites.has(item[0]) ? '♥' : '♡'}</button>
        <div class="pic">${item[2]}</div><div class="product-body"><h3>${item[0]}</h3><div class="price">${money(item[1])}</div><div class="rating">★ ${item[4]}</div><button class="add" data-add="${products.indexOf(item)}">🛒 Cart ku dar</button></div>
      </article>`).join('') : '<p class="empty">Alaab lama helin.</p>';
    $('#favorite-count').textContent = state.favorites.size;
  }

  function updateCart() { $('#cart-count').textContent = state.cart.reduce((total, item) => total + item.qty, 0); }
  function setPage(page) {
    state.page = page;
    $$('.view').forEach(view => view.classList.toggle('active', view.dataset.page === page));
    $$('.tab,.nav').forEach(button => button.classList.toggle('active', button.dataset.view === page));
    if (page === 'orders') renderOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function openModal(title, body, after) {
    const overlay = document.createElement('div'); overlay.className = 'overlay';
    overlay.innerHTML = `<div class="modal"><div class="modal-head"><h2>${title}</h2><button class="close">×</button></div><div class="modal-body">${body}</div></div>`;
    document.body.appendChild(overlay); overlay.querySelector('.close').onclick = () => overlay.remove(); overlay.onclick = event => { if (event.target === overlay) overlay.remove(); }; if (after) after(overlay);
    return overlay;
  }
  function productDetails(index) { const item = products[index]; openModal(item[0], `<div class="product-detail"><div class="pic">${item[2]}</div><h3>${item[0]}</h3><p class="price">${money(item[1])}</p><p>★ ${item[4]} — Alaab tayo leh oo laga heli karo WaHeN.</p><div class="modal-actions"><button class="primary" data-modal-add="${index}">Cart ku dar</button><button class="primary" data-modal-buy="${index}">Hadda iibso</button></div></div>`, modal => { modal.querySelector('[data-modal-add]').onclick = () => { addToCart(index); modal.remove(); }; modal.querySelector('[data-modal-buy]').onclick = () => { addToCart(index); modal.remove(); showCheckout(); }; }); }
  function addToCart(index) { const item = products[index]; const found = state.cart.find(cartItem => cartItem.name === item[0]); found ? found.qty++ : state.cart.push({ name:item[0], price:item[1], icon:item[2], qty:1 }); updateCart(); }
  function showCart() { const total = state.cart.reduce((sum,item) => sum + item.price * item.qty, 0); const body = state.cart.length ? state.cart.map((item,index) => `<div class="checkout-row"><span>${item.icon} ${item.name} × ${item.qty}</span><strong>${money(item.price * item.qty)}</strong><button class="text-btn" data-remove="${index}">Ka saar</button></div>`).join('') + `<div class="checkout-row"><strong>Wadarta</strong><strong>${money(total)}</strong></div><button class="primary" id="go-checkout">Checkout</button>` : '<p>Cart-kaagu waa madhan yahay.</p>'; const modal = openModal('Cart-kaaga', body); modal.querySelectorAll('[data-remove]').forEach(button => button.onclick = () => { state.cart.splice(Number(button.dataset.remove),1); modal.remove(); updateCart(); showCart(); }); modal.querySelector('#go-checkout')?.addEventListener('click', () => { modal.remove(); showCheckout(); }); }
  function showCheckout() { if (!state.cart.length) return showCart(); const total = state.cart.reduce((sum,item) => sum + item.price * item.qty, 0); const modal = openModal('Checkout', `<form class="form" id="checkout-form"><label>Magacaaga<input required placeholder="Magaca oo buuxa"></label><label>Telefoon<input required type="tel" placeholder="+252..."></label><label>Goobta keenista<input required placeholder="Magaalada iyo cinwaanka"></label><label>Habka lacag bixinta<select><option>EVC Plus</option><option>Zaad</option><option>Cash on delivery</option></select></label><div class="checkout-row"><strong>Wadarta</strong><strong>${money(total)}</strong></div><button class="primary">Xaqiiji dalabka</button></form>`); modal.querySelector('#checkout-form').onsubmit = event => { event.preventDefault(); modal.remove(); state.cart = []; updateCart(); openModal('Dalabka waa la helay ✅', '<p>Waad ku mahadsan tahay. Lambarka dalabkaagu waa <strong>WH-2026-001</strong>.</p>'); }; }
  function renderOrders() { $('#orders-list').innerHTML = orders.map(order => `<div class="order"><div><strong>${order[0]}</strong><small>${order[1]}</small></div><span class="status ${order[3]}">${order[2]}</span></div>`).join(''); $('#buyer-orders').innerHTML = orders.slice(0,2).map(order => `<div class="order"><div><strong>${order[0]}</strong><small>${order[1]}</small></div><span class="status ${order[3]}">${order[2]}</span></div>`).join(''); }
  function loginModal() { openModal('Soo gal / Isdiiwaangeli', `<div class="form"><label>Email<input type="email" placeholder="email@example.com"></label><label>Password<input type="password" placeholder="••••••••"></label><button class="primary" id="login">Soo gal</button><button class="text-btn" id="signup">Account cusub samee</button></div>`, modal => { modal.querySelector('#login').onclick = () => { modal.remove(); openModal('Soo dhawoow 👋','Account-kaaga si guul leh ayaa loo furay.'); }; modal.querySelector('#signup').onclick = () => { modal.remove(); signupModal(); }; }); }
  function signupModal() { openModal('Samee account', '<form class="form" id="signup-form"><label>Magac<input required></label><label>Email<input required type="email"></label><label>Dooro nooca account-ka<select><option>Buyer</option><option>Seller</option></select></label><label>Password<input required type="password"></label><button class="primary">Isdiiwaangeli</button></form>', modal => { modal.querySelector('form').onsubmit = e => { e.preventDefault(); modal.remove(); openModal('Waad ku mahadsan tahay ✅','Account-kaaga waa la sameeyay.'); }; }); }

  document.addEventListener('click', event => {
    const view = event.target.closest('[data-view]'); if (view) { event.preventDefault(); setPage(view.dataset.view); }
    const add = event.target.closest('[data-add]'); if (add) { addToCart(Number(add.dataset.add)); return; }
    const fav = event.target.closest('[data-favorite]'); if (fav) { const item = products[Number(fav.dataset.favorite)]; state.favorites.has(item[0]) ? state.favorites.delete(item[0]) : state.favorites.add(item[0]); renderProducts(); return; }
    const card = event.target.closest('.product'); if (card && !event.target.closest('button')) productDetails(Number(card.dataset.product));
    const category = event.target.closest('[data-category]'); if (category) { state.category = category.dataset.category; setPage('home'); renderProducts(); $('#products').scrollIntoView({behavior:'smooth'}); }
    const action = event.target.closest('[data-action]')?.dataset.action; if (action === 'shop' || action === 'all-products') { state.category = 'all'; setPage('home'); renderProducts(); $('#products').scrollIntoView({behavior:'smooth'}); } else if (action === 'categories') $('#products').previousElementSibling?.scrollIntoView({behavior:'smooth'}); else if (action === 'favorites') openModal('Favorites', state.favorites.size ? [...state.favorites].join(', ') : 'Wax favorites ah ma jiraan.'); else if (action) openModal('WaHeN', 'Qaybtan maamulka waa diyaar in backend lagu xiro.');
  });
  $('#cart-button').onclick = showCart; $('#menu-button').onclick = loginModal; $('#product-search').oninput = event => { state.query = event.target.value.toLowerCase().trim(); renderProducts(); }; $('#search-form').onsubmit = event => event.preventDefault(); $('#theme-toggle').onclick = () => { state.dark = !state.dark; document.body.classList.toggle('dark', state.dark); localStorage.setItem('wahen-dark', state.dark ? '1' : '0'); };
  renderProducts(); renderOrders(); updateCart();
});
