/* Splash, onboarding, connexion, inscription, OTP, présentation */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc } = UI;
  const IMG = YCData.IMG;

  const ONBOARD = [
    { title: "Se déplacer facilement", body: "Voiture, moto ou véhicule premium. Une course, un itinéraire réel, un suivi en direct et un paiement — dans toute la ville.", img: IMG + "onboarding/onb-mobility.jpg", tag: "Mobilité" },
    { title: "Livraison, restaurants, commerce", body: "Faites livrer un colis, commandez un repas ou achetez un produit local depuis la même application, avec le même compte.", img: IMG + "onboarding/onb-services.jpg", tag: "Services" },
    { title: "Événements et activités", body: "Concerts, festivals, conférences, spectacles et sport : découvrez, réservez, puis retrouvez votre billet numérique.", img: IMG + "onboarding/onb-events.jpg", tag: "Événements" },
    { title: "Culture et tourisme africain", body: "Destinations, monuments, musées et scanner culturel pour vivre l'histoire de l'Afrique, pas seulement la traverser.", img: IMG + "onboarding/onb-culture.jpg", tag: "Culture" },
    { title: "Un seul écosystème", body: "Transport, services, commerce, événements, culture, Wallet et Bonus. YOUSS CONNECT relie tout, à Cotonou, Dakar, Lomé et Accra.", img: IMG + "onboarding/onb-ecosystem.jpg", tag: "Écosystème" }
  ];

  /* ---------- Splash ---------- */
  Screens.splash = function (container) {
    container.innerHTML = `
      <div id="yc-splash" class="min-h-dvh bg-white flex flex-col items-center justify-center text-center px-6 relative overflow-hidden select-none">
        <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gold/10 blur-3xl"></div>
        <div class="absolute -bottom-40 -left-24 w-[28rem] h-[28rem] rounded-full bg-gold/10 blur-3xl"></div>
        <img src="./assets/youss-logo-full.png" alt="YOUSS CONNECT" class="w-[220px] lg:w-[280px] h-auto object-contain animate-pop" width="280" height="248"/>
        <p class="mt-6 t-caption text-[#0A0A0A]/60 tracking-[0.3em] animate-fade-in" style="animation-delay:.3s">Portée par KYA CORPORATION</p>
        <p class="mt-3 t-body lg:text-[17px] text-[#0A0A0A]/80 max-w-[320px] leading-relaxed animate-fade-in" style="animation-delay:.45s">Une seule application pour vivre l'Afrique au quotidien.</p>
        <div class="mt-10 w-40 h-1 rounded-full bg-[#0A0A0A]/10 overflow-hidden"><div id="yc-splash-bar" class="h-full bg-gold w-0 transition-[width] duration-[1600ms] ease-out"></div></div>
        <p class="absolute bottom-6 t-caption text-[#0A0A0A]/40">Cotonou · Dakar · Lomé · Accra</p>
      </div>`;
    requestAnimationFrame(() => { const b = document.getElementById("yc-splash-bar"); if (b) b.style.width = "100%"; });
    setTimeout(Screens._leaveSplash, 1900);
  };
  Screens._leaveSplash = function () {
    if (!App.current || App.current.id !== "splash") return;
    const root = document.getElementById("yc-splash");
    if (root) { root.style.transition = "opacity .25s"; root.style.opacity = "0"; }
    setTimeout(function () {
      if (ACState.session.authenticated) {
        const after = sessionStorage.getItem("yc-after-login");
        if (after) { sessionStorage.removeItem("yc-after-login"); location.hash = after; return; }
        App.replace("home");
      } else {
        App.replace(ACState.session.onboardingSeen ? "login" : "onboarding", {});
      }
    }, 260);
  };

  /* ---------- Onboarding ---------- */
  Screens.onboarding = function (container, params) {
    const i = Math.min(ONBOARD.length - 1, Math.max(0, parseInt(params && params.i, 10) || 0));
    const last = i === ONBOARD.length - 1;
    const s = ONBOARD[i];
    const dots = ONBOARD.map((_, n) => `<button type="button" onclick="App.replace('onboarding',{i:${n}})" class="h-1.5 rounded-full transition-all ${n === i ? "w-8 bg-gold" : "w-3 bg-white/25"}" aria-label="Écran ${n + 1}"></button>`).join("");
    container.innerHTML = `
      <div class="min-h-dvh bg-[#0A0A0A] text-white flex flex-col lg:grid lg:grid-cols-2">
        <div class="relative flex-1 lg:h-dvh overflow-hidden">
          <img src="${s.img}" alt="" class="absolute inset-0 w-full h-full object-cover animate-kenburns" key="${i}"/>
          <div class="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-[#0A0A0A]/40 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#0A0A0A]"></div>
          <header class="absolute top-0 inset-x-0 p-5 lg:p-8 flex items-center justify-between">
            <div class="flex items-center gap-2.5"><img src="./assets/youss-logo-transparent.png" alt="" class="w-9 h-9 object-contain bg-white rounded-xl p-1"/><span class="font-extrabold tracking-tight">YOUSS CONNECT</span></div>
            <button type="button" onclick="Screens._finishOnboarding()" class="lg:hidden t-small font-semibold text-white/80 h-9 px-3 rounded-full bg-white/10">${I18N.t("skip")}</button>
          </header>
        </div>
        <div class="relative px-6 pb-8 pt-2 lg:p-16 xl:p-24 flex flex-col justify-center lg:h-dvh">
          <button type="button" onclick="Screens._finishOnboarding()" class="hidden lg:inline-flex absolute top-8 right-8 t-small font-semibold text-white/70 hover:text-white">${I18N.t("skip")}</button>
          <span class="badge bg-gold/15 text-gold w-max mb-4">${s.tag} · ${i + 1}/${ONBOARD.length}</span>
          <h1 class="t-display text-balance animate-screen-in">${s.title}</h1>
          <p class="t-body lg:text-[17px] lg:leading-[28px] text-white/75 mt-4 max-w-[480px] animate-screen-in" style="animation-delay:.05s">${s.body}</p>
          <div class="flex items-center gap-1.5 mt-8">${dots}</div>
          <div class="flex flex-col sm:flex-row gap-3 mt-8 max-w-[480px]">
            ${i > 0 ? `<button type="button" onclick="App.replace('onboarding',{i:${i - 1}})" class="btn btn-lg bg-white/10 text-white sm:w-auto" aria-label="${I18N.t("back")}">${icon("arrow_back")}</button>` : ""}
            <button type="button" onclick="${last ? "Screens._finishOnboarding()" : `App.replace('onboarding',{i:${i + 1}})`}" class="btn btn-lg btn-primary flex-1">${last ? I18N.t("start") : I18N.t("next")}${icon("arrow_forward", "text-[20px]")}</button>
          </div>
          ${last ? `<button type="button" onclick="Screens._finishOnboarding('login')" class="mt-4 t-small text-white/70 hover:text-white text-left">J'ai déjà un compte · <span class="font-bold text-gold">Se connecter</span></button>` : ""}
          <p class="mt-10 t-caption text-white/35">Portée par KYA CORPORATION</p>
        </div>
      </div>`;
  };
  Screens._finishOnboarding = function (target) {
    ACState.session.onboardingSeen = true;
    ACStore.emit();
    App.resetTo(target || "login");
  };

  /* ---------- Cadre d'authentification (split desktop) ---------- */
  function authFrame(formHtml, opts) {
    opts = opts || {};
    return `
    <div class="min-h-dvh lg:grid lg:grid-cols-[1fr_1.1fr] xl:grid-cols-2">
      <aside class="hidden lg:flex relative overflow-hidden bg-[#0A0A0A] text-white flex-col justify-between p-12 xl:p-16">
        <img src="${IMG}brand/brand-hero.jpg" alt="" class="absolute inset-0 w-full h-full object-cover opacity-70"/>
        <div class="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/40"></div>
        <div class="relative flex items-center gap-3"><img src="./assets/youss-logo-transparent.png" alt="" class="w-12 h-12 object-contain bg-white rounded-2xl p-1.5"/><div><p class="font-extrabold tracking-tight text-lg leading-tight">YOUSS CONNECT</p><p class="t-caption text-white/60">KYA CORPORATION</p></div></div>
        <div class="relative max-w-[460px]">
          <h2 class="t-display text-balance">Une seule application pour vivre l'Afrique au quotidien.</h2>
          <p class="t-body text-white/70 mt-4 leading-relaxed">Transport, livraison, restaurants, événements, Youss Market, culture & tourisme, Youss Wallet, Youss Bonus et Youss Business — un compte unique, des services connectés.</p>
          <div class="flex flex-wrap gap-2 mt-6">${["Cotonou", "Dakar", "Lomé", "Accra"].map((c) => `<span class="badge bg-white/10 text-white">${icon("location_on", "text-gold text-[14px]", true)}${c}</span>`).join("")}</div>
        </div>
        <p class="relative t-caption text-white/40">Maquette interactive · données de démonstration</p>
      </aside>
      <main class="min-h-dvh flex flex-col">
        <header class="flex items-center justify-between px-5 lg:px-12 h-16">
          ${opts.back ? `<button type="button" onclick="${opts.back}" class="icon-btn" aria-label="${I18N.t("back")}">${icon("arrow_back")}</button>` : `<span></span>`}
          <button type="button" onclick="App.nav('about')" class="t-small font-semibold text-ink-2 hover:text-ink">${I18N.t("nav_about")}</button>
        </header>
        <div class="flex-1 flex items-start lg:items-center justify-center px-5 pb-10 lg:px-12">
          <div class="w-full max-w-[440px]">${formHtml}</div>
        </div>
      </main>
    </div>`;
  }
  const brand = (title, sub) => `
    <div class="text-center lg:text-left mb-7">
      <img src="./assets/youss-logo-full.png" alt="YOUSS CONNECT" class="w-28 h-auto mx-auto lg:mx-0 lg:hidden mb-4"/>
      <h1 class="t-h1">${title}</h1><p class="t-body text-ink-2 mt-1.5">${sub}</p>
    </div>`;

  /* ---------- Connexion ---------- */
  Screens.login = function (container) {
    const form = `${brand(I18N.t("login"), "Heureux de vous revoir. Compte démo : n'importe quel numéro, code OTP 1234.")}
      <form onsubmit="event.preventDefault();Screens._doLogin()" class="space-y-4" novalidate>
        ${phoneField("li-phone", ACState.user.phone)}
        ${UI.field("li-pass", I18N.t("password"), { type: "password", placeholder: "••••••••", autocomplete: "current-password" })}
        ${UI.error("li-error")}
        <div class="flex items-center justify-between">
          <label class="inline-flex items-center gap-2 t-small text-ink-2"><input type="checkbox" class="form-checkbox rounded border-line text-gold focus:ring-gold/40" checked/>Rester connecté</label>
          <button type="button" onclick="App.nav('forgotPassword')" class="t-small font-bold text-gold-deep dark:text-gold">${I18N.t("forgot")}</button>
        </div>
        <button type="submit" class="btn btn-lg btn-primary btn-block">${I18N.t("login")}${icon("arrow_forward", "text-[20px]")}</button>
        ${UI.secondaryButton(I18N.t("signup"), "App.nav('signup')", { size: "lg" })}
      </form>
      <div class="flex items-center gap-3 my-6 t-small text-ink-3"><span class="flex-1 divider"></span>ou<span class="flex-1 divider"></span></div>
      ${UI.darkButton("Explorer la démo sans compte", "Screens._enterDemo()", { icon: "play_arrow", size: "lg" })}
      <p class="t-small text-ink-3 text-center mt-6">En continuant, vous acceptez les conditions d'utilisation de la maquette YOUSS CONNECT.</p>`;
    container.innerHTML = authFrame(form, { back: ACState.session.onboardingSeen ? "App.replace('onboarding',{i:4})" : null });
  };
  function phoneField(id, value) {
    const c = YCData.countryOf(ACState.user.countryCode);
    return `<label class="block"><span class="label">${I18N.t("phone")}</span>
      <span class="flex gap-2">
        <select id="${id}-dial" class="select w-[128px] flex-shrink-0" aria-label="Indicatif">${YCData.COUNTRIES.map((x) => `<option value="${x.code}" ${x.code === c.code ? "selected" : ""}>${x.flag} ${x.dial}</option>`).join("")}</select>
        <input id="${id}" type="tel" inputmode="tel" value="${esc((value || "").replace(/^\+\d+\s?/, ""))}" placeholder="97 00 00 00" autocomplete="tel-national" class="input"/>
      </span></label>`;
  }
  function readPhone(id) {
    const code = document.getElementById(id + "-dial").value;
    const c = YCData.countryOf(code);
    const digits = document.getElementById(id).value.replace(/[^\d]/g, "");
    return { ok: digits.length >= 8, phone: c.dial + " " + digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim(), country: c };
  }
  Screens._doLogin = function () {
    const p = readPhone("li-phone");
    const pass = document.getElementById("li-pass").value;
    if (!p.ok) return UI.showError("li-error", "Indiquez un numéro de téléphone valide (8 chiffres minimum).");
    if (!pass) return UI.showError("li-error", "Indiquez votre mot de passe.");
    ACState.user.phone = p.phone; ACState.user.countryCode = p.country.code; ACState.user.dial = p.country.dial; ACState.user.country = p.country.name;
    if (window.YCBackend && YCBackend.configured()) {
      YCBackend.sendOtp(p.phone).then((res) => { if (res && res.error) UI.showError("li-error", YCBackend.explain(res.error)); else App.nav("otp", { next: "home" }); });
      return;
    }
    App.nav("otp", { next: "home" });
  };
  Screens._enterDemo = function () {
    ACState.session.authenticated = true; ACState.session.onboardingSeen = true;
    ACStore.emit();
    UI.toast("Bienvenue " + ACState.user.name + " · mode démonstration", "success");
    App.resetTo("home");
  };

  /* ---------- Mot de passe oublié ---------- */
  Screens.forgotPassword = function (container) {
    const form = `${brand(I18N.t("forgot"), "Un code de réinitialisation sera envoyé par SMS. En démo, le code reste 1234.")}
      <form onsubmit="event.preventDefault();Screens._doForgot()" class="space-y-4" novalidate>
        ${phoneField("fp-phone", ACState.user.phone)}${UI.error("fp-error")}
        <button type="submit" class="btn btn-lg btn-primary btn-block">Envoyer le code${icon("sms", "text-[20px]")}</button>
      </form>`;
    container.innerHTML = authFrame(form, { back: "App.back()" });
  };
  Screens._doForgot = function () {
    const p = readPhone("fp-phone");
    if (!p.ok) return UI.showError("fp-error", "Indiquez un numéro valide.");
    ACState.user.phone = p.phone;
    App.nav("otp", { next: "login", mode: "reset" });
  };

  /* ---------- Inscription ---------- */
  Screens.signup = function (container, params) {
    const code = (params && params.country) || ACState.user.countryCode || "BJ";
    const c = YCData.countryOf(code);
    const form = `${brand(I18N.t("signup"), "Un compte unique pour tous les services, dans 4 pays.")}
      <form onsubmit="event.preventDefault();Screens._doSignup()" class="space-y-4" novalidate>
        <div class="grid grid-cols-2 gap-3">${UI.field("su-first", "Prénom", { placeholder: "Alassane", autocomplete: "given-name" })}${UI.field("su-last", "Nom", { placeholder: "Koffi", autocomplete: "family-name" })}</div>
        ${phoneField("su-phone", "")}
        ${UI.field("su-email", "E-mail", { type: "email", placeholder: "vous@exemple.com", autocomplete: "email" })}
        <div class="grid grid-cols-2 gap-3">
          ${UI.select("su-country", "Pays", YCData.COUNTRIES.map((x) => ({ value: x.code, label: x.flag + " " + x.name })), c.code, "Screens._syncCities()")}
          ${UI.select("su-city", "Ville", c.cities, c.cities[0])}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${UI.field("su-pass", I18N.t("password"), { type: "password", placeholder: "8 caractères min.", autocomplete: "new-password" })}${UI.field("su-pass2", "Confirmation", { type: "password", placeholder: "••••••••", autocomplete: "new-password" })}</div>
        <div id="su-strength" class="h-1 rounded-full bg-line overflow-hidden"><div class="h-full w-0 bg-gold transition-all"></div></div>
        ${UI.error("su-error")}
        <label class="flex items-start gap-2 t-small text-ink-2"><input id="su-terms" type="checkbox" class="form-checkbox mt-0.5 rounded border-line text-gold focus:ring-gold/40"/>J'accepte les conditions d'utilisation et la politique de confidentialité.</label>
        <button type="submit" class="btn btn-lg btn-primary btn-block">Recevoir le code OTP${icon("arrow_forward", "text-[20px]")}</button>
        <button type="button" onclick="App.nav('login')" class="w-full t-small text-center text-ink-2">J'ai déjà un compte · <span class="font-bold text-gold-deep dark:text-gold">${I18N.t("login")}</span></button>
      </form>`;
    container.innerHTML = authFrame(form, { back: "App.back()" });
    const pass = document.getElementById("su-pass");
    if (pass) pass.addEventListener("input", function () {
      const v = this.value; let s = 0; if (v.length >= 8) s++; if (/[A-Z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^\w]/.test(v)) s++;
      const bar = document.querySelector("#su-strength > div"); if (bar) { bar.style.width = (s * 25) + "%"; bar.className = "h-full transition-all " + (s < 2 ? "bg-danger" : s < 4 ? "bg-warn" : "bg-success"); }
    });
  };
  Screens._syncCities = function () {
    const code = document.getElementById("su-country").value;
    const c = YCData.countryOf(code);
    document.getElementById("su-city").innerHTML = c.cities.map((x) => `<option>${x}</option>`).join("");
    const dial = document.getElementById("su-phone-dial"); if (dial) dial.value = code;
  };
  Screens._doSignup = function () {
    const first = document.getElementById("su-first").value.trim(), last = document.getElementById("su-last").value.trim();
    const p = readPhone("su-phone");
    const email = document.getElementById("su-email").value.trim();
    const pass = document.getElementById("su-pass").value, pass2 = document.getElementById("su-pass2").value;
    if (!first || !last) return UI.showError("su-error", "Indiquez votre prénom et votre nom.");
    if (!p.ok) return UI.showError("su-error", "Indiquez un numéro de téléphone valide.");
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return UI.showError("su-error", "Adresse e-mail invalide.");
    if (pass.length < 8) return UI.showError("su-error", "Le mot de passe doit contenir au moins 8 caractères.");
    if (pass !== pass2) return UI.showError("su-error", "Les mots de passe ne correspondent pas.");
    if (!document.getElementById("su-terms").checked) return UI.showError("su-error", "Veuillez accepter les conditions d'utilisation.");
    const c = YCData.countryOf(document.getElementById("su-country").value);
    Object.assign(ACState.user, { fullName: first + " " + last, name: first, phone: p.phone, email: email || ACState.user.email, country: c.name, countryCode: c.code, dial: c.dial, city: document.getElementById("su-city").value, verified: false });
    ACStore.emit();
    if (window.YCBackend && YCBackend.configured()) {
      sessionStorage.setItem("yc-pending-name", ACState.user.fullName);
      YCBackend.sendOtp(p.phone, ACState.user.fullName).then((res) => { if (res && res.error) UI.showError("su-error", YCBackend.explain(res.error)); else App.nav("otp", { next: "home" }); });
      return;
    }
    App.nav("otp", { next: "home" });
  };

  /* ---------- OTP ---------- */
  let otpTimer = null;
  Screens.otp = function (container, params) {
    params = params || {};
    const boxes = [0, 1, 2, 3].map((i) => `<input id="otp-${i}" type="text" inputmode="numeric" maxlength="1" autocomplete="one-time-code" class="input input-lg w-14 lg:w-16 text-center text-2xl font-extrabold px-0" oninput="Screens._otpInput(${i}, this)" onkeydown="Screens._otpKey(event, ${i})" aria-label="Chiffre ${i + 1}"/>`).join("");
    const form = `${brand(I18N.t("otp"), "Code envoyé au <b>" + esc(ACState.user.phone) + "</b>. Démo : <b>1234</b>.")}
      <div class="flex justify-center lg:justify-start gap-3" onpaste="Screens._otpPaste(event)">${boxes}</div>
      ${UI.error("otp-error")}
      <p class="t-small text-ink-2 mt-5 text-center lg:text-left">Vous n'avez rien reçu ? <button type="button" id="otp-resend" onclick="Screens._otpResend()" class="font-bold text-ink-3" disabled>Renvoyer (30 s)</button></p>
      <div class="mt-6">${UI.primaryButton("Valider", `Screens._doOtp('${esc(params.next || "home")}','${esc(params.mode || "")}')`, { size: "lg", iconRight: "arrow_forward" })}</div>
      <button type="button" onclick="App.back()" class="w-full t-small text-ink-2 mt-4">Modifier le numéro</button>`;
    container.innerHTML = authFrame(form, { back: "App.back()" });
    setTimeout(() => { const f = document.getElementById("otp-0"); if (f) f.focus(); }, 50);
    clearInterval(otpTimer);
    let left = 30;
    otpTimer = setInterval(() => {
      left--; const b = document.getElementById("otp-resend"); if (!b) { clearInterval(otpTimer); return; }
      if (left <= 0) { b.disabled = false; b.textContent = "Renvoyer le code"; b.className = "font-bold text-gold-deep dark:text-gold"; clearInterval(otpTimer); }
      else b.textContent = "Renvoyer (" + left + " s)";
    }, 1000);
  };
  Screens._otpInput = function (i, el) {
    el.value = el.value.replace(/\D/g, "").slice(-1);
    if (el.value && i < 3) document.getElementById("otp-" + (i + 1)).focus();
    if (i === 3 && el.value) { const code = otpCode(); if (code.length === 4) setTimeout(() => document.querySelector(".btn-primary") && Screens._doOtpAuto(), 120); }
  };
  Screens._otpKey = function (ev, i) { if (ev.key === "Backspace" && !ev.target.value && i > 0) document.getElementById("otp-" + (i - 1)).focus(); };
  Screens._otpPaste = function (ev) {
    const txt = (ev.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 4);
    if (!txt) return; ev.preventDefault();
    txt.split("").forEach((ch, i) => { const el = document.getElementById("otp-" + i); if (el) el.value = ch; });
    const last = document.getElementById("otp-" + Math.min(3, txt.length - 1)); if (last) last.focus();
  };
  Screens._otpResend = function () { UI.toast("Nouveau code envoyé (démo : 1234).", "success"); App.replace("otp", App.current.params); };
  function otpCode() { return [0, 1, 2, 3].map((i) => (document.getElementById("otp-" + i) || {}).value || "").join(""); }
  Screens._doOtpAuto = function () { const p = App.current.params || {}; Screens._doOtp(p.next || "home", p.mode || ""); };
  Screens._doOtp = function (next, mode) {
    const code = otpCode();
    if (code.length < 4) return UI.showError("otp-error", "Saisissez les 4 chiffres du code.");
    if (window.YCBackend && YCBackend.configured() && YCBackend.isReady()) {
      YCBackend.verifyOtp(ACState.user.phone, code).then((res) => {
        if (res && res.error) return UI.showError("otp-error", YCBackend.explain(res.error));
        finishAuth(next, mode);
      });
      return;
    }
    if (code !== "1234") { UI.showError("otp-error", "Code incorrect. Réessayez (démo : 1234)."); [0, 1, 2, 3].forEach((i) => { const el = document.getElementById("otp-" + i); if (el) el.classList.add("border-danger"); }); return; }
    finishAuth(next, mode);
  };
  function finishAuth(next, mode) {
    clearInterval(otpTimer);
    if (mode === "reset") { UI.toast("Code validé. Choisissez un nouveau mot de passe (démo).", "success"); App.resetTo("login"); return; }
    ACState.session.authenticated = true; ACState.session.onboardingSeen = true;
    ACStore.emit();
    UI.toast("Bienvenue " + ACState.user.name + " !", "success");
    const after = sessionStorage.getItem("yc-after-login");
    if (after) { sessionStorage.removeItem("yc-after-login"); location.hash = after; return; }
    App.resetTo(next || "home");
  }

  /* ---------- Présentation (landing investisseurs, accessible sans compte) ---------- */
  Screens.about = function (container) {
    const pillars = [
      { icon: "directions_car", t: "Transport", d: "Voiture, moto, premium. Itinéraire réel, suivi, SOS." },
      { icon: "local_shipping", t: "Livraison", d: "Repas, colis, documents, produits. Suivi du livreur." },
      { icon: "restaurant", t: "Restaurants", d: "Fiches, menus, panier, commande et suivi." },
      { icon: "confirmation_number", t: "Événements", d: "Billetterie numérique avec QR Code." },
      { icon: "storefront", t: "Youss Market", d: "Marketplace de produits locaux et artisanat." },
      { icon: "account_balance", t: "Culture & Tourisme", d: "Destinations, monuments, scanner culturel." },
      { icon: "account_balance_wallet", t: "Youss Wallet", d: "Portefeuille conceptuel : envoi, QR Pay, recharge." },
      { icon: "workspace_premium", t: "Youss Bonus", d: "Points et récompenses sur tous les services." },
      { icon: "business_center", t: "Youss Business", d: "Espace professionnel : produits, commandes, statistiques." }
    ];
    const body = `
      <section class="relative rounded-3xl overflow-hidden bg-[#0A0A0A] text-white p-6 lg:p-14 min-h-[320px] flex flex-col justify-end">
        <img src="${IMG}brand/brand-hero.jpg" alt="" class="absolute inset-0 w-full h-full object-cover opacity-60"/>
        <div class="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent"></div>
        <div class="relative max-w-[720px]">
          <img src="./assets/youss-logo-on-dark.png" alt="YOUSS CONNECT" class="w-24 lg:w-32 mb-4"/>
          <h1 class="t-display text-balance">La super application africaine qui connecte mobilité, services, commerce, événements, culture et tourisme.</h1>
          <p class="t-body lg:text-[17px] text-white/75 mt-4">Portée par KYA CORPORATION · Cotonou, Dakar, Lomé, Accra</p>
          <div class="flex flex-wrap gap-3 mt-6">${ACState.session.authenticated ? UI.primaryButton("Ouvrir l'application", "App.resetTo('home')", { block: false, iconRight: "arrow_forward" }) : UI.primaryButton("Essayer la démo", "Screens._enterDemo()", { block: false, iconRight: "arrow_forward" })}${UI.button("Parcours guidés", "Demo.openMenu()", { variant: "outline", block: false, cls: "!bg-white/10 !text-white !border-white/20", icon: "play_circle" })}</div>
        </div>
      </section>
      <section>${UI.sectionTitle("Neuf services, un seul compte")}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">${pillars.map((p) => `<div class="card p-5 flex gap-4"><span class="w-12 h-12 rounded-2xl bg-gold-soft text-gold-deep flex items-center justify-center flex-shrink-0">${icon(p.icon, "text-[24px]")}</span><div><h3 class="t-title">${p.t}</h3><p class="t-small text-ink-2 mt-0.5">${p.d}</p></div></div>`).join("")}</div>
      </section>
      <section class="grid lg:grid-cols-2 gap-6">
        <div class="card p-6"><h2 class="t-h2 mb-3">Le problème</h2><p class="t-body text-ink-2 leading-relaxed">Pour se déplacer, commander, acheter, trouver un événement ou visiter un lieu, l'utilisateur multiplie les applications, les comptes et les moyens de paiement. Les services ne communiquent pas et les acteurs locaux restent peu visibles.</p></div>
        <div class="card-dark p-6"><h2 class="t-h2 mb-3 text-gold">La réponse YOUSS CONNECT</h2><p class="t-body text-white/80 leading-relaxed">Un compte unique, une interface unique et surtout l'interconnexion : événement → billet → transport → restaurant → commande → retour. Tourisme → monument → scanner → histoire → restaurant → course. Chaque service renforce les autres.</p></div>
      </section>
      <section>${UI.sectionTitle("Quatre villes de démonstration")}
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${YCData.DESTINATIONS.map((c) => UI.destinationCard(c, true)).join("")}</div>
      </section>
      <section class="card p-6 lg:p-8 text-center"><p class="t-caption text-ink-3 mb-2">Portée par KYA CORPORATION</p><p class="t-h2">Une seule application pour vivre l'Afrique au quotidien.</p><p class="t-small text-ink-3 mt-3">Maquette interactive — données fictives. Aucune banque, opérateur ou entreprise n'est présenté comme partenaire officiel.</p></section>`;
    if (!ACState.session.authenticated) {
      container.innerHTML = `<div class="min-h-dvh"><header class="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-line"><div class="max-w-content mx-auto px-5 lg:px-10 h-16 flex items-center justify-between"><button type="button" onclick="App.back()" class="icon-btn" aria-label="Retour">${icon("arrow_back")}</button><span class="font-extrabold tracking-tight">YOUSS CONNECT</span>${UI.primaryButton(I18N.t("login"), "App.nav('login')", { block: false, size: "sm" })}</div></header><main class="max-w-content mx-auto px-5 lg:px-10 py-6 lg:py-10 space-y-8">${body}</main></div>`;
      return;
    }
    Shell.render(container, { title: I18N.t("nav_about"), subtitle: "YOUSS CONNECT en un coup d'œil", back: true, body, nav: false, showNav: true });
  };
})();
