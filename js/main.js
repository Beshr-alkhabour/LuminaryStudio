/* Luminary Studio — main.js */
(function () {
  "use strict";

  /* ---------- Language toggle (DE default, EN in data-en attributes) ---------- */

  var LANG_KEY = "luminary-lang";
  var langToggle = document.getElementById("lang-toggle");

  var EN_TITLE = "Luminary Studio — Web Design Agency | Where vision meets light.";
  var DE_TITLE = document.title;

  function applyLang(lang) {
    // Title + Meta-Description mitübersetzen
    document.title = lang === "en" ? EN_TITLE : DE_TITLE;
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      if (!metaDesc.dataset.deContent) metaDesc.dataset.deContent = metaDesc.content;
      var enContent = metaDesc.getAttribute("data-en-content");
      if (enContent) metaDesc.content = lang === "en" ? enContent : metaDesc.dataset.deContent;
    }

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

      // Im gefilterten Zustand die 2×2-Showcase-Kachel auf Normalgröße bringen,
      // damit keine leeren Rasterzellen entstehen
      var bento = document.querySelector(".work-bento");
      if (bento) bento.classList.toggle("filtered", filter !== "all");
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

      var btn = form.querySelector('button[type="submit"]');
      var errorEl = form.querySelector(".form-error");
      var endpoint = form.getAttribute("action");
      var isEN = document.documentElement.lang === "en";

      if (errorEl) errorEl.hidden = true;
      var originalLabel = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = isEN ? "Sending…" : "Wird gesendet …";

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error("submit failed");
          form.classList.add("sent");
        })
        .catch(function () {
          if (errorEl) errorEl.hidden = false;
          btn.disabled = false;
          btn.innerHTML = originalLabel;
        });
    });
  }
})();
