document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#role-login');
  const page = document.querySelector('[data-required-role]');
  const role = sessionStorage.getItem('wahen-role');

  // Demo-only guard. Real security must be enforced by Supabase/Firebase rules on the server.
  if (page && page.dataset.requiredRole !== role) {
    window.location.replace('login.html');
    return;
  }

  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedRole = document.querySelector('#role').value;
    sessionStorage.setItem('wahen-role', selectedRole);
    const destinations = { buyer: 'buyer.html', seller: 'seller.html', admin: 'admin.html' };
    window.location.href = destinations[selectedRole];
  });

  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', () => {
      sessionStorage.removeItem('wahen-role');
      window.location.href = 'login.html';
    });
  });

  document.querySelectorAll('[data-demo-action]').forEach((button) => {
    button.addEventListener('click', () => alert(`Qaybta “${button.textContent.trim()}” waa diyaar in backend lagu xiro.`));
  });
});
