import './owner.css';
import RescheduleEnhancer from './RescheduleEnhancer';
import InvoiceEnhancer from './InvoiceEnhancer';
import PaidInvoiceCounter from './PaidInvoiceCounter';
import DailyOverview from './DailyOverview';
import DailyChecklist from './DailyChecklist';
import JobReadiness from './JobReadiness';

export default function OwnerLayout({children}){
  return <>{children}<DailyOverview/><DailyChecklist/><JobReadiness/><RescheduleEnhancer/><InvoiceEnhancer/><PaidInvoiceCounter/></>;
}
