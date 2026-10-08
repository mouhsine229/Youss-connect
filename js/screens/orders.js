/* Commandes (restaurants & Youss Market) — confirmation et suivi en direct */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc, go } = UI;
  let timer = null, map = null;

  function findOrder(id) { return ACState.orders.find((o) => o.id === id) || ACState.orders[0]; }

  Screens.orderConfirmed = function (container, params) {
    const o = findOrder(params.id);
    if (!o) { App.resetTo("home"); return; }
    const isMarket = o.type === "market";
    const r = o.restaurantId ? YCData.restaurant(o.restaurantId) : null;
    const points = Math.round(o.total / 100);
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      ${UI.successHero({ icon: "check_circle", title: "Commande confirmée", body: (isMarket ? "Le vendeur prépare votre commande." : esc(o.title) + " prépare votre commande.") + " Numéro " + esc(o.number) + "." })}
      <div class="card p-5 space-y-3">
        <div class="flex items-center gap-3"><span class="w-14 h-14 rounded-xl overflow-hidden bg-card-high flex-shrink-0">${UI.img(o.img, o.title)}</span><div class="flex-1 min-w-0"><p class="t-title truncate">${esc(o.title)}</p><p class="t-small text-ink-2">${isMarket ? "Livraison " + esc(o.shipping || "standard") + " · " + esc(o.eta) : "Livraison estimée · " + esc(o.eta)}</p></div>${UI.badge("Payée", "success")}</div>
        <div class="divider"></div>
        ${o.items.map((i) => `<div class="flex justify-between t-small"><span>${i.qty} × ${esc(i.name)}</span><span>${ACStore.fmtFCFA(i.price * i.qty)}</span></div>`).join("")}
        <div class="divider"></div>${UI.row("Total payé", ACStore.fmtFCFA(o.total), true)}${UI.row("Adresse", esc(o.address))}${UI.row("Youss Bonus", "+" + points + " points")}
      </div>
      ${UI.primaryButton("Suivre ma commande", go("orderTracking", { id: o.id }), { size: "lg", icon: "near_me" })}
      ${UI.nextSteps(isMarket ? [
        { icon: "local_shipping", label: "Suivre la livraison", sub: "Préparation → expédition → livrée", onclick: go("orderTracking", { id: o.id }) },
        { icon: "workspace_premium", label: "+" + points + " points gagnés", sub: "Youss Bonus", onclick: "App.nav('rewards')" },
        { icon: "storefront", label: "Continuer mes achats", sub: "Youss Market", onclick: "App.nav('market')" }
      ] : [
        { icon: "directions_car", label: "Commander un transport", sub: r ? "Aller chez " + esc(r.name) : "Pour la soirée", onclick: r ? `Screens._transportPreset({toLatLng:{name:${UI.js(r.name)},lat:${r.lat},lng:${r.lng}}});App.nav('transport')` : "App.nav('transport')" },
        { icon: "confirmation_number", label: "Un événement ce soir ?", sub: "Événements à " + esc(ACState.user.city), onclick: "App.nav('events')" },
        { icon: "workspace_premium", label: "+" + points + " points gagnés", sub: "Youss Bonus", onclick: "App.nav('rewards')" }
      ])}
      ${UI.secondaryButton(I18N.t("home_btn"), "App.resetTo('home')")}
    </div>`;
    Shell.render(container, { title: "Commande confirmée", back: "App.nav('home')", body, nav: false, hideSearch: true });
  };

  Screens.orderTracking = function (container, params) {
    const o = findOrder(params.id);
    if (!o) { App.resetTo("activities"); return; }
    clearInterval(timer);
    const st = ACStore.orderStep(o);
    const courier = o.courier || YCData.courierFor(ACState.user.city);
    const body = `<div class="grid lg:grid-cols-[1fr_400px] gap-6">
      <div class="space-y-4">
        <div class="card overflow-hidden"><div id="ot-map" class="h-56 lg:h-80 bg-surface-low relative"><div id="ot-map-cover" class="absolute inset-0 flex flex-col items-center justify-center text-center bg-surface-low"><span class="w-14 h-14 rounded-full bg-card flex items-center justify-center text-gold mb-2">${icon(st.current.icon, "text-[28px]")}</span><p class="t-title" id="ot-cover-title">${st.current.label}</p><p class="t-small text-ink-2">La carte s'affiche dès le départ du livreur.</p></div></div>
          <div class="p-4">
            <div class="flex items-end justify-between gap-3"><div><p class="t-caption text-ink-3">Commande ${esc(o.number)}</p><p class="t-h2" id="ot-status">${st.current.label}</p></div><div class="text-right"><p class="t-small text-ink-2">Estimation</p><p class="t-title" id="ot-eta">${st.done ? "Livrée" : o.type === "market" ? esc(o.eta) : Math.max(2, Math.round((100 - st.progress) * 0.35)) + " min"}</p></div></div>
            <div class="h-1.5 rounded-full bg-card-high overflow-hidden mt-3"><div id="ot-bar" class="h-full bg-gold transition-[width] duration-500" style="width:${st.progress}%"></div></div>
          </div></div>
        <div class="card p-4" id="ot-timeline">${timelineHtml(o)}</div>
        <div id="ot-courier" class="card p-4 ${st.idx >= 2 ? "" : "hidden"}"><div class="flex items-center gap-3">${UI.avatar(courier, "w-12 h-12")}<div class="flex-1 min-w-0"><p class="t-title truncate">${esc(courier.name)} · ★ ${courier.rating}</p><p class="t-small text-ink-2">${courier.vehicle} · votre livreur</p></div><a href="tel:${esc(courier.phone)}" class="icon-btn" aria-label="Appeler">${icon("call")}</a><button type="button" onclick="UI.toast('Message envoyé au livreur.','success')" class="icon-btn" aria-label="Message">${icon("chat")}</button></div></div>
        <div id="ot-done" class="${st.done ? "" : "hidden"}">${doneHtml(o)}</div>
      </div>
      <aside class="space-y-4 lg:sticky lg:top-24 self-start">
        <div class="card p-5"><div class="flex items-center gap-3 mb-3"><span class="w-14 h-14 rounded-xl overflow-hidden bg-card-high">${UI.img(o.img, o.title)}</span><div class="min-w-0"><p class="t-title truncate">${esc(o.title)}</p><p class="t-small text-ink-2">${o.items.length} article${o.items.length > 1 ? "s" : ""} · ${esc(o.address)}</p></div></div>
          ${o.items.map((i) => `<div class="flex justify-between t-small py-1"><span>${i.qty} × ${esc(i.name)}</span><span>${ACStore.fmtFCFA(i.price * i.qty)}</span></div>`).join("")}<div class="divider my-2"></div>${UI.row("Total", ACStore.fmtFCFA(o.total), true)}${UI.row("Paiement", (ACState.paymentMethods.find((m) => m.type === o.method) || {}).label || "Youss Wallet")}</div>
        ${UI.secondaryButton("Besoin d'aide ?", "App.nav('help')", { icon: "support_agent" })}
        ${UI.secondaryButton(o.type === "market" ? "Continuer mes achats" : "Recommander", o.type === "market" ? "App.nav('market')" : go("restaurantDetail", { id: o.restaurantId || "rest1" }), { icon: "replay" })}
      </aside></div>`;
    Shell.render(container, { title: "Suivi de commande", subtitle: esc(o.title), back: "App.nav('activities')", body, nav: false, showNav: true, onMount: () => startWatch(o) });
  };
  function timelineHtml(o) {
    const st = ACStore.orderStep(o);
    const t = new Date(o.createdAt);
    const steps = st.steps.map((s, i) => Object.assign({}, s, { sub: i < st.idx || st.done ? new Date(o.createdAt + s.after * (o.durationSec || 120) * 10).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : i === st.idx ? "En cours…" : "" }));
    return UI.timeline(steps, st.done ? st.steps.length : st.idx, { doneAtActive: false });
  }
  function doneHtml(o) {
    const points = Math.round(o.total / 100);
    return `<div class="card-dark p-5 text-center"><div class="w-14 h-14 rounded-full bg-gold text-[#0A0A0A] flex items-center justify-center mx-auto animate-pop">${icon("check", "text-[30px]")}</div><p class="t-h2 mt-3">Commande livrée</p><p class="t-small text-white/70 mt-1">Bon appétit ! +${points} points Youss Bonus crédités.</p>
      <div class="flex justify-center gap-1 mt-4">${[1, 2, 3, 4, 5].map((i) => `<button type="button" onclick="Screens._rateOrder('${o.id}',${i})" class="p-1" aria-label="${i} étoiles">${icon("star", "text-[32px] " + ((o.rated || 0) >= i ? "text-gold" : "text-white/30"), (o.rated || 0) >= i)}</button>`).join("")}</div>
      <div class="grid sm:grid-cols-2 gap-2 mt-4">${UI.button("Recommander", o.type === "market" ? "App.nav('market')" : go("restaurantDetail", { id: o.restaurantId || "rest1" }), { variant: "primary", icon: "replay" })}${UI.button("Mes activités", "App.nav('activities')", { variant: "outline", cls: "!bg-white/10 !text-white !border-white/20" })}</div></div>`;
  }
  Screens._rateOrder = (id, v) => { const o = findOrder(id); if (!o) return; o.rated = v; ACStore.emit(); UI.toast("Merci pour votre note !", "success"); App.replace("orderTracking", { id }); };

  function startWatch(o) {
    let shownMap = false, lastIdx = -1;
    const tick = () => {
      if (!App.current || App.current.id !== "orderTracking") { clearInterval(timer); return; }
      const st = ACStore.orderStep(o);
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      set("ot-status", st.current.label); set("ot-cover-title", st.current.label);
      set("ot-eta", st.done ? "Livrée" : o.type === "market" ? o.eta : Math.max(2, Math.round((100 - st.progress) * 0.35)) + " min");
      const bar = document.getElementById("ot-bar"); if (bar) bar.style.width = st.progress + "%";
      if (st.idx !== lastIdx) {
        lastIdx = st.idx;
        const tl = document.getElementById("ot-timeline"); if (tl) tl.innerHTML = timelineHtml(o);
        const c = document.getElementById("ot-courier"); if (c && st.idx >= 2) c.classList.remove("hidden");
        if (st.idx >= 3 && !shownMap && o.from && o.to) { shownMap = true; showMap(o); }
        if (st.done) {
          clearInterval(timer);
          const d = document.getElementById("ot-done"); if (d) { d.classList.remove("hidden"); d.innerHTML = doneHtml(o); }
          const act = ACState.activities.find((a) => a.orderId === o.id); if (act && act.status !== "Livré") { act.status = "Livré"; ACStore.addNotification("Commande livrée", o.title + " · " + o.number + ". Bon appétit !", o.type === "market" ? "market" : "restaurant", "activities"); ACStore.emit(); }
        }
      }
    };
    tick(); timer = setInterval(tick, 1500);
  }
  function showMap(o) {
    const cover = document.getElementById("ot-map-cover"); if (cover) cover.remove();
    map = YCMap.create("ot-map", { interactive: true, zoomControl: false });
    if (!map) return;
    map.setPin("from", [o.from.lat, o.from.lng], o.title); map.setPin("to", [o.to.lat, o.to.lng], o.address);
    YCMap.fetchRoute(o.from, o.to).then((r) => {
      if (!map || !map.map) return;
      map.drawRoute(r.coords); map.fit(r.coords, { paddingTopLeft: [30, 30], paddingBottomRight: [30, 30] });
      const st = ACStore.orderStep(o);
      const remainingSec = Math.max(8, ((100 - st.progress) / 100) * (o.durationSec || 120) * 0.6);
      map.animate(r.coords, { visualSec: remainingSec, realSec: r.sec, kind: "courier", follow: false });
    });
  }
})();
