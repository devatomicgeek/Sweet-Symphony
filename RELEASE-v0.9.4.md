# Sweet Symphony v0.9.4

## Homepage image synchronization fix
- Removed the hardcoded old Google Drive image from index.html. The initial image is a neutral placeholder.
- Added independent `homepage-image.js` which subscribes to `settings/homepage` in Firestore, and updates the hero whenever the saved URL changes.
- Removed the duplicate homepage image assignment from `app.js` to avoid competing image updates.
- When a saved image cannot load, show the placeholder instead of an obsolete photograph.
- Added browser-console diagnostics and an image status attribute (`#hero-img` -> `data-image-status`).
- Cache-busted the homepage script URLs with v0.9.4.

## Deploy
Upload all extracted files to the root of your GitHub Pages repository, replacing existing files. Do not upload the ZIP itself. Wait for GitHub Pages deployment, then refresh. The homepage must load `homepage-image.js?v=0.9.4`.

## Troubleshooting
If the placeholder remains, open browser DevTools > Console and look for `[Sweet Symphony homepage]` messages. Check the Network tab for `homepage-image.js` and Firebase CDN requests. The image requires public Firestore read access to `settings/homepage` and a publicly embeddable HTTPS image URL.

Note: The code has been syntax-checked, but live Firebase behavior must be tested after deployment.
