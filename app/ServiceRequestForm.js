'use client';

import { useMemo, useState } from 'react';

const vehicleCatalog = {
  'ATV / UTV': {
    Polaris: ['Ranger', 'RZR', 'General', 'Sportsman', 'Scrambler', 'Outlaw'],
    Can-Am: ['Defender', 'Maverick', 'Commander', 'Outlander', 'Renegade'],
    Honda: ['Pioneer', 'Talon', 'FourTrax Foreman', 'FourTrax Rancher', 'FourTrax Rubicon', 'TRX'],
    Yamaha: ['Wolverine', 'Viking', 'YXZ1000R', 'Grizzly', 'Kodiak', 'Raptor', 'YFZ450R'],
    Kawasaki: ['Mule', 'Teryx', 'KFX', 'Brute Force', 'Prairie', 'Bayou'],
    Suzuki: ['KingQuad', 'QuadSport', 'Eiger', 'Ozark', 'VinSon'],
    'CFMOTO': ['UForce', 'ZForce', 'CForce'],
    'Arctic Cat': ['Prowler', 'Wildcat', 'Alterra', 'TRV'],
    'Kayo': ['S-Series', 'Bull', 'Jackal', 'Fox', 'Predator'],
    'Segway Powersports': ['Fugleman', 'Villain', 'Snarler']
  },
  'Motorcycle / Dirt Bike': {
    Honda: ['CRF', 'CR', 'XR', 'CB', 'CBR', 'Rebel', 'Gold Wing', 'Africa Twin', 'Shadow'],
    Yamaha: ['YZ', 'WR', 'TT-R', 'MT', 'YZF-R', 'Bolt', 'Tenere', 'V Star'],
    Kawasaki: ['KX', 'KLX', 'Ninja', 'Z', 'KLR', 'Vulcan', 'Versys'],
    Suzuki: ['RM-Z', 'DR-Z', 'DR', 'GSX-R', 'GSX', 'V-Strom', 'Boulevard'],
    KTM: ['SX', 'XC', 'EXC', 'Duke', 'RC', 'Adventure'],
    Husqvarna: ['FC', 'TC', 'FE', 'TE', 'Svartpilen', 'Norden'],
    GasGas: ['MC', 'EC', 'EX', 'ES'],
    'Harley-Davidson': ['Sportster', 'Softail', 'Touring', 'Street Glide', 'Road Glide', 'Pan America'],
    'Indian': ['Scout', 'Chief', 'Chieftain', 'Challenger', 'FTR'],
    BMW: ['G Series', 'F Series', 'R Series', 'S Series', 'K Series'],
    Ducati: ['Monster', 'Panigale', 'Multistrada', 'Scrambler', 'Diavel'],
    Triumph: ['Bonneville', 'Tiger', 'Street Triple', 'Speed Triple', 'Rocket 3']
  },
  'Auto / Light Truck': {
    Acura: ['MDX', 'RDX', 'TLX', 'Integra'],
    Buick: ['Enclave', 'Encore', 'Envision', 'Regal'],
    Cadillac: ['Escalade', 'XT4', 'XT5', 'XT6', 'CT4', 'CT5'],
    Chevrolet: ['Silverado 1500', 'Silverado 2500HD', 'Silverado 3500HD', 'Colorado', 'Tahoe', 'Suburban', 'Equinox', 'Traverse', 'Malibu', 'Camaro', 'Corvette'],
    Chrysler: ['300', 'Pacifica', 'Town & Country'],
    Dodge: ['Ram 1500', 'Ram 2500', 'Ram 3500', 'Charger', 'Challenger', 'Durango', 'Journey'],
    Ford: ['F-150', 'F-250 Super Duty', 'F-350 Super Duty', 'Ranger', 'Maverick', 'Bronco', 'Explorer', 'Expedition', 'Escape', 'Mustang', 'Edge'],
    GMC: ['Sierra 1500', 'Sierra 2500HD', 'Sierra 3500HD', 'Canyon', 'Yukon', 'Acadia', 'Terrain'],
    Honda: ['Ridgeline', 'CR-V', 'Pilot', 'Passport', 'Accord', 'Civic', 'Odyssey'],
    Hyundai: ['Santa Cruz', 'Tucson', 'Santa Fe', 'Palisade', 'Elantra', 'Sonata'],
    Jeep: ['Wrangler', 'Gladiator', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade'],
    Kia: ['Telluride', 'Sorento', 'Sportage', 'Soul', 'K5', 'Forte'],
    Lexus: ['RX', 'GX', 'LX', 'NX', 'ES', 'IS'],
    Lincoln: ['Navigator', 'Aviator', 'Nautilus', 'Corsair'],
    Mazda: ['CX-5', 'CX-50', 'CX-9', 'CX-90', 'Mazda3', 'MX-5 Miata'],
    Mercedes-Benz: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'Sprinter'],
    Mitsubishi: ['Outlander', 'Eclipse Cross', 'Mirage'],
    Nissan: ['Frontier', 'Titan', 'Pathfinder', 'Armada', 'Rogue', 'Altima', 'Sentra', 'Maxima'],
    Ram: ['1500', '2500', '3500', 'ProMaster'],
    Subaru: ['Outback', 'Forester', 'Crosstrek', 'Ascent', 'Impreza', 'WRX'],
    Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
    Toyota: ['Tacoma', 'Tundra', '4Runner', 'Sequoia', 'RAV4', 'Highlander', 'Grand Highlander', 'Camry', 'Corolla', 'Sienna'],
    Volkswagen: ['Atlas', 'Tiguan', 'Taos', 'Jetta', 'Golf'],
    Volvo: ['XC40', 'XC60', 'XC90', 'S60', 'S90']
  },
  'Small Engine': {
    Honda: ['GX Series', 'GC Series', 'GCV Series', 'HRX Mower', 'HRN Mower', 'EU Generator'],
    Briggs & Stratton: ['EX Series', 'Professional Series', 'Vanguard', 'Intek', 'P-Series Generator'],
    Kawasaki: ['FJ Series', 'FR Series', 'FS Series', 'FX Series'],
    Kohler: ['Command PRO', 'Confidant', '7000 Series', 'Courage', 'SH Series'],
    'Stihl': ['MS Chainsaw', 'FS Trimmer', 'BR Blower', 'TS Cut-Off Saw', 'KM KombiSystem'],
    Husqvarna: ['Chainsaw', 'Trimmer', 'Blower', 'Riding Mower', 'Zero-Turn Mower'],
    Echo: ['Chainsaw', 'Trimmer', 'Blower', 'Edger'],
    Toro: ['Recycler Mower', 'TimeMaster', 'TimeCutter', 'SnowMaster'],
    'John Deere': ['100 Series', '200 Series', '300 Series', 'ZTrak'],
    Cub Cadet: ['XT Series', 'Ultima ZT', 'SC Mower'],
    'Troy-Bilt': ['Pony', 'Bronco', 'Mustang', 'TB Mower'],
    Generac: ['GP Series', 'XC Series', 'Home Standby'],
    Champion: ['Portable Generator', 'Inverter Generator', 'Pressure Washer'],
    Predator: ['212cc', '301cc', '420cc', 'Generator']
  }
};

