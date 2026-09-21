const U='https://vxptgfnuxboprwhgcxpd.supabase.co';
const K='sb_publishable_Wu0xH_TZ9L5t72BnROPtnw_9eJbG88T';
const FROM_EMAIL=process.env.RESEND_FROM_EMAIL||'Ultimate Wrenchworks <quotes@ultimatewrenchworks.com>';
const money=n=>'$'+Number(n||0).toFixed(2);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function smsNumber(value){const raw=String(value||'').trim(),digits=raw.replace(/\D/g,'');if(digits.length===10)return '+1'+digits;if(digits.length===11&&digits.startsWith('1'))return '+'+digits;if(raw.startsWith('+')&&digits.length>=8&&digits.length<=15)return '+'+digits;return '';}
async function sendSms(to,body){const sid=process.env.TWILIO_ACCOUNT_SID,token=process.env.TWILIO_AUTH_TOKEN,from=process.env.TWILIO_FROM_NUMBER;if(!sid||!token||!from)return {ok:false,reason:'SMS service is not configured'};if(!to)return {ok:false,reason:'Customer phone number is not SMS-ready'};const auth=Buffer.from(sid+':'+token).toString('base64');const form=new URLSearchParams({To:to,From:from,Body:body});const response=await fetch('https://api.twilio.com/2010-04-01/Accounts/'+encodeURIComponent(sid)+'/Messages.json',{method:'POST',headers:{Authorization:'Basic '+auth,'Content-Type':'application/x-www-form-urlencoded'},body:form.toString()});const data=await response.json().catch(()=>({}));if(!response.ok)return {ok:false,reason:data.message||'Could not send text message'};return {ok:true,id:data.sid||null};}

async function createStripeCheckout({job,request,quote,origin,headers}){
  const secret=process.env.STRIPE_SECRET_KEY;
  if(!secret)return {ok:false,reason:'Stripe is not configured yet'};

  const cents=Math.round(Number(quote.total||0)*100);
  if(!Number.isFinite(cents)||cents<50)return {ok:false,reason:'Invoice total is not valid for online payment'};

  if(job.stripe_checkout_url&&job.stripe_payment_status!=='paid'){
    return {ok:true,url:job.stripe_checkout_url,sessionId:job.stripe_checkout_session_id||null,reused:true};
  }

  const form=new URLSearchParams();
  form.set('mode','payment');
  form.set('success_url',origin+'/payment/success?session_id={CHECKOUT_SESSION_ID}');
  form.set('cancel_url',origin+'/');
  form.set('client_reference_id',job.id);
  form.set('line_items[0][quantity]','1');
  form.set('line_items[0][price_data][currency]','usd');
  form.set('line_items[0][price_data][unit_amount]',String(cents));
  form.set('line_items[0][price_data][product_data][name]','Ultimate Wrenchworks Invoice #'+job.invoice_number);
  form.set('line_items[0][price_data][product_data][description]',[request.year_make_model,request.service_needed].filter(Boolean).join(' · ').slice(0,500));
  form.set('metadata[job_id]',job.id);
  form.set('metadata[invoice_number]',String(job.invoice_number||''));
  form.set('payment_intent_data[metadata][job_id]',job.id);
  form.set('payment_intent_data[metadata][invoice_number]',String(job.invoice_number||''));
  if(request.email)form.set('customer_email',request.email);

  const stripe=await fetch('https://api.stripe.com/v1/checkout/sessions',{
    method:'POST',
    headers:{Authorization:'Bearer '+secret,'Content-Type':'application/x-www-form-urlencoded'},
    body:form.toString(),
    cache:'no-store'
  });
  const data=await stripe.json().catch(()=>({}));
  if(!stripe.ok||!data.url){
    console.error('Stripe Checkout creation failed',stripe.status,data?.error?.message||'unknown');
    return {ok:false,reason:data?.error?.message||'Could not create Stripe checkout'};
  }

  const saved=await fetch(U+'/rest/v1/public_jobs_v1?id=eq.'+encodeURIComponent(job.id),{
    method:'PATCH',
    headers:{...headers,Prefer:'return=minimal'},
    body:JSON.stringify({
      stripe_checkout_session_id:data.id,
      stripe_checkout_url:data.url,
      stripe_payment_status:data.payment_status||'unpaid',
      updated_at:new Date().toISOString()
    }),
    cache:'no-store'
  });
  if(!saved.ok)console.error('Could not save Stripe Checkout session',saved.status,await saved.text().catch(()=>''));

  return {ok:true,url:data.url,sessionId:data.id,reused:false};
}

