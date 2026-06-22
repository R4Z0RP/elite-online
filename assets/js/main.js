/* =====================================================================
   ELITE Online Comunicaciones — main.js
   ===================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     ⚙️  DATOS DE CONTACTO — EDITA SOLO AQUÍ (se aplican a todo el sitio)
     ------------------------------------------------------------------ */
  const CONTACT = {
    waNumber: "573138903717",            // WhatsApp: solo dígitos, con indicativo país (57 = Colombia)
    waDisplay: "+57 313 890 3717",       // WhatsApp como se muestra
    phoneTel: "+573138903717",           // Teléfono para enlace tel:
    phoneDisplay: "+57 313 890 3717",    // Teléfono como se muestra
    email: "info@eliteonline.com.co",    // Correo
    address: "Calle 69 Bis A # 68 F - 44",      // Dirección (calle)
    addressCity: "Bogotá, Colombia"             // Ciudad / país — cambia si no es Bogotá
  };
  const WA_DEFAULT_TEXT = "Hola ELITE Online \u{1F44B}, quiero información sobre sus servicios.";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const waLink = (text) =>
    `https://wa.me/${CONTACT.waNumber}?text=${encodeURIComponent(text || WA_DEFAULT_TEXT)}`;

  /* ---------------------- Wire up contact data ---------------------- */
  function applyContact() {
    $$(".js-wa").forEach((a) => { a.href = waLink(); a.target = "_blank"; a.rel = "noopener"; });
    $$(".js-wa-num").forEach((el) => (el.textContent = CONTACT.waDisplay));
    $$(".js-tel").forEach((a) => (a.href = "tel:" + CONTACT.phoneTel));
    $$(".js-tel-num").forEach((el) => (el.textContent = CONTACT.phoneDisplay));
    $$(".js-mail").forEach((a) => (a.href = "mailto:" + CONTACT.email));
    $$(".js-mail-addr").forEach((el) => (el.textContent = CONTACT.email));

    var mapQ = encodeURIComponent(CONTACT.address + ", " + CONTACT.addressCity);
    $$(".js-address").forEach((el) => (el.textContent = CONTACT.address));
    $$(".js-address-city").forEach((el) => (el.textContent = CONTACT.addressCity));
    $$(".js-map").forEach((a) => {
      a.href = "https://www.google.com/maps/search/?api=1&query=" + mapQ;
      a.target = "_blank";
      a.rel = "noopener";
    });
    $$(".js-map-embed").forEach((f) => {
      f.src = "https://maps.google.com/maps?q=" + mapQ + "&z=16&output=embed";
    });
  }

  /* --------------------------- Header ------------------------------ */
  function initHeader() {
    const header = $("#header");
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------- Mobile menu --------------------------- */
  function initMobileMenu() {
    const menu = $("#mobileMenu");
    const burger = $("#burger");
    const close = $("#burgerClose");
    if (!menu || !burger) return;
    const setOpen = (open) => {
      menu.classList.toggle("open", open);
      menu.setAttribute("aria-hidden", String(!open));
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => setOpen(true));
    close && close.addEventListener("click", () => setOpen(false));
    $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  /* --------------------- Audience segmented toggle ----------------- */
  function initAudience() {
    const seg = $(".seg");
    if (!seg) return;
    const thumb = $(".seg-thumb", seg);
    const buttons = $$("button", seg);
    const heroLabel = $("[data-aud-label]");
    const heroCta = $("[data-aud-cta]");
    const labels = {
      hogar: "Internet para mi hogar",
      empresa: "Soluciones para empresa"
    };

    function moveThumb(btn) {
      if (!thumb || !btn || btn.offsetWidth === 0) return;
      thumb.style.left = btn.offsetLeft + "px";
      thumb.style.width = btn.offsetWidth + "px";
    }
    function setAudience(aud, btn) {
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      moveThumb(btn);
      if (heroLabel) heroLabel.textContent = labels[aud] || labels.hogar;
      if (heroCta) heroCta.setAttribute("data-aud", aud);
      const typeSel = $("#f-type");
      if (typeSel && (aud === "hogar" || aud === "empresa")) {
        typeSel.value = aud === "hogar" ? "Hogar" : "Empresa";
      }
    }
    buttons.forEach((b) =>
      b.addEventListener("click", () => setAudience(b.dataset.aud, b))
    );
    const active = buttons.find((b) => b.getAttribute("aria-pressed") === "true") || buttons[0];
    requestAnimationFrame(() => moveThumb(active));
    window.addEventListener("resize", () => {
      const cur = buttons.find((b) => b.getAttribute("aria-pressed") === "true");
      moveThumb(cur);
    });
  }

  /* ------------------- Prefill form from CTAs ---------------------- */
  function initPrefill() {
    $$("[data-prefill]").forEach((el) =>
      el.addEventListener("click", () => {
        const val = el.dataset.prefill;
        const typeSel = $("#f-type");
        const svcSel = $("#f-service");
        if (val === "Hogar" || val === "Empresa") {
          if (typeSel) typeSel.value = val;
        } else if (svcSel) {
          const opt = $$("option", svcSel).find((o) => o.value === val);
          if (opt) svcSel.value = val;
        }
        setTimeout(() => { const n = $("#f-name"); if (n) n.focus({ preventScroll: true }); }, 600);
      })
    );
  }

  /* ----------------------- Reveal on scroll ------------------------ */
  function initReveal() {
    const items = $$(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  /* -------------------------- Counters ----------------------------- */
  function animateCount(el) {
    const raw = el.getAttribute("data-count");
    const target = parseFloat(raw);
    const decimals = raw.indexOf(".") > -1 ? 1 : 0;
    const suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
    const dur = 1500;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }
  function initCounters() {
    const nums = $$("[data-count]");
    if (!("IntersectionObserver" in window)) { nums.forEach(animateCount); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { animateCount(e.target); io.unobserve(e.target); }
      }),
      { threshold: 0.6 }
    );
    nums.forEach((el) => io.observe(el));
  }

  /* ------------------------- Speed ring ---------------------------- */
  function initSpeedRing() {
    const ring = $("#speedRing");
    const bar = $("#speedBar");
    const num = $("#speedNum");
    if (!ring || !bar || !num) return;
    const C = 2 * Math.PI * 70; // ~439.8
    bar.style.strokeDasharray = C;
    const target = 900, max = 1000;
    const offset = C * (1 - target / max);
    const run = () => {
      if (reduceMotion) { bar.style.strokeDashoffset = offset; num.textContent = target; return; }
      requestAnimationFrame(() => (bar.style.strokeDashoffset = offset));
      const start = performance.now(), dur = 1600;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        num.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { run(); io.disconnect(); }
      }), { threshold: 0.4 });
      io.observe(ring);
    } else run();
  }

  /* --------------------------- Form -------------------------------- */
  function initForm() {
    const form = $("#contactForm");
    if (!form) return;
    const toast = $("#formToast");
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const setInvalid = (field, bad) => field.classList.toggle("invalid", bad);

    function validate() {
      let ok = true, firstBad = null;
      const checks = [
        ["#f-name", (v) => v.trim().length >= 2],
        ["#f-phone", (v) => (v.replace(/\D/g, "").length >= 7)],
        ["#f-email", (v) => emailRe.test(v.trim())],
        ["#f-type", (v) => v !== ""]
      ];
      checks.forEach(([sel, fn]) => {
        const input = $(sel);
        const field = input.closest(".field");
        const bad = !fn(input.value);
        setInvalid(field, bad);
        if (bad) { ok = false; if (!firstBad) firstBad = input; }
      });
      if (firstBad) firstBad.focus({ preventScroll: false });
      return ok;
    }

    // Clear error on input
    $$(".field input, .field select, .field textarea", form).forEach((el) =>
      el.addEventListener("input", () => el.closest(".field").classList.remove("invalid"))
    );

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) return;
      const v = (id) => (($(id) || {}).value || "").trim();
      const msg =
        "*Nueva solicitud — ELITE Online*\n\n" +
        "*Nombre:* " + v("#f-name") + "\n" +
        "*Teléfono:* " + v("#f-phone") + "\n" +
        "*Correo:* " + v("#f-email") + "\n" +
        "*Tipo de cliente:* " + v("#f-type") + "\n" +
        "*Servicio:* " + v("#f-service") + "\n" +
        "*Mensaje:* " + (v("#f-msg") || "—");
      window.open(waLink(msg), "_blank", "noopener");
      if (toast) {
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 7000);
      }
      form.reset();
      const t = $("#f-type"); if (t) t.selectedIndex = 0;
    });
  }

  /* ---------------------------- Misc ------------------------------- */
  function initMisc() {
    const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------------------------- Boot ------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    applyContact();
    initHeader();
    initMobileMenu();
    initAudience();
    initPrefill();
    initReveal();
    initCounters();
    initSpeedRing();
    initForm();
    initMisc();
  });
})();
