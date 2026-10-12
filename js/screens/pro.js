/* Espace restaurant — inscription par lien d'invitation. Accès : #/pro/rejoindre?t=YC-PRO-MAMAN */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc } = UI;
  const TOKEN = "YC-PRO-MAMAN";
  const NAV = [
    { id: "proHome", label: "Commandes", icon: "receipt_long" },
    { id: "proMenu", label: "Menu", icon: "restaurant_menu" },
    { id: "proHours", label: "Horaires", icon: "schedule" },
    { id: "proPayouts", label: "Paiements", icon: "payments" }
  ];

  function on() { return sessionStorage.getItem("yc-pro") === "1"; }
  function setOn(v) { if (v) sessionStorage.setItem("yc-pro", "1"); else sessionStorage.removeItem("yc-pro"); }
  window.YCGate = window.YCGate || {};
  YCGate.pro = on;
  YCGate.setPro = setOn;

  function rest() { return YCData.restaurant("rest1"); }
  function tickets() {
    ACState.kitchen = ACState.kitchen || { restId: "rest1", dishes: [], paused: false, ticket: [] };
    if (!ACState.kitchen.ticket.length) {
      ACState.kitchen.ticket = [
        { id: "kt1", number: "YC-R-1041", client: "Alassane K.", items: "Poisson braisé, Bissap", total: 5500, status: "Nouvelle", at: "il y a 3 min" },
        { id: "kt2", number: "YC-R-1038", client: "Fatou D.", items: "Pâte sauce d'arachide × 2", total: 5000, status: "En préparation", at: "il y a 12 min" },
        { id: "kt3", number: "YC-R-1032", client: "Marc A.", items: "Igname pilée", total: 3000, status: "Prête", at: "il y a 28 min" }
      ];
    }
    return ACState.kitchen.ticket;
  }

  function layout(active, title, body) {
    const r = rest();
    document.getElementById("app").innerHTML = `
      <div class="min-h-dvh flex flex-col bg-surface">
        <header class="sticky top-0 z-20 bg-card border-b border-line">
          <div class="px-4 h-14 flex items-center justify-between gap-3">
            <div class="min-w-0"><p class="t-caption">Cuisine</p><h1 class="t-title truncate">${esc(r.name)}</h1></div>
            <button type="button" onclick="Screens._proOut()" class="t-small font-semibold text-ink-2">Quitter</button>
          </div>
          <nav class="flex gap-1 overflow-x-auto no-scrollbar px-3 pb-2">${NAV.map((n) => `<button type="button" onclick="App.nav('${n.id}')" class="chip ${active === n.id ? "on" : ""}">${n.label}</button>`).join("")}</nav>
        </header>
        <main class="flex-1 px-4 py-5 space-y-4 max-w-narrow mx-auto w-full">${title ? `<h2 class="t-h3">${title}</h2>` : ""}${body}</main>
      </div>`;
  }

  Screens.proJoin = function (container, params) {
    const t = (params && params.t) || "";
    const ok = t.toUpperCase() === TOKEN;
    container.innerHTML = `<div class="min-h-dvh flex items-center justify-center px-5 py-10">
      <div class="w-full max-w-[420px]">
        <p class="t-caption">Invitation prestataire</p>
        <h1 class="t-h1 mt-1">Ouvrir la cuisine</h1>
        ${ok ? `<p class="t-body text-ink-2 mt-2">Lien valide pour <strong>Chez Maman Bénin</strong>, Haie Vive, Cotonou. Complétez le dossier, puis accédez aux commandes.</p>
          <div class="card p-4 mt-5 space-y-2 t-small"><p class="t-title">Pièces (démo)</p><p>CNI du gérant, RCCM, photo de la salle, RIB ou Mobile Money.</p></div>
          <button type="button" onclick="Screens._proEnter()" class="btn btn-lg btn-primary btn-block mt-5">Valider et entrer</button>`
      : `<p class="t-body text-ink-2 mt-2">Ce lien n'est pas valide ou a déjà été utilisé. Demandez un nouvel envoi à KYA.</p>
          ${UI.field("pj-tok", "Jeton", { placeholder: "YC-PRO-…" })}
          <button type="button" onclick="App.nav('proJoin',{t:(document.getElementById('pj-tok').value||'').trim()})" class="btn btn-primary btn-block mt-3">Vérifier</button>`}
        <p class="t-small text-ink-3 mt-6">Démo : jeton YC-PRO-MAMAN. En production, le lien expire et ne s'ouvre qu'une fois.</p>
      </div>
    </div>`;
  };
  Screens.proLogin = function (container) {
    if (on()) { App.replace("proHome"); return; }
    container.innerHTML = `<div class="min-h-dvh flex items-center justify-center px-5 py-10">
      <div class="w-full max-w-[400px]">
        <p class="t-caption">Espace restaurant</p>
        <h1 class="t-h1 mt-1">Connexion cuisine</h1>
        <p class="t-small text-ink-2 mt-2">Téléphone du gérant. Code démo 1234.</p>
        ${UI.field("pr-phone", "Téléphone", { value: "+229 97 11 22 33", type: "tel" })}
        ${UI.field("pr-otp", "Code", { inputmode: "numeric", maxlength: 4, placeholder: "1234" })}
        <button type="button" onclick="Screens._proPin()" class="btn btn-lg btn-primary btn-block mt-4">Entrer</button>
        <button type="button" onclick="App.nav('proJoin',{t:'YC-PRO-MAMAN'})" class="mt-4 t-small font-semibold">Je n'ai pas encore de compte · invitation</button>
      </div>
    </div>`;
  };
  Screens._proEnter = function () { setOn(true); UI.toast("Dossier accepté (démo). Cuisine ouverte.", "success"); App.resetTo("proHome"); };
  Screens._proPin = function () {
    const c = (document.getElementById("pr-otp") || {}).value || "";
    if (c !== "1234") { UI.toast("Code incorrect.", "error"); return; }
    setOn(true); App.resetTo("proHome");
  };
  Screens._proOut = function () { setOn(false); App.resetTo("proLogin"); };

  Screens.proHome = function () {
    const list = tickets();
    const paused = ACState.kitchen.paused;
    layout("proHome", "", `
      <div class="flex items-center justify-between gap-3">
        <p class="t-small text-ink-2">${paused ? "Restaurant en pause. Les clients ne commandent plus." : "Restaurant ouvert."}</p>
        <button type="button" onclick="Screens._proPause()" class="btn btn-sm ${paused ? "btn-primary" : "btn-outline"}">${paused ? "Reprendre" : "Pause"}</button>
      </div>
      <div class="space-y-3">${list.map((o) => `<div class="card p-4">
        <div class="flex items-start justify-between gap-2"><div><p class="t-caption">${o.number} · ${o.at}</p><p class="t-title mt-0.5">${esc(o.client)}</p><p class="t-small text-ink-2">${esc(o.items)}</p></div><span class="t-title">${ACStore.fmtFCFA(o.total)}</span></div>
        <div class="flex gap-2 mt-3">${o.status !== "Livrée" ? `<button type="button" onclick="Screens._proAdvance('${o.id}')" class="btn btn-sm btn-dark">${o.status === "Nouvelle" ? "En préparation" : o.status === "En préparation" ? "Prête" : "Remise"}</button>` : ""}<span class="t-small self-center text-ink-2">${o.status}</span></div>
      </div>`).join("")}</div>`);
  };
  Screens._proPause = function () { ACState.kitchen.paused = !ACState.kitchen.paused; ACStore.emit(); };
  Screens._proAdvance = function (id) {
    const o = tickets().find((x) => x.id === id); if (!o) return;
    o.status = o.status === "Nouvelle" ? "En préparation" : o.status === "En préparation" ? "Prête" : "Livrée";
    ACStore.emit();
  };

  Screens.proMenu = function () {
    const r = rest();
    const extra = ACState.kitchen.dishes || [];
    layout("proMenu", "Plats", `
      <div class="card divide-y divide-line">${r.menu.map((d) => `<div class="p-3.5 flex items-center justify-between gap-3"><div class="min-w-0"><p class="t-title truncate">${esc(d.name)}</p><p class="t-small text-ink-2">${ACStore.fmtFCFA(d.price)} · ${esc(d.group)}</p></div><span class="t-caption">${d.opsAdd ? "Ajouté" : "Carte"}</span></div>`).join("")}</div>
      <div class="card p-4 space-y-3">
        <p class="t-title">Ajouter un plat</p>
        ${UI.field("pd-name", "Nom", { placeholder: "Ex. Amiwo au poulet" })}
        <div class="grid grid-cols-2 gap-3">${UI.field("pd-price", "Prix (FCFA)", { type: "number" })}${UI.select("pd-group", "Catégorie", ["Plats", "Boissons", "Entrées"], "Plats")}</div>
        ${UI.primaryButton("Publier sur l'app", "Screens._proAddDish()", { icon: "add" })}
      </div>
      ${extra.length ? `<p class="t-small text-ink-3">${extra.length} plat(s) ajouté(s) depuis cet espace. Ils apparaissent sur la fiche client.</p>` : ""}`);
  };
  Screens._proAddDish = function () {
    const name = (document.getElementById("pd-name") || {}).value.trim();
    const price = parseInt((document.getElementById("pd-price") || {}).value, 10);
    if (!name || !price) { UI.toast("Nom et prix requis.", "error"); return; }
    ACState.kitchen.dishes = ACState.kitchen.dishes || [];
    ACState.kitchen.dishes.push({ id: "pd_" + Date.now(), name, desc: "Ajouté par le restaurant", price, img: rest().img, group: document.getElementById("pd-group").value, opsAdd: true });
    ACStore.emit();
    UI.toast("Plat visible dans l'app client.", "success");
  };

  Screens.proHours = function () {
    const r = rest();
    layout("proHours", "Horaires", `
      <div class="card p-4"><p class="t-title">${r.hours}</p><p class="t-small text-ink-2 mt-1">${r.area}, ${r.city}</p></div>
      <p class="t-small text-ink-2">En production : jours fériés, service du soir, rupture d'un plat sans fermer la salle.</p>`);
  };
  Screens.proPayouts = function () {
    layout("proPayouts", "Paiements", `
      <div class="card p-5"><p class="t-caption">À verser (7 j)</p><p class="t-h1 mt-1">${ACStore.fmtFCFA(186400)}</p><p class="t-small text-ink-2 mt-1">Commission YOUSS 12 % déjà déduite. Versement Mobile Money du gérant.</p></div>
      <p class="t-small text-ink-3">Les vrais virements suivent le KYC et le calendrier finance KYA.</p>`);
  };
})();
