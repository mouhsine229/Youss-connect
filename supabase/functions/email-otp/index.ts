import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ORIGINS = [
  "https://mouhsine229.github.io",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
  "http://127.0.0.1:4174",
  "http://localhost:4174"
];
let cors: Record<string, string> = {
  "Access-Control-Allow-Origin": "https://mouhsine229.github.io",
  Vary: "Origin",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
function useCors(req: Request) {
  const origin = req.headers.get("origin") || "";
  cors = {
    "Access-Control-Allow-Origin": ORIGINS.indexOf(origin) >= 0 ? origin : "https://mouhsine229.github.io",
    Vary: "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
}
function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" }
  });
}

function emailOk(value: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) && value.length <= 120;
}
function passwordOk(value: string) {
  return value.length >= 10 && value.length <= 72 && /[A-Za-z]/.test(value) && /\d/.test(value);
}
function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function digestKey(label: string) {
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const raw = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(label + secret));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}
function bytesToB64(bytes: Uint8Array) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
function b64ToBytes(value: string) {
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function seal(text: string) {
  const key = await digestKey("youss-otp-seal-v1:");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text)));
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv, 0);
  out.set(ct, iv.length);
  return bytesToB64(out);
}
async function openSeal(value: string) {
  const key = await digestKey("youss-otp-seal-v1:");
  const bytes = b64ToBytes(value);
  const iv = bytes.slice(0, 12);
  const ct = bytes.slice(12);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(plain);
}
async function codeHash(email: string, purpose: string, code: string) {
  const pepper = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(pepper + "|" + purpose + "|" + email + "|" + code)
  );
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function newCode() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return String(n).padStart(6, "0");
}

async function sendMail(to: string, subject: string, code: string, intro: string) {
  const apiKey = Deno.env.get("BREVO_API_KEY") || "";
  const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL") || "";
  const senderName = Deno.env.get("BREVO_SENDER_NAME") || "YOUSS CONNECT";
  if (!apiKey || !senderEmail) return { ok: false, message: "L'envoi des codes par e-mail n'est pas encore activé." };
  const html = `<div style="font-family:Arial,sans-serif;color:#0a0a0a;line-height:1.5">
    <p>${escapeHtml(intro)}</p>
    <p style="font-size:32px;letter-spacing:8px;font-weight:700;margin:24px 0">${escapeHtml(code)}</p>
    <p>Ce code expire dans 10 minutes. S'il ne vient pas de vous, ignorez ce message.</p>
    <p style="color:#71717a;font-size:12px">YOUSS CONNECT · KYA CORPORATION</p>
  </div>`;
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html
    })
  });
  if (!res.ok) {
    console.error("brevo", res.status);
    return { ok: false, message: "Le code n'a pas pu être envoyé. Réessayez dans un instant." };
  }
  return { ok: true };
}

