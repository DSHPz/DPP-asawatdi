/*
 * Harborview Realty: progressive enhancements
 *
 *  - Light / dark theme toggle (remembers the visitor's choice)
 *  - Header shadow once the page is scrolled
 *  - Scroll reveal for sections below the fold
 *  - Count-up for the track-record numbers
 *  - Favorites (hearts on listings, saved in localStorage)
 *  - Monthly payment estimator on the property page
 *
 * Every feature is optional: pages work without this file, and all motion
 * is skipped when the visitor prefers reduced motion.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var THEME_KEY = "hv-theme";
  var FAVORITES_KEY = "hv-favorites";

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* storage unavailable (private mode, blocked): fail silently */
    }
  }

  /* Polite screen-reader announcements */
  var liveRegion = null;
  function announce(message) {
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.className = "visually-hidden";
      liveRegion.setAttribute("role", "status");
      liveRegion.setAttribute("aria-live", "polite");
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = "";
    window.setTimeout(function () {
      liveRegion.textContent = message;
    }, 50);
  }

  /* ---------- Theme toggle ---------- */
  function initTheme() {
    var button = document.querySelector(".theme-toggle");
    if (!button) return;

    var root = document.documentElement;
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)");

    function isDark() {
      var explicit = root.getAttribute("data-theme");
      return explicit ? explicit === "dark" : systemDark.matches;
    }

    function sync() {
      button.setAttribute("aria-pressed", String(isDark()));
    }

    button.hidden = false;
    sync();

    button.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      writeStorage(THEME_KEY, next);
      sync();
    });

    // Keep every already-open page in sync when another tab changes the theme.
    window.addEventListener("storage", function (event) {
      if (event.key !== THEME_KEY && event.key !== null) return;

      if (event.newValue === "dark" || event.newValue === "light") {
        root.setAttribute("data-theme", event.newValue);
      } else {
        // A cleared or removed preference means the system setting applies.
        root.removeAttribute("data-theme");
      }
      sync();
    });

    if (systemDark.addEventListener) {
      systemDark.addEventListener("change", sync);
    }
  }

  /* ---------- Header shadow ---------- */
  function initHeaderShadow() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    if (reduceMotion.matches || !("IntersectionObserver" in window)) return;

    var selector = [
      ".section-heading",
      ".stat-card",
      ".property-card",
      ".team-card",
      ".split > *",
      ".cta-banner",
      ".agent-card",
      ".calc-card",
      ".detail-facts",
    ].join(",");

    var siblingCount = new Map();
    var targets = [];

    document.querySelectorAll(selector).forEach(function (el) {
      if (el.closest(".hero")) return;
      // Anything already on screen stays put: no flash, no pointless motion.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

      var parent = el.parentElement;
      var index = siblingCount.get(parent) || 0;
      siblingCount.set(parent, index + 1);

      var delay = Math.min(index, 3) * 90;
      el.style.setProperty("--reveal-delay", delay + "ms");
      el.classList.add("reveal");
      targets.push({ el: el, delay: delay });
    });

    if (!targets.length) return;

    var byElement = new Map(
      targets.map(function (t) {
        return [t.el, t];
      })
    );

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var target = byElement.get(entry.target);
          observer.unobserve(entry.target);
          entry.target.classList.add("is-visible");

          // Hand the element back to its normal styles (hover effects etc.)
          window.setTimeout(function () {
            entry.target.classList.remove("reveal", "is-visible");
            entry.target.style.removeProperty("--reveal-delay");
          }, 800 + target.delay);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach(function (t) {
      observer.observe(t.el);
    });
  }

  /* ---------- Count-up ---------- */
  function animateCount(item) {
    var start = null;
    var duration = 1400;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      item.visual.textContent = Math.round(item.value * eased) + item.suffix;
      if (progress < 1) window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  function initCountUp() {
    if (reduceMotion.matches || !("IntersectionObserver" in window)) return;

    var items = [];
    document.querySelectorAll(".stat-card strong").forEach(function (el) {
      var match = el.textContent.trim().match(/^(\d+)(\D*)$/);
      if (!match) return;

      // Screen readers always get the real number; only the visual part animates.
      var finalText = el.textContent.trim();
      var readable = document.createElement("span");
      readable.className = "visually-hidden";
      readable.textContent = finalText;

      var visual = document.createElement("span");
      visual.setAttribute("aria-hidden", "true");
      visual.textContent = "0" + match[2];

      el.textContent = "";
      el.appendChild(readable);
      el.appendChild(visual);

      items.push({
        el: el,
        visual: visual,
        value: parseInt(match[1], 10),
        suffix: match[2],
      });
    });

    if (!items.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          items.forEach(function (item) {
            if (item.el === entry.target) animateCount(item);
          });
        });
      },
      { threshold: 0.6 }
    );

    items.forEach(function (item) {
      observer.observe(item.el);
    });
  }

  /* ---------- Favorites ---------- */
  function initFavorites() {
    var buttons = Array.prototype.slice.call(
      document.querySelectorAll("[data-favorite-id]")
    );
    if (!buttons.length) return;

    function read() {
      try {
        var parsed = JSON.parse(readStorage(FAVORITES_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    var saved = new Set(read());

    function paint() {
      buttons.forEach(function (button) {
        button.setAttribute(
          "aria-pressed",
          String(saved.has(button.getAttribute("data-favorite-id")))
        );
      });
    }

    function refresh() {
      saved = new Set(read());
      paint();
    }

    buttons.forEach(function (button) {
      button.hidden = false;
      button.addEventListener("click", function () {
        var id = button.getAttribute("data-favorite-id");
        var name = button.getAttribute("data-favorite-name") || "Listing";
        var nowSaved = !saved.has(id);

        if (nowSaved) saved.add(id);
        else saved.delete(id);

        writeStorage(FAVORITES_KEY, JSON.stringify(Array.from(saved)));
        paint();
        announce(
          nowSaved
            ? "Saved " + name + " to favorites"
            : "Removed " + name + " from favorites"
        );
      });
    });

    // Keep other open tabs in sync
    window.addEventListener("storage", function (event) {
      if (event.key === FAVORITES_KEY) {
        refresh();
      }
    });

    // Re-read saved items when a page is restored from the back-forward cache.
    window.addEventListener("pageshow", refresh);

    paint();
  }

  /* ---------- Mortgage estimator ---------- */
  function initMortgage() {
    var root = document.querySelector("[data-mortgage-calculator]");
    if (!root) return;

    var section = root.closest("section");
    var price = root.querySelector("#calc-price");
    var down = root.querySelector("#calc-down");
    var rate = root.querySelector("#calc-rate");
    var term = root.querySelector("#calc-term");
    var form = root.querySelector("form");
    var outPayment = root.querySelector("[data-calc-output]");
    var outDown = root.querySelector("[data-calc-down]");
    var outLoan = root.querySelector("[data-calc-loan]");
    var outInterest = root.querySelector("[data-calc-interest]");

    var money = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

    function value(input) {
      var n = parseFloat(input.value);
      return isFinite(n) ? n : NaN;
    }

    function compute() {
      var p = value(price);
      var d = value(down);
      var r = value(rate);
      var years = value(term);

      var valid = p > 0 && d >= 0 && d <= 100 && r >= 0 && r <= 25 && years > 0;
      if (!valid) {
        [outPayment, outDown, outLoan, outInterest].forEach(function (el) {
          el.textContent = "—";
        });
        return;
      }

      var downAmount = (p * d) / 100;
      var loan = p - downAmount;
      var months = years * 12;
      var monthlyRate = r / 100 / 12;

      var payment;
      if (loan === 0) payment = 0;
      else if (monthlyRate === 0) payment = loan / months;
      else
        payment =
          (loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

      outPayment.textContent = money.format(payment);
      outDown.textContent = money.format(downAmount);
      outLoan.textContent = money.format(loan);
      outInterest.textContent = money.format(Math.max(payment * months - loan, 0));
    }

    var timer = null;
    function schedule() {
      window.clearTimeout(timer);
      timer = window.setTimeout(compute, 350);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      compute();
    });
    root.addEventListener("input", schedule);
    root.addEventListener("change", compute);

    if (section) section.hidden = false;
    compute();
    // Announce only user-driven updates, not the initial value
    outPayment.setAttribute("aria-live", "polite");
  }

  function init() {
    [
      initTheme,
      initHeaderShadow,
      initReveal,
      initCountUp,
      initFavorites,
      initMortgage,
    ].forEach(function (fn) {
      try {
        fn();
      } catch (error) {
        if (window.console) console.error("[enhancements]", fn.name, error);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
