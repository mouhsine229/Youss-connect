// Splash, onboarding, connexion, inscription, OTP et page de présentation
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc } = UI;
  const IMG = YCData.IMG;

  const ONBOARD = [
    { title: "Se déplacer facilement", body: "Voiture, moto ou véhicule premium. Vous commandez, vous suivez le trajet en direct et vous payez depuis l'application, partout en ville.", img: IMG + "onboarding/onb-mobility.jpg", tag: "Mobilité" },
    { title: "Livraison, restaurants, commerce", body: "Faites livrer un colis, commandez un repas ou achetez un produit local depuis la même application, avec le même compte.", img: IMG + "onboarding/onb-services.jpg", tag: "Services" },
    { title: "Événements et activités", body: "Concerts, festivals, conférences, spectacles et sport. Vous réservez et votre billet numérique vous attend dans l'application.", img: IMG + "onboarding/onb-events.jpg", tag: "Événements" },
    { title: "Culture et tourisme africain", body: "Destinations, monuments, musées et un scanner culturel qui raconte l'histoire de chaque lieu que vous visitez.", img: IMG + "onboarding/onb-culture.jpg", tag: "Culture" },
    { title: "Tout au même endroit", body: "Un compte pour le transport, les commandes, les sorties, le Wallet et les Bonus. Cotonou, Dakar, Lomé, Accra.", img: IMG + "onboarding/onb-ecosystem.jpg", tag: "Compte unique" }
  ];

  // Splash
  Screens.splash = function (container) {
    container.innerHTML = `
      <div id="yc-splash" class="min-h-dvh bg-white flex flex-col items-center justify-center text-center px-6 relative overflow-hidden select-none">
        <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gold/10 blur-3xl"></div>
        <div class="absolute -bottom-40 -left-24 w-[28rem] h-[28rem] rounded-full bg-gold/10 blur-3xl"></div>
        <img src="./assets/youss-logo-full.png" alt="YOUSS CONNECT" class="w-[220px] lg:w-[280px] h-auto object-contain animate-pop" width="280" height="248"/>
        <p class="mt-6 t-caption text-[#0A0A0A]/60 tracking-[0.3em] animate-fade-in" style="animation-delay:.3s">Portée par KYA CORPORATION</p>
        <p class="mt-3 t-body lg:text-[17px] text-[#0A0A0A]/80 max-w-[320px] leading-relaxed animate-fade-in" style="animation-delay:.45s">Se déplacer, commander, sortir et payer. Quatre villes.</p>
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
        App.replace("onboarding", { i: 0 });
      }
    }, 260);
  };

  // Onboarding
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
            ${i > 0 ? `<button type="button" onclick="Screens._finishOnboarding('login')" class="lg:hidden t-small font-semibold text-white/80 h-9 px-3 rounded-full bg-white/10">${I18N.t("skip")}</button>` : `<span></span>`}
          </header>
        </div>
        <div class="relative px-6 pb-8 pt-2 lg:p-16 xl:p-24 flex flex-col justify-center lg:h-dvh">
          ${i > 0 ? `<button type="button" onclick="Screens._finishOnboarding('login')" class="hidden lg:inline-flex absolute top-8 right-8 t-small font-semibold text-white/70 hover:text-white">${I18N.t("skip")}</button>` : ""}
          <span class="badge bg-gold/15 text-gold w-max mb-4">${s.tag} · ${i + 1}/${ONBOARD.length}</span>
          <h1 class="t-display text-balance animate-screen-in">${s.title}</h1>
          <p class="t-body lg:text-[17px] lg:leading-[28px] text-white/75 mt-4 max-w-[480px] animate-screen-in" style="animation-delay:.05s">${s.body}</p>
          <div class="flex items-center gap-1.5 mt-8">${dots}</div>
          <div class="flex flex-col sm:flex-row gap-3 mt-8 max-w-[480px]">
            ${i > 0 ? `<button type="button" onclick="App.replace('onboarding',{i:${i - 1}})" class="btn btn-lg bg-white/10 text-white sm:w-auto" aria-label="${I18N.t("back")}">${icon("arrow_back")}</button>` : ""}
            <button type="button" onclick="${last ? "Screens._finishOnboarding('login')" : `App.replace('onboarding',{i:${i + 1}})`}" class="btn btn-lg btn-primary flex-1">${last ? I18N.t("start") : I18N.t("next")}${icon("arrow_forward", "text-[20px]")}</button>
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

  // Cadre d'authentification (split desktop)
  function authFrame(formHtml, opts) {
    opts = opts || {};
    return `
    <div class="min-h-dvh lg:grid lg:grid-cols-[1fr_1.1fr] xl:grid-cols-2">
      <aside class="hidden lg:flex relative overflow-hidden bg-[#0A0A0A] text-white flex-col justify-between p-12 xl:p-16">
        <img src="${IMG}brand/brand-hero.jpg" alt="" class="absolute inset-0 w-full h-full object-cover opacity-70"/>
        <div class="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/40"></div>
        <div class="relative flex items-center gap-3"><img src="./assets/youss-logo-transparent.png" alt="" class="w-12 h-12 object-contain bg-white rounded-2xl p-1.5"/><div><p class="font-extrabold tracking-tight text-lg leading-tight">YOUSS CONNECT</p><p class="t-caption text-white/60">KYA CORPORATION</p></div></div>
        <div class="relative max-w-[460px]">
          <h2 class="t-display text-balance">Se déplacer, commander, sortir et payer. Quatre villes.</h2>
          <p class="t-body text-white/70 mt-4 leading-relaxed">Transport, livraison, restaurants, événements, Youss Market, culture et tourisme, Youss Wallet, Youss Bonus et Youss Business. Un seul compte pour tout, et chaque service parle aux autres.</p>
          <div class="flex flex-wrap gap-2 mt-6">${["Cotonou", "Dakar", "Lomé", "Accra"].map((c) => `<span class="badge bg-white/10 text-white">${icon("location_on", "text-gold text-[14px]", true)}${c}</span>`).join("")}</div>
        </div>
        <p class="relative t-caption text-white/40">YOUSS CONNECT · KYA CORPORATION</p>
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

  // Connexion
  Screens.login = function (container) {
    const form = `${brand(I18N.t("login"), "Entrez l'e-mail et le mot de passe de votre compte YOUSS CONNECT.")}
      <form onsubmit="event.preventDefault();Screens._doLogin()" class="space-y-4" novalidate>
        ${UI.field("li-email", "E-mail", { type: "email", placeholder: "vous@exemple.com", autocomplete: "username" })}
        ${UI.field("li-pass", I18N.t("password"), { type: "password", placeholder: "••••••••", autocomplete: "current-password" })}
        ${UI.error("li-error")}
        <div class="flex items-center justify-end">
          <button type="button" onclick="App.nav('forgotPassword')" class="t-small font-bold text-gold-deep dark:text-gold">${I18N.t("forgot")}</button>
        </div>
        <button type="submit" class="btn btn-lg btn-primary btn-block">${I18N.t("login")}${icon("arrow_forward", "text-[20px]")}</button>
        <p class="t-small text-center text-ink-2 mt-1">Pas encore de compte ? <button type="button" onclick="App.nav('signup')" class="font-bold text-gold-deep dark:text-gold">${I18N.t("signup")}</button></p>
      </form>
      <p class="t-small text-ink-3 text-center mt-6">En continuant, vous acceptez les <button type="button" class="font-bold underline" onclick="App.nav('terms')">conditions d'utilisation</button> de YOUSS CONNECT.</p>`;
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
    const email = document.getElementById("li-email").value.trim();
    const pass = document.getElementById("li-pass").value;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return UI.showError("li-error", "Indiquez l'e-mail du compte.");
    if (!pass) return UI.showError("li-error", "Indiquez votre mot de passe.");
    if (!window.YCBackend || !YCBackend.configured() || !YCBackend.isReady()) return UI.showError("li-error", "Le compte est momentanément indisponible. Réessayez.");
    YCBackend.signIn(email, pass).then(function (res) {
      if (res && res.error) return UI.showError("li-error", YCBackend.explain(res.error));
      finishAuth("home");
    }).catch(function () { UI.showError("li-error", "Connexion impossible. Réessayez."); });
  };

  // Mot de passe oublié
  Screens.forgotPassword = function (container) {
    const form = `${brand(I18N.t("forgot"), "L'envoi d'un code par SMS ou par e-mail n'est pas encore ouvert. Une fois connecté, le mot de passe se change dans Sécurité.")}
      <div class="space-y-4">
        ${UI.primaryButton("Retour à la connexion", "App.nav('login')", { size: "lg", icon: "arrow_back" })}
      </div>`;
    container.innerHTML = authFrame(form, { back: "App.back()" });
  };

  // Inscription
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
        <label class="flex items-start gap-2 t-small text-ink-2"><input id="su-terms" type="checkbox" class="form-checkbox mt-0.5 rounded border-line text-gold focus:ring-gold/40"/><span>J'accepte les <button type="button" class="font-bold underline text-gold-deep dark:text-gold" onclick="event.preventDefault();event.stopPropagation();App.nav('terms')">conditions d'utilisation</button> et la <button type="button" class="font-bold underline text-gold-deep dark:text-gold" onclick="event.preventDefault();event.stopPropagation();App.nav('privacy')">politique de confidentialité</button>.</span></label>
        <button type="submit" class="btn btn-lg btn-primary btn-block">Créer mon compte${icon("arrow_forward", "text-[20px]")}</button>
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
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return UI.showError("su-error", "Indiquez une adresse e-mail. Elle sert à ouvrir le compte.");
    if (pass.length < 8) return UI.showError("su-error", "Le mot de passe doit contenir au moins 8 caractères.");
    if (pass !== pass2) return UI.showError("su-error", "Les mots de passe ne correspondent pas.");
    if (!document.getElementById("su-terms").checked) return UI.showError("su-error", "Veuillez accepter les conditions d'utilisation.");
    if (!window.YCBackend || !YCBackend.configured() || !YCBackend.isReady()) return UI.showError("su-error", "Le compte est momentanément indisponible. Réessayez.");
    const c = YCData.countryOf(document.getElementById("su-country").value);
    const btn = document.querySelector("#su-error") ? document.querySelector("form .btn-primary") : null;
    if (btn) btn.disabled = true;
    YCBackend.signUp({ email: email, password: pass, fullName: first + " " + last, phone: p.phone, city: document.getElementById("su-city").value, country: c.name }).then(function (res) {
      if (btn) btn.disabled = false;
      if (res && res.error) return UI.showError("su-error", YCBackend.explain(res.error));
      finishAuth("home", "signup");
    });
  };

  Screens.otp = function (container) {
    const form = `${brand(I18N.t("otp"), "Le code par SMS n'est pas encore ouvert. Le compte s'ouvre avec l'e-mail et le mot de passe.")}
      ${UI.primaryButton("Aller à la connexion", "App.resetTo('login')", { size: "lg", iconRight: "arrow_forward" })}`;
    container.innerHTML = authFrame(form, { back: "App.back()" });
  };
  function finishAuth(next, mode) {
    ACState.session.authenticated = true; ACState.session.onboardingSeen = true;
    ACStore.emit();
    UI.toast("Bienvenue " + ACState.user.name + " !", "success");
    const after = sessionStorage.getItem("yc-after-login");
    if (after && mode !== "signup") {
      sessionStorage.removeItem("yc-after-login");
      const safe = window.YCGuard ? YCGuard.returnHash(after) : "";
      if (safe) { location.hash = safe; return; }
    }
    if (mode === "signup") { App.resetTo("biometricSetup", { next: next || "home" }); return; }
    App.resetTo(next || "home");
  }

  // Présentation (landing investisseurs, accessible sans compte)
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
          <h1 class="t-display text-balance">Transport, livraison, restos, sorties, achats, culture. Un compte, quatre villes.</h1>
          <p class="t-body lg:text-[17px] text-white/75 mt-4">Portée par KYA CORPORATION · Cotonou, Dakar, Lomé, Accra</p>
          <div class="flex flex-wrap gap-3 mt-6">${ACState.session.authenticated ? UI.primaryButton("Ouvrir l'application", "App.resetTo('home')", { block: false, iconRight: "arrow_forward" }) : UI.primaryButton("Créer un compte", "App.nav('signup')", { block: false, iconRight: "arrow_forward" })}</div>
        </div>
      </section>
      <section>${UI.sectionTitle("Neuf services, un seul compte")}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">${pillars.map((p) => `<div class="card p-5 flex gap-4"><span class="w-12 h-12 rounded-2xl bg-gold-soft text-gold-deep flex items-center justify-center flex-shrink-0">${icon(p.icon, "text-[24px]")}</span><div><h3 class="t-title">${p.t}</h3><p class="t-small text-ink-2 mt-0.5">${p.d}</p></div></div>`).join("")}</div>
      </section>
      <section class="grid lg:grid-cols-2 gap-6">
        <div class="card p-6"><h2 class="t-h2 mb-3">Le problème</h2><p class="t-body text-ink-2 leading-relaxed">Pour se déplacer, commander, acheter, trouver un événement ou visiter un lieu, l'utilisateur multiplie les applications, les comptes et les moyens de paiement. Les services ne communiquent pas et les acteurs locaux restent peu visibles.</p></div>
        <div class="card-dark p-6"><h2 class="t-h2 mb-3 text-gold">La réponse YOUSS CONNECT</h2><p class="t-body text-white/80 leading-relaxed">Un seul compte, une seule interface, et surtout des services qui s'enchaînent. Vous achetez un billet de concert, l'application vous propose la course pour y aller et le restaurant à côté pour après. Vous scannez un monument, vous lisez son histoire, puis vous réservez votre retour. Rien à ressaisir d'un service à l'autre.</p></div>
      </section>
      <section>${UI.sectionTitle("Quatre villes")}
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${YCData.DESTINATIONS.map((c) => UI.destinationCard(c, true)).join("")}</div>
      </section>
      <section class="card p-6 lg:p-8 text-center"><p class="t-caption text-ink-3 mb-2">Portée par KYA CORPORATION</p><p class="t-h2">Se déplacer, commander, sortir et payer. Quatre villes.</p><p class="t-small text-ink-3 mt-3">Les prix, chauffeurs et événements affichés sont des exemples pour Cotonou, Dakar, Lomé et Accra. Aucune banque, aucun opérateur ni aucune entreprise n'est présenté comme partenaire officiel.</p></section>`;
    if (!ACState.session.authenticated) {
      container.innerHTML = `<div class="min-h-dvh"><header class="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-line"><div class="max-w-content mx-auto px-5 lg:px-10 h-16 flex items-center justify-between"><button type="button" onclick="App.back()" class="icon-btn" aria-label="Retour">${icon("arrow_back")}</button><span class="font-extrabold tracking-tight">YOUSS CONNECT</span>${UI.primaryButton(I18N.t("login"), "App.nav('login')", { block: false, size: "sm" })}</div></header><main class="max-w-content mx-auto px-5 lg:px-10 py-6 lg:py-10 space-y-8">${body}</main></div>`;
      return;
    }
    Shell.render(container, { title: I18N.t("nav_about"), subtitle: "Ce que fait l'application", back: true, body, nav: false, showNav: true });
  };

  function L(fr, en) { return window.I18N && I18N.lang === "en" ? en : fr; }
  function legalScreen(container, title, blocks) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4" data-i18n-skip="1">${blocks.map((b) => `<section class="card p-5"><h2 class="t-h3">${b[0]}</h2><p class="t-body text-ink-2 mt-2 leading-relaxed">${b[1]}</p></section>`).join("")}<p class="t-small text-ink-3 text-center">KYA CORPORATION · YOUSS CONNECT</p></div>`;
    Shell.render(container, { title: title, back: true, body, nav: false, showNav: ACState.session.authenticated });
  }
  Screens.terms = function (container) {
    legalScreen(container, L("Conditions d'utilisation", "Terms of use"), [
      [L("Éditeur", "Publisher"), L("YOUSS CONNECT est éditée par KYA CORPORATION. Le service couvre Cotonou, Dakar, Lomé et Accra.", "YOUSS CONNECT is published by KYA CORPORATION. The service covers Cotonou, Dakar, Lomé and Accra.")],
      [L("Compte", "Account"), L("L'inscription demande un nom, un téléphone, un e-mail et un mot de passe d'au moins 8 caractères. Le compte est enregistré pour YOUSS CONNECT. Le code SMS n'est pas encore ouvert.", "Sign-up asks for a name, a phone number, an email and a password of at least 8 characters. The account is stored for YOUSS CONNECT. SMS codes are not open yet.")],
      [L("Services", "Services"), L("Les restaurants, produits, événements, chauffeurs et prix montrés dans les quatre villes sont des exemples. Aucun partenaire n'est présenté comme officiel.", "Restaurants, products, events, drivers and prices shown in the four cities are examples. No partner is presented as official.")],
      [L("Paiements", "Payments"), L("Youss Wallet débite le solde du compte. La recharge, la carte et le paiement mobile ne sont pas encaissés tant qu'un prestataire n'est pas branché. Les espèces se règlent à la livraison ou au chauffeur. Le code PIN est celui que vous choisissez. Le numéro complet de carte et le cryptogramme ne sont pas enregistrés.", "Youss Wallet debits the account balance. Top-up, card and mobile payment are not collected until a provider is connected. Cash is paid on delivery or to the driver. The PIN is the one you choose. The full card number and security code are not stored.")],
      [L("Utilisation acceptable", "Acceptable use"), L("N'utilisez pas l'application pour usurper une identité, harceler quelqu'un ou tenter d'accéder au compte d'une autre personne. Les essais de code sont limités.", "Do not use the app to impersonate someone, harass anyone, or try to access another person's account. Code attempts are limited.")],
      [L("Responsabilité", "Liability"), L("YOUSS CONNECT est fournie en l'état. Elle ne constitue pas encore une offre de paiement bancaire, de transport opéré ou de billetterie partenaire.", "YOUSS CONNECT is provided as is. It is not yet an offer of bank payment, operated transport or partner ticketing.")]
    ]);
  };
  Screens.privacy = function (container) {
    legalScreen(container, L("Politique de confidentialité", "Privacy policy"), [
      [L("Responsable", "Controller"), L("KYA CORPORATION est responsable du traitement décrit ici. Cette politique concerne YOUSS CONNECT.", "KYA CORPORATION is responsible for the processing described here. This policy covers YOUSS CONNECT.")],
      [L("Données", "Data"), L("Le profil (nom, téléphone, e-mail, ville, pays) et le solde du portefeuille sont enregistrés sur le compte YOUSS CONNECT. Les préférences d'affichage restent sur cet appareil.", "The profile (name, phone, email, city, country) and the wallet balance are stored on the YOUSS CONNECT account. Display preferences stay on this device.")],
      [L("Carte bancaire", "Bank card"), L("Si vous enregistrez une carte, seuls la marque, le titulaire, la date d'expiration et les 4 derniers chiffres sont conservés. Le numéro complet et le cryptogramme sont effacés dès la validation. L'encaissement par carte n'est pas encore ouvert.", "If you save a card, only the brand, holder, expiry and last 4 digits are kept. The full number and security code are cleared as soon as you confirm. Card collection is not open yet.")],
      [L("Biométrie", "Biometrics"), L("Sur iPhone, Face ID peut confirmer un paiement. Sur Android, c'est l'empreinte. YOUSS CONNECT enregistre seulement la clé de l'appareil, jamais une image du visage ou du doigt. Le code PIN reste le secours.", "On iPhone, Face ID can confirm a payment. On Android, the fingerprint does. YOUSS CONNECT stores only the device key, never an image of the face or finger. The PIN stays as backup.")],
      [L("Pièce d'identité", "Identity document"), L("Si vous envoyez une pièce, elle est conservée de façon privée le temps de la relecture dans la console KYA. Le compte n'est pas marqué vérifié tant qu'elle n'est pas acceptée.", "If you send an identity document, it is kept privately until the KYA console reviews it. The account is not marked verified until it is accepted.")],
      [L("Partage", "Sharing"), L("Les données du compte ne sont pas vendues. Elles sont conservées pour faire fonctionner YOUSS CONNECT.", "Account data is not sold. It is kept to operate YOUSS CONNECT.")],
      [L("Vos choix", "Your choices"), L("Vous pouvez retirer une carte, changer de ville, changer votre mot de passe et effacer les données locales de l'application depuis les paramètres. Effacer l'appareil ne supprime pas le compte.", "You can remove a card, change city, change your password and erase the app's local data from settings. Clearing the device does not delete the account.")],
      [L("Contact", "Contact"), L("Pour une question sur ces informations, écrivez à KYA CORPORATION depuis le centre d'aide de l'application.", "For a question about this notice, write to KYA CORPORATION from the app's help center.")]
    ]);
  };

  Screens.biometricSetup = function (container) {
    const sensor = window.YCBiometric ? YCBiometric.sensor() : null;
    const title = sensor ? sensor.enroll : L("Code PIN", "PIN");
    const lead = sensor
      ? (sensor.kind === "face"
        ? L("Cet iPhone utilisera Face ID. YOUSS CONNECT garde la clé de l'appareil, pas une image de votre visage. Le code PIN reste le secours.", "This iPhone will use Face ID. YOUSS CONNECT keeps the device key, not an image of your face. The PIN stays as backup.")
        : L("Cet Android utilisera l'empreinte. YOUSS CONNECT garde la clé de l'appareil, pas une image de votre doigt. Le code PIN reste le secours.", "This Android will use the fingerprint. YOUSS CONNECT keeps the device key, not an image of your finger. The PIN stays as backup."))
      : L("Cet appareil n'a pas Face ID ni d'empreinte. Les paiements demanderont le code PIN. Vous pourrez enregistrer le téléphone plus tard, depuis Sécurité.", "This device has neither Face ID nor a fingerprint. Payments will ask for the PIN. You can enroll the phone later, from Security.");
    const body = `<div class="max-w-narrow mx-auto w-full flex flex-col items-center text-center py-6 space-y-5" data-i18n-skip="1">
      <div class="w-28 h-28 rounded-full bg-gold-soft text-gold-deep flex items-center justify-center">${icon(sensor ? sensor.icon : "lock", "text-[56px]")}</div>
      <div><h2 class="t-h2">${title}</h2><p id="bio-status" class="t-body text-ink-2 mt-2">${lead}</p></div>
      ${sensor ? UI.primaryButton(sensor.enroll, "Screens._bioCapture()", { size: "lg", icon: sensor.icon }) : ""}
      <button type="button" onclick="Screens._bioSkip()" class="t-small text-ink-2 underline">${L("Continuer avec le code PIN uniquement", "Continue with PIN only")}</button>
    </div>`;
    Shell.render(container, { title: L("Biométrie", "Biometrics"), back: true, body, nav: false, hideSearch: true });
  };
  function bioNext() {
    const p = (App.current && App.current.params) || {};
    const next = p.next || "home";
    if (next === "securityPin") { App.replace("securityPin", { action: p.action || "purchase" }); return; }
    if (window.YCGuard && next && !YCGuard.screenOk(next)) { App.resetTo("home"); return; }
    App.resetTo(next);
  }
  Screens._bioCapture = function () {
    const el = document.getElementById("bio-status");
    const sensor = window.YCBiometric ? YCBiometric.sensor() : null;
    if (!window.YCBiometric || !window.YCBackend || !YCBackend.isLive()) {
      if (el) el.textContent = L("Connectez-vous pour enregistrer cet appareil.", "Sign in to enroll this device.");
      return;
    }
    if (el) el.textContent = sensor && sensor.kind === "face" ? L("Regardez l'iPhone…", "Look at the iPhone…") : L("Posez le doigt sur le capteur…", "Place your finger on the sensor…");
    YCBiometric.enroll().then(function (res) {
      if (!res || res.ok === false) {
        if (el) el.textContent = (res && res.message) || L("Enregistrement impossible.", "Enrollment failed.");
        return;
      }
      UI.toast(sensor && sensor.kind === "face" ? L("Face ID enregistré pour vos confirmations.", "Face ID saved for your confirmations.") : L("Empreinte enregistrée pour vos confirmations.", "Fingerprint saved for your confirmations."), "success");
      bioNext();
    });
  };
  Screens._bioSkip = function () {
    UI.toast(L("Les paiements demanderont le code PIN.", "Payments will ask for the PIN."), "info");
    bioNext();
  };
})();
