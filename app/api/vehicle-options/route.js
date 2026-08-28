const NHTSA_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

const autoMakes = ['Acura','Alfa Romeo','Audi','BMW','Buick','Cadillac','Chevrolet','Chrysler','Dodge','Fiat','Ford','Genesis','GMC','Honda','Hyundai','Infiniti','Jaguar','Jeep','Kia','Land Rover','Lexus','Lincoln','Lucid','Mazda','Mercedes-Benz','Mercury','Mini','Mitsubishi','Nissan','Oldsmobile','Plymouth','Polestar','Pontiac','Porsche','Ram','Rivian','Saab','Saturn','Scion','Subaru','Suzuki','Tesla','Toyota','Volkswagen','Volvo'];
const motorcycleMakes = ['Aprilia','BMW','Can-Am','Ducati','GasGas','Harley-Davidson','Honda','Husqvarna','Indian','Kawasaki','KTM','Moto Guzzi','Royal Enfield','Suzuki','Triumph','Victory','Yamaha'];

const offRoad = {
  ATV: {
    Polaris: [['Sportsman',1996,2027],['Scrambler',1985,2027],['Outlaw',2006,2027],['Trail Boss',1985,2013],['Hawkeye',2006,2011]],
    'Can-Am': [['Outlander',2003,2027],['Renegade',2007,2027],['DS',1999,2021]],
    Honda: [['FourTrax Rancher',2000,2027],['FourTrax Foreman',1987,2027],['FourTrax Foreman Rubicon',2001,2027],['TRX250X',1987,2027],['TRX400EX',1999,2014],['TRX450R',2004,2014],['TRX700XX',2008,2009],['Recon',1997,2027]],
    Yamaha: [['Grizzly',1998,2027],['Kodiak',1993,2027],['Raptor 700',2006,2027],['Raptor 250',2008,2013],['YFZ450R',2009,2027],['YFZ450',2004,2013],['Wolverine ATV',1995,2010],['Warrior',1987,2004],['Banshee',1987,2006]],
    Kawasaki: [['Brute Force',2005,2027],['Prairie',1997,2006],['Bayou',1988,2011],['KFX450R',2008,2014],['KFX700',2004,2009]],
    Suzuki: [['KingQuad',1991,2027],['QuadSport Z400',2003,2014],['Eiger',2002,2007],['Ozark',2002,2014],['VinSon',2002,2007]],
    CFMOTO: [['CForce',2014,2027]],
    'Arctic Cat': [['Alterra',2016,2027],['TRV',2006,2020]],
    Kayo: [['Bull',2019,2027],['Fox',2019,2027],['Predator',2019,2027]],
    'Segway Powersports': [['Snarler',2021,2027]]
  },
  'SXS / UTV': {
    Polaris: [['Ranger',1999,2027],['RZR',2008,2027],['General',2016,2027]],
    'Can-Am': [['Defender',2016,2027],['Maverick',2013,2027],['Commander',2011,2027]],
    Honda: [['Pioneer 500/520',2015,2027],['Pioneer 700',2014,2027],['Pioneer 1000',2016,2027],['Talon 1000R',2019,2027],['Talon 1000X',2019,2027]],
    Yamaha: [['Rhino',2004,2013],['Viking',2014,2027],['Wolverine',2016,2027],['YXZ1000R',2016,2027]],
    Kawasaki: [['Mule',1988,2027],['Teryx',2008,2027],['Teryx KRX 1000',2020,2027]],
    CFMOTO: [['UForce',2014,2027],['ZForce',2014,2027]],
    'Arctic Cat': [['Prowler',2006,2027],['Wildcat',2012,2020]],
    Kayo: [['S-Series',2021,2027],['Jackal',2021,2027]],
    'Segway Powersports': [['Fugleman',2022,2027],['Villain',2022,2027]]
  }
};

function modelsForOffRoad(type, make, year) {
  return (offRoad[type]?.[make] || []).filter(([,start,end]) => year >= start && year <= end).map(([name]) => name);
}

async function nhtsaModels(make, year, vehicleTypes) {
  const all = [];
  for (const vehicleType of vehicleTypes) {
    const url = `${NHTSA_BASE}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}/vehicletype/${encodeURIComponent(vehicleType)}?format=json`;
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) continue;
    const data = await response.json();
    for (const row of data.Results || []) if (row.Model_Name) all.push(row.Model_Name);
  }
  return [...new Set(all)].sort((a,b)=>a.localeCompare(b));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || '';
  const year = Number(searchParams.get('year'));
  const make = searchParams.get('make') || '';

  if (!year || year < 1980 || year > 2027) return Response.json({ makes: [], models: [] });

  if (type === 'ATV' || type === 'SXS / UTV') {
    const makes = Object.keys(offRoad[type]).filter(m => modelsForOffRoad(type, m, year).length).sort();
    return Response.json({ makes, models: make ? modelsForOffRoad(type, make, year) : [] });
  }

  if (type === 'Auto / Light Truck') {
    const models = make ? await nhtsaModels(make, year, ['Passenger Car','Multipurpose Passenger Vehicle (MPV)','Truck']) : [];
    return Response.json({ makes: autoMakes, models, source: 'NHTSA vPIC' });
  }

  if (type === 'Motorcycle / Dirt Bike') {
    const models = make ? await nhtsaModels(make, year, ['Motorcycle']) : [];
    return Response.json({ makes: motorcycleMakes, models, source: 'NHTSA vPIC' });
  }

  return Response.json({ makes: [], models: [] });
}
