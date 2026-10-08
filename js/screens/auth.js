(function () {
  "use strict";
  window.Screens = window.Screens || {};

  var ONBOARD = [
    { title: "Se déplacer facilement", body: "Voiture, moto ou véhicule premium. Une course, un suivi, un paiement — dans toute la ville." },
    { title: "Livraison, restaurants, commerce", body: "Faites livrer un colis, commandez un repas ou achetez un produit local depuis la même application." },
    { title: "Événements et activités", body: "Concerts, festivals, spectacles et sports : découvrez, réservez, puis retrouvez votre billet numérique." },
    { title: "Culture et tourisme", body: "Destinations, monuments et scanner culturel pour vivre l'histoire de l'Afrique, pas seulement la traverser." },
    { title: "Un seul écosystème", body: "Transport, services, commerce, événements, culture et Wallet. YOUSS CONNECT relie tout." }
  ];

  Screens.splash = function (container) {
    container.innerHTML = `
      <div id="yc-splash-root" class="yc-splash-white relative flex-1 flex flex-col overflow-hidden select-none bg-white">
        <main class="flex-1 flex flex-col items-center justify-center px-space-24 text-center">
          <p class="font-label-sm text-label-sm tracking-[0.28em] text-secondary font-bold">KYA CORPORATION</p>
          <h1 class="mt-4 font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight">YOUSS CONNECT</h1>
          <p class="yc-anim yc-anim-d1 mt-space-16 font-body-md text-body-md text-on-surface-variant max-w-[280px] leading-relaxed">
            Une seule application pour vivre l'Afrique au quotidien.
          </p>
          <div class="mt-10 w-8 h-8 rounded-full border-2 border-secondary/30 border-t-secondary animate-spin"></div>
        </main>
      </div>`;
    setTimeout(function () { Screens._leaveSplash(); }, 1800);
  };

  Screens._leaveSplash = function () {
    if (App.current && App.current.id !== "splash") return;
    var root = document.getElementById("yc-splash-root");
    if (root) root.classList.add("yc-splash--exit");
    setTimeout(function () {
      App.replace(ACState.session.authenticated ? "home" : "onboarding");
    }, 240);
  };

  Screens.onboarding = function (container, params) {
    var i = Math.min(ONBOARD.length - 1, Math.max(0, (params && params.i) || 0));
    var last = i === ONBOARD.length - 1;
    var s = ONBOARD[i];
    container.innerHTML = `
      <div class="yc-onboard relative flex-1 flex flex-col overflow-hidden text-white select-none">
        <div class="yc-splash-skyline" aria-hidden="true"></div>
        <header class="relative z-10 flex items-center justify-between px-space-20 pt-space-20">
          <p class="font-label-sm text-label-sm tracking-[0.2em] text-secondary font-bold">YOUSS CONNECT</p>
          <button type="button" onclick="Screens._enterDemo()" class="font-label-md text-label-md text-white/70">Passer</button>
        </header>
        <main class="relative z-10 flex-1 flex flex-col px-space-24 pb-space-32 justify-end">
          <div class="flex-1 flex flex-col justify-center max-w-[320px]">
            <p class="font-label-sm text-label-sm text-secondary mb-3">${i + 1} / ${ONBOARD.length}</p>
            <h1 class="font-headline-lg text-headline-lg font-extrabold leading-tight mb-space-12">${s.title}</h1>
            <p class="font-body-md text-body-md text-white/75 leading-relaxed">${s.body}</p>
          </div>
          <div class="flex gap-1.5 mb-space-20">
            ${ONBOARD.map(function (_, n) {
              return '<span class="h-1 rounded-full flex-1 ' + (n <= i ? "bg-secondary" : "bg-white/20") + '"></span>';
            }).join("")}
          </div>
          <button type="button" onclick="${last ? "Screens._enterDemo()" : "App.replace('onboarding',{i:" + (i + 1) + "})"}"
            class="yc-btn-green w-full h-14 rounded-2xl flex items-center justify-center font-label-lg text-label-lg active:scale-[0.98] transition-transform">
            ${last ? "Commencer" : "Suivant"}
          </button>
          ${last ? `<button type="button" onclick="App.nav('login')" class="mt-3 yc-btn-ghost w-full h-12 rounded-2xl font-label-lg text-label-lg">Se connecter</button>` : ""}
        </main>
      </div>`;
  };

  Screens._enterDemo = function () {
    ACState.session.authenticated = true;
    ACState.session.onboardingSeen = true;
    App.resetTo("home");
  };

  function field(id, label, type, placeholder, value) {
    return `
    <label class="flex flex-col space-y-1">
      <span class="font-label-md text-label-md text-on-surface-variant">${label}</span>
      <input id="${id}" type="${type}" ${value ? 'value="' + value + '"' : ""} placeholder="${placeholder}" class="h-12 rounded-xl border border-outline-variant/50 bg-white px-space-16 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary"/>
    </label>`;
  }

  function showErr(el, msg) {
    el.textContent = msg;
    el.classList.remove("hidden");
  }

  var COUNTRIES = [
    { code: "BJ", name: "Bénin", dial: "+229", city: "Cotonou" }
  ];

  function countryOptions(selected) {
    return COUNTRIES.map(function (c) {
      var sel = c.name === selected ? " selected" : "";
      return '<option value="' + c.name + '"' + sel + ">" + c.name + "</option>";
    }).join("");
  }

  function cityOptions(country, selected) {
    var cities = { "Bénin": ["Cotonou", "Porto-Novo", "Ouidah", "Abomey", "Parakou"] };
    return (cities[country] || cities["Bénin"]).map(function (c) {
      return '<option' + (c === selected ? " selected" : "") + ">" + c + "</option>";
    }).join("");
  }

  Screens.login = function (container) {
    container.innerHTML = `
      ${UI.topBar({ title: "Connexion", back: "App.back()" })}
      <main class="flex-1 flex flex-col px-space-20 space-y-space-16 overflow-y-auto pb-space-24">
        <div class="text-center py-2">
          <p class="font-label-sm text-label-sm tracking-[0.22em] text-secondary font-bold">YOUSS CONNECT</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-2">Portée par KYA CORPORATION</p>
        </div>
        ${field("li-phone", "Numéro de téléphone", "tel", "+229 97 00 00 00")}
        ${field("li-pass", "Mot de passe", "password", "••••••••")}
        <div id="li-error" class="hidden font-body-sm text-body-sm text-error"></div>
        <button type="button" onclick="App.nav('forgotPassword')" class="text-left font-label-md text-label-md text-secondary">Mot de passe oublié</button>
        <div class="pt-space-8">${UI.primaryButton("Connexion", "Screens._doLogin()")}</div>
        ${UI.secondaryButton("Créer un compte", "App.nav('signup')")}
      </main>`;
  };

  Screens._doLogin = function () {
    var phone = document.getElementById("li-phone").value.trim();
    var pass = document.getElementById("li-pass").value;
    var err = document.getElementById("li-error");
    if (phone.length < 8) return showErr(err, "Indiquez un numéro de téléphone valide.");
    if (!pass) return showErr(err, "Indiquez votre mot de passe.");
    ACState.user.phone = phone;
    App.nav("otp", { next: "home" });
  };

  Screens.forgotPassword = function (container) {
    container.innerHTML = `
      ${UI.topBar({ title: "Mot de passe oublié", back: "App.back()" })}
      <main class="flex-1 flex flex-col px-space-20 space-y-space-16">
        <p class="font-body-sm text-body-sm text-on-surface-variant">Un code de réinitialisation sera envoyé par SMS. En démo, le code reste 1234.</p>
        ${field("fp-phone", "Numéro de téléphone", "tel", ACState.user.phone)}
        ${UI.primaryButton("Envoyer le code", "App.nav('otp',{next:'login'})")}
      </main>`;
  };

  Screens.signup = function (container) {
    var country = ACState.user.country || "Bénin";
    container.innerHTML = `
      ${UI.topBar({ title: "Créer un compte", back: "App.back()" })}
      <main class="flex-1 flex flex-col px-space-20 space-y-space-12 overflow-y-auto pb-space-24">
        <p class="font-body-sm text-body-sm text-on-surface-variant">Rejoignez YOUSS CONNECT. Un compte unique pour tous les services.</p>
        ${field("su-last", "Nom", "text", "Koffi")}
        ${field("su-first", "Prénom", "text", "Alassane")}
        ${field("su-phone", "Numéro de téléphone", "tel", "+229 97 00 00 00")}
        ${field("su-email", "E-mail", "email", "alassane@example.com")}
        <label class="flex flex-col space-y-1">
          <span class="font-label-md text-label-md text-on-surface-variant">Pays</span>
          <select id="su-country" onchange="Screens._syncCities()" class="h-12 rounded-xl border border-outline-variant/50 bg-white px-space-16 font-body-md text-body-md">${countryOptions(country)}</select>
        </label>
        <label class="flex flex-col space-y-1">
          <span class="font-label-md text-label-md text-on-surface-variant">Ville</span>
          <select id="su-city" class="h-12 rounded-xl border border-outline-variant/50 bg-white px-space-16 font-body-md text-body-md">${cityOptions(country, ACState.user.city)}</select>
        </label>
        ${field("su-pass", "Mot de passe", "password", "••••••••")}
        ${field("su-pass2", "Confirmation du mot de passe", "password", "••••••••")}
        <div id="su-error" class="hidden font-body-sm text-body-sm text-error"></div>
        <div class="pt-space-8">${UI.primaryButton("Recevoir le code OTP", "Screens._doSignup()")}</div>
        <button onclick="App.nav('login')" class="font-label-md text-label-md text-secondary text-center">J'ai déjà un compte</button>
      </main>`;
  };

  Screens._syncCities = function () {
    var country = document.getElementById("su-country").value;
    document.getElementById("su-city").innerHTML = cityOptions(country);
  };

  Screens._doSignup = function () {
    var last = document.getElementById("su-last").value.trim();
    var first = document.getElementById("su-first").value.trim();
    var phone = document.getElementById("su-phone").value.trim();
    var pass = document.getElementById("su-pass").value;
    var pass2 = document.getElementById("su-pass2").value;
    var err = document.getElementById("su-error");
    if (!last || !first) return showErr(err, "Indiquez votre nom et votre prénom.");
    if (phone.length < 8) return showErr(err, "Indiquez un numéro de téléphone valide.");
    if (pass.length < 4) return showErr(err, "Le mot de passe doit contenir au moins 4 caractères.");
    if (pass !== pass2) return showErr(err, "Les mots de passe ne correspondent pas.");
    ACState.user.fullName = first + " " + last;
    ACState.user.name = first;
    ACState.user.phone = phone;
    ACState.user.email = document.getElementById("su-email").value.trim() || ACState.user.email;
    ACState.user.country = document.getElementById("su-country").value;
    ACState.user.city = document.getElementById("su-city").value;
    App.nav("otp", { next: "home" });
  };

  Screens.otp = function (container, params) {
    container.innerHTML = `
      ${UI.topBar({ title: "Vérification OTP", back: "App.back()" })}
      <main class="flex-1 flex flex-col px-space-20 space-y-space-20">
        <p class="font-body-md text-body-md text-on-surface-variant">Code envoyé au ${ACState.user.phone}. Démo : <b>1234</b></p>
        <input id="otp-code" inputmode="numeric" maxlength="4" placeholder="••••" class="h-14 rounded-xl border border-outline-variant/50 bg-white px-space-16 text-center tracking-[0.5em] font-headline-md text-headline-md focus:outline-none focus:ring-2 focus:ring-secondary/30"/>
        <div id="otp-error" class="hidden font-body-sm text-body-sm text-error text-center"></div>
        ${UI.primaryButton("Valider", "Screens._doOtp('" + ((params && params.next) || "home") + "')")}
      </main>`;
  };

  Screens._doOtp = function (next) {
    var code = document.getElementById("otp-code").value.trim();
    var err = document.getElementById("otp-error");
    if (code !== "1234") return showErr(err, "Code incorrect. Réessayez (indice : 1234).");
    ACState.session.authenticated = true;
    ACState.session.onboardingSeen = true;
    UI.toast("Bienvenue " + ACState.user.name + " !", "success");
    App.resetTo(next);
  };
})();
