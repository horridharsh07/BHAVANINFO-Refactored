# BHAVANINFO Official Data Sources

## Current implementation

BHAVANINFO consumes an explicit Department of Land Resources DILRMP Punjab statistics snapshot through the API.

### DILRMP MIS 3.0

Organisation: Government of India, Ministry of Rural Development, Department of Land Resources.

Punjab district status:
https://dilrmp.gov.in/dilrmpold/MapULPIN/MapDiditizaionDistrictList/3

District/tehsil pages used for the current snapshot:

- Amritsar: https://dilrmp.gov.in/dilrmpold/MapULPIN/tehsil-level/49
- Ludhiana: https://dilrmp.gov.in/dilrmpold/MapULPIN/tehsil-level/41
- Jalandhar: https://dilrmp.gov.in/dilrmpold/MapULPIN/tehsil-level/37
- Kapurthala / Phagwara: https://dilrmp.gov.in/dilrmpold/MapULPIN/tehsil-level/36

The local representation is intentionally a dated snapshot. The UI exposes the source URL and retrieval timestamp instead of claiming a live connection to the government MIS.

### Punjab Land Records

Organisation: Department of Revenue, Rehabilitation and Disaster Management, Government of Punjab.

Portal:
https://jamabandi.punjab.gov.in/

Cadastral Map:
https://jamabandi.punjab.gov.in/CadastralMap.aspx

Online Services:
https://jamabandi.punjab.gov.in/OnlineServices.aspx

The portal exposes public interfaces for Jamabandi, Khewat/Khasra/Khatouni search, mutation, Roznamcha, registered deeds and cadastral maps. BHAVANINFO does not copy or re-publish individual ownership records without an evidence-backed ingestion path.

## Data policy

DILRMP programme statistics are suitable for an official programme dashboard.

They are not individual land records.

An individual property dossier should eventually carry:

- source record identifier
- source system
- source URL/reference
- record period
- retrieval time
- spatial reference system
- processing lineage
- integrity/checksum metadata where applicable

Legacy BHAVANINFO parcel/building records remain synthetic_demo until their original source and legal provenance are established.

## 3D protection

No Three.js renderer source was changed by the official-data foundation work.

The 3D renderer remains behind the existing data-adapter boundary. Official programme statistics are not passed into the renderer.
