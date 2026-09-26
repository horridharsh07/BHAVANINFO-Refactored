import { authenticateAadhaar } from '../services/auth/auth.service.js';

export async function handleAuthRoute(req, res) {
  if (req.method !== 'POST' || req.url !== '/api/auth/aadhaar/verify') {
    return false;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });

  req.on('end', async () => {
    try {
      const data = JSON.parse(body || '{}');
      const result = await authenticateAadhaar({
        aadhaar: data.aadhaar,
        name: data.name
      });

      if (!result.authenticated) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          provider: result.provider,
          reason: result.reason,
          provenance: result.provenance || null,
          source: result.source || null,
          missing: result.missing || undefined
        }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        authentication: {
          provider: result.provider,
          provenance: result.provenance,
          source: result.source
        },
        identity: {
          provider: result.provider,
          providerSubject: result.subject,
          displayName: result.displayName
        }
      }));
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Invalid authentication request'
      }));
    }
  });

  return true;
}
