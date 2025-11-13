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
    }
  } catch (e) {
    console.error('No se pudo cargar el footer:', e);
  }
})();
