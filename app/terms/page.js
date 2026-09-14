export const metadata={title:'Terms & Conditions | Ultimate Wrenchworks'};

const pageStyle={minHeight:'100vh',background:'#f6f2e9',color:'#17202a',padding:'24px 14px 48px',fontFamily:'Arial,Helvetica,sans-serif'};
const cardStyle={maxWidth:'860px',margin:'0 auto',background:'#ffffff',border:'1px solid #d8d2c7',borderRadius:'12px',padding:'clamp(22px,5vw,44px)',boxShadow:'0 10px 30px rgba(0,0,0,.08)',lineHeight:1.7};
const h1Style={color:'#17202a',fontSize:'clamp(34px,8vw,52px)',lineHeight:1.05,margin:'18px 0 10px',letterSpacing:'-.03em'};
const h2Style={color:'#17202a',fontSize:'clamp(22px,5vw,28px)',lineHeight:1.2,margin:'28px 0 8px'};
const pStyle={color:'#28323c',fontSize:'16px',margin:'10px 0'};
const linkStyle={color:'#0b5bd3',textDecoration:'underline',fontWeight:700};

export default function Terms(){
  return <main style={pageStyle}><article style={cardStyle}>
    <a href="/" style={linkStyle}>← Back to Ultimate Wrenchworks</a>
    <h1 style={h1Style}>Terms & Conditions</h1>
    <p style={pStyle}><strong>Effective date:</strong> September 14, 2026</p>
    <p style={pStyle}>These terms apply to service requests and communications with Ultimate Wrenchworks LLC. Submitting a service request does not by itself create a confirmed appointment or authorize repair work. Scheduling, estimates, and repair authorization are confirmed separately.</p>
    <h2 style={h2Style}>SMS Terms</h2>
    <p style={pStyle}>If you check the SMS consent box on our service request form, you agree to receive transactional and customer-care text messages from Ultimate Wrenchworks at the mobile number you provide. Messages may include service request communications, estimate or quote notifications and secure links, scheduling or rescheduling updates, service status updates, invoice notices, and payment-related notifications.</p>
    <p style={pStyle}>Message frequency varies based on your service activity. Message and data rates may apply. Reply STOP to opt out of future text messages or HELP for help. Consent to receive text messages is optional and is not a condition of purchasing goods or services.</p>
    <p style={pStyle}>Carriers are not liable for delayed or undelivered messages. You are responsible for providing a mobile number that you are authorized to use and for notifying us if that number changes.</p>
    <h2 style={h2Style}>Service requests and estimates</h2>
    <p style={pStyle}>Information submitted through the website is used to evaluate a service request and prepare for scheduling. Estimates may change if additional problems, parts, labor, or conditions are identified. Additional work beyond an approved scope will require customer authorization.</p>
    <h2 style={h2Style}>Website use</h2>
    <p style={pStyle}>You agree not to misuse the website, interfere with its operation, submit fraudulent information, or attempt unauthorized access to systems or data.</p>
    <p style={{...pStyle,marginTop:'28px'}}>For information about how we handle personal information, see our <a href="/privacy" style={linkStyle}>Privacy Policy</a>.</p>
  </article></main>;
}
