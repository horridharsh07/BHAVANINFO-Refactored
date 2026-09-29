const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const port = 9355;
  const userDataDir = path.join(__dirname, '..', 'scratch', 'edge_bot_profile');
  
  const edge = spawn(edgePath, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--headless=new',
    '--window-size=1400,900',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu-sandbox',
    'http://localhost:3000/'
  ]);

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      if (res.ok) {
        const tabs = await res.json();
        const pageTab = tabs.find(t => t.type === 'page');
        if (pageTab) {
          await capture(pageTab.webSocketDebuggerUrl);
        }
        break;
      }
    } catch (e) {}
  }

  try { edge.kill('SIGKILL'); } catch (e) {}
  process.exit(0);
}

function capture(wsUrl) {
  return new Promise((resolve) => {
    const url = new URL(wsUrl);
    const client = net.connect({ host: url.hostname, port: parseInt(url.port) }, () => {
      const key = Buffer.from('test-key-12345678').toString('base64');
      const req = [
        `GET ${url.pathname} HTTP/1.1`,
        `Host: ${url.host}`,
        `Upgrade: websocket`,
        `Connection: Upgrade`,
        `Sec-WebSocket-Key: ${key}`,
        `Sec-WebSocket-Version: 13`,
        `\r\n`
      ].join('\r\n');
      client.write(req);
    });

    let msgId = 1;
    const callbacks = new Map();

    function sendCommand(method, params = {}) {
      return new Promise((res) => {
        const id = msgId++;
        callbacks.set(id, res);
        const payload = JSON.stringify({ id, method, params });
        const len = Buffer.byteLength(payload);
        let header;
        if (len < 126) {
          header = Buffer.from([0x81, 0x80 | len, 0, 0, 0, 0]);
        } else {
          header = Buffer.from([0x81, 0x80 | 126, (len >> 8) & 0xff, len & 0xff, 0, 0, 0, 0]);
        }
        client.write(Buffer.concat([header, Buffer.from(payload)]));
      });
    }

    let buffer = Buffer.alloc(0);
    client.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.toString().includes('\r\n\r\n')) {
        const parts = buffer.toString().split('\r\n\r\n');
        if (parts[0].includes('101 Switching Protocols')) {
          buffer = buffer.slice(Buffer.byteLength(parts[0]) + 4);
          onHandshake();
        }
      }

      while (buffer.length >= 2) {
        const opcode = buffer[0] & 0x0f;
        let payloadLen = buffer[1] & 0x7f;
        let offset = 2;
        if (payloadLen === 126) {
          if (buffer.length < 4) break;
          payloadLen = buffer.readUInt16BE(2);
          offset = 4;
        }
        if (buffer.length < offset + payloadLen) break;
        const payloadData = buffer.slice(offset, offset + payloadLen);
        buffer = buffer.slice(offset + payloadLen);

        if (opcode === 1) {
          try {
            const data = JSON.parse(payloadData.toString());
            if (data.id && callbacks.has(data.id)) {
              callbacks.get(data.id)(data.result);
              callbacks.delete(data.id);
            }
          } catch (e) {}
        }
      }
    });

    async function onHandshake() {
      await sendCommand('Page.enable');
      await sendCommand('Runtime.enable');
      await new Promise(r => setTimeout(r, 1500));

      const evalRes = await sendCommand('Runtime.evaluate', {
        expression: `
          (() => {
            const btn = document.getElementById('btn-open-ai-assistant');
            if (!btn) return 'not found';
            const rect = btn.getBoundingClientRect();
            return {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              top: rect.top,
              right: window.innerWidth - rect.right,
              bottom: window.innerHeight - rect.bottom,
              display: window.getComputedStyle(btn).display,
              position: window.getComputedStyle(btn).position,
              visibility: window.getComputedStyle(btn).visibility,
              classList: Array.from(btn.classList)
            };
          })()
        `,
        returnByValue: true
      });
      console.log('BOT_INFO:', JSON.stringify(evalRes.result ? evalRes.result.value : null));

      const shot = await sendCommand('Page.captureScreenshot', { format: 'png' });
      if (shot && shot.data) {
        fs.writeFileSync(path.join(__dirname, '..', 'scratch', 'bot_current_view.png'), Buffer.from(shot.data, 'base64'));
        console.log('Saved scratch/bot_current_view.png');
      }

      resolve();
    }
  });
}

run();
