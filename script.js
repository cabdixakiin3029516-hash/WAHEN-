// WAHEN MARKETPLACE - MAIN JS LOGIC

document.addEventListener('DOMContentLoaded', () => {
  console.log("WaHeN Marketplace JS Loaded Successfully.");

  // Modal Control Functions
  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  };

  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  };

  // Close Modals on Close-Button Click
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) modal.classList.remove('active');
    });
  });

  // Handle Checkout Form Submission
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const orderData = {
        name: document.getElementById('shipName').value,
        phone: document.getElementById('shipPhone').value,
        city: document.getElementById('shipCity').value,
        address: document.getElementById('shipAddress').value,
        payment: document.querySelector('input[name="paymentMethod"]:checked').value,
        date: new Date().toISOString()
      };

      console.log("Order Submitted:", orderData);
      alert("Dalabkaaga waa la helay! Waa lagu soo xiriiri doonaa hsaacado gudahood.");
      closeModal('checkoutModal');
    });
  }

  // Handle Seller Registration
  const sellerForm = document.getElementById('sellerRegisterForm');
  if (sellerForm) {
    sellerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert("Hambalyo! Dukaankaaga waa la diwaan-geliyay. Maamulka ayaa kugu soo xiriiri doona.");
      closeModal('sellerModal');
    });
  }

  // Handle Order Tracking Search
  const searchOrderBtn = document.getElementById('searchOrderBtn');
  if (searchOrderBtn) {
    searchOrderBtn.addEventListener('click', () => {
      const orderId = document.getElementById('trackingInput').value;
      if (orderId.trim() !== "") {
        document.getElementById('trackingStatus').classList.remove('hidden');
      } else {
        alert("Fadlan geli Order ID sax ah.");
      }
    });
  }
});
