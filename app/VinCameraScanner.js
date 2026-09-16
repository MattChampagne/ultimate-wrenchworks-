'use client';

import { useRef, useState } from 'react';

const VIN_RE=/^[A-HJ-NPR-Z0-9]{17}$/;
const normalize=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const translit={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9};
const weights=[8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];
function checkDigit(v){let sum=0;for(let i=0;i<17;i++){const c=v[i],n=/\d/.test(c)?Number(c):translit[c];if(n==null)return false;sum+=n*weights[i];}const r=sum%11;return v[8]===(r===10?'X':String(r));}
function plausible(v){if(!VIN_RE.test(v)||/[IOQ]/.test(v))return false;return (v.match(/[A-Z]/g)||[]).length>=2&&(v.match(/\d/g)||[]).length>=3;}
function candidatesFromText(text){const out=[];for(const line of String(text||'').toUpperCase().split(/\n+/)){const c=normalize(line).replace(/[IOQ]/g,'');if(c.length===17)out.push(c);for(let i=0;i<=c.length-17;i++)out.push(c.slice(i,i+17));}return [...new Set(out)].filter(plausible);}
function loadImage(file){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('image load failed'))};img.src=url;});}
async function makeVinImage(file){const img=await loadImage(file);const sw=img.naturalWidth||img.width,sh=img.naturalHeight||img.height;const maxW=1800,scale=Math.min(1,maxW/sw);const w=Math.max(1,Math.round(sw*scale)),h=Math.max(1,Math.round(sh*scale));const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('canvas unavailable');ctx.drawImage(img,0,0,w,h);const data=ctx.getImageData(0,0,w,h),p=data.data;for(let i=0;i<p.length;i+=4){const y=.299*p[i]+.587*p[i+1]+.114*p[i+2];const v=y<105?0:y>205?255:Math.max(0,Math.min(255,(y-128)*1.65+128));p[i]=p[i+1]=p[i+2]=v;}ctx.putImageData(data,0,0);return canvas;}

export default function VinCameraScanner({onVin}){
 const inputRef=useRef(null);const[scanning,setScanning]=useState(false);const[message,setMessage]=useState('');
 async function scan(file){
  if(!file)return;setScanning(true);setMessage('Preparing VIN photo…');let worker;
  try{
   // Canvas normalization avoids relying on createImageBitmap(file), which has been unreliable with some iPhone camera files.
   const image=await makeVinImage(file);setMessage('Reading the printed VIN…');
   const {createWorker}=await import('tesseract.js');worker=await createWorker('eng');
   await worker.setParameters({tessedit_char_whitelist:'ABCDEFGHJKLMNPRSTUVWXYZ0123456789',tessedit_pageseg_mode:'7'});
   const w=image.width,h=image.height;const regions=[null,{left:0,top:Math.round(h*.15),width:w,height:Math.round(h*.7)},{left:0,top:Math.round(h*.28),width:w,height:Math.round(h*.44)}];let all=[];
   for(const rectangle of regions){const r=await worker.recognize(image,{rectangle});all.push(...candidatesFromText(r?.data?.text));}
   all=[...new Set(all)];const valid=all.filter(checkDigit);const chosen=valid[0]||(all.length===1?all[0]:null);
   if(chosen){onVin(chosen);setMessage(valid.length?'VIN recognized and validated. Please confirm it matches the vehicle.':'Possible VIN found. Please compare all 17 characters with the vehicle before decoding.');}
   else setMessage('No reliable 17-character VIN was found. Retake the photo closer so the VIN fills most of the frame, or enter it manually.');
  }catch(e){console.error('VIN scan failed',e);setMessage('VIN photo could not be read on this device. You can still enter the VIN manually.');}
  finally{try{await worker?.terminate();}catch{}setScanning(false);if(inputRef.current)inputRef.current.value='';}
 }
 return <div style={{marginTop:'10px'}}><input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={e=>scan(e.target.files?.[0])} style={{display:'none'}}/><button className="secondary" type="button" onClick={()=>inputRef.current?.click()} disabled={scanning}>{scanning?'Reading VIN…':'📷 Scan Printed VIN'}</button>{message&&<p style={{marginBottom:0}} aria-live="polite">{message}</p>}</div>;
}
