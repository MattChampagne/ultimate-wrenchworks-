'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const SUPABASE_URL='https://vxptgfnuxboprwhgcxpd.supabase.co';
const SUPABASE_KEY='sb_publishable_Wu0xH_TZ9L5t72BnROPtnw_9eJbG88T';
const windows=['Morning 9-12','Afternoon 12-4','Evening 6-8'];

async function sb(path,options={},token){
 return fetch(`${SUPABASE_URL}${path}`,{
  ...options,
  headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${token||SUPABASE_KEY}`,'Content-Type':'application/json',...(options.headers||{})},
  cache:'no-store'
 });
}

export default function RescheduleEnhancer(){
 const[requests,setRequests]=useState([]);
 const[quotes,setQuotes]=useState([]);
 const[jobs,setJobs]=useState([]);
 const[selected,setSelected]=useState(null);
 const[date,setDate]=useState('');
 const[timeframe,setTimeframe]=useState('');
 const[saving,setSaving]=useState(false);
 const[message,setMessage]=useState('');
 const[portalReady,setPortalReady]=useState(false);

 async function loadData(){
  const token=localStorage.getItem('uw_owner_token');
  if(!token)return;
  const[rr,qr,jr]=await Promise.all([
   sb('/rest/v1/public_service_requests_v1?select=*&order=created_at.desc&limit=100',{},token),
   sb('/rest/v1/public_request_quotes_v1?select=*&order=created_at.desc&limit=100',{},token),
   sb('/rest/v1/public_jobs_v1?select=*&order=scheduled_date.asc.nullslast,created_at.asc&limit=100',{},token)
  ]);
  if(rr.ok&&qr.ok&&jr.ok){setRequests(await rr.json());setQuotes(await qr.json());setJobs(await jr.json());}
 }

 useEffect(()=>{setPortalReady(true);loadData();const timer=setInterval(loadData,15000);return()=>clearInterval(timer);},[]);

 const openRequests=useMemo(()=>requests.filter(r=>!quotes.some(q=>q.request_id===r.id&&['approved','declined'].includes(q.status))),[requests,quotes]);
 const conflicts=useMemo(()=>date?jobs.filter(j=>j.scheduled_date===date&&!['cancelled'].includes(j.status)):[],[date,jobs]);

 function openEditor(r){
  setSelected(r);
  setDate(r.owner_proposed_date||r.preferred_date||'');
  setTimeframe(r.owner_proposed_timeframe||r.preferred_timeframe||'');
  setMessage('');
 }

 useEffect(()=>{
  if(!portalReady)return;
  function installButtons(){
   const active=[...document.querySelectorAll('.ownerTabs button')].find(b=>b.classList.contains('active'));
   if(!active||!active.textContent.startsWith('Requests'))return;
   const cards=[...document.querySelectorAll('.requestList .requestItem')];
   cards.forEach((card,index)=>{
    if(card.querySelector('[data-uw-reschedule]'))return;
    const r=openRequests[index];
    if(!r)return;
    const row=card.querySelector('.statusButtons');
    if(!row)return;
    const button=document.createElement('button');
    button.type='button';
    button.textContent='Change Requested Date';
    button.dataset.uwReschedule='true';
    button.addEventListener('click',()=>openEditor(r));
    row.appendChild(button);
   });
  }
  installButtons();
  const observer=new MutationObserver(installButtons);
  observer.observe(document.body,{childList:true,subtree:true});
  return()=>observer.disconnect();
 },[portalReady,openRequests]);

 async function save(){
  if(!selected||!date){setMessage('Choose a new requested date.');return;}
  setSaving(true);setMessage('');
  const token=localStorage.getItem('uw_owner_token');
  const payload={
   original_preferred_date:selected.original_preferred_date||selected.preferred_date||null,
   original_preferred_timeframe:selected.original_preferred_timeframe||selected.preferred_timeframe||null,
   preferred_date:date,
   preferred_timeframe:timeframe||null,
   owner_proposed_date:date,
   owner_proposed_timeframe:timeframe||null,
   owner_proposed_at:new Date().toISOString()
  };
  const res=await sb(`/rest/v1/public_service_requests_v1?id=eq.${encodeURIComponent(selected.id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(payload)},token);
  if(!res.ok){setMessage('Could not change the requested date.');setSaving(false);return;}
  setMessage('Requested date updated.');
  await loadData();
  setSaving(false);
  setTimeout(()=>window.location.reload(),500);
 }

 if(!portalReady||!selected)return null;
 return createPortal(<div style={{position:'fixed',inset:0,zIndex:10000,background:'rgba(0,0,0,.72)',display:'flex',alignItems:'center',justifyContent:'center',padding:18}} onClick={e=>{if(e.target===e.currentTarget&&!saving)setSelected(null)}}>
  <section className="quoteEditor" style={{width:'min(620px,100%)',maxHeight:'90vh',overflow:'auto',margin:0,background:'#fff',color:'#111',borderRadius:14,padding:20,boxShadow:'0 18px 60px rgba(0,0,0,.45)'}}>
   <h3 style={{marginTop:0}}>Change Requested Date</h3>
   <div className="requestProblem"><b>{selected.customer_name}</b><p>{selected.year_make_model}</p><p><b>Originally requested:</b> {selected.original_preferred_date||selected.preferred_date||'Flexible'} · {selected.original_preferred_timeframe||selected.preferred_timeframe||'Flexible'}</p></div>
   <div className="formGrid">
    <label><span>New requested date</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
    <label><span>Arrival window</span><select value={timeframe} onChange={e=>setTimeframe(e.target.value)}><option value="">Flexible</option>{windows.map(w=><option key={w}>{w}</option>)}</select></label>
   </div>
   {date&&conflicts.length>0?<div className="requestProblem" style={{border:'2px solid #b45309'}}><b>Schedule warning</b><p>{conflicts.length} existing job{conflicts.length===1?' is':'s are'} already scheduled for {date}.</p>{conflicts.map(j=><p key={j.id}>• {j.arrival_window||'Flexible arrival'} · {j.status}</p>)}</div>:date?<div className="requestProblem"><b>Schedule check</b><p>No existing jobs are currently scheduled for {date}.</p></div>:null}
   <p className="taxNote">The customer's original requested date is preserved in the record. This changes the working requested date and records it as an owner-proposed date.</p>
   {message&&<p className="ownerMessage">{message}</p>}
   <div className="statusButtons"><button className="active" onClick={save} disabled={saving}>{saving?'Saving…':'Save New Date'}</button><button onClick={()=>setSelected(null)} disabled={saving}>Cancel</button></div>
  </section>
 </div>,document.body);
}
