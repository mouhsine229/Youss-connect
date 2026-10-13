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

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const fullName = String(body.fullName || "").trim().slice(0, 80);
  const phone = String(body.phone || "").trim().slice(0, 24);
  const city = String(body.city || "Cotonou").trim().slice(0, 60);
  const country = String(body.country || "Bénin").trim().slice(0, 60);

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 120) {
    return json({ ok: false, message: "Adresse e-mail invalide." }, 400);
  }
  if (password.length < 10 || password.length > 72 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return json({ ok: false, message: "Le mot de passe doit contenir au moins 10 caractères, avec une lettre et un chiffre." }, 400);
  }
  if (fullName.length < 2) return json({ ok: false, message: "Indiquez votre nom." }, 400);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ ok: false, message: "Création du compte impossible." }, 500);

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown").split(",")[0].trim().slice(0, 64);
  const slot = await admin.rpc("signup_slot", { p_key: ip || "unknown" });
  if (slot.error || slot.data !== true) {
    return json({ ok: false, message: "Trop de comptes créés depuis ce réseau. Réessayez dans une heure." }, 429);
  }

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (created.error || !created.data.user) {
    const raw = (created.error && created.error.message) || "";
    const taken = /already|registered|exists/i.test(raw);
    return json({ ok: false, message: taken ? "Un compte existe déjà avec cet e-mail." : "Création du compte impossible." }, 400);
  }

  await admin.from("profiles").update({
    full_name: fullName,
    phone,
    email,
    city,
    country
  }).eq("id", created.data.user.id);

  return json({ ok: true });
});
