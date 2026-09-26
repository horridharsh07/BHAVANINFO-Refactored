import { DEMO_PARCELS, DEMO_DATA_PROVENANCE } from '../../data/demo/cadastral-demo.parcels.js';

const parcels = DEMO_PARCELS.map((parcel) => structuredClone(parcel));

function clone(value) {
  return structuredClone(value);
}

function matches(parcel, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;

  return [
    parcel.ulpin,
    parcel.legacy_ulpin,
    parcel.owner,
    parcel.survey_no,
    parcel.village,
    parcel.city,
    parcel.district,
    parcel.tehsil
  ].some((value) => String(value || '').toLowerCase().includes(q));
}

export function listDemoParcels() {
  return {
    dataStatus: 'synthetic_demo',
    provenance: DEMO_DATA_PROVENANCE,
    data: clone(parcels)
  };
}

export function searchDemoParcels(query) {
  return {
    dataStatus: 'synthetic_demo',
    provenance: DEMO_DATA_PROVENANCE,
    results: clone(parcels.filter((parcel) => matches(parcel, query)))
  };
}

export function getDemoParcel(ulpin) {
  const key = String(ulpin || '').trim().toUpperCase();
  const parcel = parcels.find((item) =>
    String(item.ulpin).toUpperCase() === key ||
    String(item.legacy_ulpin || '').toUpperCase() === key
  );
  return parcel ? clone(parcel) : null;
}

export function createDemoParcel(input) {
  const coordinates = Array.isArray(input.coordinates) ? input.coordinates : [];
  if (coordinates.length < 3) {
    const error = new Error('At least three boundary vertices are required.');
    error.code = 'INVALID_GEOMETRY';
    throw error;
  }

  const idNumber = parcels.length + 1;
  const ulpin = 'PBDEMONEW' + String(Date.now()).slice(-5);

  const parcel = {
    id: 'demo-parcel-' + Date.now(),
    ulpin,
    legacy_ulpin: 'DEMO-NEW-' + String(idNumber).padStart(4, '0'),
    owner: String(input.owner || 'Demo Landholder').trim(),
    status: 'PENDING_REGISTRATION',
    provenance: 'synthetic_demo',
    source_name: DEMO_DATA_PROVENANCE.sourceName,
    source_reference: DEMO_DATA_PROVENANCE.sourceReference,
    survey_no: String(input.survey_no || 'Survey Area ' + idNumber).trim(),
    tehsil: String(input.tehsil || 'Unspecified').trim(),
    district: String(input.district || 'Punjab').trim(),
    city: String(input.city || 'Punjab').trim(),
    village: String(input.village || 'Prototype Survey Area').trim(),
    hadbast: '',
    area_sqyd: Number(input.area_sqyd || 0),
    area_sqft: Number(input.area_sqft || 0),
    total_floors: 0,
    declared_floors: Number(input.declared_floors || 0),
    has_anomaly: false,
    anomaly_desc: null,
    tax_status: 'NOT_ASSESSED',
    tax_amount: 0,
    centroid: Array.isArray(input.centroid) ? input.centroid : null,
    coordinates,
    levels: [],
    registration_date: new Date().toISOString().slice(0, 10),
    drone_scan_date: null
  };

  parcels.push(parcel);
  return clone(parcel);
}
