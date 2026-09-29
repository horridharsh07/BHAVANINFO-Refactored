const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('Testing Officer Approval Flow and Approved List Display...');

  // Test 1: Fetch parcels
  const parcelsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/parcels',
    method: 'GET'
  });
  assert.strictEqual(parcelsRes.status, 200, 'Expected 200 from /api/parcels');
  const parcels = parcelsRes.body.data;
  assert(parcels.length > 0, 'Parcels list must not be empty');
  console.log(`PASS 1: Loaded ${parcels.length} parcels from backend`);

  // Test 2: Find a pending parcel to approve
  const pendingParcel = parcels.find(p => p.status === 'PENDING_REGISTRATION' || p.status === 'PENDING_SURVEY' || p.status === 'PROVISIONAL');
  assert(pendingParcel, 'Should find at least one pending parcel');
  console.log(`PASS 2: Found pending parcel: ${pendingParcel.ulpin} (${pendingParcel.owner || 'Unknown'})`);

  // Test 3: Approve parcel via POST /api/parcels/approve
  const approveRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/parcels/approve',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { ulpin: pendingParcel.ulpin });

  assert.strictEqual(approveRes.status, 200, 'Expected 200 from /api/parcels/approve');
  assert.strictEqual(approveRes.body.success, true, 'Approve call should succeed');
  console.log(`PASS 3: Approved parcel ${pendingParcel.ulpin} successfully`);

  // Test 4: Verify parcel is now marked as PLAN_APPROVED
  const verifyRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/parcels/${pendingParcel.ulpin}`,
    method: 'GET'
  });
  assert.strictEqual(verifyRes.status, 200, 'Expected 200 from /api/parcels/:ulpin');
  assert.strictEqual(verifyRes.body.data.status, 'PLAN_APPROVED', 'Parcel status should be PLAN_APPROVED in backend');
  console.log(`PASS 4: Verified backend persisted status: PLAN_APPROVED`);

  // Test 5: Check approved list filter logic in src/app.js
  const appJs = fs.readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8');
  assert(appJs.includes("this.switchOfficerTab('verified')"), 'approveParcel must call switchOfficerTab("verified")');
  assert(appJs.includes("status === 'VERIFIED' || p.status === 'PLAN_APPROVED' || p.status === 'APPROVED'"), 'Approved list tab must include PLAN_APPROVED');
  assert(appJs.includes("p.status === 'PENDING_REGISTRATION'"), 'Approvals tab must include PENDING_REGISTRATION');
  assert(appJs.includes("justApproved"), 'Must highlight newly approved parcel');
  console.log('PASS 5: Verified frontend filter and auto-switch logic in src/app.js');

  // Test 6: Check index.html elements
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert(indexHtml.includes('id="officer-tab-count-verified"'), 'Verified counter element must exist');
  assert(indexHtml.includes('id="officer-table-heading"'), 'Officer dynamic table heading element must exist');
  assert(indexHtml.includes('id="dossier-officer-actions"'), 'Dossier officer actions container must exist');
  console.log('PASS 6: Verified HTML elements and tab bindings');

  console.log('\nALL 6 TESTS PASSED! Officer approval flow verified successfully.');
}

runTests().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
