/* =========================================================
   YOUSS CONNECT — CENTRAL STATE ENGINE
   Single source of truth shared by every service.
   This is what makes Transport / Wallet / Rewards / Activities /
   Notifications behave like ONE ecosystem instead of separate apps.
   ========================================================= */
(function () {
  "use strict";

  const listeners = [];

  function uid(prefix) {
    return prefix + "_" + Math.random().toString(36).slice(2, 9);
  }

  function fmtFCFA(n) {
    return Math.round(n).toLocaleString("fr-FR").replace(/\u202F/g, " ") + " FCFA";
  }

  function nowLabel() {
    const d = new Date();
    return "Aujourd'hui à " + d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
  }

  const State = {
    session: {
      authenticated: false,
      onboardingSeen: false,
      mode: "particulier" // or "business"
    },
    user: {
      name: "Alassane",
      fullName: "Alassane Koffi",
      phone: "+229 97 00 00 00",
      email: "alassane@example.com",
      city: "Cotonou",
      country: "Bénin",
      dial: "+229",
      avatar: "https://i.pravatar.cc/200?u=alassane-koffi",
      verified: true
    },
    wallet: {
      balance: 248500,
      currency: "FCFA",
      transactions: [
        { id: uid("txn"), label: "Rechargement Mobile Money", amount: 25000, type: "credit", date: "Hier à 09:12" },
        { id: uid("txn"), label: "Course vers Haie Vive", amount: -2500, type: "debit", date: "Hier à 14:20" },
        { id: uid("txn"), label: "Commande Maquis du Port", amount: -8400, type: "debit", date: "Hier à 20:15" }
      ]
    },
    rewards: {
      points: 12450,
      tier: "Silver",
      nextTier: "Gold",
      nextTierAt: 20000,
      history: [
        { id: uid("rwd"), label: "Course terminée", points: 25, date: "Hier" },
        { id: uid("rwd"), label: "Commande restaurant", points: 84, date: "Hier" }
      ]
    },
    addresses: [
      { id: uid("addr"), label: "Domicile", detail: "Cadjèhoun, Cotonou", icon: "home" },
      { id: uid("addr"), label: "Travail", detail: "Ganhi, Cotonou", icon: "work" }
    ],
    activities: [
      { id: uid("act"), service: "transport", title: "Course vers Haie Vive", subtitle: "Aujourd'hui à 14:20", amount: 2500, status: "Terminé", icon: "directions_car" },
      { id: uid("act"), service: "restaurant", title: "Commande Maquis du Port", subtitle: "Hier à 20:15", amount: 8400, status: "Livré", icon: "restaurant" },
      { id: uid("act"), service: "livraison", title: "Livraison Dantokpa → Ganhi", subtitle: "Arrivée estimée 16:45", amount: null, status: "En cours", icon: "local_shipping" }
    ],
    notifications: [
      { id: uid("ntf"), title: "Paiement confirmé", body: "Votre course vers Haie Vive a été réglée via Youss Wallet.", read: false, service: "wallet", date: "Aujourd'hui, 14:21" },
      { id: uid("ntf"), title: "Points Youss Bonus", body: "+25 points ajoutés à votre solde Youss Bonus.", read: false, service: "rewards", date: "Aujourd'hui, 14:21" },
      { id: uid("ntf"), title: "Livraison en cours", body: "Votre coursier est en route vers Ganhi, Cotonou.", read: true, service: "livraison", date: "Aujourd'hui, 12:05" }
    ],
    cart: { restaurant: null, items: [], market: [] },
    trip: null // active transport booking
  };

  function emit() {
    listeners.forEach((fn) => {
      try { fn(State); } catch (e) { console.error(e); }
    });
  }

  function subscribe(fn) {
    listeners.push(fn);
    return () => {
      const i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }

  /* ---------- Core interconnected operations ---------- */

  function addNotification(title, body, service) {
    State.notifications.unshift({
      id: uid("ntf"), title, body, read: false, service, date: "À l'instant"
    });
  }

  function addActivity(entry) {
    State.activities.unshift(Object.assign({ id: uid("act"), subtitle: nowLabel() }, entry));
  }

  function addRewardPoints(points, label) {
    State.rewards.points += points;
    State.rewards.history.unshift({ id: uid("rwd"), label, points, date: "Aujourd'hui" });
    if (State.rewards.points >= State.rewards.nextTierAt && State.rewards.tier === "Silver") {
      State.rewards.tier = "Gold";
      addNotification("Nouveau statut débloqué", "Félicitations, vous êtes passé Gold Youss Bonus.", "rewards");
    }
  }

  /**
   * Unified payment used by every service (Transport, Restaurants,
   * Market, Events...). Returns {ok, reason}.
   */
  /* Résout un paiement local (objet) ou distant (Promise). */
  function whenPaid(result, onOk, onFail) {
    Promise.resolve(result).then(function (res) {
      if (res && res.ok) { if (onOk) onOk(res); }
      else if (onFail) onFail(res || { ok: false, reason: "error" });
    }).catch(function () {
      if (onFail) onFail({ ok: false, reason: "error" });
    });
  }

  function payFromWallet(opts) {
    opts = opts || {};
    var amount = opts.amount;
    var label = opts.label;
    var service = opts.service;
    var pointsEarned = opts.pointsEarned || 0;
    if (window.YCBackend && YCBackend.isLive()) return YCBackend.pay(opts);
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return { ok: false, reason: "offline" };
    }
    if (amount > State.wallet.balance) {
      return { ok: false, reason: "insufficient_balance" };
    }
    State.wallet.balance -= amount;
    State.wallet.transactions.unshift({
      id: uid("txn"), label, amount: -amount, type: "debit", date: "À l'instant"
    });
    addActivity({ service, title: label, amount, status: "Terminé", icon: iconForService(service) });
    addNotification("Paiement confirmé", label + " a été réglé via Youss Wallet (" + fmtFCFA(amount) + ").", "wallet");
    if (pointsEarned > 0) {
      addRewardPoints(pointsEarned, label);
      addNotification("Points Youss Bonus", "+" + pointsEarned + " points ajoutés à votre solde Youss Bonus.", "rewards");
    }
    emit();
    return { ok: true };
  }

  function creditWallet(amount, label) {
    if (window.YCBackend && YCBackend.isLive()) return YCBackend.topup(amount, label);
    State.wallet.balance += amount;
    State.wallet.transactions.unshift({ id: uid("txn"), label, amount, type: "credit", date: "À l'instant" });
    addNotification("Rechargement réussi", label + " (" + fmtFCFA(amount) + ") a été ajouté à votre solde.", "wallet");
    emit();
    return { ok: true };
  }

  function iconForService(service) {
    return {
      transport: "directions_car",
      livraison: "local_shipping",
      restaurant: "restaurant",
      market: "storefront",
      evenement: "confirmation_number",
      culture: "explore",
      wallet: "account_balance_wallet",
      rewards: "workspace_premium",
      business: "business_center"
    }[service] || "task_alt";
  }

  window.ACState = State;
  window.ACStore = {
    subscribe,
    emit,
    uid,
    fmtFCFA,
    addNotification,
    addActivity,
    addRewardPoints,
    payFromWallet,
    creditWallet,
    whenPaid,
    iconForService
  };
})();
