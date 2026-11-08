// Sweet Symphony v0.9.1 - Firebase services
import { firebaseConfig } from './firebase-config.js';

export const configured = !!(firebaseConfig?.apiKey && firebaseConfig?.projectId);
let app, auth, db, fs, au;

if (configured) {
  const [A, B, C] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')
  ]);
  au = B;
  fs = C;
  app = A.initializeApp(firebaseConfig);
  auth = B.getAuth(app);
  db = C.getFirestore(app);
}

export const services = {
  get auth() { return auth; },
  get db() { return db; }
};

// Public storefront: only published products.
export async function getCatalog() {
  if (!configured) return null;
  const query = fs.query(
    fs.collection(db, 'products'),
    fs.where('published', '==', true)
  );
  const snapshot = await fs.getDocs(query);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Admin dashboard: all products, including drafts.
// The Firestore rules must independently restrict unpublished product reads.
export async function getAdminCatalog() {
  if (!configured) return null;
  const user = auth.currentUser;
  if (!user || !(await hasRole(["super_admin", "website_manager"]))) {
    throw new Error('Administrator access required.');
  }
  const snapshot = await fs.getDocs(fs.collection(db, 'products'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getHome() {
  if (!configured) return null;
  const snapshot = await fs.getDoc(fs.doc(db, 'settings', 'homepage'));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function loginGoogle() {
  if (!configured) throw new Error('Firebase is not configured.');
  const provider = new au.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    return await au.signInWithPopup(auth, provider);
  } catch (err) {
    if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment'].includes(err.code)) {
      return au.signInWithRedirect(auth, provider);
    }
    throw err;
  }
}
export async function completeGoogleRedirect() {
  if (!configured) return null;
  return au.getRedirectResult(auth);
}
export async function logout() {
  if (!configured) return;
  return au.signOut(auth);
}
export function onAuth(callback) {
  if (!configured) throw new Error('Firebase is not configured.');
  return au.onAuthStateChanged(auth, callback);
}

// Authorization is based on the Firestore admins/{uid} registration.
// Firestore rules independently enforce this same check.
export async function getMyRole() {
  if (!configured || !auth.currentUser) return null;
  const snapshot = await fs.getDoc(fs.doc(db, 'admins', auth.currentUser.uid));
  if (!snapshot.exists() || snapshot.data().enabled !== true) return null;
  const role = snapshot.data().role;
  return ['super_admin','website_manager','order_manager'].includes(role) ? role : null;
}
export async function hasRole(allowed) { return allowed.includes(await getMyRole()); }
export async function isAdmin(uid) {
  return !!auth.currentUser && auth.currentUser.uid === uid && !!(await getMyRole());
}
export async function getUsers() {
  if (!(await hasRole(['super_admin']))) throw Error('Super admin access required.');
  const snap = await fs.getDocs(fs.collection(db,'admins'));
  return snap.docs.map(d=>({uid:d.id,...d.data()}));
}
export async function saveUser(uid, email, role, enabled) {
  if (!(await hasRole(['super_admin']))) throw Error('Super admin access required.');
  if (!/^[a-zA-Z0-9]{15,128}$/.test(uid)) throw Error('Enter a valid Firebase Authentication UID.');
  if (!['super_admin','website_manager','order_manager'].includes(role)) throw Error('Invalid role.');
  if (uid === auth.currentUser.uid && (role !== 'super_admin' || !enabled)) throw Error('You cannot remove your own super admin access.');
  await fs.setDoc(fs.doc(db,'admins',uid),{email:email.trim(),role,enabled});
}

export async function saveProduct(product) {
  const { id, ...data } = product;
  const ref = id ? fs.doc(db, 'products', id) : fs.doc(fs.collection(db, 'products'));
  await fs.setDoc(ref, data, { merge: true });
  return ref.id;
}
export async function deleteProduct(id) {
  await fs.deleteDoc(fs.doc(db, 'products', id));
}
export async function saveHome(data) {
  await fs.setDoc(fs.doc(db, 'settings', 'homepage'), data, { merge: true });
}
export async function getOrders() {
  const query = fs.query(
    fs.collection(db, 'orders'),
    fs.orderBy('createdAt', 'desc'),
    fs.limit(100)
  );
  const snapshot = await fs.getDocs(query);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function setOrderArchived(id, archived) {
  if (!configured) throw new Error('Firebase not configured.');
  await fs.updateDoc(fs.doc(db, 'orders', id), { archived });
}
export async function setOrderStatus(id, status) {
  await fs.updateDoc(fs.doc(db, 'orders', id), { status });
}
// Browser-only checkout: Firebase anonymous identity, Firestore rules recalculate totals.
// Reference date is based on Philippine time (Asia/Manila), not the visitor's device timezone.
function orderDatePH() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const part = type => parts.find(p => p.type === type)?.value;
  return `${part('year')}${part('month')}${part('day')}`;
}
function makeOrderReference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous 0/O and 1/I.
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `SS-${orderDatePH()}-${Array.from(bytes, n => alphabet[n % alphabet.length]).join('')}`;
}

export async function ensureCheckoutIdentity() {
  if (!configured) throw Error('Firebase is not configured.');
  if (auth.currentUser) return auth.currentUser;
  const credential = await au.signInAnonymously(auth);
  return credential.user;
}
export async function submitOrder(payload) {
  const user = await ensureCheckoutIdentity();
  const lines = payload.items.map(i => ({id:i.id, quantity:i.quantity}));
  if (lines.length < 1 || lines.length > 5 || new Set(lines.map(i=>i.id)).size !== lines.length) throw Error('Checkout supports up to five different cookies per order.');
  const products = await Promise.all(lines.map(async line => {
    const snapshot = await fs.getDoc(fs.doc(db, 'products', line.id));
    if (!snapshot.exists() || snapshot.data().published !== true) throw Error('A cookie is unavailable. Please refresh the shop.');
    return snapshot.data();
  }));
  const items = lines.map((line, index) => ({
    id: line.id, name: products[index].name, price: products[index].price, quantity: line.quantity
  }));
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  // The Firestore rules allow customer CREATE but not UPDATE, so an existing
  // document cannot be overwritten by a second order using the same reference.
  // A rare collision will fail safely rather than replacing a previous order.
  const orderNumber = makeOrderReference();
  const orderRef = fs.doc(db, 'orders', orderNumber);
  try {
    await fs.setDoc(orderRef, {
      customer: payload.customer, items, total, status:'Pending', orderNumber,
      ownerUid:user.uid, consent:true, createdAt:fs.serverTimestamp()
    });
  } catch (error) {
    if (error?.code === 'permission-denied') {
      throw new Error('Order could not be saved. Please retry. If the issue continues, contact Sweet Symphony.');
    }
    throw error;
  }
  return {orderNumber, id:orderRef.id, total};
}
// Only super admins can change notification configuration.
export async function getEmailSettings() {
  if (!(await hasRole(['super_admin']))) throw Error('Super admin access required.');
  const snap=await fs.getDoc(fs.doc(db,'privateSettings','emailNotifications'));
  return snap.exists()?snap.data():{enabled:false,recipients:[],provider:'none'};
}
export async function saveEmailSettings(data) {
  if (!(await hasRole(['super_admin']))) throw Error('Super admin access required.');
  await fs.setDoc(fs.doc(db,'privateSettings','emailNotifications'),data);
}

// v0.9.5: realtime published cookie catalog, independent from homepage settings.
export function watchCatalog(onProducts,onError) {
  if (!configured || !db || !fs) {
    onError(new Error('Firebase catalog is not configured.'));
    return () => {};
  }
  const q = fs.query(fs.collection(db,'products'),fs.where('published','==',true));
  return fs.onSnapshot(q, snapshot => {
    const products = snapshot.docs.map(d => ({...d.data(),id:d.id}));
    products.sort((a,b) => (Number(a.sort)||0)-(Number(b.sort)||0) || String(a.name||'').localeCompare(String(b.name||'')));
    onProducts(products);
  }, onError);
}

// Public notification switches only; no private recipient addresses exposed to customers.
export async function getPublicEmailPreferences() {
  if (!configured) return {enabled:false,events:[]};
  const snap=await fs.getDoc(fs.doc(db,'settings','emailNotificationsPublic'));
  return snap.exists()?snap.data():{enabled:false,events:[]};
}
export async function savePublicEmailPreferences(data) {
  if (!(await hasRole(['super_admin']))) throw Error('Super admin access required.');
  await fs.setDoc(fs.doc(db,'settings','emailNotificationsPublic'),{enabled:!!data.enabled,events:data.events||[],provider:'emailjs'});
}
