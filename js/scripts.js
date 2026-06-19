/**
 * MANA HEALTH SCIENCES — scripts.js
 * Vanilla JS: Navigation, FAQ accordions, Reveal animations,
 * Counter animation, Smooth scroll, Form validation.
 */

(function () {
  'use strict';

  /* -------------------------------------------------------------------------
     Navigation — sticky scroll state
  -------------------------------------------------------------------------- */

  var nav = document.querySelector('.nav');
  var hero = document.querySelector('.hero');

  function updateNavState() {
    if (!nav) return;
    var threshold = hero ? hero.offsetHeight * 0.15 : 60;
    if (window.scrollY >= threshold) {
      nav.classList.add('nav--scrolled');
      nav.classList.remove('nav--transparent');
    } else {
      nav.classList.remove('nav--scrolled');
      nav.classList.add('nav--transparent');
    }
  }

  window.addEventListener('scroll', updateNavState, { passive: true });
  updateNavState();

  /* -------------------------------------------------------------------------
     Mobile Menu
  -------------------------------------------------------------------------- */

  var navToggle = document.querySelector('.nav__toggle');
  var mobileMenu = document.querySelector('.nav__mobile-menu');
  var toggleLines = navToggle ? navToggle.querySelectorAll('.nav__toggle-line') : [];

  function openMenu() {
    mobileMenu.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (toggleLines.length === 3) {
      toggleLines[0].style.transform = 'translateY(7.5px) rotate(45deg)';
      toggleLines[1].style.transform = 'scaleX(0)';
      toggleLines[1].style.opacity = '0';
      toggleLines[2].style.transform = 'translateY(-7.5px) rotate(-45deg)';
    }
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (toggleLines.length === 3) {
      toggleLines[0].style.transform = '';
      toggleLines[1].style.transform = '';
      toggleLines[1].style.opacity = '';
      toggleLines[2].style.transform = '';
    }
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });

    mobileMenu.querySelectorAll('.nav__mobile-link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
    });
  }

  /* -------------------------------------------------------------------------
     Active Nav Link
  -------------------------------------------------------------------------- */

  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('nav__link--active');
    }
  });

  /* -------------------------------------------------------------------------
     FAQ Accordions
  -------------------------------------------------------------------------- */

  var faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-item__btn');
    var answer = item.querySelector('.faq-item__answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      faqItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          var a = other.querySelector('.faq-item__answer');
          if (a) a.style.maxHeight = null;
          var b = other.querySelector('.faq-item__btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = null;
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* -------------------------------------------------------------------------
     Intersection Observer — Reveal animations
  -------------------------------------------------------------------------- */

  var reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && reveals.length) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* -------------------------------------------------------------------------
     Animated Counters
  -------------------------------------------------------------------------- */

  function animateCounter(el, target, suffix, duration) {
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  var statNums = document.querySelectorAll('[data-count]');

  if ('IntersectionObserver' in window && statNums.length) {
    var counterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          animateCounter(el, parseInt(el.dataset.count, 10), el.dataset.suffix || '', 2000);
          counterObs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNums.forEach(function (el) { counterObs.observe(el); });
  }

  /* -------------------------------------------------------------------------
     Smooth Scroll for anchor links
  -------------------------------------------------------------------------- */

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
        10
      ) || 80;
      var top = target.getBoundingClientRect().top + window.pageYOffset - navH - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* -------------------------------------------------------------------------
     Contact / Deck Request Forms — basic validation + submit feedback
  -------------------------------------------------------------------------- */

  document.querySelectorAll('.contact-form, .deck-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        field.classList.remove('error');
        if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        }
      });

      var emailField = form.querySelector('[type="email"]');
      if (emailField && emailField.value) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
          emailField.classList.add('error');
          valid = false;
        }
      }

      if (valid) {
        var submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
          var orig = submitBtn.textContent;
          submitBtn.textContent = 'Received — we\'ll be in touch shortly';
          submitBtn.disabled = true;
          setTimeout(function () {
            submitBtn.textContent = orig;
            submitBtn.disabled = false;
            form.reset();
          }, 5000);
        }
      }
    });
  });

  /* -------------------------------------------------------------------------
     Tab switching (used on contact page for enquiry tracks)
  -------------------------------------------------------------------------- */

  var tabBtns = document.querySelectorAll('[data-tab-btn]');
  var tabPanels = document.querySelectorAll('[data-tab-panel]');

  if (tabBtns.length && tabPanels.length) {
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.dataset.tabBtn;

        tabBtns.forEach(function (b) {
          b.classList.remove('tab-btn--active');
          b.setAttribute('aria-selected', 'false');
        });
        tabPanels.forEach(function (p) { p.hidden = true; });

        btn.classList.add('tab-btn--active');
        btn.setAttribute('aria-selected', 'true');
        var panel = document.querySelector('[data-tab-panel="' + target + '"]');
        if (panel) panel.hidden = false;
      });
    });

    // Activate first tab on load
    if (tabBtns[0]) tabBtns[0].click();
  }

})();
