'use client';

import { useRef, useState } from 'react';

function loadImage(file){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('The photo could not be opened.'))};img.src=url;});}
function canvasBlob(canvas,type='image/jpeg',quality=.86){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('The photo could not be prepared.')),type,quality));}
async function preparePhotos(file){
 const img=await loadImage(file);const sw=img.naturalWidth||img.width,sh=img.naturalHeight||img.height;if(!sw||!sh)throw new Error('The photo dimensions could not be read.');
 const maxSide=1800,scale=Math.min(1,maxSide/Math.max(sw,sh));const w=Math.max(1,Math.round(sw*scale)),h=Math.max(1,Math.round(sh*scale));
 const full=document.createElement('canvas');full.width=w;full.height=h;const ctx=full.getContext('2d');if(!ctx)throw new Error('Photo processing is not supported on this browser.');ctx.drawImage(img,0,0,w,h);
 // VINs are normally photographed as a long horizontal line. Crop a generous center band so OCR sees larger characters with less dashboard/windshield clutter.
 const cropY=Math.round(h*.24),cropH=Math.max(1,Math.round(h*.52));const crop=document.createElement('canvas');crop.width=w;crop.height=cropH;const cctx=crop.getContext('2d');if(!cctx)throw new Error('Photo processing is not supported on this browser.');cctx.drawImage(full,0,cropY,w,cropH,0,0,w,cropH);
 return {crop:await canvasBlob(crop,'image/jpeg',.88),full:await canvasBlob(full,'image/jpeg',.82),landscape:w>=h};
}

export default function VinCameraScanner({onVin}){
 const inputRef=useRef(null);const[scanning,setScanning]=useState(false);const[message,setMessage]=useState('');
 async function scan(file){
  if(!file)return;setScanning(true);const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),30000);
  try{
   setMessage('Preparing VIN photo…');const photos=await preparePhotos(file);setMessage('Uploading and reading the printed VIN…');
   const form=new FormData();form.append('image',photos.crop,'vin-photo.jpg');
   let response=await fetch('/api/scan-vin',{method:'POST',body:form,signal:controller.signal});let data=await response.json().catch(()=>({}));
   // If the guided center crop misses the VIN, automatically retry the complete photo before asking the customer to retake it.
   if(response.ok&&!data.vin){setMessage('Checking the full photo…');const fallback=new FormData();fallback.append('image',photos.full,'vin-photo.jpg');response=await fetch('/api/scan-vin',{method:'POST',body:fallback,signal:controller.signal});data=await response.json().catch(()=>({}));}
   if(!response.ok)throw new Error(data.error||'VIN scan failed');
   if(data.vin){onVin(data.vin);setMessage(data.validated?'VIN recognized and validated. Please confirm all 17 characters match the vehicle.':'Possible VIN found. Please compare all 17 characters with the vehicle before decoding.');}
   else setMessage('No reliable VIN was found. Turn the phone sideways, move closer, and make the VIN fill the guide area. You can also enter it manually.');
  }catch(e){console.error('VIN scan failed',e);setMessage(e?.name==='AbortError'?'VIN scan timed out. Turn the phone sideways and retake it with the VIN filling most of the picture width.':(e?.message||'VIN photo could not be processed. You can still enter the VIN manually.'));}
  finally{clearTimeout(timer);setScanning(false);if(inputRef.current)inputRef.current.value='';}
 }
 return <div style={{marginTop:'10px'}}>
  <div style={{border:'1px solid #555',padding:'12px',marginBottom:'10px',textAlign:'center'}}>
   <div style={{fontWeight:800,letterSpacing:'.06em',marginBottom:'6px'}}>VIN PHOTO TIP</div>
   <div style={{marginBottom:'10px'}}>Turn your phone sideways and move close enough for the VIN to fill most of the picture width.</div>
   <div aria-hidden="true" style={{width:'100%',height:'46px',border:'2px dashed #f47721',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,letterSpacing:'.08em'}}>FILL THIS WIDTH WITH THE 17-CHARACTER VIN</div>
  </div>
  <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*" capture="environment" onChange={e=>scan(e.target.files?.[0])} style={{display:'none'}}/>
  <button className="secondary" type="button" onClick={()=>inputRef.current?.click()} disabled={scanning}>{scanning?'Reading VIN…':'📷 Scan Printed VIN'}</button>{message&&<p style={{marginBottom:0}} aria-live="polite">{message}</p>}
 </div>;
}
