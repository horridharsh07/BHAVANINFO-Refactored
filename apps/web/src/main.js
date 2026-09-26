import { verifyAadhaar, authProviderLabel } from './features/auth/auth-client.js';

export function createAuthDemo(container) {
  const form = document.createElement('form');
  form.innerHTML = [
    '<h1>BHAVANINFO Identity Verification</h1>',
    '<p id="provider-label"></p>',
    '<label>Aadhaar test identifier <input name="aadhaar" inputmode="numeric" autocomplete="off" required></label>',
    '<label>Name <input name="name" autocomplete="name" required></label>',
    '<button type="submit">Verify identity</button>',
    '<p id="status" role="status"></p>'
  ].join('');

  const providerLabel = form.querySelector('#provider-label');
  providerLabel.textContent = 'Provider: UIDAI TEST DATA';

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(form);
    const status = form.querySelector('#status');
    status.textContent = 'Verifying...';

    try {
      const result = await verifyAadhaar({
        aadhaar: data.get('aadhaar'),
        name: data.get('name')
      });

      providerLabel.textContent = 'Provider: ' + authProviderLabel(result.authentication.provider);
      status.textContent =
        'Identity verified: ' + result.identity.displayName +
        ' — authentication only; application authorization is a separate step.';
    } catch (error) {
      const payload = error.payload || {};
      providerLabel.textContent =
        'Provider: ' + authProviderLabel(payload.provider || 'unknown');
      status.textContent =
        'Verification failed: ' + (payload.reason || error.message);
    }
  });

  container.replaceChildren(form);
}
