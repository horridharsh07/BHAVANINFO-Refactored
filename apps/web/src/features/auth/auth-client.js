export async function verifyAadhaar({ aadhaar, name }) {
  const response = await fetch('/api/auth/aadhaar/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aadhaar, name })
  });

  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(payload.reason || payload.error || 'Authentication failed');
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function authProviderLabel(provider) {
  if (provider === 'uidai-test-fixture') {
    return 'UIDAI TEST DATA';
  }

  if (provider === 'uidai-sandbox') {
    return 'UIDAI SANDBOX';
  }

  return provider;
}
