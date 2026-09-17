'use client';

import {useEffect} from 'react';

function tomorrowLocal(){
  const d=new Date();
  d.setDate(d.getDate()+1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function NoSameDayScheduling(){
  useEffect(()=>{
    function apply(){
      const form=document.querySelector('.requestForm');
      const input=form?.querySelector('input[name="date"]');
      if(!input)return false;
      const min=tomorrowLocal();
      input.min=min;
      if(input.value&&input.value<min)input.value='';
      input.setAttribute('aria-describedby','uw-date-policy');
      if(!document.getElementById('uw-date-policy')){
        const note=document.createElement('small');
        note.id='uw-date-policy';
        note.className='datePolicyNote';
        note.textContent='Earliest available request date is tomorrow. Same-day scheduling is not currently available.';
        input.insertAdjacentElement('afterend',note);
      }
      return true;
    }
    if(apply())return;
    const observer=new MutationObserver(()=>{if(apply())observer.disconnect()});
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[]);
  return null;
}
