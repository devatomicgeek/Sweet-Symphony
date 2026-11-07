# Sweet Symphony v0.9.2

Static GitHub Pages storefront, Google-authenticated role-based admin pages, browser-only Firebase Firestore checkout, URL-only images, and saved email notification preferences.

**Email delivery is NOT enabled in this release.** Recipient preferences are stored for later provider integration. Firestore cannot send emails on its own. No Node.js installation is needed for this release.

Read `SETUP-v0.9.2.md` before publishing. Checkout requires Firebase Anonymous Authentication and the included Firestore rules. **Browser-only checkout can be abused by automated clients; it is not equivalent to a trusted payment/order backend.**


Latest release: v0.9.4. See RELEASE-v0.9.4.md for deployment and diagnostics.


v0.9.5: Published cookies are loaded from Firestore in real time. The shop displays an error when the catalog request fails instead of silently appearing empty. Homepage hero image listener from v0.9.4 is unchanged.
