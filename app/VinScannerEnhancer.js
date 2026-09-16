'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import VinCameraScanner from './VinCameraScanner';

export default function VinScannerEnhancer(){
 const[target,setTarget]=useState(null);
 useEffect(()=>{
  function find(){
   const input=document.querySelector('input[name="vin"]');
   const host=input?.closest('.wide.travelEstimate');
   setTarget(host||null);
  }
  find();const observer=new MutationObserver(find);observer.observe(document.body,{childList:true,subtree:true});return()=>observer.disconnect();
 },[]);
 function setVin(value){
  const input=document.querySelector('input[name="vin"]');if(!input)return;
  const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;
  setter?.call(input,value);
  input.dispatchEvent(new Event('input',{bubbles:true}));
  input.dispatchEvent(new Event('change',{bubbles:true}));
  input.focus();
 }
 if(!target)return null;
 return createPortal(<VinCameraScanner onVin={setVin}/>,target);
}
