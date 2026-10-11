// Private calendar feed: subscribe once on your phone / Google Calendar and Kiko bookings appear by themselves.
// The link (with its secret ?t=… code) is shown in Kiko HQ → Calendar → "Add to my phone calendar".
// Changing KIKO_ADMIN_PASSWORD changes the link (old links stop working).
import crypto from "node:crypto";
import { listAll, calendarToken, localToUTC } from "../lib/store.js";

const SHOW = { "Deposit paid": "CONFIRMED", Confirmed: "CONFIRMED", Completed: "CONFIRMED", Quoted: "TENTATIVE", Contacted: "TENTATIVE", New: "TENTATIVE" };
const icsText = (v) => String(v ?? "").replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/([,;])/g, "\\$1");
const stamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const fold = (line) => { // max 75 bytes per line, never splitting a character
  const out = []; let cur = "", bytes = 0;
  for (const ch of line) { const b = Buffer.byteLength(ch); if (bytes + b > 74) { out.push(cur); cur = " "; bytes = 1; } cur += ch; bytes += b; }
  out.push(cur); return out.join("\r\n");
};
const okTime = (t) => /^\d{2}:\d{2}$/.test(t || "");

export default async (req) => {
  const t = new URL(req.url).searchParams.get("t") || "";
  const good = process.env.KIKO_ADMIN_PASSWORD && t.length === 32 && crypto.timingSafeEqual(Buffer.from(t), Buffer.from(calendarToken()));
  if (!good) return new Response("Not found", { status: 404 });

  const site = process.env.URL || "https://kikothekasadragon.com";
  const items = (await listAll()).filter((i) => i.form === "booking" && SHOW[i.status] && /^\d{4}-\d{2}-\d{2}$/.test(i.data?.event_date || ""));
  const now = stamp(new Date());
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Kiko The KASA Dragon//Kiko HQ//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "X-WR-CALNAME:Kiko bookings", "X-WR-TIMEZONE:Australia/Sydney", "REFRESH-INTERVAL;VALUE=DURATION:PT1H", "X-PUBLISHED-TTL:PT1H"];

  for (const i of items) {
    const d = i.data, confirmed = SHOW[i.status] === "CONFIRMED";
    const title = `${confirmed ? "🐉 Kiko" : "❔ Kiko enquiry"}: ${d.event_name || d.event_type || d.organisation || "Event"}${d.venue_suburb ? " · " + d.venue_suburb : ""}`;
    let when;
    if (okTime(d.start_time)) {
      const start = localToUTC(d.event_date, d.start_time, d.state);
      let end = okTime(d.finish_time) ? localToUTC(d.event_date, d.finish_time, d.state) : new Date(+start + 2 * 3600e3);
      if (end <= start) end = new Date(+start + 2 * 3600e3);
      when = [`DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`];
    } else {
      const day = d.event_date.replace(/-/g, "");
      const next = new Date(d.event_date + "T00:00:00Z"); next.setUTCDate(next.getUTCDate() + 1);
      when = [`DTSTART;VALUE=DATE:${day}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, "")}`];
    }
    const desc = [`Status: ${i.status}`, i.ref && `Ref: ${i.ref}`, d.name && `Contact: ${d.name}${d.organisation ? " (" + d.organisation + ")" : ""}`,
      d.phone && `Phone: ${d.phone}`, d.email && `Email: ${d.email}`, d.attendance && `Attendance: ${d.attendance}`,
      d.appearance_style && `Appearance: ${d.appearance_style}`, i.quote != null && `Quote: A$${i.quote}`,
      i.deposit && `Deposit paid: A$${i.deposit.amount}`, i.notes && `Notes: ${i.notes}`, `Open Kiko HQ: ${site}/admin`].filter(Boolean).join("\n");
    lines.push("BEGIN:VEVENT", `UID:${i.id}@kikothekasadragon.com`, `DTSTAMP:${now}`, ...when,
      `SUMMARY:${icsText(title)}`, `LOCATION:${icsText([d.venue_suburb, d.state].filter(Boolean).join(", "))}`,
      `DESCRIPTION:${icsText(desc)}`, `STATUS:${SHOW[i.status]}`, `URL:${site}/admin`);
    if (confirmed) lines.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Kiko booking tomorrow", "TRIGGER:-P1D", "END:VALARM");
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'inline; filename="kiko-bookings.ics"', "Cache-Control": "private, max-age=300", "X-Robots-Tag": "noindex" },
  });
};
