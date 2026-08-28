'use client';

import { useEffect, useState } from 'react';

const years = Array.from({ length: 48 }, (_, i) => String(2027 - i));

export default function ServiceRequestForm() {
  const [status,setStatus]=useState('');
  const [submitting,setSubmitting]=useState(false);
  const [success,setSuccess]=useState(false);
  const [serviceType,setServiceType]=useState('');
  const [year,setYear]=useState('');
  const [otherYear,setOtherYear]=useState('');
  const [make,setMake]=useState('');
  const [otherMake,setOtherMake]=useState('');
  const [model,setModel]=useState('');
  const [otherModel,setOtherModel]=useState('');
  const [otherVehicle,setOtherVehicle]=useState('');
  const [makes,setMakes]=useState([]);
  const [models,setModels]=useState([]);
  const [loadingMakes,setLoadingMakes]=useState(false);
  const [loadingModels,setLoadingModels]=useState(false);

  const selectedYear=year==='Other / Not Listed'?otherYear.trim():year;
  const selectedMake=make==='Other / Not Listed'?otherMake.trim():make;
  const selectedModel=model==='Other / Not Listed'?otherModel.trim():model;
  const vehicle=serviceType==='Other'?otherVehicle.trim():[selectedYear,selectedMake,selectedModel].filter(Boolean).join(' ');

  useEffect(()=>{
    if(!serviceType||serviceType==='Other'||!year||year==='Other / Not Listed'){setMakes([]);setMake('');setModels([]);setModel('');return;}
    let cancelled=false;
    setLoadingMakes(true);setMake('');setModels([]);setModel('');
    fetch(`/api/vehicle-options?type=${encodeURIComponent(serviceType)}&year=${encodeURIComponent(year)}`)
      .then(r=>r.json()).then(data=>{if(!cancelled)setMakes(data.makes||[]);})
      .catch(()=>{if(!cancelled)setMakes([]);}).finally(()=>{if(!cancelled)setLoadingMakes(false);});
    return()=>{cancelled=true;};
  },[serviceType,year]);

  useEffect(()=>{
    if(!serviceType||!year||year==='Other / Not Listed'||!make||make==='Other / Not Listed'){setModels([]);setModel('');return;}
    let cancelled=false;
    setLoadingModels(true);setModel('');
    fetch(`/api/vehicle-options?type=${encodeURIComponent(serviceType)}&year=${encodeURIComponent(year)}&make=${encodeURIComponent(make)}`)
      .then(r=>r.json()).then(data=>{if(!cancelled)setModels(data.models||[]);})
      .catch(()=>{if(!cancelled)setModels([]);}).finally(()=>{if(!cancelled)setLoadingModels(false);});
    return()=>{cancelled=true;};
  },[serviceType,year,make]);

  function changeServiceType(value){setServiceType(value);setYear('');setOtherYear('');setMake('');setOtherMake('');setModel('');setOtherModel('');setOtherVehicle('');setMakes([]);setModels([]);}
  function resetVehicle(){changeServiceType('');}

  async function handleSubmit(event){
    event.preventDefault();if(submitting)return;
    const formElement=event.currentTarget;const form=new FormData(formElement);const payload=Object.fromEntries(form.entries());payload.vehicle=vehicle;
    const required=['name','phone','serviceType','vehicle','timeframe','location','issue'];
    if(required.some(key=>!String(payload[key]||'').trim())){setSuccess(false);setStatus('Please complete all required fields before submitting.');return;}
    setSubmitting(true);setSuccess(false);setStatus('Submitting your service request…');
    try{
      const response=await fetch('/api/service-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.error||'Unable to submit request.');
      formElement.reset();resetVehicle();setSuccess(true);setStatus('Request received. We’ll review the details and contact you to confirm scheduling.');
    }catch(error){setSuccess(false);setStatus(error.message||'We could not save your request. Please try again.');}finally{setSubmitting(false);}
  }

  return <form className="requestForm" onSubmit={handleSubmit} noValidate><div className="formGrid">
    <label><span>Name *</span><input name="name" autoComplete="name" required /></label>
    <label><span>Phone *</span><input name="phone" type="tel" autoComplete="tel" required /></label>
    <label><span>Email</span><input name="email" type="email" autoComplete="email" /></label>
    <label><span>Service type *</span><select name="serviceType" value={serviceType} onChange={e=>changeServiceType(e.target.value)} required><option value="" disabled>Select one</option><option>ATV</option><option>SXS / UTV</option><option>Motorcycle / Dirt Bike</option><option>Auto / Light Truck</option><option>Small Engine</option><option>Other</option></select></label>

    {serviceType&&serviceType!=='Other'&&<>
      <label><span>Year *</span><select value={year} onChange={e=>{setYear(e.target.value);setOtherYear('');setOtherMake('');setOtherModel('');}} required><option value="" disabled>Select year</option>{years.map(y=><option key={y}>{y}</option>)}<option>Other / Not Listed</option></select></label>
      {year==='Other / Not Listed'?<>
        <label><span>Year (not listed) *</span><input value={otherYear} onChange={e=>setOtherYear(e.target.value)} placeholder="Example: 1978" inputMode="numeric" required /></label>
        <label><span>Make *</span><input value={otherMake} onChange={e=>setOtherMake(e.target.value)} placeholder="Enter manufacturer" required /></label>
        <label className="wide"><span>Model *</span><input value={otherModel} onChange={e=>setOtherModel(e.target.value)} placeholder="Enter model" required /></label>
      </>:year&&<>
        <label><span>Make *</span><select value={make} onChange={e=>{setMake(e.target.value);setOtherMake('');setOtherModel('');}} required disabled={loadingMakes}><option value="" disabled>{loadingMakes?'Loading makes…':'Select make'}</option>{makes.map(m=><option key={m}>{m}</option>)}<option>Other / Not Listed</option></select></label>
        {make==='Other / Not Listed'&&<label><span>Make (not listed) *</span><input value={otherMake} onChange={e=>setOtherMake(e.target.value)} placeholder="Enter manufacturer" required /></label>}
        {make&&make!=='Other / Not Listed'&&<label className="wide"><span>Model *</span><select value={model} onChange={e=>setModel(e.target.value)} required disabled={loadingModels}><option value="" disabled>{loadingModels?'Loading models…':'Select model'}</option>{models.map(m=><option key={m}>{m}</option>)}<option>Other / Not Listed</option></select></label>}
        {make==='Other / Not Listed'&&<label className="wide"><span>Model *</span><input value={otherModel} onChange={e=>setOtherModel(e.target.value)} placeholder="Enter model" required /></label>}
        {model==='Other / Not Listed'&&<label className="wide"><span>Model (not listed) *</span><input value={otherModel} onChange={e=>setOtherModel(e.target.value)} placeholder="Enter model" required /></label>}
      </>}
    </>}

    {serviceType==='Other'&&<label className="wide"><span>Year / Make / Model *</span><input value={otherVehicle} onChange={e=>setOtherVehicle(e.target.value)} placeholder="Enter equipment year, make and model" required /></label>}
    <input type="hidden" name="vehicle" value={vehicle} />
    <label><span>Preferred date</span><input name="date" type="date" /></label>
    <label><span>Preferred timeframe *</span><select name="timeframe" defaultValue="" required><option value="" disabled>Select a timeframe</option><option value="Morning 9-12">Morning 9–12</option><option value="Afternoon 12-4">Afternoon 12–4</option><option value="Evening 6-8">Evening 6–8</option></select></label>
    <label className="wide"><span>Service location *</span><input name="location" placeholder="City or address" autoComplete="street-address" required /></label>
    <label className="wide"><span>What is it doing / what service do you need? *</span><textarea name="issue" rows="5" minLength="10" placeholder="Describe the symptoms, maintenance requested, warning lights, noises, leaks, or anything else that will help us prepare." required /></label>
  </div><label className="hpField" aria-hidden="true">Company<input name="company" tabIndex="-1" autoComplete="off" /></label><div className="formFooter"><button className="primary light" type="submit" disabled={submitting}>{submitting?'Submitting…':'Submit Service Request'}</button><p>A $100 diagnostic fee may apply to diagnostic service. Appointment is confirmed only after we contact you.</p></div>{status&&<p className={`formStatus ${success?'success':''}`} role="status">{status}</p>}</form>;
}
