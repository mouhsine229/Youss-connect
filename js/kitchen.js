// Cuisine réelle. Le compte restaurant est un deuxième client Supabase :
// il ne remplace pas la session du client YOUSS CONNECT.
(function () {
  "use strict";

  var cfg = window.YC_CONFIG || {};
  var client = null;
  var catalog = [];
  var catalogReady = false;
  var mine = null;
  var DOMAIN = "@kitchen.youssconnect.app";
  var IMG = "./assets/img/food/rest-maman-benin.jpg";

  function ensure() {
    if (client) return client;
    if (!window.supabase || !window.supabase.createClient) return null;
    var url = (cfg.supabaseUrl || "").trim();
    var key = (cfg.supabaseAnonKey || "").trim();
    if (url.indexOf("https://") !== 0 || key.length < 20) return null;
    client = window.supabase.createClient(url, key, {
      auth: { persistSession: true, storageKey: "youss-kitchen", detectSessionInUrl: false }
    });
    return client;
  }

  function mark(on) {
    try {
      if (on) sessionStorage.setItem("yc-kitchen", "1");
      else sessionStorage.removeItem("yc-kitchen");
    } catch (e) { /* navigation privée */ }
  }

  function emailFor(loginId) {
    return String(loginId || "").trim().toLowerCase() + DOMAIN;
  }

  function fail(message) {
    return { ok: false, message: message || "Action impossible." };
  }

  function restore() {
    var c = ensure();
    if (!c) { mark(false); return Promise.resolve(false); }
    return c.auth.getSession().then(function (res) {
      var ok = !!(res.data && res.data.session);
      mark(ok);
      if (!ok) mine = null;
      return ok;
    }).catch(function () { mark(false); return false; });
  }

  function session() {
    var c = ensure();
    if (!c) return Promise.resolve(null);
    return c.auth.getSession().then(function (res) {
      var s = res.data && res.data.session;
      mark(!!s);
      if (!s) mine = null;
      return s || null;
    }).catch(function () { mark(false); return null; });
  }

  function signIn(loginId, password) {
    var c = ensure();
    if (!c) return Promise.resolve(fail("La cuisine est momentanément indisponible."));
    var id = String(loginId || "").trim();
    if (id.length < 4 || !password) return Promise.resolve(fail("Indiquez l'identifiant et le mot de passe."));
    return c.auth.signInWithPassword({ email: emailFor(id), password: password }).then(function (res) {
      if (res.error || !res.data || !res.data.session) {
        mark(false);
        return fail("Identifiant ou mot de passe incorrect.");
      }
      mine = null;
      mark(true);
      return { ok: true };
    }).catch(function () { return fail("Connexion impossible. Vérifiez le réseau."); });
  }

  function signOut() {
    mine = null;
    mark(false);
    if (!client) return Promise.resolve();
    return client.auth.signOut().catch(function () {});
  }

  function toCard(place) {
    var dishes = (place.partner_dishes || []).filter(function (d) { return d.available !== false; }).map(function (d) {
      return {
        id: d.id,
        name: d.name,
        desc: d.description || "",
        price: d.price,
        img: IMG,
        group: d.grp || "Plats"
      };
    });
    var sum = 0;
    dishes.forEach(function (d) { sum += d.price; });
    var hub = window.YCData && YCData.cityOf ? YCData.cityOf(place.city) : { lat: 6.37, lng: 2.43 };
    return {
      id: "kp-" + place.id,
      partnerId: place.id,
      name: place.name,
      city: place.city,
      area: place.area || place.city,
      cat: "Restaurant",
      tags: ["Compte restaurant"],
      rating: 0,
      reviews: 0,
      km: 0,
      avg: dishes.length ? Math.round(sum / dishes.length) : 0,
      time: "25–40 min",
      fee: 500,
      hours: place.hours || "11:00 – 22:00",
      open: [0, 24],
      lat: hub.lat,
      lng: hub.lng,
      img: IMG,
      body: (place.address ? place.address + " " : "") + "Les commandes partent dans la cuisine de ce restaurant.",
      menu: dishes,
      comments: [],
      paused: !!place.paused,
      phone: place.phone || "",
      countryCode: place.country_code
    };
  }

  function loadCatalog() {
    var api = window.YCBackend && YCBackend.reader ? YCBackend.reader() : null;
    if (!api) return Promise.resolve(catalog);
    return api.from("partner_places").select("id,name,city,country_code,area,address,phone,hours,paused,partner_dishes(id,name,description,price,grp,available)").then(function (res) {
      if (res.error) return catalog;
      catalog = res.data || [];
      catalogReady = true;
      return catalog;
    }).catch(function () { return catalog; });
  }

  function cards() { return catalog.map(toCard); }
  function card(id) {
    if (String(id || "").indexOf("kp-") !== 0) return null;
    var pid = String(id).slice(3);
    var place = null;
    catalog.forEach(function (p) { if (p.id === pid) place = p; });
    return place ? toCard(place) : null;
  }

  function placeOrder(placeId, items, note, method, fee) {
    var api = window.YCBackend && YCBackend.api ? YCBackend.api() : null;
    if (!api) return Promise.resolve(fail("Connectez-vous pour commander dans ce restaurant."));
    var rows = (items || []).map(function (i) { return { id: i.id, qty: i.qty }; });
    return api.rpc("place_partner_order", {
      p_place: placeId,
      p_items: rows,
      p_note: String(note || "").slice(0, 300),
      p_method: method,
      p_fee: fee
    }).then(function (res) {
      if (res.error) return fail("Commande impossible.");
      return res.data || fail("Commande impossible.");
    }).catch(function () { return fail("Commande impossible. Vérifiez le réseau."); });
  }

  function myPlace() {
    if (mine) return Promise.resolve(mine);
    var c = ensure();
    if (!c) return Promise.resolve(null);
    return session().then(function (s) {
      if (!s) return null;
      return c.from("partner_access").select("place_id,login_id").eq("auth_user_id", s.user.id).maybeSingle().then(function (acc) {
        if (!acc.data) return null;
        return c.from("partner_places").select("id,name,city,area,address,phone,hours,paused").eq("id", acc.data.place_id).maybeSingle().then(function (row) {
          if (!row.data) return null;
          mine = row.data;
          mine.login_id = acc.data.login_id;
          return mine;
        });
      });
    });
  }

  function orders() {
    var c = ensure();
    return myPlace().then(function (p) {
      if (!c || !p) return [];
      return c.from("partner_orders").select("id,number,client_name,items,total,status,method,note,created_at").eq("place_id", p.id).order("created_at", { ascending: false }).limit(40).then(function (res) {
        return res.data || [];
      });
    });
  }

  function advance(id, status) {
    var c = ensure();
    var allowed = { "En préparation": 1, "Prête": 1, "Livrée": 1, "Annulée": 1 };
    if (!c || !allowed[status]) return Promise.resolve(fail("Statut refusé."));
    return c.from("partner_orders").update({ status: status }).eq("id", id).then(function (res) {
      return res.error ? fail("Mise à jour impossible.") : { ok: true };
    });
  }

  function dishes() {
    var c = ensure();
    return myPlace().then(function (p) {
      if (!c || !p) return [];
      return c.from("partner_dishes").select("id,name,description,price,grp,available").eq("place_id", p.id).order("created_at", { ascending: true }).then(function (res) {
        return res.data || [];
      });
    });
  }

  function addDish(fields) {
    var c = ensure();
    fields = fields || {};
    var name = String(fields.name || "").trim().slice(0, 80);
    var price = Math.round(Number(fields.price) || 0);
    var grp = fields.group === "Entrées" || fields.group === "Boissons" ? fields.group : "Plats";
    if (name.length < 1 || price < 1 || price > 500000) return Promise.resolve(fail("Nom et prix requis."));
    return myPlace().then(function (p) {
      if (!c || !p) return fail("Reconnectez-vous à la cuisine.");
      return c.from("partner_dishes").insert({
        place_id: p.id,
        name: name,
        description: String(fields.description || "").trim().slice(0, 200),
        price: price,
        grp: grp,
        available: true
      }).then(function (res) {
        return res.error ? fail("Le plat n'a pas pu être ajouté.") : { ok: true };
      });
    });
  }

  function deleteDish(id) {
    var c = ensure();
    if (!c || !/^[0-9a-f-]{36}$/i.test(String(id || ""))) return Promise.resolve(fail("Plat introuvable."));
    return c.from("partner_dishes").delete().eq("id", id).then(function (res) {
      return res.error ? fail("Retrait impossible.") : { ok: true };
    });
  }

  function setPaused(paused) {
    var c = ensure();
    return myPlace().then(function (p) {
      if (!c || !p) return fail("Reconnectez-vous à la cuisine.");
      return c.from("partner_places").update({ paused: !!paused }).eq("id", p.id).then(function (res) {
        if (res.error) return fail("La pause n'a pas été enregistrée.");
        p.paused = !!paused;
        return { ok: true };
      });
    });
  }

  function setHours(hours) {
    var c = ensure();
    var text = String(hours || "").trim().slice(0, 80);
    if (text.length < 3) return Promise.resolve(fail("Indiquez les horaires."));
    return myPlace().then(function (p) {
      if (!c || !p) return fail("Reconnectez-vous à la cuisine.");
      return c.from("partner_places").update({ hours: text }).eq("id", p.id).then(function (res) {
        if (res.error) return fail("Horaires non enregistrés.");
        p.hours = text;
        return { ok: true };
      });
    });
  }

  window.YCKitchen = {
    emailFor: emailFor,
    restore: restore,
    session: session,
    signIn: signIn,
    signOut: signOut,
    loadCatalog: loadCatalog,
    ready: function () { return catalogReady; },
    cards: cards,
    card: card,
    placeOrder: placeOrder,
    place: myPlace,
    orders: orders,
    advance: advance,
    dishes: dishes,
    addDish: addDish,
    deleteDish: deleteDish,
    setPaused: setPaused,
    setHours: setHours
  };
})();
