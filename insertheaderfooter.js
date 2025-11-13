(async function insertHeader() {
  try {
    const res = await fetch('header.html');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const header = doc.querySelector('header.site-header');
    const target = document.getElementById('header-root');
    if (header && target) {
      target.appendChild(header);
    }
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(s => {
      const ns = document.createElement('script');
      if (s.src) ns.src = s.src; else ns.textContent = s.textContent;
      document.body.appendChild(ns);
    });
    // After header is in DOM, intercept Log in / Sign up clicks
    try {
      // Track last visited page (exclude auth pages)
      try {
        const path = (location.pathname || '').toLowerCase();
        if (!path.endsWith('/login.html') && !path.endsWith('/signup.html')) {
          localStorage.setItem('last_page', location.href);
        }
      } catch(e) {}

      // If user is logged in, hide auth buttons and show user + logout
      const currentUser = localStorage.getItem('auth_current_user');
      const loginLink = document.getElementById('loginBtn');
      const signupLink = document.getElementById('signupBtn');
      if (currentUser && (loginLink || signupLink)) {
        if (loginLink) loginLink.remove();
        if (signupLink) signupLink.remove();
        const actions = document.querySelector('.actions');
        if (actions) {
          const hello = document.createElement('span');
          hello.id = 'helloUser';
          hello.style.marginRight = '0.5rem';
          const helloTxt = document.documentElement.getAttribute('data-hello') || 'Hello';
          hello.textContent = `${helloTxt} ${currentUser}`;
          const out = document.createElement('a');
          out.href = '#';
          out.id = 'logoutBtn';
          out.className = 'btn';
          out.textContent = 'Logout';
          out.addEventListener('click', function(e){
            e.preventDefault();
            try { localStorage.removeItem('auth_current_user'); } catch(e) {}
            location.reload();
          });
          actions.appendChild(hello);
          actions.appendChild(out);
        }
      }
      // Update hello text on language change
      window.addEventListener('lang:changed', function(){
        const helloEl = document.getElementById('helloUser');
        const user = localStorage.getItem('auth_current_user');
        if (helloEl && user) {
          const helloTxt = document.documentElement.getAttribute('data-hello') || 'Hello';
          helloEl.textContent = `${helloTxt} ${user}`;
        }
      });
      // Persist and restore language across pages
      const langSelect = document.getElementById('langSelect');
      if (langSelect) {
        const savedLang = localStorage.getItem('lang') || 'eu';
        langSelect.value = savedLang;
        // Trigger change so the header script applies translations
        langSelect.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      console.warn('No se pudieron enlazar los eventos del header:', e);
    }
  } catch (e) {
    console.error('No se pudo cargar el header:', e);
  }
})();

(async function insertFooter() {
  try {
    const res = await fetch('footer.html');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const footer = doc.querySelector('footer.site-footer');
    const target = document.getElementById('footer-root');
    if (footer && target) {
      target.appendChild(footer);
      try {
        const links = target.querySelectorAll('a');
        links.forEach(a => {
          a.addEventListener('click', function(e){
            e.preventDefault();
            showUnderConstruction();
          });
        });
      } catch (e) {
        console.warn('No se pudieron enlazar los eventos del footer:', e);
      }
    }
  } catch (e) {
    console.error('No se pudo cargar el footer:', e);
  }
})();

// Reusable, localized Under Construction modal
(function ensureUcModal(){
  if (document.getElementById('uc-backdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.id = 'uc-backdrop';
  backdrop.setAttribute('role','presentation');
  backdrop.style.display = 'none';
  backdrop.className = 'uc-backdrop';

  const dialog = document.createElement('div');
  dialog.id = 'uc-dialog';
  dialog.className = 'uc-dialog';
  dialog.setAttribute('role','dialog');
  dialog.setAttribute('aria-modal','true');
  dialog.setAttribute('aria-labelledby','uc-title');

  const title = document.createElement('h2');
  title.id = 'uc-title';
  title.className = 'uc-title';
  title.textContent = 'ℹ️';

  const msg = document.createElement('p');
  msg.id = 'uc-message';
  msg.className = 'uc-message';
  msg.textContent = (localStorage.getItem('auth_current_user') ? document.documentElement.getAttribute('data-uc-msg') : document.documentElement.getAttribute('data-require-login')) || 'Página web en construcción';

  const close = document.createElement('button');
  close.id = 'uc-close';
  close.className = 'uc-close';
  close.type = 'button';
  close.textContent = 'OK';

  dialog.appendChild(title);
  dialog.appendChild(msg);
  dialog.appendChild(close);
  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);

  function hide(){ backdrop.style.display = 'none'; }
  function onKey(e){ if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hide(); } }
  backdrop.addEventListener('click', function(e){ if (e.target === backdrop) hide(); });
  close.addEventListener('click', hide);
  window.addEventListener('keydown', onKey);
})();

function showUnderConstruction(){
  const backdrop = document.getElementById('uc-backdrop');
  const msg = document.getElementById('uc-message');
  const close = document.getElementById('uc-close');
  if (!backdrop || !msg) return alert(document.documentElement.getAttribute('data-uc-msg') || 'Página web en construcción');
  const isLogged = !!localStorage.getItem('auth_current_user');
  msg.textContent = (isLogged ? document.documentElement.getAttribute('data-uc-msg') : document.documentElement.getAttribute('data-require-login')) || 'Página web en construcción';
  backdrop.style.display = 'grid';
  try { close.focus(); } catch(e) {}
}
