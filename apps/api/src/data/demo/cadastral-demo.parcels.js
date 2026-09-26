const CITY_CONFIG = [
  { city: 'Amritsar', district: 'Amritsar', tehsil: 'Amritsar-I', center: [74.8620, 31.6125] },
  { city: 'Ludhiana', district: 'Ludhiana', tehsil: 'Ludhiana', center: [75.8450, 30.8950] },
  { city: 'Jalandhar', district: 'Jalandhar', tehsil: 'Jalandhar-I', center: [75.5650, 31.3150] },
  { city: 'Phagwara', district: 'Kapurthala', tehsil: 'Phagwara', center: [75.7701, 31.2215] }
];

const STATUS = ['DIGITALIZED', 'DIGITALIZED', 'FLAGGED_VIOLATION', 'PENDING_REGISTRATION'];

function polygonAround(lng, lat, dx, dy, skew = 0) {
  return [
    [Number((lng - dx).toFixed(6)), Number((lat - dy).toFixed(6))],
    [Number((lng + dx + skew).toFixed(6)), Number((lat - dy * 0.92).toFixed(6))],
    [Number((lng + dx).toFixed(6)), Number((lat + dy).toFixed(6))],
    [Number((lng - dx - skew).toFixed(6)), Number((lat + dy * 0.9).toFixed(6))],
    [Number((lng - dx).toFixed(6)), Number((lat - dy).toFixed(6))]
  ];
}

function floor(levelCode, suffix, owner, height, flagged = false) {
  return {
    level_code: levelCode,
    sub_ulpin: suffix,
    name: levelCode === 'G00' ? 'Ground Floor — Primary Use' : 'Level ' + levelCode.slice(1) + ' — Vertical Property Unit',
    height_m: height,
    is_subterranean: false,
    owner,
    carpet_area_sqft: 900,
    tax_status: flagged ? 'NOTICE_REVIEW' : 'PAID',
    is_flagged: flagged
  };
}

function makeParcel(cityConfig, sequence, status) {
  const [lng, lat] = cityConfig.center;
  const step = 0.0016;
  const localLng = lng + ((sequence % 3) - 1) * step;
  const localLat = lat + (Math.floor(sequence / 3) - 0.5) * step;
  const ulpin = 'PBDEMO' + cityConfig.district.slice(0, 2).toUpperCase() + String(sequence).padStart(6, '0');
  const owner = 'Demo Landholder ' + sequence;

  const levels = status === 'PENDING_REGISTRATION'
    ? []
    : [
        {
          level_code: 'B30',
          sub_ulpin: ulpin + '-B30-UTL',
          name: 'Subterranean Utility Layer',
          depth_feet: -30,
          is_subterranean: true,
          owner: 'Demo Municipal Utility Layer',
          carpet_area_sqft: 500,
          utilities: [
            { type: 'Water Conduit', status: 'DEMO_ONLY', meter: 'DEMO-W-' + sequence },
            { type: 'Electric Conduit', status: 'DEMO_ONLY', meter: 'DEMO-E-' + sequence }
          ]
        },
        floor('G00', ulpin + '-G00-U01', owner, 3.2),
        floor('F01', ulpin + '-F01-U01', owner, 3.0),
        ...(status === 'FLAGGED_VIOLATION'
          ? [floor('F02', ulpin + '-F02-FLG', owner, 3.0, true)]
          : [])
      ];

  return {
    id: 'demo-parcel-' + sequence,
    ulpin,
    legacy_ulpin: 'DEMO-' + cityConfig.district.toUpperCase() + '-' + String(sequence).padStart(4, '0'),
    owner,
    status,
    provenance: 'synthetic_demo',
    source_name: 'BHAVANINFO synthetic prototype fixture',
    source_reference: 'data/demo/cadastral-demo.parcels.js',
    survey_no: 'Khasra Demo ' + sequence + '/' + (sequence + 1),
    tehsil: cityConfig.tehsil,
    district: cityConfig.district + ', Punjab',
    city: cityConfig.city,
    village: cityConfig.city + ' Demo Cadastre Sector',
    hadbast: String(100 + sequence),
    area_sqyd: 300 + sequence * 15,
    area_sqft: (300 + sequence * 15) * 9,
    total_floors: status === 'PENDING_REGISTRATION' ? 0 : status === 'FLAGGED_VIOLATION' ? 3 : 2,
    declared_floors: status === 'PENDING_REGISTRATION' ? 0 : status === 'FLAGGED_VIOLATION' ? 2 : 2,
    has_anomaly: status === 'FLAGGED_VIOLATION',
    anomaly_desc: status === 'FLAGGED_VIOLATION'
      ? 'Prototype anomaly record: vertical extent differs from the declared floor count. This is synthetic demo data, not a statutory finding.'
      : null,
    tax_status: status === 'FLAGGED_VIOLATION' ? 'NOTICE_REVIEW' : 'PAID',
    tax_amount: 12000 + sequence * 350,
    centroid: [Number(localLat.toFixed(6)), Number(localLng.toFixed(6))],
    coordinates: polygonAround(localLng, localLat, 0.00022, 0.00018, sequence % 2 ? 0.00002 : -0.00001),
    levels,
    registration_date: '2026-01-15',
    drone_scan_date: status === 'PENDING_REGISTRATION' ? null : '2026-02-10'
  };
}

export const DEMO_PARCELS = CITY_CONFIG.flatMap((city, cityIndex) =>
  Array.from({ length: 4 }, (_, index) => {
    const sequence = cityIndex * 4 + index + 1;
    return makeParcel(city, sequence, STATUS[index]);
  })
);

export const DEMO_DATA_PROVENANCE = {
  classification: 'synthetic_demo',
  sourceName: 'BHAVANINFO synthetic prototype fixture',
  sourceReference: 'data/demo/cadastral-demo.parcels.js',
  scope: 'Demonstration of map, 3D twin, search and survey workflows; not government land records.'
};
