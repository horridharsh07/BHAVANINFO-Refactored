const net = require('net');
const { spawn } = require('child_process');

async function testCompleteLogin() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const port = 9355;
  const userDataDir = 'C:\\Users\\thanu\\.gemini\\antigravity-ide\\brain\\b33d44aa-2369-4a1c-9f1a-38bb065557e2\\scratch\\edge_test_full_flow_v2';
  
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
    console.error('Could not connect to Edge');
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
    } catch(e) {}
  });

  await new Promise(r => setTimeout(r, 1200));

  // Step 1: Click Citizen Sign In
  const step1 = await send('Runtime.evaluate', {
    expression: `
      (function() {
        document.getElementById('btn-top-citizen-signin').click();
        const citModal = document.getElementById('modal-citizen-login');
        const offModal = document.getElementById('modal-officer-login');
        return {
          citModalDisplay: citModal ? citModal.style.display : null,
          offModalDisplay: offModal ? offModal.style.display : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Step 1 (Open Citizen Modal):', step1.result.value);

  // Step 2: Click Citizen Demo button
  const step2 = await send('Runtime.evaluate', {
    expression: `
      (function() {
        window.app.loginDemoHarpreet();
        const citModal = document.getElementById('modal-citizen-login');
        const govNav = document.querySelector('.gov-nav');
        const govHeader = document.querySelector('.gov-header');
        const topAuth = document.querySelector('.top-auth-actions');
        const dashView = document.getElementById('view-dashboard');
        return {
          hash: window.location.hash,
          citModalClosed: citModal ? citModal.style.display : null,
          govNavDisplay: govNav ? window.getComputedStyle(govNav).display : null,
          govHeaderDisplay: govHeader ? window.getComputedStyle(govHeader).display : null,
          topAuthDisplay: topAuth ? window.getComputedStyle(topAuth).display : null,
          dashActive: dashView ? dashView.classList.contains('active') : false,
          userName: window.app.currentUser ? window.app.currentUser.name : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Step 2 (Citizen Demo Login & Redirect):', step2.result.value);

  // Step 3: Sign Out
  const step3 = await send('Runtime.evaluate', {
    expression: `
      (function() {
        window.app.logoutUser();
        const govNav = document.querySelector('.gov-nav');
        const govHeader = document.querySelector('.gov-header');
        const landingView = document.getElementById('view-landing');
        return {
          hash: window.location.hash,
          govNavDisplay: govNav ? window.getComputedStyle(govNav).display : null,
          govHeaderDisplay: govHeader ? window.getComputedStyle(govHeader).display : null,
          landingActive: landingView ? landingView.classList.contains('active') : false,
          hasUser: !!window.app.currentUser
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Step 3 (Sign Out & Return to Landing):', step3.result.value);

  // Step 4: Click Authority Login
  const step4 = await send('Runtime.evaluate', {
    expression: `
      (function() {
        document.getElementById('btn-top-officer-login').click();
        const citModal = document.getElementById('modal-citizen-login');
        const offModal = document.getElementById('modal-officer-login');
        return {
          citModalDisplay: citModal ? citModal.style.display : null,
          offModalDisplay: offModal ? offModal.style.display : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Step 4 (Open Authority Modal):', step4.result.value);

  // Step 5: Click Authority Demo button
  const step5 = await send('Runtime.evaluate', {
    expression: `
      (function() {
        window.app.loginDemoOfficer();
        const offModal = document.getElementById('modal-officer-login');
        const govNav = document.querySelector('.gov-nav');
        const govHeader = document.querySelector('.gov-header');
        const btnNavOfficer = document.getElementById('btn-nav-officer');
        const notifBar = document.getElementById('top-gov-notification-bar');
        const officerView = document.getElementById('view-officer');
        return {
          hash: window.location.hash,
          offModalClosed: offModal ? offModal.style.display : null,
          govNavDisplay: govNav ? window.getComputedStyle(govNav).display : null,
          govHeaderDisplay: govHeader ? window.getComputedStyle(govHeader).display : null,
          btnNavOfficerDisplay: btnNavOfficer ? window.getComputedStyle(btnNavOfficer).display : null,
          notifBarDisplay: notifBar ? window.getComputedStyle(notifBar).display : null,
          officerActive: officerView ? officerView.classList.contains('active') : false,
          officerRole: window.app.currentUser ? window.app.currentUser.role : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Step 5 (Authority Demo Login & Redirect):', step5.result.value);

  try { edge.kill(); } catch(e) {}
  process.exit(0);
}

testCompleteLogin();
