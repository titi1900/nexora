/* ============================================================
   Nexora — js/site.js
   Chargé en `defer` sur toutes les pages : <script src="js/site.js" defer>

   Conception :
   - Zéro dépendance, aucun framework, ~2 Ko minifié.
   - CSP-friendly : aucun handler inline (`onclick=…`), pas d'eval,
     pas de réseau : tout est local (script-src 'self').
   - Accessibilité : aria-expanded/aria-controls respectés,
     `prefers-reduced-motion` honoré, focus géré sur le menu mobile.
   - SEO/GEO-safe : le header et le footer restent en dur dans le HTML
     de chaque page (crawlabilité, rendu sans JavaScript). L'injection
     via `[data-include]` est une amélioration progressive optionnelle
     pour de futurs gabarits : elle ne s'active que si la page contient
     explicitement le placeholder correspondant.
   ============================================================ */

(function () {
  'use strict';

  /* ------------------------------------------------------------
     0. Détection du contexte page
     ------------------------------------------------------------ */
  // body[data-home] sur index.html ; absent sur les sous-pages,
  // où les ancres de navigation doivent être préfixées par "index.html".
  var isHome = document.body.hasAttribute('data-home');

  /* ------------------------------------------------------------
     1. Menu mobile (bouton ☰)
     ------------------------------------------------------------ */
  function initMenu() {
    var btn = document.getElementById('menuBtn');
    var nav = document.getElementById('navLinks');
    if (!btn || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    }

    btn.addEventListener('click', function () {
      setOpen(!nav.classList.contains('open'));
    });

    // Fermer au clic sur un lien (navigation ancres) ou à Échap.
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  /* ------------------------------------------------------------
     2. Lien de navigation actif (aria-current="page")
     ------------------------------------------------------------ */
  function initActiveLink() {
    var here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .footer-links a').forEach(function (a) {
      var target = a.getAttribute('href') || '';
      var page = target.split('#')[0].split('?')[0];
      var file = page === '' ? 'index.html' : page;
      if (file === here) a.setAttribute('aria-current', 'page');
    });
  }

  /* ------------------------------------------------------------
     3. Bouton "retour en haut" (#scrollToTopBtn)
     Styles dans theme.css (§14) ; ici uniquement le comportement.
     Le bouton est présent sur TOUTES les pages (en dur dans le HTML
     des pages livrées, ou injecté par chrome.js sur les gabarits).
     Classe d'état : .is-visible (convention theme.css §14).
     ------------------------------------------------------------ */
  function initScrollTop() {
    var btn = document.getElementById('scrollToTopBtn');
    if (!btn) return;

    var visible = false;
    window.addEventListener(
      'scroll',
      function () {
        var show = window.scrollY > 600;
        if (show !== visible) {
          visible = show;
          btn.classList.toggle('is-visible', show);
        }
      },
      { passive: true }
    );

    btn.addEventListener('click', function () {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------
     4. Défilement doux des ancres internes
     Ne s'applique qu'aux ancres de la même page ; les liens
     inter-pages (ex. index.html#services) restent natifs.
     ------------------------------------------------------------ */
  function initSmoothAnchors() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', '#' + id);
    });
  }

  /* ------------------------------------------------------------
     5. Année du footer (élément [data-year] si présent)
     ------------------------------------------------------------ */
  function initFooterYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ------------------------------------------------------------
     6. Injection header/footer — amélioration progressive
     S'active uniquement si la page contient :
       <div data-include="header"></div>  et/ou
       <div data-include="footer"></div>
     Le HTML en dur reste la référence SEO ; ce mécanisme sert aux
     futurs gabarits pour dédupliquer sans risquer le crawl.
     ------------------------------------------------------------ */
  var HEADER_HTML = [
    '<header class="site-header">',
    '  <div class="wrap">',
    '    <div class="nav">',
    '      <a class="brand" href="index.html" aria-label="Nexora — Accueil">',
    '        <img src="favicon.png" alt="Nexora" class="brand-icon" width="28" height="28" loading="eager">Nexora',
    '      </a>',
    '      <nav class="nav-links" id="navLinks" aria-label="Navigation principale">',
    '        <a href="index.html#services">Services</a>',
    '        <a href="index.html#expertise">Expertise</a>',
    '        <a href="index.html#methode">Méthode</a>',
    '        <a href="index.html#equipe">Équipe</a>',
    '        <a href="index.html#realisations">Réalisations</a>',
    '        <a href="index.html#contact">Contact</a>',
    '      </nav>',
    '      <div class="nav-actions">',
    '        <a class="nav-cta" href="index.html#contact">Évaluer votre site ↗</a>',
    '        <button class="menu" type="button" id="menuBtn" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="navLinks">☰</button>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</header>'
  ].join('\n');

  var FOOTER_HTML = [
    '<footer>',
    '  <div class="wrap footer-inner">',
    '    <div>',
    '      <strong style="color: var(--white)">Nexora</strong> · Stratégie, design &amp; technologie · Lille, France',
    '    </div>',
    '    <div class="footer-links">',
    '      <a href="index.html#services">Services</a>',
    '      <a href="index.html#expertise">Expertise</a>',
    '      <a href="index.html#methode">Méthode</a>',
    '      <a href="index.html#equipe">Équipe</a>',
    '      <a href="index.html#realisations">Réalisations</a>',
    '      <a href="index.html#contact">Contact</a>',
    '    </div>',
    '  </div>',
    '</footer>'
  ].join('\n');

  function initIncludes() {
    var includeHeader = document.querySelector('[data-include="header"]');
    if (includeHeader) {
      includeHeader.insertAdjacentHTML('afterend', HEADER_HTML);
      includeHeader.remove();
      // Sur l'accueil, les ancres sont locales (pas de préfixe).
      if (isHome) {
        document.querySelectorAll('.site-header a[href^="index.html#"]').forEach(function (a) {
          a.setAttribute('href', a.getAttribute('href').slice('index.html'.length));
        });
      }
    }
    var includeFooter = document.querySelector('[data-include="footer"]');
    if (includeFooter) {
      includeFooter.insertAdjacentHTML('afterend', FOOTER_HTML);
      includeFooter.remove();
    }
  }

  /* ------------------------------------------------------------
     7. Initialisation
     ------------------------------------------------------------ */
  function init() {
    initIncludes();   // d'abord : peut injecter header/footer
    initMenu();        // puis : cible les éléments éventuellement injectés
    initActiveLink();
    initScrollTop();
    initSmoothAnchors();
    initFooterYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();