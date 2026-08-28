'use client';

import { useEffect, useState } from 'react';

const SUPABASE_URL = 'https://vxptgfnuxboprwhgcxpd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Wu0xH_TZ9L5t72BnROPtnw_9eJbG88T';

async function sb(path, options = {}, token) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token || SUPABASE_KEY}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
    cache: 'no-store'
  });
}

export default function OwnerInbox() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(accessToken) {
    setLoading(true);
    const res = await sb('/rest/v1/public_service_requests_v1?select=*&order=created_at.desc&limit=100', {}, accessToken);
    if (res.ok) { setRequests(await res.json()); setMessage(''); }
    else if (res.status === 401) { setToken(''); localStorage.removeItem('uw_owner_token'); setMessage('Your session expired. Please sign in again.'); }
    else setMessage('Unable to load requests. This account may not have staff access.');
    setLoading(false);
  }

  useEffect(() => { const saved = localStorage.getItem('uw_owner_token'); if (saved) { setToken(saved); load(saved); } }, []);

  async function login(e) {
    e.preventDefault(); setLoading(true); setMessage('');
    const res = await sb('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok || !data.access_token) { setMessage('Sign-in failed. Check your email and password.'); setLoading(false); return; }
    localStorage.setItem('uw_owner_token', data.access_token); setToken(data.access_token); setPassword(''); await load(data.access_token);
  }

  async function setStatus(id, status) {
    const res = await sb(`/rest/v1/public_service_requests_v1?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status }) }, token);
    if (res.ok) load(token); else setMessage('Could not update that request.');
  }

  function logout() { localStorage.removeItem('uw_owner_token'); setToken(''); setRequests([]); setEmail(''); }

  if (!token) return <main className="ownerPage"><section className="ownerLogin"><p className="kicker">ULTIMATE WRENCHWORKS · V1.1</p><h1>Owner Inbox</h1><p>Private access for incoming website service requests.</p><form onSubmit={login}><label><span>Email</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label><label><span>Password</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label><button className="primary" disabled={loading}>{loading?'Signing in…':'Sign In'}</button></form>{message&&<p className="ownerMessage">{message}</p>}<a href="/">← Back to website</a></section></main>;

  return <main className="ownerPage"><div className="ownerTop"><div><p className="kicker">ULTIMATE WRENCHWORKS · V1.1</p><h1>Service Request Inbox</h1></div><div className="ownerActions"><button onClick={()=>load(token)}>{loading?'Refreshing…':'Refresh'}</button><button onClick={logout}>Sign Out</button></div></div>{message&&<p className="ownerMessage">{message}</p>}<p className="ownerCount">{requests.length} request{requests.length===1?'':'s'} shown</p><section className="requestList">{requests.length===0&&!loading?<div className="emptyInbox">No website requests yet.</div>:requests.map(r=><article className="requestItem" key={r.id}><div className="requestHead"><div><span className="statusPill">{r.status}</span><h2>{r.customer_name}</h2><p>{r.service_type} · {r.year_make_model}</p></div><time>{new Date(r.created_at).toLocaleString()}</time></div><div className="requestDetails"><div><b>Phone</b><a href={`tel:${r.phone}`}>{r.phone}</a></div><div><b>Email</b>{r.email?<a href={`mailto:${r.email}`}>{r.email}</a>:<span>Not provided</span>}</div><div><b>Preferred date</b><span>{r.preferred_date||'Flexible'}</span></div><div><b>Location</b><span>{r.service_location}</span></div></div><div className="requestProblem"><b>Customer notes</b><p>{r.problem_description}</p></div><div className="statusButtons"><span>Set status:</span>{['new','contacted','scheduled','closed'].map(s=><button key={s} className={r.status===s?'active':''} onClick={()=>setStatus(r.id,s)}>{s}</button>)}</div></article>)}</section></main>;
}
