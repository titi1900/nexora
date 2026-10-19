/**
 * Nexora — site.js
 * Comportements communs à toutes les pages :
 * - Menu mobile (toggle, fermeture au clic / resize)
 * - Bouton retour en haut
 * - Formulaire de contact (honeypot, validation, statut)
 *
 * Chargé en defer : le DOM est déjà disponible.
 */
(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. Menu mobile
     -------------------------------------------------------------------------- */
  function initMobileMenu() {
    var menuBtn = document.getElementById('menuBtn');
    var navLinks = document.getElementById('navLinks');
    if (!menuBtn || !navLinks) return;

    function closeMenu() {
      navLinks.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }

    function openMenu() {
      navLinks.classList.add('is-open');
      menuBtn.setAttribute('aria-expanded', 'true');
    }

    menuBtn.addEventListener('click', function () {
      var isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Fermer au clic sur un lien (navigation interne)
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 901) {
          closeMenu();
        }
      });
    });

    // Fermer si on repasse en desktop
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth >= 901) {
          closeMenu();
        }
      }, 100);
    });

    // Fermer à la touche Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menuBtn.focus();
      }
    });
  }

  /* --------------------------------------------------------------------------
     2. Bouton retour en haut
     -------------------------------------------------------------------------- */
  function initScrollToTop() {
    var btn = document.getElementById('scrollToTopBtn');
    if (!btn) return;

    var threshold = 400;
    var ticking = false;

    function updateVisibility() {
      if (window.scrollY > threshold) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        behavior: prefersReduced ? 'auto' : 'smooth'
      });
    });
  }

  /* --------------------------------------------------------------------------
     3. Formulaire de contact
     -------------------------------------------------------------------------- */
  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var statusEl = document.getElementById('formStatus');
    var submitBtn = document.getElementById('submitBtn');
    var honeypot = form.querySelector('#website');

    function setStatus(message, type) {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.classList.remove('is-success', 'is-error');
      if (type === 'success') statusEl.classList.add('is-success');
      if (type === 'error') statusEl.classList.add('is-error');
    }

    function isValidEmail(value) {
      // Regex simple et suffisante pour une validation client
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot : si rempli → bot, on simule un succès sans rien faire
      if (honeypot && honeypot.value.trim() !== '') {
        setStatus('Merci.', 'success');
        form.reset();
        return;
      }

      var name = (form.name && form.name.value || '').trim();
      var email = (form.email && form.email.value || '').trim();
      var message = (form.message && form.message.value || '').trim();

      if (!name || !email || !message) {
        setStatus('Merci de remplir tous les champs.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        setStatus('Adresse email invalide.', 'error');
        return;
      }

      if (name.length > 120 || email.length > 180 || message.length > 4000) {
        setStatus('Un des champs dépasse la longueur autorisée.', 'error');
        return;
      }

      // Production : remplacer par un fetch vers votre endpoint
      // (Formspree, Netlify Forms, Cloudflare Worker, etc.)
      if (submitBtn) submitBtn.disabled = true;

      setStatus(
        'Merci. Dans une version en production, ce formulaire sera relié à votre service d’envoi (avec rate-limit et sanitization côté serveur).',
        'success'
      );
      form.reset();

      setTimeout(function () {
        if (submitBtn) submitBtn.disabled = false;
      }, 2000);
    });
  }

  /* --------------------------------------------------------------------------
     Initialisation
     -------------------------------------------------------------------------- */
  function init() {
    initMobileMenu();
    initScrollToTop();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
