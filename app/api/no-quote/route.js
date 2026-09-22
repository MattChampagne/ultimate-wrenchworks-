const U='https://vxptgfnuxboprwhgcxpd.supabase.co';
const K='sb_publishable_Wu0xH_TZ9L5t72BnROPtnw_9eJbG88T';
const FROM_EMAIL=process.env.RESEND_FROM_EMAIL||'Ultimate Wrenchworks <quotes@ultimatewrenchworks.com>';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function smsNumber(value){const raw=String(value||'').trim(),digits=raw.replace(/\D/g,'');if(digits.length===10)return '+1'+digits;if(digits.length===11&&digits.startsWith('1'))return '+'+digits;if(raw.startsWith('+')&&digits.length>=8&&digits.length<=15)return '+'+digits;return '';}
async function sendSms(to,body){const sid=process.env.TWILIO_ACCOUNT_SID,token=process.env.TWILIO_AUTH_TOKEN,from=process.env.TWILIO_FROM_NUMBER;if(!sid||!token||!from)return {ok:false,reason:'SMS service is not configured'};if(!to)return {ok:false,reason:'Customer phone number is not SMS-ready'};const auth=Buffer.from(sid+':'+token).toString('base64');const form=new URLSearchParams({To:to,From:from,Body:body});const response=await fetch('https://api.twilio.com/2010-04-01/Accounts/'+encodeURIComponent(sid)+'/Messages.json',{method:'POST',headers:{Authorization:'Basic '+auth,'Content-Type':'application/x-www-form-urlencoded'},body:form.toString()});const data=await response.json().catch(()=>({}));if(!response.ok){console.error('Twilio no-quote error',response.status,data);return {ok:false,reason:data.message||'Could not send text message'};}return {ok:true,id:data.sid||null};}
export async function POST(req){try{
 const auth=req.headers.get('authorization')||'';
 if(!auth.startsWith('Bearer ')||!K)return Response.json({error:'Unauthorized'},{status:401});
 const {requestId,reason}=await req.json();
 const clean=String(reason||'').trim();
 if(!requestId||clean.length<3)return Response.json({error:'A No Quote reason is required.'},{status:400});
 const headers={apikey:K,Authorization:auth,'Content-Type':'application/json'};
 const staff=await fetch(U+'/rest/v1/staff_members?select=user_id&active=eq.true&limit=1',{headers,cache:'no-store'});
 if(!staff.ok||(await staff.json()).length===0)return Response.json({error:'Unauthorized'},{status:403});
 const rr=await fetch(U+'/rest/v1/public_service_requests_v1?id=eq.'+encodeURIComponent(requestId)+'&select=*',{headers,cache:'no-store'});
 if(!rr.ok)return Response.json({error:'Unable to load request'},{status:502});
 const r=(await rr.json())[0];
 if(!r)return Response.json({error:'Request not found'},{status:404});
 let emailSent=false,smsSent=false,emailId=null,smsId=null,emailError=null;
 const key=process.env.RESEND_API_KEY;
 if(r.email&&key){
  const html='<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#17202a"><h1>Ultimate Wrenchworks</h1><p>Hi '+esc(r.customer_name)+',</p><p>We are unable to provide a quote for your service request for <b>'+esc(r.year_make_model||r.service_type||'your vehicle')+'</b> at this time.</p><div style="margin:20px 0;padding:16px;border:1px solid #d6d9dc;border-radius:7px"><b>Reason:</b><p style="margin-bottom:0;white-space:pre-wrap">'+esc(clean)+'</p></div><p>If you can provide the missing information or additional details, you are welcome to submit a new service request.</p><p>Thank you,<br/>Ultimate Wrenchworks</p></div>';
  const er=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from:FROM_EMAIL,to:[r.email],subject:'Ultimate Wrenchworks — Service Request Update',html})});
  const ed=await er.json().catch(()=>({}));
  if(er.ok){emailSent=true;emailId=ed.id||null;}else{emailError=ed.message||'Email could not be sent';console.error('Resend no-quote error',er.status,ed);}
 }
 const sms=r.sms_consent===true?await sendSms(smsNumber(r.phone),'Ultimate Wrenchworks: We are unable to provide a quote for your service request at this time. Reason: '+clean+' If you can provide the missing information, please submit a new request. Reply STOP to opt out or HELP for help.'):{ok:false,reason:'Customer has not opted in to SMS'};
 smsSent=sms.ok;smsId=sms.id||null;
 if(!emailSent&&!smsSent)return Response.json({error:emailError||sms.reason||'Customer has no available notification method.'},{status:502});
 const now=new Date().toISOString();
 const up=await fetch(U+'/rest/v1/public_service_requests_v1?id=eq.'+encodeURIComponent(requestId),{method:'PATCH',headers:{...headers,Prefer:'return=minimal'},body:JSON.stringify({status:'no_quote',no_quote_reason:clean,no_quoted_at:now})});
 if(!up.ok)return Response.json({error:'Customer was notified, but the request status could not be updated.'},{status:502});
 return Response.json({ok:true,emailSent,emailId,smsSent,smsId,smsNote:smsSent?null:sms.reason||null});
}catch(e){console.error(e);return Response.json({error:'Could not send No Quote notification'},{status:500});}}