const years = Array.from({ length: 48 }, (_, i) => String(2027 - i));

export default function ServiceRequestForm() {
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serviceType, setServiceType] = useState('');
  const [year, setYear] = useState('');
  const [otherYear, setOtherYear] = useState('');
  const [make, setMake] = useState('');
  const [otherMake, setOtherMake] = useState('');
  const [model, setModel] = useState('');
  const [otherModel, setOtherModel] = useState('');
  const [otherVehicle, setOtherVehicle] = useState('');

  const makes = useMemo(() => Object.keys(vehicleCatalog[serviceType] || {}), [serviceType]);
  const models = useMemo(() => (vehicleCatalog[serviceType] || {})[make] || [], [serviceType, make]);
  const selectedYear = year === 'Other / Not Listed' ? otherYear.trim() : year;
  const selectedMake = make === 'Other / Not Listed' ? otherMake.trim() : make;
  const selectedModel = model === 'Other / Not Listed' ? otherModel.trim() : model;
  const vehicle = serviceType === 'Other' ? otherVehicle.trim() : [selectedYear, selectedMake, selectedModel].filter(Boolean).join(' ');

  function changeServiceType(value) {
    setServiceType(value);
    setYear(''); setOtherYear(''); setMake(''); setOtherMake(''); setModel(''); setOtherModel(''); setOtherVehicle('');
  }

  function resetVehicle() {
    setServiceType(''); setYear(''); setOtherYear(''); setMake(''); setOtherMake(''); setModel(''); setOtherModel(''); setOtherVehicle('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    payload.vehicle = vehicle;
    const required = ['name', 'phone', 'serviceType', 'vehicle', 'timeframe', 'location', 'issue'];
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
      if (!response.ok || !result.ok) throw new Error(result.error || 'Unable to submit request.');

      formElement.reset();
      resetVehicle();
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
        <label><span>Service type *</span><select name="serviceType" value={serviceType} onChange={(e)=>changeServiceType(e.target.value)} required><option value="" disabled>Select one</option><option>ATV / UTV</option><option>Motorcycle / Dirt Bike</option><option>Auto / Light Truck</option><option>Small Engine</option><option>Other</option></select></label>

        {serviceType && serviceType !== 'Other' && <>
          <label><span>Year *</span><select value={year} onChange={(e)=>setYear(e.target.value)} required><option value="" disabled>Select year</option>{years.map(y=><option key={y}>{y}</option>)}<option>Other / Not Listed</option></select></label>
          <label><span>Make *</span><select value={make} onChange={(e)=>{setMake(e.target.value);setModel('');setOtherModel('');}} required><option value="" disabled>Select make</option>{makes.map(m=><option key={m}>{m}</option>)}<option>Other / Not Listed</option></select></label>
          {year === 'Other / Not Listed' && <label><span>Year (not listed) *</span><input value={otherYear} onChange={(e)=>setOtherYear(e.target.value)} placeholder="Example: 1978" inputMode="numeric" required /></label>}
          {make === 'Other / Not Listed' && <label><span>Make (not listed) *</span><input value={otherMake} onChange={(e)=>setOtherMake(e.target.value)} placeholder="Enter manufacturer" required /></label>}
          {make && <label className={make === 'Other / Not Listed' ? '' : 'wide'}><span>Model *</span><select value={model} onChange={(e)=>setModel(e.target.value)} required><option value="" disabled>Select model</option>{models.map(m=><option key={m}>{m}</option>)}<option>Other / Not Listed</option></select></label>}
          {model === 'Other / Not Listed' && <label className="wide"><span>Model (not listed) *</span><input value={otherModel} onChange={(e)=>setOtherModel(e.target.value)} placeholder="Enter model" required /></label>}
        </>}

        {serviceType === 'Other' && <label className="wide"><span>Year / Make / Model *</span><input value={otherVehicle} onChange={(e)=>setOtherVehicle(e.target.value)} placeholder="Enter equipment year, make and model" required /></label>}

        <input type="hidden" name="vehicle" value={vehicle} />
        <label><span>Preferred date</span><input name="date" type="date" /></label>
        <label><span>Preferred timeframe *</span><select name="timeframe" defaultValue="" required><option value="" disabled>Select a timeframe</option><option value="Morning 9-12">Morning 9–12</option><option value="Afternoon 12-4">Afternoon 12–4</option><option value="Evening 6-8">Evening 6–8</option></select></label>
        <label className="wide"><span>Service location *</span><input name="location" placeholder="City or address" autoComplete="street-address" required /></label>
        <label className="wide"><span>What is it doing / what service do you need? *</span><textarea name="issue" rows="5" minLength="10" placeholder="Describe the symptoms, maintenance requested, warning lights, noises, leaks, or anything else that will help us prepare." required /></label>
      </div>
      <label className="hpField" aria-hidden="true">Company<input name="company" tabIndex="-1" autoComplete="off" /></label>
      <div className="formFooter"><button className="primary light" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Service Request'}</button><p>A $100 diagnostic fee may apply to diagnostic service. Appointment is confirmed only after we contact you.</p></div>
      {status && <p className={`formStatus ${success ? 'success' : ''}`} role="status">{status}</p>}
    </form>
  );
}
