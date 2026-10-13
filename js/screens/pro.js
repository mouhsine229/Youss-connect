// Espace cuisine. L'identifiant et le mot de passe viennent de la console KYA.
(function () {
  "use strict";
  window.Screens = window.Screens || {};
  const { icon, esc } = UI;
  const NAV = [
    { id: "proHome", label: "Commandes", icon: "receipt_long" },
    { id: "proMenu", label: "Menu", icon: "restaurant_menu" },
    { id: "proHours", label: "Horaires", icon: "schedule" },
    { id: "proPayouts", label: "Paiements", icon: "payments" }
  ];
  const NEXT = { "Nouvelle": "En préparation", "En préparation": "Prête", "Prête": "Livrée" };
  let poll = null;

  function on() {
    try { return sessionStorage.getItem("yc-kitchen") === "1"; }
    catch (e) { return false; }
  }
  function setOn(v) {
    try {
      if (v) sessionStorage.setItem("yc-kitchen", "1");
      else sessionStorage.removeItem("yc-kitchen");
    } catch (e) { /* navigation privée */ }
  }
  window.YCGate = window.YCGate || {};
  YCGate.pro = on;
  YCGate.setPro = setOn;

  function stopPoll() {
    if (poll) { clearInterval(poll); poll = null; }
  }
  function ago(iso) {
    const t = new Date(iso).getTime();
    if (!t) return "";
    const m = Math.round((Date.now() - t) / 60000);
    if (m < 1) return "À l'instant";
    if (m < 60) return "il y a " + m + " min";
    return "il y a " + Math.round(m / 60) + " h";
  }
  function itemsLabel(items) {
    return (items || []).map(function (i) {
      return (i.name || "Plat") + ((i.qty || 1) > 1 ? " × " + i.qty : "");
    }).join(", ");
  }
  function layout(active, title, body) {
    document.getElementById("app").innerHTML = `
      <div class="min-h-dvh flex flex-col bg-surface">
        <header class="sticky top-0 z-20 bg-card border-b border-line">
          <div class="px-4 h-14 flex items-center justify-between gap-3">
            <div class="min-w-0"><p class="t-caption">Cuisine</p><h1 id="pro-name" class="t-title truncate">Restaurant</h1></div>
            <button type="button" onclick="Screens._proOut()" class="t-small font-semibold text-ink-2 flex-shrink-0">Quitter</button>
          </div>
          <nav class="flex flex-wrap gap-1 px-3 pb-2">${NAV.map((n) => `<button type="button" onclick="App.nav('${n.id}')" class="chip ${active === n.id ? "on" : ""}">${n.label}</button>`).join("")}</nav>
        </header>
        <main class="flex-1 px-4 py-5 space-y-4 max-w-narrow mx-auto w-full">${title ? `<h2 class="t-h3">${esc(title)}</h2>` : ""}${body}</main>
      </div>`;
  }
  function named(place) {
    const el = document.getElementById("pro-name");
    if (el && place) el.textContent = place.name || "Restaurant";
  }
  function guard(draw) {
    if (!window.YCKitchen) { setOn(false); App.replace("proLogin"); return; }
    YCKitchen.session().then(function (s) {
      if (!s || !window.App || !App.current) { setOn(false); App.replace("proLogin"); return; }
      setOn(true);
      draw();
    });
  }

  Screens.proJoin = function (container) {
    container.innerHTML = `<div class="min-h-dvh flex items-center justify-center px-5 py-10">
      <div class="w-full max-w-[440px]">
        <p class="t-caption">Espace restaurant</p>
        <h1 class="t-h1 mt-1">La cuisine s'ouvre avec un compte</h1>
        <p class="t-body text-ink-2 mt-3">KYA crée le compte dans la console, puis remet l'identifiant et le mot de passe au restaurant. Il n'y a pas de code public.</p>
        <button type="button" onclick="App.nav('proLogin')" class="btn btn-lg btn-primary btn-block mt-6">J'ai mes identifiants</button>
      </div>
    </div>`;
  };

  Screens.proLogin = function (container) {
    if (on() && window.YCKitchen) {
      YCKitchen.session().then(function (s) { if (s) App.replace("proHome"); });
    }
    container.innerHTML = `<div class="min-h-dvh flex items-center justify-center px-5 py-10">
      <div class="w-full max-w-[400px]">
        <p class="t-caption">Espace restaurant</p>
        <h1 class="t-h1 mt-1">Connexion cuisine</h1>
        <p class="t-small text-ink-2 mt-2">Utilisez l'identifiant et le mot de passe remis par KYA. Le compte client YOUSS CONNECT reste séparé.</p>
        <form class="mt-6 space-y-3" onsubmit="event.preventDefault();Screens._proLogin()">
          ${UI.field("pr-id", "Identifiant", { autocomplete: "username", placeholder: "MAMAN-COTONOU" })}
          ${UI.field("pr-pass", "Mot de passe", { type: "password", autocomplete: "current-password" })}
          ${UI.error("pro-err")}
          <button type="submit" class="btn btn-lg btn-primary btn-block">Entrer</button>
        </form>
        <button type="button" onclick="App.nav('proJoin')" class="mt-4 t-small font-semibold">Je n'ai pas encore de compte</button>
      </div>
    </div>`;
  };
  Screens._proLogin = function () {
    const id = ((document.getElementById("pr-id") || {}).value || "").trim();
    const pass = (document.getElementById("pr-pass") || {}).value || "";
    if (!window.YCKitchen) { UI.showError("pro-err", "La cuisine est momentanément indisponible."); return; }
    YCKitchen.signIn(id, pass).then(function (res) {
      if (!res || !res.ok) { UI.showError("pro-err", (res && res.message) || "Identifiant ou mot de passe incorrect."); return; }
      setOn(true);
      App.resetTo("proHome");
    });
  };
  Screens._proOut = function () {
    stopPoll();
    setOn(false);
    const done = function () { App.resetTo("proLogin"); };
    if (window.YCKitchen) YCKitchen.signOut().then(done, done);
    else done();
  };

  function orderCard(o) {
    const next = NEXT[o.status];
    return `<article class="card p-4">
      <div class="flex items-start justify-between gap-2"><div class="min-w-0"><p class="t-caption">${esc(o.number)} · ${esc(ago(o.created_at))}</p><p class="t-title mt-0.5 truncate">${esc(o.client_name || "Client")}</p><p class="t-small text-ink-2">${esc(itemsLabel(o.items))}</p>${o.note ? `<p class="t-small text-ink-3 mt-1">${esc(o.note)}</p>` : ""}</div><span class="t-title whitespace-nowrap">${ACStore.fmtFCFA(o.total)}</span></div>
      <div class="flex flex-wrap gap-2 mt-3">${next ? `<button type="button" onclick='Screens._proAdvance(${JSON.stringify(o.id)},${JSON.stringify(next)})' class="btn btn-sm btn-dark">${esc(next)}</button>` : ""}${o.status !== "Livrée" && o.status !== "Annulée" ? `<button type="button" onclick='Screens._proAdvance(${JSON.stringify(o.id)},"Annulée")' class="btn btn-sm btn-outline">Annuler</button>` : ""}<span class="t-small self-center text-ink-2">${esc(o.status)} · ${o.method === "cash" ? "espèces" : "wallet"}</span></div>
    </article>`;
  }
  function paintOrders(rows) {
    const el = document.getElementById("pro-orders");
    if (!el) return;
    el.innerHTML = rows.length ? rows.map(orderCard).join("") : `<div class="card p-5"><p class="t-body text-ink-2">Aucune commande pour le moment.</p></div>`;
  }
  Screens.proHome = function () {
    stopPoll();
    guard(function () {
      if (!App.current || App.current.id !== "proHome") return;
      layout("proHome", "", `
        <div class="flex items-center justify-between gap-3">
          <p id="pro-pause-label" class="t-small text-ink-2 min-w-0">Chargement…</p>
          <button type="button" id="pro-pause" onclick="Screens._proPause()" class="btn btn-sm btn-outline flex-shrink-0">Pause</button>
        </div>
        <div id="pro-orders" class="space-y-3"></div>`);
      const paint = function () {
        YCKitchen.place().then(function (p) {
          if (!App.current || App.current.id !== "proHome" || !p) return;
          named(p);
          const label = document.getElementById("pro-pause-label");
          const btn = document.getElementById("pro-pause");
          if (label) label.textContent = p.paused ? "Restaurant en pause. Les clients ne commandent plus." : "Restaurant ouvert.";
          if (btn) {
            btn.textContent = p.paused ? "Reprendre" : "Pause";
            btn.className = "btn btn-sm flex-shrink-0 " + (p.paused ? "btn-primary" : "btn-outline");
          }
        });
        YCKitchen.orders().then(function (rows) {
          if (!App.current || App.current.id !== "proHome") return;
          paintOrders(rows || []);
        });
      };
      paint();
      poll = setInterval(function () { if (!document.hidden) paint(); }, 4000);
    });
  };
  Screens._proPause = function () {
    YCKitchen.place().then(function (p) {
      if (!p) return;
      YCKitchen.setPaused(!p.paused).then(function (res) {
        if (!res || !res.ok) { UI.toast((res && res.message) || "La pause n'a pas été enregistrée.", "error"); return; }
        if (window.YCKitchen) YCKitchen.loadCatalog();
        if (App.current && App.current.id === "proHome") Screens.proHome();
      });
    });
  };
  Screens._proAdvance = function (id, status) {
    if (!/^[0-9a-f-]{36}$/i.test(String(id || ""))) return;
    YCKitchen.advance(id, status).then(function (res) {
      if (!res || !res.ok) { UI.toast((res && res.message) || "Mise à jour impossible.", "error"); return; }
      if (App.current && App.current.id === "proHome") Screens.proHome();
    });
  };

  Screens.proMenu = function () {
    stopPoll();
    guard(function () {
      if (!App.current || App.current.id !== "proMenu") return;
      YCKitchen.place().then(function (p) {
        if (!p || !App.current || App.current.id !== "proMenu") return;
        YCKitchen.dishes().then(function (rows) {
          if (!App.current || App.current.id !== "proMenu") return;
          const list = (rows || []).map(function (d) {
            return `<div class="p-3.5 flex items-center justify-between gap-3"><div class="min-w-0"><p class="t-title truncate">${esc(d.name)}</p><p class="t-small text-ink-2">${ACStore.fmtFCFA(d.price)} · ${esc(d.grp || "Plats")}</p></div><button type="button" onclick='Screens._proDelDish(${JSON.stringify(d.id)})' class="t-small text-danger font-semibold flex-shrink-0">Retirer</button></div>`;
          }).join("");
          layout("proMenu", "Plats", `
            <div class="card divide-y divide-line">${list || `<p class="p-4 t-small text-ink-2">Aucun plat pour le moment. Ajoutez la carte ci-dessous.</p>`}</div>
            <form class="card p-4 space-y-3" onsubmit="event.preventDefault();Screens._proAddDish()">
              <p class="t-title">Ajouter un plat</p>
              ${UI.field("pd-name", "Nom", { placeholder: "Amiwo au poulet", maxlength: "80" })}
              ${UI.field("pd-desc", "Description", { placeholder: "Facultatif", maxlength: "200" })}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${UI.field("pd-price", "Prix (FCFA)", { type: "number", inputmode: "numeric" })}${UI.select("pd-group", "Catégorie", ["Plats", "Boissons", "Entrées"], "Plats")}</div>
              <button type="submit" class="btn btn-primary btn-block">Publier sur la carte</button>
            </form>`);
          named(p);
        });
      });
    });
  };
  Screens._proAddDish = function () {
    const name = ((document.getElementById("pd-name") || {}).value || "").trim();
    const price = parseInt((document.getElementById("pd-price") || {}).value, 10);
    const description = ((document.getElementById("pd-desc") || {}).value || "").trim();
    const group = (document.getElementById("pd-group") || {}).value || "Plats";
    YCKitchen.addDish({ name: name, price: price, description: description, group: group }).then(function (res) {
      if (!res || !res.ok) { UI.toast((res && res.message) || "Le plat n'a pas pu être ajouté.", "error"); return; }
      YCKitchen.loadCatalog();
      UI.toast("Plat ajouté à la carte.", "success");
      App.replace("proMenu");
    });
  };
  Screens._proDelDish = function (id) {
    YCKitchen.deleteDish(id).then(function (res) {
      if (!res || !res.ok) { UI.toast((res && res.message) || "Retrait impossible.", "error"); return; }
      YCKitchen.loadCatalog();
      UI.toast("Plat retiré de la carte.", "info");
      App.replace("proMenu");
    });
  };

  Screens.proHours = function () {
    stopPoll();
    guard(function () {
      if (!App.current || App.current.id !== "proHours") return;
      YCKitchen.place().then(function (p) {
        if (!p || !App.current || App.current.id !== "proHours") return;
        layout("proHours", "Horaires", `
          <form class="card p-4 space-y-3" onsubmit="event.preventDefault();Screens._proHours()">
            <p class="t-small text-ink-2">${esc(p.area || "")}${p.area ? ", " : ""}${esc(p.city || "")}</p>
            ${UI.field("ph-hours", "Horaires affichés", { value: p.hours || "", maxlength: "80" })}
            <button type="submit" class="btn btn-primary btn-block">Enregistrer</button>
          </form>
          <p class="t-small text-ink-3">La pause, sur l'écran Commandes, ferme les nouvelles commandes sans effacer la carte.</p>`);
        named(p);
      });
    });
  };
  Screens._proHours = function () {
    const value = ((document.getElementById("ph-hours") || {}).value || "").trim();
    YCKitchen.setHours(value).then(function (res) {
      if (!res || !res.ok) { UI.toast((res && res.message) || "Horaires non enregistrés.", "error"); return; }
      YCKitchen.loadCatalog();
      UI.toast("Horaires enregistrés.", "success");
    });
  };

  Screens.proPayouts = function () {
    stopPoll();
    guard(function () {
      if (!App.current || App.current.id !== "proPayouts") return;
      YCKitchen.place().then(function (p) {
        if (!p || !App.current || App.current.id !== "proPayouts") return;
        YCKitchen.orders().then(function (rows) {
          if (!App.current || App.current.id !== "proPayouts") return;
          let cash = 0, wallet = 0, n = 0;
          (rows || []).forEach(function (o) {
            if (o.status !== "Livrée") return;
            n += 1;
            if (o.method === "cash") cash += o.total || 0;
            else wallet += o.total || 0;
          });
          layout("proPayouts", "Paiements", `
            <div class="card p-5"><p class="t-caption">Encaissé enregistré</p><p class="t-h1 mt-1">${ACStore.fmtFCFA(cash + wallet)}</p><p class="t-small text-ink-2 mt-2">${n} commande${n > 1 ? "s" : ""} livrée${n > 1 ? "s" : ""} · espèces ${ACStore.fmtFCFA(cash)} · wallet ${ACStore.fmtFCFA(wallet)}</p></div>
            <div class="card p-5"><p class="t-body text-ink-2">Le versement vers le restaurant s'ouvrira avec le prestataire de paiement. Rien n'est transféré pour le moment.</p></div>`);
          named(p);
        });
      });
    });
  };
})();
