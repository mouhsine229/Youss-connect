(function () {
  "use strict";
  window.Screens = window.Screens || {};

  const WM = (file) =>
    "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(file) + "?width=800";

  const EVENTS = {
    ev1: {
      id: "ev1",
      name: "Festival international des Arts Vodoun",
      place: "Ouidah",
      date: "10 Jan 2027",
      body: "Célébration annuelle du patrimoine vodoun au Bénin : danses, processions et arts vivants sur la Route des Esclaves.",
      img: WM("Door_of_no_return.jpg"),
      tickets: [
        { id: "t1", label: "Standard", price: 5000 },
        { id: "t2", label: "VIP", price: 15000 }
      ]
    },
    ev2: {
      id: "ev2",
      name: "Concert au Stade de l'Amitié",
      place: "Cotonou",
      date: "21 Sept 2026",
      body: "Grande soirée musicale au cœur de Cotonou. Ambiance live, artistes locaux et régionaux.",
      img: WM("Monument_de_l'Amazone_au_Benin.jpg"),
      tickets: [
        { id: "t3", label: "Standard", price: 8000 },
        { id: "t4", label: "VIP", price: 20000 }
      ]
    },
    ev3: {
      id: "ev3",
      name: "Nuit culturelle à Ganvié",
      place: "Lac Nokoué",
      date: "5 Déc 2026",
      body: "Balade en pirogue et spectacles traditionnels dans le village lacustre de Ganvié.",
      img: WM("Ganvié.jpg"),
      tickets: [
        { id: "t5", label: "Entrée", price: 3500 },
        { id: "t6", label: "Pack famille", price: 10000 }
      ]
    }
  };
  let selectedTicket = null, ticketQty = 1;

  function eventThumb(e) {
    return `
      <img class="absolute inset-0 w-full h-full object-cover yc-img-fade" src="${e.img}" alt="${e.name}"
        onerror="this.style.display='none';var fb=this.parentElement.querySelector('[data-fallback]');if(fb)fb.classList.remove('hidden')"/>
      <div data-fallback class="absolute inset-0 hidden bg-gradient-to-br from-primary/20 to-primary-container/30 flex items-center justify-center text-primary">
        ${UI.icon("confirmation_number", "text-[36px]")}
      </div>`;
  }

  Screens.events = function (container) {
    const topbar = UI.topBar({ title: "Événements", subtitle: "Concerts, festivals, culture", back: "App.nav('home')" });
    const body = `
    <section class="flex gap-2 overflow-x-auto no-scrollbar">
      ${["Concerts", "Festivals", "Conférences", "Spectacles", "Activités culturelles", "Événements sportifs"].map((c, i) => `<span class="px-3 h-8 rounded-full font-label-sm text-label-sm flex items-center whitespace-nowrap ${i === 0 ? "bg-black text-white" : "bg-white border"}">${c}</span>`).join("")}
    </section>
    <section class="flex flex-col space-y-3">
      ${Object.values(EVENTS).map(e => `
      <div onclick="App.nav('eventDetail', {id:'${e.id}'})" class="yc-card yc-card-press overflow-hidden cursor-pointer">
        <div class="h-32 relative bg-surface-container-low">${eventThumb(e)}
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <span class="absolute bottom-2 left-3 font-label-sm text-label-sm text-white/95 font-semibold">${e.date}</span>
        </div>
        <div class="p-space-16">
          <h3 class="font-title-md text-title-md font-bold text-on-surface leading-snug">${e.name}</h3>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-1">${UI.icon("location_on", "text-[14px]")}${e.place}</p>
        </div>
      </div>`).join("")}
    </section>
    <div class="pt-space-8">${UI.secondaryButton("Mes billets", "App.nav('myTickets')")}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens.eventDetail = function (container, params) {
    const e = EVENTS[params.id] || Object.values(EVENTS)[0];
    if (!selectedTicket || !e.tickets.find(t => t.id === selectedTicket)) selectedTicket = e.tickets[0].id;
    const topbar = UI.topBar({ title: e.name, subtitle: e.place, back: "App.back()" });
    const body = `
    <section class="h-40 rounded-2xl relative overflow-hidden bg-surface-container-low shadow-sm">
      ${eventThumb(e)}
      <div class="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"></div>
      <div class="absolute bottom-3 left-3 right-3 text-white z-10">
        <p class="font-label-sm text-label-sm text-white/85">${e.date} · ${e.place}</p>
      </div>
    </section>
    <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">${e.body}</p>
    <section class="flex flex-col space-y-2">
      <h2 class="font-headline-sm text-headline-sm font-bold">Types de billets</h2>
      ${e.tickets.map(t => `
      <div onclick="Screens._pickTicket('${t.id}')" class="flex items-center justify-between rounded-2xl p-space-16 border cursor-pointer transition-colors ${selectedTicket === t.id ? "border-primary bg-primary/5 shadow-sm" : "border-outline-variant/30 bg-surface-container-lowest"}">
        <span class="font-title-md text-title-md font-semibold">${t.label}</span>
        <span class="font-label-lg text-label-lg font-bold text-primary">${ACStore.fmtFCFA(t.price)}</span>
      </div>`).join("")}
    </section>
    <section class="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-16 shadow-sm">
      <span class="font-title-md text-title-md font-semibold">Quantité</span>
      <div class="flex items-center space-x-3">
        <button onclick="Screens._ticketQty(-1,'${e.id}')" class="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center active:scale-95">${UI.icon("remove", "text-[16px]")}</button>
        <span class="font-label-lg text-label-lg font-bold w-5 text-center">${ticketQty}</span>
        <button onclick="Screens._ticketQty(1,'${e.id}')" class="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center active:scale-95">${UI.icon("add", "text-[16px]")}</button>
      </div>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Acheter un billet", `App.nav('eventCheckout', {id:'${e.id}'})`, { icon: "arrow_forward" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._pickTicket = function (id) { selectedTicket = id; App.replace(App.current.id, App.current.params); };
  Screens._ticketQty = function (d) { ticketQty = Math.max(1, ticketQty + d); App.replace(App.current.id, App.current.params); };

  Screens.eventCheckout = function (container, params) {
    const e = EVENTS[params && params.id];
    const t = e && e.tickets.find(x => x.id === selectedTicket);
    if (!e || !t) { App.resetTo("events"); return; }
    const total = t.price * ticketQty;
    const topbar = UI.topBar({ title: "Récapitulatif", back: "App.back()" });
    const body = `
    <section class="yc-card p-space-16 flex flex-col space-y-3">
      <div class="flex items-start justify-between gap-3"><span class="font-body-md text-body-md text-on-surface-variant">Événement</span><span class="font-title-md text-title-md font-semibold text-right">${e.name}</span></div>
      <div class="flex items-center justify-between"><span class="font-body-md text-body-md text-on-surface-variant">Billet</span><span class="font-title-md text-title-md">${t.label} × ${ticketQty}</span></div>
      <div class="flex items-center justify-between font-label-lg text-label-lg font-bold border-t border-outline-variant/30 pt-3"><span>Total</span><span class="text-primary">${ACStore.fmtFCFA(total)}</span></div>
    </section>
    <div class="pt-space-8">${UI.primaryButton("Payer avec Youss Wallet", `Screens._payEvent('${e.id}', ${total})`, { icon: "account_balance_wallet" })}</div>`;
    Shell.render(container, { topbar, body, nav: false });
  };
  Screens._payEvent = function (eid, total) {
    const e = EVENTS[eid];
    ACStore.whenPaid(
      ACStore.payFromWallet({ amount: total, label: "Billet · " + e.name, service: "evenement", pointsEarned: Math.round(total / 100) }),
      function () {
        ACState.tickets = ACState.tickets || [];
        ACState.tickets.push({ id: ACStore.uid("tkt"), event: e.name, place: e.place, date: e.date, qty: ticketQty, total });
        UI.toast("Billet confirmé", "success");
        ticketQty = 1;
        App.resetTo("myTickets");
      },
      function (res) { App.nav("paymentFailed", { retry: "events", amount: total, reason: res.reason }); }
    );
  };

  Screens.myTickets = function (container) {
    const tickets = ACState.tickets || [];
    const topbar = UI.topBar({ title: "Mes billets", back: "App.back()" });
    const body = tickets.length ? `
    <section class="flex flex-col space-y-3">
      ${tickets.map(t => `
      <div onclick="App.nav('ticketDetail', {id:'${t.id}'})" class="yc-card yc-card-press p-space-16 flex items-center justify-between cursor-pointer">
        <div class="flex flex-col min-w-0 pr-3">
          <span class="font-title-md text-title-md font-bold truncate">${t.event}</span>
          <span class="font-body-sm text-body-sm text-on-surface-variant">${t.place} · ${t.date}</span>
        </div>
        ${UI.icon("qr_code_2", "text-primary text-[28px]")}
      </div>`).join("")}
    </section>` : UI.emptyState({ icon: "confirmation_number", title: "Aucun billet", body: "Vos billets d'événements apparaîtront ici après achat.", actionLabel: "Découvrir les événements", actionOnclick: "App.resetTo('events')" });
    Shell.render(container, { topbar, body, nav: false });
  };

  Screens.ticketDetail = function (container, params) {
    const t = (ACState.tickets || []).find(x => x.id === params.id);
    const topbar = UI.topBar({ title: "Billet numérique", back: "App.back()" });
    const body = t ? `
    <section class="flex flex-col items-center text-center yc-card p-space-24 space-y-space-12">
      <h2 class="font-headline-md text-headline-md font-bold">${t.event}</h2>
      <p class="font-body-sm text-body-sm text-on-surface-variant">${t.place} · ${t.date}</p>
      <div class="w-44 h-44 bg-surface-container-low rounded-2xl flex items-center justify-center ring-1 ring-outline-variant/30">${UI.icon("qr_code_2", "text-[120px] text-primary")}</div>
      <p class="font-body-sm text-body-sm">${t.qty} billet(s) · ${ACStore.fmtFCFA(t.total)}</p>
      ${UI.badge("Valide", "success")}
    </section>` : UI.emptyState({ icon: "confirmation_number", title: "Billet introuvable", body: "" });
    Shell.render(container, { topbar, body, nav: false });
  };
})();
