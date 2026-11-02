// Anonymous visitor counter for Kiko HQ (no cookies, no personal data stored).
// Each page view sends a tiny beacon here; we keep daily totals in Netlify Blobs:
// views, unique visitors (a daily-rotating one-way hash, never the IP itself),
// pages, where people came from, device type and key actions (book clicks etc).
import crypto from "node:crypto";
import { db } from "../lib/store.js";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|axios|node-fetch|facebookexternalhit|embedly|whatsapp|telegram|discord|semrush|ahrefs|bing|yandex|baidu|pingdom|uptime/i;
const EVENTS = new Set(["book_click", "booking_step", "booking_enquiry_submit", "form_submit", "deposit_checkout", "video_sound_on", "photo_open"]);
const ok = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
const cap = (obj, max = 60) => { const k = Object.keys(obj); if (k.length > max) { k.sort((a, b) => obj[a] - obj[b]).slice(0, k.length - max).forEach((x) => delete obj[x]); } };

const dayAU = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

function source(ref, utm) {
  if (utm) return String(utm).toLowerCase().slice(0, 40);
  if (!ref || ref === "direct") return "direct";
  try {
    const h = new URL(ref).hostname.replace(/^www\.|^m\.|^l\./, "");
    if (/kikothekasadragon\.com$|netlify\.app$/.test(h)) return "";            // internal navigation
    if (/google\./.test(h)) return "google";
    if (/facebook\.com|fb\.com/.test(h)) return "facebook";
    if (/instagram\.com/.test(h)) return "instagram";
    if (/tiktok\.com/.test(h)) return "tiktok";
    return h.slice(0, 40);
  } catch { return "other"; }
}

export default async (req) => {
  if (req.method !== "POST") return ok();
  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return ok();
  let b = {};
  try { b = JSON.parse((await req.text()).slice(0, 2000)); } catch { return ok(); }
  const path = String(b.p || "/").split("?")[0].slice(0, 80);
  if (/^\/(admin|\.netlify)/.test(path)) return ok();
  const ev = String(b.e || "view");
  if (ev !== "view" && !EVENTS.has(ev)) return ok();

  const day = dayAU();
  const ip = req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "";
  const salt = crypto.createHmac("sha256", "kiko-visits:" + (process.env.KIKO_ADMIN_PASSWORD || "kiko")).update(day).digest("hex");
  const vid = crypto.createHash("sha256").update(salt + ip + ua).digest("hex").slice(0, 12);

  try {
    const store = db(), key = `stats/${day}`;
    const s = (await store.get(key, { type: "json" })) || { day, views: 0, ids: [], pages: {}, refs: {}, devices: {}, events: {} };
    if (ev === "view") {
      s.views++;
      if (!s.ids.includes(vid) && s.ids.length < 20000) s.ids.push(vid);
      s.pages[path] = (s.pages[path] || 0) + 1;
      const src = b.first ? source(b.r, b.u) : "";
      if (src) s.refs[src] = (s.refs[src] || 0) + 1;
      if (b.first) { const dev = /Mobi|Android|iPhone/i.test(ua) ? "mobile" : /iPad|Tablet/i.test(ua) ? "tablet" : "desktop"; s.devices[dev] = (s.devices[dev] || 0) + 1; }
      cap(s.pages); cap(s.refs);
    } else {
      s.events[ev] = (s.events[ev] || 0) + 1;
    }
    await store.setJSON(key, s);
  } catch (e) { console.error("kiko-hit", e && e.message); }
  return ok();
};
