export default function PaymentSuccess(){
  return (
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:'24px',background:'#f5f5f5',color:'#111'}}>
      <section style={{width:'min(620px,100%)',background:'#fff',borderRadius:'16px',padding:'32px',boxShadow:'0 12px 36px rgba(0,0,0,.12)',textAlign:'center'}}>
        <h1 style={{marginTop:0}}>Payment received</h1>
        <p>Thank you. Your Ultimate Wrenchworks payment has been submitted securely through Stripe.</p>
        <p>Your invoice will update automatically after Stripe confirms the payment.</p>
        <a href="/" style={{display:'inline-block',marginTop:'12px',padding:'12px 18px',borderRadius:'8px',background:'#111',color:'#fff',textDecoration:'none',fontWeight:700}}>Return to Ultimate Wrenchworks</a>
      </section>
    </main>
  );
}
