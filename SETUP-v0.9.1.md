# Sweet Symphony v0.9.1: Setup guide

## 1. Upload website to GitHub
Unzip the package. Upload the **contents** of `Sweet-Symphony-v0.9.1` to the root of your GitHub repository (not the containing folder). Commit changes. In Settings > Pages, select Deploy from a branch, main, /(root). Wait for your site to publish. Your site should open at `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/`.

## 2. Firebase Authentication
In Firebase Console select project `sweet-symphony-9db3d`. Go to Build > Authentication > Sign-in method > Google, enable and save. In Authentication > Settings > Authorized domains add `YOUR_USERNAME.github.io` (hostname only). Firebase's existing `firebase-config.js` is included. If you use another Firebase project, replace the config values from that project's web app settings.

## 3. Firestore
In Build > Firestore Database, create the database if needed. Open Rules, replace the entire rules text with `firestore.rules` and click Publish. These rules are essential: UI-only role checks are NOT sufficient.

## 4. Bootstrap the first Super Admin (manual one-time action)
Open `users.html` on the hosted website and click Continue with Google. An access-denied message will display your Firebase UID. Alternatively, locate your account's UID in Firebase Console > Authentication > Users. In Firestore > Data, create collection `admins`, document ID **your exact Firebase Auth UID**, with these fields:
- `email` (string): your Google email
- `role` (string): `super_admin`
- `enabled` (boolean): `true`
Reload `users.html`. The initial Super Admin must be created manually in Firebase Console; a visitor cannot self-register as an administrator.

## 5. Add separate manager accounts
Each manager must first sign in to `admin.html` or `orders.html` with their own Google account, which creates their Firebase Authentication user. Copy their UID from Firebase Console > Authentication > Users. As Super Admin, open `users.html`, enter the UID and email, select `website_manager` or `order_manager`, leave Enabled checked, and save. The email field is for display only: **authorization uses UID, role, and enabled**. Have them refresh their page.

## 6. Pages and permissions
- `admin.html`: website_manager and super_admin only; manages cookies and homepage, using **image URLs only**.
- `orders.html`: order_manager and super_admin only; views orders and changes status.
- `users.html`: super_admin only; assigns/changes roles.
Firestore rules independently enforce these permissions. Do not add roles using email addresses alone.

## 7. Test access
Use separate Google accounts or private browser windows. Confirm each manager cannot open the other dashboard or read restricted Firestore data. Check public pages in an incognito window, and check image previews. Google Drive links may not embed reliably; direct HTTPS image URLs are preferred.

## 8. Checkout limitation: backend deployment is separate
The checkout calls the Firebase Cloud Function `placeOrder`, located in `functions/index.js`. **Uploading this ZIP to GitHub Pages does not deploy that function.** Real orders will fail until the function is deployed. Deploying it normally requires Node.js, Firebase CLI, and potentially a billing-enabled Firebase project. The function also references Resend email secrets. Do not advertise live checkout until you have deployed and tested the function end-to-end. GitHub Pages and Firebase Auth/Firestore admin setup do not require Node.js.

## 9. Troubleshooting
- `auth/unauthorized-domain`: add the exact GitHub Pages hostname to Firebase Authorized domains.
- Access denied: confirm the account's UID, `admins/{UID}` fields, and published Firestore rules.
- Blank product list: ensure public products have `published: true` (boolean), and check browser console.
- Images not loading: check HTTPS and public accessibility; Google Drive may restrict embedding.
