document.addEventListener('DOMContentLoaded', () => {
  const productCards = [...document.querySelectorAll('.prod-card')];
  const searchInput = document.querySelector('#product-search');
  const cartButton = document.querySelector('.cart-button');
  const menuButton = document.querySelector('.icon-btn');
  const categoryButtons = [...document.querySelectorAll('.category')];
  const navItems = [...document.querySelectorAll('.nav-item')];
  const heroCta = document.querySelector('.hero-cta');
  const productsSection = document.querySelector('#products');
  const categorySection = document.querySelector('#categories-title')?.closest('.section');

  const state = {
    cart: [],
    favorites: new Set(),
    activeCategory: 'all',
    query: ''
  };

  const money = value => `$${Number(value).toFixed(2)}`;

  const productInfo = card => ({
    name: card.querySelector('h3')?.textContent.trim() || 'Alaab',
    price: Number.parseFloat(card.querySelector('.prod-price')?.textContent.replace(/[^0-9.]/g, '') || '0') || 0,
    icon: card.querySelector('.prod-image')?.textContent.trim() || '🛍️',
    category: card.dataset.category || 'wax-kale',
    ratingText: card.querySelector('.prod-rating')?.textContent.trim() || '★ 4.8'
  });

  const css = document.createElement('style');
  css.textContent = `
    .wh-overlay {
      position: fixed;
      inset: 0;
      background: rgba(18, 17, 32, 0.62);
      display: grid;
      place-items: center;
      padding: 16px;
      z-index: 1000;
    }
    .wh-panel {
      width: min(620px, 100%);
      max-height: 90vh;
      background: #ffffff;
      color: #1d1a2f;
      border-radius: 22px;
      box-shadow: 0 24px 55px rgba(17, 12, 41, 0.25);
      padding: 20px;
      overflow: auto;
    }
    .wh-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
    .wh-head h2 {
      margin: 0;
      font-size: 1.5rem;
      letter-spacing: -0.04em;
    }
    .wh-close {
      width: 34px;
      height: 34px;
      border: 0;
      border-radius: 50%;
      background: #f1f2f9;
      color: #1d1a2f;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
    }
    .wh-body {
      display: grid;
      gap: 12px;
    }
    .wh-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 0;
      border-bottom: 1px solid #edf0f7;
    }
    .wh-row:last-child {
      border-bottom: 0;
    }
    .wh-empty {
      color: #6f7285;
      margin: 8px 0;
    }
    .wh-remove {
      border: 0;
      background: #fff0f1;
      color: #b63b4f;
      border-radius: 10px;
      padding: 6px 8px;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
    }
    .wh-product {
      display: grid;
      grid-template-columns: 88px 1fr;
      gap: 16px;
      align-items: center;
      padding: 6px 0 8px;
    }
    .wh-product-icon {
      display: grid;
      place-items: center;
      width: 88px;
      height: 88px;
      border-radius: 18px;
      background: #eef1fb;
      font-size: 3rem;
    }
    .wh-product-meta h3 {
      margin: 0 0 4px;
      font-size: 1.15rem;
    }
    .wh-price {
      font-size: 1.3rem;
      font-weight: 800;
      margin-bottom: 4px;
    }
    .wh-stars {
      color: #f4b437;
      font-size: 0.9rem;
      margin-bottom: 6px;
    }
    .wh-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding-top: 8px;
    }
    .wh-btn {
      border: 0;
      border-radius: 12px;
      padding: 10px 14px;
      background: #4c45d5;
      color: #ffffff;
      font-weight: 700;
      cursor: pointer;
    }
    .wh-btn.secondary {
      background: #eef1fb;
      color: #1d1a2f;
    }
    .wh-btn.danger {
      background: #f5d7dd;
      color: #8d2c40;
    }
    .wh-actions .wh-btn {
      flex: 1 1 min(180px, 100%);
    }
    .wh-choose {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding-top: 6px;
    }
    .wh-choose button {
      border: 0;
      border-radius: 10px;
      background: #edf0f7;
      color: #1d1a2f;
      padding: 8px 10px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(css);

  function injectPanel(title, bodyHtml) {
    const overlay = document.createElement('div');
    overlay.className = 'wh-overlay';
    overlay.innerHTML = `
      <div class="wh-panel" role="dialog" aria-modal="true">
        <div class="wh-head">
          <h2>${title}</h2>
          <button type="button" class="wh-close" aria-label="Xir">×</button>
        </div>
        <div class="wh-body">${bodyHtml}</div>
      </div>
    `;

    const panel = overlay.querySelector('.wh-panel');
    panel.addEventListener('click', event => event.stopPropagation());
    overlay.addEventListener('click', event => {
      if (event.target === overlay || event.target.closest('.wh-close')) {
        overlay.remove();
      }
    });

    document.body.appendChild(overlay);
    return overlay;
  }

  function renderProducts() {
    productCards.forEach(card => {
      const info = productInfo(card);
      const matchesQuery = !state.query || info.name.toLowerCase().includes(state.query);
      const matchesCategory = state.activeCategory === 'all' || info.category === state.activeCategory;
      card.style.display = matchesQuery && matchesCategory ? '' : 'none';
    });
  }

  function syncCategoryButtons() {
    categoryButtons.forEach(button => {
      const isActive = (button.dataset.category || 'all') === state.activeCategory;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function updateCartBadge() {
    const total = state.cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartButton) {
      cartButton.textContent = total ? `🛒 ${total}` : '🛒';
    }
  }

  function addToCart(card) {
    const info = productInfo(card);
    const existing = state.cart.find(item => item.name === info.name);

    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({ ...info, qty: 1 });
    }

    updateCartBadge();
    if (cartButton) {
      cartButton.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.14)' }, { transform: 'scale(1)' }],
        { duration: 220, easing: 'ease-out' }
      );
    }
  }

  productCards.forEach(card => {
    if (!card.querySelector('.favorite-btn')) {
      const favBtn = document.createElement('button');
      favBtn.type = 'button';
      favBtn.className = 'favorite-btn';
      favBtn.setAttribute('aria-label', 'Ku dar kuwa la jecel yahay');
      favBtn.textContent = '♡';
      favBtn.addEventListener('click', event => {
        event.stopPropagation();
        const name = productInfo(card).name;
        if (state.favorites.has(name)) {
          state.favorites.delete(name);
          favBtn.textContent = '♡';
        } else {
          state.favorites.add(name);
          favBtn.textContent = '♥';
        }
      });
      card.appendChild(favBtn);
    }

    if (!card.querySelector('.product-cart-btn')) {
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'product-cart-btn';
      addBtn.textContent = '🛒 Gaadhiga ku dar';
      addBtn.addEventListener('click', event => {
        event.stopPropagation();
        addToCart(card);
      });
      const body = card.querySelector('.prod-body');
      if (body) body.appendChild(addBtn);
    }
  });

  function showCart() {
    const total = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const rows = state.cart.length
      ? state.cart.map((item, index) => `
          <div class="wh-row">
            <span>${item.icon} ${item.name} × ${item.qty}</span>
            <div style="display:flex;align-items:center;gap:10px;">
              <strong>${money(item.price * item.qty)}</strong>
              <button type="button" class="wh-remove" data-index="${index}">Remove</button>
            </div>
          </div>
        `).join('')
      : '<p class="wh-empty">Gaadhigu wuu madhan yahay.</p>';

    const panel = injectPanel('Gaadhiga wax iibsiga', `
      ${rows}
      <div class="wh-row">
        <strong>Wadarta</strong>
        <strong>${money(total)}</strong>
      </div>
      ${state.cart.length ? `
        <div class="wh-actions">
          <button type="button" class="wh-btn wh-checkout">Checkout</button>
          <button type="button" class="wh-btn secondary wh-track">Track order</button>
        </div>
      ` : ''}
    `);

    panel.querySelectorAll('.wh-remove').forEach(button => {
      button.addEventListener('click', () => {
        const idx = Number(button.dataset.index);
        state.cart.splice(idx, 1);
        panel.remove();
        updateCartBadge();
        showCart();
      });
    });

    panel.querySelector('.wh-checkout')?.addEventListener('click', () => {
      panel.remove();
      injectPanel('Dalabka waa la helay ✅', '<p>Waad ku mahadsan tahay. Lambarka dalabkaagu waa <strong>WH-2026-001</strong>.</p><div class="wh-actions"><button type="button" class="wh-btn wh-track">Dabagalka dalabka</button></div>');
      const nextPanel = document.body.lastElementChild;
      nextPanel.querySelector('.wh-track')?.addEventListener('click', () => {
        nextPanel.remove();
        showTracking();
      });
    });

    panel.querySelector('.wh-track')?.addEventListener('click', () => {
      panel.remove();
      showTracking();
    });
  }

  function showTracking() {
    injectPanel('Dabagalka dalabka', `
      <p><strong>WH-2026-001</strong> · Darawal: Maxamed A. · ETA: 2 maalmood</p>
      <div class="wh-choose">
        <button type="button">✅ La soo saaray</button>
        <button type="button">📦 La xajiray</button>
        <button type="button">🚚 Jidka oo socota</button>
        <button type="button">🏠 La keenay</button>
      </div>
    `);
  }

  function openMenu() {
    const menuPanel = injectPanel('WaHeN Menu', `
      <div class="wh-actions">
        <button type="button" class="wh-btn secondary wh-account">Buyer account</button>
        <button type="button" class="wh-btn secondary wh-orders">My orders</button>
        <button type="button" class="wh-btn secondary wh-favorites">Favorites</button>
      </div>
    `);

    menuPanel.querySelector('.wh-account')?.addEventListener('click', () => {
      menuPanel.remove();
      injectPanel('Account', '<p>Ma aha account-aday daqiiqad. Tan hadda waxaa lagu soo jeedin karaa xisaabintaaga.</p>');
    });

    menuPanel.querySelector('.wh-orders')?.addEventListener('click', () => {
      menuPanel.remove();
      showTracking();
    });

    menuPanel.querySelector('.wh-favorites')?.addEventListener('click', () => {
      menuPanel.remove();
      const items = state.favorites.size ? [...state.favorites].join(', ') : 'Waxba ma jecel tahay hada.';
      injectPanel('Favorites', `<p>${items}</p>`);
    });
  }

  productCards.forEach(card => {
    card.addEventListener('click', event => {
      if (event.target.closest('button')) return;

      const info = productInfo(card);
      const similar = productCards
        .filter(item => item !== card && item.dataset.category === info.category)
        .slice(0, 3)
        .map(item => productInfo(item).name);

      const detailPanel = injectPanel(info.name, `
        <div class="wh-product">
          <div class="wh-product-icon">${info.icon}</div>
          <div class="wh-product-meta">
            <h3>${info.name}</h3>
            <div class="wh-price">${money(info.price)}</div>
            <div class="wh-stars">★★★★★ ${info.ratingText}</div>
            <p>${similar.length ? `Similar: ${similar.join(', ')}` : 'More items in this category.'}</p>
          </div>
        </div>
        <div class="wh-actions">
          <button type="button" class="wh-btn wh-add">Add to cart</button>
          <button type="button" class="wh-btn secondary wh-buy">Buy now</button>
          <button type="button" class="wh-btn secondary wh-share">Share</button>
          <button type="button" class="wh-btn secondary wh-review">Review</button>
        </div>
      `);

      detailPanel.querySelector('.wh-add')?.addEventListener('click', () => {
        addToCart(card);
        detailPanel.remove();
      });

      detailPanel.querySelector('.wh-buy')?.addEventListener('click', () => {
        addToCart(card);
        detailPanel.remove();
        showCart();
      });

      detailPanel.querySelector('.wh-share')?.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert('Linkiga waa la koobiyeeyay.');
        } catch {
          alert('Linkiga waan koobiyeeyay, laakiin browser-ka ma taageerto copy-to-clipboard.');
        }
      });

      detailPanel.querySelector('.wh-review')?.addEventListener('click', () => {
        alert('Mahadsanid! Qiimayntaada waa la kaydin doonaa marka aad gasho account-ka.');
      });
    });
  });

  searchInput?.addEventListener('input', event => {
    state.query = event.target.value.toLowerCase().trim();
    renderProducts();
  });

  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      state.activeCategory = button.dataset.category || 'all';
      syncCategoryButtons();
      renderProducts();
      productsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  cartButton?.addEventListener('click', showCart);
  menuButton?.addEventListener('click', openMenu);

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const label = item.textContent.trim().toLowerCase();

      if (label.includes('home')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (label.includes('categories')) {
        categorySection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (label.includes('cart')) {
        showCart();
      } else if (label.includes('orders')) {
        showTracking();
      } else if (label.includes('account')) {
        openMenu();
      }
    });
  });

  heroCta?.addEventListener('click', () => {
    productsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  updateCartBadge();
  syncCategoryButtons();
  renderProducts();
});
