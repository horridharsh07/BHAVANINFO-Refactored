// UIDAI sandbox adapter boundary.
//
// The UIDAI authentication protocol requires AUA/sub-AUA configuration,
// cryptographic request construction, encryption/signature material and the
// appropriate registered/test environment.
//
// This adapter fails closed until that configuration is present.
// It must never manufacture a successful UIDAI response.

import { authConfig } from '../../../config/auth.config.js';

export class UidaiSandboxProvider {
  async authenticate() {
    const required = [
      ['UIDAI_AUTH_URL', authConfig.uidai.authUrl],
      ['UIDAI_AUA_CODE', authConfig.uidai.auaCode],
      ['UIDAI_SUB_AUA_CODE', authConfig.uidai.subAuaCode],
      ['UIDAI_LICENSE_KEY', authConfig.uidai.licenseKey],
      ['UIDAI_CERTIFICATE_PATH', authConfig.uidai.certificatePath]
    ];

    const missing = required
      .filter(([, value]) => !value)
      .map(([name]) => name);

    if (missing.length) {
      return {
        authenticated: false,
        provider: 'uidai-sandbox',
        reason: 'UIDAI_SANDBOX_NOT_CONFIGURED',
        missing
      };
    }

    return {
      authenticated: false,
      provider: 'uidai-sandbox',
      reason: 'UIDAI_SANDBOX_CRYPTO_ADAPTER_NOT_ENABLED'
    };
  }
}
