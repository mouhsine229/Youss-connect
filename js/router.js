/* =========================================================
   YOUSS CONNECT — ROUTER
   Every screen module registers itself into window.Screens.
   App.nav(id, params) pushes history; App.back() pops it.
   ========================================================= */
(function () {
  "use strict";
  const container = document.getElementById("app");
  let stack = [];
  let current = null;

  function show(id, params) {
    const fn = window.Screens && window.Screens[id];
    if (!fn) {
      console.error("Unknown screen:", id);
      container.innerHTML = `<div class="p-8 text-center font-body-md">Écran introuvable : ${id}</div>`;
      return;
    }
    current = { id, params: params || {} };
    /* Permet aux modules (caméra, carte…) de libérer leurs ressources. */
    document.dispatchEvent(new CustomEvent("yc:navigate", { detail: { id } }));
    fn(container, current.params);
    container.scrollTop = 0;
  }

  function nav(id, params) {
    if (current) stack.push(current);
    show(id, params);
  }

  function replace(id, params) {
    show(id, params);
  }

  function back() {
    const prev = stack.pop();
    show(prev ? prev.id : "home", prev ? prev.params : {});
  }

  function resetTo(id, params) {
    stack = [];
    show(id, params);
  }

  window.App = {
    nav, back, replace, resetTo,
    get current() { return current; }
  };

  // Any cross-cutting state change (wallet, rewards, notifications, activities)
  // re-renders whatever screen is currently visible so numbers stay live.
  ACStore.subscribe(function () {
    /* Ne pas re-render le splash (timer 2s) ni les écrans auth de transition. */
    if (!current || current.id === "splash") return;
    show(current.id, current.params);
  });

  document.addEventListener("DOMContentLoaded", function () {
    UI.initOfflineBanner();
    /* Restaure la session Supabase avant le splash (max 2,5 s). */
    var boot = (window.YCBackend && YCBackend.init) ? YCBackend.init() : Promise.resolve();
    var timeout = new Promise(function (resolve) { setTimeout(resolve, 2500); });
    Promise.race([boot, timeout]).then(function () {
      show("splash", {});
    });
  });
})();
