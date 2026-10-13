// Fiche PDF remise au restaurant. Le mot de passe n'est pas relu depuis la base :
// il est passé une seule fois, au moment où la console le génère.
(function () {
  "use strict";
  const WIN = {
    "é": "\\351", "è": "\\350", "ê": "\\352", "ë": "\\353",
    "à": "\\340", "â": "\\342", "ä": "\\344",
    "ù": "\\371", "û": "\\373", "ü": "\\374",
    "ô": "\\364", "ö": "\\366", "î": "\\356", "ï": "\\357",
    "ç": "\\347", "É": "\\311", "È": "\\310", "Ê": "\\312",
    "À": "\\300", "Â": "\\302", "Ù": "\\331", "Ç": "\\307",
    "Ô": "\\324", "Î": "\\316", "–": "-", "—": "-"
  };

  function pdfText(value) {
    let out = "";
    const s = String(value == null ? "" : value);
    for (let i = 0; i < s.length; i++) {
      const ch = s.charAt(i);
      if (ch === "\\") out += "\\\\";
      else if (ch === "(") out += "\\(";
      else if (ch === ")") out += "\\)";
      else if (WIN[ch]) out += WIN[ch];
      else if (ch.charCodeAt(0) < 32 || ch.charCodeAt(0) > 126) out += "?";
      else out += ch;
    }
    return out;
  }

  function line(font, size, x, y, text) {
    return "BT /" + font + " " + size + " Tf " + x + " " + y + " Td (" + pdfText(text) + ") Tj ET\n";
  }

  function build(sheet) {
    const name = String(sheet.name || "Restaurant").slice(0, 48);
    const city = String(sheet.city || "");
    const area = String(sheet.area || "");
    const login = String(sheet.loginId || "");
    const pass = String(sheet.password || "");
    const link = "https://mouhsine229.github.io/Youss-connect/#/pro";
    let stream = "";
    stream += "0.980 0.976 0.965 rg 0 0 595 842 re f\n";
    stream += "0.039 0.039 0.039 rg 0 700 595 142 re f\n";
    stream += "0.788 0.635 0.153 rg 0 700 595 6 re f\n";
    stream += "1 1 1 rg\n";
    stream += line("F2", 28, 48, 778, "YOUSS CONNECT");
    stream += line("F1", 12, 48, 748, "Se déplacer, commander, sortir et payer.");
    stream += line("F1", 11, 48, 722, "Portée par KYA CORPORATION");
    stream += "0.039 0.039 0.039 rg\n";
    stream += line("F2", 22, 48, 640, "Merci de nous rejoindre.");
    stream += line("F1", 12, 48, 612, "Votre espace cuisine est ouvert. Gardez cette fiche :");
    stream += line("F1", 12, 48, 596, "le mot de passe ne sera plus affiché.");
    stream += line("F2", 16, 48, 552, name);
    stream += line("F1", 12, 48, 532, (area ? area + ", " : "") + city);
    stream += "0.788 0.635 0.153 rg 48 470 499 2 re f\n";
    stream += "0.039 0.039 0.039 rg\n";
    stream += line("F1", 11, 48, 440, "IDENTIFIANT");
    stream += line("F2", 18, 48, 416, login);
    stream += line("F1", 11, 48, 376, "MOT DE PASSE");
    stream += line("F2", 18, 48, 352, pass);
    stream += line("F1", 11, 48, 312, "ADRESSE DE CONNEXION");
    stream += line("F1", 11, 48, 292, link);
    stream += "0.96 0.94 0.88 rg 48 168 499 78 re f\n";
    stream += "0.039 0.039 0.039 rg\n";
    stream += line("F1", 11, 64, 214, "Connectez-vous, puis gérez les commandes, le menu");
    stream += line("F1", 11, 64, 198, "et les horaires. Le paiement en ligne et les SMS");
    stream += line("F1", 11, 64, 182, "s'ouvriront avec les prestataires.");
    stream += "0.039 0.039 0.039 rg 0 0 595 48 re f\n";
    stream += "0.788 0.635 0.153 rg\n";
    stream += line("F1", 10, 48, 20, "YOUSS CONNECT  ·  Quatre villes  ·  Cotonou, Dakar, Lomé, Accra");
    return stream;
  }

  function download(sheet) {
    const content = build(sheet);
    const objects = [];
    function add(body) { objects.push(body); return objects.length; }
    add("<< /Type /Catalog /Pages 2 0 R >>");
    add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>");
    add("<< /Length " + content.length + " >>\nstream\n" + content + "endstream");
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach(function (body, i) {
      offsets.push(pdf.length);
      pdf += (i + 1) + " 0 obj\n" + body + "\nendobj\n";
    });
    const xref = pdf.length;
    pdf += "xref\n0 " + (objects.length + 1) + "\n";
    pdf += "0000000000 65535 f \n";
    for (let i = 1; i < offsets.length; i++) {
      pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    }
    pdf += "trailer << /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF";
    const blob = new Blob([pdf], { type: "application/pdf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "YOUSS-CONNECT-" + String(sheet.loginId || "cuisine") + ".pdf";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
  }

  window.YCSheet = { restaurant: download };
})();
