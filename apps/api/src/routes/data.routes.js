import { getDashboardSummary, getDilrmpPunjabSnapshot } from '../services/official/dilrmp.service.js';
import {
  listDemoParcels,
  searchDemoParcels,
  getDemoParcel,
  createDemoParcel
} from '../services/demo/cadastral-demo.service.js';

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

export async function handleDataRoute(req, res) {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/api/dashboard/summary') {
    sendJson(res, 200, getDashboardSummary());
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/official/dilrmp/punjab') {
    sendJson(res, 200, {
      success: true,
      data: getDilrmpPunjabSnapshot()
    });
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/parcels') {
    sendJson(res, 200, {
      success: true,
      ...listDemoParcels()
    });
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/parcels/search') {
    sendJson(res, 200, {
      success: true,
      ...searchDemoParcels(url.searchParams.get('q'))
    });
    return true;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/parcels/')) {
    const ulpin = decodeURIComponent(url.pathname.slice('/api/parcels/'.length));
    const parcel = getDemoParcel(ulpin);

    if (!parcel) {
      sendJson(res, 404, {
        success: false,
        error: 'Parcel not found',
        dataStatus: 'synthetic_demo'
      });
      return true;
    }

    sendJson(res, 200, {
      success: true,
      dataStatus: 'synthetic_demo',
      provenance: listDemoParcels().provenance,
      data: parcel
    });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/parcels') {
    try {
      const input = await readJson(req);
      const parcel = createDemoParcel(input);

      sendJson(res, 201, {
        success: true,
        dataStatus: 'synthetic_demo',
        provenance: listDemoParcels().provenance,
        data: parcel,
        persistence: 'process_memory_only'
      });
    } catch (error) {
      sendJson(res, 400, {
        success: false,
        error: error.code || 'INVALID_REQUEST',
        reason: error.message
      });
    }
    return true;
  }

  return false;
}
