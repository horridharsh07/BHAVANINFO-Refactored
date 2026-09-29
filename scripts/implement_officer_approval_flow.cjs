const fs = require('fs');

console.log('🔧 Implementing Officer Approval Flow & Approved List display...');

// 1. UPDATE server.js - Add /api/parcels/approve endpoint
let serverJs = fs.readFileSync('server.js', 'utf8');

const approveEndpoint = `  // API 3B: Officer Approve Parcel
  if (pathname === '/api/parcels/approve' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const ulpin = data.ulpin;
        if (!ulpin) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ULPIN is required' }));
          return;
        }

        db.prepare(\`
          UPDATE parcels 
          SET status = 'PLAN_APPROVED', has_anomaly = 0, anomaly_desc = NULL 
          WHERE ulpin = ? OR legacy_ulpin = ?
        \`).run(ulpin, ulpin);

        try {
          db.prepare(\`
            UPDATE sub_ulpins 
            SET is_flagged = 0 
            WHERE parcel_ulpin = ? OR parcel_ulpin = (SELECT ulpin FROM parcels WHERE legacy_ulpin = ?)
          \`).run(ulpin, ulpin);
        } catch(e) {}

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: \`Parcel \${ulpin} approved and marked as VERIFIED\`, ulpin }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

`;

if (!serverJs.includes('/api/parcels/approve')) {
  serverJs = serverJs.replace(
    "// API 3: Get Single Parcel Details by ULPIN",
    `${approveEndpoint}  // API 3: Get Single Parcel Details by ULPIN`
  );
  fs.writeFileSync('server.js', serverJs, 'utf8');
  console.log('✓ server.js updated with /api/parcels/approve');
} else {
  console.log('✓ server.js already has /api/parcels/approve');
}

// 2. UPDATE index.html - Rename tab to "Approved List"
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
  '>Verified Parcels (<span id="officer-tab-count-verified">',
  '>Approved List (<span id="officer-tab-count-verified">'
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ index.html updated tab label to "Approved List"');

// 3. UPDATE src/app.js - Implement approveParcel and update renderOfficerTableRows
let appJs = fs.readFileSync('src/app.js', 'utf8');

const oldApproveRegex = /approveParcel\(ulpin\) \{[\s\S]*?alert\([^\)]+\);\s*this\.loadOfficerRequests\(\);\s*\}/;

const newApproveCode = `async approveParcel(ulpin) {
\t\t// Find parcel in memory
\t\tconst parcel = (this.officerParcels || []).find(p => p.ulpin === ulpin || p.legacy_ulpin === ulpin);
\t\tconst ownerName = parcel ? parcel.owner : 'Property Owner';
\t\tconst surveyNo = parcel ? parcel.survey_no : ulpin;

\t\t// 1. Update in-memory parcel status
\t\tif (parcel) {
\t\t\tparcel.status = 'PLAN_APPROVED';
\t\t\tparcel.has_anomaly = false;
\t\t\tparcel.anomaly_desc = null;
\t\t}

\t\t// Also update in allParcels
\t\tconst mainP = (this.allParcels || []).find(p => p.ulpin === ulpin || p.legacy_ulpin === ulpin);
\t\tif (mainP) {
\t\t\tmainP.status = 'PLAN_APPROVED';
\t\t\tmainP.has_anomaly = false;
\t\t\tmainP.anomaly_desc = null;
\t\t}

\t\t// 2. Call backend API to persist in SQLite
\t\ttry {
\t\t\tawait fetch('/api/parcels/approve', {
\t\t\t\tmethod: 'POST',
\t\t\t\theaders: { 'Content-Type': 'application/json' },
\t\t\t\tbody: JSON.stringify({ ulpin })
\t\t\t});
\t\t} catch(e) {
\t\t\tconsole.warn('Backend approve call:', e);
\t\t}

\t\t// 3. Recalculate KPI and tab counters
\t\tconst pendingParcels = this.officerParcels.filter(p => p.status === 'PENDING_SURVEY' || p.status === 'PROVISIONAL' || p.status === 'PENDING_REGISTRATION' || !p.status);
\t\tconst approvedParcels = this.officerParcels.filter(p => p.status === 'VERIFIED' || p.status === 'PLAN_APPROVED');
\t\tconst flaggedParcels = this.officerParcels.filter(p => p.has_anomaly === true || p.has_anomaly === 1);

\t\tconst statsEl = document.getElementById('officer-pending-count');
\t\tif (statsEl) statsEl.textContent = pendingParcels.length;
\t\tconst approvedEl = document.getElementById('officer-approved-count');
\t\tif (approvedEl) approvedEl.textContent = approvedParcels.length;
\t\tconst flaggedEl = document.getElementById('officer-flagged-count');
\t\tif (flaggedEl) flaggedEl.textContent = flaggedParcels.length;

\t\tconst tabAll = document.getElementById('officer-tab-count-all');
\t\tif (tabAll) tabAll.textContent = this.officerParcels.length.toLocaleString();
\t\tconst tabApp = document.getElementById('officer-tab-count-approvals');
\t\tif (tabApp) tabApp.textContent = pendingParcels.length;
\t\tconst tabViol = document.getElementById('officer-tab-count-violations');
\t\tif (tabViol) tabViol.textContent = flaggedParcels.length;
\t\tconst tabVer = document.getElementById('officer-tab-count-verified');
\t\tif (tabVer) tabVer.textContent = approvedParcels.length;

\t\t// 4. Show toast notification
\t\tthis.showToast(\`Parcel \${surveyNo} (\${ownerName}) APPROVED! Added to the Approved List.\`, 4000);

\t\t// 5. CRITICAL: Automatically switch to the "Approved List" tab so the officer sees it!
\t\tthis.switchOfficerTab('verified');
\t}`;

appJs = appJs.replace(oldApproveRegex, newApproveCode);

// Also update renderOfficerTableRows to clearly show "Verified & Plan Approved" and disable/hide Approve button once approved
const oldRowActionRegex = /\$\{!\s*isVerified\s*\?\s*`<button class="btn-officer-action btn-approve"[\s\S]*?`\s*:\s*''\}/;
const newRowAction = `\${!isVerified ? \`<button class="btn-officer-action btn-approve" onclick="window.app.approveParcel('\${parcel.ulpin}')">Approve</button>\` : \`<span style="font-size: 0.75rem; color: #16a34a; font-weight: 700; background: #dcfce7; padding: 3px 8px; border-radius: 4px; border: 1px solid #bbf7d0;">Approved</span>\`}`;
appJs = appJs.replace(oldRowActionRegex, newRowAction);

fs.writeFileSync('src/app.js', appJs, 'utf8');
console.log('✓ src/app.js updated approveParcel to switch to Approved List tab');
