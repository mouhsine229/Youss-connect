// Reçus téléchargeables et partageables. Aucun numéro de carte complet n'y figure.
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function money(n) {
    return window.ACStore ? ACStore.fmtFCFA(n) : (Math.round(n || 0) + " FCFA");
  }
  function fromTx(tx, extra) {
    extra = extra || {};
    const u = (window.ACState && ACState.user) || {};
    const lines = (extra.lines || []).slice();
    return {
      title: extra.title || "Reçu YOUSS CONNECT",
      ref: (tx && tx.ref) || extra.ref || ("YC-" + Date.now()),
      label: (tx && tx.label) || extra.label || "Opération",
      amount: tx ? Math.abs(Number(tx.amount) || 0) : Math.abs(Number(extra.amount) || 0),
      date: (tx && tx.date) || extra.date || new Date().toLocaleString("fr-FR"),
      method: extra.method || methodOf(tx),
      status: (tx && tx.status) || extra.status || "success",
      user: u.fullName || "",
      phone: u.phone || "",
      city: (u.city || "") + (u.country ? ", " + u.country : ""),
      lines: lines
    };
  }
  function methodOf(tx) {
    if (!tx) return "Youss Wallet";
    if (tx.meta && tx.meta.last4) return (tx.meta.brand || "Carte") + " · " + tx.meta.last4;
    if (tx.method === "cash") return "Espèces";
    if (tx.method === "mobile" || tx.external) return "Paiement mobile";
    if (tx.method === "card") return "Carte bancaire";
    return "Youss Wallet";
  }
  function statusLabel(s) {
    return s === "pending" ? "En attente" : s === "failed" ? "Échoué" : "Réussi";
  }
  function page(title, inner) {
    return "<!DOCTYPE html><html lang=\"fr\"><head><meta charset=\"utf-8\"/><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/><title>" + esc(title) + "</title><style>body{font-family:system-ui,sans-serif;background:#f4f4f5;color:#0a0a0a;margin:0;padding:24px}article{max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:28px}h1{font-size:18px;margin:0}p.sub{color:#52525b;font-size:13px;margin:4px 0 20px}.amt{font-size:32px;font-weight:800;margin:8px 0 18px}table{width:100%;border-collapse:collapse}td{padding:8px 0;border-top:1px solid #e4e4e7;font-size:14px;vertical-align:top}td:last-child{text-align:right;font-weight:650}footer{margin-top:22px;font-size:12px;color:#71717a;line-height:1.5}@media print{body{background:#fff;padding:0}article{box-shadow:none}}</style></head><body><article>" + inner + "</article></body></html>";
  }
  function html(r) {
    const rows = [
      ["Référence", r.ref],
      ["Date", r.date],
      ["Opération", r.label],
      ["Moyen", r.method],
      ["Statut", statusLabel(r.status)],
      ["Titulaire", r.user],
      ["Téléphone", r.phone],
      ["Lieu", r.city]
    ].concat(r.lines || []).filter(function (row) { return row[1]; });
    return page(r.title, "<p class=\"sub\">KYA CORPORATION · YOUSS CONNECT</p><h1>" + esc(r.title) + "</h1><p class=\"amt\">" + esc(money(r.amount)) + "</p><table>" + rows.map(function (row) { return "<tr><td>" + esc(row[0]) + "</td><td>" + esc(row[1]) + "</td></tr>"; }).join("") + "</table><footer>YOUSS CONNECT · KYA CORPORATION. Le numéro complet de carte n'est jamais inscrit sur un reçu.</footer>");
  }
  function save(filename, contents, type) {
    const blob = new Blob([contents], { type: type || "text/html;charset=utf-8" });
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }
  function fileName(ref) {
    return "recu-" + String(ref || "youss").replace(/[^\w.-]+/g, "") + ".html";
  }
  function remember(r) {
    last = r;
    try { sessionStorage.setItem("yc-receipt", JSON.stringify(r)); } catch (e) { /* privé */ }
    return r;
  }
  function download(r) {
    if (!r) r = current();
    if (!r) return false;
    remember(r);
    save(fileName(r.ref), html(r));
    return true;
  }
  function share(r) {
    if (!r) r = current();
    if (!r) return;
    remember(r);
    const text = [r.title, r.label, money(r.amount), "Réf. " + r.ref, r.date, r.method, "YOUSS CONNECT · KYA CORPORATION"].join("\n");
    if (navigator.share) {
      navigator.share({ title: r.title, text: text }).catch(function (err) {
        if (err && err.name === "AbortError") return;
        download(r);
      });
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        if (window.UI) UI.toast("Reçu copié. Le fichier est aussi téléchargé.", "success");
        download(r);
      }).catch(function () { download(r); });
      return;
    }
    download(r);
  }
  function deliver(tx, extra) {
    const r = remember(fromTx(tx, extra));
    download(r);
    return r;
  }
  function statement(rows) {
    const u = (window.ACState && ACState.user) || {};
    const body = (rows || []).map(function (t) {
      return "<tr><td>" + esc(t.date || "") + "</td><td>" + esc(t.label || "") + "</td><td>" + esc(t.ref || "") + "</td><td>" + esc((t.type === "credit" ? "+" : "−") + money(Math.abs(t.amount || 0))) + "</td><td>" + esc(statusLabel(t.status)) + "</td></tr>";
    }).join("");
    const doc = page("Relevé YOUSS CONNECT", "<p class=\"sub\">" + esc(u.fullName || "") + " · " + esc(u.city || "") + "</p><h1>Historique des transactions</h1><table><tr><td>Date</td><td>Opération</td><td>Référence</td><td>Montant</td><td>Statut</td></tr>" + body + "</table><footer>YOUSS CONNECT · KYA CORPORATION.</footer>");
    save("releve-youss-connect.html", doc);
  }
  let last = null;
  function current() {
    if (last) return last;
    try { return JSON.parse(sessionStorage.getItem("yc-receipt") || "null"); } catch (e) { return null; }
  }
  window.YCReceipt = { fromTx, download, share, deliver, statement, current, remember };
})();
