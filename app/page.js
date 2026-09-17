import ServiceRequestForm from './ServiceRequestForm';

const services = [
  ['SXS / UTV', 'Engine, transmission, suspension, electrical and general service.'],
  ['ATV', 'Routine maintenance, engine repair, brakes, drivetrain and more.'],
  ['Motorcycle / Dirt Bike', 'Engine work, suspension, tuning, maintenance and repairs.'],
  ['Auto / Light Truck', 'Diagnostics, repairs and maintenance for passenger vehicles.']
];

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

      <section className="hero heroV119" id="top">
        <div className="heroLayout">
          <div className="heroInner">
            <p className="eyebrow">MOBILE POWERSPORTS & AUTOMOTIVE SERVICE • AUBURN–OPELIKA</p>
            <h1>THE SHOP<br/><em>COMES TO YOU.</em></h1>
            <p className="lead">Mobile repair, diagnostics and maintenance for powersports equipment, passenger vehicles and light trucks — at your home, shop or jobsite.</p>
            <div className="actions"><a className="primary" href="#schedule">▣&nbsp;&nbsp; Schedule Service →</a></div>
          </div>
        </div>
      </section>

      <section className="heroTrustBand" aria-label="service highlights">
        <div><strong>✓</strong><span>Professional Service</span></div>
        <div><strong>☆</strong><span>Quality Work</span></div>
        <div><strong>◷</strong><span>Convenient & Reliable</span></div>
      </section>

      <section className="section serviceShowcase" id="services">
        <div className="sectionHeading"><p className="kicker">WHAT WE WORK ON</p><h2>POWERSPORTS TO DAILY DRIVERS.</h2><p>Mobile service designed to keep your machines moving without the hassle of hauling them to a shop.</p></div>
        <div className="grid serviceGrid">
          {services.map(([title, text])=><article className="card serviceCard" key={title}><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="whySection" id="about">
        <div className="whyCopy"><p className="kicker">WHY CHOOSE ULTIMATE WRENCHWORKS?</p><h2>LESS HAULING.<br/>MORE RIDING.</h2><div className="whyGrid">
          <div><strong>⌖</strong><span><b>Mobile Service</b><small>We come to your home, shop or jobsite.</small></span></div>
          <div><strong>⚙</strong><span><b>Experienced Technician</b><small>Practical powersports and automotive repair.</small></span></div>
          <div><strong>✓</strong><span><b>Honest & Reliable</b><small>Clear communication and quality work.</small></span></div>
          <div><strong>$</strong><span><b>Upfront Quotes</b><small>Review your quote before work begins.</small></span></div>
        </div></div>
      </section>

      <section className="processSection" id="process">
        <p className="kicker">HOW IT WORKS</p><h2>FROM REQUEST TO REPAIR.</h2>
        <div className="processGrid">
          <div><b>01</b><h3>Request Service</h3><p>Tell us what you have, what it is doing and where it is located.</p><ProcessSilhouette type="request" /></div>
          <div><b>02</b><h3>Review Your Quote</h3><p>We review the request and send your quote for approval.</p><ProcessSilhouette type="quote" /></div>
          <div><b>03</b><h3>We Come To You</h3><p>Once scheduled, mobile service is performed at the approved location.</p><ProcessSilhouette type="mobile" /></div>
        </div>
      </section>

      <section className="schedule" id="schedule"><div className="scheduleIntro"><p className="kicker">READY TO GET ROLLING?</p><h2>REQUEST MOBILE SERVICE.</h2><p>Send your service details below. We’ll review the request and contact you to confirm scheduling.</p></div><ServiceRequestForm /></section>
      <footer className="customerFooter"><div className="brand customerBrand"><span>UW</span><b>ULTIMATE<br/>WRENCHWORKS</b></div><p>Mobile powersports, auto & small-engine service.</p><p>Serving the Auburn–Opelika area.</p><p><a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms & Conditions</a></p><small>© 2026 Ultimate Wrenchworks LLC. All rights reserved.</small></footer>
    </main>
  );
}
