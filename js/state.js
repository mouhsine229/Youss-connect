// État partagé par tous les services. Payer une course débite le wallet,
// crédite les points, ajoute une activité et une notification. Persisté en localStorage.
(function () {
  "use strict";

  const STORAGE_KEY = "youss-state-v2";
  const listeners = [];
  const IMG = "./assets/img/";

  function uid(prefix) { return prefix + "_" + Math.random().toString(36).slice(2, 9); }
  function fmtFCFA(n) { return Math.round(n || 0).toLocaleString("fr-FR").replace(/\u202F/g, " ") + " FCFA"; }
  function nowLabel() {
    const d = new Date();
    return "Aujourd'hui à " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  function isoNow() { return new Date().toISOString(); }

  function defaults() {
    return {
      version: 2,
      session: { authenticated: false, onboardingSeen: false, mode: "particulier", remote: false },
      content: { events: [], ops: null },
      kitchen: { restId: "rest1", dishes: [], paused: false, ticket: [] },
      user: {
        name: "Alassane", fullName: "Alassane Koffi", phone: "+229 97 00 00 00", email: "alassane@example.com",
        city: "Cotonou", country: "Bénin", countryCode: "BJ", dial: "+229", avatar: IMG + "avatars/avatar-alassane.jpg", verified: true, since: "2025", biometricEnrolled: true
      },
      prefs: { theme: "light", paymentMethod: "wallet", location: true, recs: true, notif: { transport: true, orders: true, delivery: true, events: true, wallet: true, promos: false, rewards: true, dnd: false } },
      wallet: {
        balance: 248500, currency: "FCFA", cards: [],
        transactions: [
          { id: "txn_seed1", label: "Rechargement du Wallet", amount: 25000, type: "credit", status: "success", date: "Hier à 09:12", ref: "YC-TX-84120", service: "wallet" },
          { id: "txn_seed2", label: "Course vers Haie Vive", amount: -2500, type: "debit", status: "success", date: "Hier à 14:20", ref: "YC-TX-84133", service: "transport" },
          { id: "txn_seed3", label: "Commande Chez Maman Bénin", amount: -8400, type: "debit", status: "success", date: "Hier à 20:15", ref: "YC-TX-84151", service: "restaurant" },
          { id: "txn_seed4", label: "Envoi à Fatou D.", amount: -10000, type: "debit", status: "pending", date: "Aujourd'hui à 08:40", ref: "YC-TX-84201", service: "wallet" },
          { id: "txn_seed5", label: "Paiement QR · Stand 42 Dantokpa", amount: -3500, type: "debit", status: "failed", date: "Lundi à 11:05", ref: "YC-TX-83990", service: "wallet", reason: "Code PIN incorrect (3 essais)" }
        ]
      },
      rewards: {
        points: 12450,
        history: [
          { id: "rwd_seed1", label: "Course terminée", points: 25, date: "Hier" },
          { id: "rwd_seed2", label: "Commande restaurant", points: 84, date: "Hier" },
          { id: "rwd_seed3", label: "Achat Youss Market", points: 120, date: "Lundi" }
        ],
        redeemed: []
      },
      addresses: [
        { id: "addr_home", label: "Domicile", detail: "Cadjèhoun, rue 12.034, Cotonou", icon: "home", lat: 6.3620, lng: 2.3960, isDefault: true },
        { id: "addr_work", label: "Travail", detail: "Ganhi, avenue Clozel, Cotonou", icon: "work", lat: 6.3600, lng: 2.4290 }
      ],
      paymentMethods: [
        { id: "pm_wallet", type: "wallet", label: "Youss Wallet", sub: "Solde du compte", icon: "account_balance_wallet", isDefault: true },
        { id: "pm_mobile", type: "mobile", label: "Paiement mobile", sub: "Pas encore ouvert", icon: "smartphone" },
        { id: "pm_cash", type: "cash", label: "Espèces", sub: "À la livraison ou au chauffeur", icon: "payments" }
      ],
      activities: [
        { id: "act_seed1", service: "transport", title: "Course vers Haie Vive", subtitle: "Hier à 14:20", amount: 2500, status: "Terminé", icon: "directions_car", at: Date.now() - 86400000, detail: { from: "Ganhi", to: "Haie Vive", km: 4.2, driver: "Koffi Adjovi", rating: 5 } },
        { id: "act_seed2", service: "restaurant", title: "Commande Chez Maman Bénin", subtitle: "Hier à 20:15", amount: 8400, status: "Livré", icon: "restaurant", at: Date.now() - 80000000, detail: { items: ["Poisson braisé × 1", "Pâte sauce d'arachide × 1", "Bissap × 1"], address: "Domicile" } },
        { id: "act_seed3", service: "market", title: "Achat Youss Market · Beurre de karité", subtitle: "Lundi à 10:02", amount: 3500, status: "Livré", icon: "storefront", at: Date.now() - 2 * 86400000, detail: { items: ["Beurre de karité pur × 1"], seller: "Coopérative Femmes du Nord" } },
        { id: "act_seed4", service: "evenement", title: "Billet · Concert au Stade de l'Amitié", subtitle: "Samedi à 18:30", amount: 15000, status: "Confirmé", icon: "confirmation_number", at: Date.now() - 4 * 86400000, detail: { ticket: "Tribune × 1" } },
        { id: "act_seed5", service: "reservation", title: "Réservation · Table Océan (2 pers.)", subtitle: "Vendredi à 12:10", amount: null, status: "À venir", icon: "event_seat", at: Date.now() - 5 * 86400000, detail: { when: "Samedi 20h00" } }
      ],
      notifications: [
        { id: "ntf_seed1", title: "Votre chauffeur arrive dans 3 minutes.", body: "Koffi Adjovi · Toyota Corolla grise · RB-4821-A", read: false, service: "transport", date: "À l'instant", route: "activities" },
        { id: "ntf_seed2", title: "Votre commande est en préparation.", body: "Chez Maman Bénin prépare votre poisson braisé. Livraison estimée : 35 min.", read: false, service: "restaurant", date: "Il y a 12 min", route: "activities" },
        { id: "ntf_seed3", title: "Votre livraison est en route.", body: "Espoir D. a récupéré votre colis à Dantokpa, direction Ganhi.", read: false, service: "livraison", date: "Il y a 40 min", route: "activities" },
        { id: "ntf_seed4", title: "Votre événement commence demain.", body: "Concert au Stade de l'Amitié · 20h00. Votre billet est dans Mes billets.", read: true, service: "evenement", date: "Hier, 18:00", route: "myTickets" },
        { id: "ntf_seed5", title: "Vous avez gagné de nouveaux points.", body: "+120 points Youss Bonus pour votre achat Youss Market.", read: true, service: "rewards", date: "Lundi, 10:03", route: "rewards" }
      ],
      cart: { restaurant: null, items: [], note: "", market: [] },
      orders: [],
      tickets: [
        { id: "tkt_seed1", number: "YC-EV2-104872", eventId: "ev2", event: "Concert au Stade de l'Amitié", place: "Stade de l'Amitié, Kouhounou", city: "Cotonou", date: "2026-11-21", time: "20:00", category: "Tribune", qty: 1, total: 15000, holder: "Alassane Koffi", img: IMG + "services/svc-events.jpg", createdAt: Date.now() - 4 * 86400000 }
      ],
      saved: [],
      favorites: [],
      trip: null,
      business: {
        profile: { name: "Atelier Ayélé", category: "Mode & artisanat", city: "Cotonou", address: "Haie Vive, Cotonou", phone: "+229 97 00 00 00", hours: "09h00 - 19h00", desc: "Mode contemporaine en wax, pièces cousues à la main.", verified: true, shopVisible: true, acceptBookings: true, featured: false },
        products: [
          { id: "bp1", name: "Robe wax contemporaine", price: 12000, stock: 7 },
          { id: "bp2", name: "Collier perles de traite", price: 5000, stock: 12 },
          { id: "bp3", name: "Sac tissé artisanal", price: 6500, stock: 5 }
        ],
        services: [
          { id: "bs1", name: "Retouche sur mesure", price: 3000, duration: "48 h" },
          { id: "bs2", name: "Création sur commande", price: 25000, duration: "10 jours" }
        ],
        orders: [
          { id: "bo1", client: "Fatou D.", item: "Robe wax contemporaine", amount: 12000, status: "Nouvelle", at: "Aujourd'hui 09:40" },
          { id: "bo2", client: "Kossi A.", item: "Sac tissé artisanal", amount: 6500, status: "En traitement", at: "Hier 16:20" },
          { id: "bo3", client: "Nadia S.", item: "Collier perles de traite × 2", amount: 10000, status: "Expédiée", at: "Lundi 11:05" },
          { id: "bo4", client: "Marc A.", item: "Robe wax contemporaine", amount: 12000, status: "Livrée", at: "Samedi 14:30" }
        ],
        bookings: [
          { id: "bk1", client: "Aïcha B.", service: "Retouche sur mesure", when: "Demain 10:00", status: "En attente" },
          { id: "bk2", client: "Jean K.", service: "Création sur commande", when: "Vendredi 15:00", status: "Confirmée" }
        ],
        stats: { week: [42000, 18500, 61000, 23500, 54000, 78500, 36000], visits: 1240, conversion: 4.8, rating: 4.8 }
      }
    };
  }

  // Persistance locale
  let State;
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 2 && Object.prototype.toString.call(parsed) === "[object Object]") {
          const base = defaults();
          const out = {};
          Object.keys(base).forEach((k) => {
            if (k === "__proto__" || k === "constructor" || k === "prototype") return;
            out[k] = parsed[k] !== undefined ? parsed[k] : base[k];
          });
          out.session = Object.assign({}, base.session, out.session && typeof out.session === "object" ? out.session : {});
          out.session.remote = false;
          out.session.authenticated = !!out.session.authenticated;
          out.wallet = Object.assign({}, base.wallet, out.wallet && typeof out.wallet === "object" ? out.wallet : {});
          const bal = Number(out.wallet.balance);
          out.wallet.balance = isFinite(bal) ? Math.max(0, Math.min(bal, 10000000)) : base.wallet.balance;
          if (out.user && typeof out.user === "object" && window.YCData) {
            const official = (YCData.COUNTRIES || []).find((c) => c.code === out.user.countryCode);
            if (official) {
              if (out.user.country !== official.name) out.user.country = official.name;
              if (official.cities.indexOf(out.user.city) < 0) out.user.city = official.cities[0];
            }
          }
          if (out.prefs && out.prefs.pinHash) delete out.prefs.pinHash;
          if (!Array.isArray(out.wallet.cards)) out.wallet.cards = [];
          out.wallet.cards = out.wallet.cards.filter(function (c) { return c && c.last4 && !c.pan && !c.cvv; }).map(function (c) {
            return { id: String(c.id || ""), brand: String(c.brand || "Carte"), last4: String(c.last4).replace(/\D/g, "").slice(-4), exp: String(c.exp || ""), holder: String(c.holder || "") };
          });
          return out;
        }
      }
    } catch (e) { /* stockage indisponible */ }
    return defaults();
  }
  State = load();

  let saveTimer = null;
    function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        var snapshot = JSON.parse(JSON.stringify(State));
        if (snapshot.prefs) delete snapshot.prefs.pinHash;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch (e) { /* quota / privé */ }
      if (window.YCBackend && YCBackend.isLive() && YCBackend.saveLists) YCBackend.saveLists();
    }, 120);
  }
  function reset() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* no-op */ }
    const fresh = defaults();
    Object.keys(State).forEach((k) => delete State[k]);
    Object.assign(State, fresh);
    emit();
  }

  // Abonnements
  let quietDepth = 0;
  function emit() {
    persist();
    if (quietDepth) return;
    listeners.forEach((fn) => { try { fn(State); } catch (e) { console.error(e); } });
  }
  function quietly(fn) {
    quietDepth++;
    try { return fn(); }
    finally { quietDepth--; }
  }
  function subscribe(fn) {
    listeners.push(fn);
    return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };
  }

  // Opérations transverses
  function addNotification(title, body, service, route) {
    const prefs = State.prefs.notif;
    const key = { transport: "transport", restaurant: "orders", market: "orders", livraison: "delivery", evenement: "events", wallet: "wallet", rewards: "rewards", promo: "promos" }[service];
    if (key && prefs[key] === false) return;
    State.notifications.unshift({ id: uid("ntf"), title, body, read: false, service, date: "À l'instant", route: route || null, at: Date.now() });
  }
  function addActivity(entry) {
    const a = Object.assign({ id: uid("act"), subtitle: nowLabel(), at: Date.now() }, entry);
    State.activities.unshift(a);
    return a;
  }
  function addRewardPoints(points, label) {
    const before = YCData.tierFor(State.rewards.points).id;
    State.rewards.points += points;
    State.rewards.history.unshift({ id: uid("rwd"), label, points, date: "Aujourd'hui" });
    const after = YCData.tierFor(State.rewards.points).id;
    if (after !== before) addNotification("Nouveau statut Youss Bonus", "Félicitations, vous passez au niveau " + after + ".", "rewards", "rewards");
  }
  function iconForService(service) {
    return {
      transport: "directions_car", livraison: "local_shipping", restaurant: "restaurant", market: "storefront",
      evenement: "confirmation_number", culture: "explore", wallet: "account_balance_wallet", rewards: "workspace_premium",
      business: "business_center", reservation: "event_seat"
    }[service] || "task_alt";
  }
  function addTransaction(tx) {
    const t = Object.assign({ id: uid("txn"), date: "À l'instant", status: "success", ref: "YC-TX-" + Math.floor(80000 + Math.random() * 19999), at: Date.now() }, tx);
    State.wallet.transactions.unshift(t);
    return t;
  }

  /* Résout un paiement local (objet) ou distant (Promise).
     Le rendu est suspendu pendant le callback pour que la navigation
     parte avant le rafraîchissement de l'écran en cours. */
  function whenPaid(result, onOk, onFail) {
    const apply = function (res) {
      quietDepth++;
      try {
        if (res && res.ok) { if (onOk) onOk(res); }
        else if (onFail) onFail(res || { ok: false, reason: "error" });
      } catch (err) {
        console.error(err);
      } finally {
        quietDepth--;
      }
      emit();
    };
    if (result && typeof result.then === "function") {
      Promise.resolve(result).then(apply).catch(function () { if (onFail) onFail({ ok: false, reason: "error" }); });
      return;
    }
    apply(result);
  }
  function activeCard() {
    const cards = State.wallet.cards || [];
    return cards.find(function (c) { return c.id === State.prefs.cardId; }) || cards[0] || null;
  }

  // Paiement commun à tous les services.
  // opts: { amount, label, service, pointsEarned, method ('wallet'|'cash'|'mobile'), meta, activity:{...} }
  function pay(opts) {
    opts = opts || {};
    const amount = Math.round(Number(opts.amount) || 0);
    if (!isFinite(amount) || amount <= 0 || amount > 2000000) return { ok: false, reason: "error" };
    const method = opts.method || State.prefs.paymentMethod || "wallet";
    const pointsEarned = opts.pointsEarned || 0;
    if (method === "wallet" && window.YCBackend && YCBackend.isLive()) return YCBackend.pay(opts);
    if ((method === "card" || method === "mobile") && window.YCBackend && YCBackend.isLive()) {
      return { ok: false, reason: "unavailable", message: "La carte et le paiement mobile ne sont pas encore encaissés. Choisissez Youss Wallet ou les espèces." };
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false && method !== "cash") {
      return { ok: false, reason: "offline" };
    }
    let tx = null;
    const card = method === "card" ? activeCard() : null;
    if (method === "wallet") {
      if (amount > State.wallet.balance) return { ok: false, reason: "insufficient_balance" };
      State.wallet.balance -= amount;
      tx = addTransaction({ label: opts.label, amount: -amount, type: "debit", service: opts.service, method: "wallet", meta: opts.meta || null });
      addNotification("Paiement confirmé", opts.label + " réglé via Youss Wallet (" + fmtFCFA(amount) + ").", "wallet", "wallet");
    } else if (method === "card" && !card) {
      return { ok: false, reason: "error" };
    } else if (method === "mobile" || method === "card" || method === "cash") {
      const via = method === "card" && card ? " · " + card.brand + " " + card.last4 : method === "cash" ? " · espèces" : " (paiement mobile)";
      tx = addTransaction({
        label: opts.label + via, amount: -amount, type: "debit", service: opts.service, status: "success",
        external: method !== "wallet", method: method,
        meta: Object.assign({}, opts.meta || {}, card ? { brand: card.brand, last4: card.last4 } : {})
      });
    }
    if (opts.activity !== false) {
      addActivity(Object.assign({ service: opts.service, title: opts.label, amount, status: "Terminé", icon: iconForService(opts.service), method }, opts.activity || {}));
    }
    if (pointsEarned > 0) {
      addRewardPoints(pointsEarned, opts.label);
      addNotification("Points Youss Bonus", "+" + pointsEarned + " points ajoutés à votre solde Youss Bonus.", "rewards", "rewards");
    }
    return { ok: true, method: method, tx: tx };
  }
  const payFromWallet = (opts) => pay(Object.assign({}, opts, { method: "wallet" }));

  function creditWallet(amount, label) {
    amount = Math.round(Number(amount) || 0);
    if (amount < 500 || amount > 1000000) return { ok: false, reason: "invalid_amount", message: "Montant de recharge invalide." };
    if (window.YCBackend && YCBackend.isLive()) return YCBackend.topup(amount, label);
    State.wallet.balance += amount;
    const tx = addTransaction({ label, amount, type: "credit", service: "wallet", method: "topup" });
    addNotification("Rechargement réussi", label + " (" + fmtFCFA(amount) + ") ajouté à votre solde.", "wallet", "wallet");
    return { ok: true, tx: tx };
  }

  // Commandes (restaurants & market)
  const ORDER_STEPS = {
    restaurant: [
      { id: "confirmed", label: "Commande confirmée", icon: "check_circle", after: 0 },
      { id: "preparing", label: "En préparation", icon: "skillet", after: 20 },
      { id: "picked", label: "Récupérée par le livreur", icon: "two_wheeler", after: 50 },
      { id: "delivering", label: "En livraison", icon: "near_me", after: 65 },
      { id: "delivered", label: "Livrée", icon: "home", after: 100 }
    ],
    market: [
      { id: "confirmed", label: "Commande confirmée", icon: "check_circle", after: 0 },
      { id: "preparing", label: "Préparation par le vendeur", icon: "inventory_2", after: 20 },
      { id: "shipped", label: "Expédiée", icon: "local_shipping", after: 45 },
      { id: "delivering", label: "En livraison", icon: "near_me", after: 70 },
      { id: "delivered", label: "Livrée", icon: "home", after: 100 }
    ]
  };
  function createOrder(o) {
    const order = Object.assign({ id: uid("ord"), number: "YC-" + (o.type === "market" ? "MK" : "RS") + "-" + Math.floor(100000 + Math.random() * 899999), createdAt: Date.now(), durationSec: o.type === "market" ? 150 : 110, rated: null }, o);
    if (o.partnerOrderId) order.kitchenStatus = o.kitchenStatus || "Nouvelle";
    State.orders.unshift(order);
    emit();
    return order;
  }
  /* Progression 0..100 calculée sur le temps écoulé (cohérente après rechargement) */
  function orderProgress(order) {
    const elapsed = (Date.now() - order.createdAt) / 1000;
    return Math.min(100, Math.round((elapsed / (order.durationSec || 120)) * 100));
  }
  function orderStep(order) {
    const steps = ORDER_STEPS[order.type] || ORDER_STEPS.restaurant;
    if (order.kitchenStatus === "Annulée") {
      return { idx: 0, steps: steps, progress: 0, current: { id: "cancelled", label: "Annulée", icon: "cancel", after: 0 }, done: false };
    }
    if (order.kitchenStatus) {
      const map = { "Nouvelle": 0, "En préparation": 1, "Prête": 2, "Livrée": steps.length - 1 };
      let idx = map[order.kitchenStatus];
      if (idx == null) idx = 0;
      idx = Math.max(0, Math.min(idx, steps.length - 1));
      const done = order.kitchenStatus === "Livrée";
      const current = Object.assign({}, steps[idx]);
      if (order.kitchenStatus === "Prête") current.label = "Prête au restaurant";
      if (done) current.label = steps[steps.length - 1].label;
      return { idx: idx, steps: steps, progress: done ? 100 : steps[idx].after, current: current, done: done };
    }
    const p = orderProgress(order);
    let idx = 0;
    steps.forEach((s, i) => { if (p >= s.after) idx = i; });
    return { idx, steps, progress: p, current: steps[idx], done: p >= 100 };
  }

  function setPlace(code, cityName) {
    const country = YCData.countryOf(code);
    const known = country.cities.indexOf(cityName) >= 0 || !!YCData.CITIES[cityName];
    State.user.city = known ? cityName : country.cities[0];
    State.user.country = country.name;
    State.user.countryCode = country.code;
    State.user.dial = country.dial;
    emit();
  }
  function setCity(name) {
    const c = YCData.CITIES[name];
    if (c) { setPlace(c.code, name); return; }
    const country = (YCData.COUNTRIES || []).find((x) => x.cities.indexOf(name) >= 0);
    if (country) setPlace(country.code, name);
  }

  window.ACState = State;
  window.ACStore = {
    subscribe, emit, quietly, reset, uid, fmtFCFA, nowLabel, isoNow,
    addNotification, addActivity, addRewardPoints, addTransaction, iconForService,
    pay, payFromWallet, creditWallet, whenPaid,
    createOrder, orderProgress, orderStep, ORDER_STEPS,
    unread: () => State.notifications.filter((n) => !n.read).length,
    cartCount: () => State.cart.items.reduce((s, i) => s + i.qty, 0),
    marketCount: () => State.cart.market.reduce((s, i) => s + i.qty, 0),
    city: () => YCData.cityOf(State.user.city),
    setCity, setPlace
  };
})();
