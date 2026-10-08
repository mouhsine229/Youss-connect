(function () {
  "use strict";
  window.Screens = window.Screens || {};

  /* Lieux culturels RÉELS du Bénin — photos Wikimedia Commons */
  const WM = (file) =>
    "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(file) + "?width=800";

  const SITES = {
    c1: {
      id: "c1",
      name: "Palais royaux d'Abomey",
      place: "Abomey, Zou · Bénin",
      body: "Site du patrimoine mondial de l'UNESCO depuis 1985. Les palais des rois du Dahomey (XVIIIe–XIXe s.) abritent aujourd'hui le Musée historique d'Abomey, témoin de l'histoire du royaume et de ses traditions.",
      tone: "from-[#5B2A8F] to-[#3B1466]",
      icon: "account_balance",
      img: WM("Palais_du_roi_Glele.jpg"),
      city: "Abomey"
    },
    c2: {
      id: "c2",
      name: "Porte du Non-Retour",
      place: "Ouidah, Atlantique · Bénin",
      body: "Monument situé au bout de la Route des Esclaves à Ouidah. Elle marque le point d'embarquement des captifs vers les Amériques et constitue un haut lieu de mémoire de la traite atlantique au Bénin.",
      tone: "from-[#0E7C6B] to-[#0B5A4D]",
      icon: "castle",
      img: WM("Door_of_no_return.jpg"),
      city: "Ouidah"
    },
    c3: {
      id: "c3",
      name: "Place de l'Amazone",
      place: "Cotonou, Littoral · Bénin",
      body: "Place publique de Cotonou inaugurée en 2022, dominée par la statue de l'Amazone. Elle rend hommage aux Agojié, guerrières du royaume du Dahomey, symbole fort de l'identité béninoise.",
      tone: "from-[#B45309] to-[#7C2D12]",
      icon: "museum",
      img: WM("Monument_de_l'Amazone_au_Benin.jpg"),
      city: "Cotonou"
    },
    c4: {
      id: "c4",
      name: "Village lacustre de Ganvié",
      place: "Lac Nokoué · Bénin",
      body: "Surnommé la « Venise de l'Afrique », Ganvié est un village sur pilotis sur le lac Nokoué, près de Cotonou. Ses habitants, les Tofinu, y vivent de la pêche et du commerce depuis plusieurs siècles.",
      tone: "from-[#0369A1] to-[#0C4A6E]",
      icon: "water",
      img: WM("Ganvié.jpg"),
      city: "Cotonou"
    },
    c5: {
      id: "c5",
      name: "Marché Dantokpa",
      place: "Cotonou · Bénin",
      body: "Plus grand marché ouvert d'Afrique de l'Ouest, Dantokpa s'étend le long de la lagune de Cotonou. On y trouve tissus wax, produits alimentaires, artisanat et commerce régional.",
      tone: "from-[#CA8A04] to-[#854D0E]",
      icon: "storefront",
      img: WM("Dantokpa.jpg"),
      city: "Cotonou"
    },
    c6: {
      id: "c6",
      name: "Musée Honmé",
      place: "Porto-Novo · Bénin",
      body: "Ancien palais royal de Porto-Novo transformé en musée. Il présente l'histoire, les arts et les traditions du royaume de Porto-Novo.",
      tone: "from-[#1E3A5F] to-[#0F172A]",
      icon: "museum",
      img: WM("Musée_Honmé.jpg"),
      city: "Porto-Novo"
    },
    c7: {
      id: "c7",
      name: "Grande Mosquée de Porto-Novo",
      place: "Porto-Novo · Bénin",
      body: "Édifice emblématique de la capitale, témoin du métissage architectural et culturel de Porto-Novo.",
      tone: "from-[#14532D] to-[#052e16]",
      icon: "account_balance",
      img: WM("Grande_Mosquée_de_Porto-Novo.jpg"),
      city: "Porto-Novo"
    },
    c8: {
      id: "c8",
      name: "Plage de Fidjrossè",
      place: "Cotonou · Bénin",
      body: "Littoral populaire de Cotonou, idéal pour une promenade, les activités en bord de mer et la découverte de la vie cotonouaise.",
      tone: "from-[#0369A1] to-[#0C4A6E]",
      icon: "beach_access",
      img: WM("Cotonou_beach.jpg"),
      city: "Cotonou"
    }
  };
  const COPY = {
    en: {
      c1: { body: "UNESCO World Heritage Site since 1985. The palaces of the kings of Dahomey (18th–19th centuries) now house the Historical Museum of Abomey, a witness to the kingdom and its traditions." },
      c2: { body: "Monument at the end of the Slave Route in Ouidah. It marks the point where captives were shipped to the Americas and is a major memorial of the Atlantic slave trade in Benin." },
      c3: { body: "Public square in Cotonou, opened in 2022 and dominated by the Amazon statue. It honours the Agojie, the women warriors of the kingdom of Dahomey." },
      c4: { body: "Called the “Venice of Africa”, Ganvié is a stilt village on Lake Nokoué, near Cotonou. The Tofinu people have lived there from fishing and trade for centuries." },
      c5: { body: "The largest open-air market in West Africa, Dantokpa stretches along the Cotonou lagoon. You will find wax fabrics, food, crafts and regional trade." }
    },
    fon: {
      c1: { body: "UNESCO sɔ tɛn enɛ ɖo xwé 1985. Dahomey sin ahɔsu lɛɛ sin xwé lɛɛ wɛ nyí Musée historique d'Abomey din, nǔxɔ́ ɖo ahɔsu lɛɛ sin tan kpó sɛn lɛɛ kpó wu." },
      c2: { body: "Nǔtɔn ɖo Xwéda, ɖo Slave Route sin fí. É nyí fí e wɛ yɛhwe lɛɛ nɔ tɔn sín ɖo tɔ ɔ mɛ yi Amérique, nǔxɔ́ ɖo kanlinmɛ sin tan wu ɖo Benɛ." },
      c3: { body: "Tɛn ɖo Kutɔnu, e wɛ ʋɔ ɖo 2022, bɔ Amazone sin nǔtɔn ɖo tɛntin. É ɖɔ xó ɖo Agojie lɛɛ wu, Dahomey sin nyɔnu ahwanfun lɛɛ." },
      c4: { body: "Yɛ nɔ ylɔ ɛ ɖɔ “Venise Afrique tɔn”. Ganvié nyí toxo ɖo tɔ Nokoué jí, ɖo Kutɔnu gɔ. Tofinu lɛɛ nɔ nɔ fí, yɛ nɔ hɛn hwe kpó adɔ kpó." },
      c5: { body: "Axi ɖaxo ɖo Afrique ɔ sin yɔyɔ. Dantokpa ɖo Kutɔnu sin tɔ gɔ. É ɖo avɔ wax, nuɖuɖu, nǔwiwa kpó axi kpó." }
    },
    wo: {
      c1: { body: "Kër yu mag yu Dahomey, UNESCO. Palais yu Abomey dañuy wax ci taariix ak aada." },
      c6: { body: "Musée Honmé ci Porto-Novo, kër bu am solo ci taariix Bénin." }
    }
  };

  const UI_COPY = {
    fr: { overview: "Aperçu", history: "Histoire", visit: "Visite", info: "Infos", lang: "Langue", national: "Langues nationales du Bénin", saved: "Sauvegardé ✓", save: "Sauvegarder", explore: "Explorer autour", qr: "Afficher le QR Code du site", discover: "Découverte" },
    en: { overview: "Overview", history: "History", visit: "Visit", info: "Info", lang: "Language", national: "National languages of Benin", saved: "Saved ✓", save: "Save", explore: "Explore nearby", qr: "Show the site QR code", discover: "Discover" },
    fon: { overview: "Kpɔ́", history: "Tan", visit: "Yɛyi", info: "Xó", lang: "Gbè", national: "Benɛ sin gbè lɛɛ", saved: "Hɛn ✓", save: "Hɛn", explore: "Kpɔ́ tɛn ɔ", qr: "Xlɛ́ QR Code tɛn ɔ tɔn", discover: "Nǔxɔ́" },
    wo: { overview: "Gëstu", history: "Taariix", visit: "Seet", info: "Xibaar", lang: "Làkk", national: "Yeneen làkk yu Afrique", saved: "Denc nañu ✓", save: "Denc", explore: "Seet ci wetu", qr: "Wone QR Code", discover: "Xam" }
  };

  function uiCopy() {
    return UI_COPY[UI.lang()] || UI_COPY.fr;
  }

  function siteCopy(s) {
    const pack = COPY[UI.lang()];
    const extra = pack && pack[s.id];
    return {
      name: s.name,
      place: s.place,
      body: extra ? extra.body : s.body
    };
  }

  const saved = new Set();

  function siteThumb(s, iconSize) {
    return `
      <img class="absolute inset-0 w-full h-full object-cover" src="${s.img}" alt="${s.name}"
        onerror="this.style.display='none';var fb=this.parentElement&&this.parentElement.querySelector('[data-fallback]');if(fb)fb.classList.remove('hidden')"/>
      <div data-fallback class="absolute inset-0 hidden bg-gradient-to-br ${s.tone} flex items-center justify-center text-white">
        ${UI.icon(s.icon, iconSize || "text-[40px]")}
      </div>`;
  }

  function siteCard(s) {
    return `
    <button type="button" onclick="App.nav('cultureDetail', {id:'${s.id}'})"
      class="min-w-[200px] yc-card yc-card-press overflow-hidden text-left active:scale-[0.98]">
      <div class="h-28 relative bg-surface-container-low">
        ${siteThumb(s)}
      </div>
      <div class="p-space-12">
        <h3 class="font-label-md text-label-md font-bold text-on-surface line-clamp-2">${s.name}</h3>
        <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">${s.place}</p>
      </div>
    </button>`;
  }

  Screens.culture = function (container, params) {
    const city = params && params.city;
    const sites = Object.values(SITES).filter(s => !city || (s.city || "").includes(city) || (s.place || "").includes(city));
    const topbar = UI.topBar({ title: "Découvrez le Bénin", subtitle: city || "Cotonou · Porto-Novo · Ouidah · Abomey", back: "App.nav('home')" });
    const body = `
    <section onclick="App.nav('culturalScanner')"
      class="rounded-2xl bg-black text-white p-space-16 flex items-center justify-between cursor-pointer active:scale-[0.99]">
      <div>
        <p class="font-label-sm text-label-sm text-secondary mb-1">Scanner un monument</p>
        <h3 class="font-title-md text-title-md font-bold">Caméra culturelle YOUSS CONNECT</h3>
      </div>
      <span class="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center">${UI.icon("qr_code_scanner", "text-[24px]", true)}</span>
    </section>
    <section class="grid grid-cols-2 gap-3">
      ${["Cotonou", "Porto-Novo", "Ouidah", "Abomey"].map(c => `
      <button type="button" onclick="App.nav('culture', {city:'${c}'})" class="h-20 rounded-2xl ${city === c ? "bg-secondary text-on-secondary" : "bg-zinc-900 text-white"} p-space-12 text-left font-title-md font-bold">${c}</button>`).join("")}
    </section>
    <section class="flex flex-col space-y-space-12">
      <h2 class="font-headline-sm text-headline-sm font-bold">Monuments, musées et traditions</h2>
      <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        ${(sites.length ? sites : Object.values(SITES)).map(siteCard).join("")}
      </div>
    </section>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens.cultureDetail = function (container, params) {
    const s = SITES[params.id] || SITES.c1;
    Screens._showPlace(container, s, true);
  };

  function placeTabs(activeId) {
    const c = uiCopy();
    return [
      { id: "overview", label: c.overview },
      { id: "history", label: c.history },
      { id: "visit", label: c.visit },
      { id: "info", label: c.info }
    ].map((t) => `
      <button type="button" class="px-3 py-1.5 rounded-full font-label-sm text-label-sm font-semibold ${t.id === activeId ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant"}">${t.label}</button>
    `).join("");
  }

  Screens._showPlace = function (container, s, withBack) {
    const c = uiCopy();
    const text = siteCopy(s);
    const current = UI.lang();
    const topbar = UI.topBar({ title: c.discover, back: withBack ? "App.back()" : "App.nav('culture')" });
    const body = `
    <section class="h-44 rounded-2xl relative overflow-hidden flex items-end bg-surface-container-low">
      ${siteThumb(s, "text-[88px]")}
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent"></div>
      <div class="relative z-10 p-space-16 text-white w-full">
        <h2 class="font-headline-sm text-headline-sm font-bold">${text.name}</h2>
        <p class="font-body-sm text-body-sm text-white/85">${text.place}</p>
      </div>
    </section>

    <div class="flex gap-2 overflow-x-auto no-scrollbar">${placeTabs("overview")}</div>

    <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">${text.body}</p>

    <section class="w-full">
      <p class="font-label-md text-label-md font-semibold text-on-surface mb-2">${c.lang}</p>
      <div class="flex gap-2">
        ${[
          { id: "fr", label: "FR" },
          { id: "en", label: "EN" },
          { id: "fon", label: "Fon" },
          { id: "wo", label: "Wolof" }
        ].map((l) => `
          <button type="button" onclick="Screens._setLang('${l.id}')"
            class="flex-1 h-10 rounded-xl border font-label-sm text-label-sm font-semibold ${current === l.id ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/40 text-on-surface-variant"}">
            ${l.label}
          </button>
        `).join("")}
      </div>
      <p class="font-label-sm text-label-sm text-on-surface-variant mt-2">${c.national}</p>
    </section>

    <div class="flex gap-3">
      ${UI.secondaryButton(saved.has(s.id) ? c.saved : c.save, `Screens._toggleSaveSite('${s.id}')`)}
      ${UI.primaryButton(c.explore, "App.nav('culture')")}
    </div>
    <button type="button" onclick="Screens._showSiteQr('${s.id}')"
      class="w-full flex items-center justify-center gap-2 py-2 font-label-md text-label-md font-semibold text-primary active:opacity-70">
      ${UI.icon("qr_code_2", "text-[20px]")} ${c.qr}
    </button>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens._setLang = function (id) {
    UI.setLang(id);
  };

  Screens._toggleSaveSite = function (id) {
    if (saved.has(id)) saved.delete(id); else saved.add(id);
    App.replace(App.current.id, App.current.params);
  };

  /* ---------- Scanner caméra (QR réel) ---------- */
  const SCAN_MESSAGES = {
    unsupported: "Ce navigateur ne permet pas d'accéder à la caméra.",
    insecure: "La caméra nécessite une connexion sécurisée (HTTPS).",
    denied: "Accès à la caméra refusé. Autorisez-la dans les réglages du navigateur.",
    nocamera: "Aucune caméra détectée sur cet appareil.",
    busy: "La caméra est utilisée par une autre application.",
    error: "Impossible de démarrer la caméra."
  };

  function siteFromText(text) {
    const p = YCScanner.parse(text);
    if (p.type === "site" && SITES[p.id]) return SITES[p.id];
    /* Tolérance : le QR contient le nom du site */
    const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const t = norm(p.raw);
    return Object.values(SITES).find((s) => t.includes(norm(s.name)) || norm(s.name).includes(t)) || null;
  }

  Screens.culturalScanner = function (container) {
    const scanBg = SITES.c3.img;
    container.innerHTML = `
      <div class="flex-1 flex flex-col bg-[#1a1228] relative overflow-hidden">
        <img id="yc-scan-bg" class="absolute inset-0 w-full h-full object-cover opacity-40" src="${scanBg}" alt=""
          onerror="this.remove()"/>
        <video id="yc-scan-video" class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300"
          autoplay muted playsinline></video>
        <div id="yc-scan-shade" class="absolute inset-0 bg-gradient-to-b from-[#3B1466]/75 via-[#2A0D4A]/85 to-[#1a1228] transition-opacity duration-300"></div>
        <header class="relative z-10 w-full h-11 px-space-20 flex items-center justify-between text-white pt-space-2">
          <button type="button" onclick="App.back()" class="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">${UI.icon("close")}</button>
          <span class="font-label-md text-label-md font-semibold">Scan Monument · Bénin</span>
          <button type="button" id="yc-scan-torch" onclick="Screens._scanTorch()" class="w-9 h-9 rounded-full bg-black/40 items-center justify-center hidden">${UI.icon("flashlight_on")}</button>
        </header>
        <main class="relative z-10 flex-1 flex flex-col items-center justify-center px-space-24">
          <div class="w-64 h-64 relative">
            <div class="absolute inset-0 border-2 border-yc-green/80 rounded-2xl"></div>
            <div class="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-4 border-l-4 border-yc-green rounded-tl-xl"></div>
            <div class="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-4 border-r-4 border-yc-green rounded-tr-xl"></div>
            <div class="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-4 border-l-4 border-yc-green rounded-bl-xl"></div>
            <div class="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-4 border-r-4 border-yc-green rounded-br-xl"></div>
            <div id="yc-scan-line" class="absolute left-3 right-3 h-0.5 bg-yc-green/90 top-1/3 animate-pulse shadow-[0_0_12px_#22C55E]"></div>
          </div>
          <p id="yc-scan-status" class="mt-space-20 text-center text-white font-body-md text-body-md max-w-[300px]">
            Démarrage de la caméra…
          </p>
        </main>
        <footer class="relative z-10 p-space-20 pb-space-32 space-y-3">
          <button type="button" id="yc-scan-retry" onclick="Screens._startCameraScan()"
            class="w-full h-14 rounded-2xl bg-primary text-white font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
            ${UI.icon("photo_camera", "text-[22px]")} Ouvrir la caméra
          </button>
          <div class="flex gap-3">
            <label class="flex-1 h-12 rounded-2xl bg-white/10 border border-white/20 text-white font-label-md text-label-md font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform">
              ${UI.icon("image", "text-[20px]")} Galerie
              <input type="file" accept="image/*" class="hidden" onchange="Screens._scanFromFile(this)"/>
            </label>
            <button type="button" onclick="Screens._runScan()"
              class="flex-1 h-12 rounded-2xl bg-white/10 border border-white/20 text-white font-label-md text-label-md font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              ${UI.icon("play_circle", "text-[20px]")} Mode démo
            </button>
          </div>
        </footer>
      </div>`;
    /* Demande automatique de la caméra (déclenche la permission du navigateur).
       Si le navigateur bloque l'appel hors geste utilisateur, le bouton
       « Ouvrir la caméra » relance la demande. */
    Screens._startCameraScan();
  };

  function setScanStatus(text, tone) {
    const el = document.getElementById("yc-scan-status");
    if (!el) return;
    el.textContent = text;
    el.className = "mt-space-20 text-center font-body-md text-body-md max-w-[300px] " + (tone === "error" ? "text-[#FCA5A5]" : "text-white");
  }

  function showCameraFallback(message) {
    const v = document.getElementById("yc-scan-video");
    const bg = document.getElementById("yc-scan-bg");
    const shade = document.getElementById("yc-scan-shade");
    const line = document.getElementById("yc-scan-line");
    const retry = document.getElementById("yc-scan-retry");
    if (v) v.classList.add("opacity-0");
    if (bg) bg.classList.remove("hidden");
    if (shade) shade.style.opacity = "1";
    if (line) line.classList.add("hidden");
    if (retry) retry.classList.remove("hidden");
    setScanStatus(message, "error");
  }

  Screens._startCameraScan = function () {
    const v = document.getElementById("yc-scan-video");
    if (!v) return;
    const retry = document.getElementById("yc-scan-retry");
    if (retry) retry.classList.add("hidden");
    setScanStatus("Autorisez la caméra dans la fenêtre du navigateur…");
    YCScanner.start(v, { onResult: Screens._onScanResult })
      .then((info) => {
        if (App.current.id !== "culturalScanner") { YCScanner.stop(); return; }
        const retryBtn = document.getElementById("yc-scan-retry");
        if (retryBtn) retryBtn.classList.add("hidden");
        v.classList.remove("opacity-0");
        const bg = document.getElementById("yc-scan-bg");
        const shade = document.getElementById("yc-scan-shade");
        const line = document.getElementById("yc-scan-line");
        if (bg) bg.classList.add("hidden");
        if (shade) shade.style.opacity = "0.35";
        if (line) line.classList.remove("hidden");
        setScanStatus("Visez le QR Code d'un site patrimonial béninois");
        const torch = document.getElementById("yc-scan-torch");
        if (torch && info && info.torch) { torch.classList.remove("hidden"); torch.classList.add("flex"); }
      })
      .catch((err) => {
        showCameraFallback(SCAN_MESSAGES[err && err.code] || SCAN_MESSAGES.error);
      });
  };

  Screens._scanTorch = function () {
    YCScanner.toggleTorch().then((on) => {
      const b = document.getElementById("yc-scan-torch");
      if (b) b.innerHTML = UI.icon(on ? "flashlight_off" : "flashlight_on");
    });
  };

  Screens._scanFromFile = function (input) {
    const file = input.files && input.files[0];
    input.value = "";
    if (!file) return;
    setScanStatus("Analyse de l'image…");
    YCScanner.scanFile(file)
      .then((text) => {
        if (!text) {
          UI.toast("Aucun QR Code trouvé dans cette image.", "error");
          setScanStatus("Aucun QR détecté — réessayez avec une image plus nette", "error");
          return;
        }
        YCScanner.stop();
        Screens._onScanResult(text);
      })
      .catch(() => UI.toast("Image illisible.", "error"));
  };

  Screens._onScanResult = function (text) {
    const p = YCScanner.parse(text);
    if (p.type === "pay" && Screens._qrPayFromScan) {
      Screens._qrPayFromScan(p);
      return;
    }
    const site = siteFromText(text);
    if (site) {
      App.nav("scannerAnalyzing", { id: site.id });
      setTimeout(() => {
        if (App.current && App.current.id === "scannerAnalyzing") App.replace("scannerResult", { id: site.id });
      }, 1100);
      return;
    }
    if (p.type === "url") {
      UI.toast("Lien détecté : " + p.url.replace(/^https?:\/\//, "").slice(0, 40), "info");
    } else {
      UI.toast("QR non reconnu : " + p.raw.slice(0, 40), "error");
    }
    /* Reprise du scan après le message */
    setTimeout(() => {
      if (App.current && App.current.id === "culturalScanner") Screens._startCameraScan();
    }, 1400);
  };

  /* Mode démo (sans caméra) : reconnaît la Place de l'Amazone */
  Screens._runScan = function () {
    YCScanner.stop();
    App.nav("scannerAnalyzing", { id: "c3" });
    setTimeout(() => {
      if (App.current && App.current.id === "scannerAnalyzing") App.replace("scannerResult", { id: "c3" });
    }, 1600);
  };

  Screens.scannerAnalyzing = function (container, params) {
    const s = SITES[params && params.id];
    const topbar = UI.topBar({ title: "Analyse", back: "App.back()" });
    const body = `<div class="flex-1 flex flex-col items-center justify-center space-y-space-16 py-space-40">
      <div class="w-16 h-16 rounded-full border-4 border-yc-green/20 border-t-yc-green animate-spin"></div>
      <p class="font-body-md text-body-md text-on-surface-variant">Reconnaissance du site béninois...</p>
      ${s ? `<p class="font-label-md text-label-md font-semibold text-primary">${s.name}</p>` : ""}
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens.scannerResult = function (container, params) {
    const s = SITES[params && params.id] || SITES.c3;
    Screens._showPlace(container, s, true);
  };

  /* QR d'un site (pour afficher/imprimer et tester le scanner) */
  Screens._showSiteQr = function (id) {
    const s = SITES[id];
    if (!s) return;
    const payload = "youss:site:" + s.id;
    UI.openSheet(`
      <div class="flex flex-col items-center text-center space-y-3">
        <h3 class="font-title-lg text-title-lg font-bold">${s.name}</h3>
        <p class="font-body-sm text-body-sm text-on-surface-variant">${s.place}</p>
        <div id="yc-site-qr" class="w-[200px] h-[200px] bg-white rounded-xl border border-outline-variant/30 flex items-center justify-center p-2">
          <div class="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        </div>
        <p class="font-label-sm text-label-sm text-on-surface-variant">Scannez ce code avec YOUSS CONNECT pour ouvrir la fiche du site.</p>
        <code class="font-label-sm text-label-sm bg-surface-container-low px-2 py-1 rounded">${payload}</code>
        ${UI.secondaryButton("Fermer", "UI.closeSheet()")}
      </div>`);
    YCScanner.render("yc-site-qr", payload, { size: 184, cell: 6 });
  };
})();
