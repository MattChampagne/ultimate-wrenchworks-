'use client';

export default function CategoryQuoteButton({ serviceType }) {
  function chooseCategory() {
    window.dispatchEvent(new CustomEvent('uw:select-service-type', { detail: { serviceType } }));
    requestAnimationFrame(() => document.getElementById('schedule')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  return <button type="button" className="serviceScheduleButton" onClick={chooseCategory}>Request Quote →</button>;
}
