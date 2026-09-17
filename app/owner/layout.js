import './owner.css';
import RescheduleEnhancer from './RescheduleEnhancer';
import InvoiceEnhancer from './InvoiceEnhancer';
import PaidInvoiceCounter from './PaidInvoiceCounter';
import DailyOverview from './DailyOverview';

export default function OwnerLayout({children}){
  return <>{children}<DailyOverview/><RescheduleEnhancer/><InvoiceEnhancer/><PaidInvoiceCounter/></>;
}
