export const metadata={title:'Privacy Policy | Ultimate Wrenchworks'};

const pageStyle={minHeight:'100vh',background:'#f6f2e9',color:'#17202a',padding:'24px 14px 48px',fontFamily:'Arial,Helvetica,sans-serif'};
const cardStyle={maxWidth:'860px',margin:'0 auto',background:'#ffffff',border:'1px solid #d8d2c7',borderRadius:'12px',padding:'clamp(22px,5vw,44px)',boxShadow:'0 10px 30px rgba(0,0,0,.08)',lineHeight:1.7};
const h1Style={color:'#17202a',fontSize:'clamp(34px,8vw,52px)',lineHeight:1.05,margin:'18px 0 10px',letterSpacing:'-.03em'};
const h2Style={color:'#17202a',fontSize:'clamp(22px,5vw,28px)',lineHeight:1.2,margin:'28px 0 8px'};
const pStyle={color:'#28323c',fontSize:'16px',margin:'10px 0'};
const linkStyle={color:'#0b5bd3',textDecoration:'underline',fontWeight:700};

export default function PrivacyPolicy(){
  return <main style={pageStyle}><article style={cardStyle}>
    <a href="/" style={linkStyle}>← Back to Ultimate Wrenchworks</a>
    <h1 style={h1Style}>Privacy Policy</h1>
    <p style={pStyle}><strong>Effective date:</strong> September 14, 2026</p>
    <p style={pStyle}>Ultimate Wrenchworks LLC collects information you provide when requesting or receiving service, including your name, phone number, email address, service location, vehicle or equipment information, and service details. We use this information to respond to requests, prepare estimates, schedule and perform service, communicate about your service, process payments, and maintain business records.</p>
    <h2 style={h2Style}>Text messaging</h2>
    <p style={pStyle}>If you voluntarily opt in to SMS, Ultimate Wrenchworks may send transactional and customer-care text messages related to your service request, estimates or quote links, scheduling, service status, invoices, and payment notifications. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent to SMS is not a condition of purchasing services.</p>
    <p style={pStyle}>Mobile opt-in information and consent are not sold, rented, or shared with third parties for their marketing or promotional purposes. We may use service providers that process communications or business data on our behalf solely to operate our services.</p>
    <h2 style={h2Style}>Information sharing</h2>
    <p style={pStyle}>We do not sell personal information. We may share information with vendors that help us operate the business, comply with law, prevent fraud, protect rights or safety, or complete a transaction you request.</p>
    <h2 style={h2Style}>Data retention and security</h2>
    <p style={pStyle}>We retain business and service records for as long as reasonably necessary for operations, legal, accounting, warranty, and recordkeeping purposes. We use reasonable administrative and technical safeguards, but no method of electronic storage or transmission is guaranteed to be completely secure.</p>
    <h2 style={h2Style}>Your choices</h2>
    <p style={pStyle}>You may opt out of SMS at any time by replying STOP. For questions about your information or this policy, contact Ultimate Wrenchworks through the contact information provided on our website.</p>
    <p style={{...pStyle,marginTop:'28px'}}><a href="/terms" style={linkStyle}>Terms & Conditions</a></p>
  </article></main>;
}
