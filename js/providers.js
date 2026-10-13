// Points de branchement. Gozem, inDrive, WeDrive, SMS et paiement en ligne
// ne sont pas connectés : une demande réelle est enregistrée, rien n'est débité
// et aucun chauffeur fictif n'est envoyé.
(function () {
  "use strict";

  function pack(payload) {
    var p = payload || {};
    var from = p.from || {};
    var to = p.to || {};
    return {
      fromName: String(from.name || "").slice(0, 80),
      toName: String(to.name || "").slice(0, 80),
      fromLat: Number(from.lat) || null,
      fromLng: Number(from.lng) || null,
      toLat: Number(to.lat) || null,
      toLng: Number(to.lng) || null,
      vehicle: String(p.vehicle || "").slice(0, 24),
      price: Math.round(Number(p.price) || 0),
      method: String(p.method || "").slice(0, 20)
    };
  }
  function saveRequest(kind, payload) {
    var api = window.YCBackend && YCBackend.reader && YCBackend.reader();
    if (!api || !YCBackend.isLive()) return Promise.resolve({ ok: false, reason: "local" });
    var body = pack(payload);
    return api.from("service_requests").insert({
      kind: kind === "delivery" ? "delivery" : "ride",
      provider: "pending",
      status: "waiting_partner",
      payload: body
    }).select("id").single().then(function (res) {
      if (res.error) return { ok: false, message: res.error.message || "Demande impossible." };
      return { ok: true, id: res.data.id };
    });
  }

  function cancel(id) {
    var api = window.YCBackend && YCBackend.api ? YCBackend.api() : null;
    if (!api || !/^[0-9a-f-]{36}$/i.test(String(id || ""))) return Promise.resolve();
    return api.from("service_requests").update({ status: "cancelled" }).eq("id", id);
  }

  window.YCProviders = {
    ride: { ids: ["gozem", "indrive", "wedrive"], connected: false },
    sms: { connected: false },
    payment: { connected: false },
    saveRequest: saveRequest,
    cancel: cancel
  };
})();
