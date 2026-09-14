const U='https://vxptgfnuxboprwhgcxpd.supabase.co';
const K='sb_publishable_Wu0xH_TZ9L5t72BnROPtnw_9eJbG88T';
const SITE=process.env.SITE_URL||'https://ultimatewrenchworks.com';
const FROM_EMAIL=process.env.RESEND_FROM_EMAIL||'Ultimate Wrenchworks <quotes@ultimatewrenchworks.com>';
const money=n=>`$${Number(n||0).toFixed(2)}`;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const AUTHORIZATION='This estimate is based on the conditions and information known at the time of inspection or diagnosis. The scope of work, parts required, labor time, and total price may change if additional problems or previously unidentified conditions are discovered during service. If additional work or charges are necessary, Ultimate Wrenchworks will provide an updated estimate or authorization request before proceeding. No additional work beyond the approved scope will be performed without the customer’s approval. By approving this estimate, the customer authorizes Ultimate Wrenchworks to perform only the work and charges described in this approved estimate.';
function smsNumber(value){
 const raw=String(value||'').trim();
 const digits=raw.replace(/\D/g,'');
 if(digits.length===10)return `+1${digits}`;
 if(digits.length===11&&digits.startsWith('1'))return `+${digits}`;
 if(raw.startsWith('+')&&digits.length>=8&&digits.length<=15)return `+${digits}`;
 return '';
}
async function sendSms(to,body){
 const sid=process.env.TWILIO_ACCOUNT_SID;
 const token=process.env.TWILIO_AUTH_TOKEN;
 const from=process.env.TWILIO_FROM_NUMBER;
 if(!sid||!token||!from)return {ok:false,skipped:true,reason:'SMS service is not configured'};
 if(!to)return {ok:false,skipped:true,reason:'Customer phone number is not SMS-ready'};
 const auth=Buffer.from(`${sid}:${token}`).toString('base64');
 const form=new URLSearchParams({To:to,From:from,Body:body});
 const response=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`,{
  method:'POST',
  headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/x-www-form-urlencoded'},
  body:form.toString()
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok){console.error('Twilio error',response.status,data);return {ok:false,skipped:false,reason:data.message||'Could not send text message'};}
 return {ok:true,id:data.sid||null};
}
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
  const revision=q.revision||1;
  const html=`<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#17202a"><h1 style="margin-bottom:4px">Ultimate Wrenchworks</h1><p style="margin-top:0;color:#59636e">Mobile Service Quote · Revision ${revision}</p><p>Hi ${esc(r.customer_name)},</p><p>Your service quote is ready for <b>${esc(r.year_make_model)}</b>${r.service_needed?` — ${esc(r.service_needed)}`:''}.</p><table style="width:100%;border-collapse:collapse"><tr><td>Labor</td><td style="text-align:right">${money(q.labor)}</td></tr><tr><td>Parts</td><td style="text-align:right">${money(q.parts)}</td></tr><tr><td>Service call</td><td style="text-align:right">${money(q.service_call)}</td></tr><tr><td>Supplies</td><td style="text-align:right">${money(q.supplies)}</td></tr><tr><td>Sales tax</td><td style="text-align:right">${money(q.tax)}</td></tr><tr style="font-size:20px;font-weight:bold;border-top:2px solid #222"><td style="padding-top:12px">Total</td><td style="text-align:right;padding-top:12px">${money(q.total)}</td></tr></table>${q.notes?`<p><b>Notes:</b> ${esc(q.notes)}</p>`:''}<div style="margin-top:22px;padding:14px;border:1px solid #d6d9dc;border-radius:7px"><b>Estimate &amp; Repair Authorization</b><p style="font-size:13px;line-height:1.5;margin-bottom:0">${esc(AUTHORIZATION)}</p></div><p style="margin:28px 0"><a href="${approveUrl}" style="background:#17202a;color:white;text-decoration:none;padding:14px 20px;border-radius:7px;display:inline-block">Review &amp; Approve Revision ${revision}</a></p><p style="font-size:13px;color:#68727d">Opening the button lets you review the complete estimate and authorization before approving it.</p></div>`;
  const key=process.env.RESEND_API_KEY;
  if(!key) return Response.json({error:'Email service is not configured'},{status:500});
  const er=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from:FROM_EMAIL,to:[r.email],subject:`Ultimate Wrenchworks estimate revision ${revision} — ${r.year_make_model}`,html})});
  const ed=await er.json().catch(()=>({}));
  if(!er.ok){console.error('Resend error',er.status,ed);return Response.json({error:ed.message||'Could not send email'},{status:502});}
  const textBody=`Ultimate Wrenchworks: Your estimate (Revision ${revision}) has been sent to your email. You can also review and approve it here: ${approveUrl}`;
  const sms=await sendSms(smsNumber(r.phone),textBody);
  const now=new Date().toISOString();
  const up=await fetch(`${U}/rest/v1/public_request_quotes_v1?id=eq.${q.id}`,{method:'PATCH',headers:{...headers,Prefer:'return=minimal'},body:JSON.stringify({status:'sent',sent_at:now,updated_at:now})});
  if(!up.ok) return Response.json({error:'Email sent, but quote status could not be updated'},{status:502});
  return Response.json({ok:true,emailId:ed.id||null,smsSent:sms.ok,smsId:sms.id||null,smsNote:sms.ok?null:sms.reason||'Text message not sent'});
 }catch(e){console.error(e);return Response.json({error:'Could not send quote'},{status:500});}
}
