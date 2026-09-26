import { DILRMP_PUNJAB_SNAPSHOT } from '../../data/official/dilrmp-punjab.snapshot.js';

function coverage(numerator, denominator) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(2));
}

function districtSummary(district) {
  return {
    district: district.district,
    sourceUrl: district.sourceUrl,
    villages: district.villagesTotal,
    cadastralMaps: district.cadastralMapsTotal,
    digitizedMaps: district.cadastralMapsDigitized,
    totalLandParcels: district.totalLandParcels,
    geoReferencedLandParcels: district.geoReferencedLandParcels,
    geoReferencedCoveragePct: coverage(
      district.geoReferencedLandParcels,
      district.totalLandParcels
    ),
    ulpinImplemented: district.ulpinImplemented,
    ulpinCoveragePct: coverage(
      district.ulpinImplemented,
      district.totalLandParcels
    ),
    svamitvaUlpinImplemented: district.svamitvaUlpinImplemented
  };
}

export function getDilrmpPunjabSnapshot() {
  return structuredClone(DILRMP_PUNJAB_SNAPSHOT);
}

export function getDashboardSummary() {
  const { state, districts, tehsils, provenance, datasetId } = DILRMP_PUNJAB_SNAPSHOT;

  return {
    success: true,
    generatedAt: new Date().toISOString(),
    dashboard: {
      title: 'BHAVANINFO Land Records Modernization Dashboard',
      dataStatus: 'official_snapshot',
      authoritativeScope: provenance.scope,
      source: provenance,
      state: {
        ...state,
        geoReferencedCoveragePct: coverage(
          state.geoReferencedLandParcels,
          state.totalLandParcels
        ),
        ulpinCoveragePct: coverage(
          state.ulpinImplemented,
          state.totalLandParcels
        )
      },
      focusDistricts: districts.map(districtSummary),
      focusTehsils: tehsils.map((tehsil) => ({
        ...tehsil,
        geoReferencedCoveragePct: coverage(
          tehsil.geoReferencedLandParcels,
          tehsil.totalLandParcels
        ),
        ulpinCoveragePct: coverage(
          tehsil.ulpinImplemented,
          tehsil.totalLandParcels
        )
      })),
      sourceRegistryId: datasetId,
      legacy3d: {
        status: 'isolated_demo_reference',
        authoritative: false,
        featureCount: 10300,
        note: 'Legacy 3D footprints remain isolated from official programme statistics and are not represented as government-verified parcels.'
      },
      officialPortal: {
        name: 'Punjab Land Records',
        url: 'https://jamabandi.punjab.gov.in/',
        cadastralMapUrl: 'https://jamabandi.punjab.gov.in/CadastralMap.aspx',
        onlineServicesUrl: 'https://jamabandi.punjab.gov.in/OnlineServices.aspx'
      }
    }
  };
}
