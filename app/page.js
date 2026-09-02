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
    <main>
      <nav className="nav customerNav">
        <a className="brand" href="#top"><span>UW</span> ULTIMATE WRENCHWORKS</a>
        <div className="navlinks">
          <a href="#top">Home</a><a href="#services">Services</a><a href="#about">About</a><a href="#schedule">Contact</a><a className="navcta" href="#schedule">Schedule Service</a>
        </div>
      </nav>

      <section className="hero heroV119" id="top">
        <div className="heroLayout">
          <div className="heroInner">
            <p className="eyebrow">MOBILE POWERSPORTS & AUTOMOTIVE SERVICE • AUBURN–OPELIKA</p>
            <h1>THE SHOP<br/><em>COMES TO YOU.</em></h1>
            <p className="lead">Mobile repair, diagnostics and maintenance for powersports equipment, passenger vehicles and light trucks — at your home, shop or jobsite.</p>
            <div className="actions"><a className="primary" href="#schedule">Schedule Service</a><a className="secondary" href="#services">What We Work On</a></div>
            <div className="trust heroTrust"><span>✓ Professional service</span><span>✓ Convenient & reliable</span><span>✓ Clear communication</span></div>
          </div>
          <div className="heroLogoWrap"><img className="heroLogo" src={logoData} alt="Ultimate Wrenchworks" /></div>
        </div>
      </section>

      <section className="section serviceShowcase" id="services">
        <div className="sectionHeading"><p className="kicker">WHAT WE WORK ON</p><h2>POWERSPORTS TO DAILY DRIVERS.</h2><p>One mobile service operation built to keep your machines moving.</p></div>
        <div className="grid serviceGrid">
          {services.map(([title, text, mark])=><article className="card serviceCard" key={title}><div className="serviceMark">{mark}</div><h3>{title}</h3><p>{text}</p><a href="#schedule">Request service →</a></article>)}
        </div>
      </section>

      <section className="benefitStrip">
        <div><strong>⌖</strong><span><b>Mobile Service</b><small>We come to your home, shop or jobsite.</small></span></div>
        <div><strong>⚙</strong><span><b>Experienced Technician</b><small>Practical powersports and automotive repair.</small></span></div>
        <div><strong>✓</strong><span><b>Honest & Reliable</b><small>Clear communication and quality work.</small></span></div>
        <div><strong>$</strong><span><b>Upfront Quotes</b><small>Review your quote before work begins.</small></span></div>
      </section>

      <section className="split" id="about"><div><p className="kicker">BUILT AROUND THE CUSTOMER</p><h2>LESS HAULING.<br/>LESS WAITING.<br/><em>MORE RIDING.</em></h2></div><div className="copy"><p>Getting a machine to a repair shop can be half the problem. Ultimate Wrenchworks brings capable mechanical service directly to you, reducing downtime and making routine maintenance easier to stay ahead of.</p><p>We focus on clear communication, practical repairs and doing the job right.</p></div></section>

      <section className="schedule" id="schedule"><div className="scheduleIntro"><p className="kicker">READY TO GET STARTED?</p><h2>REQUEST MOBILE SERVICE.</h2><p>Tell us what you have, what it is doing and where it is located. We’ll review the request and contact you to confirm scheduling.</p></div><ServiceRequestForm /></section>
      <footer><div className="brand"><span>UW</span> ULTIMATE WRENCHWORKS</div><p>Mobile powersports, auto & small-engine service.</p><p>Serving the Auburn–Opelika area.</p><small>© 2026 Ultimate Wrenchworks LLC. All rights reserved.</small></footer>
    </main>
  );
}
