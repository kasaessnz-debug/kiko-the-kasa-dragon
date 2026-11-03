// Runs automatically every time a Netlify form is submitted (Netlify calls a function with this exact name).
// 1) emails you the full enquiry with a booking reference and a ready-made deposit link
// 2) sends the customer an instant, friendly confirmation
// 3) adds them to the Brevo list only if they asked: the shop sign-up, or the unticked box on the booking form
//
// Netlify environment variables:
//   BREVO_API_KEY       Brevo → SMTP & API → API keys (the same Brevo account KASA uses is fine)
//   KIKO_FROM_EMAIL     a sender verified in Brevo, e.g. hello@yourkikodomain.com.au
//   KIKO_NOTIFY_EMAIL   where new enquiries should land (your inbox)
//   BREVO_LIST_ID       optional: Brevo list number for Kiko updates
import { sendMail, addContact, esc, shell } from "../lib/brevo.js";
import { connectLambda, saveSubmission } from "../lib/store.js";

const LABELS = {
  event_type: "Event type", event_date: "Event date", state: "State", start_time: "Start", finish_time: "Finish",
  venue_suburb: "Venue / suburb", event_name: "Event name", attendance: "Attendance", appearance_style: "Appearance",
  kiko_activities: "Kiko should", event_details: "About the event", name: "Name", organisation: "Organisation",
  email: "Email", phone: "Phone", heard_about: "Heard about Kiko", news_optin: "Wants Kiko news", reason: "Reason", message: "Message",
  first_name: "First name", interest: "Interested in", utm_source: "Source", utm_medium: "Medium",
  utm_campaign: "Campaign", referrer: "Referrer", landing_page: "Landing page",
};

export const handler = async (event) => {
  try {
    const { payload } = JSON.parse(event.body || "{}");
    if (!payload) return { statusCode: 200, body: "no payload" };
    try { connectLambda(event); } catch (e) { /* local tests */ }
    const form = payload.form_name;
    const d = payload.data || {};
    const site = process.env.URL || "https://kikothekasadragon.com";
    const notify = process.env.KIKO_NOTIFY_EMAIL;
    const ref = `KIKO-${1000 + (Number(payload.number) || Math.floor(Date.now() / 1000) % 9000)}`;
    const first = String(d.name || d.first_name || "").trim().split(/\s+/)[0];

    const rows = Object.keys(LABELS)
      .filter((k) => d[k] && String(d[k]).trim())
      .map((k) => `<tr><td style="padding:4px 10px 4px 0;color:#5b7a6a;vertical-align:top">${LABELS[k]}</td><td style="padding:4px 0"><b>${esc(Array.isArray(d[k]) ? d[k].join(", ") : d[k])}</b></td></tr>`)
      .join("");
    const depositLink = `${site}/deposit?ref=${encodeURIComponent(ref)}&email=${encodeURIComponent(d.email || "")}`;

    // save to the Kiko dashboard first, so nothing is lost even if email isn't set up yet
    try {
      await saveSubmission({
        id: payload.id || `${form}-${Date.now()}`, ref: form === "booking" ? ref : "", form,
        created: payload.created_at || new Date().toISOString(), data: d, status: "New", notes: "", history: [],
      });
    } catch (e) { console.error("save submission", e && e.message); }

    if (form === "booking") {
      await sendMail({
        to: notify, replyTo: d.email,
        subject: `New Kiko booking enquiry ${ref} — ${d.event_type || "event"} ${d.event_date || ""} ${d.state || ""}`.trim(),
        html: shell(`New booking enquiry · ${ref}`, `<table style="border-collapse:collapse">${rows}</table>
          <p style="margin-top:18px"><b>When you send the quote</b>, include this deposit link (it fills in their details):<br><a href="${depositLink}">${depositLink}</a></p>
          <p style="color:#5b7a6a">Reply to this email to answer ${esc(first || "them")} directly.</p>`),
      });
      await sendMail({
        to: d.email, replyTo: notify,
        subject: `Kiko got your booking enquiry (${ref})`,
        html: shell("Rawr! Your enquiry is in.", `<p>Hi ${esc(first || "there")},</p>
          <p>Thanks for inviting Kiko to <b>${esc(d.event_name || d.event_type || "your event")}</b>${d.event_date ? ` on <b>${esc(d.event_date)}</b>` : ""}. We’ll check availability and come back to you with a quote.</p>
          <p>Your reference is <b>${ref}</b>. Keep it handy — you’ll use it to pay your deposit once you’re happy with the quote.</p>
          <p>Just a heads-up: your date isn’t locked in until the booking is confirmed.</p>
          <p>Big smiles,<br>Kiko 🐉</p>`),
      });
    } else if (form === "contact") {
      await sendMail({ to: notify, replyTo: d.email, subject: `Kiko website: ${d.reason || "message"} from ${d.name || "someone"}`, html: shell(`New message · ${esc(d.reason || "General")}`, `<table style="border-collapse:collapse">${rows}</table>`) });
      await sendMail({ to: d.email, replyTo: notify, subject: "Kiko got your message", html: shell("Thanks for saying hello!", `<p>Hi ${esc(first || "there")},</p><p>Your message reached Kiko’s team and we’ll reply soon.</p><p>Big smiles,<br>Kiko</p>`) });
    } else if (form === "kiko-updates") {
      await addContact(d.email, d.first_name, process.env.BREVO_LIST_ID);
      await sendMail({ to: notify, subject: "New Kiko shop sign-up", html: shell("New shop sign-up", `<table style="border-collapse:collapse">${rows}</table>`) });
      await sendMail({ to: d.email, subject: "You’re on Kiko’s list!", html: shell("You’re on the list!", `<p>Hi ${esc(first || "there")},</p><p>You’ll be first to hear when Kiko plush toys, books and more arrive.</p><p>Big smiles,<br>Kiko</p>`) });
    }
    // Enquiring never joins the list on its own. Contact and deposit forms have no list option.
    if (form === "booking" && d.news_optin === "yes") await addContact(d.email, first, process.env.BREVO_LIST_ID);
    return { statusCode: 200, body: "ok" };
  } catch (e) {
    console.error("submission-created", e && e.message);
    return { statusCode: 200, body: "logged" }; // never block the submission itself
  }
};
