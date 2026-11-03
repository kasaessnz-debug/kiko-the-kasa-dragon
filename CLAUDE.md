# Kiko — The KASA Dragon: project notes

Global rules live in the owner's own CLAUDE.md. This file is blocked from the public site by a rule in `netlify.toml`.

## Email list rule
Only two things add someone to the Kiko Brevo list (`BREVO_LIST_ID`): the shop `kiko-updates` sign-up, and the unticked box on the booking form (`news_optin`). Contact and deposit forms never do. Don't add age pop-ups or collect birthdates.

## Delete someone's details
Same steps are shown in Kiko HQ, in the side panel. Keep the two in step.

1. **Kiko HQ** (/admin): search their name or email, open each record, tap Delete, then tap again. Check Bookings, Messages and Shop sign-ups.
2. **Netlify Forms**: Netlify → kikothebriko → Forms. Open booking, contact and kiko-updates, tick their submission, choose Delete submission. Also check Spam submissions in the same menu.
3. **Brevo**: Contacts → search their email → delete the contact. The account is shared with KASA, so this removes them from KASA lists too.
4. **Your inbox**: delete the enquiry alert emails about them.
5. **Paid a deposit?** Stripe and tax records stay. Tell the parent what you kept and why.
6. **Reply** to confirm it's done.
