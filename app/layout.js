import './globals.css';
import './customer-v119.css';
import './process-v168.css';
import VinScannerEnhancer from './VinScannerEnhancer';
import NoSameDayScheduling from './NoSameDayScheduling';

export const metadata = {
  title: 'Ultimate Wrenchworks | Mobile Powersports & Auto Service',
  description: 'Mobile repair and maintenance for ATVs, UTVs, motorcycles, small engines and passenger vehicles in the Auburn–Opelika area.'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}<VinScannerEnhancer/><NoSameDayScheduling/></body></html>;
}
