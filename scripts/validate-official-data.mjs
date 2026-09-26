import { DILRMP_PUNJAB_SNAPSHOT } from '../apps/api/src/data/official/dilrmp-punjab.snapshot.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const { provenance, state, districts, tehsils } = DILRMP_PUNJAB_SNAPSHOT;

assert(provenance.classification === 'authoritative', 'Snapshot must be authoritative');
assert(provenance.sourceUrl.startsWith('https://'), 'Source URL must be HTTPS');
assert(provenance.retrievedAt, 'Snapshot must include retrievedAt');
assert(Number.isInteger(state.totalLandParcels), 'State parcel count must be an integer');
assert(state.totalLandParcels > 0, 'State parcel count must be positive');
assert(districts.length >= 4, 'Expected Punjab focus districts');
assert(tehsils.some((t) => t.tehsil === 'Phagwara'), 'Expected Phagwara tehsil');

for (const district of districts) {
  assert(district.sourceUrl.startsWith('https://dilrmp.gov.in/'), 'Invalid DILRMP URL for ' + district.district);
  assert(district.totalLandParcels >= district.geoReferencedLandParcels, 'Invalid parcel coverage for ' + district.district);
  assert(district.ulpinImplemented <= district.totalLandParcels, 'Invalid ULPIN count for ' + district.district);
}

console.log('Official data validation passed.');
