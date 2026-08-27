import ServiceRequestForm from './ServiceRequestForm';

const services = [
  ['ATV & UTV Service', 'Maintenance, diagnostics and repairs for trail, farm and recreational machines.'],
  ['Motorcycles & Dirt Bikes', 'Routine service, troubleshooting and repair without the dealership runaround.'],
  ['Auto & Light Truck', 'Convenient mobile maintenance and mechanical service for passenger vehicles.'],
  ['Small Engines', 'Service and repair for common small-engine equipment.']
];

export default function Home() {
  return (
    <main>
      <nav className="nav"><a className="brand" href="#top"><span>UW</span> ULTIMATE WRENCHWORKS</a><div className="navlinks"><a href="#services">Services</a><a href="#about">About</a><a className="navcta" href="#schedule">Schedule Service</a></div></nav>
      <section className="hero" id="top"><div className="heroInner"><p className="eyebrow">MOBILE MECHANICAL SERVICE • AUBURN–OPELIKA AREA</p><h1>THE SHOP<br/><em>COMES TO YOU.</em></h1><p className="lead">Professional mobile repair and maintenance for powersports equipment, passenger vehicles and small engines — at your home, shop or jobsite.</p><div className="actions"><a className="primary" href="#schedule">Schedule Service</a><a className="secondary" href="#services">View Services</a></div><div className="trust"><span>✓ Mobile convenience</span><span>✓ Straightforward service</span><span>✓ Powersports focused</span></div></div></section>
      <section className="section" id="services"><p className="kicker">WHAT WE WORK ON</p><h2>ONE MOBILE SHOP.<br/>MORE WAYS TO KEEP MOVING.</h2><div className="grid">{services.map(([title, text],i)=><article className="card" key={title}><div className="num">0{i+1}</div><h3>{title}</h3><p>{text}</p><a href="#schedule">Request service →</a></article>)}</div></section>
      <section className="split" id="about"><div><p className="kicker">BUILT AROUND THE CUSTOMER</p><h2>LESS HAULING.<br/>LESS WAITING.<br/><em>MORE RIDING.</em></h2></div><div className="copy"><p>Getting a machine to a repair shop can be half the problem. Ultimate Wrenchworks brings capable mechanical service directly to you, reducing downtime and making routine maintenance easier to stay ahead of.</p><p>We focus on clear communication, practical repairs and doing the job right.</p></div></section>
      <section className="schedule" id="schedule"><div className="scheduleIntro"><p className="kicker">READY TO GET STARTED?</p><h2>LET’S GET YOU<br/>BACK IN MOTION.</h2><p>Send the details below and your device will prepare an email with the service request already filled out. We’ll contact you to confirm availability and the appointment.</p></div><ServiceRequestForm /></section>
      <footer><div className="brand"><span>UW</span> ULTIMATE WRENCHWORKS</div><p>Mobile powersports, auto & small-engine service.</p><p>Serving the Auburn–Opelika area.</p><small>© 2026 Ultimate Wrenchworks LLC. All rights reserved.</small></footer>
    </main>
  );
}
