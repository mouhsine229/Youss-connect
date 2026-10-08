/* Centre de notifications — lu / non lu, filtres, préférences */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc } = UI;

  const ROUTE = { wallet: "wallet", rewards: "rewards", transport: "activities", livraison: "activities", restaurant: "activities", market: "activities", evenement: "myTickets", culture: "culture", business: "business", promo: "market" };
  function groupLabel(n) {
    if (n.at) { const diff = (Date.now() - n.at) / 3600000; return diff < 24 ? "Aujourd'hui" : diff < 48 ? "Hier" : "Plus tôt"; }
    return /instant|min|Aujourd/.test(n.date) ? "Aujourd'hui" : /Hier/.test(n.date) ? "Hier" : "Plus tôt";
  }

  Screens.notifications = function (container, params) {
    const f = (params && params.f) || "all";
    const list = ACState.notifications.filter((n) => f === "all" || !n.read);
    const groups = {}; list.forEach((n) => { const g = groupLabel(n); (groups[g] = groups[g] || []).push(n); });
    const unread = ACStore.unread();
    const body = `
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div class="hscroll !mx-0 !px-0">${UI.chip("Toutes", "App.replace('notifications',{f:'all'})", f === "all")}${UI.chip("Non lues" + (unread ? " (" + unread + ")" : ""), "App.replace('notifications',{f:'unread'})", f === "unread")}</div>
        <div class="flex gap-2">${unread ? `<button type="button" onclick="Screens._markAllRead()" class="btn btn-sm btn-outline">${icon("done_all", "text-[18px]")}Tout marquer lu</button>` : ""}<button type="button" onclick="App.nav('notificationPrefs')" class="btn btn-sm btn-outline">${icon("tune", "text-[18px]")}Préférences</button></div>
      </div>
      ${list.length ? ["Aujourd'hui", "Hier", "Plus tôt"].filter((g) => groups[g]).map((g) => `<section><p class="t-caption text-ink-3 mb-2">${g}</p><div class="card divide-y divide-line">${groups[g].map((n) => `
        <div class="flex items-start gap-3 p-4 ${n.read ? "" : "bg-gold/[.06]"}">
          <button type="button" onclick="Screens._openNotif('${n.id}')" class="flex items-start gap-3 flex-1 min-w-0 text-left">
            <span class="w-11 h-11 rounded-full ${n.read ? "bg-surface-low text-ink" : "bg-gold text-[#0A0A0A]"} flex items-center justify-center flex-shrink-0">${icon(ACStore.iconForService(n.service), "text-[22px]")}</span>
            <span class="min-w-0"><span class="flex items-center gap-2"><span class="t-title ${n.read ? "" : "font-extrabold"} truncate">${esc(n.title)}</span>${n.read ? "" : `<span class="w-2 h-2 rounded-full bg-gold flex-shrink-0"></span>`}</span><span class="block t-small text-ink-2 mt-0.5">${esc(n.body)}</span><span class="block t-caption text-ink-3 mt-1.5">${esc(n.date)}</span></span></button>
          <button type="button" onclick="Screens._deleteNotif('${n.id}')" class="icon-btn w-8 h-8 border-0 shadow-none flex-shrink-0" aria-label="Supprimer">${icon("close", "text-[18px]")}</button>
        </div>`).join("")}</div></section>`).join("")
        : UI.emptyState({ icon: "notifications_off", title: f === "unread" ? "Tout est lu" : "Aucune notification", body: f === "unread" ? "Vous êtes à jour." : "Vos prochaines notifications (courses, commandes, billets, paiements, points) apparaîtront ici.", actionLabel: f === "unread" ? "Voir toutes" : null, actionOnclick: "App.replace('notifications',{f:'all'})" })}`;
    Shell.render(container, { title: I18N.t("notifications"), subtitle: unread ? unread + " non lue" + (unread > 1 ? "s" : "") : "Vous êtes à jour", back: true, body, nav: false, showNav: true, narrow: true });
  };
  Screens._markAllRead = () => { ACState.notifications.forEach((n) => { n.read = true; }); ACStore.emit(); };
  Screens._deleteNotif = (id) => { ACState.notifications = ACState.notifications.filter((n) => n.id !== id); ACStore.emit(); };
  Screens._openNotif = function (id) {
    const n = ACState.notifications.find((x) => x.id === id); if (!n) return;
    n.read = true; ACStore.emit();
    if (n.route) { const [screen, q] = n.route.split("?"); const params = {}; new URLSearchParams(q || "").forEach((v, k) => { params[k] = v; }); if (Screens[screen]) { App.nav(screen, params); return; } }
    App.nav(ROUTE[n.service] || "home");
  };

  Screens.notificationPrefs = function (container) {
    const p = ACState.prefs.notif;
    const items = [["transport", "directions_car", "Courses", "Chauffeur trouvé, arrivée, fin de course"], ["orders", "restaurant", "Commandes", "Restaurants et Youss Market"], ["delivery", "local_shipping", "Livraisons", "Livreur, récupération, remise"], ["events", "confirmation_number", "Événements", "Billets et rappels la veille"], ["wallet", "account_balance_wallet", "Youss Wallet", "Paiements, recharges, retraits"], ["rewards", "workspace_premium", "Youss Bonus", "Points gagnés, nouveaux niveaux"], ["promos", "sell", "Offres et promotions", "Bons plans des commerçants"]];
    const body = `<div class="card divide-y divide-line">${items.map((it) => `<div class="flex items-center gap-3 p-4"><span class="menu-icon">${icon(it[1])}</span><div class="flex-1 min-w-0"><p class="t-title">${it[2]}</p><p class="t-small text-ink-2">${it[3]}</p></div>${UI.toggle(p[it[0]] !== false, `Screens._togglePref('${it[0]}')`, it[2])}</div>`).join("")}</div>
      <div class="card p-4 flex items-center gap-3 mt-4"><span class="menu-icon">${icon("do_not_disturb_on")}</span><div class="flex-1"><p class="t-title">Ne pas déranger</p><p class="t-small text-ink-2">22h00 – 07h00 · les alertes de sécurité restent actives</p></div>${UI.toggle(false, "this.classList.toggle('on');UI.toast('Préférence enregistrée.','success')", "Ne pas déranger")}</div>`;
    Shell.render(container, { title: "Préférences de notifications", back: true, body, nav: false, showNav: true, narrow: true });
  };
  Screens._togglePref = (k) => { ACState.prefs.notif[k] = ACState.prefs.notif[k] === false; ACStore.emit(); };
})();
