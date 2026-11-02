// Kiko booking deposit → Stripe Checkout.
// Uses the SAME Stripe account as KASA Essentials (same STRIPE_SECRET_KEY),
// and tags every payment with brand=kiko so Kiko money is easy to filter in Stripe.
//
// Netlify → Site configuration → Environment variables:
//   STRIPE_SECRET_KEY   same secret key the KASA site uses (sk_live_…)
//   KIKO_DEPOSIT_AUD    the usual deposit in dollars, e.g. 150
//                       (you can set a different amount for one booking in Kiko HQ — that wins)
//   KASA_ABN            optional, printed on the tax invoice
import Stripe from "stripe";
import { findByRef } from "../lib/store.js";

const hits = new Map(); // light per-instance rate limit
function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000, max = 8;
  const list = (hits.get(ip) || []).filter((t) => now - t < win);
  list.push(now); hits.set(ip, list);
  return list.length > max;
}
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function amountFor(ref) {
  let rec = null;
  try { rec = await findByRef(ref); } catch (e) { console.error("lookup", e && e.message); }
  const custom = rec && rec.depositDue > 0 ? rec.depositDue : null;
  const fallback = parseFloat(process.env.KIKO_DEPOSIT_AUD || "");
  return { rec, amount: custom || (fallback > 0 ? fallback : null) };
}

export default async (req) => {
  const off = "Online deposits aren’t switched on yet. Reply to your quote email and we’ll send you a payment link.";
  // GET ?ref=… → shows the deposit amount on the deposit page before paying
  if (req.method === "GET") {
    const ref = String(new URL(req.url).searchParams.get("ref") || "").trim().toUpperCase().slice(0, 40);
    if (!ref || !process.env.STRIPE_SECRET_KEY) return json({});
    const { rec, amount } = await amountFor(ref);
    return json({ amount, paid: !!(rec && rec.deposit && amount && rec.deposit.amount >= amount) });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const ip = req.headers.get("x-nf-client-connection-ip") || "anon";
  if (limited(ip)) return json({ error: "Too many attempts. Please wait a few minutes and try again." }, 429);
  if (!process.env.STRIPE_SECRET_KEY) return json({ error: off }, 503);

  let body = {};
  try { body = await req.json(); } catch { return json({ error: "Something went wrong. Please try again." }, 400); }
  const ref = String(body.ref || "").trim().toUpperCase().slice(0, 40);
  const email = String(body.email || "").trim().slice(0, 120);
  if (!ref || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "Add your booking reference and email." }, 400);
  const { rec, amount: deposit } = await amountFor(ref);
  if (!deposit) return json({ error: off }, 503);
  if (rec && rec.deposit && rec.deposit.amount >= deposit) return json({ error: "This booking’s deposit is already paid — thank you! We’ll be in touch about the details." }, 409);
  const eventDate = String(body.event_date || (rec && rec.data && rec.data.event_date) || "").trim().slice(0, 20);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const site = process.env.URL || "https://kikothekasadragon.com";
  const ABN = process.env.KASA_ABN || "";
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      customer_creation: "always",
      phone_number_collection: { enabled: true },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "aud",
          unit_amount: Math.round(deposit * 100), // amount comes from Netlify settings, never from the browser
          product_data: { name: "Kiko — The KASA Dragon · Booking deposit", description: `Booking ${ref}${eventDate ? " · event date " + eventDate : ""}` },
        },
      }],
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Kiko appearance booking deposit — ${ref}`,
          footer: [`KASA Essentials Pty Ltd${ABN ? " · ABN " + ABN : ""}`, "Total includes GST where applicable.", "Kiko — The KASA Dragon is created and owned by KASA Essentials Pty Ltd."].join("\n"),
          metadata: { brand: "kiko", booking_ref: ref },
        },
      },
      custom_text: { submit: { message: "This deposit secures your date. The balance is payable as set out in your quote." } },
      metadata: { brand: "kiko", type: "booking_deposit", booking_ref: ref, event_date: eventDate, source: "kiko-website" },
      payment_intent_data: { description: `Kiko booking deposit ${ref}`, statement_descriptor_suffix: "KIKO", metadata: { brand: "kiko", booking_ref: ref, event_date: eventDate } },
      success_url: `${site}/thank-you?f=deposit&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/deposit?ref=${encodeURIComponent(ref)}`,
    });
    return json({ url: session.url });
  } catch (err) {
    console.error("create-deposit", err && err.message);
    return json({ error: "We couldn’t open the payment page. Please try again or reply to your quote email." }, 500);
  }
};
