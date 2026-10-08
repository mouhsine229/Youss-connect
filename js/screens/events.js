/* Événements — liste, fiche, billetterie, billets numériques avec QR Code */
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc, go } = UI;

  const f = { cat: "Tous", city: "Toutes", q: "" };
  const sel = { ticket: null, qty: 1, holder: "", method: null };
  const CATS = ["Tous"].concat(YCData.EVENT_CATS);

  function list() {
    const q = YCData.norm(f.q);
    return YCData.EVENTS.filter((e) => (f.cat === "Tous" || e.cat === f.cat) && (f.city === "Toutes" || e.city === f.city || e.country === (YCData.CITIES[f.city] || {}).country) && (!q || YCData.norm(e.name + " " + e.place + " " + e.city + " " + e.cat).includes(q)))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  Screens.events = function (container, params) {
    if (params && params.cat) f.cat = params.cat;
    const items = list();
    const featured = items[0];
    const body = `
      ${featured && f.cat === "Tous" && !f.q ? `<button type="button" onclick="${go("eventDetail", { id: featured.id })}" class="relative w-full rounded-3xl overflow-hidden h-60 lg:h-[380px] text-left card-press group">${UI.img(featured.img, featured.name, "img-cover transition-transform duration-700 group-hover:scale-105", { eager: true })}<div class="absolute inset-0 gradient-up"></div>
        <div class="absolute bottom-5 left-5 right-5 lg:bottom-8 lg:left-8 text-white max-w-[640px]"><span class="badge badge-gold mb-2">À la une · ${featured.cat}</span><h2 class="t-h1 lg:t-display">${featured.name}</h2><p class="t-body text-white/80 mt-1.5 flex flex-wrap gap-x-3">${icon("calendar_today", "text-[16px]")} ${YCData.fmtDate(featured.date)} · ${featured.time}<span>${icon("location_on", "text-[16px]")} ${featured.place}</span></p><p class="t-title mt-2">dès ${ACStore.fmtFCFA(YCData.minPrice(featured))}</p></div></button>` : ""}
      <div class="flex flex-col lg:flex-row gap-3">
        <label class="relative flex-1">${icon("search", "absolute left-4 top-1/2 -translate-y-1/2 text-ink-3 text-[22px] pointer-events-none")}<input id="ev-q" type="search" value="${esc(f.q)}" placeholder="Rechercher un événement, un lieu…" oninput="Screens._evType(this.value)" class="input input-lg pl-12"/></label>
        <select class="select lg:w-56" onchange="Screens._evCity(this.value)" aria-label="Ville">${["Toutes"].concat(YCData.DESTINATIONS).map((c) => `<option ${f.city === c ? "selected" : ""}>${c}</option>`).join("")}</select>
      </div>
      <div class="hscroll">${CATS.map((c) => UI.chip(c, `Screens._evCat('${c}')`, f.cat === c)).join("")}</div>
      <div id="ev-list"></div>`;
    Shell.render(container, { title: "Événements", subtitle: "Concerts, festivals, conférences, spectacles, sport", back: "App.nav('home')", body, nav: false, showNav: true, right: `<button type="button" onclick="App.nav('myTickets')" class="btn btn-sm btn-outline">${icon("qr_code_2", "text-[18px]")}<span class="hidden sm:inline">Mes billets</span>${ACState.tickets.length ? `<span class="badge badge-gold">${ACState.tickets.length}</span>` : ""}</button>` });
    renderList();
  };
  function renderList() {
    const el = document.getElementById("ev-list"); if (!el) return;
    if (!sessionStorage.getItem("yc-seen-ev")) { sessionStorage.setItem("yc-seen-ev", "1"); el.innerHTML = UI.skeletonList(6, "grid"); setTimeout(renderList, 450); return; }
    const items = list();
    el.innerHTML = items.length ? `<p class="t-small text-ink-2 mb-3">${items.length} événement${items.length > 1 ? "s" : ""}</p><div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">${items.map((e) => UI.eventCard(e)).join("")}</div>` : UI.emptyState({ icon: "confirmation_number", title: I18N.t("empty_results"), body: "Aucun événement dans cette catégorie pour le moment.", actionLabel: "Tout afficher", actionOnclick: "Screens._evReset()" });
  }
  Screens._evType = (v) => { f.q = v; renderList(); };
  Screens._evCat = (c) => { f.cat = c; App.replace("events"); };
  Screens._evCity = (c) => { f.city = c; App.replace("events"); };
  Screens._evReset = () => { f.cat = "Tous"; f.city = "Toutes"; f.q = ""; App.replace("events"); };

  /* ---------- Fiche ---------- */
  Screens.eventDetail = function (container, params) {
    const e = YCData.event(params.id) || YCData.EVENTS[0];
    if (!sel.ticket || !e.tickets.find((t) => t.id === sel.ticket)) { sel.ticket = e.tickets[0].id; sel.qty = 1; }
    const t = e.tickets.find((x) => x.id === sel.ticket);
    const total = t.price * sel.qty;
    const nearbyRest = YCData.nearby(e.lat, e.lng, YCData.restaurantsIn(e.city === "Ouidah" ? "Cotonou" : e.city), 2);
    const ticketPanel = `<div class="card p-5 space-y-4">
        <p class="t-h3">Billets</p>
        <div class="space-y-2">${e.tickets.map((tk) => `<button type="button" onclick="Screens._pickTicket('${tk.id}','${e.id}')" class="w-full flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left ${sel.ticket === tk.id ? "border-gold bg-gold/10" : "border-line"}"><span><span class="block t-title">${tk.label}</span><span class="block t-small ${tk.left < 30 ? "text-warn font-semibold" : "text-ink-2"}">${tk.left < 30 ? "Plus que " + tk.left + " places" : tk.left + " places"}</span></span><span class="t-title font-extrabold">${ACStore.fmtFCFA(tk.price)}</span></button>`).join("")}</div>
        <div class="flex items-center justify-between"><span class="t-title">Quantité</span>${UI.qtyControl(sel.qty, `Screens._ticketQty(-1,'${e.id}')`, `Screens._ticketQty(1,'${e.id}')`)}</div>
        <div class="divider"></div>
        <div class="flex items-center justify-between"><span class="t-body text-ink-2">Total</span><span class="t-h2">${ACStore.fmtFCFA(total)}</span></div>
        ${UI.primaryButton("Acheter un billet", go("eventCheckout", { id: e.id }), { size: "lg", iconRight: "arrow_forward" })}
        <p class="t-small text-ink-3 text-center">Billet nominatif avec QR Code · remboursable jusqu'à 48 h avant.</p>
      </div>`;
    const body = `
      <section class="relative rounded-3xl overflow-hidden h-64 lg:h-[420px] bg-card-high">${UI.img(e.img, e.name, "img-cover", { eager: true })}<div class="absolute inset-0 gradient-up"></div>
        <div class="absolute bottom-5 left-5 right-5 lg:bottom-8 lg:left-8 text-white"><span class="badge bg-white/95 text-ink mb-2">${e.cat}</span><h2 class="t-h1 lg:t-display max-w-[760px]">${e.name}</h2></div>
        <button type="button" onclick="Screens._shareEvent('${e.id}')" class="absolute top-4 right-4 icon-btn" aria-label="Partager">${icon("share")}</button>
      </section>
      <div class="grid lg:grid-cols-[1fr_400px] gap-6 items-start">
        <div class="space-y-5 min-w-0">
          <div class="grid sm:grid-cols-3 gap-3">
            <div class="card p-4 flex gap-3"><span class="menu-icon">${icon("calendar_today")}</span><div><p class="t-caption text-ink-3">Date</p><p class="t-title">${YCData.fmtDate(e.date)}</p></div></div>
            <div class="card p-4 flex gap-3"><span class="menu-icon">${icon("schedule")}</span><div><p class="t-caption text-ink-3">Heure</p><p class="t-title">${e.time}</p></div></div>
            <div class="card p-4 flex gap-3"><span class="menu-icon">${icon("location_on")}</span><div class="min-w-0"><p class="t-caption text-ink-3">Lieu</p><p class="t-title truncate">${e.place}</p><p class="t-small text-ink-2">${e.city}, ${e.country}</p></div></div>
          </div>
          <div><h3 class="t-h3 mb-2">À propos</h3><p class="t-body text-ink-2 leading-relaxed">${e.body}</p></div>
          <div><h3 class="t-h3 mb-2">Programme</h3><div class="card divide-y divide-line">${e.program.map((p) => `<div class="p-3.5 flex gap-3 t-body"><span class="font-bold text-gold-deep dark:text-gold w-14 flex-shrink-0">${p.split(" ")[0]}</span><span>${p.split(" ").slice(1).join(" ")}</span></div>`).join("")}</div></div>
          <div class="card p-4 flex items-center gap-3">${UI.avatar({ name: e.organizer }, "w-12 h-12")}<div class="flex-1 min-w-0"><p class="t-caption text-ink-3">Organisateur</p><p class="t-title truncate">${e.organizer}</p></div><button type="button" onclick="UI.toast('Message envoyé à l\\'organisateur.','success')" class="btn btn-sm btn-outline">Contacter</button></div>
          <div class="card overflow-hidden"><div id="ev-map" class="h-48 lg:h-56 bg-surface-low"></div><div class="p-4 flex flex-col sm:flex-row sm:items-center gap-3"><div class="flex-1"><p class="t-title">${e.place}</p><p class="t-small text-ink-2">Transport, restaurants et hébergements à proximité.</p></div>${UI.button("Y aller en transport", `Screens._transportPreset({toLatLng:{name:${UI.js(e.place)},lat:${e.lat},lng:${e.lng}}});App.nav('transport')`, { variant: "dark", block: false, icon: "directions_car" })}</div></div>
          ${nearbyRest.length ? `<div>${UI.sectionTitle("Dîner avant ou après", "Voir tout", "App.nav('restaurants')")}<div class="grid sm:grid-cols-2 gap-3">${nearbyRest.map((r) => UI.restaurantCard(r)).join("")}</div></div>` : ""}
          <div class="lg:hidden">${ticketPanel}</div>
        </div>
        <aside class="hidden lg:block lg:sticky lg:top-24">${ticketPanel}</aside>
      </div>`;
    Shell.render(container, { title: e.name, subtitle: YCData.fmtDate(e.date) + " · " + e.city, back: true, body, nav: false, showNav: true, onMount: () => { const m = YCMap.create("ev-map", { interactive: false, zoomControl: false, lat: e.lat, lng: e.lng, zoom: 14 }); if (m) m.addPoi([e.lat, e.lng], "confirmation_number", "<b>" + esc(e.place) + "</b>"); } });
  };
  Screens._pickTicket = (id, eid) => { sel.ticket = id; App.replace("eventDetail", { id: eid }); };
  Screens._ticketQty = (d, eid) => { sel.qty = Math.min(10, Math.max(1, sel.qty + d)); App.replace("eventDetail", { id: eid }); };
  Screens._ticketPreset = (eid, tid, qty) => { sel.ticket = tid; sel.qty = qty || 1; };
  Screens._shareEvent = (id) => { const e = YCData.event(id); const text = e.name + " · " + YCData.fmtDate(e.date) + " · " + e.place + " — sur YOUSS CONNECT"; if (navigator.share) navigator.share({ title: e.name, text }).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => UI.toast("Lien copié.", "success")); };

  /* ---------- Achat ---------- */
  Screens.eventCheckout = function (container, params) {
    const e = YCData.event(params.id); const t = e && e.tickets.find((x) => x.id === sel.ticket);
    if (!e || !t) { App.resetTo("events"); return; }
    if (!sel.method) sel.method = ACState.prefs.paymentMethod || "wallet";
    if (!sel.holder) sel.holder = ACState.user.fullName;
    const total = t.price * sel.qty, fee = 0;
    const body = `<div class="grid lg:grid-cols-[1fr_380px] gap-6">
      <div class="space-y-4">
        <div class="card p-4 flex items-center gap-4"><span class="w-20 h-20 rounded-xl overflow-hidden bg-card-high flex-shrink-0">${UI.img(e.img, e.name)}</span><div class="min-w-0"><p class="t-title truncate">${e.name}</p><p class="t-small text-ink-2">${YCData.fmtDate(e.date)} · ${e.time} · ${e.place}</p><p class="t-small font-semibold mt-1">${t.label} × ${sel.qty}</p></div></div>
        <div class="card p-4 space-y-3"><p class="t-caption text-ink-3">Participant</p>${UI.field("tk-holder", "Nom sur le billet", { value: sel.holder, icon: "person" })}${UI.field("tk-email", "E-mail de réception", { value: ACState.user.email, type: "email", icon: "mail" })}</div>
        <div class="card p-4 space-y-2"><p class="t-caption text-ink-3 mb-1">Paiement</p>${ACState.paymentMethods.filter((m) => m.type !== "cash").map((m) => `<button type="button" onclick="Screens._tkMethod('${m.type}','${e.id}')" class="w-full flex items-center gap-3 rounded-xl border p-3 text-left ${sel.method === m.type ? "border-gold bg-gold/10" : "border-line"}"><span class="menu-icon">${icon(m.icon)}</span><span class="flex-1"><span class="block t-title">${m.label}${m.type === "wallet" ? ` <span class="t-small text-ink-2 font-normal">· ${ACStore.fmtFCFA(ACState.wallet.balance)}</span>` : ""}</span><span class="block t-small text-ink-2">${m.sub}</span></span>${sel.method === m.type ? icon("check_circle", "text-gold", true) : ""}</button>`).join("")}</div>
      </div>
      <aside class="space-y-4 lg:sticky lg:top-24 self-start"><div class="card-dark p-5"><p class="t-caption text-gold">Récapitulatif</p>${UI.row(t.label + " × " + sel.qty, ACStore.fmtFCFA(total))}${UI.row("Frais de service", "Offerts")}<div class="divider border-white/15 my-2"></div><div class="flex items-center justify-between"><span class="t-title">Total</span><span class="t-h2">${ACStore.fmtFCFA(total + fee)}</span></div><p class="t-small text-white/60 mt-2">+${Math.round(total / 100)} points Youss Bonus</p></div>
        ${UI.primaryButton("Payer " + ACStore.fmtFCFA(total), `Screens._payEvent('${e.id}', ${total})`, { size: "lg", icon: "lock" })}</aside></div>`;
    Shell.render(container, { title: "Récapitulatif", subtitle: "Billetterie", back: true, body, nav: false });
  };
  Screens._tkMethod = (m, eid) => { sel.method = m; sel.holder = (document.getElementById("tk-holder") || {}).value || sel.holder; App.replace("eventCheckout", { id: eid }); };
  function makeTicket(e, t, qty, holder) {
    const tk = { id: ACStore.uid("tkt"), number: "YC-" + e.id.toUpperCase() + "-" + Math.floor(100000 + Math.random() * 899999), eventId: e.id, event: e.name, place: e.place, city: e.city, date: e.date, time: e.time, category: t.label, qty, total: t.price * qty, holder, img: e.img, lat: e.lat, lng: e.lng, createdAt: Date.now() };
    ACState.tickets.unshift(tk);
    return tk;
  }
  Screens._payEvent = function (eid, total) {
    const e = YCData.event(eid), t = e.tickets.find((x) => x.id === sel.ticket);
    const holder = (document.getElementById("tk-holder") || {}).value || ACState.user.fullName;
    ACStore.whenPaid(ACStore.pay({ amount: total, label: "Billet · " + e.name, service: "evenement", pointsEarned: Math.round(total / 100), method: sel.method, activity: { detail: { ticket: t.label + " × " + sel.qty, place: e.place, date: e.date } } }), function () {
      const tk = makeTicket(e, t, sel.qty, holder);
      t.left = Math.max(0, t.left - sel.qty);
      ACStore.addNotification("Billet confirmé", e.name + " · " + t.label + " × " + sel.qty + ". Retrouvez votre QR Code dans Mes billets.", "evenement", "ticketDetail?id=" + tk.id);
      ACStore.emit(); sel.qty = 1; sel.lastTicket = tk.id;
      App.resetTo("ticketConfirmed", { id: tk.id });
    }, function (res) { App.nav("paymentFailed", { retry: "eventCheckout", retryParams: eid, amount: total, reason: res.reason }); });
  };
  Screens._demoTicket = (eid, tid, qty) => { const e = YCData.event(eid), t = e.tickets.find((x) => x.id === tid); const tk = makeTicket(e, t, qty || 1, ACState.user.fullName); sel.lastTicket = tk.id; ACStore.emit(); Screens._demoTicketId = tk.id; };
  Screens._lastTicketParams = () => {};
  const _origParamsFor = Screens._demoParamsFor;
  Screens._demoParamsFor = function (screen) { if ((screen === "ticketConfirmed" || screen === "ticketDetail") && Screens._demoTicketId) return { id: Screens._demoTicketId }; return _origParamsFor ? _origParamsFor(screen) : {}; };

  /* ---------- Confirmation ---------- */
  Screens.ticketConfirmed = function (container, params) {
    const tk = ACState.tickets.find((x) => x.id === params.id) || ACState.tickets[0];
    if (!tk) { App.resetTo("events"); return; }
    const e = YCData.event(tk.eventId) || {};
    const city = tk.city === "Ouidah" ? "Cotonou" : tk.city;
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      ${UI.successHero({ icon: "confirmation_number", title: "Billet confirmé", body: "Votre billet numérique est prêt. Il a aussi été envoyé par e-mail (démo)." })}
      ${ticketCard(tk, true)}
      ${UI.primaryButton("Voir mon billet et le QR Code", go("ticketDetail", { id: tk.id }), { size: "lg", icon: "qr_code_2" })}
      ${UI.nextSteps([
        { icon: "directions_car", label: "Réserver un transport", sub: "Vers " + esc(tk.place), onclick: `Screens._transportPreset({toLatLng:{name:${UI.js(tk.place)},lat:${tk.lat || e.lat || 0},lng:${tk.lng || e.lng || 0}}});App.nav('transport')` },
        { icon: "restaurant", label: "Restaurants à proximité", sub: "Dîner avant le spectacle", onclick: go("restaurants", {}) },
        { icon: "calendar_add_on", label: "Ajouter au calendrier", sub: YCData.fmtDate(tk.date) + " · " + tk.time, onclick: `Screens._addCalendar('${tk.id}')` }
      ])}
      ${UI.secondaryButton("Mes billets", "App.nav('myTickets')")}
    </div>`;
    Shell.render(container, { title: "Billet confirmé", back: "App.nav('events')", body, nav: false, hideSearch: true });
  };
  Screens._addCalendar = (id) => {
    const tk = ACState.tickets.find((x) => x.id === id); if (!tk) return;
    const d = tk.date.replace(/-/g, ""), t = tk.time.replace(":", "") + "00";
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT", "SUMMARY:" + tk.event, "DTSTART:" + d + "T" + t, "LOCATION:" + tk.place, "DESCRIPTION:Billet YOUSS CONNECT " + tk.number, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a"); a.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics); a.download = "youss-connect-" + tk.number + ".ics"; document.body.appendChild(a); a.click(); a.remove();
    UI.toast("Événement ajouté au calendrier.", "success");
  };

  function ticketCard(tk, compact) {
    return `<div class="card overflow-hidden">
      <div class="relative h-32 bg-card-high">${UI.img(tk.img, tk.event)}<div class="absolute inset-0 gradient-up"></div><div class="absolute bottom-3 left-4 right-4 text-white"><p class="t-caption text-gold">${tk.category} × ${tk.qty}</p><h3 class="t-h3">${esc(tk.event)}</h3></div></div>
      <div class="p-4 grid grid-cols-2 gap-3 t-small">
        <div><p class="t-caption text-ink-3">Participant</p><p class="font-semibold">${esc(tk.holder)}</p></div><div><p class="t-caption text-ink-3">N° de billet</p><p class="font-semibold tracking-wider">${tk.number}</p></div>
        <div><p class="t-caption text-ink-3">Date & heure</p><p class="font-semibold">${YCData.fmtDate(tk.date)} · ${tk.time}</p></div><div><p class="t-caption text-ink-3">Lieu</p><p class="font-semibold">${esc(tk.place)}</p></div>
      </div></div>`;
  }

  /* ---------- Mes billets ---------- */
  Screens.myTickets = function (container, params) {
    const today = new Date().toISOString().slice(0, 10);
    const up = ACState.tickets.filter((t) => t.date >= today).sort((a, b) => a.date.localeCompare(b.date)), past = ACState.tickets.filter((t) => t.date < today);
    const row = (t) => `<button type="button" onclick="${go("ticketDetail", { id: t.id })}" class="card card-press overflow-hidden text-left flex">
      <span class="w-28 flex-shrink-0 bg-card-high relative">${UI.img(t.img, t.event)}</span>
      <span class="flex-1 min-w-0 p-3.5"><span class="block t-caption text-gold-deep dark:text-gold">${YCData.fmtDate(t.date)} · ${t.time}</span><span class="block t-title truncate mt-0.5">${esc(t.event)}</span><span class="block t-small text-ink-2 truncate">${esc(t.place)}</span><span class="block t-small mt-1">${t.category} × ${t.qty} · <span class="font-semibold">${t.number}</span></span></span>
      <span class="flex items-center pr-3 text-gold">${icon("qr_code_2", "text-[30px]")}</span></button>`;
    const body = ACState.tickets.length ? `
      <div>${UI.sectionTitle("À venir", null, null, up.length + " billet" + (up.length > 1 ? "s" : ""))}${up.length ? `<div class="grid md:grid-cols-2 gap-3">${up.map(row).join("")}</div>` : `<p class="t-small text-ink-2">Aucun billet à venir.</p>`}</div>
      ${past.length ? `<div>${UI.sectionTitle("Passés")}<div class="grid md:grid-cols-2 gap-3 opacity-70">${past.map(row).join("")}</div></div>` : ""}
      ${UI.secondaryButton("Découvrir d'autres événements", "App.nav('events')", { icon: "confirmation_number" })}`
      : UI.emptyState({ icon: "confirmation_number", title: "Aucun billet", body: "Vos billets d'événements apparaîtront ici après achat, avec leur QR Code.", actionLabel: "Découvrir les événements", actionOnclick: "App.resetTo('events')" });
    Shell.render(container, { title: "Mes billets", subtitle: "Billets numériques", back: true, body, nav: false, showNav: true });
  };

  Screens.ticketDetail = function (container, params) {
    const tk = ACState.tickets.find((x) => x.id === params.id) || ACState.tickets[0];
    if (!tk) { App.resetTo("myTickets"); return; }
    const payload = "youss:ticket:" + tk.number;
    const body = `<div class="max-w-narrow mx-auto w-full space-y-4">
      <div class="card overflow-hidden">
        <div class="relative h-36 bg-card-high">${UI.img(tk.img, tk.event)}<div class="absolute inset-0 gradient-up"></div><div class="absolute bottom-3 left-5 right-5 text-white"><p class="t-caption text-gold">${tk.category}</p><h2 class="t-h2">${esc(tk.event)}</h2></div></div>
        <div class="p-5 grid grid-cols-2 gap-4 t-small">
          <div><p class="t-caption text-ink-3">Participant</p><p class="t-title">${esc(tk.holder)}</p></div><div><p class="t-caption text-ink-3">Quantité</p><p class="t-title">${tk.qty} billet${tk.qty > 1 ? "s" : ""}</p></div>
          <div><p class="t-caption text-ink-3">Date</p><p class="t-title">${YCData.fmtDate(tk.date)}</p></div><div><p class="t-caption text-ink-3">Heure</p><p class="t-title">${tk.time}</p></div>
          <div class="col-span-2"><p class="t-caption text-ink-3">Lieu</p><p class="t-title">${esc(tk.place)}, ${esc(tk.city)}</p></div>
        </div>
        <div class="px-5"><div class="dashed"></div></div>
        <div class="p-5 flex flex-col items-center text-center ticket-notch">
          <div id="tk-qr" class="w-[220px] h-[220px] bg-white rounded-2xl border border-line flex items-center justify-center p-2">${UI.spinner()}</div>
          <p class="t-title tracking-[0.2em] mt-3">${tk.number}</p><p class="t-small text-ink-2">Présentez ce code à l'entrée. ${UI.badge("Valide", "success")}</p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">${UI.secondaryButton("Partager", `Screens._shareTicket('${tk.id}')`, { icon: "share" })}${UI.secondaryButton("Calendrier", `Screens._addCalendar('${tk.id}')`, { icon: "calendar_add_on" })}</div>
      ${UI.nextSteps([
        { icon: "directions_car", label: "Y aller en transport", sub: esc(tk.place), onclick: `Screens._transportPreset({toLatLng:{name:${UI.js(tk.place)},lat:${tk.lat || 6.37},lng:${tk.lng || 2.39}}});App.nav('transport')` },
        { icon: "restaurant", label: "Restaurants autour", sub: "Avant ou après", onclick: "App.nav('restaurants')" }
      ])}
    </div>`;
    Shell.render(container, { title: "Billet numérique", back: true, body, nav: false, hideSearch: true, onMount: () => YCScanner.render("tk-qr", payload, { size: 204, cell: 6 }) });
  };
  Screens._shareTicket = (id) => { const tk = ACState.tickets.find((x) => x.id === id); const text = "Mon billet YOUSS CONNECT · " + tk.event + " · " + tk.number; if (navigator.share) navigator.share({ title: "Billet", text }).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => UI.toast("Billet copié.", "success")); };
})();
