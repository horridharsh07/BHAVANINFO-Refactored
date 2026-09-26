# BHAVANINFO Data Provenance Policy

| Class | Meaning |
|---|---|
| authoritative | Official/authorized source with documented ownership |
| credible_external | Established external source with documented provenance |
| derived | Produced by a documented processing pipeline |
| synthetic_demo | Invented records used only for clearly labelled demonstration |
| uidai_test | Official UIDAI-published test data/credentials |

Required metadata:
- source_name
- source_url or source_reference
- provenance_class
- license_or_usage_terms
- retrieved_at
- processing_version
- spatial_reference_system where applicable
- checksum where practical

The UI must expose provenance when a user could otherwise mistake test, derived or synthetic data for authoritative data.

Aadhaar has two explicit modes:

1. uidai-sandbox
   Actual UIDAI sandbox/test integration when required credentials, certificates and cryptographic configuration are available.

2. uidai-test-fixture
   Deterministic local demonstration using UIDAI-published test data. This is not production Aadhaar authentication.

No provider may manufacture a successful UIDAI response.
