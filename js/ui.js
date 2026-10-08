/* =========================================================
   YOUSS CONNECT — KIT UI PARTAGÉ
   Identité : noir, blanc, or, gris. Portée par KYA CORPORATION.
   Tous les composants retournent du HTML (chaînes) ; les données
   utilisateur passent par esc() / escAttr().
   ========================================================= */
(function () {
  "use strict";

  const t = (k) => window.I18N ? I18N.t(k) : k;

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  const escAttr = esc;
  /* Sérialise des params pour un onclick inline */
  function js(params) { return esc(JSON.stringify(params || {})); }
  function go(route, params) { return `App.nav('${route}', ${js(params)})`; }

  function icon(name, cls, fill) {
    return `<span class="ms ${fill ? "fill" : ""} ${cls || ""}" aria-hidden="true">${name}</span>`;
  }

  /* ---------- Boutons ---------- */
  function button(label, onclick, opts) {
    opts = opts || {};
    const variant = opts.variant || "primary";
    const size = opts.size === "sm" ? "btn-sm" : opts.size === "lg" ? "btn-lg" : "";
    const cls = `btn btn-${variant} ${size} ${opts.block === false ? "" : "btn-block"} ${opts.cls || ""}`;
    const ic = opts.icon ? icon(opts.icon, "text-[20px]") : "";
    return `<button type="button" onclick="${onclick}" class="${cls}" ${opts.disabled ? "disabled" : ""} ${opts.id ? `id="${opts.id}"` : ""}>${opts.iconRight ? "" : ic}<span>${label}</span>${opts.iconRight ? icon(opts.iconRight, "text-[20px]") : ""}</button>`;
  }
  const primaryButton = (label, onclick, opts) => button(label, onclick, Object.assign({ variant: "primary" }, opts));
  const secondaryButton = (label, onclick, opts) => button(label, onclick, Object.assign({ variant: "outline" }, opts));
  const darkButton = (label, onclick, opts) => button(label, onclick, Object.assign({ variant: "dark" }, opts));
  function iconButton(name, onclick, label, cls) {
    return `<button type="button" onclick="${onclick}" class="icon-btn ${cls || ""}" aria-label="${escAttr(label || name)}" title="${escAttr(label || "")}">${icon(name)}</button>`;
  }

  /* ---------- Badges, puces ---------- */
  function badge(text, tone) {
    const map = { success: "badge-success", primary: "badge-dark", dark: "badge-dark", gold: "badge-gold", warn: "badge-warn", danger: "badge-danger", neutral: "badge-neutral" };
    return `<span class="badge ${map[tone] || "badge-neutral"}">${text}</span>`;
  }
  function chip(label, onclick, on, opts) {
    opts = opts || {};
    return `<button type="button" onclick="${onclick}" class="chip ${opts.gold ? "chip-gold" : ""} ${on ? "on" : ""}" aria-pressed="${on ? "true" : "false"}">${opts.icon ? icon(opts.icon, "text-[16px]") : ""}${label}</button>`;
  }
  function stars(rating, cls) {
    const r = Math.round((rating || 0) * 2) / 2;
    let out = "";
    for (let i = 1; i <= 5; i++) out += icon("star", (i <= r ? "text-gold" : "text-line") + " text-[14px]", i <= r);
    return `<span class="inline-flex items-center ${cls || ""}" aria-label="${r} sur 5">${out}</span>`;
  }
  function rating(value, count) {
    return `<span class="inline-flex items-center gap-1 t-small font-semibold">${icon("star", "text-gold text-[15px]", true)}${value}${count != null ? `<span class="text-ink-3 font-normal">(${count})</span>` : ""}</span>`;
  }

  /* ---------- Images & avatars ---------- */
  function img(src, alt, cls, opts) {
    opts = opts || {};
    return `<img src="${escAttr(src)}" alt="${escAttr(alt || "")}" class="${cls || "img-cover"} ${opts.fade === false ? "" : "img-fade"}" loading="${opts.eager ? "eager" : "lazy"}" decoding="async" onerror="this.onerror=null;this.src='./assets/img/brand/placeholder.svg'"/>`;
  }
  function avatar(person, sizeCls) {
    const size = sizeCls || "w-10 h-10";
    if (person && person.avatar) {
      return `<img src="${escAttr(person.avatar)}" alt="${escAttr(person.name || "")}" class="${size} rounded-full object-cover flex-shrink-0 bg-card-high" loading="lazy"/>`;
    }
    const initials = String((person && person.name) || "?").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    return `<span class="${size} rounded-full bg-inverse text-inverse-ink flex items-center justify-center font-bold flex-shrink-0" aria-hidden="true">${initials}</span>`;
  }

  /* ---------- Titres de section ---------- */
  function sectionTitle(title, action, onclick, sub) {
    return `<div class="flex items-end justify-between gap-3 mb-3">
      <div><h2 class="t-h2">${title}</h2>${sub ? `<p class="t-small text-ink-2 mt-0.5">${sub}</p>` : ""}</div>
      ${action ? `<button type="button" onclick="${onclick}" class="t-small font-bold text-gold-deep dark:text-gold hover:underline whitespace-nowrap">${action}</button>` : ""}
    </div>`;
  }

  /* ---------- Cartes métier réutilisées sur Accueil / Explorer / Destination ---------- */
  function restaurantCard(r, compact) {
    return `<button type="button" onclick="${go("restaurantDetail", { id: r.id })}" class="card card-press overflow-hidden text-left w-full ${compact ? "min-w-[240px] lg:min-w-0" : ""}">
      <div class="relative ${compact ? "h-32" : "ratio-16-10"} bg-card-high overflow-hidden">${img(r.img, r.name)}
        <span class="absolute top-2.5 left-2.5 badge badge-dark">${r.time}</span>
        <span class="absolute top-2.5 right-2.5 badge bg-white/95 text-ink">${icon("star", "text-gold text-[14px]", true)}${r.rating}</span>
      </div>
      <div class="p-3.5">
        <div class="flex items-start justify-between gap-2"><h3 class="t-title truncate">${r.name}</h3><span class="t-small text-ink-2 whitespace-nowrap">${r.km} km</span></div>
        <p class="t-small text-ink-2 truncate mt-0.5">${r.cat} · ${r.area}, ${r.city} · ~${ACStore.fmtFCFA(r.avg)}</p>
      </div>
    </button>`;
  }
  function productCard(p) {
    const seller = YCData.seller(p.seller);
    const out = p.stock === 0;
    return `<div class="card card-press overflow-hidden flex flex-col">
      <button type="button" onclick="${go("productDetail", { id: p.id })}" class="relative ratio-1-1 bg-card-high overflow-hidden text-left">${img(p.img, p.name)}
        ${p.old ? `<span class="absolute top-2.5 left-2.5 badge badge-gold">-${Math.round(100 - (p.price / p.old) * 100)} %</span>` : ""}
        ${out ? `<span class="absolute inset-0 bg-black/45 flex items-center justify-center"><span class="badge badge-dark">Rupture</span></span>` : ""}
      </button>
      <div class="p-3 flex-1 flex flex-col">
        <button type="button" onclick="${go("productDetail", { id: p.id })}" class="text-left"><h3 class="t-title line-clamp-2 leading-snug">${p.name}</h3></button>
        <p class="t-small text-ink-2 truncate mt-0.5">${seller.name}</p>
        <div class="mt-auto pt-2 flex items-center justify-between gap-2">
          <div><span class="t-title font-extrabold">${ACStore.fmtFCFA(p.price)}</span>${p.old ? `<span class="t-small text-ink-3 line-through ml-1.5">${ACStore.fmtFCFA(p.old)}</span>` : ""}<div>${rating(p.rating, p.reviews)}</div></div>
          <button type="button" onclick="Screens._marketAdd('${p.id}')" ${out ? "disabled" : ""} class="w-9 h-9 rounded-full bg-inverse text-inverse-ink flex items-center justify-center flex-shrink-0 disabled:opacity-30" aria-label="Ajouter au panier">${icon("add", "text-[20px]")}</button>
        </div>
      </div>
    </div>`;
  }
  function eventCard(e, compact) {
    return `<button type="button" onclick="${go("eventDetail", { id: e.id })}" class="card card-press overflow-hidden text-left w-full ${compact ? "min-w-[260px] lg:min-w-0" : ""}">
      <div class="relative ${compact ? "h-36" : "ratio-16-10"} bg-card-high overflow-hidden">${img(e.img, e.name)}
        <div class="absolute inset-0 gradient-up"></div>
        <span class="absolute top-2.5 left-2.5 badge bg-white/95 text-ink">${e.cat}</span>
        <div class="absolute bottom-2.5 left-3 right-3 text-white">
          <p class="t-caption text-gold">${YCData.fmtDate(e.date)} · ${e.time}</p>
          <h3 class="t-title leading-snug line-clamp-2">${e.name}</h3>
        </div>
      </div>
      <div class="p-3 flex items-center justify-between gap-2">
        <p class="t-small text-ink-2 truncate flex items-center gap-1">${icon("location_on", "text-[15px]")}${e.place}</p>
        <span class="t-small font-bold whitespace-nowrap">dès ${ACStore.fmtFCFA(YCData.minPrice(e))}</span>
      </div>
    </button>`;
  }
  function siteCard(s, compact) {
    const type = YCData.siteType(s.type);
    return `<button type="button" onclick="${go("cultureDetail", { id: s.id })}" class="card card-press overflow-hidden text-left w-full ${compact ? "min-w-[220px] lg:min-w-0" : ""}">
      <div class="relative ${compact ? "h-32" : "ratio-16-10"} bg-card-high overflow-hidden">${img(s.img, s.name)}
        <span class="absolute top-2.5 left-2.5 badge bg-white/95 text-ink">${icon(type.icon, "text-[14px]")}${type.label}</span>
        ${s.unesco ? `<span class="absolute top-2.5 right-2.5 badge badge-gold">UNESCO</span>` : ""}
      </div>
      <div class="p-3.5"><h3 class="t-title line-clamp-2 leading-snug">${s.name}</h3><p class="t-small text-ink-2 truncate mt-0.5">${s.place}</p></div>
    </button>`;
  }
  function destinationCard(name, tall) {
    const c = YCData.CITIES[name];
    return `<button type="button" onclick="${go("destination", { city: name })}" class="relative rounded-2xl overflow-hidden text-left ${tall ? "h-44 lg:h-56" : "h-28 lg:h-36"} w-full card-press group">
      ${img(c.hero, name, "img-cover transition-transform duration-500 group-hover:scale-105")}
      <div class="absolute inset-0 gradient-up"></div>
      <div class="absolute bottom-3 left-3.5 right-3 text-white"><p class="t-caption text-gold">${c.country}</p><h3 class="t-h3 lg:t-h2">${name}</h3></div>
    </button>`;
  }

  /* ---------- « Et ensuite ? » : ponts entre services ---------- */
  function nextSteps(items, title) {
    if (!items || !items.length) return "";
    return `<section class="card-dark p-4 lg:p-5">
      <p class="t-caption text-gold mb-3">${title || t("next_steps")}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 ${items.length > 2 ? "lg:grid-cols-3" : ""} gap-2.5">
        ${items.map((it) => `<button type="button" onclick="${it.onclick}" class="flex items-center gap-3 rounded-xl bg-white/10 hover:bg-white/15 p-3 text-left transition-colors">
          <span class="w-10 h-10 rounded-full bg-gold text-[#0A0A0A] flex items-center justify-center flex-shrink-0">${icon(it.icon, "text-[20px]")}</span>
          <span class="min-w-0"><span class="block t-title truncate">${it.label}</span>${it.sub ? `<span class="block t-small text-white/70 truncate">${it.sub}</span>` : ""}</span>
          ${icon("chevron_right", "ml-auto text-white/60")}
        </button>`).join("")}
      </div>
    </section>`;
  }

  /* ---------- Étapes / timeline ---------- */
  function stepper(labels, current) {
    return `<ol class="flex items-center gap-2 t-small">${labels.map((l, i) => `
      <li class="flex items-center gap-2 ${i < labels.length - 1 ? "flex-1" : ""}">
        <span class="step-dot ${i < current ? "done" : i === current ? "active" : ""}">${i < current ? icon("check", "text-[16px]") : i + 1}</span>
        <span class="${i === current ? "font-bold text-ink" : "text-ink-3"} hidden sm:inline">${l}</span>
        ${i < labels.length - 1 ? `<span class="flex-1 h-px ${i < current ? "bg-gold" : "bg-line"}"></span>` : ""}
      </li>`).join("")}</ol>`;
  }
  function timeline(steps, idx, opts) {
    opts = opts || {};
    return `<ol class="relative">${steps.map((s, i) => {
      const done = i < idx, active = i === idx;
      return `<li class="flex gap-3 ${i < steps.length - 1 ? "pb-5" : ""} relative">
        ${i < steps.length - 1 ? `<span class="absolute left-[13px] top-7 bottom-0 w-0.5 ${done ? "bg-gold" : "bg-line"}"></span>` : ""}
        <span class="step-dot ${done || (active && opts.doneAtActive) ? "done" : active ? "active" : ""} relative z-10">${done ? icon("check", "text-[16px]") : icon(s.icon || "radio_button_unchecked", "text-[15px]")}</span>
        <div class="min-w-0 pt-0.5"><p class="t-title ${done || active ? "text-ink" : "text-ink-3"}">${s.label}</p>${s.sub ? `<p class="t-small text-ink-2">${s.sub}</p>` : ""}</div>
      </li>`;
    }).join("")}</ol>`;
  }

  /* ---------- Formulaires ---------- */
  function field(id, label, opts) {
    opts = opts || {};
    const type = opts.type || "text";
    return `<label class="block">${label ? `<span class="label">${label}</span>` : ""}
      <span class="relative block">
        ${opts.icon ? `<span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none">${icon(opts.icon, "text-[20px]")}</span>` : ""}
        <input id="${id}" type="${type}" value="${escAttr(opts.value || "")}" placeholder="${escAttr(opts.placeholder || "")}" ${opts.inputmode ? `inputmode="${opts.inputmode}"` : ""} ${opts.maxlength ? `maxlength="${opts.maxlength}"` : ""} ${opts.autocomplete ? `autocomplete="${opts.autocomplete}"` : ""} ${opts.attrs || ""} class="input ${opts.icon ? "pl-11" : ""} ${opts.cls || ""}"/>
        ${type === "password" ? `<button type="button" onclick="UI.togglePassword('${id}', this)" class="absolute right-2 top-1/2 -translate-y-1/2 icon-btn w-8 h-8 border-0 shadow-none" aria-label="Afficher le mot de passe">${icon("visibility", "text-[18px]")}</button>` : ""}
      </span>${opts.hint ? `<span class="t-small text-ink-3 mt-1 block">${opts.hint}</span>` : ""}</label>`;
  }
  function togglePassword(id, btn) {
    const el = document.getElementById(id); if (!el) return;
    el.type = el.type === "password" ? "text" : "password";
    btn.innerHTML = icon(el.type === "password" ? "visibility" : "visibility_off", "text-[18px]");
  }
  function select(id, label, options, value, onchange) {
    return `<label class="block">${label ? `<span class="label">${label}</span>` : ""}
      <select id="${id}" class="select" ${onchange ? `onchange="${onchange}"` : ""}>${options.map((o) => `<option value="${escAttr(o.value != null ? o.value : o)}" ${(o.value != null ? o.value : o) === value ? "selected" : ""}>${esc(o.label || o)}</option>`).join("")}</select></label>`;
  }
  function error(id) { return `<p id="${id}" class="hidden t-small text-danger font-semibold" role="alert"></p>`; }
  function showError(id, msg) { const el = document.getElementById(id); if (!el) return; el.textContent = msg; el.classList.remove("hidden"); }
  function toggle(on, onclick, label) {
    return `<button type="button" role="switch" aria-checked="${on ? "true" : "false"}" onclick="${onclick}" class="switch ${on ? "on" : ""}" aria-label="${escAttr(label || "")}"></button>`;
  }
  function qtyControl(qty, onMinus, onPlus, small) {
    const s = small ? "w-8 h-8" : "w-9 h-9";
    return `<span class="inline-flex items-center gap-2.5">
      <button type="button" onclick="${onMinus}" class="${s} rounded-full border border-line bg-card flex items-center justify-center active:scale-95" aria-label="Moins">${icon(qty <= 1 ? "delete" : "remove", "text-[18px]")}</button>
      <span class="w-5 text-center font-bold">${qty}</span>
      <button type="button" onclick="${onPlus}" class="${s} rounded-full bg-inverse text-inverse-ink flex items-center justify-center active:scale-95" aria-label="Plus">${icon("add", "text-[18px]")}</button>
    </span>`;
  }
  function row(label, value, bold) {
    return `<div class="flex items-center justify-between gap-4 py-1.5"><span class="t-body text-ink-2">${label}</span><span class="t-body text-right ${bold ? "font-bold" : ""}">${value}</span></div>`;
  }

  /* ---------- États ---------- */
  function emptyState(o) {
    return `<div class="flex-1 flex flex-col items-center justify-center text-center px-6 py-14">
      <div class="w-20 h-20 rounded-full bg-surface-low flex items-center justify-center text-gold mb-4">${icon(o.icon || "inbox", "text-[40px]")}</div>
      <h3 class="t-h3 mb-1.5">${o.title}</h3>
      <p class="t-body text-ink-2 max-w-[300px] leading-relaxed mb-5">${o.body || ""}</p>
      ${o.actionLabel ? `<div class="w-full max-w-[280px]">${primaryButton(o.actionLabel, o.actionOnclick, { icon: o.actionIcon || "arrow_forward", iconRight: "arrow_forward" })}</div>` : ""}
    </div>`;
  }
  function skeletonList(n, kind) {
    const card = kind === "grid"
      ? `<div class="card overflow-hidden"><div class="skeleton h-36 rounded-none"></div><div class="p-3.5 space-y-2"><div class="skeleton h-4 w-3/4"></div><div class="skeleton h-3 w-1/2"></div></div></div>`
      : `<div class="card p-4 flex items-center gap-3"><div class="skeleton w-12 h-12 rounded-full"></div><div class="flex-1 space-y-2"><div class="skeleton h-4 w-2/3"></div><div class="skeleton h-3 w-1/3"></div></div></div>`;
    return `<div class="${kind === "grid" ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}" aria-busy="true">${Array.from({ length: n || 6 }).map(() => card).join("")}</div>`;
  }
  function spinner(cls) { return `<span class="inline-block w-8 h-8 rounded-full border-[3px] border-gold/25 border-t-gold animate-spin ${cls || ""}" role="status" aria-label="Chargement"></span>`; }
  function successHero(o) {
    return `<div class="flex flex-col items-center text-center pt-4 pb-2">
      <div class="w-20 h-20 rounded-full ${o.tone === "danger" ? "bg-danger-soft text-danger" : o.tone === "warn" ? "bg-warn-soft text-warn" : "bg-gold-soft text-gold-deep"} flex items-center justify-center animate-pop">${icon(o.icon || "check_circle", "text-[44px]", true)}</div>
      <h2 class="t-h1 mt-4">${o.title}</h2>
      ${o.body ? `<p class="t-body text-ink-2 mt-1.5 max-w-[420px] text-balance">${o.body}</p>` : ""}
    </div>`;
  }

  /* ---------- Toasts, feuilles, dialogues ---------- */
  let toastTimer = null;
  function toast(message, tone) {
    let el = document.getElementById("ac-toast");
    if (!el) { el = document.createElement("div"); el.id = "ac-toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
    const tones = { success: "bg-inverse text-inverse-ink", error: "bg-danger text-white", info: "bg-inverse text-inverse-ink", warn: "bg-warn text-white" };
    el.className = "toast " + (tones[tone] || tones.info);
    el.innerHTML = `<span class="inline-flex items-center gap-2">${icon(tone === "error" ? "error" : tone === "success" ? "check_circle" : "info", "text-[18px] " + (tone === "success" ? "text-gold" : ""))}<span>${esc(message)}</span></span>`;
    el.style.opacity = "1"; el.style.transform = "translate(-50%, 0)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translate(-50%, 8px)"; }, 2400);
  }
  function openSheet(innerHtml, opts) {
    opts = opts || {};
    closeSheet();
    const overlay = document.createElement("div");
    overlay.id = "ac-sheet-overlay";
    overlay.className = "sheet-overlay";
    overlay.innerHTML = `
      <div class="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-fade-in" onclick="UI.closeSheet()"></div>
      <div class="sheet animate-screen-in ${opts.wide ? "lg:max-w-[760px]" : ""}" role="dialog" aria-modal="true">
        <div class="w-10 h-1.5 bg-line rounded-full mx-auto mb-4 lg:hidden"></div>
        <button type="button" onclick="UI.closeSheet()" class="icon-btn absolute right-4 top-4 hidden lg:flex" aria-label="${t("close")}">${icon("close")}</button>
        ${innerHtml}
      </div>`;
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
  }
  function closeSheet() {
    const overlay = document.getElementById("ac-sheet-overlay");
    if (overlay) overlay.remove();
    document.body.style.overflow = "";
  }
  function confirm(o) {
    openSheet(`<div class="text-center lg:text-left">
      ${o.icon ? `<div class="w-14 h-14 rounded-full ${o.danger ? "bg-danger-soft text-danger" : "bg-gold-soft text-gold-deep"} flex items-center justify-center mx-auto lg:mx-0 mb-3">${icon(o.icon, "text-[28px]")}</div>` : ""}
      <h3 class="t-h3 mb-1.5">${o.title}</h3><p class="t-body text-ink-2 mb-5">${o.body || ""}</p>
      <div class="flex flex-col sm:flex-row gap-2.5">
        ${button(o.cancelLabel || t("cancel"), "UI.closeSheet()", { variant: "outline" })}
        ${button(o.okLabel || t("confirm"), "UI.closeSheet();" + o.onOk, { variant: o.danger ? "danger" : "primary" })}
      </div></div>`);
  }

  /* ---------- Hors ligne ---------- */
  function initOfflineBanner() {
    let banner = null;
    function render() {
      const offline = !navigator.onLine;
      if (offline && !banner) {
        banner = document.createElement("div");
        banner.className = "fixed top-0 left-0 right-0 z-[1000] bg-inverse text-inverse-ink text-center t-small font-semibold py-2";
        banner.textContent = "Hors ligne — certaines actions sont temporairement indisponibles.";
        document.body.appendChild(banner);
      } else if (!offline && banner) { banner.remove(); banner = null; }
    }
    window.addEventListener("online", render); window.addEventListener("offline", render); render();
  }

  /* ---------- Thème ---------- */
  function applyTheme(theme) {
    const dark = theme === "dark";
    document.documentElement.classList.toggle("dark", dark);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0B0B0C" : "#FAFAFA");
  }
  function setTheme(theme) {
    ACState.prefs.theme = theme;
    applyTheme(theme);
    ACStore.emit();
  }

  /* ---------- Langue ---------- */
  function setLang(id) {
    if (!I18N.set(id)) return;
    toast(I18N.t("lang_done"), "success");
    ACStore.emit();
  }

  /* Format court d'une heure ISO/epoch */
  function timeAgo(at) {
    if (!at) return "";
    const diff = Math.max(0, Date.now() - at) / 1000;
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return "Il y a " + Math.round(diff / 60) + " min";
    if (diff < 86400) return "Il y a " + Math.round(diff / 3600) + " h";
    return "Il y a " + Math.round(diff / 86400) + " j";
  }

  window.UI = {
    t, esc, escAttr, js, go, icon,
    button, primaryButton, secondaryButton, darkButton, iconButton,
    badge, chip, stars, rating, img, avatar, sectionTitle,
    restaurantCard, productCard, eventCard, siteCard, destinationCard, nextSteps,
    stepper, timeline, field, togglePassword, select, error, showError, toggle, qtyControl, row,
    emptyState, skeletonList, spinner, successHero,
    toast, openSheet, closeSheet, confirm, initOfflineBanner, applyTheme, setTheme, setLang, timeAgo,
    lang: () => I18N.lang, langNames: () => I18N.LANGS
  };
})();