export async function POST(req){
  try{
    const auth=req.headers.get('authorization')||'';
    if(!auth.startsWith('Bearer '))return Response.json({error:'Unauthorized'},{status:401});
    const {jobId}=await req.json();
    if(!jobId)return Response.json({error:'Missing job'},{status:400});

    const headers={apikey:K,Authorization:auth,'Content-Type':'application/json'};
    const staff=await fetch(U+'/rest/v1/staff_members?select=user_id&active=eq.true&limit=1',{headers,cache:'no-store'});
    if(!staff.ok||(await staff.json()).length===0)return Response.json({error:'Unauthorized'},{status:403});

    const jr=await fetch(U+'/rest/v1/public_jobs_v1?id=eq.'+encodeURIComponent(jobId)+'&select=*',{headers,cache:'no-store'});
    if(!jr.ok)return Response.json({error:'Unable to load invoice'},{status:502});
    const j=(await jr.json())[0];
    if(!j||!j.invoice_number)return Response.json({error:'Invoice has not been created yet'},{status:400});
    if(j.paid_at)return Response.json({error:'Invoice is already paid'},{status:400});

    const [rr,qr]=await Promise.all([
      fetch(U+'/rest/v1/public_service_requests_v1?id=eq.'+encodeURIComponent(j.request_id)+'&select=*',{headers,cache:'no-store'}),
      fetch(U+'/rest/v1/public_request_quotes_v1?id=eq.'+encodeURIComponent(j.quote_id)+'&select=*',{headers,cache:'no-store'})
    ]);
    if(!rr.ok||!qr.ok)return Response.json({error:'Unable to load invoice details'},{status:502});
    const r=(await rr.json())[0],q=(await qr.json())[0];
    if(!r||!q)return Response.json({error:'Invoice details not found'},{status:404});

    const origin=new URL(req.url).origin;
    const checkout=await createStripeCheckout({job:j,request:r,quote:q,origin,headers});
    const payUrl=checkout.ok?checkout.url:'';

    const key=process.env.RESEND_API_KEY;
    let emailSent=false,smsSent=false;

    if(r.email&&key){
      const payBlock=payUrl
        ? '<p style="margin:28px 0"><a href="'+esc(payUrl)+'" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 22px;border-radius:8px;font-weight:700">Pay Invoice Securely</a></p><p style="font-size:13px;color:#555">Card payment is processed securely by Stripe.</p>'
        : '<p>Please contact Ultimate Wrenchworks to arrange payment if payment was not made at the time of service.</p>';

      const html='<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#17202a"><h1>Ultimate Wrenchworks</h1><p>Hi '+esc(r.customer_name)+',</p><p>Your invoice <b>#'+esc(j.invoice_number)+'</b> for <b>'+esc(r.year_make_model||'your service')+'</b> is ready.</p><table style="width:100%;border-collapse:collapse"><tr><td>Labor</td><td style="text-align:right">'+money(q.labor)+'</td></tr><tr><td>Parts</td><td style="text-align:right">'+money(q.parts)+'</td></tr><tr><td>Service Call</td><td style="text-align:right">'+money(q.service_call)+'</td></tr><tr><td>Shop Supplies</td><td style="text-align:right">'+money(q.supplies)+'</td></tr><tr><td>Sales Tax</td><td style="text-align:right">'+money(q.tax)+'</td></tr><tr style="font-size:20px;font-weight:bold;border-top:2px solid #222"><td style="padding-top:12px">Total Due</td><td style="text-align:right;padding-top:12px">'+money(q.total)+'</td></tr></table>'+(j.work_performed?'<p><b>Work Performed:</b><br>'+esc(j.work_performed).replace(/\n/g,'<br>')+'</p>':'')+payBlock+'</div>';

      const er=await fetch('https://api.resend.com/emails',{
        method:'POST',
        headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
        body:JSON.stringify({from:FROM_EMAIL,to:[r.email],subject:'Ultimate Wrenchworks invoice #'+j.invoice_number,html})
      });
      emailSent=er.ok;
      if(!er.ok)console.error('Invoice email error',er.status,await er.text().catch(()=>''));
    }

    const smsBody=payUrl
      ? 'Ultimate Wrenchworks: Invoice #'+j.invoice_number+' is ready. Total due: '+money(q.total)+'. Pay securely: '+payUrl+' Reply STOP to opt out or HELP for help.'
      : 'Ultimate Wrenchworks: Invoice #'+j.invoice_number+' is ready. Total due: '+money(q.total)+'. Please contact us to arrange payment. Reply STOP to opt out or HELP for help.';

    const sms=r.sms_consent===true
      ? await sendSms(smsNumber(r.phone),smsBody)
      : {ok:false,reason:'Customer has not opted in to SMS'};
    smsSent=sms.ok;

    if(!emailSent&&!smsSent)return Response.json({
      error:r.email?'Invoice could not be sent. Please try again.':'Customer has no available notification method.',
      smsNote:sms.reason||null,
      stripeNote:checkout.ok?null:checkout.reason||null
    },{status:502});

    return Response.json({
      ok:true,
      emailSent,
      smsSent,
      smsNote:smsSent?null:sms.reason||null,
      stripeCheckoutReady:checkout.ok,
      stripeNote:checkout.ok?null:checkout.reason||null
    });
  }catch(e){
    console.error(e);
    return Response.json({error:'Could not send invoice'},{status:500});
  }
}
