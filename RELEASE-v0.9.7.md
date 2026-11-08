# Sweet Symphony v0.9.7

New customer order references: `SS-YYYYMMDD-XXXXXX` (six random characters, Philippine date). No Cloud Functions needed. The reference is the Firestore document ID and orderNumber field, so the existing admin Orders page shows it automatically.

## Collision handling

References use six cryptographically random characters from a 32-character alphabet. Firestore rules allow customers to create orders, not overwrite existing orders. A very rare collision will fail safely and the customer can retry submission. A browser-only implementation cannot securely guarantee gap-free sequential numbers or perfectly distinguish collisions from other permission failures.

## Deploy

Upload extracted files to the GitHub Pages repository root. No Firestore rule changes are needed if existing v0.9.6 rules are published. Keep Anonymous sign-in enabled. Test a new order, confirm the reference and check Firestore > orders. Previous orders are unchanged.

Live Firebase not tested.
