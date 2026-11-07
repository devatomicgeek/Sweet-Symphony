# Sweet Symphony v0.9.2 — Setup

## 1. GitHub Pages
1. Back up your existing repository.
2. Extract the ZIP, open `Sweet-Symphony-v0.9.2`, upload **its contents** to the GitHub repository root. Replace old files; remove the old `functions/` folder if you do not use it.
3. Repository Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
4. Visit `https://devatomicgeek.github.io/<YOUR-REPO-NAME>/` (replace repo name with yours).

## 2. Firebase Authentication
1. Open Firebase Console → project `sweet-symphony-9db3d` → Authentication → Sign-in method.
2. Enable **Google** AND **Anonymous** sign-in. Anonymous sign-in allows customers to checkout without registering.
3. Authentication → Settings → Authorized domains: add `devatomicgeek.github.io` (hostname only, not full URL).
4. Confirm `firebase-config.js` matches the Firebase project's web app config. Never add private service-account keys to GitHub.

## 3. Firestore
1. Firebase Console → Firestore Database → create database if missing.
2. Rules → replace existing rules with the complete contents of `firestore.rules` → Publish.
3. Product collection: `/products`. The public storefront only reads published products. Use the Website dashboard to add products. If needed use **Import starter cookies** after signing in.
4. Checkout creates `/orders/{randomId}` using anonymous authentication; orders cannot be read by customers. Firestore rules validate products, prices, quantities and total. A single order supports up to **five different cookie types**, up to 99 each.

## 4. Bootstrap the first super admin
1. Open `users.html` on your GitHub Pages site and click Continue with Google.
2. Firebase Console → Authentication → Users → copy your Google user's UID.
3. Firestore → Data → create collection `admins` → document ID = exact UID. Add `email` (string), `role` (string) = `super_admin`, `enabled` (boolean) = `true`.
4. Refresh `users.html`. Only a super admin can add further administrator UID records through this page.
5. Website manager: `admin.html`; order manager: `orders.html`; super admin: both plus `users.html` and `email-settings.html`.

## 5. Email preferences (not email sending)
1. As super admin, open `email-settings.html`.
2. Enter one or more recipients and choose which events matter. Save.
3. **This does not send email.** A provider integration (such as Firebase's Trigger Email extension with a trusted notification writer, or a properly secured backend) is still required. Browser-only checkout cannot securely generate automatic email notifications with arbitrary editable recipients. Do not put SMTP passwords or API secret keys in JavaScript.

## 6. Verify before going live
1. Sign in with each role, confirm unauthorized pages and Firestore reads are denied.
2. Add a published cookie, refresh the public shop, add it to cart, and place a test order.
3. Verify order appears in Firestore and `orders.html`, and status changes save.
4. Try checkout while signed out: Anonymous sign-in should occur automatically.
5. **Important:** this version does not send order emails and has no payment processing, bot protection, rate limiting, or guaranteed spam prevention. Monitor Firestore usage and set billing/budget alerts if using Blaze. Customer data must be handled according to applicable privacy laws.

## Notes
- No Node.js or Firebase CLI is needed for these manual GitHub and Firebase Console steps.
- Browser-only order totals are checked against published Firestore product documents by security rules, but automated fake orders are still possible.
- Avoid editing published prices during an in-flight checkout; the customer may need to refresh and retry.
- Google Drive links can fail as external image sources. Use public direct HTTPS image links when possible.
