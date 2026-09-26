# BHAVANINFO Refactored — Architecture Guardrails

## 3D rendering is a protected subsystem

The current BHAVANINFO 3D rendering implementation is the reference behavior.

Until parity tests exist, do not rewrite the Three.js scene builder, change geometry contracts, change coordinate order, change height/elevation units, replace the renderer, or delete assets required by the current renderer.

The refactor may change where data comes from, but the renderer must receive the same normalized 3D DTO contract.

## Stable 3D contract

{
  id,
  ulpin,
  geometry: { type: "Polygon", coordinates: [...] },
  elevationM,
  heightM,
  floors: [
    { id, levelCode, elevationM, heightM, useType, flagged }
  ],
  status
}

This is an internal application contract, not a claim that every source dataset contains all fields.

## Data provenance

Every imported record must be classified as one of:
- authoritative
- credible_external
- derived
- synthetic_demo
- uidai_test

Synthetic, derived and test records must never be presented as authoritative government records.

## Aadhaar

Aadhaar authentication verifies an identity claim. It does not establish land ownership, title, mutation or a Record of Rights.

Authentication and application authorization are separate layers.

## AI

No UI may claim that AI made a legal decision, established ownership, issued a statutory order, guaranteed fraud detection, or used a model/dataset that is not actually present.

## Processing

SLAM, reconstruction and building extraction belong in processing pipelines. The web runtime consumes versioned outputs.

## Migration

Existing behavior is preserved first. Removal follows dependency tracing, data-contract tests and parity testing.
