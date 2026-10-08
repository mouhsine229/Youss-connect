/* =========================================================
   YOUSS CONNECT — ÉTAT CENTRAL
   Une seule source de vérité partagée par tous les services :
   payer une course débite le Wallet, crédite Youss Bonus, crée une
   activité et une notification. L'état démo est persisté en local.
   ========================================================= */
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
      user: {
        name: "Alassane", fullName: "Alassane Koffi", phone: "+229 97 00 00 00", email: "alassane@example.com",
        city: "Cotonou", country: "Bénin", countryCode: "BJ", dial: "+229", avatar: IMG + "avatars/avatar-alassane.jpg", verified: true, since: "2025"
      },
      prefs: { theme: "light", paymentMethod: "wallet", notif: { transport: true, orders: true, delivery: true, events: true, wallet: true, promos: false, rewards: true } },
      wallet: {
        balance: 248500, currency: "FCFA",
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
        { id: "pm_wallet", type: "wallet", label: "Youss Wallet", sub: "Solde de l'écosystème", icon: "account_balance_wallet", isDefault: true },
        { id: "pm_mobile", type: "mobile", label: "Paiement mobile", sub: "Conceptuel · opérateur à définir", icon: "smartphone" },
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
        profile: { name: "Atelier Ayélé", category: "Mode & artisanat", city: "Cotonou", address: "Haie Vive, Cotonou", phone: "+229 97 00 00 00", hours: "09h00 – 19h00", desc: "Mode contemporaine en wax, pièces cousues à la main.", verified: true },
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

  /* ---------- Persistance locale ---------- */
  let State;
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 2) {
          const base = defaults();
          /* Les données de référence (seed) priment pour les clés absentes */
          Object.keys(base).forEach((k) => { if (parsed[k] === undefined) parsed[k] = base[k]; });
          parsed.session.remote = false;
          return parsed;
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
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(State)); } catch (e) { /* quota / privé */ }
    }, 120);
  }
  function reset() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* no-op */ }
    const fresh = defaults();
    Object.keys(State).forEach((k) => delete State[k]);
    Object.assign(State, fresh);
    emit();
  }

  /* ---------- Abonnements ---------- */
  function emit() {
    persist();
    listeners.forEach((fn) => { try { fn(State); } catch (e) { console.error(e); } });
  }
  function subscribe(fn) {
    listeners.push(fn);
    return () => { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); };
  }

  /* ---------- Opérations transverses ---------- */
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

  /* Résout un paiement local (objet) ou distant (Promise). */
  function whenPaid(result, onOk, onFail) {
    Promise.resolve(result).then(function (res) {
      if (res && res.ok) { if (onOk) onOk(res); }
      else if (onFail) onFail(res || { ok: false, reason: "error" });
    }).catch(function () { if (onFail) onFail({ ok: false, reason: "error" }); });
  }

  /**
   * Paiement unifié utilisé par tous les services.
   * opts: { amount, label, service, pointsEarned, method ('wallet'|'cash'|'mobile'), meta, activity:{...} }
   */
  function pay(opts) {
    opts = opts || {};
    const amount = Math.round(opts.amount || 0);
    const method = opts.method || State.prefs.paymentMethod || "wallet";
    const pointsEarned = opts.pointsEarned || 0;
    if (method === "wallet" && window.YCBackend && YCBackend.isLive()) return YCBackend.pay(opts);
    if (typeof navigator !== "undefined" && navigator.onLine === false && method !== "cash") {
      return { ok: false, reason: "offline" };
    }
    if (method === "wallet") {
      if (amount > State.wallet.balance) return { ok: false, reason: "insufficient_balance" };
      State.wallet.balance -= amount;
      addTransaction({ label: opts.label, amount: -amount, type: "debit", service: opts.service, meta: opts.meta || null });
      addNotification("Paiement confirmé", opts.label + " réglé via Youss Wallet (" + fmtFCFA(amount) + ").", "wallet", "wallet");
    } else if (method === "mobile") {
      addTransaction({ label: opts.label + " (paiement mobile)", amount: -amount, type: "debit", service: opts.service, status: "success", external: true });
    }
    if (opts.activity !== false) {
      addActivity(Object.assign({ service: opts.service, title: opts.label, amount, status: "Terminé", icon: iconForService(opts.service), method }, opts.activity || {}));
    }
    if (pointsEarned > 0) {
      addRewardPoints(pointsEarned, opts.label);
      addNotification("Points Youss Bonus", "+" + pointsEarned + " points ajoutés à votre solde Youss Bonus.", "rewards", "rewards");
    }
    emit();
    return { ok: true, method };
  }
  const payFromWallet = (opts) => pay(Object.assign({}, opts, { method: "wallet" }));

  function creditWallet(amount, label) {
    if (window.YCBackend && YCBackend.isLive()) return YCBackend.topup(amount, label);
    State.wallet.balance += amount;
    addTransaction({ label, amount, type: "credit", service: "wallet" });
    addNotification("Rechargement réussi", label + " (" + fmtFCFA(amount) + ") ajouté à votre solde.", "wallet", "wallet");
    emit();
    return { ok: true };
  }

  /* ---------- Commandes (restaurants & market) ---------- */
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
    const p = orderProgress(order);
    let idx = 0;
    steps.forEach((s, i) => { if (p >= s.after) idx = i; });
    return { idx, steps, progress: p, current: steps[idx], done: p >= 100 };
  }

  window.ACState = State;
  window.ACStore = {
    subscribe, emit, reset, uid, fmtFCFA, nowLabel, isoNow,
    addNotification, addActivity, addRewardPoints, addTransaction, iconForService,
    pay, payFromWallet, creditWallet, whenPaid,
    createOrder, orderProgress, orderStep, ORDER_STEPS,
    unread: () => State.notifications.filter((n) => !n.read).length,
    cartCount: () => State.cart.items.reduce((s, i) => s + i.qty, 0),
    marketCount: () => State.cart.market.reduce((s, i) => s + i.qty, 0),
    city: () => YCData.cityOf(State.user.city),
    setCity: (name) => {
      const c = YCData.CITIES[name]; if (!c) return;
      State.user.city = name; State.user.country = c.country; State.user.countryCode = c.code;
      State.user.dial = YCData.countryOf(c.code).dial;
      emit();
    }
  };
})();
