(function () {
  "use strict";

  var cfg = window.LP_CONFIG || {};
  var waBase = "https://wa.me/" + String(cfg.whatsappNumber || "").replace(/\D/g, "");

  /* ---------- Links de WhatsApp e CRO ---------- */
  var defaultMsg = "Olá! Vim pelo site e gostaria de agendar uma avaliação com a Dra. Giovana.";
  document.querySelectorAll("[data-wa-link]").forEach(function (a) {
    a.href = waBase + "?text=" + encodeURIComponent(defaultMsg);
  });
  if (cfg.cro) {
    var croEl = document.querySelector("[data-cro]");
    if (croEl) croEl.textContent = " · " + cfg.cro;
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- CTA fixo: aparece depois do hero, some no formulário ---------- */
  var mobileCta = document.querySelector("[data-mobile-cta]");
  var hero = document.querySelector(".hero");
  var formSection = document.getElementById("agendar");
  if (mobileCta && hero && "IntersectionObserver" in window) {
    var heroVisible = true, formVisible = false;
    var update = function () { mobileCta.classList.toggle("is-visible", !heroVisible && !formVisible); };
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; update(); }, { threshold: 0.15 }).observe(hero);
    if (formSection) new IntersectionObserver(function (e) { formVisible = e[0].isIntersecting; update(); }, { threshold: 0.1 }).observe(formSection);
  } else if (mobileCta) {
    mobileCta.classList.add("is-visible");
  }

  /* ---------- Carrossel de casos ---------- */
  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var track = carousel.querySelector("[data-track]");
    var bar = carousel.querySelector("[data-progress]");
    var step = function () {
      var card = track.querySelector(".case");
      return card ? card.getBoundingClientRect().width + 14 : 300;
    };
    carousel.querySelector("[data-prev]").addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    carousel.querySelector("[data-next]").addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
    var syncBar = function () {
      var max = track.scrollWidth - track.clientWidth;
      var visible = track.clientWidth / track.scrollWidth;
      var pct = max > 0 ? track.scrollLeft / max : 0;
      bar.style.width = (visible * 100) + "%";
      bar.style.transform = "translateX(" + (pct * (1 / visible - 1) * 100) + "%)";
    };
    track.addEventListener("scroll", syncBar, { passive: true });
    window.addEventListener("resize", syncBar);
    syncBar();
  }

  /* ---------- Formulário ---------- */
  var form = document.getElementById("lead-form");
  if (!form) return;

  var phone = form.querySelector("#whatsapp");
  phone.addEventListener("input", function () {
    var d = phone.value.replace(/\D/g, "").slice(0, 11);
    var out;
    if (d.length <= 2) out = d ? "(" + d : "";
    else if (d.length <= 6) out = "(" + d.slice(0, 2) + ") " + d.slice(2);
    else if (d.length <= 10) out = "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    else out = "(" + d.slice(0, 2) + ") " + d.slice(2, 3) + " " + d.slice(3, 7) + "-" + d.slice(7);
    phone.value = out;
  });

  // Captura UTMs / gclid / fbclid para atribuição de campanha
  var params = new URLSearchParams(location.search);
  var tracking = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"].forEach(function (k) {
    if (params.get(k)) tracking[k] = params.get(k);
  });

  function setError(name, msg) {
    var input = form.querySelector("[name='" + name + "']");
    var field = input.closest(".field");
    var err = field ? field.querySelector(".field__error") : form.querySelector(".field__error--consent");
    if (field) field.classList.toggle("is-invalid", !!msg);
    if (err) err.textContent = msg || "";
    return !msg;
  }

  function validate() {
    var ok = true;
    var nome = form.nome.value.trim();
    var digits = phone.value.replace(/\D/g, "");
    ok = setError("nome", nome.length < 3 ? "Informe seu nome." : "") && ok;
    ok = setError("whatsapp", (digits.length < 10 || digits.length > 11) ? "Informe um WhatsApp válido com DDD." : "") && ok;
    ok = setError("consentimento", !form.consentimento.checked ? "Precisamos da sua autorização para entrar em contato." : "") && ok;
    return ok;
  }

  ["nome", "whatsapp"].forEach(function (n) {
    form[n].addEventListener("blur", function () { if (form[n].value) validate(); });
  });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (form.empresa.value) return; // honeypot preenchido = bot
    if (!validate()) {
      var firstInvalid = form.querySelector(".is-invalid input") || (!form.consentimento.checked && form.consentimento);
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var incomodos = Array.prototype.map.call(form.querySelectorAll("[name='incomodo']:checked"), function (c) { return c.value; });
    var digits = phone.value.replace(/\D/g, "");
    var lead = {
      nome: form.nome.value.trim(),
      whatsapp: "55" + digits,
      whatsapp_formatado: phone.value,
      interesse: form.interesse.value,
      incomodos: incomodos.join(", "),
      periodo: form.periodo.value,
      origem: "LP Resina — Dra. Giovana Canto",
      pagina: location.href.split("?")[0],
      data: new Date().toISOString()
    };
    Object.keys(tracking).forEach(function (k) { lead[k] = tracking[k]; });

    var btn = form.querySelector("button[type=submit]");
    var label = btn.querySelector(".btn__label");
    btn.disabled = true;
    label.textContent = "Enviando…";

    var msg =
      "Olá! Meu nome é " + lead.nome + " e vim pelo site. " +
      "Gostaria de agendar uma avaliação com a Dra. Giovana." +
      "\n\n• Interesse: " + lead.interesse +
      (lead.incomodos ? "\n• O que me incomoda: " + lead.incomodos : "") +
      "\n• Melhor período: " + lead.periodo;
    var waUrl = waBase + "?text=" + encodeURIComponent(msg);

    sendLead(lead).finally(function () {
      if (typeof window.fbq === "function") window.fbq("track", "Lead");
      if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { form: "avaliacao" });
      if (window.dataLayer) window.dataLayer.push({ event: "lead_submit" });

      form.hidden = true;
      var success = document.getElementById("form-success");
      success.hidden = false;
      document.getElementById("success-wa").href = waUrl;
      success.scrollIntoView({ behavior: "smooth", block: "center" });

      // Mesma aba: no celular abre direto o app do WhatsApp e não é bloqueado como pop-up
      if (cfg.redirectToWhatsapp) setTimeout(function () { window.location.href = waUrl; }, 900);
    });
  });

  function sendLead(lead) {
    if (!cfg.webhookUrl) return Promise.resolve();
    var body = JSON.stringify(lead);
    var timeout = new Promise(function (resolve) { setTimeout(resolve, 4000); });
    // text/plain evita preflight CORS (compatível com Google Apps Script, n8n, Make, Zapier)
    var req = fetch(cfg.webhookUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: body,
      keepalive: true
    }).catch(function () {
      if (navigator.sendBeacon) navigator.sendBeacon(cfg.webhookUrl, body);
    });
    return Promise.race([req, timeout]);
  }
})();
