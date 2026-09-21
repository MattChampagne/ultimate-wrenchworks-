import { NextResponse } from 'next/server';
export async function GET(){
 const id=process.env.GOOGLE_CALENDAR_CLIENT_ID;
 if(!id)return NextResponse.json({error:'Google Calendar is not configured.'},{status:500});
 const redirect='https://ultimatewrenchworks.com/api/google-calendar/callback';
 const p=new URLSearchParams({client_id:id,redirect_uri:redirect,response_type:'code',access_type:'offline',prompt:'consent',scope:'https://www.googleapis.com/auth/calendar.freebusy'});
 return NextResponse.redirect('https://accounts.google.com/o/oauth2/v2/auth?'+p.toString());
}