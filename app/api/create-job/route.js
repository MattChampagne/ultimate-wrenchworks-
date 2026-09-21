const SB='https://vxptgfnuxboprwhgcxpd.supabase.co',DAV='https://caldav.icloud.com';

function cfg(){
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  const u=String(process.env.ICLOUD_CALDAV_USERNAME||'').trim();
  const p=String(process.env.ICLOUD_CALDAV_APP_PASSWORD||'').trim().replace(/[\s-]+/g,'');
  if(!key||!u||!p)throw Error('Server configuration is incomplete.');
  return{key,u,p};
}

function basicAuth(){
  const {u,p}=cfg();
  return 'Basic '+Buffer.from(u+':'+p).toString('base64');
}

async function dav(url,method,body,headers={}){
  let current=url;
  for(let i=0;i<5;i++){
    const r=await fetch(current,{
      method,
      headers:{Authorization:basicAuth(),...headers},
      body,
      redirect:'manual',
      cache:'no-store'
    });
    if(![301,302,303,307,308].includes(r.status))return r;
    const loc=r.headers.get('location');
    if(!loc)return r;
    current=new URL(loc,current).href;
  }
  throw Error('Too many CalDAV redirects.');
}

function href(xml,tag){
  return xml.match(new RegExp('<(?:[\\w.-]+:)?'+tag+'[^>]*>\\s*<(?:[\\w.-]+:)?href[^>]*>([^<]+)</','i'))?.[1]?.replace(/&amp;/g,'&');
}

async function calendarUrl(){
  let base=DAV+'/';
  let r=await dav(
    base,
    'PROPFIND',
    '<d:propfind xmlns:d="DAV:"><d:prop><d:current-user-principal/></d:prop></d:propfind>',
    {Depth:'0','Content-Type':'application/xml; charset=utf-8'}
  );
  if(!r.ok)throw Error('principal '+r.status);
  let xml=await r.text();
  const principal=href(xml,'current-user-principal');
  if(!principal)throw Error('principal parse');
  const principalUrl=new URL(principal,r.url||base).href;

  r=await dav(
    principalUrl,
    'PROPFIND',
    '<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><c:calendar-home-set/></d:prop></d:propfind>',
    {Depth:'0','Content-Type':'application/xml; charset=utf-8'}
  );
  if(!r.ok)throw Error('home '+r.status);
  xml=await r.text();
  const home=href(xml,'calendar-home-set');
  if(!home)throw Error('home parse');
  const homeUrl=new URL(home,r.url||principalUrl).href;

  r=await dav(
    homeUrl,
    'PROPFIND',
    '<d:propfind xmlns:d="DAV:"><d:prop><d:displayname/><d:resourcetype/></d:prop></d:propfind>',
    {Depth:'1','Content-Type':'application/xml; charset=utf-8'}
  );
  if(!r.ok)throw Error('calendar list '+r.status);
  xml=await r.text();

  for(const part of xml.split(/<(?:[\\w.-]+:)?response[^>]*>/i).slice(1)){
    const name=(part.match(/<(?:[\\w.-]+:)?displayname[^>]*>([^<]*)</i)?.[1]||'')
      .replace(/&amp;/g,'&').trim();
    const h=part.match(/<(?:[\\w.-]+:)?href[^>]*>([^<]+)</i)?.[1];
    if(name.toLowerCase()==='ultimate wrenchworks'&&h){
      return new URL(h.replace(/&amp;/g,'&'),r.url||homeUrl).href;
    }
  }
  throw Error('Ultimate Wrenchworks calendar not found.');
}

