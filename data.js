export const defaults=[
{id:'matcha',name:'Matcha Cashew Delight',price:60,desc:'A rich matcha cookie blended with crunchy cashews and pockets of cream.',image:''},
{id:'biscoff',name:'Biscoff Caramel Elegance',price:60,desc:'Infused with Biscoff and a smooth caramel finish.',image:''},
{id:'nutella',name:'Nutella Molten Luxe',price:60,desc:'Soft-baked cookie with a luscious Nutella center.',image:''},
{id:'double',name:'Double Chocolate Decadence',price:47,desc:'Deep cocoa dough loaded with rich chocolate chunks.',image:''},
{id:'walnut',name:'Chocolate Chip & Walnut Royale',price:45,desc:'Toasted walnuts paired with decadent dark chocolate.',image:''},
{id:'signature',name:'Signature Chocolate Chip',price:35,desc:'Classic golden cookie with rich, premium chocolate chips.',image:''}].map((p,i)=>({...p,published:true,featured:i===2,sort:i}));
export const money=n=>'₱'+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
export const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const placeholder='assets/cookie-placeholder.svg';
