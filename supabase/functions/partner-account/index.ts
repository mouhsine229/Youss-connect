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

const DOMAIN = "@kitchen.youssconnect.app";
const LOGIN = /^[A-Z0-9][A-Z0-9-]{2,22}[A-Z0-9]$/;
const CITIES: Record<string, string[]> = {
  BJ: ["Cotonou", "Porto-Novo", "Ouidah", "Abomey", "Parakou", "Bohicon"],
  SN: ["Dakar", "Saint-Louis", "Thiès", "Mbour"],
  TG: ["Lomé", "Kara", "Sokodé", "Kpalimé"],
  GH: ["Accra", "Kumasi", "Takoradi", "Cape Coast"]
};
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" }
  });
}

function password() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += ALPHA[bytes[i] % ALPHA.length];
  return out;
}

function clip(value: unknown, max: number) {
  return String(value || "").trim().slice(0, max);
}

Deno.serve(async (req: Request) => {
  useCors(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, message: "Méthode refusée." }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ ok: false, message: "Création impossible." }, 500);

  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token || token === serviceKey) return json({ ok: false, message: "Connectez-vous à la console." }, 401);

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const userRes = await admin.auth.getUser(token);
  const staffId = userRes.data.user && userRes.data.user.id;
  if (!staffId) return json({ ok: false, message: "Connectez-vous à la console." }, 401);

  const staff = await admin.from("staff").select("user_id").eq("user_id", staffId).maybeSingle();
  if (staff.error || !staff.data) return json({ ok: false, message: "Réservé à la console KYA." }, 403);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch (_err) {
    return json({ ok: false, message: "Demande illisible." }, 400);
  }

  const action = String(body.action || "create");
  if (action === "reset") return reset(admin, body);
  if (action !== "create") return json({ ok: false, message: "Action inconnue." }, 400);
  return create(admin, staffId, body);
});

async function create(admin: ReturnType<typeof createClient>, staffId: string, body: Record<string, unknown>) {
  const name = clip(body.name, 80);
  const country = clip(body.countryCode, 2).toUpperCase();
  const cities = CITIES[country];
  const city = clip(body.city, 60);
  const area = clip(body.area, 80);
  const address = clip(body.address, 160);
  const phone = clip(body.phone, 24);
  const hours = clip(body.hours, 80) || "11:00 – 22:00";
  const loginId = clip(body.loginId, 24).toUpperCase();

  if (name.length < 2) return json({ ok: false, message: "Indiquez le nom du restaurant." }, 400);
  if (!cities || cities.indexOf(city) < 0) return json({ ok: false, message: "Choisissez une ville du réseau." }, 400);
  if (!LOGIN.test(loginId)) return json({ ok: false, message: "L'identifiant doit faire 4 à 24 caractères : lettres, chiffres et tirets." }, 400);

  const taken = await admin.from("partner_access").select("login_id").eq("login_id", loginId).maybeSingle();
  if (taken.data) return json({ ok: false, message: "Cet identifiant est déjà utilisé." }, 400);

  const pass = password();
  const email = loginId.toLowerCase() + DOMAIN;
  const created = await admin.auth.admin.createUser({
    email,
    password: pass,
    email_confirm: true,
    app_metadata: { role: "kitchen" },
    user_metadata: { full_name: name }
  });
  if (created.error || !created.data.user) {
    const raw = (created.error && created.error.message) || "";
    const exists = /already|registered|exists/i.test(raw);
    return json({ ok: false, message: exists ? "Cet identifiant est déjà utilisé." : "Création du compte impossible." }, 400);
  }

  const userId = created.data.user.id;
  const place = await admin.from("partner_places").insert({
    name,
    city,
    country_code: country,
    area,
    address,
    phone,
    hours,
    created_by: staffId
  }).select("id").single();
  if (place.error || !place.data) {
    await admin.auth.admin.deleteUser(userId);
    return json({ ok: false, message: "Création du restaurant impossible." }, 400);
  }

  const access = await admin.from("partner_access").insert({
    place_id: place.data.id,
    login_id: loginId,
    auth_user_id: userId
  });
  if (access.error) {
    await admin.from("partner_places").delete().eq("id", place.data.id);
    await admin.auth.admin.deleteUser(userId);
    return json({ ok: false, message: "Cet identifiant est déjà utilisé." }, 400);
  }

  await admin.from("profiles").upsert({
    id: userId,
    full_name: name,
    city,
    phone,
    email
  }, { onConflict: "id" });

  return json({
    ok: true,
    placeId: place.data.id,
    loginId,
    password: pass,
    name,
    city,
    area
  });
}

async function reset(admin: ReturnType<typeof createClient>, body: Record<string, unknown>) {
  const placeId = clip(body.placeId, 40);
  if (!/^[0-9a-f-]{36}$/i.test(placeId)) return json({ ok: false, message: "Restaurant introuvable." }, 400);
  const row = await admin.from("partner_access").select("auth_user_id, login_id, place_id").eq("place_id", placeId).maybeSingle();
  if (row.error || !row.data) return json({ ok: false, message: "Restaurant introuvable." }, 404);
  const place = await admin.from("partner_places").select("name, city, area").eq("id", placeId).maybeSingle();
  const pass = password();
  const updated = await admin.auth.admin.updateUserById(row.data.auth_user_id, { password: pass });
  if (updated.error) return json({ ok: false, message: "Nouveau mot de passe impossible." }, 400);
  const info = place.data || { name: "Restaurant", city: "", area: "" };
  return json({
    ok: true,
    placeId,
    loginId: row.data.login_id,
    password: pass,
    name: info.name,
    city: info.city,
    area: info.area || ""
  });
}
