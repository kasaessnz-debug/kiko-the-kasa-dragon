// Kiko dashboard database (Netlify Blobs — built into Netlify, nothing to set up).
import crypto from "node:crypto";
import { getStore, connectLambda } from "@netlify/blobs";
export { connectLambda };

export const db = () => getStore({ name: "kiko", consistency: "strong" });

export async function saveSubmission(rec) {
  const s = db();
  await s.setJSON(`sub/${rec.id}`, rec);
  if (rec.ref) await s.setJSON(`ref/${rec.ref}`, { id: rec.id });
}

export async function findByRef(ref) {
  if (!ref) return null;
  const s = db();
  const hit = await s.get(`ref/${String(ref).trim().toUpperCase()}`, { type: "json" });
  return hit ? await s.get(`sub/${hit.id}`, { type: "json" }) : null;
}

export async function listAll() {
  const s = db();
  const { blobs } = await s.list({ prefix: "sub/" });
  const out = [];
  for (let i = 0; i < blobs.length; i += 25) {   // small batches = fast without hammering the store
    const part = await Promise.all(blobs.slice(i, i + 25).map((b) => s.get(b.key, { type: "json" }).catch(() => null)));
    out.push(...part.filter(Boolean));
  }
  return out;
}

// Secret derived from the dashboard password: signs the login cookie and the private calendar link.
export const secret = (label) =>
  crypto.createHmac("sha256", "kiko:" + (process.env.KIKO_ADMIN_PASSWORD || "")).update(label).digest("hex");
export const calendarToken = () => secret("calendar-feed").slice(0, 32);

// Event times are typed in the venue's local time; convert to UTC for calendars.
export const TZ = { NSW: "Australia/Sydney", ACT: "Australia/Sydney", VIC: "Australia/Melbourne", TAS: "Australia/Hobart",
  QLD: "Australia/Brisbane", SA: "Australia/Adelaide", NT: "Australia/Darwin", WA: "Australia/Perth" };

export function localToUTC(date, time, state) {
  const tz = TZ[state] || "Australia/Sydney";
  const guess = new Date(`${date}T${time}:00Z`);
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
    .formatToParts(guess).map((p) => [p.type, p.value]));
  const asLocal = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour % 24, +parts.minute, +parts.second);
  return new Date(guess.getTime() - (asLocal - guess.getTime()));
}
