import { UidaiTestFixtureProvider } from './providers/uidai-test-fixture.provider.js';
import { UidaiSandboxProvider } from './providers/uidai-sandbox.provider.js';
import { authConfig } from '../../config/auth.config.js';

function providerForCurrentMode() {
  if (authConfig.provider === 'uidai-sandbox') {
    return new UidaiSandboxProvider();
  }

  if (authConfig.provider === 'uidai-test-fixture') {
    return new UidaiTestFixtureProvider();
  }

  throw new Error('Unsupported Aadhaar authentication provider: ' + authConfig.provider);
}

export async function authenticateAadhaar(input) {
  return providerForCurrentMode().authenticate(input);
}

export function authorizeRole(user, allowedRoles) {
  return Boolean(user && allowedRoles.includes(user.role));
}
