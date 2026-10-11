// Marks a booking "Deposit paid" the moment Stripe confirms payment, and emails you.
// Stripe → Developers → Webhooks → endpoint:
//   https://kikothekasadragon.com/.netlify/functions/kiko-stripe-webhook   event: checkout.session.completed
// Its signing secret goes into Netlify as STRIPE_KIKO_WEBHOOK_SECRET.
// Only payments tagged brand=kiko are handled, so KASA shop orders are ignored here.
// (Backup: the dashboard also checks Stripe itself, so a deposit still shows even if this webhook is missing.)
import Stripe from "stripe";
import { sendMail, esc, shell } from "../lib/brevo.js";
import { recordDeposit } from "../lib/deposits.js";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const secret = process.env.STRIPE_KIKO_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY || !secret) return new Response("not configured", { status: 503 });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let evt;
  try {
    evt = stripe.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature"), secret);
  } catch {
    return new Response("bad signature", { status: 400 });
  }
  if (evt.type !== "checkout.session.completed" && evt.type !== "checkout.session.async_payment_succeeded") return new Response("ignored");
  const s = evt.data.object;
  if (!s.metadata || s.metadata.brand !== "kiko") return new Response("not kiko");

  let result = "error";
  try { result = await recordDeposit(s); } catch (e) { console.error("dashboard update", e && e.message); }
  if (result === "known" || result === "skip") return new Response("ok"); // already handled (Stripe retries) or not paid yet

  const amount = ((s.amount_total || 0) / 100).toFixed(2);
  await sendMail({
    to: process.env.KIKO_NOTIFY_EMAIL,
    replyTo: s.customer_details && s.customer_details.email,
    subject: `Deposit paid: ${s.metadata.booking_ref} — A$${amount}`,
    html: shell(`Deposit paid · ${esc(s.metadata.booking_ref)}`, `<p><b>A$${amount}</b> received from ${esc(s.customer_details?.name || "")} (${esc(s.customer_details?.email || "")}).</p>
      <p>Event date: <b>${esc(s.metadata.event_date || "not given")}</b></p>
      <p>The booking is now marked <b>Deposit paid</b> in Kiko HQ. Confirm the details with the customer, then set it to <b>Confirmed</b>.</p>
      ${result === "orphan" ? "<p><b>Heads-up:</b> that reference wasn’t in the dashboard, so a new card was made for it.</p>" : ""}`),
  });

  // and a friendly confirmation to the customer (Stripe also sends its own receipt)
  const to = s.customer_details?.email || s.customer_email;
  const first = String(s.customer_details?.name || "").trim().split(/\s+/)[0];
  if (to) {
    await sendMail({
      to, replyTo: process.env.KIKO_NOTIFY_EMAIL,
      subject: `Deposit received — Kiko is booked! (${s.metadata.booking_ref})`,
      html: shell("Your Kiko date is locked in!", `<p>Hi ${esc(first || "there")},</p>
        <p>We’ve received your deposit of <b>A$${amount}</b> for booking <b>${esc(s.metadata.booking_ref)}</b>${s.metadata.event_date ? ` on <b>${esc(s.metadata.event_date)}</b>` : ""}. Thank you!</p>
        <p>Your date is now held for Kiko. We’ll be in touch before the event to confirm timings, arrival details and anything else Kiko needs to know.</p>
        <p>Your payment receipt comes separately from Stripe. Any questions, just reply to this email.</p>
        <p>Big smiles,<br>Kiko — The KASA Dragon 🐉</p>`),
    });
  }
  return new Response("ok");
};
