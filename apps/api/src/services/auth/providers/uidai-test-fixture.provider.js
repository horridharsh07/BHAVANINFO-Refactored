// Official UIDAI test-data adapter.
// This is a deterministic local adapter for UIDAI-published test data.
// It is not production Aadhaar authentication.

const OFFICIAL_TEST_USERS = new Map([
  ['999999990019', {
    testUid: '999999990019',
    displayName: 'Shivshankar Choudhury',
    provenance: 'uidai_test',
    source: 'UIDAI published authentication test data',
    provider: 'uidai-test-fixture'
  }]
]);

export class UidaiTestFixtureProvider {
  async authenticate({ aadhaar, name }) {
    const normalized = String(aadhaar || '').replace(/\D/g, '');
    const record = OFFICIAL_TEST_USERS.get(normalized);

    if (!record) {
      return {
        authenticated: false,
        provider: 'uidai-test-fixture',
        reason: 'UIDAI_TEST_ID_NOT_FOUND'
      };
    }

    if (String(name || '').trim().toLowerCase() !== record.displayName.toLowerCase()) {
      return {
        authenticated: false,
        provider: 'uidai-test-fixture',
        reason: 'TEST_DEMOGRAPHIC_MISMATCH'
      };
    }

    return {
      authenticated: true,
      provider: record.provider,
      subject: record.testUid,
      displayName: record.displayName,
      provenance: record.provenance,
      source: record.source
    };
  }
}
