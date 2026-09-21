import { NextResponse } from 'next/server';
const SB='https://vxptgfnuxboprwhgcxpd.supabase.co';
export async function GET(req){
 try{
  const code=new URL(req.url).searchParams.get('code'); if(!code)throw new Error('Missing authorization code');
  const body=new URLSearchParams({code,client_id:process.env.GOOGLE_CALENDAR_CLIENT_ID||'',client_secret:process.env.GOOGLE_CALENDAR_CLIENT_SECRET||'',redirect_uri:'https://ultimatewrenchworks.com/api/google-calendar/callback',grant_type:'authorization_code'});
  const tr=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  const t=await tr.json(); if(!tr.ok||!t.refresh_token)throw new Error(t.error_description||'Google authorization failed');
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY; if(!key)throw new Error('Server database credential is not configured');
  const r=await fetch(SB+'/rest/v1/calendar_integrations',{method:'POST',headers:{apikey:key,authorization:'Bearer '+key,'content-type':'application/json',prefer:'resolution=merge-duplicates'},body:JSON.stringify({provider:'google',calendar_id:'47891c1e1971a661c0437301a7e976164b14e903b3c79c8b34062078add6f9a5@group.calendar.google.com',refresh_token:t.refresh_token,enabled:true})});
  if(!r.ok)throw new Error('Could not save calendar authorization');
  return NextResponse.redirect('https://ultimatewrenchworks.com/owner?calendar=connected');
 }catch(e){return NextResponse.redirect('https://ultimatewrenchworks.com/owner?calendar=error');}
}