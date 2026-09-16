import './owner.css';
import RescheduleEnhancer from './RescheduleEnhancer';
import InvoiceEnhancer from './InvoiceEnhancer';
import PaidInvoiceCounter from './PaidInvoiceCounter';

export default function OwnerLayout({children}){
  return <>{children}<RescheduleEnhancer/><InvoiceEnhancer/><PaidInvoiceCounter/></>;
}
