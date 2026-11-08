import {emailJSConfig as c} from './emailjs-config.js?v=0.9.8.3';
const valid = x => typeof x === 'string' && !!x.trim() && !x.startsWith('REPLACE_WITH_');
export function emailJSReady(type='new_order') {return [c.publicKey,c.serviceId,type==='status_change'?c.statusTemplateId:c.newOrderTemplateId].every(valid);}
export async function sendEmailNotification(type, params) {
  if (!emailJSReady(type)) return {sent:false,reason:'EmailJS is not configured.'};
  const template_id=type==='status_change'?c.statusTemplateId:c.newOrderTemplateId;
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
  try {
    const response=await fetch('https://api.emailjs.com/api/v1.0/email/send',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({service_id:c.serviceId,template_id,user_id:c.publicKey,template_params:params}),signal:controller.signal
    });
    if(!response.ok)throw Error('EmailJS returned HTTP '+response.status);
    return {sent:true};
  } finally {clearTimeout(timeout);}
}
// Recipient must be configured as a FIXED address in EmailJS templates, not supplied by visitors.
export function orderEmailParams(order, customer, items) {
 return {order_number:order.orderNumber,customer_name:customer.name,customer_email:customer.email,customer_phone:customer.phone,customer_notes:customer.notes||'None',order_items:items.map(i=>`${i.name} x ${i.quantity} - PHP ${(i.price*i.quantity).toFixed(2)}`).join('\n'),order_total:`PHP ${order.total.toFixed(2)}`,order_status:'Pending'};
}
