const FREE_MILES = 25;
const RATE_PER_MILE = 1;
const SERVICE_BASE_ADDRESS = '787 Lee Rd 23, Auburn, AL 36830';

async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=${encodeURIComponent(address)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'UltimateWrenchworks/1.0 service-distance-calculator',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    next: { revalidate: 86400 }
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (!Array.isArray(data) || !data[0]) return null;
  return { lat: Number(data[0].lat), lon: Number(data[0].lon) };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = String(searchParams.get('address') || '').trim().slice(0, 300);
    if (destination.length < 5) {
      return Response.json({ ok: false, error: 'Enter a complete service address.' }, { status: 400 });
    }

    const [base, target] = await Promise.all([geocode(SERVICE_BASE_ADDRESS), geocode(destination)]);
    if (!base || !target) {
      return Response.json({ ok: false, error: 'We could not locate that address. Please enter a full street address, city, state, and ZIP.' }, { status: 422 });
    }

    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${base.lon},${base.lat};${target.lon},${target.lat}?overview=false&alternatives=false&steps=false`;
    const routeResponse = await fetch(routeUrl, {
      headers: { 'User-Agent': 'UltimateWrenchworks/1.0 service-distance-calculator' },
      next: { revalidate: 3600 }
    });
    if (!routeResponse.ok) {
      return Response.json({ ok: false, error: 'We could not calculate driving distance right now.' }, { status: 502 });
    }
    const routeData = await routeResponse.json();
    const meters = routeData?.routes?.[0]?.distance;
    if (!Number.isFinite(meters)) {
      return Response.json({ ok: false, error: 'We could not calculate a driving route to that address.' }, { status: 422 });
    }

    const miles = Math.round((meters / 1609.344) * 10) / 10;
    const travelFee = Math.round(Math.max(0, miles - FREE_MILES) * RATE_PER_MILE * 100) / 100;

    return Response.json({ ok: true, miles, freeMiles: FREE_MILES, ratePerMile: RATE_PER_MILE, travelFee });
  } catch (error) {
    console.error('Travel fee calculation error', error);
    return Response.json({ ok: false, error: 'We could not calculate travel distance right now.' }, { status: 500 });
  }
}
