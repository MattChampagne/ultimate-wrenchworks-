'use client';

import { useRef, useState } from 'react';

const VIN_RE=/^[A-HJ-NPR-Z0-9]{17}$/;
const normalize=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const translit={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9};
const weights=[8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];
function checkDigit(v){let sum=0;for(let i=0;i<17;i++){const c=v[i];const n=/\d/.test(c)?Number(c):translit[c];if(n==null)return false;sum+=n*weights[i];}const r=sum%11;return v[8]===(r===10?'X':String(r));}
function plausible(v){if(!VIN_RE.test(v)||/[IOQ]/.test(v))return false;const letters=(v.match(/[A-Z]/g)||[]).length;const digits=(v.match(/\d/g)||[]).length;return letters>=2&&digits>=3;}
function candidatesFromText(text){const lines=String(text||'').toUpperCase().split(/\n+/);const out=[];for(const line of lines){const compact=normalize(line).replace(/[IOQ]/g,'');if(compact.length===17)out.push(compact);for(let i=0;i<=compact.length-17;i++)out.push(compact.slice(i,i+17));}return [...new Set(out)].filter(plausible);}

export default function VinCameraScanner({onVin}){
 const inputRef=useRef(null);const[scanning,setScanning]=useState(false);const[message,setMessage]=useState('');
 async function scan(file){
  if(!file)return;setScanning(true);setMessage('Reading the printed VIN…');
  let worker;
  try{
   const {createWorker}=await import('tesseract.js');worker=await createWorker('eng');
   await worker.setParameters({tessedit_char_whitelist:'ABCDEFGHJKLMNPRSTUVWXYZ0123456789',preserve_interword_spaces:'1'});
   const bitmap=await createImageBitmap(file);const w=bitmap.width,h=bitmap.height;
   // VIN plates are normally a long horizontal line. Try the full photo and several horizontal bands.
   const regions=[null,{left:0,top:Math.round(h*.18),width:w,height:Math.round(h*.64)},{left:0,top:Math.round(h*.28),width:w,height:Math.round(h*.44)}];
   let all=[];
   for(const rectangle of regions){const r=await worker.recognize(bitmap,{rectangle});all.push(...candidatesFromText(r?.data?.text));}
   bitmap.close?.();
   all=[...new Set(all)];
   // North-American VINs use a check digit. Prefer a candidate that passes it, but retain support for older/imported vehicles where that rule may not apply.
   const valid=all.filter(checkDigit);const chosen=valid[0]||(all.length===1?all[0]:null);
   if(chosen){onVin(chosen);setMessage(valid.length?'VIN recognized and validated. Please confirm it matches the vehicle.':'Possible VIN found. Please compare all 17 characters with the vehicle before decoding.');}
   else setMessage('No reliable 17-character VIN was found. Take a closer photo with only the VIN line in view, or enter it manually.');
  }catch{setMessage('VIN photo could not be read. You can still enter the VIN manually.');}
  finally{try{await worker?.terminate();}catch{}setScanning(false);if(inputRef.current)inputRef.current.value='';}
 }
 return <div style={{marginTop:'10px'}}><input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={e=>scan(e.target.files?.[0])} style={{display:'none'}}/><button className="secondary" type="button" onClick={()=>inputRef.current?.click()} disabled={scanning}>{scanning?'Reading VIN…':'📷 Scan Printed VIN'}</button>{message&&<p style={{marginBottom:0}} aria-live="polite">{message}</p>}</div>;
}
