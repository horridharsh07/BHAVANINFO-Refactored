# BHAVANINFO

## 3D Cadastral and Vertical Property Mapping Platform

BHAVANINFO is being evolved into a production-oriented prototype for:

- 3D cadastral mapping
- ULPIN and sub-ULPIN management
- Vertical property representation
- GIS parcel visualization
- 3D digital twins
- Survey and evidence management
- LiDAR and drone processing pipelines
- AI-assisted building and floor extraction
- Spatial validation
- Property dossiers
- Audit history
- Identity and role-based authorization

## Development Principle

This repository enhances the original BHAVANINFO project.

Existing functionality is preserved and migrated incrementally.

The Three.js 3D renderer is a protected subsystem. Data sources may change behind the data-adapter boundary without changing renderer behavior.

## Official data foundation

The current dashboard uses a dated snapshot of Government of India's Department of Land Resources DILRMP Punjab programme statistics.

Official source:

https://dilrmp.gov.in/dilrmpold/MapULPIN/MapDiditizaionDistrictList/3

Punjab Land Records public portal:

https://jamabandi.punjab.gov.in/

Cadastral Map:

https://jamabandi.punjab.gov.in/CadastralMap.aspx

Online Services:

https://jamabandi.punjab.gov.in/OnlineServices.aspx

The official-data snapshot is programme-level information. It is not a substitute for an individual RoR, Jamabandi, mutation, cadastral map or ownership determination.

See docs/OFFICIAL_DATA_SOURCES.md and data/manifests/ for provenance metadata.

## Data classification

Every dataset must be classified as one of:

- authoritative
- authoritative_interface
- credible_external
- derived
- synthetic_demo
- uidai_test

Synthetic and derived data must never be represented as official government records.

## Development commands

Run the API:

npm run dev:api

Run the web app:

npm run dev:web

Validate the official-data snapshot and protected renderer:

npm test

npm run check:3d

Build:

npm run build

## Status

Early refactoring and architecture phase.
