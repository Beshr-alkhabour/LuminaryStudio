/* Luminary Studio v2 — main.js
   Sprach-Toggle (DE/EN), Mobile-Nav, Scroll-Reveals, Portfolio-Filter, Kontaktformular */
(function () {
  "use strict";

  var LANG_KEY = "luminary-lang";

  /* ---------- Sprach-Toggle ---------- */
  var langToggle = document.getElementById("lang-toggle");
  var currentLang = "de";

  function applyLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-en]").forEach(function (el) {
      // Deutsches Original beim ersten Wechsel sichern
      if (!el.hasAttribute("data-de")) {
        el.setAttribute("data-de", el.innerHTML);
      }
      el.innerHTML = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-de");
    });

    document.querySelectorAll("[data-en-placeholder]").forEach(function (el) {
      if (!el.hasAttribute("data-de-placeholder")) {
        el.setAttribute("data-de-placeholder", el.getAttribute("placeholder") || "");
      }
      el.setAttribute(
        "placeholder",
        lang === "en" ? el.getAttribute("data-en-placeholder") : el.getAttribute("data-de-placeholder")
      );
    });

    if (langToggle) {
      langToggle.textContent = lang === "en" ? "DE" : "EN";
      langToggle.setAttribute(
        "aria-label",
        lang === "en" ? "Zur deutschen Version wechseln" : "Switch to English"
      );
    }

    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      /* privater Modus o. Ä. — Toggle funktioniert trotzdem */
    }
  }

  if (langToggle) {
    langToggle.addEventListener("click", function () {
      applyLang(currentLang === "de" ? "en" : "de");
    });
  }

  try {
    if (localStorage.getItem(LANG_KEY) === "en") {
      applyLang("en");
    }
  } catch (e) { /* noop */ }

  /* ---------- Header-Zustand ---------- */
  var header = document.getElementById("site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile-Nav ---------- */
  var burger = document.getElementById("nav-burger");
  var nav = document.getElementById("main-nav");

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Scroll-Reveals ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Portfolio-Filter ---------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");

      filterBtns.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });

      projectCards.forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-cat") === filter;
        card.classList.toggle("hidden", !show);
      });
    });
  });

  /* ---------- Kontaktformular (Formspree, AJAX) ---------- */
  var form = document.getElementById("kontakt-form");
  var status = document.getElementById("form-status");

  function setStatus(type, de, en) {
    if (!status) return;
    status.className = "form-status " + type;
    status.setAttribute("data-en", en);
    status.setAttribute("data-de", de);
    status.innerHTML = currentLang === "en" ? en : de;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot: still verwerfen
      var gotcha = form.querySelector('[name="_gotcha"]');
      if (gotcha && gotcha.value) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      setStatus("", "Wird gesendet …", "Sending …");

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            setStatus(
              "ok",
              "Danke! Ihre Nachricht ist angekommen — wir melden uns innerhalb von 24 Stunden.",
              "Thank you! Your message has been received — we'll get back to you within 24 hours."
            );
          } else {
            setStatus(
              "err",
              "Das hat leider nicht geklappt. Bitte versuchen Sie es erneut oder schreiben Sie an hallo@luminary.studio.",
              "Something went wrong. Please try again or email hallo@luminary.studio."
            );
          }
        })
        .catch(function () {
          setStatus(
            "err",
            "Keine Verbindung. Bitte prüfen Sie Ihr Internet und versuchen Sie es erneut.",
            "No connection. Please check your internet and try again."
          );
        })
        .then(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
})();
