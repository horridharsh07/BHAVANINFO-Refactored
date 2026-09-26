import http from 'node:http';
import { handleAuthRoute } from './routes/auth.routes.js';

const PORT = Number(process.env.PORT || 4000);

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.WEB_ORIGIN || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      service: 'bhavaninfo-api',
      status: 'ok'
    }));
    return;
  }

  if (await handleAuthRoute(req, res)) {
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: false,
    error: 'Endpoint not found'
  }));
});

server.listen(PORT, () => {
  console.log('BHAVANINFO API listening on http://localhost:' + PORT);
});
