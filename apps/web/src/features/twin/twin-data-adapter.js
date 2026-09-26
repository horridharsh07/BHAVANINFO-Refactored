// Adapter boundary between cadastral APIs and the existing DigitalTwin3D renderer.
// Keep renderer behavior unchanged. Normalize data before passing it to the
// legacy renderer so the refactor does not silently alter geometry semantics.

export function normalizeTwinParcel(parcel) {
  if (!parcel) return null;

  const floors = Array.isArray(parcel.floors)
    ? parcel.floors.map((floor, index) => ({
        id: floor.id || floor.sub_ulpin || String(index),
        levelCode: floor.levelCode || floor.level_code || 'G00',
        elevationM: Number(floor.elevationM ?? floor.elevation_m ?? 0),
        heightM: Number(floor.heightM ?? floor.height_m ?? 3),
        useType: floor.useType || floor.use_type || 'Unknown',
        flagged: Boolean(floor.flagged ?? floor.is_flagged)
      }))
    : [];

  return {
    id: parcel.id || parcel.ulpin,
    ulpin: parcel.ulpin || parcel.id,
    geometry: parcel.geometry || {
      type: 'Polygon',
      coordinates: parcel.coordinates || []
    },
    elevationM: Number(parcel.elevationM ?? parcel.elevation_m ?? 0),
    heightM: Number(parcel.heightM ?? parcel.height_m ?? 0),
    floors,
    status: parcel.status || 'UNKNOWN'
  };
}
