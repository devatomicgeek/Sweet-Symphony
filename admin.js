import {imageFromLink,displayImage} from './images.js';
import {configured,services,loginGoogle,completeGoogleRedirect,logout,onAuth,isAdmin,getAdminCatalog,getHome,getMyRole,saveProduct,deleteProduct,saveHome} from './firebase.js';
import {money,escapeHTML as e,placeholder,defaults} from './data.js';
const $=id=>document.getElementById(id);let catalog=[],selectedImage='',heroImage='';
const msg=(id,s)=>$(id).textContent=s;
function showPanel(){ $('admin-login').hidden=true;$('admin-panel').hidden=false;$('sign-out').hidden=false;refresh() }
function showLogin(s=''){ $('admin-login').hidden=false;$('admin-panel').hidden=true;$('sign-out').hidden=true;msg('login-message',s) }
async function refresh(){try{catalog=await getAdminCatalog()||[];renderProducts();const home=await getHome();heroImage=home?.heroImageLink||home?.heroImage||'';$('home-image-link').value=heroImage;if(heroImage){$('home-preview').src=displayImage(heroImage,placeholder);$('home-preview').hidden=false}}catch(err){msg('product-status',err.message)}}
function renderProducts(){$('admin-products').innerHTML=catalog.length?catalog.map(p=>`<div class="admin-item"><img src="${e(displayImage(p.imageLink||p.image,placeholder))}" alt=""><div><strong>${e(p.name)}</strong><p>${money(p.price)} · ${p.published===false?'Draft':'Published'} ${p.featured?'· Featured':''}</p></div><div><button class="btn secondary" data-edit="${e(p.id)}">EDIT</button><button class="btn secondary" data-delete="${e(p.id)}">DELETE</button></div></div>`).join(''):'<p>No products yet. Add your first cookie.</p>'}
function edit(id){const p=catalog.find(x=>x.id===id);if(!p)return;$('product-id').value=p.id;$('product-name').value=p.name;$('product-price').value=p.price;$('product-desc').value=p.desc;$('product-published').checked=p.published!==false;$('product-featured').checked=!!p.featured;selectedImage=p.imageLink||p.image||'';$('product-image-link').value=selectedImage;$('product-preview').src=displayImage(selectedImage,placeholder);$('product-preview').hidden=false;$('form-heading').textContent='Edit cookie';window.scrollTo({top:100,behavior:'smooth'})}
function reset(){ $('product-form').reset();$('product-id').value='';selectedImage='';$('product-preview').hidden=true;$('form-heading').textContent='Add a cookie';msg('product-status','') }
$('google-sign-in').addEventListener('click',async()=>{
  msg('login-message','Opening Google sign-in…');
  try { await loginGoogle(); }
  catch(err) { msg('login-message', err.code==='auth/popup-closed-by-user' ? 'Sign-in cancelled.' : 'Google sign-in failed: '+(err.message||err.code)); }
});
completeGoogleRedirect().catch(err=>msg('login-message','Sign-in redirect failed: '+err.message));
$('sign-out').addEventListener('click',()=>logout());$('reset-product').addEventListener('click',reset);
document.addEventListener('click',async ev=>{const tab=ev.target.closest('[data-tab]');if(tab){document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===tab));for(const id of ['products','homepage'])$('tab-'+id).hidden=id!==tab.dataset.tab}const editButton=ev.target.closest('[data-edit]');if(editButton)edit(editButton.dataset.edit);const del=ev.target.closest('[data-delete]');if(del&&confirm('Delete this cookie from the store?')){try{await deleteProduct(del.dataset.delete);await refresh()}catch(err){alert(err.message)}}});
$('product-form').addEventListener('submit',async ev=>{ev.preventDefault();const id=$('product-id').value;msg('product-status','Saving…');try{const link=$('product-image-link').value.trim();const url=link?imageFromLink(link):'';await saveProduct({id,name:$('product-name').value.trim(),price:Number($('product-price').value),desc:$('product-desc').value.trim(),image:url,imageLink:link,published:$('product-published').checked,featured:$('product-featured').checked,sort:catalog.find(p=>p.id===id)?.sort??catalog.length});reset();await refresh();msg('product-status','Cookie saved successfully.')}catch(err){msg('product-status',err.message)}});
$('home-form').addEventListener('submit',async ev=>{ev.preventDefault();msg('home-status','Saving…');try{const link=$('home-image-link').value.trim();const url=link?imageFromLink(link):'';if(!url)throw Error('Paste a Google Drive image link.');await saveHome({heroImage:url,heroImageLink:link});heroImage=link;$('home-preview').src=url;$('home-preview').hidden=false;msg('home-status','Homepage image saved.')}catch(err){msg('home-status',err.message)}});
if(!configured){showLogin('Firebase is not configured. Follow README.md to enable secure admin access.');$('google-sign-in').disabled=true}else onAuth(async user=>{if(!user)return showLogin();try{if(['super_admin','website_manager'].includes(await getMyRole())){showPanel();const role=await getMyRole();document.getElementById('role-nav').innerHTML=role==='super_admin'?'<a href="orders.html">Orders</a> · <a href="users.html">Users</a> · <a href="email-settings.html">Email</a>':'';}else{showLogin('This Google account cannot manage the website. Ask a super admin to grant website access to UID: '+user.uid+' . Create admins/'+user.uid+' with enabled = true in Firestore, then reload.');}}catch(err){showLogin('Unable to verify admin permissions.')}});

$('seed-products').addEventListener('click',async()=>{if(!confirm('Import the six starter cookies? Existing products with the same IDs will be updated.'))return;try{for(const p of defaults)await saveProduct(p);await refresh()}catch(err){alert(err.message)}});

function preview(linkId,previewId,statusId){
 try { const url=imageFromLink($(linkId).value);if(!url)throw Error('Paste a Google Drive link first.');const node=$(previewId);node.hidden=false;node.src=url;node.onerror=()=>{node.src=placeholder;msg(statusId,'Image did not load. Check Drive sharing permissions or use a dedicated image host.');};msg(statusId,'Preview requested. If it stays blank, Google Drive may block embedding.'); }
 catch(err){msg(statusId,err.message)}
}
$('preview-product').addEventListener('click',()=>preview('product-image-link','product-preview','product-status'));
$('preview-home').addEventListener('click',()=>preview('home-image-link','home-preview','home-status'));
