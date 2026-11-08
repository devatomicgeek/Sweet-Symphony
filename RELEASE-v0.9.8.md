# Sweet Symphony v0.9.8 — Archive Orders

- Active / Archived tabs in Orders dashboard.
- Archive and Restore buttons with confirmation.
- Orders remain in Firestore with unchanged IDs and references.
- Existing orders without an `archived` field are treated as active.
- Order managers and super admins may archive/restore.
- IMPORTANT: Publish the updated `firestore.rules` in Firebase Console > Firestore Database > Rules before using archive buttons. Uploading this rules file to GitHub Pages alone does NOT deploy security rules.
- The Orders dashboard loads the latest 100 orders across both tabs; older records are not shown until pagination is added.
- Test archive, restore, and status changes after deployment.
