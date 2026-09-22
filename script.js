// ===============================
// WaHeN Marketplace
// Search + Categories + Cart + Favorite
// ===============================

document.addEventListener("DOMContentLoaded", function () {

  const searchInput = document.querySelector(".search input");
  const products = document.querySelectorAll(".prod-card");
  const categories = document.querySelectorAll(".cat");
  const cartButton = document.querySelector(".topbar .icon-btn:last-child");

  let cartCount = 0;

  // ===============================
  // 1. SEARCH
  // ===============================

  if (searchInput) {

    searchInput.addEventListener("input", function () {

      const searchText = searchInput.value.toLowerCase().trim();

      products.forEach(function (product) {

        const productName =
          product.querySelector("h3")?.textContent.toLowerCase() || "";

        if (productName.includes(searchText)) {
          product.style.display = "";
        } else {
          product.style.display = "none";
        }

      });

    });

  }

  // ===============================
  // 2. FAVORITE ❤️
  // ===============================

  products.forEach(function (product) {

    const favorite = document.createElement("button");

    favorite.innerHTML = "♡";

    favorite.style.position = "absolute";
    favorite.style.top = "8px";
    favorite.style.right = "8px";
    favorite.style.width = "30px";
    favorite.style.height = "30px";
    favorite.style.border = "none";
    favorite.style.borderRadius = "50%";
    favorite.style.background = "#FFFFFF";
    favorite.style.fontSize = "18px";
    favorite.style.cursor = "pointer";
    favorite.style.zIndex = "2";

    favorite.addEventListener("click", function () {

      if (favorite.innerHTML === "♡") {
        favorite.innerHTML = "♥";
        favorite.style.color = "#D9524E";
      } else {
        favorite.innerHTML = "♡";
        favorite.style.color = "#1E1B2E";
      }

    });

    product.appendChild(favorite);

  });

  // ===============================
  // 3. ADD TO CART 🛒
  // ===============================

  products.forEach(function (product) {

    const cart = document.createElement("button");

    cart.innerHTML = "🛒";

    cart.style.position = "absolute";
    cart.style.bottom = "8px";
    cart.style.right = "8px";
    cart.style.width = "30px";
    cart.style.height = "30px";
    cart.style.border = "none";
    cart.style.borderRadius = "9px";
    cart.style.background = "#4338CA";
    cart.style.color = "#FFFFFF";
    cart.style.cursor = "pointer";

    cart.addEventListener("click", function () {

      cartCount++;

      cartButton.innerHTML = "🛒 " + cartCount;

      alert("Alaabta Cart-ka ayaa lagu daray 🛒");

    });

    product.appendChild(cart);

  });

  // ===============================
  // 4. CATEGORY FILTER
  // ===============================

  categories.forEach(function (category) {

    category.addEventListener("click", function () {

      const categoryName =
        category.querySelector("span")?.textContent.toLowerCase() || "";

      products.forEach(function (product) {

        const productName =
          product.querySelector("h3")?.textContent.toLowerCase() || "";

        // Qaybaha hadda waxaan u isticmaalaynaa
        // magaca qaybta iyo magaca alaabta.

        if (
          categoryName === "others" ||
          productName.includes(categoryName)
        ) {
          product.style.display = "";
        } else {
          product.style.display = "";
        }

      });

    });

  });

});
