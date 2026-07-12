/* Luminary Studio — main.js */
(function () {
  "use strict";

  /* ---------- Language toggle (DE default, EN in data-en attributes) ---------- */

  var LANG_KEY = "luminary-lang";
  var langToggle = document.getElementById("lang-toggle");

  function applyLang(lang) {
    document.querySelectorAll("[data-en]").forEach(function (el) {
      // Cache the original German markup on first switch
      if (!el.dataset.de) el.dataset.de = el.innerHTML;
      el.innerHTML = lang === "en" ? el.dataset.en : el.dataset.de;
    });

    document.querySelectorAll("[data-en-placeholder]").forEach(function (el) {
      if (!el.dataset.dePlaceholder) el.dataset.dePlaceholder = el.placeholder;
      el.placeholder = lang === "en" ? el.dataset.enPlaceholder : el.dataset.dePlaceholder;
    });

    document.documentElement.lang = lang;
    if (langToggle) langToggle.textContent = lang === "en" ? "DE" : "EN";
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* private mode */ }
  }

  if (langToggle) {
    langToggle.addEventListener("click", function () {
      applyLang(document.documentElement.lang === "en" ? "de" : "en");
    });
  }

  var savedLang = null;
  try { savedLang = localStorage.getItem(LANG_KEY); } catch (e) { /* private mode */ }
  if (savedLang === "en") applyLang("en");

  /* ---------- Mobile navigation ---------- */

  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Header shadow on scroll ---------- */

  var header = document.querySelector(".site-header");

  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }

  if (header) {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Reveal on scroll ---------- */

  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Portfolio filter ---------- */

  var filterBtns = document.querySelectorAll(".filter-btn");
  var workCards = document.querySelectorAll(".work-card");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");

      var filter = btn.dataset.filter;
      workCards.forEach(function (card) {
        card.classList.toggle("hidden", filter !== "all" && card.dataset.category !== filter);
      });
    });
  });

  /* ---------- Contact form (front-end demo) ---------- */

  var form = document.getElementById("contact-form");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.classList.add("sent");
    });
  }
})();
