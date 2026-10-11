// Private API behind Kiko HQ (/admin).
// Netlify environment variable: KIKO_ADMIN_PASSWORD  (a long password only you know)
import crypto from "node:crypto";
import Stripe from "stripe";
import { db, listAll, saveSubmission, secret, calendarToken } from "../lib/store.js";
import { recordDeposit } from "../lib/deposits.js";

const STATUSES = ["New", "Contacted", "Quoted", "Deposit paid", "Confirmed", "Completed", "Lost"];
const EDITABLE = ["name", "organisation", "email", "phone", "event_type", "event_name", "event_date", "start_time", "finish_time",
  "venue_suburb", "state", "attendance", "appearance_style", "event_details"];
const MONTH = 30 * 24 * 3600;
const attempts = new Map();

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers } });
const sign = (exp) => crypto.createHmac("sha256", secret("admin-cookie")).update(String(exp)).digest("hex");
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const sha = (v) => crypto.createHash("sha256").update(String(v)).digest("hex");
const money = (v) => { if (v === "" || v === null || v === undefined) return null; const n = Math.round(parseFloat(v) * 100) / 100; return n >= 0 && n < 1e6 ? n : null; };
const clean = (v, max = 2000) => String(v ?? "").trim().slice(0, max);

function authed(req) {
  const m = /(?:^|;\s*)kiko_admin=(\d+)\.([a-f0-9]{64})/.exec(req.headers.get("cookie") || "");
  return !!(m && Number(m[1]) > Date.now() / 1000 && same(sign(m[1]), m[2]));
}

// Backup for the webhook: every couple of minutes, ask Stripe for recent Kiko payments.
async function syncStripe(store) {
  if (!process.env.STRIPE_SECRET_KEY) return { ok: false, reason: "Stripe key not added yet" };
  const meta = (await store.get("meta/stripe-sync", { type: "json" }).catch(() => null)) || {};
  if (meta.at && Date.now() - meta.at < 120000) return { ok: true, at: meta.at, cached: true };
  const startedAt = Date.now();
  const since = meta.at ? Math.floor(meta.at / 1000) - 3 * 86400 : Math.floor(Date.now() / 1000) - 120 * 86400;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let n = 0, added = 0;
    for await (const s of stripe.checkout.sessions.list({ status: "complete", created: { gte: since }, limit: 100 })) {
      if (++n > 400) break;
      if (s.metadata && s.metadata.brand === "kiko") { const r = await recordDeposit(s); if (r === "added" || r === "orphan") added++; }
    }
    await store.setJSON("meta/stripe-sync", { at: startedAt });
    return { ok: true, at: startedAt, added };
  } catch (e) {
    console.error("stripe sync", e && e.message);
    return { ok: false, reason: "Couldn’t reach Stripe just now" };
  }
}

export default async (req) => {
  if (!process.env.KIKO_ADMIN_PASSWORD) return json({ error: "Add KIKO_ADMIN_PASSWORD in Netlify (Site configuration → Environment variables), then redeploy." }, 503);
  const url = new URL(req.url);
  let body = {};
  if (req.method === "POST") { try { body = await req.json(); } catch { body = {}; } }
  const action = body.action || url.searchParams.get("action");

  if (action === "login") {
    const ip = req.headers.get("x-nf-client-connection-ip") || "anon";
    const now = Date.now(), list = (attempts.get(ip) || []).filter((t) => now - t < 15 * 60 * 1000);
    if (list.length >= 8) return json({ error: "Too many tries. Wait 15 minutes." }, 429);
    list.push(now); attempts.set(ip, list);
    if (!same(sha(body.password || ""), sha(process.env.KIKO_ADMIN_PASSWORD))) return json({ error: "That password isn’t right." }, 401);
    attempts.delete(ip);
    const exp = Math.floor(now / 1000) + MONTH;
    return json({ ok: true }, 200, { "Set-Cookie": `kiko_admin=${exp}.${sign(exp)}; Path=/; Max-Age=${MONTH}; HttpOnly; Secure; SameSite=Lax` });
  }
  if (action === "logout") return json({ ok: true }, 200, { "Set-Cookie": "kiko_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax" });
  if (!authed(req)) return action === "list" ? json({ signedIn: false }) : json({ error: "Please sign in." }, 401);

  const store = db();

  if (action === "list") {
    const stripe = url.searchParams.get("sync") === "0" ? null : await syncStripe(store);
    const items = await listAll();
    items.sort((a, b) => String(b.created).localeCompare(String(a.created)));
    const site = process.env.URL || url.origin;
    return json({
      items, statuses: STATUSES, site, stripe,
      defaultDeposit: parseFloat(process.env.KIKO_DEPOSIT_AUD || "") || null,
      emails: !!process.env.BREVO_API_KEY,
      calendar: `${site}/.netlify/functions/kiko-calendar?t=${calendarToken()}`,
    });
  }

  if (action === "update" && req.method === "POST") {
    const key = `sub/${String(body.id || "").replace(/[^\w.-]/g, "")}`;
    const rec = await store.get(key, { type: "json" });
    if (!rec) return json({ error: "That record wasn’t found — refresh and try again." }, 404);
    const now = new Date().toISOString();
    if (body.status && STATUSES.includes(body.status) && body.status !== rec.status) {
      rec.status = body.status; (rec.history = rec.history || []).push({ at: now, status: body.status });
    }
    if (typeof body.notes === "string") rec.notes = body.notes.slice(0, 4000);
    if ("quote" in body) rec.quote = money(body.quote);
    if ("depositDue" in body) rec.depositDue = money(body.depositDue);
    if (body.data && typeof body.data === "object") {
      rec.data = rec.data || {};
      for (const k of EDITABLE) if (k in body.data) rec.data[k] = clean(body.data[k]);
    }
    rec.updated = now;
    await store.setJSON(key, rec);
    return json({ ok: true, item: rec });
  }

  if (action === "create" && req.method === "POST") {
    const d = {};
    for (const k of EDITABLE) if (body.data && body.data[k]) d[k] = clean(body.data[k]);
    if (!d.name && !d.organisation) return json({ error: "Add at least a name or organisation." }, 400);
    let ref = "";
    for (let i = 0; i < 6 && !ref; i++) {
      const r = `KIKO-P${String(crypto.randomInt(1000, 9999))}`;
      if (!(await store.get(`ref/${r}`, { type: "json" }))) ref = r;
    }
    const status = STATUSES.includes(body.status) ? body.status : "Contacted";
    const rec = { id: `manual-${Date.now()}-${crypto.randomInt(100, 999)}`, ref, form: "booking", source: "manual", created: new Date().toISOString(),
      data: d, status, notes: clean(body.notes, 4000), quote: money(body.quote), depositDue: money(body.depositDue), history: [{ at: new Date().toISOString(), status }] };
    await saveSubmission(rec);
    return json({ ok: true, item: rec });
  }

  if (action === "delete" && req.method === "POST") {
    const id = String(body.id || "").replace(/[^\w.-]/g, "");
    const rec = await store.get(`sub/${id}`, { type: "json" });
    if (!rec) return json({ ok: true });
    await store.delete(`sub/${id}`);
    if (rec.ref) await store.delete(`ref/${rec.ref}`).catch(() => {});
    return json({ ok: true });
  }

  return json({ error: "Unknown action" }, 400);
};
