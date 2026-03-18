/* theme.js — Dual theme toggle with localStorage persistence */
(function () {
  const KEY = 'gamma-theme';
  const root = document.documentElement;

  function getPreferred() {
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    updateIcons(theme);
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  function sunSVG() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5"/>
      <line x1="12" y1="2"    x2="12" y2="4"/>
      <line x1="12" y1="20"   x2="12" y2="22"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="2"  y1="12"   x2="4"  y2="12"/>
      <line x1="20" y1="12"   x2="22" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>`;
  }

  function moonSVG() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`;
  }

  function updateIcons(theme) {
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.innerHTML = theme === 'dark' ? sunSVG() : moonSVG();
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title',      theme === 'dark' ? 'Light mode' : 'Dark mode');
    });
  }

  // Apply theme immediately (before DOMContentLoaded) to prevent flash
  const initial = getPreferred();
  root.setAttribute('data-theme', initial);

  document.addEventListener('DOMContentLoaded', function () {
    updateIcons(initial);

    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const current = root.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
      });
    });

    // Mobile nav
    const hamburger = document.querySelector('.nav-hamburger');
    const mobileMenu = document.querySelector('.nav-mobile-menu');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function () {
        const isOpen = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
      });
      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
          mobileMenu.classList.remove('open');
          hamburger.classList.remove('open');
        }
      });
    }
  });
})();
