const SUPABASE_URL = 'https://vxptgfnuxboprwhgcxpd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Wu0xH_TZ9L5t72BnROPtnw_9eJbG88T';

const allowedServiceTypes = new Set([
  'ATV / UTV',
  'Motorcycle / Dirt Bike',
  'Auto / Light Truck',
  'Small Engine',
  'Other'
]);

function clean(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Honeypot for simple bot traffic. Real customers never see or fill this field.
    if (clean(body.company, 100)) {
      return Response.json({ ok: true });
    }

    const payload = {
      customer_name: clean(body.name, 120),
      phone: clean(body.phone, 30),
      email: clean(body.email, 254) || null,
      service_type: clean(body.serviceType, 60),
      year_make_model: clean(body.vehicle, 160),
      preferred_date: clean(body.date, 10) || null,
      service_location: clean(body.location, 300),
      problem_description: clean(body.issue, 3000),
      source: 'website_v1'
    };

    if (
      payload.customer_name.length < 2 ||
      payload.phone.length < 7 ||
      !allowedServiceTypes.has(payload.service_type) ||
      payload.year_make_model.length < 2 ||
      payload.service_location.length < 5 ||
      payload.problem_description.length < 10
    ) {
      return Response.json(
        { ok: false, error: 'Please complete all required fields with enough detail.' },
        { status: 400 }
      );
    }

    if (payload.email && !/^\S+@\S+\.\S+$/.test(payload.email)) {
      return Response.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/public_service_requests_v1`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Supabase service request insert failed', response.status, await response.text());
      return Response.json(
        { ok: false, error: 'We could not save your request. Please try again.' },
        { status: 502 }
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Service request API error', error);
    return Response.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
