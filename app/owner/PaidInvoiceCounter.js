'use client';

import { useEffect } from 'react';

const SUPABASE_URL='https://vxptgfnuxboprwhgcxpd.supabase.co';
const SUPABASE_KEY='sb_publishable_Wu0xH_TZ9L5t72BnROPtnw_9eJbG88T';

export default function PaidInvoiceCounter(){
 useEffect(()=>{
  let stopped=false;
  async function refresh(){
   const token=localStorage.getItem('uw_owner_token');
   if(!token)return;
   const res=await fetch(`${SUPABASE_URL}/rest/v1/public_jobs_v1?select=id&paid_at=not.is.null&invoice_saved_at=is.null`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`},cache:'no-store'});
   if(!res.ok||stopped)return;
   const rows=await res.json();
   const paidButton=[...document.querySelectorAll('.ownerTabs button')].find(b=>b.textContent.startsWith('Paid Invoices'));
   if(!paidButton)return;
   let badge=paidButton.querySelector('[data-paid-unsaved-count]');
   if(rows.length){
    if(!badge){badge=document.createElement('span');badge.dataset.paidUnsavedCount='1';paidButton.appendChild(badge);}
    badge.textContent=String(rows.length);
   }else if(badge)badge.remove();
  }
  refresh();
  const timer=setInterval(refresh,5000);
  return()=>{stopped=true;clearInterval(timer)};
 },[]);
 return null;
}
