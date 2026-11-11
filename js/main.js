/* Luminary Studio v2 — main.js
   Sprach-Toggle (DE/EN), Mobile-Nav, Scroll-Reveals, Portfolio-Filter, Kontaktformular */
(function () {
  "use strict";

  /* Teure Hero-Deko-Effekte (Glow-Atmung, Beam-Blur) erst nach dem ersten
     Paint zuschalten — hält den LCP-Pfad frei. Fallback ohne 'load'-Event. */
  function markLoaded() { document.body.classList.add("loaded"); }
  if (document.readyState === "complete") {
    markLoaded();
  } else {
    window.addEventListener("load", markLoaded, { once: true });
  }

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

    // z. B. Anfrage-Funnel: per JS erzeugte Texte neu setzen
    document.dispatchEvent(new Event("luminary:lang"));
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

  /* ---------- Scroll-Handler (Header, Progress, Parallax) ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.getElementById("site-header");
  var progress = document.getElementById("scroll-progress");
  var hero = document.querySelector(".hero");
  var heroHeight = hero ? hero.offsetHeight : 0;
  var ticking = false;

  window.addEventListener("resize", function () {
    if (hero) heroHeight = hero.offsetHeight;
  }, { passive: true });

  function updateScroll() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;

    if (header) header.classList.toggle("scrolled", y > 8);

    if (progress && !reduceMotion) {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = docHeight > 0 ? Math.min(y / docHeight, 1) : 0;
      progress.style.transform = "scaleX(" + ratio + ")";
    }

    if (hero && !reduceMotion) {
      // Lichtstrahl folgt der Scroll-Richtung: Position = Fortschritt durch die Hero
      var beamPos = heroHeight > 0 ? Math.min(Math.max(y / heroHeight, 0), 1) : 0;
      hero.style.setProperty("--beam-pos", beamPos.toFixed(3));

      // Sanfter Parallax nur auf dem dekorativen Hero-Glow, solange sichtbar
      if (y < window.innerHeight) {
        hero.style.setProperty("--glow-shift", (y * 0.18).toFixed(1) + "px");
      }
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateScroll);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  updateScroll();

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
  var reveals = document.querySelectorAll(".reveal");

  // Stagger: jedem Reveal seinen Index innerhalb der Elterngruppe geben,
  // damit Karten in einem Grid nacheinander erscheinen (max. 6, damit späte
  // Elemente nicht zu lange warten).
  var groupCounts = new WeakMap();
  reveals.forEach(function (el) {
    var parent = el.parentElement;
    var idx = groupCounts.get(parent) || 0;
    el.style.setProperty("--i", Math.min(idx, 6));
    groupCounts.set(parent, idx + 1);
  });

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

  /* ---------- Anfrage-Funnel: Formular Schritt für Schritt ---------- */
  var funnel = null;
  if (form && form.classList.contains("funnel")) {
    funnel = (function () {
      var steps = [].slice.call(form.querySelectorAll(".funnel-step"));
      var bar = form.querySelector(".funnel-bar");
      var count = form.querySelector(".funnel-count");
      var summary = form.querySelector(".funnel-summary");
      var urlField = form.querySelector(".funnel-url");
      var done = form.querySelector(".funnel-done");
      var current = 0;
      var byPointer = false;

      function val(name) {
        var el = form.querySelector('input[name="' + name + '"]:checked');
        return el ? el.value : "";
      }

      function choiceText(name) {
        var el = form.querySelector('input[name="' + name + '"]:checked');
        return el ? el.parentNode.querySelector(".choice-box").textContent.trim() : "";
      }

      // Website-Check braucht keine Budget-Frage
      function isSkipped(step) {
        return step.getAttribute("data-step") === "4" && val("projekt") === "Kostenloser Website-Check";
      }

      function visibleSteps() {
        return steps.filter(function (s) { return !isSkipped(s); });
      }

      function isComplete(step) {
        var names = {};
        [].forEach.call(step.querySelectorAll('input[type="radio"]'), function (r) { names[r.name] = true; });
        return Object.keys(names).every(function (n) { return !!val(n); });
      }

      function render(focus) {
        var en = currentLang === "en";
        steps.forEach(function (s, i) {
          s.classList.toggle("is-active", i === current);
          // übersprungene Schritte weder prüfen noch senden
          var skip = isSkipped(s);
          [].forEach.call(s.querySelectorAll("input"), function (inp) { inp.disabled = skip; });
          var next = s.querySelector(".funnel-next");
          if (next) next.disabled = !isComplete(s);
        });
        if (urlField) urlField.hidden = val("website_vorhanden") !== "Ja";

        var vis = visibleSteps();
        var pos = vis.indexOf(steps[current]) + 1;
        bar.style.width = (pos / vis.length) * 100 + "%";
        count.textContent = (en ? "Step " : "Schritt ") + pos + (en ? " of " : " von ") + vis.length;

        if (steps[current].getAttribute("data-step") === "5") {
          summary.textContent = "";
          var parts = ["projekt", "branche", "budget", "zeitrahmen"].map(choiceText).filter(Boolean);
          if (parts.length) {
            summary.appendChild(document.createTextNode(en ? "Your selection: " : "Ihre Auswahl: "));
            parts.forEach(function (p, i) {
              if (i) summary.appendChild(document.createTextNode(" · "));
              var b = document.createElement("strong");
              b.textContent = p;
              summary.appendChild(b);
            });
          }
        }
        if (focus) {
          var title = steps[current].querySelector(".funnel-title");
          if (title) title.focus({ preventScroll: true });
          var top = form.getBoundingClientRect().top;
          if (top < 70) {
            window.scrollTo({ top: window.pageYOffset + top - 90, behavior: reduceMotion ? "auto" : "smooth" });
          }
        }
      }

      function go(dir) {
        var i = current + dir;
        while (i >= 0 && i < steps.length && isSkipped(steps[i])) i += dir;
        if (i < 0 || i >= steps.length) return;
        current = i;
        render(true);
      }

      form.classList.add("funnel-ready");

      // Klick/Touch auf eine Option springt weiter; Pfeiltasten nicht (Tastatur bestätigt mit „Weiter“)
      form.addEventListener("pointerdown", function (e) { byPointer = !!e.target.closest(".choice"); });
      form.addEventListener("keydown", function () { byPointer = false; });

      form.addEventListener("change", function (e) {
        if (e.target.type !== "radio") return;
        var step = steps[current];
        render(false);
        var wantsUrl = e.target.name === "website_vorhanden" && e.target.value === "Ja";
        if (byPointer && !wantsUrl && isComplete(step) && step.getAttribute("data-step") !== "5") {
          setTimeout(function () { if (steps[current] === step) go(1); }, 260);
        }
        byPointer = false;
      });

      form.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-funnel]");
        if (!btn) return;
        if (btn.getAttribute("data-funnel") === "back") go(-1);
        else if (isComplete(steps[current])) go(1);
      });

      document.addEventListener("luminary:lang", function () { render(false); });
      render(false);

      return {
        isLast: function () { return steps[current].getAttribute("data-step") === "5"; },
        next: function () { if (isComplete(steps[current])) go(1); },
        subject: function () {
          return "Neue Anfrage: " + [val("projekt"), val("branche")].filter(Boolean).join(" · ");
        },
        finish: function () {
          // Beim Website-Check ist der Termin nur zweite Wahl (andere Texte, Button dezenter)
          done.setAttribute("data-variant", val("projekt") === "Kostenloser Website-Check" ? "check" : "default");
          form.reset();
          current = 0;
          render(false);
          form.classList.add("is-done");
          done.hidden = false;
          done.focus();
        }
      };
    })();
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Enter in einem frühen Schritt = weiter, nicht absenden
      if (funnel && !funnel.isLast()) {
        funnel.next();
        return;
      }

      // Honeypot: still verwerfen
      var gotcha = form.querySelector('[name="_gotcha"]');
      if (gotcha && gotcha.value) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var subject = form.querySelector('[name="_subject"]');
      if (funnel && subject) subject.value = funnel.subject();

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
            setStatus("", "", "");
            if (funnel) {
              funnel.finish();
            } else {
              form.reset();
              setStatus(
                "ok",
                "Danke! Ihre Nachricht ist angekommen. Wir melden uns in der Regel innerhalb von 24 Stunden.",
                "Thank you! Your message has been received. We usually reply within 24 hours."
              );
            }
          } else {
            setStatus(
              "err",
              "Das hat leider nicht geklappt. Bitte versuchen Sie es erneut oder schreiben Sie an info@luminary-studio.at.",
              "Something went wrong. Please try again or email info@luminary-studio.at."
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
