import {sendEmailNotification,emailJSReady} from './emailjs.js?v=0.9.8.3';
import {getPublicEmailPreferences} from './firebase.js?v=0.9.8.3';
import {configured,loginGoogle,completeGoogleRedirect,logout,onAuth,getMyRole,getOrders,setOrderStatus,setOrderArchived} from './firebase.js';
import {money,escapeHTML as escape} from './data.js';
const $=id=>document.getElementById(id);
let orders=[], view='active';
$('google-sign-in').addEventListener('click',async()=>{try{$('login-message').textContent='Opening Google…';await loginGoogle()}catch(err){$('login-message').textContent=err.message}});
completeGoogleRedirect().catch(err=>$('login-message').textContent=err.message);
$('sign-out').addEventListener('click',()=>logout());
function showLogin(message=''){$('admin-login').hidden=false;$('admin-panel').hidden=true;$('sign-out').hidden=true;$('login-message').textContent=message}
function showPanel(role){$('admin-login').hidden=true;$('admin-panel').hidden=false;$('sign-out').hidden=false;$('role-nav').innerHTML=role==='super_admin'?'<a href="admin.html">Website Settings</a> · <a href="orders.html">Orders</a> · <a href="users.html">Users</a> · <a href="email-settings.html">Email</a>':''}
function render(){
  const archived=view==='archived';
  $('show-active').className='btn'+(archived?' secondary':'');
  $('show-archived').className='btn'+(!archived?' secondary':'');
  $('show-active').setAttribute('aria-pressed',String(!archived));
  $('show-archived').setAttribute('aria-pressed',String(archived));
  const visible=orders.filter(o=>(o.archived===true)===archived);
  $('admin-orders').innerHTML=visible.length?visible.map(o=>`<article class="order-item"><div class="order-details"><strong>${escape(o.orderNumber||o.id)}</strong> · ${money(o.total)}<br><small>${escape(o.customer?.name||'')} · ${escape(o.customer?.email||'')} · ${escape(o.customer?.phone||'')}</small><p>${(o.items||[]).map(i=>`${escape(i.name)} × ${Number(i.quantity)||0}`).join(' · ')}</p><p>${escape(o.customer?.notes||'')}</p></div><div class="order-actions"><label>Status<select data-order="${escape(o.id)}" ${archived?'disabled':''}>${['Pending','Confirmed','Preparing','Ready','Completed','Cancelled'].map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}</select></label><button type="button" class="btn secondary" data-archive="${escape(o.id)}" data-action="${archived?'restore':'archive'}">${archived?'RESTORE':'ARCHIVE'}</button></div></article>`).join(''):`<p>No ${archived?'archived':'active'} orders.</p>`;
  $('order-status').textContent=`${visible.length} ${archived?'archived':'active'} order(s) shown · ${orders.length} loaded (latest 100)`;
}
async function refresh(){ $('order-status').textContent='Loading orders…';try{orders=await getOrders();render()}catch(err){$('order-status').textContent=err.message}}
$('refresh-orders').addEventListener('click',refresh);
$('show-active').addEventListener('click',()=>{view='active';render()});
$('show-archived').addEventListener('click',()=>{view='archived';render()});
document.addEventListener('change',async ev=>{const select=ev.target;if(!select.matches('select[data-order]'))return;select.disabled=true;try{await setOrderStatus(select.dataset.order,select.value);const order=orders.find(o=>o.id===select.dataset.order);if(order)order.status=select.value;$('order-status').textContent='Order status saved.';
if(order && emailJSReady('status_change')) {
 try {const prefs=await getPublicEmailPreferences();if(prefs.enabled&&(prefs.events||[]).includes('status_change')){
 await sendEmailNotification('status_change',{order_number:order.orderNumber||order.id,order_status:select.value,customer_name:order.customer?.name||'',customer_email:order.customer?.email||'',order_total:`PHP ${Number(order.total||0).toFixed(2)}`});
 $('order-status').textContent='Order status saved; notification sent.';
 }}catch(emailError){console.warn('Status saved but email failed:',emailError);$('order-status').textContent='Order status saved, but email notification failed.';}
}}catch(err){$('order-status').textContent=err.message;await refresh()}finally{select.disabled=false}});
document.addEventListener('click',async ev=>{const button=ev.target.closest('button[data-archive]');if(!button)return;const id=button.dataset.archive;const archived=button.dataset.action==='archive';const order=orders.find(o=>o.id===id);if(!order)return;const verb=archived?'Archive':'Restore';if(!window.confirm(`${verb} order ${order.orderNumber||id}? ${archived?'It will be hidden from active orders but kept in Firestore.':'It will return to active orders.'}`))return;button.disabled=true;try{await setOrderArchived(id,archived);order.archived=archived;render();$('order-status').textContent=`Order ${archived?'archived':'restored'} successfully.`}catch(err){button.disabled=false;$('order-status').textContent=`${verb} failed: ${err.message}`}});
if(!configured)showLogin('Firebase not configured.');else onAuth(async user=>{if(!user)return showLogin();try{const role=await getMyRole();if(['super_admin','order_manager'].includes(role)){showPanel(role);await refresh()}else showLogin('No order access. Your Firebase UID: '+user.uid)}catch(err){showLogin('Permission check failed: '+err.message)}});
