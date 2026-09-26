import { getDashboardSummary, getDilrmpPunjabSnapshot } from '../services/official/dilrmp.service.js';

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

export async function handleDataRoute(req, res) {
  if (req.method !== 'GET') return false;

  if (req.url === '/api/dashboard/summary') {
    sendJson(res, 200, getDashboardSummary());
    return true;
  }

  if (req.url === '/api/official/dilrmp/punjab') {
    sendJson(res, 200, {
      success: true,
      data: getDilrmpPunjabSnapshot()
    });
    return true;
  }

  return false;
}
