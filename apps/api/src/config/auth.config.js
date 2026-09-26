const AUTH_PROVIDER = process.env.AADHAAR_AUTH_PROVIDER || 'uidai-test-fixture';

export const authConfig = {
  provider: AUTH_PROVIDER,
  sessionSecret: process.env.SESSION_SECRET || '',
  uidai: {
    authUrl: process.env.UIDAI_AUTH_URL || '',
    auaCode: process.env.UIDAI_AUA_CODE || '',
    subAuaCode: process.env.UIDAI_SUB_AUA_CODE || '',
    licenseKey: process.env.UIDAI_LICENSE_KEY || '',
    certificatePath: process.env.UIDAI_CERTIFICATE_PATH || '',
    signatureKeyPath: process.env.UIDAI_SIGNATURE_KEY_PATH || ''
  }
};
