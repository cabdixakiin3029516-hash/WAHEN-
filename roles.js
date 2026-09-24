/* =========================================================
   WaHeN — ROLES / ADMIN SYSTEM
   Compatible with:
   admin.html
   buyer.html
   seller.html
   login.html

   No backend data is deleted.
   ========================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", initRoles);

  function initRoles() {
    setupRoleGuard();
    setupLogin();
    setupLogout();
    setupAdminActions();
    setupRoleButtons();
  }

  /* =========================================================
     1. ROLE GUARD
     ========================================================= */

  function setupRoleGuard() {
    const page = document.querySelector("[data-required-role]");

    if (!page) return;

    const requiredRole =
      page.dataset.requiredRole ||
      page.getAttribute("data-required-role");

    const currentRole = sessionStorage.getItem("wahen-role");

    if (!currentRole || currentRole !== requiredRole) {
      window.location.replace("login.html");
      return;
    }

    document.body.classList.add("role-" + currentRole);
  }


  /* =========================================================
     2. LOGIN
     ========================================================= */

  function setupLogin() {
    const loginForm = document.querySelector("#role-login");

    if (!loginForm) return;

    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const roleInput = document.querySelector("#role");

      if (!roleInput) {
        showMessage("Role lama helin.");
        return;
      }

      const selectedRole = roleInput.value;

      const destinations = {
        buyer: "buyer.html",
        seller: "seller.html",
        admin: "admin.html"
      };

      if (!destinations[selectedRole]) {
        showMessage("Role-kan lama aqoonsana.");
        return;
      }

      sessionStorage.setItem("wahen-role", selectedRole);

      sessionStorage.setItem(
        "wahen-login-time",
        new Date().toISOString()
      );

      window.location.href = destinations[selectedRole];
    });
  }


  /* =========================================================
     3. LOGOUT
     ========================================================= */

  function setupLogout() {
    const logoutButtons =
      document.querySelectorAll("[data-logout]");

    logoutButtons.forEach(function (button) {
      button.addEventListener("click", function () {

        const confirmLogout = window.confirm(
          "Ma hubtaa inaad rabto inaad ka baxdo WaHeN Admin?"
        );

        if (!confirmLogout) return;

        sessionStorage.removeItem("wahen-role");
        sessionStorage.removeItem("wahen-login-time");

        window.location.replace("login.html");
      });
    });
  }


  /* =========================================================
     4. ADMIN QUICK ACTIONS
     ========================================================= */

  function setupAdminActions() {

    const buttons =
      document.querySelectorAll("[data-demo-action]");

    buttons.forEach(function (button) {

      button.addEventListener("click", function () {

        const action =
          button.getAttribute("data-demo-action");

        switch (action) {

          case "users":
            openAdminPanel(
              "Users",
              "👥",
              "Halkan waxaad ka maamuli kartaa users-ka WaHeN."
            );
            break;

          case "sellers":
            openAdminPanel(
              "Sellers",
              "🏪",
              "Halkan waxaad ka ansixin kartaa sellers-ka iyo shops-ka."
            );
            break;

          case "orders":
            openAdminPanel(
              "Orders",
              "📋",
              "Halkan waxaad ka arki kartaa oo ka maamuli kartaa orders-ka."
            );
            break;

          case "settings":
            openAdminPanel(
              "Settings",
              "⚙️",
              "Halkan waxaa lagu maamuli doonaa settings-ka Admin."
            );
            break;

          default:
            showMessage("Qaybtan lama aqoonsan.");
        }
      });

    });
  }


  /* =========================================================
     5. ADMIN PANEL
     ========================================================= */

  function openAdminPanel(title, icon, description) {

    closeAdminPanel();

    const overlay = document.createElement("div");
    overlay.id = "wahenAdminOverlay";

    overlay.innerHTML = `
      <div class="wahen-admin-modal">

        <button
          type="button"
          class="wahen-admin-close"
          id="closeWahenAdminPanel"
          aria-label="Close"
        >
          ×
        </button>

        <div class="wahen-admin-icon">
          ${icon}
        </div>

        <span class="wahen-admin-label">
          WAHEN ADMIN
        </span>

        <h2>${escapeHTML(title)}</h2>

        <p>
          ${escapeHTML(description)}
        </p>

        <div class="wahen-admin-status">
          <span>●</span>
          Admin access active
        </div>

        <div class="wahen-admin-actions">

          <button
            type="button"
            class="wahen-admin-primary"
            id="adminContinueButton"
          >
            Haa, sii wad →
          </button>

          <button
            type="button"
            class="wahen-admin-secondary"
            id="adminCancelButton"
          >
            Xir
          </button>

        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    injectAdminStyles();

    document
      .querySelector("#closeWahenAdminPanel")
      ?.addEventListener("click", closeAdminPanel);

    document
      .querySelector("#adminCancelButton")
      ?.addEventListener("click", closeAdminPanel);

    document
      .querySelector("#adminContinueButton")
      ?.addEventListener("click", function () {

        closeAdminPanel();

        showMessage(
          title + " qaybteeda waxaa loo diyaariyey isku xirka backend-ka."
        );

      });

    overlay.addEventListener("click", function (event) {

      if (event.target === overlay) {
        closeAdminPanel();
      }

    });
  }


  /* =========================================================
     6. CLOSE ADMIN PANEL
     ========================================================= */

  function closeAdminPanel() {

    const existing =
      document.querySelector("#wahenAdminOverlay");

    if (existing) {
      existing.remove();
    }
  }


  /* =========================================================
     7. ROLE BUTTONS
     ========================================================= */

  function setupRoleButtons() {

    document
      .querySelectorAll("[data-role]")
      .forEach(function (button) {

        button.addEventListener("click", function () {

          const role =
            button.getAttribute("data-role");

          if (!role) return;

          sessionStorage.setItem(
            "wahen-role",
            role
          );

          const destinations = {
            buyer: "buyer.html",
            seller: "seller.html",
            admin: "admin.html"
          };

          if (destinations[role]) {
            window.location.href =
              destinations[role];
          }

        });

      });
  }


  /* =========================================================
     8. MESSAGE
     ========================================================= */

  function showMessage(message) {

    const old =
      document.querySelector("#wahenRoleMessage");

    if (old) old.remove();

    const box = document.createElement("div");

    box.id = "wahenRoleMessage";

    box.textContent = message;

    document.body.appendChild(box);

    injectAdminStyles();

    setTimeout(function () {

      box.classList.add("show");

    }, 20);

    setTimeout(function () {

      box.classList.remove("show");

      setTimeout(function () {
        box.remove();
      }, 300);

    }, 3500);
  }


  /* =========================================================
     9. SECURITY / HTML ESCAPE
     ========================================================= */

  function escapeHTML(value) {

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  /* =========================================================
     10. ADMIN UI STYLE
     ========================================================= */

  function injectAdminStyles() {

    if (document.querySelector("#wahen-admin-runtime-style")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "wahen-admin-runtime-style";

    style.textContent = `

      #wahenAdminOverlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(15, 23, 42, .65);
        backdrop-filter: blur(8px);
      }

      .wahen-admin-modal {
        width: min(440px, 100%);
        background: #ffffff;
        border-radius: 24px;
        padding: 30px;
        position: relative;
        box-shadow:
          0 25px 80px rgba(0,0,0,.25);
        animation:
          wahenAdminModalIn .25s ease;
      }

      @keyframes wahenAdminModalIn {

        from {
          opacity: 0;
          transform: translateY(20px) scale(.96);
        }

        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

      }

      .wahen-admin-close {
        position: absolute;
        top: 15px;
        right: 15px;
        width: 38px;
        height: 38px;
        border: 0;
        border-radius: 50%;
        background: #f1f5f9;
        color: #334155;
        font-size: 25px;
        cursor: pointer;
      }

      .wahen-admin-icon {
        width: 62px;
        height: 62px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 18px;
        background: #eef0fe;
        font-size: 30px;
        margin-bottom: 18px;
      }

      .wahen-admin-label {
        display: block;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.5px;
        color: #4338ca;
        margin-bottom: 7px;
      }

      .wahen-admin-modal h2 {
        margin: 0 0 10px;
        font-size: 27px;
        color: #0f172a;
      }

      .wahen-admin-modal p {
        margin: 0;
        line-height: 1.6;
        color: #64748b;
      }

      .wahen-admin-status {
        margin-top: 20px;
        padding: 13px 15px;
        border-radius: 12px;
        background: #f8fafc;
        color: #475569;
        font-size: 13px;
        font-weight: 700;
      }

      .wahen-admin-status span {
        color: #16a34a;
        margin-right: 7px;
      }

      .wahen-admin-actions {
        display: grid;
        gap: 10px;
        margin-top: 22px;
      }

      .wahen-admin-primary,
      .wahen-admin-secondary {
        width: 100%;
        min-height: 48px;
        border-radius: 13px;
        border: 0;
        cursor: pointer;
        font-size: 15px;
        font-weight: 800;
      }

      .wahen-admin-primary {
        background: #4338ca;
        color: white;
      }

      .wahen-admin-primary:active {
        transform: scale(.98);
      }

      .wahen-admin-secondary {
        background: #f1f5f9;
        color: #334155;
      }

      #wahenRoleMessage {
        position: fixed;
        left: 50%;
        bottom: 25px;
        z-index: 100000;
        width: calc(100% - 30px);
        max-width: 450px;
        padding: 14px 17px;
        border-radius: 14px;
        background: #0f172a;
        color: white;
        text-align: center;
        font-size: 14px;
        font-weight: 700;
        opacity: 0;
        transform: translate(-50%, 15px);
        transition: .3s ease;
        box-shadow: 0 15px 40px rgba(0,0,0,.2);
      }

      #wahenRoleMessage.show {
        opacity: 1;
        transform: translate(-50%, 0);
      }

      [data-demo-action] {
        cursor: pointer;
        transition: transform .15s ease,
                    box-shadow .15s ease;
      }

      [data-demo-action]:active {
        transform: scale(.97);
      }

    `;

    document.head.appendChild(style);
  }

})();