'use client';

import { useRef, useState } from 'react';

export default function VinCameraScanner({onVin}){
 const inputRef=useRef(null);const[scanning,setScanning]=useState(false);const[message,setMessage]=useState('');
 async function scan(file){
  if(!file)return;setScanning(true);setMessage('Uploading and reading the printed VIN…');
  try{
   const form=new FormData();form.append('image',file,'vin-photo');
   const response=await fetch('/api/scan-vin',{method:'POST',body:form});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.error||'VIN scan failed');
   if(data.vin){onVin(data.vin);setMessage(data.validated?'VIN recognized and validated. Please confirm all 17 characters match the vehicle.':'Possible VIN found. Please compare all 17 characters with the vehicle before decoding.');}
   else setMessage(data.message||'No reliable VIN was found. Retake the photo closer so the VIN fills most of the frame, or enter it manually.');
  }catch(e){console.error('VIN scan failed',e);setMessage(e?.message||'VIN photo could not be processed. You can still enter the VIN manually.');}
  finally{setScanning(false);if(inputRef.current)inputRef.current.value='';}
 }
 return <div style={{marginTop:'10px'}}><input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={e=>scan(e.target.files?.[0])} style={{display:'none'}}/><button className="secondary" type="button" onClick={()=>inputRef.current?.click()} disabled={scanning}>{scanning?'Reading VIN…':'📷 Scan Printed VIN'}</button>{message&&<p style={{marginBottom:0}} aria-live="polite">{message}</p>}</div>;
}
