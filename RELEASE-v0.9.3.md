# Sweet Symphony v0.9.3

## Changes
- Public homepage uses the confirmed publicly accessible cookie photo as an initial fallback, even when Firebase fails to load.
- Firestore homepage image still overrides the fallback after successful retrieval, so future admin updates remain possible.
- Homepage settings and catalog load independently.
- Prefers `heroImage` (saved display URL) over `heroImageLink` (original sharing URL).
- Preloads a Firestore image before replacing the current visible image.
- Versioned module URLs reduce stale GitHub Pages browser caches.
- Updated homepage title to v0.9.3.

## Deploy to GitHub Pages
Upload the CONTENTS of this folder to the ROOT of the existing GitHub Pages repository, replacing files with matching names. Keep the assets folder. Commit changes, wait for GitHub Pages to publish, and refresh the public homepage.

## Important
The initial fallback image URL is the publicly shared Google Drive URL supplied for this release. If Firestore is unavailable, the homepage shows that image, but new admin image changes will not appear until Firestore access works. Firebase and checkout are not live-tested here.
