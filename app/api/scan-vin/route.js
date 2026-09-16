import { NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';

export const runtime='nodejs';
export const maxDuration=60;

const VIN_RE=/^[A-HJ-NPR-Z0-9]{17}$/;
const translit={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9};
const weights=[8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];
function checkDigit(v){let sum=0;for(let i=0;i<17;i++){const c=v[i],n=/\d/.test(c)?Number(c):translit[c];if(n==null)return false;sum+=n*weights[i];}const r=sum%11;return v[8]===(r===10?'X':String(r));}
function plausible(v){return VIN_RE.test(v)&&!/[IOQ]/.test(v)&&(v.match(/[A-Z]/g)||[]).length>=2&&(v.match(/\d/g)||[]).length>=3;}
function candidates(text){const out=[];for(const line of String(text||'').toUpperCase().split(/\n+/)){const c=line.replace(/[^A-Z0-9]/g,'').replace(/[IOQ]/g,'');if(c.length===17)out.push(c);for(let i=0;i<=c.length-17;i++)out.push(c.slice(i,i+17));}return [...new Set(out)].filter(plausible);}

export async function POST(request){
 let worker;
 try{
  const form=await request.formData();const file=form.get('image');
  if(!file||typeof file.arrayBuffer!=='function')return NextResponse.json({error:'VIN photo is required.'},{status:400});
  if(file.size>12*1024*1024)return NextResponse.json({error:'Photo is too large. Please take a closer photo of only the VIN.'},{status:413});
  const buffer=Buffer.from(await file.arrayBuffer());
  worker=await createWorker('eng');
  await worker.setParameters({tessedit_char_whitelist:'ABCDEFGHJKLMNPRSTUVWXYZ0123456789',tessedit_pageseg_mode:'7'});
  const result=await worker.recognize(buffer);const found=candidates(result?.data?.text);const checked=found.filter(checkDigit);const vin=checked[0]||(found.length===1?found[0]:null);
  if(!vin)return NextResponse.json({vin:null,message:'No reliable 17-character VIN was found. Retake the photo closer so the printed VIN fills most of the frame.'});
  return NextResponse.json({vin,validated:checked.includes(vin)});
 }catch(e){console.error('server VIN OCR failed',e);return NextResponse.json({error:'The VIN photo could not be processed.'},{status:500});}
 finally{try{await worker?.terminate();}catch{}}
}
