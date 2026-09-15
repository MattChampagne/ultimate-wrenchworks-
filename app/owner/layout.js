import './owner.css';
import RescheduleEnhancer from './RescheduleEnhancer';

export default function OwnerLayout({children}){
  return <>{children}<RescheduleEnhancer/></>;
}
