import crypto from 'crypto';

const SB='https://vxptgfnuxboprwhgcxpd.supabase.co';

function secureEqual(a,b){
  const aa=Buffer.from(String(a||''),'hex');
  const bb=Buffer.from(String(b||''),'hex');
  if(aa.length!==bb.length||aa.length===0)return false;
  return crypto.timingSafeEqual(aa,bb);
}

function verifyStripeSignature(payload,header,secret){
  if(!header||!secret)return false;
  const parts=String(header).split(',').map(x=>x.trim());
  const timestamp=parts.find(x=>x.startsWith('t='))?.slice(2);
  const signatures=parts.filter(x=>x.startsWith('v1=')).map(x=>x.slice(3));
  if(!timestamp||signatures.length===0)return false;

  const age=Math.abs(Math.floor(Date.now()/1000)-Number(timestamp));
  if(!Number.isFinite(age)||age>300)return false;

  const expected=crypto
    .createHmac('sha256',secret)
    .update(timestamp+'.'+payload,'utf8')
    .digest('hex');

  return signatures.some(sig=>secureEqual(expected,sig));
}

async function db(path,options={}){
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!key)throw Error('Supabase service role key is missing');
  return fetch(SB+path,{
    ...options,
    headers:{
      apikey:key,
      Authorization:'Bearer '+key,
      'Content-Type':'application/json',
      ...(options.headers||{})
    },
    cache:'no-store'
  });
}

async function updateJobFromSession(event,session){
  const jobId=session?.metadata?.job_id||session?.client_reference_id;
  if(!jobId)return;

  const paid=session.payment_status==='paid';
  const payload={
    stripe_checkout_session_id:session.id||null,
    stripe_payment_intent_id:typeof session.payment_intent==='string'?session.payment_intent:null,
    stripe_payment_status:session.payment_status||null,
    stripe_paid_amount_cents:Number.isFinite(session.amount_total)?session.amount_total:null,
    stripe_last_event_id:event.id||null,
    updated_at:new Date().toISOString(),
    ...(paid?{
      paid_at:new Date().toISOString(),
      payment_method:'Stripe'
    }:{})
  };

  const response=await db('/rest/v1/public_jobs_v1?id=eq.'+encodeURIComponent(jobId),{
    method:'PATCH',
    headers:{Prefer:'return=minimal'},
    body:JSON.stringify(payload)
  });

  if(!response.ok){
    throw Error('Supabase payment update failed '+response.status+' '+(await response.text().catch(()=>'')));
  }
}

export async function POST(req){
  const secret=process.env.STRIPE_WEBHOOK_SECRET;
  if(!secret)return Response.json({error:'Stripe webhook is not configured'},{status:503});

  const raw=await req.text();
  const signature=req.headers.get('stripe-signature')||'';
  if(!verifyStripeSignature(raw,signature,secret)){
    return Response.json({error:'Invalid Stripe signature'},{status:400});
  }

  let event;
  try{event=JSON.parse(raw)}
  catch{return Response.json({error:'Invalid JSON'},{status:400})}

  try{
    const session=event?.data?.object;

    if(event.type==='checkout.session.completed'){
      await updateJobFromSession(event,session);
    }else if(event.type==='checkout.session.async_payment_succeeded'){
      await updateJobFromSession(event,session);
    }else if(event.type==='checkout.session.async_payment_failed'){
      const jobId=session?.metadata?.job_id||session?.client_reference_id;
      if(jobId){
        const response=await db('/rest/v1/public_jobs_v1?id=eq.'+encodeURIComponent(jobId),{
          method:'PATCH',
          headers:{Prefer:'return=minimal'},
          body:JSON.stringify({
            stripe_checkout_session_id:session.id||null,
            stripe_payment_status:'failed',
            stripe_last_event_id:event.id||null,
            updated_at:new Date().toISOString()
          })
        });
        if(!response.ok)throw Error('Could not record failed Stripe payment');
      }
    }

    return Response.json({received:true});
  }catch(error){
    console.error('Stripe webhook processing failed',event?.id,event?.type,error?.message||error);
    return Response.json({error:'Webhook processing failed'},{status:500});
  }
}
