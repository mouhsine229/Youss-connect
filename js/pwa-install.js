// Invite d'installation PWA (Chrome/Edge/Android) via beforeinstallprompt — pas un simple raccourci.
(function () {
  "use strict";

  const STORAGE_KEY = "yc-pwa-install-dismiss";
  const DELAY_MS = 10000;
  const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

  let deferred = null;
  let timer = null;
  let shown = false;
  const loadedAt = Date.now();

  function t(key, fallback) {
    if (window.I18N && I18N.t) {
      const v = I18N.t(key);
      if (v && v !== key) return v;
    }
    return fallback;
  }

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function isIOS() {
    const ua = navigator.userAgent || "";
    if (/iphone|ipad|ipod/i.test(ua)) return true;
    return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  }

  function wasDismissed() {
    try {
      const n = parseInt(localStorage.getItem(STORAGE_KEY), 10);
      return isFinite(n) && Date.now() - n < SNOOZE_MS;
    } catch (e) {
      return false;
    }
  }

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) {}
    if (window.UI && UI.closeSheet) UI.closeSheet();
  }

  function canOffer() {
    return !shown && !isStandalone() && !wasDismissed();
  }

  function hasNativePrompt() {
    return !!deferred;
  }

  function canInstall() {
    if (isStandalone() || wasDismissed()) return false;
    return hasNativePrompt() || isIOS();
  }

  function sheetHtml() {
    const native = hasNativePrompt();
    const title = t("pwa_install_title", "Installer YOUSS CONNECT");
    const body = native
      ? t("pwa_install_body", "Installez l'application officielle sur votre appareil : lancement plein écran, icône YOUSS CONNECT et accès même avec une connexion limitée.")
      : t("pwa_install_ios_body", "Sur iPhone ou iPad : touchez Partager (icône carré et flèche), puis « Sur l'écran d'accueil ». YOUSS CONNECT s'ouvrira comme une application, sans barre du navigateur.");
    const okLabel = native ? t("pwa_install_action", "Installer") : t("pwa_install_ios_ok", "J'ai compris");
    const okOnclick = native ? "YCPwaInstall.install()" : "YCPwaInstall.dismiss()";
    const later = t("pwa_install_later", "Plus tard");
    return `<div class="text-center lg:text-left">
      <div class="w-16 h-16 rounded-2xl bg-gold-soft flex items-center justify-center mx-auto lg:mx-0 mb-4 overflow-hidden">
        <img src="./icons/icon-192.png" alt="" class="w-14 h-14 object-contain" width="56" height="56"/>
      </div>
      <h3 class="t-h3 mb-1.5">${UI.esc(title)}</h3>
      <p class="t-body text-ink-2 mb-5">${UI.esc(body)}</p>
      <div class="flex flex-col sm:flex-row gap-2.5">
        ${UI.button(later, "YCPwaInstall.dismiss()", { variant: "outline", block: false })}
        ${UI.button(okLabel, okOnclick, { variant: "primary", block: false, icon: native ? "download" : "ios_share" })}
      </div>
    </div>`;
  }

  function showPrompt() {
    if (!canOffer()) return;
    if (!hasNativePrompt() && !isIOS()) return;
    if (!window.UI || !UI.openSheet) return;
    shown = true;
    UI.openSheet(sheetHtml());
  }

  function scheduleShow() {
    if (!canOffer()) return;
    if (!hasNativePrompt() && !isIOS()) return;
    if (timer) return;
    const wait = Math.max(0, DELAY_MS - (Date.now() - loadedAt));
    timer = setTimeout(function () {
      timer = null;
      showPrompt();
    }, wait);
  }

  function install() {
    if (!deferred) {
      dismiss();
      return;
    }
    const prompt = deferred;
    prompt.prompt();
    prompt.userChoice.then(function (choice) {
      deferred = null;
      dismiss();
      if (choice.outcome === "accepted" && window.UI) {
        UI.toast(t("pwa_install_progress", "YOUSS CONNECT est en cours d'installation."), "success");
      }
    }).catch(function () {
      deferred = null;
      dismiss();
    });
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferred = e;
    if (Date.now() - loadedAt >= DELAY_MS) {
      showPrompt();
    } else {
      scheduleShow();
    }
  });

  window.addEventListener("appinstalled", function () {
    deferred = null;
    shown = true;
    dismiss();
    if (window.UI) UI.toast(t("pwa_install_done", "YOUSS CONNECT est installée."), "success");
  });

  window.YCPwaInstall = {
    install: install,
    dismiss: dismiss,
    canInstall: canInstall,
    show: function () {
      if (!canOffer()) return;
      if (!hasNativePrompt() && !isIOS()) {
        if (window.UI) UI.toast(t("pwa_install_unavailable", "L'installation n'est pas proposée par ce navigateur pour le moment."), "info");
        return;
      }
      showPrompt();
    }
  };

  window.addEventListener("load", scheduleShow);
})();
