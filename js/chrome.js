/* ============================================================
   Nexora — js/chrome.js
   Injection du header / footer communs sur les SOUS-PAGES.

   ⚠️ Conventions établies :
   - index.html garde son header/footer EN DUR (page stratégique :
     crawl sans JavaScript, GEO maximal). chrome.js ne s'y charge pas.
   - Sur les sous-pages, remplacer le <header> et le <footer> en dur par :
       <script src="js/chrome.js" defer
               data-nav-cta="Évaluer votre site ↗"
               data-nav-cta-href="index.html#contact"
               data-active="expertise"></script>
   - CSP-friendly : aucun handler inline, pas de réseau, pas d'eval.
   - Bouton "retour en haut" injecté aussi (structure seule ; le
     comportement est piloté par site.js, chargé lui aussi en defer).
   ============================================================ */

(function () {
  'use strict';

  /* Ne rien faire sur l'accueil : header/footer en dur, page stratégique. */
  var isHome = !location.pathname.split('/').pop() ||
               /(^|\/)index\.html?$/.test(location.pathname);
  if (isHome) return;

  var script = document.currentScript;
  if (!script) return;

  var ctaText = script.getAttribute('data-nav-cta') || 'Évaluer votre site ↗';
  var ctaHref = script.getAttribute('data-nav-cta-href') || 'index.html#contact';
  var active  = script.getAttribute('data-active') || '';

  /* ------------------------------------------------------------
     Navigation commune (convention URLs .html + ancres index)
     ------------------------------------------------------------ */
  var NAV = [
    ['Services',     'index.html#services'],
    ['Expertise',    'index.html#expertise'],
    ['Méthode',      'index.html#methode'],
    ['Équipe',       'index.html#equipe'],
    ['Réalisations', 'index.html#realisations'],
    ['Contact',      'index.html#contact']
  ];

  function navLinks(cls) {
    return NAV.map(function (n) {
      var attr = (cls === 'nav-links' && n[0].toLowerCase() === active)
        ? ' aria-current="page"'
        : '';
      return '<a href="' + n[1] + '"' + attr + '>' + n[0] + '</a>';
    }).join('');
  }

  /* Échappement minimal des attributs configurés par page. */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
                    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ------------------------------------------------------------
     Header
     ------------------------------------------------------------ */
  var header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML =
    '<div class="wrap"><div class="nav">' +
    '<a class="brand" href="index.html" aria-label="Nexora — Accueil">' +
    '<img src="./favicon.png" alt="Nexora" class="brand-icon" width="28" height="28" loading="eager">Nexora</a>' +
    '<nav class="nav-links" id="navLinks" aria-label="Navigation principale">' +
    navLinks('nav-links') +
    '</nav>' +
    '<div class="nav-actions">' +
    '<a class="nav-cta" href="' + esc(ctaHref) + '">' + esc(ctaText) + '</a>' +
    '<button class="menu" type="button" id="menuBtn" aria-label="Ouvrir le menu" ' +
    'aria-expanded="false" aria-controls="navLinks">☰</button>' +
    '</div></div></div>';

  var main = document.getElementById('main');
  var anchor = main || document.body.firstChild;
  document.body.insertBefore(header, anchor);

  /* ------------------------------------------------------------
     Footer + bouton retour en haut (structure, styles dans theme.css §14)
     ------------------------------------------------------------ */
  var footer = document.createElement('footer');
  footer.innerHTML =
    '<div class="wrap footer-inner">' +
    '<div><strong class="footer-brand">Nexora</strong> · Stratégie, design &amp; technologie · Lille, France</div>' +
    '<div class="footer-links">' + navLinks('footer-links') + '</div>' +
    '</div>';
  document.body.appendChild(footer);

  var top = document.createElement('button');
  top.id = 'scrollToTopBtn';
  top.setAttribute('aria-label', 'Remonter au début de la page');
  top.setAttribute('title', 'Remonter en haut');
  top.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2.5" stroke-linecap="round" ' +
    'stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
  document.body.appendChild(top);
})();