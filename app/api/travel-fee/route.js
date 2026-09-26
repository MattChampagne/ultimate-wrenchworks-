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

async function censusGeocode({ street, city, state, zip }) {
  try {
    const url = new URL('https://geocoding.geo.census.gov/geocoder/locations/address');
    url.searchParams.set('street', street);
    url.searchParams.set('city', city);
    url.searchParams.set('state', state);
    url.searchParams.set('zip', zip);
    url.searchParams.set('benchmark', 'Public_AR_Current');
    url.searchParams.set('format', 'json');
    const response = await fetch(url, {
      headers: { 'User-Agent': 'UltimateWrenchworks/1.0 service-distance-calculator' },
      next: { revalidate: 86400 }
    });
    if (!response.ok) return null;
    const data = await response.json();
    const match = data?.result?.addressMatches?.[0];
    const lon = Number(match?.coordinates?.x);
    const lat = Number(match?.coordinates?.y);
    return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const street = String(searchParams.get('street') || '').trim().slice(0, 120);
    const city = String(searchParams.get('city') || '').trim().slice(0, 80);
    const state = String(searchParams.get('state') || '').trim().toUpperCase().slice(0, 2);
    const zip = String(searchParams.get('zip') || '').trim().slice(0, 10);
    if (street.length < 3 || city.length < 2 || !/^[A-Z]{2}$/.test(state) || !/^\d{5}(?:-\d{4})?$/.test(zip)) {
      return Response.json({ ok: false, error: 'Enter the full street address, city, state, and ZIP before calculating distance.' }, { status: 400 });
    }

    let target = await censusGeocode({ street, city, state, zip });

    if (!target) {
      const targetUrl = new URL('https://nominatim.openstreetmap.org/search');
      targetUrl.searchParams.set('format', 'jsonv2');
      targetUrl.searchParams.set('limit', '1');
      targetUrl.searchParams.set('countrycodes', 'us');
      targetUrl.searchParams.set('street', street);
      targetUrl.searchParams.set('city', city);
      targetUrl.searchParams.set('state', state);
      targetUrl.searchParams.set('postalcode', zip);

      const targetResponse = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'UltimateWrenchworks/1.0 service-distance-calculator',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        next: { revalidate: 86400 }
      });
      const targetData = targetResponse.ok ? await targetResponse.json() : [];
      if (Array.isArray(targetData) && targetData[0]) {
        target = { lat: Number(targetData[0].lat), lon: Number(targetData[0].lon) };
      }
    }

    if (!target) {
      target = await geocode(`${street}, ${city}, ${state} ${zip}, USA`);
    }

    const base = await geocode(SERVICE_BASE_ADDRESS);
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
