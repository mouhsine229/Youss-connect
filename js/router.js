// Routeur hash : #/ecran?param=valeur. Le bouton Retour du navigateur marche,
// chaque écran a une URL et les QR #/culture/<id> ouvrent directement une fiche.
(function () {
  "use strict";
  const container = document.getElementById("app");
  let stack = [];          // pile des hashes précédents (pour App.back)
  let current = null;      // { id, params }
  let ignoreNextHash = false;

  const AUTH_FREE = { splash: 1, onboarding: 1, login: 1, signup: 1, otp: 1, forgotPassword: 1, about: 1, terms: 1, privacy: 1, opsLogin: 1, opsOtp: 1, proJoin: 1, proLogin: 1 };
  /* « profile » et « productDetail » commencent aussi par « pro » : seule la cuisine (pro + majuscule) est un écran partenaire. */
  function isOpsScreen(id) { return /^ops[A-Z]/.test(id || ""); }
  function isKitchenScreen(id) { return /^pro[A-Z]/.test(id || ""); }

  function encode(id, params) {
    const q = new URLSearchParams();
    Object.keys(params || {}).forEach((k) => { if (params[k] != null && params[k] !== "") q.set(k, params[k]); });
    const s = q.toString();
    return "#/" + id + (s ? "?" + s : "");
  }
  function decode(hash) {
    const h = (hash || "").replace(/^#\/?/, "");
    if (!h) return null;
    /* Formats QR / liens profonds : culture/<id>, site=<id> */
    let m = h.match(/^culture\/([a-z0-9_-]+)$/i);
    if (m) return { id: "cultureDetail", params: { id: m[1] } };
    const [path, query] = h.split("?");
    const params = {};
    new URLSearchParams(query || "").forEach((v, k) => { params[k] = v; });
    if (path === "kya-ops" || path === "ops") return { id: (window.YCGate && YCGate.ops && YCGate.ops()) ? "opsHome" : "opsLogin", params };
    if (path === "pro/rejoindre") return { id: "proJoin", params };
    if (path === "pro") return { id: (window.YCGate && YCGate.pro && YCGate.pro()) ? "proHome" : "proLogin", params };
    return { id: path, params };
  }

  function show(id, params, opts) {
    params = params || {};
    opts = opts || {};
    const prevMain = document.getElementById("main");
    const kept = opts.keepScroll && prevMain ? prevMain.scrollTop : 0;
    const prevId = current && current.id;
    let fn = window.Screens && window.Screens[id];
    if (!fn) {
      console.error("Unknown screen:", id);
      container.innerHTML = `<div class="min-h-dvh flex items-center justify-center p-8 text-center"><div><p class="t-h2 mb-2">Écran introuvable</p><p class="t-body text-ink-2 mb-4">${UI.esc(id)}</p>${UI.primaryButton("Retour à l'accueil", "App.resetTo('home')", { block: false })}</div></div>`;
      if (window.I18N && I18N.apply) I18N.apply(document.body);
      return;
    }
    const opsScreen = isOpsScreen(id);
    const proScreen = isKitchenScreen(id);
    if (opsScreen && id !== "opsLogin" && id !== "opsOtp" && !(window.YCGate && YCGate.ops && YCGate.ops())) {
      id = "opsLogin"; params = {};
    } else if (proScreen && id !== "proJoin" && id !== "proLogin" && !(window.YCGate && YCGate.pro && YCGate.pro())) {
      id = "proLogin"; params = {};
    } else if (!opsScreen && !proScreen && !AUTH_FREE[id] && !ACState.session.authenticated) {
      sessionStorage.setItem("yc-after-login", encode(id, params));
      id = ACState.session.onboardingSeen ? "login" : "onboarding"; params = {};
    }
    if (window.Screens && window.Screens[id]) fn = window.Screens[id];
    if (prevId && prevId !== id) {
      if (window.UI && UI.closeSheet) UI.closeSheet();
      if (window.YCScanner && YCScanner.stop && (prevId === "walletQrPay" || prevId === "culturalScanner")) YCScanner.stop();
      if (prevId === "securityPin" && id !== "biometricSetup" && window.Screens && Screens._abandonPay) Screens._abandonPay();
    }
    current = { id, params: params || {} };
    document.dispatchEvent(new CustomEvent("yc:navigate", { detail: { id } }));
    try { fn(container, current.params); }
    catch (err) {
      console.error(err);
      container.innerHTML = `<div class="min-h-dvh flex items-center justify-center p-8 text-center"><div><p class="t-h2 mb-2">Cet écran n'a pas pu s'afficher</p><p class="t-body text-ink-2 mb-4">Revenez en arrière et réessayez.</p>${UI.primaryButton("Retour à l'accueil", "App.resetTo('home')", { block: false })}</div></div>`;
    }
    if (opts.keepScroll) container.querySelectorAll(".screen-enter").forEach((el) => { el.style.animation = "none"; });
    const main = document.getElementById("main");
    if (main) main.scrollTop = kept;
    if (!opts.keepScroll) window.scrollTo(0, 0);
    document.title = (id === "splash" ? "" : (titleFor(id) + " · ")) + "YOUSS CONNECT";
    if (window.I18N && I18N.rememberTitle) I18N.rememberTitle(document.title);
    if (window.I18N && I18N.apply) I18N.apply(document.body);
    if (window.I18N && I18N.applyTitle) I18N.applyTitle();
  }
  function titleFor(id) {
    const map = { home: "Accueil", explorer: "Explorer", activities: "Activités", wallet: "Youss Wallet", walletHistory: "Historique des transactions", addCard: "Carte bancaire", profile: "Profil", transport: "Transport", delivery: "Livraison", restaurants: "Restaurants", events: "Événements", market: "Youss Market", culture: "Culture & Tourisme", rewards: "Youss Bonus", business: "Youss Business", terms: "Conditions d'utilisation", privacy: "Politique de confidentialité", biometricSetup: "Biométrie", helpChat: "Assistance", verifyAccount: "Vérification du compte", opsHome: "Console KYA", opsLogin: "Console KYA", opsIdentity: "Pièces d'identité", opsSupport: "Assistance", proHome: "Cuisine", proLogin: "Cuisine", proJoin: "Invitation resto" };
    return map[id] || id.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
  }

  function setHash(hash, replace) {
    if (location.hash === hash) return;
    ignoreNextHash = true;
    if (replace) history.replaceState(null, "", hash); else location.hash = hash;
    /* history.replaceState ne déclenche pas hashchange */
    if (replace) ignoreNextHash = false;
  }

  function nav(id, params) {
    const hash = encode(id, params);
    if (current) stack.push(encode(current.id, current.params));
    if (location.hash === hash) { show(id, params); return; }
    ignoreNextHash = true;
    location.hash = hash;
    show(id, params);
  }
  function replace(id, params, opts) {
    setHash(encode(id, params), true);
    show(id, params, opts);
  }
  function back() {
    const prev = stack.pop();
    if (prev) {
      const d = decode(prev);
      ignoreNextHash = true;
      history.back();
      /* Si l'historique navigateur ne correspond pas, on force l'affichage */
      setTimeout(() => { if (!current || encode(current.id, current.params) !== prev) { setHash(prev, true); show(d.id, d.params); } }, 60);
      return;
    }
    replace("home", {});
  }
  function resetTo(id, params) {
    stack = [];
    const hash = encode(id, params);
    ignoreNextHash = true;
    if (location.hash !== hash) location.hash = hash;
    show(id, params);
  }

  window.addEventListener("hashchange", function () {
    if (ignoreNextHash) { ignoreNextHash = false; return; }
    const d = decode(location.hash);
    if (!d) { show("home", {}); return; }
    /* Retour navigateur : si la cible est le sommet de notre pile, on dépile */
    const top = stack[stack.length - 1];
    if (top === location.hash) stack.pop();
    else if (current) stack.push(encode(current.id, current.params));
    show(d.id, d.params);
  });

  window.App = {
    nav, back, replace, resetTo, encode,
    get current() { return current; },
    get depth() { return stack.length; }
  };

  /* Tout changement d'état transverse re-rend l'écran visible (chiffres à jour),
     sauf les écrans à animation propre. */
  const NO_RERENDER = { splash: 1, transportInRide: 1, deliveryTracking: 1, culturalScanner: 1, scannerAnalyzing: 1, walletQrPay: 1, transport: 1 };
  ACStore.subscribe(function () {
    if (!current || NO_RERENDER[current.id]) return;
    if (document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    show(current.id, current.params);
  });

  // La touche "/" ouvre la recherche sur desktop
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || "")) {
      e.preventDefault(); nav("explorer", { focus: 1 });
    }
    if (e.key === "Escape") UI.closeSheet();
  });

  document.addEventListener("DOMContentLoaded", function () {
    UI.applyTheme(ACState.prefs.theme);
    UI.initOfflineBanner();
    const boot = (window.YCBackend && YCBackend.init) ? YCBackend.init() : Promise.resolve();
    const timeout = new Promise((resolve) => setTimeout(resolve, 2500));
    Promise.race([boot, timeout]).then(function () {
      const d = decode(location.hash);
      if (d && (isOpsScreen(d.id) || isKitchenScreen(d.id)) && window.Screens[d.id]) { replace(d.id, d.params); return; }
      if (d && d.id !== "splash" && ACState.session.authenticated && window.Screens[d.id]) { replace(d.id, d.params); return; }
      if (d && d.id !== "splash" && !ACState.session.authenticated && window.Screens[d.id] && !AUTH_FREE[d.id]) {
        const backTo = window.YCGuard ? YCGuard.returnHash(location.hash) : "";
        if (backTo) sessionStorage.setItem("yc-after-login", backTo);
      }
      replace("splash", {});
    });
  });
})();
