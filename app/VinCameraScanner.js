'use client';

import { useRef, useState } from 'react';

const cleanVin=value=>String(value||'').toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g,'');
const vinPattern=/[A-HJ-NPR-Z0-9]{17}/g;

export default function VinCameraScanner({onVin}){
 const inputRef=useRef(null);
 const[scanning,setScanning]=useState(false);
 const[message,setMessage]=useState('');

 async function scan(file){
  if(!file)return;
  setScanning(true);setMessage('Reading VIN from photo…');
  try{
   // First try a barcode in browsers that provide the native detector.
   if('BarcodeDetector' in globalThis){
    try{
     const bitmap=await createImageBitmap(file);
     const detector=new BarcodeDetector();
     const codes=await detector.detect(bitmap);
     bitmap.close?.();
     for(const code of codes){
      const candidate=cleanVin(code.rawValue);
      const match=candidate.match(vinPattern)?.[0];
      if(match){onVin(match);setMessage('VIN scanned. Please confirm it is correct.');setScanning(false);return;}
     }
    }catch{}
   }

   // Printed VIN fallback: OCR runs in the browser; the photo is not uploaded by this scanner.
   const {createWorker}=await import('tesseract.js');
   const worker=await createWorker('eng');
   const result=await worker.recognize(file);
   await worker.terminate();
   const compact=cleanVin(result?.data?.text);
   const matches=compact.match(vinPattern)||[];
   if(matches.length){onVin(matches[0]);setMessage('VIN read from photo. Please confirm it is correct.');}
   else setMessage('We could not confidently read a 17-character VIN. Try a closer, well-lit photo or enter it manually.');
  }catch{
   setMessage('VIN photo could not be read. You can still enter the VIN manually.');
  }finally{setScanning(false);if(inputRef.current)inputRef.current.value='';}
 }

 return <div style={{marginTop:'10px'}}>
  <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={e=>scan(e.target.files?.[0])} style={{display:'none'}} />
  <button className="secondary" type="button" onClick={()=>inputRef.current?.click()} disabled={scanning}>{scanning?'Reading VIN…':'📷 Scan VIN with Camera'}</button>
  {message&&<p style={{marginBottom:0}} aria-live="polite">{message}</p>}
 </div>;
}
