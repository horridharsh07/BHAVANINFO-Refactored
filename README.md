# BHAVANINFO

## 3D Cadastral and Vertical Property Mapping Platform

BHAVANINFO is being evolved into a production-oriented platform for:

- 3D cadastral mapping
- ULPIN and sub-ULPIN management
- Vertical property representation
- GIS parcel visualization
- 3D digital twins
- Survey and evidence management
- LiDAR and drone data processing
- AI-assisted building and floor extraction
- Spatial validation
- Property dossiers
- Audit history
- Identity and role-based authorization

## Development Principle

This repository is an enhancement of the original BHAVANINFO project.

Existing functionality should be preserved and migrated incrementally.

Do not perform destructive rewrites without documenting the existing behavior first.

## Architecture

See:

- `docs/ARCHITECTURE.md`
- `apps/web`
- `apps/api`
- `packages`
- `services`
- `pipelines`

## Data

Data sources must be classified as:

- authoritative
- government/open data
- derived
- synthetic/demo

No synthetic or derived dataset should be represented as authoritative government data.

## Status

Early refactoring and architecture phase.
