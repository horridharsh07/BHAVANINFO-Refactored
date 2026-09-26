const API_BASE = '';

async function requestJson(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.reason || payload.error || 'API request failed');
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function fetchDashboardSummary() {
  return requestJson('/api/dashboard/summary');
}

export function fetchDemoParcels() {
  return requestJson('/api/parcels');
}

export function searchDemoParcels(query) {
  return requestJson('/api/parcels/search?q=' + encodeURIComponent(query));
}

export function createDemoParcel(payload) {
  return requestJson('/api/parcels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}
