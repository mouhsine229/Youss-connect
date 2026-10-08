(function () {
  "use strict";
  window.Screens = window.Screens || {};

  Screens.wallet = function (container) {
    const topbar = UI.topBar({ title: "Youss Wallet", subtitle: "Portefeuille de l'écosystème · conceptuel", back: "App.nav('home')" });
    const body = `
    <section class="w-full rounded-2xl bg-black text-white p-space-20 flex flex-col space-y-space-8">
      <span class="font-label-md text-label-md text-secondary tracking-wide">Solde disponible</span>
      <span class="font-display-lg text-display-lg font-extrabold tracking-tight">${ACStore.fmtFCFA(ACState.wallet.balance)}</span>
      <span class="font-body-sm text-body-sm opacity-80">${ACState.user.fullName}</span>
    </section>
    <section class="w-full grid grid-cols-3 gap-3">
      ${walletAction("north_east", "Envoyer", "App.nav('walletSend')")}
      ${walletAction("south_west", "Recevoir", "App.nav('walletReceive')")}
      ${walletAction("payments", "Payer", "App.nav('walletQrPay')")}
      ${walletAction("add", "Recharger", "App.nav('walletTopup')")}
      ${walletAction("account_balance", "Retirer", "App.nav('walletWithdraw')")}
      ${walletAction("qr_code_scanner", "QR Pay", "App.nav('walletQrPay')")}
    </section>
    <p class="font-label-sm text-label-sm text-on-surface-variant">Youss Wallet est une fonctionnalité conceptuelle. Son déploiement réel nécessitera les autorisations réglementaires.</p>
    <section class="w-full flex flex-col space-y-space-12">
      <h2 class="font-headline-sm text-headline-sm font-bold">Transactions récentes</h2>
      <div class="flex flex-col space-y-2">
        ${ACState.wallet.transactions.slice(0, 12).map(t => `
        <div onclick="App.nav('walletTxnDetail', {id:'${t.id}'})" class="flex items-center justify-between yc-card yc-card-press p-space-12 cursor-pointer">
          <div class="flex items-center space-x-3 min-w-0">
            <div class="w-9 h-9 rounded-full ${t.type === "credit" ? "bg-tertiary-container/10 text-tertiary" : "bg-surface-container-low text-primary"} flex items-center justify-center flex-shrink-0">
              ${UI.icon(t.type === "credit" ? "south_west" : "north_east", "text-[18px]")}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-title-md text-title-md truncate">${t.label}</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">${t.date}</span>
            </div>
          </div>
          <span class="font-label-lg text-label-lg font-bold ${t.type === "credit" ? "text-tertiary" : "text-on-surface"}">${t.type === "credit" ? "+" : ""}${ACStore.fmtFCFA(t.amount)}</span>
        </div>`).join("")}
      </div>
    </section>`;
    Shell.render(container, { topbar, body, nav: "wallet" });
  };

  function walletAction(icon, label, onclick) {
    return `<div onclick="${onclick}" class="flex flex-col items-center space-y-1 cursor-pointer active:scale-95 transition-transform">
      <div class="w-12 h-12 rounded-full bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-primary-container shadow-sm">${UI.icon(icon)}</div>
      <span class="font-label-sm text-label-sm text-on-surface-variant">${label}</span>
    </div>`;
  }

  Screens.walletTxnDetail = function (container, params) {
    const t = ACState.wallet.transactions.find(x => x.id === params.id);
    const topbar = UI.topBar({ title: "Détail transaction", back: "App.back()" });
    const body = t ? `
    <section class="w-full flex flex-col items-center text-center bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-24 space-y-space-8">
      <div class="w-14 h-14 rounded-full ${t.type === "credit" ? "bg-tertiary-container/10 text-tertiary" : "bg-surface-container-low text-primary"} flex items-center justify-center">${UI.icon(t.type === "credit" ? "south_west" : "north_east")}</div>
      <span class="font-display-lg text-display-lg ${t.type === "credit" ? "text-tertiary" : "text-on-surface"}">${t.type === "credit" ? "+" : ""}${ACStore.fmtFCFA(t.amount)}</span>
      <span class="font-title-md text-title-md">${t.label}</span>
      <span class="font-body-sm text-body-sm text-on-surface-variant">${t.date}</span>
      ${UI.badge("Réussi", "success")}
    </section>
    <div class="pt-space-8">${UI.secondaryButton("Retour au Wallet", "App.nav('wallet')")}</div>` : UI.emptyState({icon:"receipt_long", title:"Transaction introuvable", body:"Cette transaction n'existe plus."});
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens.walletTopup = function (container) {
    const topbar = UI.topBar({ title: "Recharger mon Wallet", back: "App.back()" });
    const amounts = [2000, 5000, 10000, 25000];
    const body = `
    <section class="grid grid-cols-2 gap-3">
      ${amounts.map(a => `<button onclick="Screens._topupPick(${a})" class="h-14 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-label-lg text-label-lg active:border-primary-container active:text-primary transition-colors">${ACStore.fmtFCFA(a)}</button>`).join("")}
    </section>
    <label class="flex flex-col space-y-1">
      <span class="font-label-md text-label-md text-on-surface-variant">Ou montant personnalisé</span>
      <input id="topup-amount" type="number" placeholder="Montant en FCFA" class="h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-space-16 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/30"/>
    </label>
    <section class="w-full flex flex-col space-y-2">
      <span class="font-label-md text-label-md text-on-surface-variant">Méthode</span>
      <div class="flex items-center justify-between bg-surface-container-lowest border border-primary-container rounded-xl p-space-16">
        <div class="flex items-center space-x-3">${UI.icon("smartphone", "text-primary")}<span class="font-title-md text-title-md">Mobile Money</span></div>
        ${UI.icon("check_circle", "text-primary", true)}
      </div>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Recharger", "Screens._doTopup()", { icon: "add" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._topupPick = function (a) { document.getElementById("topup-amount").value = a; };
  Screens._doTopup = function () {
    const amount = parseInt(document.getElementById("topup-amount").value, 10);
    if (!amount || amount <= 0) { UI.toast("Veuillez saisir un montant valide.", "error"); return; }
    ACStore.whenPaid(
      ACStore.creditWallet(amount, "Rechargement Mobile Money"),
      function () {
        UI.toast("Wallet rechargé avec succès.", "success");
        App.resetTo("wallet");
      },
      function (res) { UI.toast(res.message || "Rechargement impossible.", "error"); }
    );
  };

  Screens.walletSend = function (container) {
    const topbar = UI.topBar({ title: "Envoyer de l'argent", back: "App.back()" });
    const body = `
    ${field2("send-name", "Destinataire", "text", "Nom ou numéro de téléphone")}
    ${field2("send-amount", "Montant", "number", "0")}
    <label class="flex flex-col space-y-1">
      <span class="font-label-md text-label-md text-on-surface-variant">Note (optionnel)</span>
      <input id="send-note" placeholder="Ex : Remboursement" class="h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-space-16 font-body-md text-body-md focus:outline-none"/>
    </label>
    <div id="send-error" class="hidden font-body-sm text-body-sm text-error"></div>
    <div class="pt-space-8">${UI.primaryButton("Continuer", "Screens._sendReview()", { icon: "arrow_forward" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  function field2(id, label, type, placeholder) {
    return `<label class="flex flex-col space-y-1">
      <span class="font-label-md text-label-md text-on-surface-variant">${label}</span>
      <input id="${id}" type="${type}" placeholder="${placeholder}" class="h-12 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-space-16 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/30"/>
    </label>`;
  }
  let pendingSend = null;
  Screens._sendReview = function () {
    const name = document.getElementById("send-name").value.trim();
    const amount = parseInt(document.getElementById("send-amount").value, 10);
    const note = document.getElementById("send-note").value.trim();
    const err = document.getElementById("send-error");
    if (!name) { err.textContent = "Veuillez indiquer un destinataire."; err.classList.remove("hidden"); return; }
    if (!amount || amount <= 0) { err.textContent = "Veuillez indiquer un montant valide."; err.classList.remove("hidden"); return; }
    if (amount > ACState.wallet.balance) { App.nav("paymentFailed", { retry: "walletSend", amount, reason: "insufficient_balance" }); return; }
    pendingSend = { name, amount, note };
    App.nav("securityPin", { action: "walletSendConfirm" });
  };

  Screens.securityPin = function (container, params) {
    params = params || {};
    params.action = params.action || "confirm";
    const topbar = UI.topBar({ title: "Confirmation sécurisée", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center text-center space-y-space-20 py-space-16">
      <div class="w-14 h-14 rounded-full bg-surface-container-low text-primary-container flex items-center justify-center">${UI.icon("lock", "text-[28px]")}</div>
      <h2 class="font-headline-sm text-headline-sm font-bold">Entrez votre code PIN</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">Démo : utilisez le code <b>0000</b></p>
      <input id="pin-code" inputmode="numeric" maxlength="4" placeholder="••••" class="h-14 w-40 rounded-xl border border-outline-variant/50 bg-surface-container-lowest text-center tracking-[0.5em] font-headline-md text-headline-md focus:outline-none"/>
      <div id="pin-error" class="hidden font-body-sm text-body-sm text-error"></div>
      <div class="w-full px-space-20">${UI.primaryButton("Confirmer", `Screens._pinConfirm('${params.action}')`)}</div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._pinConfirm = function (action) {
    const pin = document.getElementById("pin-code").value.trim();
    const err = document.getElementById("pin-error");
    if (pin !== "0000") { err.textContent = "Code PIN incorrect."; err.classList.remove("hidden"); return; }
    if (action === "walletSendConfirm") {
      const sent = pendingSend;
      ACStore.whenPaid(
        ACStore.payFromWallet({ amount: sent.amount, label: "Envoi à " + sent.name + (sent.note ? " · " + sent.note : ""), service: "wallet" }),
        function () {
          UI.toast("Argent envoyé à " + sent.name + ".", "success");
          pendingSend = null;
          App.resetTo("wallet");
        },
        function () { App.nav("paymentFailed", { retry: "walletSend", amount: sent.amount, reason: "insufficient_balance" }); }
      );
    } else if (action === "changePin") {
      UI.toast("Code PIN mis à jour avec succès.", "success");
      App.nav("security");
    } else {
      App.back();
    }
  };

  Screens.walletReceive = function (container) {
    const topbar = UI.topBar({ title: "Recevoir de l'argent", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center text-center space-y-space-16 py-space-16">
      <div id="yc-receive-qr" class="w-52 h-52 bg-white border border-outline-variant/30 rounded-xl flex items-center justify-center p-2 shadow-sm">
        <div class="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
      </div>
      <h2 class="font-title-md text-title-md">${ACState.user.fullName}</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">${ACState.user.phone}</p>
      <p class="font-body-sm text-body-sm text-on-surface-variant max-w-[260px]">Faites scanner ce code par un autre utilisateur YOUSS CONNECT pour recevoir un paiement instantané.</p>
      <div class="w-full px-space-20">${UI.secondaryButton("Partager mon code", "Screens._shareQr()")}</div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
    YCScanner.render("yc-receive-qr", receivePayload(), { size: 192, cell: 6 });
  };

  function receivePayload() {
    const q = new URLSearchParams({ to: ACState.user.phone || "", name: ACState.user.fullName || "" });
    return "youss:pay?" + q.toString();
  }

  Screens._shareQr = function () {
    const payload = receivePayload();
    if (navigator.share) {
      navigator.share({ title: "Mon code Youss Wallet", text: "Payez-moi avec YOUSS CONNECT : " + payload })
        .then(() => UI.toast("Code QR partagé.", "success"))
        .catch(() => {});
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(payload).then(() => UI.toast("Code copié dans le presse-papiers.", "success")).catch(() => UI.toast("Code QR partagé.", "success"));
      return;
    }
    UI.toast("Code QR partagé.", "success");
  };

  /* ---------- QR Pay : scan caméra réel ---------- */
  const QR_MESSAGES = {
    unsupported: "Ce navigateur ne permet pas d'accéder à la caméra.",
    insecure: "La caméra nécessite une connexion sécurisée (HTTPS).",
    denied: "Accès à la caméra refusé. Autorisez-la dans les réglages du navigateur.",
    nocamera: "Aucune caméra détectée sur cet appareil.",
    busy: "La caméra est utilisée par une autre application.",
    error: "Impossible de démarrer la caméra."
  };

  Screens.walletQrPay = function (container) {
    const topbar = UI.topBar({ title: "QR Pay", back: "App.back()" });
    const body = `
    <div class="flex-1 flex flex-col items-center text-center space-y-space-16 py-space-8">
      <div class="w-full h-72 rounded-2xl bg-[#1a1228] relative overflow-hidden shadow-md">
        <video id="yc-qrpay-video" class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300" autoplay muted playsinline></video>
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-44 h-44 relative">
            <div class="absolute -top-0.5 -left-0.5 w-7 h-7 border-t-4 border-l-4 border-yc-green rounded-tl-xl"></div>
            <div class="absolute -top-0.5 -right-0.5 w-7 h-7 border-t-4 border-r-4 border-yc-green rounded-tr-xl"></div>
            <div class="absolute -bottom-0.5 -left-0.5 w-7 h-7 border-b-4 border-l-4 border-yc-green rounded-bl-xl"></div>
            <div class="absolute -bottom-0.5 -right-0.5 w-7 h-7 border-b-4 border-r-4 border-yc-green rounded-br-xl"></div>
            <div id="yc-qrpay-line" class="absolute left-3 right-3 h-0.5 bg-yc-green/90 top-1/3 animate-pulse shadow-[0_0_12px_#22C55E]"></div>
          </div>
        </div>
        <div id="yc-qrpay-fallback" class="absolute inset-0 hidden flex-col items-center justify-center text-white/80 px-6">
          ${UI.icon("no_photography", "text-[40px]")}
          <p id="yc-qrpay-msg" class="font-body-sm text-body-sm mt-2"></p>
        </div>
      </div>
      <p id="yc-qrpay-status" class="font-body-sm text-body-sm text-on-surface-variant max-w-[280px]">Démarrage de la caméra…</p>
      <div class="w-full px-space-20 space-y-3">
        <label class="w-full h-12 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface font-label-lg text-label-lg font-semibold shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform">
          ${UI.icon("image", "text-[20px]")} Importer un QR depuis une image
          <input type="file" accept="image/*" class="hidden" onchange="Screens._qrPayFromFile(this)"/>
        </label>
        ${UI.primaryButton("Simuler un scan marchand", "Screens._simulateQrScan()", { icon: "qr_code_scanner" })}
      </div>
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
    /* Demande automatique de la caméra pour scanner le QR marchand. */
    Screens._startQrPayCamera();
  };

  Screens._startQrPayCamera = function () {
    const v = document.getElementById("yc-qrpay-video");
    if (!v) return;
    const status = document.getElementById("yc-qrpay-status");
    YCScanner.start(v, { onResult: Screens._onQrPayScan })
      .then(() => {
        if (App.current.id !== "walletQrPay") { YCScanner.stop(); return; }
        v.classList.remove("opacity-0");
        if (status) status.textContent = "Visez le QR d'un marchand ou d'un utilisateur YOUSS CONNECT.";
      })
      .catch((err) => {
        const fb = document.getElementById("yc-qrpay-fallback");
        const msg = document.getElementById("yc-qrpay-msg");
        const line = document.getElementById("yc-qrpay-line");
        if (fb) { fb.classList.remove("hidden"); fb.classList.add("flex"); }
        if (line) line.classList.add("hidden");
        if (msg) msg.textContent = QR_MESSAGES[err && err.code] || QR_MESSAGES.error;
        if (status) status.textContent = "Importez une image du QR ou utilisez la simulation.";
      });
  };

  Screens._qrPayFromFile = function (input) {
    const file = input.files && input.files[0];
    input.value = "";
    if (!file) return;
    YCScanner.scanFile(file).then((text) => {
      if (!text) { UI.toast("Aucun QR Code trouvé dans cette image.", "error"); return; }
      YCScanner.stop();
      Screens._onQrPayScan(text);
    }).catch(() => UI.toast("Image illisible.", "error"));
  };

  Screens._onQrPayScan = function (text) {
    const p = YCScanner.parse(text);
    if (p.type === "pay") { Screens._qrPayFromScan(p); return; }
    if (p.type === "site" && Screens.scannerResult) {
      UI.toast("QR d'un site culturel détecté.", "info");
      App.nav("scannerResult", { id: p.id });
      return;
    }
    UI.toast("Ce QR n'est pas un code de paiement YOUSS CONNECT.", "error");
    setTimeout(() => {
      if (App.current && App.current.id === "walletQrPay") Screens._startQrPayCamera();
    }, 1400);
  };

  /* Feuille de confirmation après lecture d'un QR de paiement */
  let pendingQrPay = null;
  Screens._qrPayFromScan = function (p) {
    pendingQrPay = { to: p.to || "", name: p.name || "", amount: p.amount || null };
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const who = esc(p.name || p.to || "Marchand YOUSS CONNECT");
    const amountField = p.amount
      ? `<p class="font-headline-md text-headline-md font-bold text-primary">${ACStore.fmtFCFA(p.amount)}</p>`
      : `<div class="w-full">
           <label class="font-label-sm text-label-sm text-on-surface-variant">Montant (FCFA)</label>
           <input id="yc-qrpay-amount" type="number" inputmode="numeric" min="100" step="100" placeholder="Ex. 2 500"
             class="mt-1 w-full h-12 rounded-xl border border-outline-variant/40 px-3 font-title-md text-title-md focus:border-primary focus:ring-0"/>
         </div>`;
    UI.openSheet(`
      <div class="flex flex-col items-center text-center space-y-3">
        <div class="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">${UI.icon("storefront", "text-[28px]")}</div>
        <h3 class="font-title-lg text-title-lg font-bold">${who}</h3>
        ${p.to ? `<p class="font-body-sm text-body-sm text-on-surface-variant">${esc(p.to)}</p>` : ""}
        ${amountField}
        <p class="font-label-sm text-label-sm text-on-surface-variant">Solde : ${ACStore.fmtFCFA(ACState.wallet.balance)}</p>
        <div class="w-full pt-1 space-y-2">
          ${UI.primaryButton("Payer avec Youss Wallet", "Screens._confirmQrPay()", { green: true, icon: "lock" })}
          ${UI.secondaryButton("Annuler", "UI.closeSheet(); Screens._qrPayCancel()")}
        </div>
      </div>`);
  };

  Screens._qrPayCancel = function () {
    if (!App.current) return;
    if (App.current.id === "walletQrPay") Screens._startQrPayCamera();
    else if (App.current.id === "culturalScanner" && Screens._startCameraScan) Screens._startCameraScan();
  };

  Screens._confirmQrPay = function () {
    const p = pendingQrPay || {};
    let amount = p.amount;
    if (!amount) {
      const input = document.getElementById("yc-qrpay-amount");
      amount = parseInt(input && input.value, 10);
      if (!isFinite(amount) || amount < 100) { UI.toast("Saisissez un montant valide.", "error"); return; }
    }
    UI.closeSheet();
    const label = "Paiement QR · " + (p.name || p.to || "Marchand YOUSS CONNECT");
    ACStore.whenPaid(
      ACStore.payFromWallet({ amount, label, service: "wallet", pointsEarned: Math.round(amount / 500) }),
      function () {
        UI.toast("Paiement de " + ACStore.fmtFCFA(amount) + " effectué.", "success");
        App.resetTo("wallet");
      },
      function (res) { App.nav("paymentFailed", { retry: "walletQrPay", amount, reason: res.reason }); }
    );
  };

  Screens._simulateQrScan = function () {
    YCScanner.stop();
    const amount = 1500 + Math.round(Math.random() * 3000);
    Screens._qrPayFromScan({ type: "pay", to: "+229 97 00 00 00", name: "Marché Dantokpa · Stand 42", amount: amount - (amount % 100) });
  };

  Screens.walletWithdraw = function (container) {
    const topbar = UI.topBar({ title: "Retirer", subtitle: "Youss Wallet · conceptuel", back: "App.back()" });
    const body = `
    <p class="font-body-sm text-body-sm text-on-surface-variant">Le retrait réel dépendra du cadre réglementaire. Cette maquette simule un retrait du solde démo.</p>
    <input id="wd-amount" type="number" placeholder="Montant en FCFA" class="h-12 rounded-xl border px-space-16"/>
    ${UI.primaryButton("Simuler le retrait", "Screens._doWithdraw()")}
    ${UI.secondaryButton("Paiement en attente", "App.nav('paymentPending')")}`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._doWithdraw = function () {
    const amount = parseInt(document.getElementById("wd-amount").value, 10);
    if (!amount || amount < 500) { UI.toast("Montant minimum 500 FCFA.", "error"); return; }
    ACStore.whenPaid(
      ACStore.payFromWallet({ amount, label: "Retrait Youss Wallet", service: "wallet" }),
      function () { App.resetTo("paymentSuccess", { amount }); },
      function () { App.nav("paymentFailed"); }
    );
  };

  Screens.paymentSuccess = function (container, params) {
    const topbar = UI.topBar({ title: "Paiement réussi", back: "App.nav('wallet')" });
    const body = `
    <div class="flex flex-col items-center text-center py-space-32 space-y-4">
      <div class="w-16 h-16 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">${UI.icon("check_circle", "text-[36px]", true)}</div>
      <h2 class="font-headline-sm text-headline-sm font-bold">Paiement réussi</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">${params && params.amount ? ACStore.fmtFCFA(params.amount) : "Opération confirmée"}</p>
      ${UI.primaryButton("Retour au Wallet", "App.resetTo('wallet')")}
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens.paymentPending = function (container) {
    const topbar = UI.topBar({ title: "Paiement en attente", back: "App.back()" });
    const body = `
    <div class="flex flex-col items-center text-center py-space-32 space-y-4">
      <div class="w-16 h-16 rounded-full border-2 border-secondary border-t-transparent animate-spin"></div>
      <h2 class="font-headline-sm text-headline-sm font-bold">Paiement en attente</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">La confirmation arrivera dès que le réseau sera disponible.</p>
      ${UI.secondaryButton("Retour", "App.nav('wallet')")}
    </div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
})();