Deno.serve(async (req: Request) => {
  useCors(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, message: "Méthode refusée." }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch (_err) {
    return json({ ok: false, message: "Demande illisible." }, 400);
  }

  const action = String(body.action || "");
  const email = String(body.email || "").trim().toLowerCase();
  if (!emailOk(email)) return json({ ok: false, message: "Adresse e-mail invalide." }, 400);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !serviceKey || !anonKey) return json({ ok: false, message: "Envoi impossible pour le moment." }, 500);

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown").split(",")[0].trim().slice(0, 64);

  async function allow() {
    const byMail = await admin.rpc("email_otp_allow", { p_key: "mail:" + email });
    const byIp = await admin.rpc("email_otp_allow", { p_key: "ip:" + (ip || "unknown") });
    return !byMail.error && byMail.data === true && !byIp.error && byIp.data === true;
  }

  async function issue(purpose: "signup" | "reset", payload: string | null, subject: string, intro: string) {
    if (!(await allow())) return json({ ok: false, message: "Trop de demandes. Réessayez dans une heure." }, 429);
    const code = newCode();
    const hash = await codeHash(email, purpose, code);
    const saved = await admin.rpc("email_otp_save", {
      p_email: email,
      p_purpose: purpose,
      p_code_hash: hash,
      p_payload: payload,
      p_minutes: 10
    });
    if (saved.error) return json({ ok: false, message: "Le code n'a pas pu être préparé." }, 500);
    const mailed = await sendMail(email, subject, code, intro);
    if (!mailed.ok) return json({ ok: false, message: mailed.message }, 503);
    return json({ ok: true });
  }

  if (action === "send-signup" || action === "resend-signup") {
    let payload: string | null = null;
    if (action === "resend-signup") {
      const peek = await admin.rpc("email_otp_peek", { p_email: email, p_purpose: "signup" });
      if (peek.error || !peek.data) return json({ ok: false, message: "Le délai est dépassé. Reprenez l'inscription." }, 400);
      payload = String(peek.data);
    } else {
      const fullName = String(body.fullName || "").trim().slice(0, 80);
      const phone = String(body.phone || "").trim().slice(0, 24);
      const city = String(body.city || "Cotonou").trim().slice(0, 60);
      const country = String(body.country || "Bénin").trim().slice(0, 60);
      const password = String(body.password || "");
      if (fullName.length < 2) return json({ ok: false, message: "Indiquez votre nom." }, 400);
      if (!passwordOk(password)) return json({ ok: false, message: "Le mot de passe doit contenir au moins 10 caractères, avec une lettre et un chiffre." }, 400);
      const existing = await admin.rpc("auth_user_id_by_email", { p_email: email });
      if (existing.error) return json({ ok: false, message: "Inscription impossible pour le moment." }, 500);
      if (existing.data) return json({ ok: false, message: "Un compte existe déjà avec cet e-mail." }, 400);
      payload = await seal(JSON.stringify({ password, fullName, phone, city, country }));
    }
    return issue(
      "signup",
      payload,
      "Votre code de confirmation YOUSS CONNECT",
      "Utilisez ce code pour confirmer votre inscription YOUSS CONNECT."
    );
  }

  if (action === "verify-signup") {
    const code = String(body.code || "").replace(/\s/g, "");
    if (!/^\d{6}$/.test(code)) return json({ ok: false, message: "Indiquez le code à 6 chiffres." }, 400);
    const taken = await admin.rpc("email_otp_take", {
      p_email: email,
      p_purpose: "signup",
      p_code_hash: await codeHash(email, "signup", code)
    });
    const result = (taken.data || {}) as { ok?: boolean; reason?: string; payload?: string };
    if (taken.error || !result.ok) {
      const reason = result.reason || "missing";
      const message = reason === "locked"
        ? "Trop de codes incorrects. Demandez-en un nouveau."
        : "Code incorrect ou expiré. Demandez-en un nouveau.";
      return json({ ok: false, message }, 400);
    }
    let fields: { password?: string; fullName?: string; phone?: string; city?: string; country?: string };
    try {
      fields = JSON.parse(await openSeal(String(result.payload || "")));
    } catch (_err) {
      return json({ ok: false, message: "Confirmation impossible. Reprenez l'inscription." }, 400);
    }
    const password = String(fields.password || "");
    const fullName = String(fields.fullName || "").slice(0, 80);
    if (!passwordOk(password) || fullName.length < 2) return json({ ok: false, message: "Confirmation impossible. Reprenez l'inscription." }, 400);

    const slotKey = ip || "unknown";
    const slot = await admin.rpc("signup_slot", { p_key: slotKey });
    if (slot.error || slot.data !== true) return json({ ok: false, message: "Trop de comptes créés depuis ce réseau. Réessayez dans une heure." }, 429);

    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });
    if (created.error || !created.data.user) {
      const raw = (created.error && created.error.message) || "";
      const takenMail = /already|registered|exists/i.test(raw);
      return json({ ok: false, message: takenMail ? "Un compte existe déjà avec cet e-mail." : "Création du compte impossible." }, 400);
    }
    await admin.from("profiles").upsert({
      id: created.data.user.id,
      full_name: fullName,
      phone: String(fields.phone || "").slice(0, 24),
      email,
      city: String(fields.city || "Cotonou").slice(0, 60),
      country: String(fields.country || "Bénin").slice(0, 60)
    }, { onConflict: "id" });

    const tokenRes = await fetch(url + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { apikey: anonKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const token = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !token.access_token || !token.refresh_token) {
      return json({ ok: true, signedIn: false });
    }
    return json({ ok: true, signedIn: true, access_token: token.access_token, refresh_token: token.refresh_token });
  }

  if (action === "send-reset" || action === "resend-reset") {
    const generic = { ok: true, message: "Si un compte existe pour cette adresse, un code vient d'être envoyé." };
    if (!(await allow())) return json({ ok: false, message: "Trop de demandes. Réessayez dans une heure." }, 429);
    const existing = await admin.rpc("auth_user_id_by_email", { p_email: email });
    if (existing.error) return json({ ok: false, message: "Envoi impossible pour le moment." }, 500);
    if (!existing.data) return json(generic);
    const code = newCode();
    const hash = await codeHash(email, "reset", code);
    const saved = await admin.rpc("email_otp_save", {
      p_email: email,
      p_purpose: "reset",
      p_code_hash: hash,
      p_payload: null,
      p_minutes: 10
    });
    if (saved.error) return json({ ok: false, message: "Le code n'a pas pu être préparé." }, 500);
    const mailed = await sendMail(
      email,
      "Réinitialisation de votre mot de passe YOUSS CONNECT",
      code,
      "Utilisez ce code pour choisir un nouveau mot de passe YOUSS CONNECT."
    );
    if (!mailed.ok) return json({ ok: false, message: mailed.message }, 503);
    return json(generic);
  }

  if (action === "verify-reset") {
    const code = String(body.code || "").replace(/\s/g, "");
    const password = String(body.password || "");
    if (!/^\d{6}$/.test(code)) return json({ ok: false, message: "Indiquez le code à 6 chiffres." }, 400);
    if (!passwordOk(password)) return json({ ok: false, message: "Le mot de passe doit contenir au moins 10 caractères, avec une lettre et un chiffre." }, 400);
    const taken = await admin.rpc("email_otp_take", {
      p_email: email,
      p_purpose: "reset",
      p_code_hash: await codeHash(email, "reset", code)
    });
    const result = (taken.data || {}) as { ok?: boolean; reason?: string };
    if (taken.error || !result.ok) {
      const message = result.reason === "locked"
        ? "Trop de codes incorrects. Demandez-en un nouveau."
        : "Code incorrect ou expiré. Demandez-en un nouveau.";
      return json({ ok: false, message }, 400);
    }
    const uid = await admin.rpc("auth_user_id_by_email", { p_email: email });
    if (uid.error || !uid.data) return json({ ok: false, message: "Ce compte est introuvable." }, 400);
    const updated = await admin.auth.admin.updateUserById(String(uid.data), { password });
    if (updated.error) return json({ ok: false, message: "Le mot de passe n'a pas pu être changé." }, 400);
    return json({ ok: true });
  }

  return json({ ok: false, message: "Action inconnue." }, 400);
});
