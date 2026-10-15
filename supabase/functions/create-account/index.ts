import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 120) {
    return json({ ok: false, message: "Adresse e-mail invalide." }, 400);
  }
  if (password.length < 10 || password.length > 72 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return json({ ok: false, message: "Le mot de passe doit contenir au moins 10 caractères, avec une lettre et un chiffre." }, 400);
  }
  if (fullName.length < 2) return json({ ok: false, message: "Indiquez votre nom." }, 400);

  return json({ ok: false, message: "Confirmez votre e-mail avec le code reçu pour ouvrir le compte." }, 400);
});
