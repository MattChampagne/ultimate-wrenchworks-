const U='https://vxptgfnuxboprwhgcxpd.supabase.co';
const K='sb_publishable_Wu0xH_TZ9L5t72BnROPtnw_9eJbG88T';
const SITE='https://ultimate-wrenchworks-topaz.vercel.app';
const money=n=>`$${Number(n||0).toFixed(2)}`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
export async function POST(req){
 try{
  const auth=req.headers.get('authorization')||'';
  if(!auth.startsWith('Bearer ')) return Response.json({error:'Unauthorized'},{status:401});
  const {requestId}=await req.json();
  if(!requestId) return Response.json({error:'Missing request'},{status:400});
  const headers={apikey:K,Authorization:auth,'Content-Type':'application/json'};
  const staff=await fetch(`${U}/rest/v1/staff_members?select=user_id&active=eq.true&limit=1`,{headers,cache:'no-store'});
  if(!staff.ok||(await staff.json()).length===0) return Response.json({error:'Unauthorized'},{status:403});
  const [rr,qr]=await Promise.all([
   fetch(`${U}/rest/v1/public_service_requests_v1?id=eq.${encodeURIComponent(requestId)}&select=*`,{headers,cache:'no-store'}),
   fetch(`${U}/rest/v1/public_request_quotes_v1?request_id=eq.${encodeURIComponent(requestId)}&select=*`,{headers,cache:'no-store'})
  ]);
  if(!rr.ok||!qr.ok) return Response.json({error:'Unable to load quote'},{status:502});
  const r=(await rr.json())[0],q=(await qr.json())[0];
  if(!r||!q) return Response.json({error:'Quote not found'},{status:404});
  if(!r.email) return Response.json({error:'Customer email is missing'},{status:400});
  const token=q.approval_token;
  if(!token) return Response.json({error:'Quote approval link is not ready'},{status:500});
  const approveUrl=`${SITE}/quote/${token}`;
  const html=`<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#17202a"><h1 style="margin-bottom:4px">Ultimate Wrenchworks</h1><p style="margin-top:0;color:#59636e">Mobile Service Quote</p><p>Hi ${esc(r.customer_name)},</p><p>Your service quote is ready for <b>${esc(r.year_make_model)}</b>${r.service_needed?` — ${esc(r.service_needed)}`:''}.</p><table style="width:100%;border-collapse:collapse"><tr><td>Labor</td><td style="text-align:right">${money(q.labor)}</td></tr><tr><td>Parts</td><td style="text-align:right">${money(q.parts)}</td></tr><tr><td>Service call</td><td style="text-align:right">${money(q.service_call)}</td></tr><tr><td>Supplies</td><td style="text-align:right">${money(q.supplies)}</td></tr><tr><td>Sales tax</td><td style="text-align:right">${money(q.tax)}</td></tr><tr style="font-size:20px;font-weight:bold;border-top:2px solid #222"><td style="padding-top:12px">Total</td><td style="text-align:right;padding-top:12px">${money(q.total)}</td></tr></table>${q.notes?`<p><b>Notes:</b> ${esc(q.notes)}</p>`:''}<p style="margin:28px 0"><a href="${approveUrl}" style="background:#17202a;color:white;text-decoration:none;padding:14px 20px;border-radius:7px;display:inline-block">Review & Approve Quote</a></p><p style="font-size:13px;color:#68727d">Opening the button lets you review the quote before approving it.</p></div>`;
  const key=process.env.RESEND_API_KEY;
  if(!key) return Response.json({error:'Email service is not configured'},{status:500});
  const er=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from:'Ultimate Wrenchworks <onboarding@resend.dev>',to:[r.email],subject:`Ultimate Wrenchworks quote — ${r.year_make_model}`,html})});
  const ed=await er.json().catch(()=>({}));
  if(!er.ok){console.error('Resend error',er.status,ed);return Response.json({error:ed.message||'Could not send email'},{status:502});}
  const now=new Date().toISOString();
  const up=await fetch(`${U}/rest/v1/public_request_quotes_v1?id=eq.${q.id}`,{method:'PATCH',headers:{...headers,Prefer:'return=minimal'},body:JSON.stringify({status:'sent',sent_at:now,updated_at:now})});
  if(!up.ok) return Response.json({error:'Email sent, but quote status could not be updated'},{status:502});
  return Response.json({ok:true,id:ed.id||null});
 }catch(e){console.error(e);return Response.json({error:'Could not send quote'},{status:500});}
}
