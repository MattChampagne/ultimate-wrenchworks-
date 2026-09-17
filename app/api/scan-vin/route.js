import { NextResponse } from 'next/server';

export const runtime='nodejs';
export const maxDuration=30;

const VIN_RE=/^[A-HJ-NPR-Z0-9]{17}$/;
const translit={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9};
const weights=[8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];
function checkDigit(v){let sum=0;for(let i=0;i<17;i++){const c=v[i],n=/\d/.test(c)?Number(c):translit[c];if(n==null)return false;sum+=n*weights[i];}const r=sum%11;return v[8]===(r===10?'X':String(r));}
function plausible(v){return VIN_RE.test(v)&&!/[IOQ]/.test(v)&&(v.match(/[A-Z]/g)||[]).length>=2&&(v.match(/\d/g)||[]).length>=3;}
function candidates(text){const raw=String(text||'').toUpperCase();const out=[];for(const line of raw.split(/\n+/)){const c=line.replace(/[^A-Z0-9]/g,'');if(c.length===17)out.push(c);for(let i=0;i<=c.length-17;i++)out.push(c.slice(i,i+17));}const joined=raw.replace(/[^A-Z0-9]/g,'');for(let i=0;i<=joined.length-17;i++)out.push(joined.slice(i,i+17));return [...new Set(out)].filter(plausible);}

export async function GET(){
 const configured=Boolean(process.env.GOOGLE_VISION_API_KEY);
 return NextResponse.json({service:'vin-ocr',provider:'google-vision',configured,version:'V1.66'});
}

export async function POST(request){
 try{
  const apiKey=process.env.GOOGLE_VISION_API_KEY;
  if(!apiKey){console.error('VIN OCR configuration missing',{googleVisionApiKeyPresent:false,version:'V1.66'});return NextResponse.json({error:'VIN photo recognition is being configured. Please enter the VIN manually for now.',configured:false,version:'V1.66'},{status:503});}
  const form=await request.formData();const file=form.get('image');
  if(!file||typeof file.arrayBuffer!=='function')return NextResponse.json({error:'VIN photo is required.'},{status:400});
  if(file.size>6*1024*1024)return NextResponse.json({error:'Photo is too large. Please take a closer photo of only the VIN.'},{status:413});
  const content=Buffer.from(await file.arrayBuffer()).toString('base64');
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
  let response;
  try{
   response=await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{image:{content},features:[{type:'TEXT_DETECTION',maxResults:10}],imageContext:{languageHints:['en']}}]}),signal:controller.signal,cache:'no-store'});
  }finally{clearTimeout(timer);}
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data?.responses?.[0]?.error){console.error('Google Vision VIN OCR failed',response.status,data?.responses?.[0]?.error||data);return NextResponse.json({error:'VIN photo recognition is temporarily unavailable. Please enter the VIN manually or try again.'},{status:502});}
  const text=data?.responses?.[0]?.fullTextAnnotation?.text||data?.responses?.[0]?.textAnnotations?.[0]?.description||'';
  const found=candidates(text);const checked=found.filter(checkDigit);const vin=checked[0]||(found.length===1?found[0]:null);
  if(!vin)return NextResponse.json({vin:null,message:'No reliable 17-character VIN was found. Retake the photo closer so the printed VIN fills most of the frame.'});
  return NextResponse.json({vin,validated:checked.includes(vin)});
 }catch(e){console.error('server VIN OCR failed',e);return NextResponse.json({error:e?.name==='AbortError'?'VIN recognition timed out. Please try again.':'The VIN photo could not be processed.'},{status:e?.name==='AbortError'?504:500});}
}
