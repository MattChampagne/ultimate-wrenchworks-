import ServiceRequestForm from './ServiceRequestForm';
import { logoData } from './logoData';

const services = [
  ['SXS / UTV', 'Engine, transmission, suspension, electrical and general service.', 'SXS'],
  ['ATV', 'Routine maintenance, engine repair, brakes, drivetrain and more.', 'ATV'],
  ['Motorcycle / Dirt Bike', 'Engine work, suspension, tuning, maintenance and repairs.', 'BIKE'],
  ['Auto / Light Truck', 'Diagnostics, repairs and maintenance for passenger vehicles.', 'AUTO']
];

export default function Home() {
  return (
    <main className="customerSite">
      <nav className="nav customerNav">
        <a className="brand customerBrand" href="#top"><span>UW</span><b>ULTIMATE<br/>WRENCHWORKS</b></a>
        <div className="navlinks">
          <a href="#top">Home</a><a href="#services">Services</a><a href="#about">About</a><a href="#process">How It Works</a><a href="#schedule">Contact</a><a className="navcta" href="#schedule">Schedule Service</a>
        </div>
      </nav>

      <section className="hero heroV119" id="top">
        <div className="heroLayout">
          <div className="heroInner">
            <p className="eyebrow">MOBILE POWERSPORTS & AUTOMOTIVE SERVICE • AUBURN–OPELIKA</p>
            <h1>THE SHOP<br/><em>COMES TO YOU.</em></h1>
            <p className="lead">Mobile repair, diagnostics and maintenance for powersports equipment, passenger vehicles and light trucks — at your home, shop or jobsite.</p>
            <div className="actions"><a className="primary" href="#schedule">▣&nbsp;&nbsp; Schedule Service →</a><a className="secondary" href="#schedule">Get a Quote →</a></div>
          </div>
          <div className="heroLogoWrap"><img className="heroLogo" src={logoData} alt="Ultimate Wrenchworks" /></div>
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
          {services.map(([title, text, mark])=><article className="card serviceCard" key={title}><div className="serviceMark"><span>{mark}</span></div><h3>{title}</h3><p>{text}</p><a href="#schedule">Request service →</a></article>)}
        </div>
      </section>

      <section className="whySection" id="about">
        <div className="whyVisual"><div className="trailerScene"><span>UW</span><b>MOBILE SERVICE</b><small>Professional repair where your equipment already is.</small></div></div>
        <div className="whyCopy"><p className="kicker">WHY CHOOSE ULTIMATE WRENCHWORKS?</p><h2>LESS HAULING.<br/>MORE RIDING.</h2><div className="whyGrid">
          <div><strong>⌖</strong><span><b>Mobile Service</b><small>We come to your home, shop or jobsite.</small></span></div>
          <div><strong>⚙</strong><span><b>Experienced Technician</b><small>Practical powersports and automotive repair.</small></span></div>
          <div><strong>✓</strong><span><b>Honest & Reliable</b><small>Clear communication and quality work.</small></span></div>
          <div><strong>$</strong><span><b>Upfront Quotes</b><small>Review your quote before work begins.</small></span></div>
        </div></div>
      </section>

      <section className="processSection" id="process">
        <p className="kicker">HOW IT WORKS</p><h2>FROM REQUEST TO REPAIR.</h2>
        <div className="processGrid"><div><b>01</b><h3>Request Service</h3><p>Tell us what you have, what it is doing and where it is located.</p></div><div><b>02</b><h3>Review Your Quote</h3><p>We review the request and send your quote for approval.</p></div><div><b>03</b><h3>We Come To You</h3><p>Once scheduled, mobile service is performed at the approved location.</p></div></div>
      </section>

      <section className="schedule" id="schedule"><div className="scheduleIntro"><p className="kicker">READY TO GET ROLLING?</p><h2>REQUEST MOBILE SERVICE.</h2><p>Send your service details below. We’ll review the request and contact you to confirm scheduling.</p></div><ServiceRequestForm /></section>
      <footer className="customerFooter"><div className="brand customerBrand"><span>UW</span><b>ULTIMATE<br/>WRENCHWORKS</b></div><p>Mobile powersports, auto & small-engine service.</p><p>Serving the Auburn–Opelika area.</p><small>© 2026 Ultimate Wrenchworks LLC. All rights reserved.</small></footer>
    </main>
  );
}
