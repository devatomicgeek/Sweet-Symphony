# Sweet Symphony v0.9.5

- Public shop subscribes to Firestore `products` with `published == true`.
- Homepage featured cookie uses published Firestore products; featured products take priority.
- Product edits and deletions update the public catalog live.
- Shop shows an explicit error on Firestore permission or network failures.
- Removes hardcoded sample products from the public storefront. Existing admin starter-cookie import remains available.
- Keeps the independent v0.9.4 homepage hero listener unchanged.
- Adds versioned `app.js` imports to mitigate stale caches.

## Deployment
Upload all extracted files to GitHub Pages repository root and commit. Verify the public shop, featured cookie and homepage hero.

## Notes
Firestore `products` must have `published: true` (boolean). Rules must permit public reads of published products. Live Firebase connectivity cannot be tested in the offline package.
