// Vérifie Face ID / empreinte (WebAuthn) et le code PIN.
// La clé publique est conservée. Aucune image biométrique ne transite.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { verifyAuthenticationResponse, verifyRegistrationResponse } from "npm:@simplewebauthn/server@13.1.1";

const ORIGINS = [
  "https://mouhsine229.github.io",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
  "http://127.0.0.1:4174",
  "http://localhost:4174",
];
const RP_IDS = ["mouhsine229.github.io", "127.0.0.1", "localhost"];
let cors: Record<string, string> = {
  "Access-Control-Allow-Origin": "https://mouhsine229.github.io",
  Vary: "Origin",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function useCors(req: Request) {
  const origin = req.headers.get("origin") || "";
  cors = {
    "Access-Control-Allow-Origin": ORIGINS.indexOf(origin) >= 0 ? origin : "https://mouhsine229.github.io",
    Vary: "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
function bytesToB64(bytes: Uint8Array) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
function b64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function randomChallenge() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToB64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function utf8b64url(text: string) {
  return bytesToB64(new TextEncoder().encode(text)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function rpOf(origin: string) {
  if (!ORIGINS.includes(origin)) return "";
  try { return new URL(origin).hostname; } catch { return ""; }
}

Deno.serve(async (req) => {
  useCors(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, message: "Méthode refusée." }, 405);
  const raw = await req.text();
  if (raw.length > 100000) return json({ ok: false, message: "Requête trop volumineuse." }, 413);

  const url = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!url || !serviceKey) return json({ ok: false, message: "Service indisponible." }, 500);
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const userRes = jwt ? await admin.auth.getUser(jwt) : { data: { user: null }, error: { message: "missing" } };
  const user = userRes.data && userRes.data.user;
  if (!user) return json({ ok: false, message: "Connectez-vous." }, 401);

  let body: Record<string, unknown> = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { return json({ ok: false, message: "Requête illisible." }, 400); }
  const action = String(body.action || "");

  async function issueChallenge(purpose: "register" | "confirm") {
    const challenge = randomChallenge();
    await admin.from("webauthn_challenges").delete().eq("user_id", user.id).lt("expires_at", new Date().toISOString());
    const ins = await admin.from("webauthn_challenges").insert({
      user_id: user.id,
      challenge,
      purpose,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });
    if (ins.error) return "";
    return challenge;
  }
  async function takeChallenge(purpose: "register" | "confirm") {
    const found = await admin.from("webauthn_challenges").select("id,challenge").eq("user_id", user.id).eq("purpose", purpose).gt("expires_at", new Date().toISOString()).order("id", { ascending: false }).limit(1);
    const row = found.data && found.data[0];
    if (!row) return "";
    await admin.from("webauthn_challenges").delete().eq("id", row.id);
    return String(row.challenge || "");
  }
  async function grant() {
    const ins = await admin.from("auth_confirmations").insert({
      user_id: user.id,
      expires_at: new Date(Date.now() + 90 * 1000).toISOString(),
    });
    return !ins.error;
  }

  try {
    if (action === "begin-register" || action === "begin-confirm") {
      const rpId = rpOf(String(body.origin || ""));
      if (!rpId) return json({ ok: false, message: "Cette adresse ne peut pas enregistrer l'appareil." }, 400);
      const purpose = action === "begin-register" ? "register" : "confirm";
      const keys = await admin.from("device_keys").select("credential_id").eq("user_id", user.id);
      const ids = (keys.data || []).map((row) => String(row.credential_id));
      if (purpose === "confirm" && !ids.length) return json({ ok: false, message: "Aucun appareil enregistré." }, 400);
      const challenge = await issueChallenge(purpose);
      if (!challenge) return json({ ok: false, message: "Confirmation impossible pour le moment." }, 500);
      const profile = await admin.from("profiles").select("full_name,email").eq("id", user.id).maybeSingle();
      return json({
        ok: true,
        challenge,
        rpId,
        userId: utf8b64url(user.id),
        userName: (profile.data && profile.data.email) || user.email || user.id,
        displayName: (profile.data && profile.data.full_name) || "YOUSS CONNECT",
        exclude: purpose === "register" ? ids : [],
        allow: purpose === "confirm" ? ids : [],
      });
    }

    if (action === "finish-register") {
      const challenge = await takeChallenge("register");
      if (!challenge) return json({ ok: false, message: "La demande a expiré. Réessayez." }, 400);
      const kind = body.kind === "face" ? "face" : "fingerprint";
      const verification = await verifyRegistrationResponse({
        response: body.credential,
        expectedChallenge: challenge,
        expectedOrigin: ORIGINS,
        expectedRPID: RP_IDS,
        requireUserVerification: true,
      });
      if (!verification.verified || !verification.registrationInfo) return json({ ok: false, message: "L'appareil n'a pas confirmé." }, 400);
      const cred = verification.registrationInfo.credential;
      const publicKey = cred.publicKey instanceof Uint8Array ? bytesToB64(cred.publicKey) : "";
      if (!cred.id || !publicKey) return json({ ok: false, message: "Clé de l'appareil illisible." }, 400);
      const saved = await admin.from("device_keys").insert({
        user_id: user.id,
        credential_id: cred.id,
        public_key: publicKey,
        counter: Number(cred.counter || 0),
        kind,
      });
      if (saved.error) return json({ ok: false, message: "Cet appareil est déjà enregistré." }, 400);
      return json({ ok: true, kind });
    }

    if (action === "finish-confirm") {
      const challenge = await takeChallenge("confirm");
      if (!challenge) return json({ ok: false, message: "La demande a expiré. Réessayez." }, 400);
      const credId = body.credential && typeof body.credential === "object" ? String((body.credential as { id?: string }).id || "") : "";
      const stored = await admin.from("device_keys").select("credential_id,public_key,counter").eq("user_id", user.id).eq("credential_id", credId).maybeSingle();
      if (!stored.data) return json({ ok: false, message: "Cet appareil n'est pas enregistré sur le compte." }, 400);
      const verification = await verifyAuthenticationResponse({
        response: body.credential,
        expectedChallenge: challenge,
        expectedOrigin: ORIGINS,
        expectedRPID: RP_IDS,
        requireUserVerification: true,
        credential: {
          id: stored.data.credential_id,
          publicKey: b64ToBytes(stored.data.public_key),
          counter: Number(stored.data.counter || 0),
        },
      });
      if (!verification.verified) return json({ ok: false, message: "Biométrie refusée." }, 400);
      const next = verification.authenticationInfo ? Number(verification.authenticationInfo.newCounter || 0) : 0;
      await admin.from("device_keys").update({ counter: next }).eq("user_id", user.id).eq("credential_id", credId);
      if (!(await grant())) return json({ ok: false, message: "Confirmation impossible." }, 500);
      return json({ ok: true });
    }

    if (action === "pin") {
      const pin = String(body.pin || "");
      if (!/^\d{4}$/.test(pin)) return json({ ok: false, message: "Saisissez les 4 chiffres du code." }, 400);
      const anon = Deno.env.get("SUPABASE_ANON_KEY") || "";
      if (!anon) return json({ ok: false, message: "Confirmation impossible." }, 500);
      const userClient = createClient(url, anon, {
        global: { headers: { Authorization: "Bearer " + jwt } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const checked = await userClient.rpc("apply_pin", { p_pin: pin, p_next: null, p_grant: true });
      const data = (checked.data || {}) as { ok?: boolean; message?: string };
      if (checked.error || !data.ok) return json({ ok: false, message: data.message || "Code PIN incorrect." }, 400);
      return json({ ok: true });
    }

    return json({ ok: false, message: "Action inconnue." }, 400);
  } catch (err) {
    console.error("device-auth", err instanceof Error ? err.message : "error");
    return json({ ok: false, message: "La vérification de l'appareil a échoué." }, 400);
  }
});
