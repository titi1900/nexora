/* ============================================================
   Nexora — js/site.js
   JS commun du site, chargé en defer par toutes les pages.

   Contient :
   1. Menu mobile (#menuBtn / #navLinks, classe .is-open)
   2. Bouton retour en haut (#scrollToTopBtn, visible > 400 px)
   3. Carrousel de services accessible avec autoscroll
      (section #services des index FR / EN / DE)
   4. Carrousel hero en 3 slides (index.html, #heroTrack)

   Conventions :
   - Aucune traduction côté client pour les contenus (le texte est
     dans le HTML de chaque langue) ; seuls les libellés dynamiques
     du bouton play/pause du carrousel sont choisis d'après
     <html lang> (fr / en / de, repli fr).
   - CSP-friendly : aucun handler inline, pas de réseau, pas d'eval.
   - Le site reste utilisable sans JavaScript (navigation, contenus) ;
     le JS n'apporte que du confort.
   ============================================================ */

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------
     1. MENU MOBILE
     Bouton #menuBtn → classe .is-open sur #navLinks.
     Fermeture : clic sur un lien, touche Échap, clic sur le bouton.
     ------------------------------------------------------------ */
  var btn = document.getElementById('menuBtn');
  var nav = document.getElementById('navLinks');

  if (btn && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    btn.addEventListener('click', function () {
      setMenu(btn.getAttribute('aria-expanded') !== 'true');
    });

    /* Fermer quand on choisit un lien du menu */
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    /* Fermer au clavier (Échap) */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });

    /* Refermer le sélecteur de langue quand on change de langue */
    var langSwitch = document.querySelector('.lang-switch');
    if (langSwitch) {
      langSwitch.querySelectorAll('.lang-menu a').forEach(function (a) {
        a.addEventListener('click', function () {
          if (langSwitch.open) langSwitch.open = false;
        });
      });
    }
  }

  /* ------------------------------------------------------------
     2. BOUTON RETOUR EN HAUT (#scrollToTopBtn)
     Visible après 400 px de scroll, remonte en douceur.
     ------------------------------------------------------------ */
  var top = document.getElementById('scrollToTopBtn');

  if (top) {
    var queued = false;
    var update = function () {
      top.classList.toggle('is-visible', window.scrollY > 400);
      queued = false;
    };

    window.addEventListener('scroll', function () {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });

    top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });

    update();
  }

  /* ============================================================
     3. CARROUSEL DE SERVICES (section #services des index)
     Pattern : contenu 100 % dans le DOM (crawlable), scroll-snap
     natif en CSS (theme.css §17). Le JS déclenche le scroll au clic
     sur les flèches, gère l'autoscroll (1 s par carte), les pauses
     (survol, focus, swipe, onglet caché) et l'état du bouton
     play/pause. Libellés localisés via <html lang>.
     ============================================================ */

  var AUTO_DELAY = 1000; // 1 s par carte — synchronisé avec la largeur
                         // des cartes dans theme.css §17

  var TOGGLE_LABELS = {
    fr: { playing: 'Arrêter le défilement automatique des services',
          paused:  'Activer le défilement automatique des services' },
    en: { playing: 'Stop automatic scrolling of the services',
          paused:  'Start automatic scrolling of the services' },
    de: { playing: 'Automatisches Scrollen der Dienste stoppen',
          paused:  'Automatisches Scrollen der Dienste starten' }
  };

  function initCarousels() {
    var lang = document.documentElement.lang || 'fr';
    if (lang !== 'en' && lang !== 'de') lang = 'fr';
    var labels = TOGGLE_LABELS[lang];

    document.querySelectorAll('.carousel').forEach(function (carousel) {
      var track   = carousel.querySelector('.carousel-track');
      var prev    = carousel.querySelector('.carousel-btn.prev');
      var next    = carousel.querySelector('.carousel-btn.next');
      var toggle  = carousel.querySelector('.carousel-toggle');
      if (!track) return;

      var timer   = null;
      var playing = false;
      var hover = false, focus = false, touch = false, hidden = false;

      /* Pas de scroll = largeur d'une carte + gap (20 px, theme.css §17).
         Recalculé à chaque déplacement pour suivre le redimensionnement. */
      function step() {
        var card = track.querySelector('.card');
        var w = card ? card.getBoundingClientRect().width : 0;
        return Math.round(w + 20);
      }

      function scrollBy(dir) {
        track.scrollBy({ left: dir * step(), behavior: 'auto' });
      }

      if (prev) prev.addEventListener('click', function () { scrollBy(-1); });
      if (next) next.addEventListener('click', function () { scrollBy(1); });

      /* Boutons flèches : désactivés en butée quand on est arrêté.
         (Pendant l'autoscroll, la boucle est infinie : toujours actifs.) */
      function updateButtons() {
        if (playing) {
          if (prev) prev.disabled = false;
          if (next) next.disabled = false;
          return;
        }
        var max = track.scrollWidth - track.clientWidth;
        if (prev) prev.disabled = track.scrollLeft <= 1;
        if (next) next.disabled = track.scrollLeft >= max - 1;
      }
      track.addEventListener('scroll', updateButtons, { passive: true });
      window.addEventListener('resize', updateButtons);

      /* Autoscroll : boucle infinie (revient au début en fin de piste) */
      function tick() {
        var max = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= max - 1) {
          track.scrollTo({ left: 0, behavior: 'auto' });
        } else {
          scrollBy(1);
        }
      }

      function start() {
        if (playing) return;
        playing = true;
        if (!reduce) timer = window.setInterval(tick, AUTO_DELAY);
        renderToggle();
        updateButtons();
      }

      function stop() {
        playing = false;
        if (timer) { window.clearInterval(timer); timer = null; }
        renderToggle();
        updateButtons();
      }

      function renderToggle() {
        if (!toggle) return;
        toggle.setAttribute('aria-pressed', playing ? 'true' : 'false');
        toggle.setAttribute('aria-label', playing ? labels.playing : labels.paused);
      }

      if (toggle) {
        toggle.addEventListener('click', function () {
          if (playing) { stop(); } else { start(); }
        });
      }

      /* Pause au survol et au focus (ne jamais faire défiler du contenu
         qu'un utilisateur est en train de lire ou de manipuler) */
      carousel.addEventListener('mouseenter', function () { hover = true; });
      carousel.addEventListener('mouseleave', function () { hover = false; });
      carousel.addEventListener('focusin',  function () { focus = true; });
      carousel.addEventListener('focusout', function (e) {
        if (!carousel.contains(e.relatedTarget)) focus = false;
      });

      /* Pause pendant un swipe tactile (touchstart → touchend) */
      track.addEventListener('touchstart', function () { touch = true; }, { passive: true });
      track.addEventListener('touchend', function () {
        setTimeout(function () { touch = false; }, 400);
      }, { passive: true });

      /* Pause si l'onglet est caché (économie + bonne pratique) */
      document.addEventListener('visibilitychange', function () {
        hidden = document.hidden;
      });

      /* Déclencheur unique : n'avance que si aucune pause n'est active */
      function heartbeat() {
        if (playing && !hover && !focus && !touch && !hidden) tick();
      }
      if (!reduce) window.setInterval(heartbeat, AUTO_DELAY);

      /* Autoscroll actif par défaut, sauf prefers-reduced-motion */
      if (!reduce) start(); else renderToggle();
      updateButtons();
    });
  }

  initCarousels();

  /* ============================================================
     4. CARROUSEL HERO EN 3 SLIDES (index.html)
     Pattern : piste .hero-track en scroll-snap horizontal
     (theme.css §21). Le JS déclenche le scroll au clic sur les
     flèches, synchronise l'index sur l'événement scroll (le swipe
     tactile et le drag souris sont natifs), masque les flèches aux
     extrémités et gère les flèches clavier — uniquement quand le
     hero est visible, pour ne pas parasiter le scroll de la page.
     ============================================================ */

  function initHeroSlides() {
    var track = document.getElementById('heroTrack');
    var prev  = document.getElementById('heroPrevBtn');
    var next  = document.getElementById('heroNextBtn');
    if (!track) return;

    var slides = track.querySelectorAll('.hero-slide');
    var total = slides.length;
    var current = 0;

    function goToSlide(index) {
      track.scrollTo({
        left: index * track.clientWidth,
        behavior: reduce ? 'auto' : 'smooth'
      });
    }

    /* Masque la flèche inutile aux extrémités */
    function updateButtons() {
      if (prev) prev.hidden = (current === 0);
      if (next) next.hidden = (current === total - 1);
    }

    if (next) next.addEventListener('click', function () {
      if (current < total - 1) { current++; goToSlide(current); }
    });

    if (prev) prev.addEventListener('click', function () {
      if (current > 0) { current--; goToSlide(current); }
    });

    /* Flèches clavier : seulement quand le hero est à l'écran
       (sinon les touches gauche/droite parasiteraient toute la page) */
    var heroVisible = true;

    function syncVisibility() {
      var rect = track.getBoundingClientRect();
      heroVisible = rect.bottom > 0 && rect.top < window.innerHeight;
    }

    document.addEventListener('keydown', function (e) {
      if (!heroVisible) return;
      if (e.key === 'ArrowRight' && current < total - 1) {
        current++; goToSlide(current);
      }
      if (e.key === 'ArrowLeft' && current > 0) {
        current--; goToSlide(current);
      }
    });

    /* Synchronise l'index quand l'utilisateur swipe ou drag
       (rAF : l'événement scroll peut être très fréquent) */
    var queued = false;

    track.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        current = Math.round(track.scrollLeft / track.clientWidth);
        updateButtons();
        queued = false;
      });
    }, { passive: true });

    window.addEventListener('scroll', syncVisibility, { passive: true });
    window.addEventListener('resize', updateButtons);

    syncVisibility();
    updateButtons();
  }

  initHeroSlides();
})();