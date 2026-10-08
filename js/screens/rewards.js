/* Youss Bonus — points, niveaux, catalogue de récompenses, mes récompenses */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc, go } = UI;

  Screens.rewards = function (container) {
    const r = ACState.rewards, pts = r.points;
    const tier = YCData.tierFor(pts), next = YCData.nextTier(pts);
    const progress = next ? Math.round(((pts - tier.min) / (next.min - tier.min)) * 100) : 100;
    const body = `
      <div class="grid lg:grid-cols-[400px_1fr] gap-6 lg:gap-8 items-start">
        <div class="space-y-4 lg:sticky lg:top-24">
          <section class="card-dark p-6 relative overflow-hidden"><span class="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-gold/25 blur-3xl"></span>
            <div class="flex items-center justify-between"><span class="t-caption text-gold">Mes points</span><span class="badge badge-gold">${icon("workspace_premium", "text-[14px]", true)}Niveau ${tier.id}</span></div>
            <p class="t-display mt-2">${pts.toLocaleString("fr-FR")} <span class="t-h3 text-white/60">pts</span></p>
            <div class="mt-4 flex justify-between t-small text-white/80"><span>${tier.id}</span><span>${next ? next.id : "Niveau max"}</span></div>
            <div class="h-2 rounded-full bg-white/15 overflow-hidden mt-1"><div class="h-full bg-gold" style="width:${progress}%"></div></div>
            <p class="t-small text-white/60 mt-2">${next ? (next.min - pts).toLocaleString("fr-FR") + " points avant le niveau " + next.id : "Vous avez atteint le niveau maximum."}</p>
            <div class="grid grid-cols-4 gap-1.5 mt-4">${YCData.TIERS.map((t) => `<div class="rounded-lg p-2 text-center ${t.id === tier.id ? "bg-gold text-[#0A0A0A]" : "bg-white/10"}"><p class="t-caption">${t.id}</p><p class="t-caption opacity-70">${t.min.toLocaleString("fr-FR")}</p></div>`).join("")}</div>
          </section>
          <section class="card p-4"><p class="t-caption text-ink-3 mb-2">Comment gagner des points</p><div class="grid grid-cols-2 gap-2">${[["directions_car", "Course", "+25 pts"], ["restaurant", "Commande", "+1 pt / 100 F"], ["storefront", "Achat Market", "+1 pt / 100 F"], ["confirmation_number", "Billet", "+1 pt / 100 F"], ["local_shipping", "Livraison", "+15 pts"], ["qr_code_scanner", "QR Pay", "+1 pt / 500 F"]].map((x) => `<div class="flex items-center gap-2 rounded-xl bg-surface-low p-2.5"><span class="text-gold">${icon(x[0], "text-[20px]")}</span><span class="min-w-0"><span class="block t-small font-semibold">${x[1]}</span><span class="block t-caption text-ink-3">${x[2]}</span></span></div>`).join("")}</div></section>
          ${UI.secondaryButton("Mes récompenses (" + r.redeemed.length + ")", "App.nav('myRewards')", { icon: "redeem" })}
        </div>
        <div class="space-y-6">
          <section>${UI.sectionTitle("Récompenses disponibles", null, null, "Échangez vos points dans tous les services")}
            <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">${YCData.REWARDS.map((c) => { const ok = pts >= c.cost; return `<button type="button" onclick="${go("rewardRedeem", { id: c.id })}" class="card card-press p-4 text-left flex flex-col ${ok ? "" : "opacity-80"}">
              <div class="flex items-start justify-between"><span class="w-12 h-12 rounded-2xl ${ok ? "bg-gold text-[#0A0A0A]" : "bg-surface-low text-ink-3"} flex items-center justify-center">${icon(c.icon, "text-[24px]")}</span><span class="t-h3">${c.cost} <span class="t-small text-ink-3 font-normal">pts</span></span></div>
              <h3 class="t-title mt-3">${c.label}</h3><p class="t-small text-ink-2 mt-0.5 flex-1">${c.sub}</p>
              <p class="t-small font-bold mt-3 ${ok ? "text-success" : "text-ink-3"}">${ok ? icon("check_circle", "text-[15px]", true) + " Récompense disponible" : "Il manque " + (c.cost - pts) + " pts"}</p></button>`; }).join("")}</div></section>
          <section>${UI.sectionTitle("Historique des points")}<div class="card divide-y divide-line">${r.history.slice(0, 10).map((h) => `<div class="flex items-center justify-between p-3.5"><div><p class="t-title">${esc(h.label)}</p><p class="t-small text-ink-2">${esc(h.date)}</p></div><span class="t-title font-extrabold ${h.points >= 0 ? "text-success" : "text-ink"}">${h.points >= 0 ? "+" : ""}${h.points} pts</span></div>`).join("")}</div></section>
        </div>
      </div>`;
    Shell.render(container, { title: "Youss Bonus", subtitle: "Programme de fidélité de l'écosystème", back: "App.nav('home')", body, nav: false, showNav: true });
  };

  Screens.rewardRedeem = function (container, params) {
    const c = YCData.REWARDS.find((x) => x.id === params.id); if (!c) { App.resetTo("rewards"); return; }
    const can = ACState.rewards.points >= c.cost;
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="card p-6 text-center"><span class="w-20 h-20 rounded-3xl bg-gold text-[#0A0A0A] flex items-center justify-center mx-auto">${icon(c.icon, "text-[40px]")}</span><h2 class="t-h1 mt-4">${c.label}</h2><p class="t-body text-ink-2 mt-1">${c.sub}</p>
        <div class="grid grid-cols-2 gap-3 mt-5"><div class="rounded-xl bg-surface-low p-3"><p class="t-caption text-ink-3">Coût</p><p class="t-h3">${c.cost} pts</p></div><div class="rounded-xl bg-surface-low p-3"><p class="t-caption text-ink-3">Votre solde</p><p class="t-h3">${ACState.rewards.points.toLocaleString("fr-FR")} pts</p></div></div>
        ${!can ? `<p class="t-small text-danger font-semibold mt-3">Il vous manque ${c.cost - ACState.rewards.points} points.</p>` : `<p class="t-small text-ink-2 mt-3">Après l'échange, il vous restera ${(ACState.rewards.points - c.cost).toLocaleString("fr-FR")} points.</p>`}</div>
      <div class="card p-4 t-small text-ink-2 space-y-1"><p class="t-caption text-ink-3 mb-1">Conditions</p><p>Valable 30 jours après l'échange. Un code sera généré dans « Mes récompenses » et appliqué automatiquement au prochain paiement du service concerné.</p></div>
      ${UI.primaryButton("Confirmer l'échange", `Screens._doRedeem('${c.id}')`, { size: "lg", icon: "redeem", disabled: !can })}
      ${!can ? UI.secondaryButton("Gagner des points : commander", "App.nav('restaurants')") : ""}</div>`;
    Shell.render(container, { title: "Échanger une récompense", back: true, body, nav: false, showNav: true });
  };
  Screens._doRedeem = function (id) {
    const c = YCData.REWARDS.find((x) => x.id === id); if (!c || ACState.rewards.points < c.cost) return;
    ACState.rewards.points -= c.cost;
    const code = "YB-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    ACState.rewards.history.unshift({ id: ACStore.uid("rwd"), label: "Échange : " + c.label, points: -c.cost, date: "Aujourd'hui" });
    ACState.rewards.redeemed.unshift({ id: ACStore.uid("red"), rewardId: c.id, label: c.label, code, at: Date.now(), expires: Date.now() + 30 * 86400000, used: false });
    ACStore.addNotification("Récompense débloquée", c.label + " · code " + code + " disponible dans Mes récompenses.", "rewards", "myRewards");
    ACStore.emit(); UI.toast("Récompense débloquée · " + code, "success");
    App.resetTo("myRewards");
  };

  Screens.myRewards = function (container) {
    const list = ACState.rewards.redeemed;
    const body = list.length ? `<div class="grid md:grid-cols-2 gap-3">${list.map((r) => { const c = YCData.REWARDS.find((x) => x.id === r.rewardId) || {}; return `<div class="card p-4 ${r.used ? "opacity-60" : ""}"><div class="flex items-start gap-3"><span class="w-12 h-12 rounded-2xl bg-gold text-[#0A0A0A] flex items-center justify-center flex-shrink-0">${icon(c.icon || "redeem", "text-[24px]")}</span><div class="flex-1 min-w-0"><p class="t-title">${esc(r.label)}</p><p class="t-small text-ink-2">${r.used ? "Utilisée" : "Expire le " + new Date(r.expires).toLocaleDateString("fr-FR")}</p></div>${UI.badge(r.used ? "Utilisée" : "Active", r.used ? "neutral" : "success")}</div>
      <div class="mt-3 flex items-center justify-between rounded-xl bg-surface-low p-3"><span class="t-title tracking-[0.2em]">${r.code}</span><button type="button" onclick="navigator.clipboard&&navigator.clipboard.writeText('${r.code}');UI.toast('Code copié.','success')" class="t-small font-bold text-gold-deep dark:text-gold">Copier</button></div>
      ${!r.used ? `<button type="button" onclick="Screens._useReward('${r.id}')" class="btn btn-sm btn-dark mt-3">Utiliser maintenant</button>` : ""}</div>`; }).join("")}</div>`
      : UI.emptyState({ icon: "redeem", title: "Aucune récompense échangée", body: "Échangez vos points Youss Bonus contre des courses, des réductions et des expériences.", actionLabel: "Voir le catalogue", actionOnclick: "App.resetTo('rewards')" });
    Shell.render(container, { title: "Mes récompenses", subtitle: ACState.rewards.points.toLocaleString("fr-FR") + " points disponibles", back: true, body, nav: false, showNav: true });
  };
  Screens._useReward = (id) => { const r = ACState.rewards.redeemed.find((x) => x.id === id); if (!r) return; const c = YCData.REWARDS.find((x) => x.id === r.rewardId); r.used = true; ACStore.emit(); UI.toast("Récompense appliquée à votre prochain paiement " + (c ? c.service : "") + ".", "success"); const routes = { transport: "transport", market: "market", restaurant: "restaurants", evenement: "events", livraison: "delivery", culture: "culture" }; App.nav(routes[c && c.service] || "home"); };
})();
