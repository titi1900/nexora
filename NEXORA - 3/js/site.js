(function () {
  'use strict';

  // ---- Menu mobile (accessible, cohérent sur toutes les pages) ----
  var menuBtn = document.getElementById('menuBtn');
  var navLinks = document.getElementById('navLinks');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      var open = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!open));
      navLinks.classList.toggle('is-open', !open);
    });

    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.innerWidth < 981) {
          navLinks.classList.remove('is-open');
          menuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 981) {
        navLinks.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---- Formulaire de contact (page d'accueil) ----
  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');
  var submitBtn = document.getElementById('submitBtn');

  if (form && statusEl) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot anti-spam : vérification côté client uniquement.
      // Rappel : une fois le backend branché, revalider impérativement
      // ce champ (et l'ensemble des entrées) côté serveur.
      var hp = form.querySelector('#website');
      if (hp && hp.value.trim() !== '') {
        statusEl.textContent = 'Merci.';
        form.reset();
        return;
      }

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();

      if (!name || !email || !message) {
        statusEl.textContent = 'Merci de remplir tous les champs.';
        return;
      }

      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email)) {
        statusEl.textContent = 'Adresse email invalide.';
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      statusEl.textContent = 'Merci. Votre message a bien été pris en compte.';
      form.reset();
      setTimeout(function () {
        if (submitBtn) submitBtn.disabled = false;
      }, 2000);
    });
  }
})();
