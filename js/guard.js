// Contrôles côté client : listes blanches, verrou d'essais, identifiants sûrs.
// Ça limite les abus dans le navigateur. Ce n'est pas un serveur.
(function () {
  "use strict";

  var locks = {};
  var MAX = 5;
  var WAIT_MS = 45000;

  function blocked(key) {
    var s = locks[key];
    if (!s || !s.until) return 0;
    var left = s.until - Date.now();
    if (left <= 0) { s.until = 0; return 0; }
    return Math.ceil(left / 1000);
  }
  function fail(key) {
    var s = locks[key] || { n: 0, until: 0 };
    s.n += 1;
    if (s.n >= MAX) { s.until = Date.now() + WAIT_MS; s.n = 0; }
    locks[key] = s;
    return blocked(key);
  }
  function ok(key) { locks[key] = { n: 0, until: 0 }; }

  function idOk(id) { return /^[a-zA-Z0-9_-]{1,48}$/.test(String(id || "")); }

  function screenOk(id) {
    if (!idOk(id)) return false;
    if (!window.Screens || typeof Screens[id] !== "function") return false;
    if (/^ops[A-Z]/.test(id) || /^pro[A-Z]/.test(id)) return false;
    return true;
  }

  function returnHash(hash) {
    var h = String(hash || "");
    if (h.indexOf("#/") !== 0 || h.length > 200) return "";
    if (/[<>"'\\]/.test(h)) return "";
    var path = h.slice(2).split("?")[0];
    if (/^culture\/[a-z0-9_-]+$/i.test(path)) return h;
    if (!screenOk(path)) return "";
    return h;
  }

  function waitMsg(sec) {
    return "Trop de tentatives. Réessayez dans " + sec + " s.";
  }

  window.YCGuard = { blocked: blocked, fail: fail, ok: ok, idOk: idOk, screenOk: screenOk, returnHash: returnHash, waitMsg: waitMsg };
})();
