# BHAVANINFO Working Prototype Status

## Working flows

- API health and data services
- Synthetic cadastral parcel retrieval and search
- MapLibre satellite/street map with 3D building extrusion
- Parcel selection from the map
- Three.js vertical-property digital twin
- Level selection and twin inspection controls
- Pending-survey visualization and demo drone simulation
- Boundary drawing and process-memory demo parcel registration
- Official DILRMP programme-statistics workspace
- UIDAI-published test-fixture identity verification

## Data boundaries

Official DILRMP figures are programme-level statistics from a documented government source. They are not individual land records.

The parcel/map/twin layer in this prototype uses synthetic_demo fixtures so the UI and vertical-property workflows are demonstrable without falsely representing invented parcels as government records.

The UIDAI flow uses the configured uidai-test-fixture mode unless an authorized sandbox configuration is supplied.

## Deliberately deferred

- Live bulk cadastral data adapter
- Production PostGIS repository
- Production UIDAI sandbox cryptographic adapter
- Production survey ingestion and model serving
- Legal/ownership decisions by AI

The existing Three.js renderer remains protected by scripts/verify-3d-renderer.mjs.
