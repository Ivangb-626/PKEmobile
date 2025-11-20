(async function insertHeader() {
  try {
    const res = await fetch('header.html');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const header = doc.querySelector('header.site-header');
    const host = document.getElementById('header-root');
    if (header && host) {
      // Create shadow root and isolate styles
      const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'Styles/General.css';
      shadow.appendChild(link);
      // Adopt header into shadow
      shadow.appendChild(header);

      // Header-specific interactions within shadow
      try {
        // Track last visited page (exclude auth pages)
        try {
          const path = (location.pathname || '').toLowerCase();
          if (!path.endsWith('/login.html') && !path.endsWith('/signup.html')) {
            localStorage.setItem('last_page', location.href);
          }
        } catch(e) {}

        // Theme toggle (affects document body theme only)
        const themeToggle = shadow.getElementById('themeToggle');
        if (themeToggle) {
          try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') document.body.classList.add('dark');
            themeToggle.setAttribute('aria-pressed', String(document.body.classList.contains('dark')));
          } catch(e) {}
          themeToggle.addEventListener('click', function(){
            const isDark = document.body.classList.toggle('dark');
            themeToggle.setAttribute('aria-pressed', String(isDark));
            try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch(e) {}
          });
        }

        // Mobile side menu inside shadow
        const menuBtn = shadow.getElementById('menuBtn');
        const sideMenu = shadow.getElementById('sideMenu');
        const backdrop = shadow.getElementById('backdrop');
        function openMenu(){ if (sideMenu && backdrop && menuBtn) { sideMenu.classList.add('open'); backdrop.hidden = false; menuBtn.setAttribute('aria-expanded','true'); sideMenu.setAttribute('aria-hidden','false'); } }
        function closeMenu(){ if (sideMenu && backdrop && menuBtn) { sideMenu.classList.remove('open'); backdrop.hidden = true; menuBtn.setAttribute('aria-expanded','false'); sideMenu.setAttribute('aria-hidden','true'); } }
        if (menuBtn && sideMenu && backdrop) {
          menuBtn.addEventListener('click', function(){ sideMenu.classList.contains('open') ? closeMenu() : openMenu(); });
          backdrop.addEventListener('click', closeMenu);
          window.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeMenu(); });
        }

        // Auth state within header
        const currentUser = localStorage.getItem('auth_current_user');
        const loginLink = shadow.getElementById('loginBtn');
        const signupLink = shadow.getElementById('signupBtn');
        if (currentUser && (loginLink || signupLink)) {
          if (loginLink) loginLink.remove();
          if (signupLink) signupLink.remove();
          const actions = shadow.querySelector('.actions');
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
          const helloEl = shadow.getElementById('helloUser');
          const user = localStorage.getItem('auth_current_user');
          if (helloEl && user) {
            const helloTxt = document.documentElement.getAttribute('data-hello') || 'Hello';
            helloEl.textContent = `${helloTxt} ${user}`;
          }
        });

        // Persist and restore language across pages
        const langSelect = shadow.getElementById('langSelect');
        if (langSelect) {
          const savedLang = localStorage.getItem('lang') || 'eu';
          langSelect.value = savedLang;
          langSelect.addEventListener('change', function(){
            try { localStorage.setItem('lang', langSelect.value); } catch(e) {}
            try { window.dispatchEvent(new CustomEvent('lang:changed')); } catch(e) {}
          });
        }
      } catch (e) {
        console.warn('No se pudieron enlazar los eventos del header:', e);
      }
    }

    // Execute any inline scripts found inside the fetched header (none expected now)
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(s => {
      const ns = document.createElement('script');
      if (s.src) ns.src = s.src; else ns.textContent = s.textContent;
      document.body.appendChild(ns);
    });
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
    const host = document.getElementById('footer-root');
    if (footer && host) {
      const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'Styles/General.css';
      shadow.appendChild(link);
      shadow.appendChild(footer);
      try {
        const links = shadow.querySelectorAll('a');
        links.forEach(a => {
          if (a.classList.contains('link-primary')) {
            a.addEventListener('click', function(e){
              e.preventDefault();
              try {
                if (typeof showUnderConstruction === 'function') {
                  showUnderConstruction();
                } else {
                  const msg = document.documentElement.getAttribute('data-uc-msg') || 'Website under construction';
                  alert(msg);
                }
              } catch(_) {}
            });
          }
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
