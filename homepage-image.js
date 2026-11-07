// Sweet Symphony v0.9.4 - independent, live Firestore homepage image loader.
// This module intentionally does not depend on app.js or catalog requests.
import { firebaseConfig } from './firebase-config.js';
import { displayImage } from './images.js';

const hero = document.getElementById('hero-img');
const fallback = 'assets/cookie-placeholder.svg';
let requestNumber = 0;

function showStatus(message, error) {
  if (hero) hero.dataset.imageStatus = message;
  if (error) console.error('[Sweet Symphony homepage]', message, error);
  else console.info('[Sweet Symphony homepage]', message);
}
function setHero(raw) {
  if (!hero) return;
  const src = displayImage(raw, '');
  const ticket = ++requestNumber;
  if (!src) {
    hero.onerror = null;
    hero.src = fallback;
    showStatus('No valid saved homepage image; showing placeholder.');
    return;
  }
  // Change immediately. Waiting for a preload can leave an obsolete photo visible.
  hero.onerror = () => {
    if (ticket !== requestNumber) return;
    hero.onerror = null;
    hero.src = fallback;
    showStatus('Saved image failed to load; showing placeholder.', src);
  };
  hero.onload = () => {
    if (ticket === requestNumber) showStatus('Displaying latest Firestore homepage image.');
  };
  hero.src = src;
  showStatus('Applying homepage image from Firestore.');
}

if (hero && firebaseConfig?.projectId) {
  try {
    const [{ initializeApp, getApps, getApp }, firestore] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')
    ]);
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const db = firestore.getFirestore(app);
    // Live listener ensures admin changes appear on an already-open homepage.
    firestore.onSnapshot(
      firestore.doc(db, 'settings', 'homepage'),
      snapshot => {
        if (!snapshot.exists()) return setHero('');
        const data = snapshot.data();
        setHero(data.heroImage || data.heroImageLink || '');
      },
      error => showStatus('Cannot read homepage settings from Firestore; check browser console and Firestore rules.', error)
    );
  } catch (error) {
    showStatus('Homepage Firebase module could not initialize.', error);
  }
}
