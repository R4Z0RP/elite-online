/* ELITE — premium enhancement layer (loads after main.js) */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- Grain overlay ---- */
  var grain = document.createElement("div");
  grain.className = "fx-grain";
  grain.setAttribute("aria-hidden", "true");
  document.body.appendChild(grain);

  /* ---- Scroll progress bar ---- */
  var sp = document.createElement("div");
  sp.className = "scroll-progress";
  sp.setAttribute("aria-hidden", "true");
  sp.innerHTML = "<i></i>";
  document.body.appendChild(sp);
  var bar = sp.firstChild;
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Cursor spotlight on cards (desktop / fine-pointer only) ---- */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    $$(".svc-card, .why-card, .aud-card, .pillar").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  /* ====================== Service detail modal ====================== */
  var WA_PATH = "M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24z";
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  var DATA = {
    "Internet de Fibra Óptica": {
      tag: "Fibra simétrica de última generación",
      desc: "Conexión de fibra óptica directa a tu hogar o empresa, con velocidades simétricas reales: la misma velocidad de bajada y de subida. Pensada para teletrabajo, streaming 4K, gaming competitivo y operaciones críticas sin interrupciones.",
      features: ["Velocidad simétrica garantizada (carga = descarga)", "Baja latencia para gaming y videollamadas", "WiFi inteligente con cobertura en todo el lugar", "Planes residenciales y canales dedicados para empresa", "Instalación profesional y soporte técnico 24/7"],
      service: "Internet de Fibra Óptica"
    },
    "Seguridad Informática": {
      tag: "Tu operación, blindada de extremo a extremo",
      desc: "Protección perimetral y de endpoints con tecnología líder de la industria. Firewalls de nueva generación, VPN, control de aplicaciones y monitoreo continuo para mantener tu información y la de tus clientes a salvo.",
      features: ["Firewalls de nueva generación con Fortinet", "Protección avanzada de endpoints con Sophos", "VPN segura para acceso remoto", "Filtrado web y control de aplicaciones", "Monitoreo y respuesta ante incidentes 24/7"],
      service: "Seguridad Informática"
    },
    "Servicios de Data Center": {
      tag: "Infraestructura segura, escalable y de alto rendimiento",
      desc: "Alojamiento de servidores, respaldo y conectividad de alta velocidad en centros de datos propios, con 99.9% de disponibilidad garantizada, energía redundante y monitoreo permanente.",
      features: ["Alojamiento de servidores (colocation)", "Respaldo y recuperación ante desastres", "Conectividad de alta velocidad y baja latencia", "99.9% de disponibilidad garantizada", "Monitoreo 24/7 y energía redundante"],
      service: "Servicios de Data Center"
    },
    "Cableado Estructurado": {
      tag: "Infraestructura física que cumple los más altos estándares",
      desc: "Diseño e instalación de cableado estructurado certificado para redes ordenadas, eficientes y listas para escalar. Cobre y fibra óptica, con certificación de cada enlace y garantía de fábrica.",
      features: ["Instaladores certificados Panduit (PCI)", "CommScope SYSTIMAX y Leviton", "Cableado de cobre y fibra óptica", "Certificación y pruebas de cada enlace", "Garantía de fábrica de larga duración"],
      service: "Cableado Estructurado"
    },
    "Migraciones a la Nube": {
      tag: "Lleva tu operación a la nube sin fricción",
      desc: "Migramos tu infraestructura y aplicaciones a la nube (AWS, Odoo, Moodle) con planes de recuperación ante desastres a la medida. Reduce costos, gana continuidad y escala cuando lo necesites.",
      features: ["Migración a AWS y nube híbrida", "Implementación de Odoo (ERP) y Moodle (LMS)", "Planes de recuperación ante desastres (DRP)", "Optimización de costos operativos", "Acompañamiento y soporte continuo"],
      service: "Migraciones a la Nube"
    },
    "KRONOX · Rastreo GPS": {
      tag: "El rastreo ha evolucionado",
      desc: "Plataforma de monitoreo y control de flota en tiempo real. Integra monitoreo, control y seguimiento vehicular desde una sola plataforma, para una gestión más clara, segura y eficiente de tu operación.",
      features: ["Monitoreo en tiempo real de toda la flota", "Alertas operativas para una respuesta más rápida", "Historial de rutas y recorridos", "Visualización centralizada en mapa", "Informes completos de ubicación y uso"],
      service: "KRONOX (rastreo GPS)"
    }
  };

  var modal = null;
  var lastFocus = null;

  function buildModal() {
    modal = document.createElement("div");
    modal.className = "svc-modal";
    modal.id = "svcModal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML =
      '<div class="svc-modal__overlay" data-close></div>' +
      '<div class="svc-modal__panel" role="dialog" aria-modal="true" aria-labelledby="svcModalTitle">' +
        '<button class="svc-modal__close" data-close type="button" aria-label="Cerrar ventana"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
        '<div class="svc-modal__head"><div class="svc-modal__ic" id="svcModalIc" aria-hidden="true"></div><div><div class="svc-modal__tag" id="svcModalTag"></div><h3 id="svcModalTitle"></h3></div></div>' +
        '<p class="svc-modal__desc" id="svcModalDesc"></p>' +
        '<ul class="svc-modal__features" id="svcModalFeatures"></ul>' +
        '<div class="svc-modal__tags" id="svcModalTags"></div>' +
        '<div class="svc-modal__cta">' +
          '<a class="btn btn-primary" id="svcModalQuote" href="#contacto">Cotizar este servicio</a>' +
          '<a class="btn btn-wa" id="svcModalWa" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="' + WA_PATH + '"/></svg> Escríbenos</a>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    $$("[data-close]", modal).forEach(function (el) { el.addEventListener("click", closeModal); });
    document.addEventListener("keydown", function (e) {
      if (!modal.classList.contains("open")) return;
      if (e.key === "Escape") closeModal();
      else if (e.key === "Tab") trap(e);
    });
  }

  function openModal(card) {
    if (!modal) buildModal();
    var h3 = card.querySelector("h3");
    var title = h3 ? h3.textContent.trim() : "";
    var d = DATA[title];
    if (!d) return;
    lastFocus = document.activeElement;

    $("#svcModalTag", modal).textContent = d.tag;
    $("#svcModalTitle", modal).textContent = title;
    $("#svcModalDesc", modal).textContent = d.desc;

    var ic = $("#svcModalIc", modal);
    var srcIc = card.querySelector(".svc-ic");
    ic.innerHTML = srcIc ? srcIc.innerHTML : "";

    $("#svcModalFeatures", modal).innerHTML = d.features.map(function (f) {
      return "<li>" + CHECK + "<span>" + f + "</span></li>";
    }).join("");

    var tags = $$(".svc-tags span", card).map(function (s) { return s.textContent; });
    $("#svcModalTags", modal).innerHTML = tags.map(function (t) { return "<span>" + t + "</span>"; }).join("");

    // WhatsApp CTA reuses the wired floating-button href
    var fab = $(".fab-wa.js-wa");
    $("#svcModalWa", modal).setAttribute("href", fab ? fab.getAttribute("href") : "#contacto");

    // Quote CTA preselects the service and jumps to the contact form
    $("#svcModalQuote", modal).onclick = function (e) {
      e.preventDefault();
      closeModal();
      var sel = $("#f-service");
      if (sel) {
        var match = $$("option", sel).filter(function (o) { return o.value === d.service; })[0];
        if (match) sel.value = d.service;
      }
      var target = $("#contacto");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(function () { var n = $("#f-name"); if (n) n.focus({ preventScroll: true }); }, 520);
    };

    document.body.style.overflow = "hidden";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(function () { var c = $(".svc-modal__close", modal); if (c) c.focus(); }, 60);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
    lastFocus = null;
  }

  function trap(e) {
    var f = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', modal)
      .filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // Wire each service card
  $$(".svc-card").forEach(function (card) {
    var h3 = card.querySelector("h3");
    if (!h3 || !DATA[h3.textContent.trim()]) return;
    card.classList.add("svc-clickable");

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "svc-expand";
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-label", "Ver detalles de " + h3.textContent.trim());
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
    card.appendChild(btn);

    card.addEventListener("click", function (e) { e.preventDefault(); openModal(card); });
  });

  /* ====================== Hero animated network ====================== */
  function initHeroNet() {
    var hero = $(".hero");
    if (!hero || reduce) return;
    var canvas = document.createElement("canvas");
    canvas.className = "hero-net";
    canvas.setAttribute("aria-hidden", "true");
    hero.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var w, h, dpr, nodes = [], mouse = { x: -9999, y: -9999 };
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(Math.round(w / 16), 80);
      if (w < 600) count = Math.min(count, 38);
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4 });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      var i, j;
      for (i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(65,227,255,0.7)"; ctx.fill();
      }
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = "rgba(34,166,255," + (0.16 * (1 - d / 130)) + ")"; ctx.lineWidth = 1; ctx.stroke(); }
        }
        var mx = nodes[i].x - mouse.x, my = nodes[i].y - mouse.y, dm = Math.sqrt(mx * mx + my * my);
        if (dm < 170) { ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.strokeStyle = "rgba(65,227,255," + (0.25 * (1 - dm / 170)) + ")"; ctx.lineWidth = 1; ctx.stroke(); }
      }
      requestAnimationFrame(tick);
    }
    hero.addEventListener("mousemove", function (e) { var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener("mouseleave", function () { mouse.x = -9999; mouse.y = -9999; });
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 200); });
    size();
    tick();
  }
  initHeroNet();

  /* ==================== Speed playground (interactivo) ============== */
  (function initSpeedLab() {
    var range = $("#slRange");
    if (!range) return;
    var bar = $("#slBar");
    var numEl = $("#slNum");
    var tiers = $$(".sl-tier");
    var C = 439.8; // 2*PI*r, r = 70
    var MIN = 100, MAX = 900;

    function fmtTime(s) {
      if (s < 1) return "<1 s";
      if (s < 90) return Math.round(s) + " s";
      var m = s / 60;
      if (m < 60) return (m < 10 ? m.toFixed(1) : Math.round(m)) + " min";
      return (m / 60).toFixed(1) + " h";
    }
    function fmtInt(n) { return Math.round(n) + ""; }
    function fmtMs(n) { return Math.round(n) + " ms"; }

    var OUT = {
      movie:   { calc: function (s) { return 112000 / s; }, fmt: fmtTime },
      game:    { calc: function (s) { return 640000 / s; }, fmt: fmtTime },
      streams: { calc: function (s) { return Math.floor(s / 25); }, fmt: fmtInt },
      devices: { calc: function (s) { return Math.floor(s / 15); }, fmt: fmtInt },
      backup:  { calc: function (s) { return 800000 / s; }, fmt: fmtTime },
      ping:    { calc: function (s) { return Math.max(4, Math.round(13 - s / 110)); }, fmt: fmtMs }
    };

    var cards = {};
    Object.keys(OUT).forEach(function (k) {
      var el = $('[data-out="' + k + '"]');
      if (el) { cards[k] = el; el._cur = OUT[k].calc(MAX); }
    });

    function tween(el, to, fmt) {
      if (reduce) { el._cur = to; el.textContent = fmt(to); return; }
      var from = el._cur, t0 = performance.now(), dur = 450;
      if (el._raf) cancelAnimationFrame(el._raf);
      el._raf = requestAnimationFrame(function step(now) {
        var p = Math.min((now - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        el._cur = from + (to - from) * e;
        el.textContent = fmt(el._cur);
        if (p < 1) el._raf = requestAnimationFrame(step);
        else { el._cur = to; el.textContent = fmt(to); }
      });
    }

    function render(s, animate) {
      numEl.textContent = s;
      if (bar) bar.style.strokeDashoffset = (C * (1 - s / MAX)).toFixed(1);
      range.style.setProperty("--p", ((s - MIN) / (MAX - MIN) * 100).toFixed(1) + "%");
      Object.keys(OUT).forEach(function (k) {
        var el = cards[k]; if (!el) return;
        var to = OUT[k].calc(s);
        if (animate) tween(el, to, OUT[k].fmt);
        else { el._cur = to; el.textContent = OUT[k].fmt(to); }
      });
      tiers.forEach(function (t) { t.classList.toggle("is-on", +t.getAttribute("data-mbps") === s); });
    }

    range.addEventListener("input", function () { render(+range.value, true); });
    tiers.forEach(function (t) {
      t.addEventListener("click", function () {
        var v = +t.getAttribute("data-mbps");
        range.value = v;
        render(v, true);
      });
    });

    render(+range.value, false);
  })();
})();
