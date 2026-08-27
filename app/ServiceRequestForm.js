'use client';

import { useState } from 'react';

export default function ServiceRequestForm() {
  const [status, setStatus] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const required = ['name', 'phone', 'serviceType', 'vehicle', 'issue'];
    const missing = required.some((key) => !String(form.get(key) || '').trim());

    if (missing) {
      setStatus('Please complete the required fields before continuing.');
      return;
    }

    const subject = encodeURIComponent(`Service Request - ${form.get('name')}`);
    const body = encodeURIComponent([
      `Name: ${form.get('name')}`,
      `Phone: ${form.get('phone')}`,
      `Email: ${form.get('email') || 'Not provided'}`,
      `Service needed: ${form.get('serviceType')}`,
      `Year / Make / Model: ${form.get('vehicle')}`,
      `Preferred date: ${form.get('date') || 'Flexible'}`,
      `Service location: ${form.get('location') || 'To be confirmed'}`,
      '',
      'Problem / requested work:',
      form.get('issue'),
      '',
      'I understand a $100 diagnostic fee may apply to diagnostic service.'
    ].join('\n'));

    setStatus('Opening your email app with the service request filled in.');
    window.location.href = `mailto:service@ultimatewrenchworks.com?subject=${subject}&body=${body}`;
  }

  return (
    <form className="requestForm" onSubmit={handleSubmit} noValidate>
      <div className="formGrid">
        <label><span>Name *</span><input name="name" autoComplete="name" /></label>
        <label><span>Phone *</span><input name="phone" type="tel" autoComplete="tel" /></label>
        <label><span>Email</span><input name="email" type="email" autoComplete="email" /></label>
        <label><span>Service type *</span><select name="serviceType" defaultValue=""><option value="" disabled>Select one</option><option>ATV / UTV</option><option>Motorcycle / Dirt Bike</option><option>Auto / Light Truck</option><option>Small Engine</option><option>Other</option></select></label>
        <label className="wide"><span>Year / Make / Model *</span><input name="vehicle" placeholder="Example: 2022 Polaris Ranger 1000" /></label>
        <label><span>Preferred date</span><input name="date" type="date" /></label>
        <label><span>Service location</span><input name="location" placeholder="City or address" autoComplete="street-address" /></label>
        <label className="wide"><span>What is it doing / what service do you need? *</span><textarea name="issue" rows="5" placeholder="Describe the symptoms, maintenance requested, warning lights, noises, leaks, or anything else that will help us prepare." /></label>
      </div>
      <div className="formFooter"><button className="primary light" type="submit">Prepare Service Request</button><p>A $100 diagnostic fee may apply to diagnostic service. Appointment is confirmed only after we contact you.</p></div>
      {status && <p className="formStatus" role="status">{status}</p>}
    </form>
  );
}
