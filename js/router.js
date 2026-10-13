// Routeur hash : #/ecran?param=valeur. Le bouton Retour du navigateur marche,
// chaque écran a une URL et les QR #/culture/<id> ouvrent directement une fiche.
(function () {
  "use strict";
  const container = document.getElementById("app");
  let stack = [];          // pile des hashes précédents (pour App.back)
  let current = null;      // { id, params }
  let ignoreNextHash = false;

  const AUTH_FREE = { splash: 1, onboarding: 1, login: 1, signup: 1, otp: 1, forgotPassword: 1, about: 1, opsLogin: 1, opsOtp: 1, proJoin: 1, proLogin: 1 };
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
    m = h.match(/^site=([a-z0-9_-]+)$/i);
    if (m) return { id: "cultureDetail", params: { id: m[1] } };
    const [path, query] = h.split("?");
    const params = {};
    new URLSearchParams(query || "").forEach((v, k) => { params[k] = v; });
    if (params.site && (path === "" || path === "culture" || path === "site")) {
      return { id: "cultureDetail", params: { id: params.site } };
    }
    if (path === "kya-ops" || path === "ops") return { id: (window.YCGate && YCGate.ops && YCGate.ops()) ? "opsHome" : "opsLogin", params };
    if (path === "pro/rejoindre") return { id: "proJoin", params };
    if (path === "pro") return { id: (window.YCGate && YCGate.pro && YCGate.pro()) ? "proHome" : "proLogin", params };
    return { id: path, params };
  }

  /* Même écran et mêmes paramètres : un clic sur la quantité ne doit pas remonter. */
  function viewKey(id, params) {
    const parts = [];
    Object.keys(params || {}).sort().forEach((k) => {
      const v = params[k];
      if (v != null && v !== "") parts.push(k + "=" + v);
    });
    return (id || "") + "?" + parts.join("&");
  }
  function flag(key) {
    try { return sessionStorage.getItem(key) === "1"; } catch (e) { return false; }
  }
  function show(id, params) {
    params = params || {};
    const prevKey = current ? viewKey(current.id, current.params) : "";
    const prevId = current && current.id;
    const scroller = document.getElementById("main");
    const savedTop = scroller ? scroller.scrollTop : 0;
    const requested = id;
    const opsScreen = isOpsScreen(id);
    const proScreen = isKitchenScreen(id);
    if (id === "otp" && !ACState.session.authenticated && !flag("yc-otp-pending")) {
      id = "login"; params = {};
    } else if (id === "opsOtp" && !(window.YCGate && YCGate.ops && YCGate.ops()) && !flag("yc-ops-pending")) {
      id = "opsLogin"; params = {};
    } else if (opsScreen && id !== "opsLogin" && id !== "opsOtp" && !(window.YCGate && YCGate.ops && YCGate.ops())) {
      id = "opsLogin"; params = {};
    } else if (proScreen && id !== "proJoin" && id !== "proLogin" && !(window.YCGate && YCGate.pro && YCGate.pro())) {
      id = "proLogin"; params = {};
    } else if (!opsScreen && !proScreen && !AUTH_FREE[id] && !ACState.session.authenticated) {
      sessionStorage.setItem("yc-after-login", encode(requested, params));
      id = ACState.session.onboardingSeen ? "login" : "onboarding"; params = {};
    }
    const fn = window.Screens && window.Screens[id];
    if (!fn) {
      console.error("Unknown screen:", requested);
      current = { id: "notFound", params: { id: requested } };
      container.innerHTML = `<div class="min-h-dvh flex items-center justify-center p-8 text-center"><div><p class="t-h2 mb-2">Écran introuvable</p><p class="t-body text-ink-2 mb-4">${UI.esc(requested)}</p>${UI.primaryButton("Retour à l'accueil", "App.resetTo('home')", { block: false })}</div></div>`;
      return;
    }
    if (id !== requested) setHash(encode(id, params), true);
    if (prevId && prevId !== id) {
      if (window.UI && UI.closeSheet) UI.closeSheet();
      if (window.YCScanner && YCScanner.stop && (prevId === "walletQrPay" || prevId === "culturalScanner")) YCScanner.stop();
    }
    const sameView = prevKey === viewKey(id, params);
    current = { id, params: params || {} };
    document.dispatchEvent(new CustomEvent("yc:navigate", { detail: { id } }));
    fn(container, current.params);
    const main = document.getElementById("main");
    if (sameView) {
      const apply = () => { const el = document.getElementById("main"); if (el) el.scrollTop = savedTop; };
      apply();
      requestAnimationFrame(apply);
    } else {
      if (main) main.scrollTop = 0;
      window.scrollTo(0, 0);
    }
    document.title = (id === "splash" ? "" : (titleFor(id) + " · ")) + "YOUSS CONNECT";
    if (window.I18N && I18N.apply) {
      I18N.apply(container);
      document.title = I18N.applyText(document.title);
      requestAnimationFrame(function () { if (I18N.lang === "en") I18N.apply(container); });
    }
  }
  function titleFor(id) {
    const map = { home: "Accueil", explorer: "Explorer", activities: "Activités", wallet: "Youss Wallet", profile: "Profil", transport: "Transport", delivery: "Livraison", restaurants: "Restaurants", events: "Événements", market: "Youss Market", culture: "Culture & Tourisme", rewards: "Youss Bonus", business: "Youss Business", opsHome: "Console KYA", opsLogin: "Console KYA", proHome: "Cuisine", proLogin: "Cuisine", proJoin: "Invitation resto" };
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
    if (current && encode(current.id, current.params) === hash) { show(id, params); return; }
    if (current) stack.push(encode(current.id, current.params));
    if (location.hash === hash) { show(id, params); return; }
    ignoreNextHash = true;
    location.hash = hash;
    show(id, params);
  }
  function replace(id, params) {
    setHash(encode(id, params), true);
    show(id, params);
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
    const active = document.activeElement;
    if (active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName) && active.type !== "file" && !ACState._forceShow) return;
    ACState._forceShow = false;
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
        sessionStorage.setItem("yc-after-login", location.hash);
      }
      replace("splash", {});
    });
  });
})();
