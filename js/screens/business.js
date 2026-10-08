/* Youss Business — tableau de bord professionnel, profil, produits, services, commandes, réservations, statistiques */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc, go } = UI;
  const B = () => ACState.business;
  const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const STAGES = ["Nouvelle", "En traitement", "Expédiée", "Livrée"];

  function barChart(values, h) {
    const max = Math.max.apply(null, values) || 1, w = 100 / values.length;
    return `<svg viewBox="0 0 100 ${h || 48}" class="w-full h-32" preserveAspectRatio="none" aria-hidden="true">${values.map((v, i) => { const bh = Math.max(2, (v / max) * ((h || 48) - 4)); return `<rect x="${i * w + w * 0.2}" y="${(h || 48) - bh}" width="${w * 0.6}" height="${bh}" rx="1.5" class="${i === values.length - 2 ? "fill-gold" : "fill-ink/15"}"/>`; }).join("")}</svg>`;
  }

  Screens.business = function (container) {
    const b = B();
    const revenue = b.stats.week.reduce((s, v) => s + v, 0);
    const newOrders = b.orders.filter((o) => o.status === "Nouvelle").length, pendingBookings = b.bookings.filter((x) => x.status === "En attente").length;
    const body = `
      <section class="card-dark p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center gap-4"><div class="flex items-center gap-4 flex-1">${UI.avatar({ name: b.profile.name }, "w-16 h-16 text-xl")}<div><p class="t-caption text-gold">Espace professionnel</p><h2 class="t-h1 flex items-center gap-2">${esc(b.profile.name)}${b.profile.verified ? icon("verified", "text-gold", true) : ""}</h2><p class="t-small text-white/70">${esc(b.profile.category)} · ${esc(b.profile.city)} · ★ ${b.stats.rating}</p></div></div>
        <div class="flex gap-2">${UI.button("Profil pro", "App.nav('businessProfile')", { variant: "outline", block: false, cls: "!bg-white/10 !text-white !border-white/20", icon: "storefront" })}${UI.button("Statistiques", "App.nav('businessStats')", { variant: "primary", block: false, icon: "monitoring" })}</div></section>
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        ${[["payments", "Chiffre d'affaires 7 j", ACStore.fmtFCFA(revenue), "+12 % vs semaine passée", "text-success"], ["receipt_long", "Commandes", b.orders.length + "", newOrders + " nouvelle" + (newOrders > 1 ? "s" : ""), "text-gold-deep dark:text-gold"], ["event_seat", "Réservations", b.bookings.length + "", pendingBookings + " en attente", "text-warn"], ["visibility", "Visites de la boutique", b.stats.visits.toLocaleString("fr-FR"), "Conversion " + b.stats.conversion + " %", "text-ink-2"]].map((k) => `<div class="kpi"><span class="text-gold">${icon(k[0], "text-[22px]")}</span><p class="t-caption text-ink-3">${k[1]}</p><p class="t-h2">${k[2]}</p><p class="t-small ${k[4]} font-semibold">${k[3]}</p></div>`).join("")}
      </section>
      <div class="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div class="space-y-6">
          <section class="card p-5">${UI.sectionTitle("Ventes des 7 derniers jours", "Détails", "App.nav('businessStats')")}${barChart(b.stats.week)}<div class="flex justify-between t-caption text-ink-3 mt-1">${DAYS.map((d) => `<span>${d}</span>`).join("")}</div></section>
          <section>${UI.sectionTitle("Commandes récentes", "Tout voir", "App.nav('businessOrders')")}<div class="card divide-y divide-line">${b.orders.slice(0, 4).map(orderRow).join("")}</div></section>
        </div>
        <aside class="space-y-3">
          ${[["storefront", "Profil professionnel", "Informations, horaires, visibilité", "businessProfile"], ["inventory_2", "Produits & stocks", b.products.length + " produits en ligne", "businessCatalogue"], ["design_services", "Services", b.services.length + " prestations", "businessServices"], ["receipt_long", "Commandes", newOrders + " à traiter", "businessOrders"], ["event_seat", "Réservations", pendingBookings + " en attente", "businessBookings"], ["monitoring", "Statistiques", "Ventes, visites, conversion", "businessStats"], ["verified_user", "Vérification du compte pro", b.profile.verified ? "Compte vérifié" : "En attente", "businessVerify"]].map((m) => `<button type="button" onclick="${m[3] === "businessVerify" ? "Screens._bizVerify()" : "App.nav('" + m[3] + "')"}" class="menu-row"><span class="flex items-center gap-3 min-w-0"><span class="menu-icon">${icon(m[0])}</span><span class="min-w-0"><span class="block t-title">${m[1]}</span><span class="block t-small text-ink-2 truncate">${m[2]}</span></span></span>${icon("chevron_right", "text-ink-3")}</button>`).join("")}
          <button type="button" onclick="Screens._bizSwitch()" class="w-full t-small text-ink-2 py-2">Repasser en mode particulier</button>
        </aside>
      </div>`;
    Shell.render(container, { title: "Youss Business", subtitle: "Gérez votre activité", back: "App.nav('home')", body, nav: false, showNav: true });
  };
  function orderRow(o) {
    return `<button type="button" onclick="${go("businessOrderDetail", { id: o.id })}" class="w-full flex items-center justify-between gap-3 p-3.5 text-left hover:bg-surface-low"><span class="flex items-center gap-3 min-w-0">${UI.avatar({ name: o.client }, "w-10 h-10")}<span class="min-w-0"><span class="block t-title truncate">${esc(o.item)}</span><span class="block t-small text-ink-2">${esc(o.client)} · ${esc(o.at)}</span></span></span><span class="text-right"><span class="block t-title font-bold">${ACStore.fmtFCFA(o.amount)}</span>${UI.badge(o.status, o.status === "Nouvelle" ? "gold" : o.status === "Livrée" ? "success" : "neutral")}</span></button>`;
  }
  Screens._bizVerify = () => { UI.toast(B().profile.verified ? "Compte professionnel déjà vérifié." : "Dossier de vérification envoyé à KYA CORPORATION.", "success"); };
  Screens._bizSwitch = () => { ACState.session.mode = "particulier"; UI.toast("Mode particulier activé.", "info"); App.nav("profile"); };

  Screens.businessProfile = function (container) {
    const p = B().profile;
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="card p-5 flex items-center gap-4">${UI.avatar({ name: p.name }, "w-16 h-16 text-xl")}<div class="flex-1"><p class="t-title">Logo de la boutique</p><p class="t-small text-ink-2">PNG ou JPG, 512 × 512 px</p></div>${UI.button("Changer", "UI.toast('Import du logo disponible dans la version finale.','info')", { variant: "outline", block: false, size: "sm" })}</div>
      <div class="card p-5 space-y-3">${UI.field("bp-name", "Nom de l'entreprise", { value: p.name })}${UI.select("bp-cat", "Catégorie", ["Mode & artisanat", "Restaurant", "Commerce", "Transport", "Événementiel", "Culture & tourisme", "Services"], p.category)}
        <div class="grid grid-cols-2 gap-3">${UI.select("bp-city", "Ville", YCData.DESTINATIONS, p.city)}${UI.field("bp-hours", "Horaires", { value: p.hours })}</div>${UI.field("bp-address", "Adresse", { value: p.address, icon: "location_on" })}${UI.field("bp-phone", "Téléphone", { value: p.phone, type: "tel", icon: "call" })}
        <label class="block"><span class="label">Description</span><textarea id="bp-desc" class="textarea">${esc(p.desc)}</textarea></label></div>
      <div class="card p-4 space-y-3"><p class="t-caption text-ink-3">Visibilité</p>${[["Boutique visible sur Youss Market", true], ["Accepter les réservations", true], ["Mise en avant sponsorisée (offre pro)", false]].map((x) => `<div class="flex items-center justify-between"><span class="t-body">${x[0]}</span>${UI.toggle(x[1], "this.classList.toggle('on');UI.toast('Préférence enregistrée.','success')", x[0])}</div>`).join("")}</div>
      ${UI.primaryButton("Enregistrer", "Screens._bizSaveProfile()", { size: "lg", icon: "save" })}</div>`;
    Shell.render(container, { title: "Profil professionnel", back: true, body, nav: false, showNav: true });
  };
  Screens._bizSaveProfile = () => { const p = B().profile; const g = (id) => (document.getElementById(id) || {}).value || ""; p.name = g("bp-name") || p.name; p.category = g("bp-cat"); p.city = g("bp-city"); p.hours = g("bp-hours"); p.address = g("bp-address"); p.phone = g("bp-phone"); p.desc = g("bp-desc"); ACStore.emit(); UI.toast("Profil professionnel mis à jour.", "success"); App.nav("business"); };

  Screens.businessCatalogue = function (container) {
    const b = B();
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="grid grid-cols-3 gap-2">${[["Produits", b.products.length], ["En stock", b.products.filter((p) => p.stock > 0).length], ["Rupture", b.products.filter((p) => p.stock === 0).length]].map((k) => `<div class="kpi items-center"><p class="t-h2">${k[1]}</p><p class="t-caption text-ink-3">${k[0]}</p></div>`).join("")}</div>
      <div class="card divide-y divide-line">${b.products.map((p) => `<div class="p-3.5 flex items-center gap-3"><span class="menu-icon">${icon("inventory_2")}</span><div class="flex-1 min-w-0"><p class="t-title truncate">${esc(p.name)}</p><p class="t-small ${p.stock === 0 ? "text-danger" : p.stock < 5 ? "text-warn" : "text-ink-2"}">${ACStore.fmtFCFA(p.price)} · stock ${p.stock}${p.stock === 0 ? " · rupture" : p.stock < 5 ? " · faible" : ""}</p></div>
        <div class="flex items-center gap-1.5"><button type="button" onclick="Screens._bizStock('${p.id}',-1)" class="icon-btn w-9 h-9" aria-label="Moins">${icon("remove", "text-[18px]")}</button><button type="button" onclick="Screens._bizStock('${p.id}',1)" class="icon-btn w-9 h-9" aria-label="Plus">${icon("add", "text-[18px]")}</button><button type="button" onclick="Screens._bizDelete('${p.id}')" class="icon-btn w-9 h-9 !text-danger" aria-label="Supprimer">${icon("delete", "text-[18px]")}</button></div></div>`).join("") || `<p class="p-6 t-small text-ink-2 text-center">Aucun produit. Ajoutez votre premier article.</p>`}</div>
      ${UI.primaryButton("Ajouter un produit", "App.nav('businessAddProduct')", { size: "lg", icon: "add" })}</div>`;
    Shell.render(container, { title: "Produits & stocks", back: true, body, nav: false, showNav: true });
  };
  Screens._bizStock = (id, d) => { const p = B().products.find((x) => x.id === id); if (!p) return; p.stock = Math.max(0, p.stock + d); ACStore.emit(); };
  Screens._bizDelete = (id) => UI.confirm({ title: "Supprimer ce produit ?", body: "Il ne sera plus visible sur Youss Market.", okLabel: "Supprimer", danger: true, icon: "delete", onOk: `ACState.business.products=ACState.business.products.filter(p=>p.id!=='${id}');ACStore.emit();UI.toast('Produit supprimé.','info')` });
  Screens.businessAddProduct = function (container) {
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4"><div class="card p-5 space-y-3">${UI.field("np-name", "Nom du produit", { placeholder: "Ex. Sac en raphia" })}<div class="grid grid-cols-2 gap-3">${UI.field("np-price", "Prix (FCFA)", { type: "number", placeholder: "0" })}${UI.field("np-stock", "Stock initial", { type: "number", placeholder: "0" })}</div>${UI.select("np-cat", "Catégorie", YCData.PRODUCT_CATS, "Mode")}<label class="block"><span class="label">Description</span><textarea id="np-desc" class="textarea" placeholder="Matière, dimensions, origine…"></textarea></label><div class="rounded-xl border border-dashed border-line p-6 text-center text-ink-2 t-small">${icon("add_photo_alternate", "text-[28px] text-ink-3")}<p class="mt-1">Photos du produit (jusqu'à 5)</p></div></div>${UI.primaryButton("Publier sur Youss Market", "Screens._bizAddProduct()", { size: "lg", icon: "publish" })}</div>`;
    Shell.render(container, { title: "Nouveau produit", back: true, body, nav: false, showNav: true });
  };
  Screens._bizAddProduct = () => { const name = document.getElementById("np-name").value.trim(), price = parseInt(document.getElementById("np-price").value, 10), stock = parseInt(document.getElementById("np-stock").value, 10) || 0; if (!name || !price) { UI.toast("Nom et prix requis.", "error"); return; } B().products.push({ id: ACStore.uid("bp"), name, price, stock }); ACStore.emit(); UI.toast("Produit publié.", "success"); App.nav("businessCatalogue"); };

  Screens.businessServices = function (container) {
    const b = B();
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4"><div class="card divide-y divide-line">${b.services.map((s) => `<div class="p-3.5 flex items-center gap-3"><span class="menu-icon">${icon("design_services")}</span><div class="flex-1 min-w-0"><p class="t-title">${esc(s.name)}</p><p class="t-small text-ink-2">${ACStore.fmtFCFA(s.price)} · délai ${esc(s.duration)}</p></div><button type="button" onclick="ACState.business.services=ACState.business.services.filter(x=>x.id!=='${s.id}');ACStore.emit()" class="icon-btn w-9 h-9 !text-danger" aria-label="Supprimer">${icon("delete", "text-[18px]")}</button></div>`).join("") || `<p class="p-6 t-small text-ink-2 text-center">Aucun service.</p>`}</div>
      <div class="card p-5 space-y-3"><p class="t-caption text-ink-3">Ajouter un service</p>${UI.field("ns-name", "Intitulé", { placeholder: "Ex. Livraison express" })}<div class="grid grid-cols-2 gap-3">${UI.field("ns-price", "Prix (FCFA)", { type: "number", placeholder: "0" })}${UI.field("ns-dur", "Délai", { placeholder: "Ex. 48 h" })}</div>${UI.primaryButton("Ajouter", "Screens._bizAddService()", { icon: "add" })}</div></div>`;
    Shell.render(container, { title: "Services", subtitle: "Prestations proposées", back: true, body, nav: false, showNav: true });
  };
  Screens._bizAddService = () => { const name = document.getElementById("ns-name").value.trim(), price = parseInt(document.getElementById("ns-price").value, 10), duration = document.getElementById("ns-dur").value.trim() || "—"; if (!name || !price) { UI.toast("Intitulé et prix requis.", "error"); return; } B().services.push({ id: ACStore.uid("bs"), name, price, duration }); ACStore.emit(); UI.toast("Service ajouté.", "success"); };

  Screens.businessOrders = function (container, params) {
    const b = B(); const f = params.f || "Toutes";
    const items = b.orders.filter((o) => f === "Toutes" || o.status === f);
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4"><div class="hscroll">${["Toutes"].concat(STAGES).map((s) => UI.chip(s, `App.replace('businessOrders',{f:'${s}'})`, f === s)).join("")}</div>
      ${items.length ? `<div class="card divide-y divide-line">${items.map(orderRow).join("")}</div>` : UI.emptyState({ icon: "receipt_long", title: "Aucune commande", body: "Aucune commande dans cet état." })}</div>`;
    Shell.render(container, { title: "Commandes", subtitle: b.orders.length + " au total", back: true, body, nav: false, showNav: true });
  };
  Screens.businessOrderDetail = function (container, params) {
    const o = B().orders.find((x) => x.id === params.id);
    if (!o) { App.resetTo("businessOrders"); return; }
    const idx = STAGES.indexOf(o.status);
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="card p-5"><div class="flex items-center gap-3">${UI.avatar({ name: o.client }, "w-12 h-12")}<div class="flex-1"><p class="t-title">${esc(o.client)}</p><p class="t-small text-ink-2">${esc(o.at)}</p></div>${UI.badge(o.status, idx === 0 ? "gold" : idx === 3 ? "success" : "neutral")}</div><div class="divider my-4"></div>${UI.row("Article", esc(o.item))}${UI.row("Montant", ACStore.fmtFCFA(o.amount), true)}${UI.row("Paiement", "Youss Wallet · encaissé")}${UI.row("Livraison", "Livreur YOUSS CONNECT")}</div>
      <div class="card p-4">${UI.timeline(STAGES.map((s, i) => ({ label: s, icon: ["fiber_new", "autorenew", "local_shipping", "check_circle"][i] })), idx + (idx === 3 ? 1 : 0))}</div>
      <div class="grid grid-cols-2 gap-3">${UI.secondaryButton("Contacter le client", "UI.toast('Message envoyé au client.','success')", { icon: "chat" })}${idx < 3 ? UI.primaryButton("Passer à « " + STAGES[idx + 1] + " »", `Screens._advanceOrder('${o.id}')`, { icon: "arrow_forward" }) : UI.badge("Commande terminée", "success")}</div></div>`;
    Shell.render(container, { title: "Commande", subtitle: esc(o.item), back: true, body, nav: false, showNav: true });
  };
  Screens._advanceOrder = (id) => { const o = B().orders.find((x) => x.id === id); const i = STAGES.indexOf(o.status); o.status = STAGES[Math.min(3, i + 1)]; ACStore.emit(); UI.toast("Statut : " + o.status, "success"); };

  Screens.businessBookings = function (container) {
    const b = B();
    const body = `<div class="max-w-narrow mx-auto w-full space-y-3">${b.bookings.map((k) => `<div class="card p-4"><div class="flex items-center gap-3">${UI.avatar({ name: k.client }, "w-11 h-11")}<div class="flex-1 min-w-0"><p class="t-title">${esc(k.client)}</p><p class="t-small text-ink-2">${esc(k.service)} · ${esc(k.when)}</p></div>${UI.badge(k.status, k.status === "Confirmée" ? "success" : k.status === "Refusée" ? "danger" : "warn")}</div>${k.status === "En attente" ? `<div class="grid grid-cols-2 gap-2 mt-3">${UI.button("Refuser", `Screens._bizBooking('${k.id}','Refusée')`, { variant: "outline", size: "sm" })}${UI.button("Accepter", `Screens._bizBooking('${k.id}','Confirmée')`, { variant: "primary", size: "sm" })}</div>` : ""}</div>`).join("")}
      <div class="card p-4 flex items-center gap-3"><span class="menu-icon">${icon("calendar_month")}</span><div class="flex-1"><p class="t-title">Agenda synchronisé</p><p class="t-small text-ink-2">Vos réservations acceptées apparaissent dans votre agenda (démo).</p></div></div></div>`;
    Shell.render(container, { title: "Réservations", subtitle: b.bookings.filter((x) => x.status === "En attente").length + " en attente", back: true, body, nav: false, showNav: true });
  };
  Screens._bizBooking = (id, status) => { const k = B().bookings.find((x) => x.id === id); if (!k) return; k.status = status; ACStore.emit(); UI.toast("Réservation " + status.toLowerCase() + ".", status === "Confirmée" ? "success" : "info"); };

  Screens.businessStats = function (container, params) {
    const b = B(); const period = params.p || "7j";
    const week = b.stats.week, month = week.concat(week.map((v) => Math.round(v * 0.9)), week.map((v) => Math.round(v * 1.1)), week.map((v) => Math.round(v * 0.95))).slice(0, 28);
    const data = period === "7j" ? week : month;
    const total = data.reduce((s, v) => s + v, 0), avg = Math.round(total / data.length);
    const body = `<div class="space-y-5">
      <div class="hscroll">${[["7j", "7 jours"], ["30j", "30 jours"]].map((p) => UI.chip(p[1], `App.replace('businessStats',{p:'${p[0]}'})`, period === p[0])).join("")}</div>
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-3">${[["Chiffre d'affaires", ACStore.fmtFCFA(total)], ["Panier moyen", ACStore.fmtFCFA(Math.round(total / Math.max(1, b.orders.length * (period === "7j" ? 1 : 4))))], ["Ventes / jour", ACStore.fmtFCFA(avg)], ["Note moyenne", b.stats.rating + " / 5"]].map((k) => `<div class="kpi"><p class="t-caption text-ink-3">${k[0]}</p><p class="t-h2">${k[1]}</p></div>`).join("")}</section>
      <section class="card p-5"><p class="t-h3 mb-3">Ventes ${period === "7j" ? "de la semaine" : "du mois"}</p>${barChart(data, 48)}${period === "7j" ? `<div class="flex justify-between t-caption text-ink-3 mt-1">${DAYS.map((d) => `<span>${d}</span>`).join("")}</div>` : ""}</section>
      <div class="grid lg:grid-cols-2 gap-4">
        <section class="card p-5"><p class="t-h3 mb-3">Meilleures ventes</p><div class="space-y-2">${b.products.slice(0, 3).map((p, i) => `<div class="flex items-center gap-3"><span class="w-7 h-7 rounded-full bg-gold text-[#0A0A0A] flex items-center justify-center t-caption">${i + 1}</span><span class="flex-1 t-title truncate">${esc(p.name)}</span><span class="t-small text-ink-2">${12 - i * 3} ventes</span></div>`).join("")}</div></section>
        <section class="card p-5"><p class="t-h3 mb-3">Origine des clients</p><div class="space-y-2">${[["Youss Market", 58], ["Recherche Explorer", 24], ["Recommandations", 12], ["QR Pay en boutique", 6]].map((x) => `<div><div class="flex justify-between t-small mb-1"><span>${x[0]}</span><span class="font-semibold">${x[1]} %</span></div><div class="h-2 rounded-full bg-card-high overflow-hidden"><div class="h-full bg-gold" style="width:${x[1]}%"></div></div></div>`).join("")}</div></section>
      </div>
      ${UI.secondaryButton("Exporter le rapport (CSV)", "UI.toast('Export CSV envoyé par e-mail (démo).','success')", { icon: "download" })}</div>`;
    Shell.render(container, { title: "Statistiques", subtitle: esc(b.profile.name), back: true, body, nav: false, showNav: true });
  };
})();