async function db(path,options={}){
  const {key}=cfg();
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

function esc(value=''){
  return String(value)
    .replace(/\\/g,'\\\\')
    .replace(/\r?\n/g,'\\n')
    .replace(/,/g,'\\,')
    .replace(/;/g,'\\;');
}

function windowTimes(window){
  if(window==='Afternoon 12-4')return['120000','160000'];
  if(window==='Evening 6-8')return['180000','200000'];
  return['090000','120000'];
}

async function recordCalendarState(payload){
  const response=await db('/rest/v1/job_calendar_events',{
    method:'POST',
    headers:{Prefer:'return=minimal'},
    body:JSON.stringify(payload)
  });
  if(!response.ok){
    const detail=await response.text().catch(()=>'');
    console.error('Calendar tracking insert failed',response.status,detail);
  }
  return response.ok;
}

export async function POST(req){
  try{
    const bearer=req.headers.get('authorization')||'';
    const {key}=cfg();
    if(!bearer.startsWith('Bearer '))return Response.json({error:'Unauthorized'},{status:401});

    const auth=await fetch(SB+'/auth/v1/user',{
      headers:{apikey:key,Authorization:bearer},
      cache:'no-store'
    });
    if(!auth.ok)return Response.json({error:'Unauthorized'},{status:401});

    const body=await req.json();
    if(!body.request_id||!body.quote_id||!body.scheduled_date||!body.arrival_window){
      return Response.json({error:'Scheduled date and arrival window are required.'},{status:400});
    }

    const created=await db('/rest/v1/public_jobs_v1',{
      method:'POST',
      headers:{Prefer:'return=representation'},
      body:JSON.stringify({
        request_id:body.request_id,
        quote_id:body.quote_id,
        scheduled_date:body.scheduled_date,
        arrival_window:body.arrival_window,
        status:'scheduled',
        job_notes:body.job_notes||null,
        updated_at:new Date().toISOString()
      })
    });
    if(!created.ok){
      console.error('Job insert failed',created.status,await created.text().catch(()=>''));
      return Response.json({error:'Could not create job.'},{status:502});
    }

    const job=(await created.json())[0];

    const requestUpdate=await db('/rest/v1/public_service_requests_v1?id=eq.'+encodeURIComponent(body.request_id),{
      method:'PATCH',
      headers:{Prefer:'return=minimal'},
      body:JSON.stringify({status:'scheduled'})
    });
    if(!requestUpdate.ok){
      console.error('Request status update failed',requestUpdate.status,await requestUpdate.text().catch(()=>''));
    }

    const requestRead=await db('/rest/v1/public_service_requests_v1?id=eq.'+encodeURIComponent(body.request_id)+'&select=*');
    const requestRow=requestRead.ok?(await requestRead.json())[0]||{}:{};

    const uid='uww-job-'+job.id+'@ultimatewrenchworks.com';
    const [start,end]=windowTimes(body.arrival_window);
    const day=body.scheduled_date.replace(/-/g,'');
    const dtstamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');

    const ics=[
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'PRODID:-//Ultimate Wrenchworks//Job Calendar//EN',
      'BEGIN:VEVENT',
      'UID:'+uid,
      'DTSTAMP:'+dtstamp,
      'DTSTART;TZID=America/Chicago:'+day+'T'+start,
      'DTEND;TZID=America/Chicago:'+day+'T'+end,
      'SUMMARY:'+esc('Ultimate Wrenchworks - '+(requestRow.customer_name||'Service')),
      'LOCATION:'+esc(requestRow.service_location||''),
      'DESCRIPTION:'+esc([
        requestRow.year_make_model,
        requestRow.service_needed,
        requestRow.phone,
        body.job_notes,
        'Job '+job.id
      ].filter(Boolean).join(' | ')),
      'END:VEVENT',
      'END:VCALENDAR',
      ''
    ].join('\r\n');

    let calendarSynced=false;
    let warning='';

    try{
      const calendar=await calendarUrl();
      const eventUrl=new URL(job.id+'.ics',calendar.endsWith('/')?calendar:calendar+'/').href;

      const put=await dav(eventUrl,'PUT',ics,{
        'Content-Type':'text/calendar; charset=utf-8',
        'If-None-Match':'*'
      });

      if(!put.ok){
        const detail=(await put.text().catch(()=>'')).slice(0,500);
        throw Error('event write '+put.status+(detail?' '+detail:''));
      }

      const tracked=await recordCalendarState({
        job_id:job.id,
        provider:'icloud',
        event_uid:uid,
        event_href:eventUrl,
        etag:put.headers.get('etag'),
        sync_status:'synced',
        last_error:null,
        updated_at:new Date().toISOString()
      });
      if(!tracked)throw Error('event created but tracking insert failed');

      calendarSynced=true;
      console.log('iCloud job calendar sync succeeded',job.id);
    }catch(error){
      const detail=String(error?.message||'Calendar sync failed').slice(0,500);
      console.error('iCloud job calendar sync failed',job.id,detail);
      warning='Job created, but iCloud calendar sync failed: '+detail;

      await recordCalendarState({
        job_id:job.id,
        provider:'icloud',
        event_uid:uid,
        sync_status:'error',
        last_error:detail,
        updated_at:new Date().toISOString()
      });
    }

    return Response.json({
      ok:true,
      jobId:job.id,
      calendarSynced,
      warning
    });
  }catch(error){
    console.error('Create job failed:',error?.message||'unknown');
    return Response.json({error:'Could not create job.'},{status:500});
  }
}
