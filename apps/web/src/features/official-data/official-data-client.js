const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function requestJson(path) {
  const response = await fetch(API_BASE + path, {
    headers: { Accept: 'application/json' }
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.error || 'API request failed');
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function fetchDashboardSummary() {
  return requestJson('/api/dashboard/summary');
}
