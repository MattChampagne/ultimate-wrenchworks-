'use client';

import { useRef, useState } from 'react';

function loadImage(file){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('The photo could not be opened.'))};img.src=url;});}
function canvasBlob(canvas,type='image/jpeg',quality=.82){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('The photo could not be prepared.')),type,quality));}
async function preparePhoto(file){
 const img=await loadImage(file);const sw=img.naturalWidth||img.width,sh=img.naturalHeight||img.height;if(!sw||!sh)throw new Error('The photo dimensions could not be read.');
 // Normalize iPhone HEIC/JPEG and Android camera images into a small JPEG before upload.
 const maxSide=1600,scale=Math.min(1,maxSide/Math.max(sw,sh));const w=Math.max(1,Math.round(sw*scale)),h=Math.max(1,Math.round(sh*scale));
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Photo processing is not supported on this browser.');ctx.drawImage(img,0,0,w,h);
 return canvasBlob(canvas,'image/jpeg',.82);
}

export default function VinCameraScanner({onVin}){
 const inputRef=useRef(null);const[scanning,setScanning]=useState(false);const[message,setMessage]=useState('');
 async function scan(file){
  if(!file)return;setScanning(true);const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),30000);
  try{
   setMessage('Preparing VIN photo…');const photo=await preparePhoto(file);setMessage('Uploading and reading the printed VIN…');
   const form=new FormData();form.append('image',photo,'vin-photo.jpg');
   const response=await fetch('/api/scan-vin',{method:'POST',body:form,signal:controller.signal});const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.error||'VIN scan failed');
   if(data.vin){onVin(data.vin);setMessage(data.validated?'VIN recognized and validated. Please confirm all 17 characters match the vehicle.':'Possible VIN found. Please compare all 17 characters with the vehicle before decoding.');}
   else setMessage(data.message||'No reliable VIN was found. Retake the photo closer so the VIN fills most of the frame, or enter it manually.');
  }catch(e){console.error('VIN scan failed',e);setMessage(e?.name==='AbortError'?'VIN scan timed out. Please try again with the VIN filling most of the photo.':(e?.message||'VIN photo could not be processed. You can still enter the VIN manually.'));}
  finally{clearTimeout(timer);setScanning(false);if(inputRef.current)inputRef.current.value='';}
 }
 return <div style={{marginTop:'10px'}}><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*" capture="environment" onChange={e=>scan(e.target.files?.[0])} style={{display:'none'}}/><button className="secondary" type="button" onClick={()=>inputRef.current?.click()} disabled={scanning}>{scanning?'Reading VIN…':'📷 Scan Printed VIN'}</button>{message&&<p style={{marginBottom:0}} aria-live="polite">{message}</p>}</div>;
}
