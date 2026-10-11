// Records a paid Kiko deposit against its booking. Used by the Stripe webhook (instant)
// and by the dashboard's Stripe check (backup, so a paid deposit can never go missing).
import { db, findByRef } from "./store.js";

const EARLY = ["New", "Contacted", "Quoted"];

// returns "added" | "known" | "orphan" (paid for a reference that isn't in the dashboard)
export async function recordDeposit(s) {
  if (!s || !s.metadata || s.metadata.brand !== "kiko" || s.payment_status !== "paid") return "skip";
  const store = db();
  const ref = String(s.metadata.booking_ref || "").trim().toUpperCase();
  const pay = { amount: (s.amount_total || 0) / 100, paidAt: new Date((s.created || Date.now() / 1000) * 1000).toISOString(),
    session: s.id, email: s.customer_details?.email || s.customer_email || "", name: s.customer_details?.name || "" };
  const rec = await findByRef(ref);
  if (rec) {
    rec.payments = rec.payments || (rec.deposit ? [{ ...rec.deposit }] : []);
    if (rec.payments.some((p) => p.session === s.id)) return "known";
    rec.payments.push(pay);
    rec.deposit = { amount: rec.payments.reduce((t, p) => t + (p.amount || 0), 0), paidAt: pay.paidAt, session: s.id, email: pay.email };
    if (EARLY.includes(rec.status)) {
      rec.status = "Deposit paid";
      (rec.history = rec.history || []).push({ at: new Date().toISOString(), status: "Deposit paid" });
    }
    await store.setJSON(`sub/${rec.id}`, rec);
    return "added";
  }
  const id = `dep-${s.id}`;
  if (await store.get(`sub/${id}`, { type: "json" })) return "known";
  await store.setJSON(`sub/${id}`, {
    id, ref, form: "deposit", created: pay.paidAt, status: "Deposit paid", deposit: { ...pay }, payments: [pay], history: [],
    data: { name: pay.name, email: pay.email, phone: s.customer_details?.phone || "", event_date: s.metadata.event_date || "" },
    notes: `Deposit paid with reference "${ref}", which wasn’t found in the dashboard — check who this is.`,
  });
  return "orphan";
}
