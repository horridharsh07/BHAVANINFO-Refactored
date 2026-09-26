# BHAVANINFO Architecture

BHAVANINFO is a 3D cadastral and vertical property mapping platform.

## Architecture

```text
External / Official / Open Data
            |
            v
       Data Ingestion
            |
            v
        Validation
            |
            v
      PostgreSQL/PostGIS
            |
            v
        Application API
            |
      +-----+-----+
      |           |
      v           v
   MapLibre    Three.js
      |
      v
  Cadastral UI

AI/ML and spatial processing operate as separate
processing/inference services and pipelines.


Principles
Preserve existing BHAVANINFO functionality.
Refactor incrementally rather than rewriting blindly.
Keep domain logic independent from UI.
Use PostGIS for spatial persistence.
External data must have provenance.
AI inference must be distinguishable from authoritative records.
Authentication and authorization are separate concerns.
Aadhaar authentication does not establish land ownership.
Destructive migrations require explicit validation.
Production secrets must never be committed.
