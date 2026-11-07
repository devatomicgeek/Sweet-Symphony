import {configured,loginGoogle,completeGoogleRedirect,logout,onAuth,getMyRole} from './firebase.js';
const $=id=>document.getElementById(id);
$('google-sign-in').addEventListener('click',async()=>{try{$('login-message').textContent='Opening Google…';await loginGoogle()}catch(e){$('login-message').textContent=e.message}});
completeGoogleRedirect().catch(e=>$('login-message').textContent=e.message);
$('sign-out').addEventListener('click',()=>logout());
function showLogin(message=''){$('admin-login').hidden=false;$('admin-panel').hidden=true;$('sign-out').hidden=true;$('login-message').textContent=message}
function showPanel(role){$('admin-login').hidden=true;$('admin-panel').hidden=false;$('sign-out').hidden=false;$('role-nav').innerHTML=role==='super_admin'?'<a href="admin.html">Website Settings</a> · <a href="orders.html">Orders</a> · <a href="users.html">Users</a> · <a href="email-settings.html">Email</a>':''}
import {getUsers,saveUser} from './firebase.js';
import {escapeHTML as e} from './data.js';
async function refresh(){try{const users=await getUsers();$('user-list').innerHTML=users.map(u=>`<div class="admin-item"><div><strong>${e(u.email||'No email')}</strong><p>${e(u.uid)}</p><p>${e(u.role||'unassigned')} · ${u.enabled?'Enabled':'Disabled'}</p></div><button class="btn secondary" data-uid="${e(u.uid)}">EDIT</button></div>`).join('')||'<p>No users yet.</p>';window.registeredUsers=users}catch(err){$('user-status').textContent=err.message}}
$('user-form').addEventListener('submit',async ev=>{ev.preventDefault();$('user-status').textContent='Saving…';try{await saveUser($('user-uid').value.trim(),$('user-email').value.trim(),$('user-role').value,$('user-enabled').checked);$('user-status').textContent='User saved.';await refresh()}catch(e){$('user-status').textContent=e.message}});
document.addEventListener('click',ev=>{const button=ev.target.closest('[data-uid]');if(!button)return;const u=(window.registeredUsers||[]).find(x=>x.uid===button.dataset.uid);if(!u)return;$('user-uid').value=u.uid;$('user-email').value=u.email||'';$('user-role').value=u.role||'website_manager';$('user-enabled').checked=u.enabled===true;window.scrollTo({top:0,behavior:'smooth'})});
if(!configured)showLogin('Firebase not configured.');else onAuth(async user=>{if(!user)return showLogin();try{const role=await getMyRole();if(role==='super_admin'){showPanel(role);await refresh()}else showLogin('Super admin access required. Your Firebase UID: '+user.uid)}catch(e){showLogin('Permission check failed: '+e.message)}});
