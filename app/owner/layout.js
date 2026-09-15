import './owner.css';
import RescheduleEnhancer from './RescheduleEnhancer';
import InvoiceEnhancer from './InvoiceEnhancer';

export default function OwnerLayout({children}){
  return <>{children}<RescheduleEnhancer/><InvoiceEnhancer/></>;
}
