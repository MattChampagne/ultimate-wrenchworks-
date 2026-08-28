'use client';

import { useState } from 'react';

export default function ServiceRequestForm() {
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    const required = ['name', 'phone', 'serviceType', 'vehicle', 'location', 'issue'];
    const missing = required.some((key) => !String(payload[key] || '').trim());

    if (missing) {
      setSuccess(false);
      setStatus('Please complete all required fields before submitting.');
      return;
    }

    setSubmitting(true);
    setSuccess(false);
    setStatus('Submitting your service request…');

    try {
      const response = await fetch('/api/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Unable to submit request.');
      }

      formElement.reset();
      setSuccess(true);
      setStatus('Request received. We’ll review the details and contact you to confirm scheduling.');
    } catch (error) {
      setSuccess(false);
      setStatus(error.message || 'We could not save your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="requestForm" onSubmit={handleSubmit} noValidate>
      <div className="formGrid">
        <label><span>Name *</span><input name="name" autoComplete="name" required /></label>
        <label><span>Phone *</span><input name="phone" type="tel" autoComplete="tel" required /></label>
        <label><span>Email</span><input name="email" type="email" autoComplete="email" /></label>
        <label><span>Service type *</span><select name="serviceType" defaultValue="" required><option value="" disabled>Select one</option><option>ATV / UTV</option><option>Motorcycle / Dirt Bike</option><option>Auto / Light Truck</option><option>Small Engine</option><option>Other</option></select></label>
        <label className="wide"><span>Year / Make / Model *</span><input name="vehicle" placeholder="Example: 2022 Polaris Ranger 1000" required /></label>
        <label><span>Preferred date</span><input name="date" type="date" /></label>
        <label><span>Service location *</span><input name="location" placeholder="City or address" autoComplete="street-address" required /></label>
        <label className="wide"><span>What is it doing / what service do you need? *</span><textarea name="issue" rows="5" minLength="10" placeholder="Describe the symptoms, maintenance requested, warning lights, noises, leaks, or anything else that will help us prepare." required /></label>
      </div>
      <label className="hpField" aria-hidden="true">Company<input name="company" tabIndex="-1" autoComplete="off" /></label>
      <div className="formFooter"><button className="primary light" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Service Request'}</button><p>A $100 diagnostic fee may apply to diagnostic service. Appointment is confirmed only after we contact you.</p></div>
      {status && <p className={`formStatus ${success ? 'success' : ''}`} role="status">{status}</p>}
    </form>
  );
}
