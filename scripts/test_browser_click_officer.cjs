const net = require('net');
const { spawn } = require('child_process');

async function testClickOfficer() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const port = 9346;
  const userDataDir = 'C:\\Users\\thanu\\.gemini\\antigravity-ide\\brain\\b33d44aa-2369-4a1c-9f1a-38bb065557e2\\scratch\\edge_test_click_officer';
  
  const edge = spawn(edgePath, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:3000/'
  ]);

  let pageTab = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      if (res.ok) {
        const tabs = await res.json();
        pageTab = tabs.find(t => t.type === 'page');
        if (pageTab) break;
      }
    } catch(e) {}
  }

  if (!pageTab) {
    console.error('Could not connect to Edge headless');
    try { edge.kill(); } catch(e) {}
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
      if (len < 126) {
        header = Buffer.from([0x81, 0x80 | len, 0, 0, 0, 0]);
      } else {
        header = Buffer.alloc(8);
        header[0] = 0x81;
        header[1] = 0x80 | 126;
        header.writeUInt16BE(len, 2);
      }
      const mask = header.slice(header.length - 4);
      const masked = Buffer.alloc(len);
      for (let i = 0; i < len; i++) {
        masked[i] = Buffer.from(payload)[i] ^ mask[i % 4];
      }
      client.write(Buffer.concat([header, masked]));
    });
  }

  client.on('data', (data) => {
    try {
      const str = data.toString('utf8');
      const jsonStart = str.indexOf('{');
      if (jsonStart !== -1) {
        const jsonStr = str.substring(jsonStart);
        const parsed = JSON.parse(jsonStr.substring(0, jsonStr.lastIndexOf('}') + 1));
        if (parsed.id && callbacks.has(parsed.id)) {
          const cb = callbacks.get(parsed.id);
          callbacks.delete(parsed.id);
          cb(parsed.result);
        }
      }
    } catch(e) {}
  });

  await new Promise(r => setTimeout(r, 1000));

  // Click #btn-top-officer-login
  const evalResult = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const btn = document.getElementById('btn-top-officer-login');
        if (!btn) return { ok: false, err: 'btn not found' };
        btn.click();
        const modal = document.getElementById('login-modal');
        const modalTitle = modal ? modal.querySelector('.modal-header h3').textContent : null;
        return {
          ok: true,
          modalDisplay: modal ? modal.style.display : null,
          title: modalTitle,
          hasApp: typeof window.app !== 'undefined'
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Browser Click Officer Login Result:', JSON.stringify(evalResult.result.value));

  try { edge.kill(); } catch(e) {}
  process.exit(0);
}

testClickOfficer().catch(e => {
  console.error(e);
  process.exit(1);
});
