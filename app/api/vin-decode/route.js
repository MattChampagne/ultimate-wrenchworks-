const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

function clean(value) {
  return String(value || '').trim();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const vin = clean(searchParams.get('vin')).toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

  if (vin.length !== 17) {
    return Response.json({ ok: false, error: 'Enter a complete 17-character VIN.' }, { status: 400 });
  }

  try {
    const url = `${NHTSA_BASE}/DecodeVinValuesExtended/${encodeURIComponent(vin)}?format=json`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('NHTSA VIN service is unavailable.');

    const data = await response.json();
    const row = data?.Results?.[0] || {};
    const make = clean(row.Make);
    const model = clean(row.Model);
    const year = clean(row.ModelYear);

    if (!make || !model || !year) {
      return Response.json({
        ok: false,
        error: clean(row.ErrorText) || 'This VIN could not be fully decoded. Use year, make and model instead.'
      }, { status: 422 });
    }

    const displacement = clean(row.DisplacementL);
    const cylinders = clean(row.EngineCylinders);
    const configuration = clean(row.EngineConfiguration);
    const fuelType = clean(row.FuelTypePrimary);
    const turbo = clean(row.Turbo);
    const engineModel = clean(row.EngineModel);
    const trim = clean(row.Trim);
    const series = clean(row.Series);

    const engineParts = [];
    if (displacement) engineParts.push(`${Number(displacement).toFixed(1).replace(/\.0$/, '.0')}L`);
    if (turbo && !/^no$/i.test(turbo)) engineParts.push('Turbo');
    if (cylinders) engineParts.push(`${cylinders}-cyl`);
    if (configuration) engineParts.push(configuration);
    if (fuelType) engineParts.push(fuelType);
    if (engineModel) engineParts.push(engineModel);

    return Response.json({
      ok: true,
      source: 'NHTSA vPIC',
      vin,
      year,
      make,
      model,
      trim,
      series,
      engineSize: displacement ? `${Number(displacement).toFixed(1)}L` : '',
      cylinders,
      configuration,
      fuelType,
      turbo,
      engineModel,
      engineDescription: engineParts.join(' · ')
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message || 'Unable to decode VIN.' }, { status: 502 });
  }
}
