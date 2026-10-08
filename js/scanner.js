/* =========================================================
   YOUSS CONNECT — SCANNER QR
   Caméra réelle (getUserMedia) + décodage QR :
     1. BarcodeDetector natif (Chrome / Android) quand disponible
     2. Sinon jsQR (chargé à la demande) — iOS Safari, desktop
   Génération de QR (qrcode-generator, chargé à la demande).
   Formats reconnus :
     youss:site:<id>                  → site culturel
     youss:pay?to=<tel>&name=..&amount=..  → paiement Youss Wallet
     https://…?site=<id>  ou  …#/culture/<id>
   ========================================================= */
(function () {
  "use strict";

  const JSQR_URL = "./vendor/jsQR.js";
  const QRGEN_URL = "./vendor/qrcode.js";

  let stream = null;
  let video = null;
  let detector = null;
  let running = false;
  let rafId = null;
  let lastTick = 0;
  let onResult = null;
  let canvas = null;
  let ctx = null;
  const loaders = {};

  function loadScript(url) {
    if (!loaders[url]) {
      loaders[url] = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = url;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => { delete loaders[url]; reject(new Error("Chargement impossible : " + url)); };
        document.head.appendChild(s);
      });
    }
    return loaders[url];
  }

  function ensureJsQR() {
    return window.jsQR ? Promise.resolve(window.jsQR) : loadScript(JSQR_URL).then(() => window.jsQR);
  }

  function ensureQrGen() {
    return window.qrcode ? Promise.resolve(window.qrcode) : loadScript(QRGEN_URL).then(() => window.qrcode);
  }

  function supported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  function getCanvas() {
    if (!canvas) {
      canvas = document.createElement("canvas");
      ctx = canvas.getContext("2d", { willReadFrequently: true });
    }
    return canvas;
  }

  async function makeDetector() {
    if (!("BarcodeDetector" in window)) return null;
    try {
      const formats = await window.BarcodeDetector.getSupportedFormats();
      if (formats && formats.includes("qr_code")) {
        return new window.BarcodeDetector({ formats: ["qr_code"] });
      }
    } catch (e) { /* non supporté */ }
    return null;
  }

  function decodeFromCanvasSource(source, w, h) {
    const c = getCanvas();
    const scale = Math.min(1, 640 / Math.max(w, h));
    c.width = Math.max(1, Math.round(w * scale));
    c.height = Math.max(1, Math.round(h * scale));
    ctx.drawImage(source, 0, 0, c.width, c.height);
    const img = ctx.getImageData(0, 0, c.width, c.height);
    const res = window.jsQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" });
    return res && res.data ? res.data : null;
  }

  async function detectOnce() {
    if (!video || video.readyState < 2) return null;
    if (detector) {
      try {
        const codes = await detector.detect(video);
        if (codes && codes.length && codes[0].rawValue) return codes[0].rawValue;
        return null;
      } catch (e) { /* on bascule sur jsQR */ detector = null; await ensureJsQR(); }
    }
    if (window.jsQR) return decodeFromCanvasSource(video, video.videoWidth, video.videoHeight);
    return null;
  }

  function loop(ts) {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    if (ts - lastTick < 140) return; /* ~7 analyses / s : suffisant et économe */
    lastTick = ts;
    detectOnce().then((text) => {
      if (!running || !text) return;
      const cb = onResult;
      stop();
      if (navigator.vibrate) { try { navigator.vibrate(60); } catch (e) { /* no-op */ } }
      if (cb) cb(text);
    }).catch(() => {});
  }

  /* Démarre la caméra sur <video>. Rejette avec {code} :
     unsupported | insecure | denied | nocamera | busy | error */
  async function start(videoEl, opts) {
    opts = opts || {};
    stop();
    video = videoEl;
    onResult = opts.onResult || null;

    if (!supported()) throw { code: "unsupported" };
    if (!window.isSecureContext) throw { code: "insecure" };

    const constraints = {
      audio: false,
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
    };
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e) {
      const name = e && e.name;
      if (name === "NotAllowedError" || name === "SecurityError") throw { code: "denied", raw: e };
      if (name === "NotFoundError" || name === "OverconstrainedError") throw { code: "nocamera", raw: e };
      if (name === "NotReadableError" || name === "AbortError") throw { code: "busy", raw: e };
      throw { code: "error", raw: e };
    }

    video.srcObject = stream;
    video.setAttribute("playsinline", "");
    video.muted = true;
    try { await video.play(); } catch (e) { /* autoplay bloqué : le flux reste attaché */ }

    detector = await makeDetector();
    if (!detector) await ensureJsQR();

    running = true;
    lastTick = 0;
    rafId = requestAnimationFrame(loop);
    return { engine: detector ? "native" : "jsqr", torch: torchSupported() };
  }

  function stop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (stream) {
      stream.getTracks().forEach((t) => { try { t.stop(); } catch (e) { /* no-op */ } });
      stream = null;
    }
    if (video) {
      try { video.pause(); } catch (e) { /* no-op */ }
      video.srcObject = null;
    }
    video = null;
    detector = null;
    onResult = null;
  }

  function isRunning() { return running; }

  function currentTrack() {
    return stream ? stream.getVideoTracks()[0] : null;
  }

  function torchSupported() {
    const t = currentTrack();
    if (!t || !t.getCapabilities) return false;
    try { return !!t.getCapabilities().torch; } catch (e) { return false; }
  }

  let torchOn = false;
  async function toggleTorch() {
    const t = currentTrack();
    if (!t || !torchSupported()) return false;
    torchOn = !torchOn;
    try { await t.applyConstraints({ advanced: [{ torch: torchOn }] }); } catch (e) { torchOn = false; }
    return torchOn;
  }

  /* Décodage d'une image (galerie / fichier) — fallback sans caméra. */
  async function scanFile(file) {
    if (!file) return null;
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error("Image illisible"));
        i.src = url;
      });
      const det = await makeDetector();
      if (det) {
        try {
          const codes = await det.detect(img);
          if (codes && codes.length && codes[0].rawValue) return codes[0].rawValue;
        } catch (e) { /* jsQR ensuite */ }
      }
      await ensureJsQR();
      return decodeFromCanvasSource(img, img.naturalWidth, img.naturalHeight);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  /* Interprétation du contenu d'un QR. */
  function parse(text) {
    const raw = String(text || "").trim();
    if (!raw) return { type: "empty", raw };

    let m = raw.match(/^youss:(?:\/\/)?site[:/]([a-z0-9_-]+)$/i);
    if (m) return { type: "site", id: m[1].toLowerCase(), raw };

    m = raw.match(/^youss:(?:\/\/)?ticket[:/]([a-z0-9_-]+)$/i);
    if (m) return { type: "ticket", number: m[1].toUpperCase(), raw };

    m = raw.match(/^youss:(?:\/\/)?pay(?:\?(.*))?$/i);
    if (m) {
      const q = new URLSearchParams(m[1] || "");
      const amount = parseInt(q.get("amount"), 10);
      return {
        type: "pay",
        to: q.get("to") || "",
        name: q.get("name") || "",
        amount: isFinite(amount) && amount > 0 ? amount : null,
        raw
      };
    }

    if (/^https?:\/\//i.test(raw)) {
      try {
        const u = new URL(raw);
        const site = u.searchParams.get("site") || (u.hash.match(/#\/culture\/([a-z0-9_-]+)/i) || [])[1];
        if (site) return { type: "site", id: site.toLowerCase(), raw };
        const to = u.searchParams.get("pay");
        if (to) {
          const amount = parseInt(u.searchParams.get("amount"), 10);
          return { type: "pay", to, name: u.searchParams.get("name") || "", amount: isFinite(amount) && amount > 0 ? amount : null, raw };
        }
        return { type: "url", url: raw, raw };
      } catch (e) { /* texte brut */ }
    }
    return { type: "text", raw };
  }

  /* Génère un QR en data URL (PNG). */
  async function toDataURL(text, opts) {
    opts = opts || {};
    const qrcode = await ensureQrGen();
    const qr = qrcode(0, opts.ecl || "M");
    qr.addData(String(text));
    qr.make();
    const cell = opts.cell || 6;
    return qr.createDataURL(cell, opts.margin == null ? 2 : opts.margin);
  }

  /* Rend un QR dans un élément (par id ou nœud). Fallback : service d'image. */
  async function render(target, text, opts) {
    const el = typeof target === "string" ? document.getElementById(target) : target;
    if (!el) return;
    const size = (opts && opts.size) || 180;
    let src;
    try {
      src = await toDataURL(text, opts);
    } catch (e) {
      src = "https://api.qrserver.com/v1/create-qr-code/?size=" + size + "x" + size + "&data=" + encodeURIComponent(text);
    }
    el.innerHTML = `<img src="${src}" width="${size}" height="${size}" alt="QR code" class="block rounded-lg" style="image-rendering:pixelated;max-width:100%;height:auto"/>`;
  }

  /* Arrêt automatique de la caméra dès qu'on quitte un écran scanner. */
  document.addEventListener("yc:navigate", function (e) {
    const id = e.detail && e.detail.id;
    if (running && !/scanner|QrPay/i.test(id || "")) stop();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && running) stop();
  });

  window.YCScanner = { start, stop, isRunning, scanFile, parse, toDataURL, render, toggleTorch, torchSupported, supported };
})();
