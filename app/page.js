import ServiceRequestForm from './ServiceRequestForm';

const services = [
  ['SXS / UTV', 'Engine, transmission, suspension, electrical and general service.', 'sxs'],
  ['ATV', 'Routine maintenance, engine repair, brakes, drivetrain and more.', 'atv'],
  ['Motorcycle / Dirt Bike', 'Engine work, suspension, tuning, maintenance and repairs.', 'motorcycle'],
  ['Auto / Light Truck', 'Diagnostics, repairs and maintenance for passenger vehicles.', 'auto']
];

function ServiceSilhouette({ type }) {
  if (type === 'sxs') {
    return <svg className="serviceIcon detailedVehicleIcon" viewBox="0 0 180 110" aria-hidden="true"><g className="vehicleBody"><path d="M18 78 25 55l20-8 12-27h57l24 28 18 7 8 23h-20c-3-15-14-24-29-24-14 0-25 9-28 24H69c-3-15-14-24-29-24-10 0-18 4-24 11l2 13Zm38-34h28V27H64l-8 17Zm35 0h35l-15-17H91v17Z"/><path d="M49 47h84l5 7H45l4-7Z"/></g><g className="vehicleDetail"><circle cx="40" cy="79" r="18"/><circle cx="115" cy="79" r="18"/><circle cx="40" cy="79" r="8"/><circle cx="115" cy="79" r="8"/><path d="M62 24v29M88 24v29M116 45l10 24M53 52l-9 16M70 58h35"/></g></svg>;
  }
  if (type === 'atv') {
    return <svg className="serviceIcon detailedVehicleIcon" viewBox="0 0 180 110" aria-hidden="true"><g className="vehicleBody"><path d="M17 72 27 55h24l14-20h35l12 13h28l17 13-5 13h-16c-4-14-14-22-28-22-15 0-25 9-29 23H67c-4-14-14-23-29-23-10 0-18 4-24 12l3 8Zm50-39 8-18h23l5 9H84l-4 9H67Zm36-15 28-8 3 7-27 9-4-8Z"/><path d="M48 48h72l8 7H42l6-7Z"/></g><g className="vehicleDetail"><circle cx="38" cy="77" r="19"/><circle cx="109" cy="77" r="19"/><circle cx="38" cy="77" r="8"/><circle cx="109" cy="77" r="8"/><path d="M68 38 58 66M96 35l10 19M74 56h29M119 49l13 13"/></g></svg>;
  }
  if (type === 'motorcycle') {
    return <svg className="serviceIcon detailedVehicleIcon" viewBox="0 0 180 110" aria-hidden="true"><g className="vehicleBody"><path d="M37 71h31l22-34 12 6-16 25h27l-10-35H91v-8h32v8h-11l14 38h-12L91 66l-13 17H57c-4-8-10-12-20-12Zm36-17L57 32H45v-8h24l16 22-12 8Zm32-28 19-14 5 7-20 14-4-7Z"/></g><g className="vehicleDetail"><circle cx="37" cy="78" r="21"/><circle cx="126" cy="78" r="21"/><circle cx="37" cy="78" r="9"/><circle cx="126" cy="78" r="9"/><path d="M37 78 72 54l18 24M72 54l34 3M90 78l20-42M91 66l35 12"/></g></svg>;
  }
  return <svg className="serviceIcon detailedVehicleIcon" viewBox="0 0 180 110" aria-hidden="true"><g className="vehicleBody"><path d="M12 76 20 50l25-9 19-25h57l25 25 20 7 5 28h-18c-4-14-15-23-29-23-15 0-26 9-30 23H67c-4-14-15-23-30-23-10 0-19 4-25 12v11Zm48-36h69l-17-17H72L60 40Z"/><path d="M25 49h126l6 7H20l5-7Z"/></g><g className="vehicleDetail"><circle cx="37" cy="78" r="18"/><circle cx="124" cy="78" r="18"/><circle cx="37" cy="78" r="8"/><circle cx="124" cy="78" r="8"/><path d="M84 22v24M59 44h73M142 47l5 17M23 58h18"/></g></svg>;
}

