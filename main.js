/* ==========================================================================
   Streamline — vanilla JS only. No external libraries, no CDN scripts.
   Every init guard-clauses missing elements.
   ========================================================================== */
(function () {
  'use strict';

  /* --- Header: transparent -> solid on scroll --- */
  function initHeader() {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    var solidAt = 40;
    function onScroll() {
      header.classList.toggle('is-scrolled', window.scrollY > solidAt);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Mobile nav toggle --- */
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var panel = document.getElementById('mobileNav');
    if (!toggle || !panel) return;

    function close() {
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }
    function open() {
      panel.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }

    toggle.addEventListener('click', function () {
      if (panel.classList.contains('is-open')) { close(); } else { open(); }
    });

    // close when a link is tapped or on Escape / resize to desktop
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) { close(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) { close(); }
    });
  }

  /* --- Horizontal scroll rows (arrow buttons) --- */
  function initScrollRows() {
    var buttons = document.querySelectorAll('[data-scroll]');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      var targetId = btn.getAttribute('data-target');
      var row = document.getElementById(targetId);
      if (!row) return;
      var dir = btn.getAttribute('data-scroll') === 'prev' ? -1 : 1;

      btn.addEventListener('click', function () {
        var amount = Math.max(row.clientWidth * 0.8, 260);
        row.scrollBy({ left: dir * amount, behavior: 'smooth' });
      });
    });

    // enable/disable prev-next based on scroll position
    document.querySelectorAll('.snap-row').forEach(function (row) {
      var prev = document.querySelector('[data-scroll="prev"][data-target="' + row.id + '"]');
      var next = document.querySelector('[data-scroll="next"][data-target="' + row.id + '"]');
      if (!prev && !next) return;
      function update() {
        var maxLeft = row.scrollWidth - row.clientWidth - 2;
        if (prev) prev.disabled = row.scrollLeft <= 2;
        if (next) next.disabled = row.scrollLeft >= maxLeft;
      }
      update();
      row.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
    });
  }

  /* --- Pricing: monthly / annual toggle --- */
  function initBillingToggle() {
    var monthly = document.getElementById('billMonthly');
    var annual = document.getElementById('billAnnual');
    if (!monthly || !annual) return;

    function apply(mode) {
      var isAnnual = mode === 'annual';
      monthly.classList.toggle('is-active', !isAnnual);
      annual.classList.toggle('is-active', isAnnual);
      monthly.setAttribute('aria-pressed', String(!isAnnual));
      annual.setAttribute('aria-pressed', String(isAnnual));

      document.querySelectorAll('[data-monthly]').forEach(function (el) {
        var val = isAnnual ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
        if (val !== null) { el.textContent = val; }
      });
    }

    monthly.addEventListener('click', function () { apply('monthly'); });
    annual.addEventListener('click', function () { apply('annual'); });
  }

  /* --- Season tabs / episode panels (title.html) --- */
  function initSeasonTabs() {
    var tabs = document.querySelectorAll('[data-season]');
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var season = tab.getAttribute('data-season');
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', String(on));
        });
        document.querySelectorAll('[data-panel]').forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-panel') !== season;
        });
      });
    });
  }

  /* --- Newsletter front-end validation --- */
  function initNewsletter() {
    var form = document.getElementById('newsletterForm');
    if (!form) return;
    var input = form.querySelector('#nlEmail');
    var msg = form.querySelector('#nlMsg');
    if (!input || !msg) return;
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = input.value.trim();
      if (!re.test(value)) {
        msg.textContent = 'Please enter a valid email address.';
        msg.className = 'newsletter__msg err';
        input.focus();
        return;
      }
      msg.textContent = "You're on the list — check your inbox to confirm.";
      msg.className = 'newsletter__msg ok';
      form.reset();
    });

    input.addEventListener('input', function () {
      if (msg.textContent) { msg.textContent = ''; msg.className = 'newsletter__msg'; }
    });
  }

  /* --- Smooth-scroll for in-page anchors (accounts for fixed header) --- */
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    if (!links.length) return;
    var header = document.getElementById('siteHeader');

    links.forEach(function (link) {
      var id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      link.addEventListener('click', function (e) {
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var offset = (header ? header.offsetHeight : 0) + 12;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
        if (history.replaceState) { history.replaceState(null, '', id); }
      });
    });
  }

  /* --- Scroll reveal with IntersectionObserver --- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* --- boot --- */
  function boot() {
    initHeader();
    initMobileNav();
    initScrollRows();
    initBillingToggle();
    initSeasonTabs();
    initNewsletter();
    initSmoothScroll();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
