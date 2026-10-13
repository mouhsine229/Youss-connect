// Youss Wallet : solde, envoyer, recevoir, payer, recharger, retirer, QR Pay, états de paiement
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc, go } = UI;
  const wf = { filter: "all", masked: false };
  const EXTERNAL_FEE = 250;
  const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

  const STATUS = { success: ["Réussi", "success"], pending: ["En attente", "warn"], failed: ["Échoué", "danger"] };
  function txRow(t) {
    const st = STATUS[t.status || "success"];
    return `<button type="button" onclick="${go("walletTxnDetail", { id: t.id })}" class="w-full max-w-full min-w-0 flex items-center justify-between gap-2 sm:gap-3 p-3.5 text-left hover:bg-surface-low transition-colors overflow-hidden">
      <span class="flex items-center gap-3 min-w-0 flex-1 overflow-hidden"><span class="w-10 h-10 rounded-full ${t.type === "credit" ? "bg-success-soft text-success" : t.status === "failed" ? "bg-danger-soft text-danger" : "bg-surface-low text-ink"} flex items-center justify-center flex-shrink-0">${icon(t.type === "credit" ? "south_west" : ACStore.iconForService(t.service), "text-[20px]")}</span>
        <span class="min-w-0 flex-1"><span class="block t-title truncate">${esc(t.label)}</span><span class="block t-small text-ink-2 min-w-0"><span class="truncate block">${esc(t.date)}</span>${t.status !== "success" ? `<span class="inline-block mt-0.5">${UI.badge(st[0], st[1])}</span>` : ""}</span></span></span>
      <span class="t-small sm:t-title font-extrabold whitespace-nowrap flex-shrink-0 text-right tabular-nums ${t.type === "credit" ? "text-success" : t.status === "failed" ? "text-ink-3 line-through" : ""}">${t.type === "credit" ? "+" : "−"}${ACStore.fmtFCFA(Math.abs(t.amount))}</span></button>`;
  }
  function inLast30Days(t) {
    if (t.status !== "success") return false;
    if (!t.at) return true;
    return t.at >= Date.now() - MONTH_MS;
  }
  function monthly() {
    const tx = ACState.wallet.transactions.filter(inLast30Days);
    const inn = tx.filter((t) => t.type === "credit").reduce((s, t) => s + Math.abs(t.amount), 0);
    const out = tx.filter((t) => t.type === "debit").reduce((s, t) => s + Math.abs(t.amount), 0);
    return { inn, out };
  }
  function walletActionBtn(a) {
    return `<button type="button" onclick="App.nav('${a[2]}')" class="wallet-action-btn" aria-label="${esc(a[1])}"><span class="wallet-action-btn__icon">${icon(a[0], "text-[22px]")}</span><span class="wallet-action-btn__label">${a[1]}</span></button>`;
  }

  Screens.wallet = function (container) {
    const m = monthly();
    const actions = [["north_east", I18N.t("send"), "walletSend"], ["south_west", I18N.t("receive"), "walletReceive"], ["payments", I18N.t("pay"), "walletPay"], ["add", I18N.t("topup"), "walletTopup"], ["account_balance", I18N.t("withdraw"), "walletWithdraw"], ["qr_code_scanner", I18N.t("qrpay"), "walletQrPay"]];
    const body = `
      <div class="grid lg:grid-cols-[400px_1fr] gap-6 lg:gap-8 items-start min-w-0 max-w-full">
        <div class="space-y-4 lg:sticky lg:top-24 min-w-0 max-w-full">
          <section class="card-dark p-5 sm:p-6 min-w-0">
            <div class="flex items-center justify-between gap-2"><span class="t-caption text-gold">${I18N.t("balance")}</span><button type="button" onclick="Screens._wMask()" class="text-inverse-ink opacity-80 hover:opacity-100 flex-shrink-0" aria-label="${wf.masked ? "Afficher le solde" : "Masquer le solde"}">${icon(wf.masked ? "visibility" : "visibility_off", "text-[22px]")}</button></div>
            <p class="t-h1 sm:t-display mt-2 break-words leading-tight">${wf.masked ? "•••••• FCFA" : ACStore.fmtFCFA(ACState.wallet.balance)}</p>
            <p class="t-small mt-1 truncate opacity-80">${esc(ACState.user.fullName)} · ${esc(ACState.user.phone)}</p>
            <p class="t-caption mt-4 opacity-70">30 derniers jours</p>
            <div class="wallet-kpi-grid mt-2"><div class="wallet-kpi-cell"><p class="t-caption opacity-70">Entrées</p><p class="t-small sm:t-title text-success truncate tabular-nums">+${ACStore.fmtFCFA(m.inn)}</p></div><div class="wallet-kpi-cell"><p class="t-caption opacity-70">Sorties</p><p class="t-small sm:t-title truncate tabular-nums">−${ACStore.fmtFCFA(m.out)}</p></div></div>
          </section>
          <section class="wallet-action-grid" aria-label="Actions Wallet">${actions.map(walletActionBtn).join("")}</section>
          <p class="t-small text-ink-3 flex gap-2 min-w-0">${icon("info", "text-[16px] flex-shrink-0 mt-0.5")}<span class="min-w-0">${I18N.t("conceptual")}</span></p>
        </div>
        <section class="min-w-0 max-w-full space-y-3">
          <div class="card p-5">
            <p class="t-caption text-ink-3">Confidentialité</p>
            <h2 class="t-h3 mt-1">Historique des transactions</h2>
            <p class="t-small text-ink-2 mt-1">Le détail des opérations n'est pas affiché sur cet écran. Ouvrez l'historique pour le consulter, le télécharger ou le partager.</p>
            ${UI.primaryButton("Historique des transactions", "App.nav('walletHistory')", { size: "lg", icon: "receipt_long", cls: "mt-4" })}
          </div>
        </section>
      </div>`;
    Shell.render(container, { title: I18N.t("wallet"), subtitle: "Solde de démo", body, nav: "wallet" });
  };
  Screens._wMask = () => { wf.masked = !wf.masked; App.replace("wallet", {}, { keepScroll: true }); };
  Screens._wFilter = (f) => { wf.filter = f; App.replace("walletHistory", {}, { keepScroll: true }); };

  Screens.walletHistory = function (container) {
    const tx = ACState.wallet.transactions.filter((t) => wf.filter === "all" || (wf.filter === "in" && t.type === "credit") || (wf.filter === "out" && t.type === "debit") || (wf.filter === "pending" && t.status === "pending"));
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">${[["all", "Tout"], ["in", "Entrées"], ["out", "Sorties"], ["pending", "En attente"]].map((x) => UI.chip(x[1], `Screens._wFilter('${x[0]}')`, wf.filter === x[0])).join("")}</div>
      ${tx.length ? `<div class="card divide-y divide-line">${tx.map(txRow).join("")}</div>` : UI.emptyState({ icon: "receipt_long", title: "Aucune transaction", body: "Vos opérations apparaîtront ici." })}
      <div class="grid grid-cols-2 gap-3">${UI.secondaryButton("Télécharger le relevé", "Screens._downloadStatement()", { icon: "download" })}${UI.secondaryButton("Partager", "Screens._shareStatement()", { icon: "share" })}</div>
    </div>`;
    Shell.render(container, { title: "Historique des transactions", subtitle: tx.length + " opération" + (tx.length > 1 ? "s" : ""), back: true, body, nav: false, showNav: true });
  };
  Screens._downloadStatement = function () {
    if (window.YCReceipt) YCReceipt.statement(ACState.wallet.transactions);
    UI.toast("Relevé téléchargé.", "success");
  };
  Screens._shareStatement = function () {
    const lines = ACState.wallet.transactions.slice(0, 12).map((t) => (t.type === "credit" ? "+" : "−") + ACStore.fmtFCFA(Math.abs(t.amount)) + " · " + t.label);
    const text = "Historique YOUSS CONNECT\n" + lines.join("\n");
    if (navigator.share) navigator.share({ title: "Historique YOUSS CONNECT", text: text }).catch(function () {});
    else Screens._downloadStatement();
  };

  Screens.walletTxnDetail = function (container, params) {
    const t = ACState.wallet.transactions.find((x) => x.id === params.id);
    const st = t ? STATUS[t.status || "success"] : null;
    const body = t ? `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="card p-6 text-center"><span class="w-16 h-16 rounded-full ${t.type === "credit" ? "bg-success-soft text-success" : t.status === "failed" ? "bg-danger-soft text-danger" : "bg-surface-low text-ink"} flex items-center justify-center mx-auto">${icon(t.type === "credit" ? "south_west" : ACStore.iconForService(t.service), "text-[30px]")}</span>
        <p class="t-display mt-3 ${t.type === "credit" ? "text-success" : ""}">${t.type === "credit" ? "+" : "−"}${ACStore.fmtFCFA(Math.abs(t.amount))}</p><p class="t-title mt-1">${esc(t.label)}</p><p class="t-small text-ink-2">${esc(t.date)}</p><div class="mt-3">${UI.badge(st[0], st[1])}</div>
        ${t.reason ? `<p class="t-small text-danger mt-2">${esc(t.reason)}</p>` : ""}</div>
      <div class="card p-4">${UI.row("Référence", esc(t.ref || "Non attribuée"))}${UI.row("Service", (t.service || "wallet").charAt(0).toUpperCase() + (t.service || "wallet").slice(1))}${UI.row("Moyen", t.external ? "Paiement mobile (conceptuel)" : "Youss Wallet")}${UI.row("Statut", st[0])}</div>
      <div class="grid grid-cols-2 gap-3">${UI.secondaryButton("Télécharger le reçu", `Screens._txReceipt('${t.id}','down')`, { icon: "download" })}${UI.secondaryButton("Partager le reçu", `Screens._txReceipt('${t.id}','share')`, { icon: "share" })}</div>
      <div>${UI.secondaryButton("Signaler", "App.nav('report')", { icon: "flag" })}</div>
      ${t.status === "failed" ? UI.primaryButton("Réessayer le paiement", `App.nav('${t.retry || (String(t.label).indexOf("QR") >= 0 ? "walletQrPay" : "walletPay")}')`, { icon: "replay" }) : ""}
      ${t.status === "pending" ? `<div class="grid grid-cols-2 gap-3">${UI.secondaryButton("Annuler", `Screens._cancelPending('${t.id}')`, { icon: "cancel" })}${UI.primaryButton("Confirmer", `Screens._confirmPending('${t.id}')`, { icon: "check" })}</div>` : ""}
    </div>` : UI.emptyState({ icon: "receipt_long", title: "Transaction introuvable", body: "" });
    Shell.render(container, { title: "Détail de la transaction", back: true, body, nav: false, showNav: true });
  };
  Screens._txReceipt = function (id, mode) {
    const t = ACState.wallet.transactions.find((x) => x.id === id);
    if (!t || !window.YCReceipt) return;
    const r = YCReceipt.fromTx(t);
    if (mode === "share") YCReceipt.share(r);
    else { YCReceipt.download(r); UI.toast("Reçu téléchargé.", "success"); }
  };

  Screens._cancelPending = (id) => {
    const t = ACState.wallet.transactions.find((x) => x.id === id);
    if (!t || t.status !== "pending") return;
    const refunded = t.type === "debit" && t.balanceApplied;
    if (refunded) {
      ACState.wallet.balance += Math.abs(t.amount);
      t.balanceApplied = false;
    }
    t.status = "failed";
    t.reason = "Annulée par l'utilisateur";
    const act = ACState.activities.find((x) => x.title === t.label && x.status === "En attente");
    if (act) act.status = "Annulé";
    ACStore.emit();
    UI.toast(refunded ? "Opération annulée. Le montant est revenu sur votre solde." : "Opération annulée.", "info");
    App.back();
  };

  // Recharger
  const tp = { method: "mobile", amount: 0 };
  Screens.walletTopup = function (container) {
    const amounts = [2000, 5000, 10000, 25000, 50000, 100000];
    const saved = (ACState.wallet.cards || [])[0];
    const methods = [["mobile", "smartphone", "Paiement mobile", "Opérateur à définir · conceptuel"], ["card", "credit_card", "Carte bancaire", saved ? saved.brand + " · " + saved.last4 + " · expire " + saved.exp : "Saisir les coordonnées de test"], ["agent", "store", "Agent YOUSS CONNECT", "Dépôt en espèces chez un agent"]];
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="card p-5"><p class="t-caption text-ink-3 mb-2">Montant</p><div class="amount-pick-grid">${amounts.map((a) => `<button type="button" onclick="Screens._topupPick(${a})" class="chip justify-center h-12 min-w-0 ${tp.amount === a ? "on" : ""}">${a.toLocaleString("fr-FR")}</button>`).join("")}</div>
        <label class="block mt-3"><span class="label">Ou montant personnalisé (FCFA)</span><input id="topup-amount" type="number" inputmode="numeric" min="500" step="500" value="${tp.amount || ""}" placeholder="Ex. 15 000" class="input input-lg text-xl font-bold" oninput="Screens._topupCustom(this.value)"/></label></div>
      <div class="card p-4 space-y-2"><p class="t-caption text-ink-3 mb-1">Méthode</p>${methods.map((m) => `<button type="button" onclick="Screens._topupMethod('${m[0]}')" class="w-full flex items-center gap-3 rounded-xl border p-3 text-left ${tp.method === m[0] ? "border-gold bg-gold/10" : "border-line"}"><span class="menu-icon">${icon(m[1])}</span><span class="flex-1"><span class="block t-title">${m[2]}</span><span class="block t-small text-ink-2">${m[3]}</span></span>${tp.method === m[0] ? icon("check_circle", "text-gold", true) : ""}</button>`).join("")}${tp.method === "card" ? `<div class="pt-2">${Screens.cardAddButton()}</div>` : ""}</div>
      ${UI.primaryButton("Recharger" + (tp.amount ? " · " + ACStore.fmtFCFA(tp.amount) : ""), "Screens._doTopup()", { size: "lg", icon: "add", id: "topup-go" })}
      <p class="t-small text-ink-3 text-center">${I18N.t("conceptual")}</p></div>`;
    Shell.render(container, { title: "Recharger mon Wallet", back: true, body, nav: false, showNav: true });
  };
  Screens._topupPick = (a) => { tp.amount = a; App.replace("walletTopup"); };
  Screens._topupCustom = (v) => {
    tp.amount = parseInt(v, 10) || 0;
    const btn = document.getElementById("topup-go");
    const span = btn && btn.querySelector("span:last-child");
    if (span) span.textContent = "Recharger" + (tp.amount ? " · " + ACStore.fmtFCFA(tp.amount) : "");
  };
  Screens._topupMethod = (m) => { tp.method = m; App.replace("walletTopup"); };
  Screens._doTopup = function () {
    const amount = tp.amount || parseInt((document.getElementById("topup-amount") || {}).value, 10);
    if (!amount || amount < 500) { UI.toast("Montant minimum : 500 FCFA.", "error"); return; }
    if (tp.method === "card" && Screens.needCard("card")) return;
    Screens.requirePay("Rechargement · " + ACStore.fmtFCFA(amount), function () { Screens._doTopupPaid(amount); });
  };
  Screens._doTopupPaid = function (amount) {
    if (tp.method === "agent") {
      const tx = ACStore.addTransaction({ label: "Dépôt chez un agent", amount, type: "credit", status: "pending", service: "wallet", balanceApplied: false });
      ACStore.emit();
      App.resetTo("paymentPending", { amount, title: "Dépôt en attente", body: "Présentez ce code à un agent YOUSS CONNECT. Le solde sera crédité après validation.", code: String(Math.floor(100000 + Math.random() * 899999)), txid: tx.id });
      return;
    }
    const card = (ACState.wallet.cards || [])[0];
    const label = tp.method === "card" ? "Rechargement par carte" + (card ? " · " + card.brand + " " + card.last4 : "") + " (démo)" : "Rechargement par paiement mobile";
    ACStore.whenPaid(ACStore.creditWallet(amount, label), function (res) {
      tp.amount = 0;
      if (window.YCReceipt && res && res.tx) YCReceipt.deliver(res.tx, { title: "Reçu de rechargement", method: tp.method === "card" ? "Carte bancaire · démo" : "Paiement mobile" });
      App.resetTo("paymentSuccess", { amount, title: "Wallet rechargé", body: "Votre nouveau solde est de " + ACStore.fmtFCFA(ACState.wallet.balance) + ". Aucun débit bancaire réel n'a été effectué.", next: "wallet" });
    }, function (res) { UI.toast(res.message || "Rechargement impossible.", "error"); });
  };

  // Envoyer
  let pendingSend = null;
  Screens.walletSend = function (container, params) {
    const contacts = [{ name: "Fatou Diallo", phone: "+229 96 12 34 56", youss: true }, { name: "Kossi Agbeko", phone: "+228 90 11 22 33", youss: true }, { name: "Marc Adjovi", phone: "+229 97 88 77 66", youss: false }, { name: "Aminata Ndiaye", phone: "+221 77 123 45 67", youss: true }];
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="card p-4 space-y-3"><p class="t-caption text-ink-3">Destinataire</p>${UI.field("send-name", "", { value: params.to || "", placeholder: "Nom ou numéro de téléphone", icon: "person_search" })}
        <div class="hscroll">${contacts.map((c) => `<button type="button" onclick="document.getElementById('send-name').value=${UI.js(c.name + " · " + c.phone)}" class="flex flex-col items-center gap-1.5 w-20 flex-shrink-0 text-center">${UI.avatar({ name: c.name }, "w-12 h-12")}<span class="t-caption normal-case tracking-normal truncate w-full">${c.name.split(" ")[0]}</span>${c.youss ? `<span class="t-caption text-gold-deep dark:text-gold">Youss</span>` : `<span class="t-caption text-ink-3">Externe</span>`}</button>`).join("")}</div></div>
      <div class="card p-4 space-y-3"><label class="block"><span class="label">Montant (FCFA)</span><input id="send-amount" type="number" inputmode="numeric" min="100" step="100" placeholder="0" class="input input-lg text-2xl font-extrabold"/></label>
        <div class="flex gap-2">${[1000, 5000, 10000, 25000].map((a) => `<button type="button" onclick="document.getElementById('send-amount').value=${a}" class="chip">${a.toLocaleString("fr-FR")}</button>`).join("")}</div>
        ${UI.field("send-note", "Note (optionnel)", { placeholder: "Ex. Remboursement déjeuner", icon: "sticky_note_2" })}
        <p class="t-small text-ink-2">Solde disponible : <b>${ACStore.fmtFCFA(ACState.wallet.balance)}</b> · Frais : gratuits entre utilisateurs YOUSS CONNECT.</p>${UI.error("send-error")}</div>
      ${UI.primaryButton(I18N.t("continue"), "Screens._sendReview()", { size: "lg", iconRight: "arrow_forward" })}</div>`;
    Shell.render(container, { title: "Envoyer de l'argent", back: true, body, nav: false, showNav: true });
  };
  Screens._sendReview = function () {
    const name = document.getElementById("send-name").value.trim(), amount = parseInt(document.getElementById("send-amount").value, 10), note = document.getElementById("send-note").value.trim();
    if (!name) return UI.showError("send-error", "Indiquez un destinataire.");
    if (!amount || amount < 100) return UI.showError("send-error", "Indiquez un montant valide (100 FCFA minimum).");
    const external = /Marc|Externe/i.test(name);
    const fee = external ? EXTERNAL_FEE : 0;
    if (amount + fee > ACState.wallet.balance) { App.nav("paymentFailed", { retry: "walletSend", amount: amount + fee, reason: "insufficient_balance" }); return; }
    pendingSend = { name, amount, note, external, fee };
    UI.openSheet(`<h3 class="t-h3 mb-3">Confirmer l'envoi</h3><div class="card p-4 mb-4">${UI.row("Destinataire", esc(name))}${UI.row("Montant", ACStore.fmtFCFA(amount), true)}${UI.row("Frais", fee ? ACStore.fmtFCFA(fee) + " (hors réseau)" : "Gratuit")}${fee ? UI.row("Total débité", ACStore.fmtFCFA(amount + fee), true) : ""}${note ? UI.row("Note", esc(note)) : ""}</div>${UI.primaryButton("Confirmer avec mon code PIN", "UI.closeSheet();App.nav('securityPin',{action:'walletSendConfirm'})", { icon: "lock" })}`);
  };

  // Confirmation PIN ou empreinte, obligatoire avant un paiement.
  let purchaseJob = null;
  Screens.bioReady = function () {
    return ACState.user.biometricEnrolled !== false && ACState.prefs.biometric !== false;
  };
  Screens.requirePay = function (label, run) {
    if (typeof run !== "function") return;
    purchaseJob = run;
    App.nav("securityPin", { action: "purchase", label: label || "Paiement" });
  };
  Screens._abandonPay = function () { purchaseJob = null; };
  Screens.needCard = function (method) {
    if (method !== "card") return false;
    if ((ACState.wallet.cards || []).length) return false;
    if (App.current) sessionStorage.setItem("yc-after-card", JSON.stringify({ id: App.current.id, params: App.current.params || {} }));
    App.nav("addCard");
    UI.toast("Ajoutez une carte pour continuer.", "info");
    return true;
  };
  Screens.cardAddButton = function () {
    return `<button type="button" onclick="Screens._openAddCard()" class="w-full flex items-center gap-3 rounded-xl border border-dashed border-line p-3 text-left"><span class="menu-icon">${icon("add_card")}</span><span class="flex-1"><span class="block t-title">Ajouter une carte bancaire</span><span class="block t-small text-ink-2">Démo · le numéro complet n'est pas enregistré</span></span></button>`;
  };
  Screens._openAddCard = function () {
    if (App.current) sessionStorage.setItem("yc-after-card", JSON.stringify({ id: App.current.id, params: App.current.params || {} }));
    App.nav("addCard");
  };
  function syncCardMethods() {
    const cards = ACState.wallet.cards || [];
    ACState.paymentMethods = (ACState.paymentMethods || []).filter((m) => m.type !== "card");
    cards.forEach((c) => {
      ACState.paymentMethods.push({ id: c.id, type: "card", label: c.brand + " · " + c.last4, sub: "Expire " + c.exp + " · " + c.holder, icon: "credit_card", last4: c.last4 });
    });
  }
  syncCardMethods();
  Screens._syncCardMethods = syncCardMethods;

  Screens.securityPin = function (container, params) {
    params = params || {}; const action = params.action || "confirm";
    const titles = { walletSendConfirm: "Confirmer l'envoi", changePin: "Nouveau code PIN", walletQrPayConfirm: "Confirmer le paiement", withdraw: "Confirmer le retrait", purchase: "Confirmer le paiement", confirm: "Confirmation sécurisée" };
    const bio = Screens.bioReady();
    const body = `<div class="max-w-narrow mx-auto w-full flex-1 flex flex-col items-center text-center py-6 space-y-5">
      <div class="w-16 h-16 rounded-full bg-gold-soft text-gold-deep flex items-center justify-center">${icon(bio ? "fingerprint" : "lock", "text-[30px]")}</div>
      <div><h2 class="t-h2">${titles[action] || titles.confirm}</h2><p class="t-small text-ink-2 mt-1">${params.label ? esc(params.label) + "<br>" : ""}Code PIN à 4 chiffres ou empreinte. Démo : <b>0000</b></p></div>
      <div class="flex gap-2 sm:gap-3 max-w-full justify-center px-2" onpaste="Screens._pinPaste(event)">${[0, 1, 2, 3].map((i) => `<input id="pin-${i}" type="password" inputmode="numeric" maxlength="1" autocomplete="off" class="input input-lg w-12 sm:w-14 flex-1 max-w-[3.5rem] text-center text-xl sm:text-2xl font-extrabold px-0" oninput="Screens._pinInput(${i},this)" onkeydown="if(event.key==='Backspace'&&!this.value&&${i}>0)document.getElementById('pin-${i - 1}').focus()" aria-label="Chiffre ${i + 1}"/>`).join("")}</div>
      ${UI.error("pin-error")}
      <button type="button" onclick="Screens._biometric('${action}')" class="btn btn-outline">${icon("fingerprint", "text-[22px]")}${bio ? "Utiliser l'empreinte" : "Enregistrer mon empreinte"}</button>
      <div class="w-full">${UI.primaryButton("Confirmer", `Screens._pinConfirm('${action}')`, { size: "lg", icon: "lock" })}</div></div>`;
    Shell.render(container, { title: "Confirmer", back: true, body, nav: false, hideSearch: true });
    setTimeout(() => { const f = document.getElementById("pin-0"); if (f) f.focus(); }, 50);
  };
  Screens._pinInput = (i, el) => { el.value = el.value.replace(/\D/g, "").slice(-1); if (el.value && i < 3) document.getElementById("pin-" + (i + 1)).focus(); };
  Screens._pinPaste = (ev) => { const t = (ev.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 4); if (!t) return; ev.preventDefault(); t.split("").forEach((c, i) => { const el = document.getElementById("pin-" + i); if (el) el.value = c; }); };
  Screens._biometric = function (action) {
    if (!Screens.bioReady()) {
      UI.toast("Enregistrez votre empreinte pour payer ainsi.", "info");
      App.nav("biometricSetup", { next: "securityPin", action: action || "purchase" });
      return;
    }
    UI.toast("Empreinte reconnue.", "success");
    Screens._pinDone(action);
  };
  Screens._pinConfirm = function (action) {
    const wait = window.YCGuard && YCGuard.blocked("pin");
    if (wait) return UI.showError("pin-error", YCGuard.waitMsg(wait));
    const pin = [0, 1, 2, 3].map((i) => (document.getElementById("pin-" + i) || {}).value || "").join("");
    if (pin !== "0000") {
      const left = window.YCGuard ? YCGuard.fail("pin") : 0;
      return UI.showError("pin-error", left ? YCGuard.waitMsg(left) : "Code PIN incorrect (démo : 0000).");
    }
    if (window.YCGuard) YCGuard.ok("pin");
    Screens._pinDone(action);
  };
  Screens._pinDone = function (action) {
    if (action === "walletSendConfirm" && pendingSend) {
      const s = pendingSend;
      if (s.external) {
        const total = s.amount + (s.fee || EXTERNAL_FEE);
        if (total > ACState.wallet.balance) { pendingSend = null; App.nav("paymentFailed", { retry: "walletSend", amount: total, reason: "insufficient_balance" }); return; }
        const label = "Envoi à " + s.name.split("·")[0].trim();
        ACState.wallet.balance -= total;
        const tx = ACStore.addTransaction({ label, amount: -total, type: "debit", status: "pending", service: "wallet", balanceApplied: true });
        ACStore.addActivity({ service: "wallet", title: label, amount: total, status: "En attente", icon: "north_east" });
        ACStore.emit();
        pendingSend = null;
        App.resetTo("paymentPending", { amount: total, title: "Envoi en attente", body: "Le destinataire n'est pas encore sur YOUSS CONNECT : il recevra un SMS pour retirer les fonds sous 72 h.", txid: tx.id });
        return;
      }
      ACStore.whenPaid(ACStore.payFromWallet({ amount: s.amount, label: "Envoi à " + s.name.split("·")[0].trim() + (s.note ? " · " + s.note : ""), service: "wallet" }), (res) => { pendingSend = null; if (window.YCReceipt && res && res.tx) YCReceipt.deliver(res.tx, { title: "Reçu d'envoi" }); App.resetTo("paymentSuccess", { amount: s.amount, title: "Argent envoyé", body: s.name.split("·")[0].trim() + " a reçu " + ACStore.fmtFCFA(s.amount) + ".", next: "wallet" }); }, (res) => App.nav("paymentFailed", { retry: "walletSend", amount: s.amount, reason: res.reason }));
    } else if (action === "changePin") { UI.toast("Code PIN mis à jour.", "success"); App.resetTo("security"); }
    else if (action === "walletQrPayConfirm") Screens._confirmQrPayPaid();
    else if (action === "withdraw") Screens._doWithdrawPaid();
    else if (action === "purchase" && purchaseJob) {
      const job = purchaseJob;
      purchaseJob = null;
      try { job(); }
      catch (err) { console.error(err); UI.toast("Le paiement n'a pas abouti. Réessayez.", "error"); }
    }
    else App.back();
  };

  // Recevoir
  function receivePayload(amount) { const q = new URLSearchParams({ to: ACState.user.phone || "", name: ACState.user.fullName || "" }); if (amount) q.set("amount", amount); return "youss:pay?" + q.toString(); }
  Screens.walletReceive = function (container, params) {
    const amount = parseInt(params.amount, 10) || 0;
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4 text-center">
      <div class="card p-6 flex flex-col items-center"><div id="yc-receive-qr" class="w-56 h-56 bg-white rounded-2xl border border-line flex items-center justify-center p-2">${UI.spinner()}</div>
        <h2 class="t-h2 mt-4">${esc(ACState.user.fullName)}</h2><p class="t-small text-ink-2">${esc(ACState.user.phone)}</p>${amount ? `<p class="t-h3 text-gold-deep dark:text-gold mt-2">${ACStore.fmtFCFA(amount)} demandés</p>` : ""}
        <p class="t-small text-ink-2 mt-3 max-w-[300px]">Faites scanner ce code par un autre utilisateur YOUSS CONNECT pour recevoir un paiement instantané.</p></div>
      <div class="card p-4 flex gap-2"><input id="rcv-amount" type="number" inputmode="numeric" placeholder="Montant demandé (optionnel)" value="${amount || ""}" class="input flex-1"/><button type="button" onclick="App.replace('walletReceive',{amount:document.getElementById('rcv-amount').value})" class="btn btn-dark !w-auto px-4">Générer</button></div>
      <div class="grid grid-cols-2 gap-3">${UI.secondaryButton("Partager mon code", "Screens._shareQr()", { icon: "share" })}${UI.secondaryButton("Copier le lien", "Screens._copyQr()", { icon: "content_copy" })}</div></div>`;
    Shell.render(container, { title: "Recevoir de l'argent", back: true, body, nav: false, showNav: true, onMount: () => YCScanner.render("yc-receive-qr", receivePayload(amount), { size: 208, cell: 6 }) });
  };
  Screens._shareQr = () => { const p = receivePayload(); if (navigator.share) navigator.share({ title: "Mon code Youss Wallet", text: "Payez-moi avec YOUSS CONNECT : " + p }).catch(() => {}); else Screens._copyQr(); };
  Screens._copyQr = () => { const p = receivePayload(); if (navigator.clipboard) navigator.clipboard.writeText(p).then(() => UI.toast("Code copié.", "success")); else UI.toast("Code : " + p, "info"); };

  // Payer (hub)
  Screens.walletPay = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-3">
      ${[["qr_code_scanner", "QR Pay", "Scanner le code d'un marchand ou d'un utilisateur", "App.nav('walletQrPay')"], ["storefront", "Payer un marchand", "Avec son code marchand à 6 chiffres", "Screens._payMerchant()"], ["receipt_long", "Payer une facture", "Eau, électricité, abonnements (conceptuel)", "Screens._payBill()"], ["person", "Envoyer à un contact", "Transfert instantané entre utilisateurs", "App.nav('walletSend')"]].map((x) => `<button type="button" onclick="${x[3]}" class="menu-row"><span class="flex items-center gap-3 min-w-0"><span class="menu-icon bg-gold-soft text-gold-deep">${icon(x[0])}</span><span class="min-w-0"><span class="block t-title">${x[1]}</span><span class="block t-small text-ink-2">${x[2]}</span></span></span>${icon("chevron_right", "text-ink-3")}</button>`).join("")}
      <p class="t-small text-ink-3 text-center pt-2">${I18N.t("conceptual")}</p></div>`;
    Shell.render(container, { title: "Payer", subtitle: "Youss Wallet", back: true, body, nav: false, showNav: true });
  };
  Screens._payMerchant = () => UI.openSheet(`<h3 class="t-h3 mb-3">Code marchand</h3>${UI.field("mc-code", "Code à 6 chiffres", { placeholder: "Ex. 420 118", inputmode: "numeric", icon: "storefront" })}<div class="mt-3">${UI.field("mc-amount", "Montant (FCFA)", { placeholder: "0", type: "number", icon: "payments" })}</div><div class="mt-4">${UI.primaryButton("Continuer", "Screens._payMerchantGo()", { iconRight: "arrow_forward" })}</div>`);
  Screens._payMerchantGo = () => { const code = document.getElementById("mc-code").value.replace(/\D/g, ""), amount = parseInt(document.getElementById("mc-amount").value, 10); if (code.length < 6 || !amount) { UI.toast("Code à 6 chiffres et montant requis.", "error"); return; } UI.closeSheet(); Screens._qrPayFromScan({ type: "pay", to: "Marchand " + code, name: "Marchand #" + code, amount }); };
  Screens._payBill = () => UI.openSheet(`<h3 class="t-h3 mb-1">Payer une facture</h3><p class="t-small text-ink-2 mb-3">Fonction conceptuelle : les émetteurs de factures seront intégrés selon les partenariats.</p>${UI.select("bill-type", "Type", ["Électricité", "Eau", "Internet", "Scolarité"], "Électricité")}<div class="mt-3">${UI.field("bill-ref", "Référence de la facture", { placeholder: "N° client", icon: "tag" })}</div><div class="mt-3">${UI.field("bill-amount", "Montant (FCFA)", { placeholder: "0", type: "number", icon: "payments" })}</div><div class="mt-4">${UI.primaryButton("Payer", "Screens._payBillGo()", { icon: "lock" })}</div>`);
  Screens._payBillGo = () => { const amount = parseInt(document.getElementById("bill-amount").value, 10), type = document.getElementById("bill-type").value; if (!amount) { UI.toast("Indiquez le montant.", "error"); return; } UI.closeSheet(); Screens._qrPayFromScan({ type: "pay", to: "Facture " + type, name: "Facture " + type + " (démo)", amount }); };

  // QR Pay
  const QR_MESSAGES = { unsupported: "Ce navigateur ne permet pas d'accéder à la caméra.", insecure: "La caméra nécessite une connexion sécurisée (HTTPS).", denied: "Accès caméra refusé. Importez une image ou simulez un scan.", nocamera: "Aucune caméra détectée.", busy: "La caméra est utilisée par une autre application.", error: "Impossible de démarrer la caméra." };
  Screens.walletQrPay = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="relative rounded-3xl overflow-hidden bg-[#0A0A0A] aspect-square sm:aspect-[4/3]">
        <video id="yc-qrpay-video" class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity" autoplay muted playsinline></video>
        <div class="absolute inset-0 scan-grid opacity-30"></div>
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none"><div class="relative w-52 h-52"><span class="scan-corner top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl"></span><span class="scan-corner top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl"></span><span class="scan-corner bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl"></span><span class="scan-corner bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl"></span><div id="yc-qrpay-line" class="absolute left-4 right-4 h-0.5 bg-gold animate-scan"></div></div></div>
        <div id="yc-qrpay-fallback" class="absolute inset-0 hidden flex-col items-center justify-center text-white/85 px-8 text-center">${icon("no_photography", "text-[40px]")}<p id="yc-qrpay-msg" class="t-small mt-2"></p></div>
      </div>
      <p id="yc-qrpay-status" class="t-small text-ink-2 text-center">Démarrage de la caméra…</p>
      <div class="grid sm:grid-cols-2 gap-3"><label class="btn btn-outline cursor-pointer">${icon("image", "text-[20px]")}Importer une image<input type="file" accept="image/*" class="hidden" onchange="Screens._qrPayFromFile(this)"/></label>${UI.primaryButton("Simuler un scan marchand", "Screens._simulateQrScan()", { icon: "qr_code_scanner" })}</div>
      <p class="t-small text-ink-3 text-center">Solde : ${ACStore.fmtFCFA(ACState.wallet.balance)}</p></div>`;
    Shell.render(container, { title: "QR Pay", back: true, body, nav: false, hideSearch: true, onMount: Screens._startQrPayCamera });
  };
  Screens._startQrPayCamera = function () {
    const v = document.getElementById("yc-qrpay-video"); if (!v) return;
    const status = document.getElementById("yc-qrpay-status");
    YCScanner.start(v, { onResult: Screens._onQrPayScan }).then(() => { if (!App.current || App.current.id !== "walletQrPay") { YCScanner.stop(); return; } v.classList.remove("opacity-0"); if (status) status.textContent = "Visez le QR d'un marchand ou d'un utilisateur YOUSS CONNECT."; })
      .catch((err) => { const fb = document.getElementById("yc-qrpay-fallback"), msg = document.getElementById("yc-qrpay-msg"), line = document.getElementById("yc-qrpay-line"); if (fb) { fb.classList.remove("hidden"); fb.classList.add("flex"); } if (line) line.classList.add("hidden"); if (msg) msg.textContent = QR_MESSAGES[err && err.code] || QR_MESSAGES.error; if (status) status.textContent = "Importez une image du QR ou utilisez la simulation."; });
  };
  Screens._qrPayFromFile = function (input) { const file = input.files && input.files[0]; input.value = ""; if (!file) return; YCScanner.scanFile(file).then((text) => { if (!text) { UI.toast("Aucun QR Code trouvé dans cette image.", "error"); return; } YCScanner.stop(); Screens._onQrPayScan(text); }).catch(() => UI.toast("Image illisible.", "error")); };
  Screens._onQrPayScan = function (text) {
    const p = YCScanner.parse(text);
    if (p.type === "pay") { Screens._qrPayFromScan(p); return; }
    if (p.type === "site") { UI.toast("QR d'un site culturel détecté.", "info"); App.nav("scannerResult", { id: p.id, scanned: 1 }); return; }
    UI.toast("Ce QR n'est pas un code de paiement YOUSS CONNECT.", "error");
    setTimeout(() => { if (App.current && App.current.id === "walletQrPay") Screens._startQrPayCamera(); }, 1400);
  };
  let pendingQrPay = null;
  Screens._qrPayFromScan = function (p) {
    pendingQrPay = { to: p.to || "", name: p.name || "", amount: p.amount || null };
    const who = esc(p.name || p.to || "Marchand YOUSS CONNECT");
    UI.openSheet(`<div class="flex flex-col items-center text-center space-y-3"><span class="w-14 h-14 rounded-full bg-gold-soft text-gold-deep flex items-center justify-center">${icon("storefront", "text-[28px]")}</span><h3 class="t-h3">${who}</h3>${p.to ? `<p class="t-small text-ink-2">${esc(p.to)}</p>` : ""}
      ${p.amount ? `<p class="t-display">${ACStore.fmtFCFA(p.amount)}</p>` : `<label class="block w-full text-left"><span class="label">Montant (FCFA)</span><input id="yc-qrpay-amount" type="number" inputmode="numeric" min="100" step="100" placeholder="Ex. 2 500" class="input input-lg text-xl font-bold"/></label>`}
      <p class="t-small text-ink-2">Solde : ${ACStore.fmtFCFA(ACState.wallet.balance)}</p>
      <div class="w-full space-y-2 pt-1">${UI.primaryButton("Payer avec Youss Wallet", "Screens._confirmQrPay()", { icon: "lock" })}${UI.secondaryButton(I18N.t("cancel"), "UI.closeSheet();Screens._qrPayCancel()")}</div></div>`);
  };
  Screens._qrPayCancel = () => { if (!App.current) return; if (App.current.id === "walletQrPay") Screens._startQrPayCamera(); else if (App.current.id === "culturalScanner" && Screens._startCameraScan) Screens._startCameraScan(); };
  Screens._confirmQrPay = function () {
    const p = pendingQrPay || {}; let amount = p.amount;
    if (!amount) { const input = document.getElementById("yc-qrpay-amount"); amount = parseInt(input && input.value, 10); if (!isFinite(amount) || amount < 100) { UI.toast("Saisissez un montant valide.", "error"); return; } pendingQrPay.amount = amount; }
    UI.closeSheet();
    App.nav("securityPin", { action: "walletQrPayConfirm" });
  };
  Screens._confirmQrPayPaid = function () {
    const p = pendingQrPay || {}; const amount = p.amount;
    const label = "Paiement QR · " + (p.name || p.to || "Marchand YOUSS CONNECT");
    ACStore.whenPaid(ACStore.payFromWallet({ amount, label, service: "wallet", pointsEarned: Math.round(amount / 500) }), (res) => { pendingQrPay = null; if (window.YCReceipt && res && res.tx) YCReceipt.deliver(res.tx, { title: "Reçu QR Pay" }); App.resetTo("paymentSuccess", { amount, title: "Paiement effectué", body: label, next: "wallet" }); }, (res) => App.nav("paymentFailed", { retry: "walletQrPay", amount, reason: res.reason }));
  };
  Screens._simulateQrScan = function () { YCScanner.stop(); const city = YCData.cityOf(ACState.user.city); const market = city.poi.find((p) => p.kind === "marche") || city.poi[0]; const amount = 1500 + Math.round(Math.random() * 30) * 100; Screens._qrPayFromScan({ type: "pay", to: "+" + ACState.user.dial.replace("+", "") + " 00 00 00 00", name: market.name + " · Stand 42", amount }); };

  // Retirer
  let pendingWithdraw = null;
  Screens.walletWithdraw = function (container) {
    if (!Screens._wdMethod) Screens._wdMethod = "mobile";
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="card p-5"><label class="block"><span class="label">Montant (FCFA)</span><input id="wd-amount" type="number" inputmode="numeric" min="500" step="500" placeholder="Ex. 20 000" value="${esc(Screens._wdAmount || "")}" class="input input-lg text-2xl font-extrabold" oninput="Screens._wdAmount=this.value"/></label><p class="t-small text-ink-2 mt-2">Disponible : <b>${ACStore.fmtFCFA(ACState.wallet.balance)}</b> · minimum 500 FCFA</p></div>
      <div class="card p-4 space-y-2"><p class="t-caption text-ink-3 mb-1">Vers</p>${[["smartphone", "Paiement mobile", "Opérateur à définir · conceptuel", "mobile"], ["store", "Agent YOUSS CONNECT", "Retrait en espèces avec code", "agent"]].map((m) => `<button type="button" onclick="Screens._wdPick('${m[3]}')" data-wd class="w-full flex items-center gap-3 rounded-xl border p-3 text-left ${Screens._wdMethod === m[3] ? "border-gold bg-gold/10" : "border-line"}"><span class="menu-icon">${icon(m[0])}</span><span class="flex-1"><span class="block t-title">${m[1]}</span><span class="block t-small text-ink-2">${m[2]}</span></span></button>`).join("")}</div>
      ${UI.primaryButton("Retirer", "Screens._doWithdraw()", { size: "lg", icon: "account_balance" })}
      <p class="t-small text-ink-3 text-center">${I18N.t("conceptual")}</p></div>`;
    Shell.render(container, { title: "Retirer", subtitle: "Youss Wallet · conceptuel", back: true, body, nav: false, showNav: true });
  };
  Screens._wdPick = (method) => {
    Screens._wdMethod = method;
    const input = document.getElementById("wd-amount");
    Screens._wdAmount = input ? input.value : Screens._wdAmount;
    App.replace("walletWithdraw");
  };
  Screens._doWithdraw = function () {
    const amount = parseInt(document.getElementById("wd-amount").value, 10);
    if (!amount || amount < 500) { UI.toast("Montant minimum 500 FCFA.", "error"); return; }
    if (amount > ACState.wallet.balance) { App.nav("paymentFailed", { retry: "walletWithdraw", amount, reason: "insufficient_balance" }); return; }
    if (!Screens._wdMethod) Screens._wdMethod = "mobile";
    pendingWithdraw = { amount, method: Screens._wdMethod };
    App.nav("securityPin", { action: "withdraw" });
  };
  Screens._doWithdrawPaid = function () {
    const w = pendingWithdraw; if (!w) { App.resetTo("wallet"); return; }
    if (w.amount > ACState.wallet.balance) { pendingWithdraw = null; App.nav("paymentFailed", { retry: "walletWithdraw", amount: w.amount, reason: "insufficient_balance" }); return; }
    ACState.wallet.balance -= w.amount;
    const tx = ACStore.addTransaction({ label: w.method === "agent" ? "Retrait chez un agent" : "Retrait vers paiement mobile", amount: -w.amount, type: "debit", status: "pending", service: "wallet", balanceApplied: true });
    ACStore.addActivity({ service: "wallet", title: tx.label, amount: w.amount, status: "En attente", icon: "account_balance" });
    ACStore.emit(); pendingWithdraw = null; Screens._wdAmount = "";
    App.resetTo("paymentPending", { amount: w.amount, title: "Retrait en attente", body: w.method === "agent" ? "Présentez ce code à un agent YOUSS CONNECT pour recevoir vos espèces." : "Le transfert vers votre compte mobile sera confirmé sous quelques minutes.", code: w.method === "agent" ? String(Math.floor(100000 + Math.random() * 899999)) : "", txid: tx.id });
  };

  // États de paiement (partagés par tous les services)
  Screens.paymentSuccess = function (container, params) {
    const amount = parseInt(params.amount, 10) || 0;
    const rest = params.rest ? YCData.restaurant(params.rest) : null;
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      ${UI.successHero({ icon: "check_circle", title: params.title || "Paiement réussi", body: params.body || (amount ? ACStore.fmtFCFA(amount) + " réglés via Youss Wallet." : "Opération confirmée.") })}
      ${amount ? `<div class="card p-5 text-center"><p class="t-caption text-ink-3">Montant</p><p class="t-display">${ACStore.fmtFCFA(amount)}</p><p class="t-small text-ink-2 mt-1">Nouveau solde : ${ACStore.fmtFCFA(ACState.wallet.balance)} · ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</p></div>` : ""}
      ${params.next === "transport" ? UI.nextSteps([
        rest ? { icon: "restaurant", label: rest.name, sub: "Restaurant près de votre arrivée", onclick: go("restaurantDetail", { id: rest.id }) } : { icon: "restaurant", label: "Restaurants à proximité", sub: "Près de votre arrivée", onclick: "App.nav('restaurants')" },
        { icon: "confirmation_number", label: "Événements à venir", sub: "Ce soir à " + esc(ACState.user.city), onclick: "App.nav('events')" },
        { icon: "workspace_premium", label: "+25 points Youss Bonus", sub: "Voir mes récompenses", onclick: "App.nav('rewards')" }
      ]) : ""}
      <div class="grid grid-cols-2 gap-3">${UI.secondaryButton("Télécharger le reçu", "Screens._successReceipt('down')", { icon: "download" })}${UI.secondaryButton("Partager le reçu", "Screens._successReceipt('share')", { icon: "share" })}</div>
      ${UI.primaryButton(params.next === "wallet" ? "Retour au Wallet" : I18N.t("home_btn"), params.next === "wallet" ? "App.resetTo('wallet')" : "App.resetTo('home')")}</div>`;
    Shell.render(container, { title: params.title || "Paiement réussi", back: "App.resetTo('home')", body, nav: false, hideSearch: true });
  };
  Screens._successReceipt = function (mode) {
    const r = window.YCReceipt && YCReceipt.current();
    if (!r) { UI.toast("Aucun reçu disponible pour cette opération.", "info"); return; }
    if (mode === "share") YCReceipt.share(r);
    else { YCReceipt.download(r); UI.toast("Reçu téléchargé.", "success"); }
  };
  Screens.paymentPending = function (container, params) {
    const amount = parseInt(params.amount, 10) || 0;
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      ${UI.successHero({ icon: "hourglass_top", tone: "warn", title: params.title || "Paiement en attente", body: params.body || "La confirmation arrivera dès que le réseau sera disponible." })}
      <div class="card p-5 text-center">${amount ? `<p class="t-display">${ACStore.fmtFCFA(amount)}</p>` : ""}${params.code ? `<p class="t-caption text-ink-3 mt-3">Code de retrait / dépôt</p><p class="t-h1 tracking-[0.3em]">${esc(params.code)}</p><p class="t-small text-ink-2">Valable 24 h · ne le partagez qu'avec l'agent</p>` : `<div class="flex items-center justify-center gap-2 mt-2">${UI.spinner("!w-5 !h-5 !border-2")}<span class="t-small text-ink-2">Traitement en cours…</span></div>`}</div>
      <div class="grid grid-cols-2 gap-3">${UI.secondaryButton("Historique des transactions", "App.nav('walletHistory')", { icon: "receipt_long" })}${UI.primaryButton("Simuler la confirmation", `Screens._confirmPending('${esc(params.txid || "")}')`, { icon: "check" })}</div></div>`;
    Shell.render(container, { title: "En attente", back: "App.resetTo('wallet')", body, nav: false, hideSearch: true });
  };
  Screens._confirmPending = (txid) => {
    const t = txid ? ACState.wallet.transactions.find((x) => x.id === txid) : ACState.wallet.transactions.find((x) => x.status === "pending");
    if (!t || t.status !== "pending") { App.resetTo("wallet"); return; }
    if (!t.balanceApplied) {
      const amt = Math.abs(t.amount);
      if (t.type === "credit") {
        ACState.wallet.balance += amt;
        t.balanceApplied = true;
      } else if (t.type === "debit") {
        if (amt > ACState.wallet.balance) {
          App.nav("paymentFailed", { retry: "wallet", amount: amt, reason: "insufficient_balance" });
          return;
        }
        ACState.wallet.balance -= amt;
        t.balanceApplied = true;
      }
    }
    t.status = "success";
    const a = ACState.activities.find((x) => x.title === t.label && x.status === "En attente");
    if (a) a.status = "Terminé";
    ACStore.addNotification("Opération confirmée", t.label + " · " + ACStore.fmtFCFA(Math.abs(t.amount)), "wallet", "wallet");
    ACStore.emit();
    if (window.YCReceipt) YCReceipt.deliver(t, { title: "Reçu YOUSS CONNECT" });
    App.resetTo("paymentSuccess", { amount: Math.abs(t.amount), title: "Opération confirmée", body: t.type === "credit" ? "Votre solde a été crédité." : "L'opération est confirmée.", next: "wallet" });
  };
  Screens.paymentFailed = function (container, params) {
    const reasons = { insufficient_balance: ["Solde insuffisant", "Votre solde Youss Wallet ne couvre pas ce montant. Rechargez ou choisissez un autre moyen de paiement."], offline: ["Vous êtes hors ligne", "Le paiement nécessite une connexion. Réessayez dès que le réseau est disponible."], error: ["Paiement impossible", "Une erreur est survenue. Aucun montant n'a été débité."] };
    const r = reasons[params.reason] || reasons.error;
    const amount = parseInt(params.amount, 10) || 0;
    const retry = params.retry ? `App.resetTo('${esc(params.retry)}'${params.retryParams ? ",{id:'" + esc(params.retryParams) + "'}" : ""})` : "App.back()";
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      ${UI.successHero({ icon: "error", tone: "danger", title: r[0], body: r[1] })}
      ${amount ? `<div class="card p-5 text-center"><p class="t-caption text-ink-3">Montant demandé</p><p class="t-display">${ACStore.fmtFCFA(amount)}</p><p class="t-small text-ink-2 mt-1">Solde disponible : ${ACStore.fmtFCFA(ACState.wallet.balance)}</p></div>` : ""}
      <div class="space-y-3">${params.reason === "insufficient_balance" ? UI.primaryButton("Recharger mon Wallet", `App.nav('walletTopup')`, { size: "lg", icon: "add" }) : UI.primaryButton(I18N.t("retry"), retry, { size: "lg", icon: "replay" })}${params.reason === "insufficient_balance" && params.retry ? UI.secondaryButton("Réessayer avec un autre moyen", retry, { icon: "payments" }) : ""}${UI.secondaryButton(I18N.t("home_btn"), "App.resetTo('home')")}</div></div>`;
    Shell.render(container, { title: "Paiement", back: true, body, nav: false, hideSearch: true });
  };

  function luhnOk(num) {
    const s = String(num || "").replace(/\D/g, "");
    if (s.length < 13 || s.length > 19) return false;
    let sum = 0, alt = false;
    for (let i = s.length - 1; i >= 0; i--) {
      let n = parseInt(s.charAt(i), 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }
  function brandOf(num) {
    const s = String(num || "").replace(/\D/g, "");
    if (/^3[47]/.test(s)) return "American Express";
    if (/^4/.test(s)) return "Visa";
    if (/^5[1-5]/.test(s) || /^2/.test(s)) return "Mastercard";
    return "Carte";
  }
  Screens._cardFormat = function (el) {
    const d = el.value.replace(/\D/g, "").slice(0, 19);
    el.value = d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };
  Screens.addCard = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="card p-5 space-y-3">
        <p class="t-caption text-ink-3">Paiement de démonstration</p>
        <h2 class="t-h3">Coordonnées de la carte</h2>
        <p class="t-small text-ink-2">Saisissez une carte de test. Le numéro complet et le cryptogramme ne sont pas enregistrés : seuls la marque, le titulaire, l'expiration et les 4 derniers chiffres restent sur cet appareil.</p>
        ${UI.field("card-holder", "Titulaire", { placeholder: "Nom imprimé sur la carte", autocomplete: "cc-name", icon: "person" })}
        ${UI.field("card-number", "Numéro de carte", { placeholder: "4242 4242 4242 4242", inputmode: "numeric", maxlength: "23", autocomplete: "cc-number", icon: "credit_card", attrs: "oninput=\"Screens._cardFormat(this)\"" })}
        <div class="grid grid-cols-2 gap-3">${UI.field("card-exp", "Expiration", { placeholder: "MM/AA", inputmode: "numeric", maxlength: "5", autocomplete: "cc-exp" })}${UI.field("card-cvv", "Cryptogramme", { placeholder: "123", type: "password", inputmode: "numeric", maxlength: "4", autocomplete: "cc-csc" })}</div>
        ${UI.error("card-error")}
      </div>
      ${UI.primaryButton("Enregistrer la carte", "Screens._saveCard()", { size: "lg", icon: "lock" })}
      <p class="t-small text-ink-3 text-center">Aucun montant n'est envoyé à une banque. Numéro de test accepté : 4242 4242 4242 4242.</p>
    </div>`;
    Shell.render(container, { title: "Carte bancaire", back: true, body, nav: false, showNav: true });
  };
  Screens._saveCard = function () {
    const holder = ((document.getElementById("card-holder") || {}).value || "").trim();
    const raw = ((document.getElementById("card-number") || {}).value || "").replace(/\D/g, "");
    const exp = ((document.getElementById("card-exp") || {}).value || "").trim();
    const cvv = ((document.getElementById("card-cvv") || {}).value || "").replace(/\D/g, "");
    if (holder.length < 2) return UI.showError("card-error", "Indiquez le nom du titulaire.");
    if (!luhnOk(raw)) return UI.showError("card-error", "Numéro de carte invalide. Essayez 4242 4242 4242 4242.");
    const m = exp.match(/^(\d{2})\s*\/\s*(\d{2})$/);
    if (!m) return UI.showError("card-error", "Expiration au format MM/AA.");
    const month = parseInt(m[1], 10), year = 2000 + parseInt(m[2], 10);
    if (month < 1 || month > 12) return UI.showError("card-error", "Mois d'expiration invalide.");
    if (new Date(year, month, 1) <= new Date()) return UI.showError("card-error", "Cette carte est expirée.");
    const brand = brandOf(raw);
    if (cvv.length < (brand === "American Express" ? 4 : 3)) return UI.showError("card-error", "Cryptogramme incomplet.");
    const card = { id: ACStore.uid("card"), brand: brand, last4: raw.slice(-4), exp: m[1] + "/" + m[2], holder: holder };
    ACState.wallet.cards = ACState.wallet.cards || [];
    ACState.wallet.cards.push(card);
    ACState.prefs.cardId = card.id;
    ACState.prefs.paymentMethod = "card";
    Screens._preferCard = true;
    Screens._syncCardMethods();
    const num = document.getElementById("card-number"), sec = document.getElementById("card-cvv");
    if (num) num.value = "";
    if (sec) sec.value = "";
    ACStore.quietly(function () { ACStore.emit(); });
    UI.toast("Carte " + brand + " " + card.last4 + " enregistrée.", "success");
    const rawBack = sessionStorage.getItem("yc-after-card");
    sessionStorage.removeItem("yc-after-card");
    if (rawBack) {
      try {
        const back = JSON.parse(rawBack);
        if (back && back.id && window.YCGuard && YCGuard.screenOk(back.id)) { App.back(); return; }
      } catch (e) { /* retour simple */ }
    }
    App.back();
  };
})();
