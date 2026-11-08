# Sweet Symphony v0.9.8.3 - EmailJS integration

- Adds EmailJS new-order notification after successful Firestore order write.
- Adds EmailJS status-change notification after admin saves an order status.
- Email Settings controls public enable/event flags and keeps admin recipient notes private.
- EmailJS public IDs are configured in `emailjs-config.js`.
- Configure fixed recipient address in EmailJS templates, not using visitor-supplied `to_email`.
- No automatic delivery until IDs, templates, allowed domains and Email Settings are configured.
- Browser notifications are best-effort, not reliable server-side delivery. Orders stay in Firestore even if email fails.
- No Firestore rules changes required for existing `settings` and `privateSettings` permissions.

## Setup
1. EmailJS dashboard: create a Gmail email service. Copy Service ID.
2. Create New Order and Status Change templates. Set each template's **To Email** to your fixed store inbox.
3. Use template variables: `{{order_number}}`, `{{customer_name}}`, `{{customer_email}}`, `{{customer_phone}}`, `{{customer_notes}}`, `{{order_items}}`, `{{order_total}}`, `{{order_status}}` (status template needs only relevant fields).
4. In EmailJS Account, copy Public Key. Set Public Key, Service ID and two Template IDs in `emailjs-config.js`. NEVER enter a private key.
5. Restrict EmailJS allowed origins/domains to `https://devatomicgeek.github.io` if available in your account. Note this does not prevent all abuse.
6. Upload all site files to GitHub Pages, preserving the folder structure.
7. Sign in to `email-settings.html` as super admin, check Enable notifications and New orders (optionally Order status changes), then Save Preferences.
8. Submit a small test order and inspect EmailJS activity and inbox/spam. Test status changes from Orders dashboard.

**Security:** This client-side integration exposes a public EmailJS key and can be abused or blocked. Fixed recipient templates, domain restrictions and EmailJS limits reduce but do not eliminate risk. For reliable transactional mail, use a server-side service later.
