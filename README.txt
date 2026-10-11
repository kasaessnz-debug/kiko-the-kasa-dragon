KIKO — THE KASA DRAGON · WEBSITE + KIKO HQ
==========================================

WHERE THINGS LIVE
- Website:      https://kikothekasadragon.com
- Kiko HQ:      https://kikothekasadragon.com/admin   (your private dashboard)
- Code:         github.com/kasaessnz-debug/kiko-the-kasa-dragon  -> Netlify redeploys on every push

GO-LIVE CHECKLIST (Netlify -> your Kiko site)
1. Domain: Domain management -> Add a domain -> kikothekasadragon.com.
   Follow Netlify's DNS steps where you bought the domain. HTTPS turns on by itself.
2. Forms: Forms -> Enable form detection. Then Deploys -> Trigger deploy -> Deploy site.
   (Without this, enquiries can't be received. Do it once.)
3. Environment variables: Site configuration -> Environment variables -> Add:
     KIKO_ADMIN_PASSWORD   a long password only you know (opens Kiko HQ)
     STRIPE_SECRET_KEY     the same sk_live_ key the KASA site uses
     KIKO_DEPOSIT_AUD      your standard deposit in dollars, e.g. 150
     KASA_ABN              optional, printed on the deposit tax invoice
     STRIPE_KIKO_WEBHOOK_SECRET   from step 4
     BREVO_API_KEY, KIKO_FROM_EMAIL, KIKO_NOTIFY_EMAIL, BREVO_LIST_ID   from step 5
   After adding or changing variables: Deploys -> Trigger deploy.
4. Stripe webhook (instant "deposit paid"):
   Stripe -> Developers -> Webhooks -> Add destination -> event checkout.session.completed
   URL: https://kikothekasadragon.com/.netlify/functions/kiko-stripe-webhook
   Copy its signing secret (whsec_...) into STRIPE_KIKO_WEBHOOK_SECRET.
   Backup: Kiko HQ also checks Stripe itself every couple of minutes, so a paid deposit
   still shows even if the webhook ever fails.
5. Brevo (automatic emails — optional, same Brevo account as KASA):
   a) Senders, Domains & Dedicated IPs -> Domains -> Add kikothekasadragon.com,
      add the DNS records it shows where you bought the domain, click Verify.
   b) Senders -> Add hello@kikothekasadragon.com (or similar).
   c) SMTP & API -> API keys -> Generate "Kiko website" -> paste into BREVO_API_KEY.
   d) Optional: Contacts -> Lists -> create "Kiko" -> its ID number into BREVO_LIST_ID.
      KIKO_FROM_EMAIL   = the sender from (b)
      KIKO_NOTIFY_EMAIL = where you want new-enquiry alerts
6. Contact details: edit assets/js/config.js (email, phone, socials, GA4, Meta Pixel).
   Anything left blank stays hidden.
7. Test once: send yourself a booking on the website, open Kiko HQ, set a $1 deposit on
   that booking, pay it from the deposit link, then refund it in Stripe.

KIKO HQ (DASHBOARD) — WHAT IT DOES
- Every booking, message and shop sign-up lands here instantly (and in Netlify -> Forms).
- Bookings tab: status (New -> Contacted -> Quoted -> Deposit paid -> Confirmed -> Completed),
  quote total, deposit for that booking (otherwise the standard one), balance left,
  private notes, every field the customer sent, edit dates/times if they change.
- "Email quote" opens a ready-written quote email with the deposit link and marks it Quoted.
- Deposits paid online switch the booking to "Deposit paid" by themselves.
- Calendar tab: month view; green = booked, dashed = enquiry/quote; pink day = two bookings.
  Tap an empty day to add a phone/email booking.
- "Kiko bookings on your phone": subscribe once (Google Calendar or iPhone) and booked events
  appear in your phone calendar with a reminder the day before.
- To do list: who to reply to, quotes to chase, deposits to confirm, events to wrap up.
- Export: spreadsheet (CSV) of the current tab.
- On your phone: open /admin in Safari/Chrome -> Share -> Add to Home Screen = Kiko HQ app.
- Staying signed in: 30 days per device. Changing KIKO_ADMIN_PASSWORD signs everyone out
  and changes the private calendar link.

PAGES
index, about, adventures, gives-back, book, deposit, gallery, shop, contact, thank-you,
404, privacy, terms, admin. Privacy Policy and Terms are drafts — have them checked, and
add your deposit/cancellation policy to Terms.
