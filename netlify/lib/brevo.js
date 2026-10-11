// Tiny Brevo (Sendinblue) mail helper shared by the Kiko functions.
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export { esc };

export async function sendMail({ to, subject, html, replyTo }) {
  const key = process.env.BREVO_API_KEY, from = process.env.KIKO_FROM_EMAIL;
  if (!key || !from || !to) return { skipped: true };
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { name: "Kiko — The KASA Dragon", email: from },
      to: [{ email: to }],
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
      subject,
      htmlContent: html,
    }),
  });
  if (!r.ok) console.error("brevo", r.status, await r.text());
  return { ok: r.ok };
}

export async function addContact(email, firstName, listId) {
  const key = process.env.BREVO_API_KEY;
  if (!key || !email || !listId) return;
  await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: { "api-key": key, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ email, attributes: firstName ? { FIRSTNAME: firstName } : {}, listIds: [Number(listId)], updateEnabled: true }),
  }).catch((e) => console.error("brevo contact", e.message));
}

export function shell(title, body) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#0f3d2a">
  <div style="background:#13843f;color:#fff;padding:18px 22px;border-radius:14px 14px 0 0;font-size:20px;font-weight:bold">${title}</div>
  <div style="background:#ffffff;border:1px solid #dfeee2;border-top:0;padding:22px;border-radius:0 0 14px 14px;font-size:15px;line-height:1.55">${body}</div>
  <p style="font-size:12px;color:#5b7a6a;text-align:center;margin-top:14px">Kiko — The KASA Dragon is created and owned by KASA Essentials Pty Ltd.</p></div>`;
}
