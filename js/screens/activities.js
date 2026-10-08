/* Activités — historique unifié de tous les services, filtrable, avec détail */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc, go } = UI;

  const FILTERS = [["all", "Tous", "apps"], ["transport", "Courses", "directions_car"], ["restaurant", "Commandes", "restaurant"], ["livraison", "Livraisons", "local_shipping"], ["market", "Achats", "storefront"], ["evenement", "Billets", "confirmation_number"], ["reservation", "Réservations", "event_seat"], ["wallet", "Transactions", "account_balance_wallet"]];
  const LABEL = { transport: "Course", restaurant: "Commande", livraison: "Livraison", market: "Achat", evenement: "Billet", reservation: "Réservation", wallet: "Transaction", culture: "Culture", rewards: "Bonus" };

  function groupLabel(at) {
    const d = new Date(at || Date.now()), now = new Date();
    const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((day(now) - day(d)) / 86400000);
    return diff <= 0 ? "Aujourd'hui" : diff === 1 ? "Hier" : diff < 7 ? "Cette semaine" : "Plus tôt";
  }
  function row(a) {
    const live = a.status === "En cours" || a.status === "En attente";
    return `<button type="button" onclick="${go("activityDetail", { id: a.id })}" class="w-full flex items-center justify-between gap-3 p-3.5 text-left hover:bg-surface-low transition-colors">
      <span class="flex items-center gap-3 min-w-0"><span class="w-11 h-11 rounded-full ${live ? "bg-gold text-[#0A0A0A]" : "bg-surface-low text-ink"} flex items-center justify-center flex-shrink-0 ${live ? "animate-pulse-ring" : ""}">${icon(a.icon || ACStore.iconForService(a.service), "text-[22px]")}</span>
        <span class="min-w-0"><span class="block t-title truncate">${esc(a.title)}</span><span class="block t-small text-ink-2 truncate">${LABEL[a.service] || a.service} · ${esc(a.subtitle || "")}</span></span></span>
      <span class="text-right flex-shrink-0">${a.amount != null ? `<span class="block t-title font-extrabold">${ACStore.fmtFCFA(a.amount)}</span>` : ""}${UI.badge(a.status || "—", live ? "gold" : a.status === "Annulé" ? "danger" : "success")}</span></button>`;
  }

  Screens.activities = function (container, params) {
    const f = (params && params.f) || "all";
    const list = ACState.activities.filter((a) => f === "all" || a.service === f);
    const groups = {}; list.forEach((a) => { const g = groupLabel(a.at); (groups[g] = groups[g] || []).push(a); });
    const order = ["Aujourd'hui", "Hier", "Cette semaine", "Plus tôt"];
    const live = ACState.activities.filter((a) => a.status === "En cours");
    const body = `
      <div class="hscroll">${FILTERS.map((x) => UI.chip(x[1], `App.replace('activities',{f:'${x[0]}'})`, f === x[0], { icon: x[2] })).join("")}</div>
      ${live.length && f === "all" ? `<section>${UI.sectionTitle("En cours", null, null, live.length + " activité" + (live.length > 1 ? "s" : "") + " en direct")}<div class="grid sm:grid-cols-2 gap-3">${live.map((a) => `<button type="button" onclick="${a.orderId ? go("orderTracking", { id: a.orderId }) : go("activityDetail", { id: a.id })}" class="card-dark p-4 flex items-center gap-3 text-left"><span class="w-11 h-11 rounded-full bg-gold text-[#0A0A0A] flex items-center justify-center animate-pulse-ring">${icon(a.icon, "text-[22px]")}</span><span class="min-w-0 flex-1"><span class="block t-caption text-gold">${LABEL[a.service]} en cours</span><span class="block t-title truncate">${esc(a.title)}</span></span>${icon("chevron_right", "text-white/60")}</button>`).join("")}</div></section>` : ""}
      ${list.length ? order.filter((g) => groups[g]).map((g) => `<section>${UI.sectionTitle(g, null, null, groups[g].length + " élément" + (groups[g].length > 1 ? "s" : ""))}<div class="card divide-y divide-line">${groups[g].map(row).join("")}</div></section>`).join("")
        : UI.emptyState({ icon: "history", title: "Aucune activité", body: f === "all" ? "Toutes vos courses, commandes, livraisons, billets et paiements apparaîtront ici automatiquement." : "Aucune activité dans cette catégorie pour le moment.", actionLabel: "Explorer les services", actionOnclick: "App.nav('explorer')" })}`;
    Shell.render(container, { title: "Mes activités", subtitle: "Historique unifié de tous vos services", body, nav: "activities" });
  };

  Screens.activityDetail = function (container, params) {
    const a = ACState.activities.find((x) => x.id === params.id);
    if (!a) { Shell.render(container, { title: "Activité", back: true, body: UI.emptyState({ icon: "search_off", title: "Activité introuvable", body: "Cette activité n'existe plus.", actionLabel: "Mes activités", actionOnclick: "App.resetTo('activities')" }), nav: false, showNav: true }); return; }
    const d = a.detail || {};
    const tx = ACState.wallet.transactions.find((t) => t.label === a.title);
    const live = a.status === "En cours" || a.status === "En attente";
    const details = Object.keys(d).filter((k) => k !== "items").map((k) => UI.row({ from: "Départ", to: "Arrivée", km: "Distance", driver: "Chauffeur", rating: "Votre note", vehicle: "Véhicule", duration: "Durée", address: "Adresse", seller: "Vendeur", ticket: "Billet", place: "Lieu", date: "Date", when: "Quand", restaurant: "Restaurant", recipient: "Destinataire", shipping: "Livraison" }[k] || k, k === "km" ? d[k] + " km" : k === "rating" ? "★ ".repeat(d[k]) : k === "duration" ? d[k] + " min" : k === "date" ? YCData.fmtDate(d[k]) : esc(String(d[k])))).join("");
    const actions = {
      transport: [["replay", "Recommander ce trajet", `Screens._transportPreset({from:${UI.js(d.from || "")},to:${UI.js(d.to || "")}});App.nav('transport')`], ["flag", "Signaler un problème", "App.nav('report')"]],
      restaurant: [["replay", "Recommander", "App.nav('restaurants')"], ["flag", "Signaler un problème", "App.nav('report')"]],
      market: [["replay", "Racheter", "App.nav('market')"], ["flag", "Signaler un problème", "App.nav('report')"]],
      livraison: [["replay", "Nouvelle livraison", "App.nav('delivery')"], ["flag", "Signaler un problème", "App.nav('report')"]],
      evenement: [["qr_code_2", "Voir mes billets", "App.nav('myTickets')"], ["directions_car", "Transport vers le lieu", "App.nav('transport')"]],
      reservation: [["call", "Contacter l'établissement", "UI.toast('Appel (démo).','info')"], ["cancel", "Annuler la réservation", `Screens._cancelActivity('${a.id}')`]],
      wallet: [["account_balance_wallet", "Voir le Wallet", "App.nav('wallet')"], ["flag", "Signaler", "App.nav('report')"]]
    }[a.service] || [["home", "Accueil", "App.resetTo('home')"]];
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="card p-6 text-center"><span class="w-16 h-16 rounded-full ${live ? "bg-gold text-[#0A0A0A]" : "bg-surface-low text-ink"} flex items-center justify-center mx-auto">${icon(a.icon || ACStore.iconForService(a.service), "text-[30px]")}</span><h2 class="t-h2 mt-3">${esc(a.title)}</h2><p class="t-small text-ink-2">${LABEL[a.service] || a.service} · ${esc(a.subtitle || "")}</p>${a.amount != null ? `<p class="t-display mt-2">${ACStore.fmtFCFA(a.amount)}</p>` : ""}<div class="mt-2">${UI.badge(a.status, live ? "gold" : "success")}</div></div>
      ${a.orderId ? UI.primaryButton("Suivre la commande en direct", go("orderTracking", { id: a.orderId }), { icon: "near_me" }) : ""}
      ${d.items ? `<div class="card p-4"><p class="t-caption text-ink-3 mb-2">Articles</p>${d.items.map((i) => `<p class="t-body py-1 border-b border-line last:border-0">${esc(i)}</p>`).join("")}</div>` : ""}
      <div class="card p-4">${details}${UI.row("Référence", esc(tx ? tx.ref : a.id.toUpperCase()))}${UI.row("Paiement", a.method === "cash" ? "Espèces" : a.method === "mobile" ? "Paiement mobile" : a.amount != null ? "Youss Wallet" : "—")}</div>
      ${a.service === "transport" && d.from && d.to ? `<div class="card overflow-hidden"><div id="act-map" class="h-44 bg-surface-low"></div></div>` : ""}
      <div class="grid grid-cols-2 gap-3">${actions.map((x) => UI.button(x[1], x[2], { variant: x[0] === "cancel" ? "outline" : x[0] === "replay" || x[0] === "qr_code_2" ? "primary" : "outline", icon: x[0] })).join("")}</div>
      ${a.amount != null ? UI.secondaryButton("Télécharger le reçu", "UI.toast('Reçu envoyé par e-mail (démo).','success')", { icon: "receipt_long" }) : ""}</div>`;
    Shell.render(container, { title: "Détail de l'activité", back: true, body, nav: false, showNav: true, onMount: () => {
      if (a.service === "transport" && d.from && d.to && document.getElementById("act-map")) {
        const c = YCData.cityOf(ACState.user.city);
        const find = (n) => c.poi.find((p) => YCData.norm(p.name).includes(YCData.norm(String(n).split("·")[0]).trim())) || null;
        const f = find(d.from) || c.poi[0], t = find(d.to) || c.poi[1];
        const m = YCMap.create("act-map", { interactive: false, zoomControl: false }); if (!m) return;
        m.setPin("from", [f.lat, f.lng]); m.setPin("to", [t.lat, t.lng]); YCMap.fetchRoute(f, t).then((r) => { if (m.map) { m.drawRoute(r.coords); m.fit(r.coords, { paddingTopLeft: [24, 24], paddingBottomRight: [24, 24] }); } });
      }
    } });
  };
  Screens._cancelActivity = (id) => UI.confirm({ title: "Annuler la réservation ?", body: "L'établissement sera prévenu immédiatement.", okLabel: "Annuler la réservation", danger: true, icon: "event_busy", onOk: `(function(){var a=ACState.activities.find(function(x){return x.id==='${id}'});if(a){a.status='Annulé';ACStore.emit();UI.toast('Réservation annulée.','info');}})()` });
})();