function ProcessSilhouette({ type }) {
  if (type === 'request') {
    return <svg className="processIcon" viewBox="0 0 120 120" aria-hidden="true"><path d="M39 22h12c2-7 16-7 18 0h12v12H39V22Zm-8 8H20v76h80V30H89v14H31V30Zm8 31h42v8H39v-8Zm0 18h32v8H39v-8Z"/></svg>;
  }
  if (type === 'quote') {
    return <svg className="processIcon" viewBox="0 0 120 120" aria-hidden="true"><path d="M27 12h49l21 21v75H27V12Zm49 8v20h20L76 20ZM43 54h38v7H43v-7Zm0 15h38v7H43v-7Zm0 15h23v7H43v-7Z"/><path d="M76 81c-8 0-14 5-14 12s6 12 14 12 14-5 14-12-6-12-14-12Zm3 18h-6v-3c-4-1-6-3-6-6h6c0 1 1 2 3 2s3-1 3-2c0-1-1-2-4-2-5-1-8-3-8-7 0-3 2-6 6-7v-3h6v3c4 1 6 3 6 6h-6c0-1-1-2-3-2s-3 1-3 2 1 2 4 2c5 1 8 3 8 7 0 3-2 6-6 7v3Z"/></svg>;
  }
  return <svg className="processIcon" viewBox="0 0 120 120" aria-hidden="true"><path d="M11 45h61v40H11V45Zm61 12h19l18 18v10H72V57ZM27 96a12 12 0 1 0 0-24 12 12 0 0 0 0 24Zm65 0a12 12 0 1 0 0-24 12 12 0 0 0 0 24ZM79 63v12h21L89 63H79Z"/><path d="m39 35 8-8 8 8 15-15 7 7-15 15 8 8-7 7-24-22Z"/></svg>;
}

export default function Home() {
  return (
    <main className="customerSite">
      <nav className="nav customerNav">
        <a className="brand customerBrand" href="#top"><span>UW</span><b>ULTIMATE<br/>WRENCHWORKS</b></a>
        <div className="navlinks">
          <a href="#services">Services</a><a href="#process">How It Works</a><a className="navcta" href="#schedule">Schedule Service</a>
        </div>
      </nav>
      <section className="hero heroV119" id="top"><div className="heroLayout"><div className="heroInner"><p className="eyebrow">MOBILE POWERSPORTS & AUTOMOTIVE SERVICE • AUBURN–OPELIKA</p><h1>THE SHOP<br/><em>COMES TO YOU.</em></h1><p className="lead">Mobile repair, diagnostics and maintenance for powersports equipment, passenger vehicles and light trucks — at your home, shop or jobsite.</p><div className="actions"><a className="primary" href="#schedule">▣&nbsp;&nbsp; Schedule Service →</a></div></div></div></section>
      <section className="heroTrustBand" aria-label="service highlights"><div><strong>✓</strong><span>Professional Service</span></div><div><strong>☆</strong><span>Quality Work</span></div><div><strong>◷</strong><span>Convenient & Reliable</span></div></section>
      <section className="section serviceShowcase" id="services"><div className="sectionHeading"><p className="kicker">WHAT WE WORK ON</p><h2>POWERSPORTS TO DAILY DRIVERS.</h2><p>Mobile service designed to keep your machines moving without the hassle of hauling them to a shop.</p></div><div className="grid serviceGrid">{services.map(([title, text, type])=><article className="card serviceCard" key={title}><h3>{title}</h3><p>{text}</p><ServiceSilhouette type={type} /></article>)}</div></section>
      <section className="whySection" id="about"><div className="whyCopy"><p className="kicker">WHY CHOOSE ULTIMATE WRENCHWORKS?</p><h2>LESS HAULING.<br/>MORE RIDING.</h2><div className="whyGrid"><div><strong>⌖</strong><span><b>Mobile Service</b><small>We come to your home, shop or jobsite.</small></span></div><div><strong>⚙</strong><span><b>Experienced Technician</b><small>Practical powersports and automotive repair.</small></span></div><div><strong>✓</strong><span><b>Honest & Reliable</b><small>Clear communication and quality work.</small></span></div><div><strong>$</strong><span><b>Upfront Quotes</b><small>Review your quote before work begins.</small></span></div></div></div></section>
      <section className="processSection" id="process"><p className="kicker">HOW IT WORKS</p><h2>FROM REQUEST TO REPAIR.</h2><div className="processGrid"><div><b>01</b><h3>Request Service</h3><p>Tell us what you have, what it is doing and where it is located.</p><ProcessSilhouette type="request" /></div><div><b>02</b><h3>Review Your Quote</h3><p>We review the request and send your quote for approval.</p><ProcessSilhouette type="quote" /></div><div><b>03</b><h3>We Come To You</h3><p>Once scheduled, mobile service is performed at the approved location.</p><ProcessSilhouette type="mobile" /></div></div></section>
      <section className="schedule" id="schedule"><div className="scheduleIntro"><p className="kicker">READY TO GET ROLLING?</p><h2>REQUEST MOBILE SERVICE.</h2><p>Send your service details below. We’ll review the request and contact you to confirm scheduling.</p></div><ServiceRequestForm /></section>
      <footer className="customerFooter"><div className="brand customerBrand"><span>UW</span><b>ULTIMATE<br/>WRENCHWORKS</b></div><p>Mobile powersports, auto & small-engine service.</p><p>Serving the Auburn–Opelika area.</p><p><a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms & Conditions</a></p><small>© 2026 Ultimate Wrenchworks LLC. All rights reserved.</small></footer>
    </main>
  );
}
