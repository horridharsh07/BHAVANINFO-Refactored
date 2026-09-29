const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const port = 9360;
  const userDataDir = 'C:\\Users\\thanu\\.gemini\\antigravity-ide\\brain\\b33d44aa-2369-4a1c-9f1a-38bb065557e2\\scratch\\edge_view_verify';
  
  const edge = spawn(edgePath, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--window-size=1400,900',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000/'
  ]);

  let pageTab = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      if (res.ok) {
        const tabs = await res.json();
        pageTab = tabs.find(t => t.type === 'page');
        if (pageTab) break;
      }
    } catch (e) {}
  }

  if (!pageTab) {
    console.error('Edge did not start in time');
    try { edge.kill(); } catch (e) {}
    process.exit(1);
  }

  const url = new URL(pageTab.webSocketDebuggerUrl);
  const client = net.connect({ host: url.hostname, port: parseInt(url.port) }, () => {
    const key = Buffer.from('test-key-12345678').toString('base64');
    const req = [
      `GET ${url.pathname} HTTP/1.1`,
      `Host: ${url.host}`,
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Key: ${key}`,
      'Sec-WebSocket-Version: 13',
      '\r\n'
    ].join('\r\n');
    client.write(req);
  });

  let msgId = 1;
  const callbacks = new Map();

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = msgId++;
      callbacks.set(id, resolve);
      const payload = JSON.stringify({ id, method, params });
      const len = Buffer.byteLength(payload);
      let header;
      if (len <= 125) {
        header = Buffer.from([0x81, 0x80 | len]);
      } else if (len <= 65535) {
        header = Buffer.alloc(4);
        header[0] = 0x81;
        header[1] = 0x80 | 126;
        header.writeUInt16BE(len, 2);
      } else {
        header = Buffer.alloc(10);
        header[0] = 0x81;
        header[1] = 0x80 | 127;
        header.writeBigUInt64BE(BigInt(len), 2);
      }
      const mask = Buffer.from([0x12, 0x34, 0x56, 0x78]);
      const data = Buffer.from(payload);
      for (let i = 0; i < len; i++) {
        data[i] ^= mask[i % 4];
      }
      client.write(Buffer.concat([header, mask, data]));
    });
  }

  let buffer = Buffer.alloc(0);
  client.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    try {
      while (buffer.length > 2) {
        let offset = 2;
        let payloadLen = buffer[1] & 0x7F;
        if (payloadLen === 126) {
          if (buffer.length < 4) break;
          payloadLen = buffer.readUInt16BE(2);
          offset = 4;
        } else if (payloadLen === 127) {
          if (buffer.length < 10) break;
          payloadLen = Number(buffer.readBigUInt64BE(2));
          offset = 10;
        }
        if (buffer.length < offset + payloadLen) break;
        const payload = buffer.slice(offset, offset + payloadLen).toString('utf8');
        buffer = buffer.slice(offset + payloadLen);
        const json = JSON.parse(payload);
        if (json.id && callbacks.has(json.id)) {
          const cb = callbacks.get(json.id);
          callbacks.delete(json.id);
          cb(json);
        }
      }
    } catch (e) {}
  });

  await new Promise(r => setTimeout(r, 1500));

  // Screenshot 1: Landing
  const shot1 = await send('Page.captureScreenshot');
  if (shot1 && shot1.result && shot1.result.data) {
    fs.writeFileSync('C:\\Users\\thanu\\.gemini\\antigravity-ide\\brain\\b33d44aa-2369-4a1c-9f1a-38bb065557e2\\landing_verified.png', Buffer.from(shot1.result.data, 'base64'));
    console.log('✓ Captured landing_verified.png');
  }

  // Login as Officer
  await send('Runtime.evaluate', { expression: `window.app.loginDemoOfficer();` });
  await new Promise(r => setTimeout(r, 800));

  // Screenshot 2: Officer Portal
  const shot2 = await send('Page.captureScreenshot');
  if (shot2 && shot2.result && shot2.result.data) {
    fs.writeFileSync('C:\\Users\\thanu\\.gemini\\antigravity-ide\\brain\\b33d44aa-2369-4a1c-9f1a-38bb065557e2\\officer_verified.png', Buffer.from(shot2.result.data, 'base64'));
    console.log('✓ Captured officer_verified.png');
  }

  // Logout and Login as Citizen
  await send('Runtime.evaluate', { expression: `window.app.logoutUser();` });
  await new Promise(r => setTimeout(r, 500));
  await send('Runtime.evaluate', { expression: `window.app.loginDemoHarpreet();` });
  await new Promise(r => setTimeout(r, 800));

  // Screenshot 3: Citizen Dashboard
  const shot3 = await send('Page.captureScreenshot');
  if (shot3 && shot3.result && shot3.result.data) {
    fs.writeFileSync('C:\\Users\\thanu\\.gemini\\antigravity-ide\\brain\\b33d44aa-2369-4a1c-9f1a-38bb065557e2\\citizen_verified.png', Buffer.from(shot3.result.data, 'base64'));
    console.log('✓ Captured citizen_verified.png');
  }

  try { edge.kill(); } catch (e) {}
  process.exit(0);
}

run();
