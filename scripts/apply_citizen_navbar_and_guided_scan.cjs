const fs = require('fs');

console.log('🔧 Updating Citizen Navbar & 3-Step Guided Scan Workflow...');

// 1. UPDATE index.html
let html = fs.readFileSync('index.html', 'utf8');

// A. Remove "#btn-open-district-report" from Citizen Dashboard
const oldDashReportBtn = `<button id="btn-open-district-report" class="btn-primary" style="background: #0284c7; border-color: #38bdf8; color: #ffffff; font-weight: 700;" onclick="window.app && window.app.switchView('report')">
\t\t\t\t\t\tDistrict Cadastre Report
\t\t\t\t\t</button>`;
if (html.includes(oldDashReportBtn)) {
  html = html.replace(oldDashReportBtn, '');
} else {
  // Regex fallback
  html = html.replace(/<button id="btn-open-district-report"[\s\S]*?<\/button>\s*/, '');
}

// B. Replace the 3 buttons in #register-property-modal with ONE button
const oldThreeButtons = `<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 10px;">
\t\t\t\t\t\t\t<button type="button" id="btn-select-map-building" onclick="window.app.startSelectBuildingOnMap()" class="btn-card" style="padding: 9px 8px; font-size: 0.78rem; background: #0284c7; color: #fff; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; font-weight: 700; box-shadow: 0 2px 6px rgba(2,132,199,0.3);">
\t\t\t\t\t\t\t\t<span>Select Footprint</span>
\t\t\t\t\t\t\t</button>
\t\t\t\t\t\t\t<button type="button" id="btn-draw-map-polygon" onclick="window.app.startDrawBoundaryPolygon()" class="btn-card" style="padding: 9px 8px; font-size: 0.78rem; background: #16a34a; color: #fff; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; font-weight: 700; box-shadow: 0 2px 6px rgba(22,163,74,0.3);">
\t\t\t\t\t\t\t\t<span>Draw Boundary (6 Dots)</span>
\t\t\t\t\t\t\t</button>
\t\t\t\t\t\t\t<button type="button" id="btn-manual-gps-scan" onclick="window.app.startManualScanFromModal()" class="btn-card" style="padding: 9px 8px; font-size: 0.78rem; background: #7c3aed; color: #fff; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; font-weight: 700; box-shadow: 0 2px 6px rgba(124,58,237,0.3);">
\t\t\t\t\t\t\t\t<span>2-Phase GPS &amp; Exterior Scan</span>
\t\t\t\t\t\t\t</button>
\t\t\t\t\t\t</div>`;

const newSingleButton = `<div style="margin-bottom: 12px;">
\t\t\t\t\t\t\t<button type="button" id="btn-manual-gps-scan" onclick="window.app && window.app.startManualScanFromModal()" class="btn-card" style="width: 100%; padding: 12px 16px; background: linear-gradient(135deg, #0284c7 0%, #00274d 100%); color: #ffffff; border: 1.5px solid #38bdf8; border-radius: 8px; font-weight: 700; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(2,132,199,0.3); transition: transform 0.15s ease;">
\t\t\t\t\t\t\t\t<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
\t\t\t\t\t\t\t\t<span>Choose Building / Plot &amp; Scan (6 Points &bull; Front, Back, Left, Right Photos)</span>
\t\t\t\t\t\t\t</button>
\t\t\t\t\t\t</div>`;

if (html.includes(oldThreeButtons)) {
  html = html.replace(oldThreeButtons, newSingleButton);
} else {
  // Regex fallback
  html = html.replace(/<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 10px;">[\s\S]*?<\/div>\s*<!-- Cadastral Polygon Geometry/, `${newSingleButton}\n\n\t\t\t\t\t\t<!-- Cadastral Polygon Geometry`);
}

// C. Update the instructions above the single button
html = html.replace(
  'Select an existing building footprint on the satellite map or draw custom multi-point boundaries (6 connecting dots) to compute precise cadastral land area:',
  'Complete the 3-step cadastral verification: (1) Choose the building or plot, (2) Capture the 6 boundary points, and (3) Scan the Front, Back, Left, and Right elevation photos:'
);

// Bump cache buster
html = html.replace(/src="src\/app\.js\?v=[^"]+"/, `src="src/app.js?v=v20260926_clean_nav_and_scan_${Date.now()}"`);

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ index.html updated successfully');

// 2. UPDATE src/app.js
let appJs = fs.readFileSync('src/app.js', 'utf8');

// A. Update loginUser to strictly tailor navbar based on user role
const oldNavDisplayBlock = `\t\t// Show My Portfolio for Citizen
\t\tconst dashNav = document.getElementById('tour-nav-dashboard');
\t\tif (dashNav) {
\t\t\tdashNav.style.display = (this.currentUser.role !== 'AUTHORITY_HEAD') ? 'flex' : 'none';
\t\t}

\t\tconst officerNav = document.getElementById('tour-nav-officer');
\t\tif (officerNav) {
\t\t\tofficerNav.style.display = 'flex';
\t\t}`;

const newNavDisplayBlock = `\t\t// Role-Based Navigation Bar Customization:
\t\tconst isOfficer = (this.currentUser && this.currentUser.role === 'AUTHORITY_HEAD');
\t\tconst landingNav = document.getElementById('tour-nav-landing');
\t\tif (landingNav) landingNav.style.display = 'none'; // Never show Home in portal navbar

\t\tconst dashNav = document.getElementById('tour-nav-dashboard');
\t\tif (dashNav) dashNav.style.display = isOfficer ? 'none' : 'flex';

\t\tconst officerNav = document.getElementById('tour-nav-officer');
\t\tif (officerNav) officerNav.style.display = isOfficer ? 'flex' : 'none';

\t\tconst reportNav = document.getElementById('tour-nav-report');
\t\tif (reportNav) reportNav.style.display = isOfficer ? 'flex' : 'none';

\t\tconst mapNav = document.getElementById('tour-nav-map');
\t\tif (mapNav) mapNav.style.display = 'flex';
\t\tconst twinNav = document.getElementById('tour-nav-twin');
\t\tif (twinNav) twinNav.style.display = 'flex';`;

if (appJs.includes(oldNavDisplayBlock)) {
  appJs = appJs.replace(oldNavDisplayBlock, newNavDisplayBlock);
} else {
  appJs = appJs.replace(/\/\/ Show My Portfolio for Citizen[\s\S]*?officerNav\.style\.display = 'flex';[\s\S]*?\}/, newNavDisplayBlock);
}

// B. Update switchView to enforce role-based nav hiding
const oldSwitchViewNavBlock = `\t\tif (govNav) govNav.style.display = (viewName === 'landing') ? 'none' : 'flex';
\t\tif (govHeader) govHeader.style.display = (viewName === 'landing') ? 'flex' : 'none';
\t\tif (topAuthActions) topAuthActions.style.display = (viewName === 'landing') ? 'flex' : 'none';`;

const newSwitchViewNavBlock = `\t\tif (govNav) govNav.style.display = (viewName === 'landing') ? 'none' : 'flex';
\t\tif (govHeader) govHeader.style.display = (viewName === 'landing') ? 'flex' : 'none';
\t\tif (topAuthActions) topAuthActions.style.display = (viewName === 'landing') ? 'flex' : 'none';

\t\t// Enforce role-based navbar item visibility
\t\tif (viewName !== 'landing') {
\t\t\tconst isOfficer = (this.currentUser && this.currentUser.role === 'AUTHORITY_HEAD');
\t\t\tconst landingNav = document.getElementById('tour-nav-landing');
\t\t\tif (landingNav) landingNav.style.display = 'none'; // Hide Home in portal view
\t\t\tconst dashNav = document.getElementById('tour-nav-dashboard');
\t\t\tif (dashNav) dashNav.style.display = isOfficer ? 'none' : 'flex';
\t\t\tconst officerNav = document.getElementById('tour-nav-officer');
\t\t\tif (officerNav) officerNav.style.display = isOfficer ? 'flex' : 'none';
\t\t\tconst reportNav = document.getElementById('tour-nav-report');
\t\t\tif (reportNav) reportNav.style.display = isOfficer ? 'flex' : 'none';
\t\t}`;

appJs = appJs.replace(oldSwitchViewNavBlock, newSwitchViewNavBlock);

// C. Update initManualScan and replace with the 3-step workflow (Step 1: Choose Plot/Building, Step 2: 6 Points, Step 3: Front, Back, Left, Right Photos)
const scanFlowRegex = /initManualScan\(\) \{[\s\S]*?completeBuildingScan\(\) \{[\s\S]*?if \(this\.recalculateChallanFee\) this\.recalculateChallanFee\(\);\s*\}\s*\}/;

const newScanWorkflowCode = `initManualScan() {
\t\tconst container = document.getElementById('scan-container');
\t\tif (!container) return;

\t\t// Initialize 3-Step Scan State
\t\tthis.scanState = {
\t\t\tstep: 1,
\t\t\tchosenPlot: {
\t\t\t\tkhasra: 'Khasra No. 429/1',
\t\t\t\tlocality: 'Kot Atma Singh / Heritage Cadastre Zone',
\t\t\t\tulpin: 'BCN501G6OF8R50',
\t\t\t\tarea_sqyd: 385,
\t\t\t\tarea_sqft: 3465,
\t\t\t\tlat: 31.61285,
\t\t\t\tlng: 74.86235
\t\t\t},
\t\t\tplotPoints: [],
\t\t\texteriorPhotos: {
\t\t\t\tfront: false,
\t\t\t\tback: false,
\t\t\t\tleft: false,
\t\t\t\tright: false
\t\t\t},
\t\t\tplotArea: 385,
\t\t\testimatedHeight: 0
\t\t};

\t\tthis.renderScanStep1();
\t}

\trenderScanStep1() {
\t\tconst container = document.getElementById('scan-container');
\t\tif (!container) return;
\t\tthis.scanState.step = 1;

\t\tconst samplePlots = [
\t\t\t{ khasra: 'Khasra No. 429/1', locality: 'Kot Atma Singh / Heritage Cadastre Zone', ulpin: 'BCN501G6OF8R50', area_sqyd: 385, lat: 31.61285, lng: 74.86235 },
\t\t\t{ khasra: 'Khasra No. 412/1', locality: 'Heritage Cadastre Zone / Urban Amritsar-I', ulpin: 'BCN501B1NA2CH0', area_sqyd: 350, lat: 31.61034, lng: 74.85998 },
\t\t\t{ khasra: 'Khasra No. 518/3', locality: 'Mall Road Commercial Cadastre Division', ulpin: 'BCN501C2KB4M10', area_sqyd: 580, lat: 31.62145, lng: 74.87120 },
\t\t\t{ khasra: 'Khasra No. 204/2', locality: 'Civil Lines Urban Extension', ulpin: 'BCN501D3LC5N20', area_sqyd: 420, lat: 31.61890, lng: 74.86540 }
\t\t];

\t\tcontainer.innerHTML = \`
\t\t\t<div class="scan-phase-card">
\t\t\t\t<div class="scan-phase-header">
\t\t\t\t\t<div class="scan-phase-badge">STEP 1 OF 3</div>
\t\t\t\t\t<h2 class="scan-phase-title">Choose Building or Plot</h2>
\t\t\t\t\t<p class="scan-phase-desc">Select your cadastral plot or building footprint from the official Amritsar survey register, or specify your plot boundaries:</p>
\t\t\t\t</div>

\t\t\t\t<div style="display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 20px;">
\t\t\t\t\t\${samplePlots.map((plot, i) => \`
\t\t\t\t\t\t<label style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: \${i===0 ? '#f0fdf4' : '#ffffff'}; border: 2px solid \${i===0 ? '#16a34a' : '#cbd5e1'}; border-radius: 8px; cursor: pointer; transition: all 0.2s ease;">
\t\t\t\t\t\t\t<div style="display: flex; align-items: center; gap: 12px;">
\t\t\t\t\t\t\t\t<input type="radio" name="chosen-plot-radio" value="\${plot.khasra}" \${i===0 ? 'checked' : ''} onchange="window.app.selectScanPlot('\${plot.khasra}', '\${plot.locality}', '\${plot.ulpin}', \${plot.area_sqyd}, \${plot.lat}, \${plot.lng})" style="width: 18px; height: 18px; accent-color: #16a34a;">
\t\t\t\t\t\t\t\t<div>
\t\t\t\t\t\t\t\t\t<div style="font-weight: 700; color: #0f172a; font-size: 0.95rem;">\${plot.khasra}</div>
\t\t\t\t\t\t\t\t\t<div style="font-size: 0.78rem; color: #64748b;">\${plot.locality} &bull; ULPIN: <span style="font-family: monospace; font-weight: 600; color: #0284c7;">\${plot.ulpin}</span></div>
\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<div style="text-align: right;">
\t\t\t\t\t\t\t\t<span style="display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 0.78rem; font-weight: 700; padding: 4px 8px; border-radius: 4px;">\${plot.area_sqyd} sq.yd</span>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t</label>
\t\t\t\t\t\`).join('')}
\t\t\t\t</div>

\t\t\t\t<div style="background: #f8fafc; border: 1.5px dashed #94a3b8; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
\t\t\t\t\t<div style="font-size: 0.8rem; font-weight: 700; color: #1e293b; margin-bottom: 6px;">Selected Plot Summary:</div>
\t\t\t\t\t<div style="font-size: 0.82rem; color: #334155; line-height: 1.5;" id="chosen-plot-summary-txt">
\t\t\t\t\t\t<strong>\${this.scanState.chosenPlot.khasra}</strong> &bull; \${this.scanState.chosenPlot.locality} (\${this.scanState.chosenPlot.area_sqyd} sq.yd &bull; \${this.scanState.chosenPlot.area_sqft} sq.ft)
\t\t\t\t\t</div>
\t\t\t\t</div>

\t\t\t\t<div class="scan-actions">
\t\t\t\t\t<button type="button" class="btn-scan-secondary" onclick="window.app.openRegisterModal()">&larr; Back to Registration Form</button>
\t\t\t\t\t<button type="button" class="btn-scan-primary" onclick="window.app.renderScanStep2()">
\t\t\t\t\t\tProceed to Step 2: 6 Boundary Points &rarr;
\t\t\t\t\t</button>
\t\t\t\t</div>
\t\t\t</div>
\t\t\`;
\t}

\tselectScanPlot(khasra, locality, ulpin, area_sqyd, lat, lng) {
\t\tthis.scanState.chosenPlot = { khasra, locality, ulpin, area_sqyd, area_sqft: area_sqyd * 9, lat, lng };
\t\tconst sumEl = document.getElementById('chosen-plot-summary-txt');
\t\tif (sumEl) {
\t\t\tsumEl.innerHTML = \`<strong>\${khasra}</strong> &bull; \${locality} (\${area_sqyd} sq.yd &bull; \${area_sqyd * 9} sq.ft)\`;
\t\t}
\t}

\trenderScanStep2() {
\t\tconst container = document.getElementById('scan-container');
\t\tif (!container) return;
\t\tthis.scanState.step = 2;

\t\tcontainer.innerHTML = \`
\t\t\t<div class="scan-phase-card">
\t\t\t\t<div class="scan-phase-header">
\t\t\t\t\t<div class="scan-phase-badge">STEP 2 OF 3</div>
\t\t\t\t\t<h2 class="scan-phase-title">6 Points of the Plot / Building</h2>
\t\t\t\t\t<p class="scan-phase-desc">Mark or capture the 6 GPS boundary coordinates for <strong>\${this.scanState.chosenPlot.khasra}</strong>. All 6 points are required to compute the cadastral perimeter:</p>
\t\t\t\t</div>

\t\t\t\t<div class="scan-progress-bar">
\t\t\t\t\t<div class="scan-progress-fill" id="scan-progress-fill" style="width: 0%"></div>
\t\t\t\t</div>
\t\t\t\t<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
\t\t\t\t\t<div class="scan-progress-label" id="scan-progress-label" style="margin: 0;">0 of 6 points captured</div>
\t\t\t\t\t<button type="button" onclick="window.app.quickCaptureAll6Points()" style="padding: 4px 10px; font-size: 0.74rem; background: #e0f2fe; color: #0284c7; border: 1px solid #38bdf8; border-radius: 4px; font-weight: 700; cursor: pointer;">
\t\t\t\t\t\tInstant Capture All 6 Points
\t\t\t\t\t</button>
\t\t\t\t</div>

\t\t\t\t<div class="scan-map-container" id="scan-map-preview">
\t\t\t\t\t<div class="scan-map-placeholder" id="scan-polygon-placeholder">
\t\t\t\t\t\t<span style="font-size: 2.2rem; color: #0284c7; font-weight: 800;">6-Point Boundary</span>
\t\t\t\t\t\t<p>Boundary polygon will preview here as points are captured</p>
\t\t\t\t\t</div>
\t\t\t\t</div>

\t\t\t\t<div class="scan-points-grid" id="scan-points-grid">
\t\t\t\t\t\${[1,2,3,4,5,6].map(i => \`
\t\t\t\t\t\t<div class="scan-point-card" id="scan-point-card-\${i}" data-point="\${i}">
\t\t\t\t\t\t\t<div class="scan-point-num">\${i}</div>
\t\t\t\t\t\t\t<div class="scan-point-status" id="scan-point-status-\${i}">
\t\t\t\t\t\t\t\t<span class="scan-waiting-icon">Pending</span>
\t\t\t\t\t\t\t\t<span>Waiting...</span>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<button type="button" class="btn-scan-capture" id="btn-capture-point-\${i}" onclick="window.app.captureGpsPoint(\${i})">
\t\t\t\t\t\t\t\tCapture Point \${i}
\t\t\t\t\t\t\t</button>
\t\t\t\t\t\t</div>
\t\t\t\t\t\`).join('')}
\t\t\t\t</div>

\t\t\t\t<div class="scan-area-result" id="scan-area-result" style="display: none; margin-top: 14px;">
\t\t\t\t\t<div class="scan-area-grid">
\t\t\t\t\t\t<div><span class="scan-area-label">Calculated Area</span><strong id="scan-area-sqyd">—</strong></div>
\t\t\t\t\t\t<div><span class="scan-area-label">Area (sq.ft)</span><strong id="scan-area-sqft">—</strong></div>
\t\t\t\t\t\t<div><span class="scan-area-label">Area (sq.m)</span><strong id="scan-area-sqm">—</strong></div>
\t\t\t\t\t\t<div><span class="scan-area-label">GPS Centroid</span><strong id="scan-centroid">—</strong></div>
\t\t\t\t\t</div>
\t\t\t\t</div>

\t\t\t\t<div class="scan-actions" style="margin-top: 20px;">
\t\t\t\t\t<button type="button" class="btn-scan-secondary" onclick="window.app.renderScanStep1()">&larr; Back to Step 1</button>
\t\t\t\t\t<button type="button" class="btn-scan-primary" id="btn-proceed-phase3" onclick="window.app.renderScanStep3()" disabled>
\t\t\t\t\t\tProceed to Step 3: Front, Back, Left, Right Photos &rarr;
\t\t\t\t\t</button>
\t\t\t\t</div>
\t\t\t</div>
\t\t\`;

\t\t// Restore any existing points
\t\tif (this.scanState.plotPoints.length > 0) {
\t\t\tthis.scanState.plotPoints.forEach((p, idx) => {
\t\t\t\tif (p) this.recordScanPoint(idx + 1, p.lat, p.lng);
\t\t\t});
\t\t}
\t}

\tquickCaptureAll6Points() {
\t\tconst baseLat = this.scanState.chosenPlot.lat || 31.61285;
\t\tconst baseLng = this.scanState.chosenPlot.lng || 74.86235;
\t\tconst offsets = [
\t\t\t[0, 0], [0.0003, 0.0001], [0.0005, -0.0002],
\t\t\t[0.0004, -0.0005], [0.0001, -0.0006], [-0.0002, -0.0003]
\t\t];
\t\toffsets.forEach((off, i) => {
\t\t\tthis.recordScanPoint(i + 1, baseLat + off[0], baseLng + off[1]);
\t\t});
\t}

\trenderScanStep3() {
\t\tconst container = document.getElementById('scan-container');
\t\tif (!container) return;
\t\tthis.scanState.step = 3;

\t\tconst sides = [
\t\t\t{ key: 'front', label: 'Front Elevation Photo', desc: 'Front facade & main road entryway' },
\t\t\t{ key: 'back', label: 'Back Elevation Photo', desc: 'Rear plot boundary & exterior wall' },
\t\t\t{ key: 'left', label: 'Left Elevation Photo', desc: 'Left setback & adjacent property line' },
\t\t\t{ key: 'right', label: 'Right Elevation Photo', desc: 'Right boundary & vertical height audit' }
\t\t];

\t\tcontainer.innerHTML = \`
\t\t\t<div class="scan-phase-card">
\t\t\t\t<div class="scan-phase-header">
\t\t\t\t\t<div class="scan-phase-badge phase2">STEP 3 OF 3</div>
\t\t\t\t\t<h2 class="scan-phase-title">Front, Back, Left, Right Photos Scan</h2>
\t\t\t\t\t<p class="scan-phase-desc">Capture the 4 elevation reference photos for <strong>\${this.scanState.chosenPlot.khasra}</strong>. The photos will be sealed with the 6-point cadastral survey:</p>
\t\t\t\t</div>

\t\t\t\t<div class="scan-progress-bar">
\t\t\t\t\t<div class="scan-progress-fill phase2" id="scan-ext-progress" style="width: 0%"></div>
\t\t\t\t</div>
\t\t\t\t<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
\t\t\t\t\t<div class="scan-progress-label" id="scan-ext-progress-label" style="margin: 0;">0 of 4 photos captured</div>
\t\t\t\t\t<button type="button" onclick="window.app.quickCaptureAll4Photos()" style="padding: 4px 10px; font-size: 0.74rem; background: #e0f2fe; color: #0284c7; border: 1px solid #38bdf8; border-radius: 4px; font-weight: 700; cursor: pointer;">
\t\t\t\t\t\tInstant Capture All 4 Photos
\t\t\t\t\t</button>
\t\t\t\t</div>

\t\t\t\t<div class="scan-exterior-grid">
\t\t\t\t\t\${sides.map(s => \`
\t\t\t\t\t\t<div class="scan-side-card" id="scan-side-\${s.key}">
\t\t\t\t\t\t\t<h4>\${s.label}</h4>
\t\t\t\t\t\t\t<div class="scan-side-preview" id="scan-side-preview-\${s.key}">
\t\t\t\t\t\t\t\t<span style="font-size: 1.5rem; opacity: 0.3;">📸</span>
\t\t\t\t\t\t\t\t<p>\${s.desc}</p>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<div class="scan-side-status" id="scan-side-status-\${s.key}">
\t\t\t\t\t\t\t\t<span>Pending Photo</span>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<button type="button" class="btn-scan-capture" id="btn-scan-photo-\${s.key}" onclick="window.app.captureExteriorPhoto('\${s.key}')">
\t\t\t\t\t\t\t\tCapture \${s.label.split(' ')[0]} Photo
\t\t\t\t\t\t\t</button>
\t\t\t\t\t\t</div>
\t\t\t\t\t\`).join('')}
\t\t\t\t</div>

\t\t\t\t<div class="scan-height-card" id="scan-height-card" style="display: none; margin-top: 14px;">
\t\t\t\t\t<h4>Cadastral Digital Twin Verification Package</h4>
\t\t\t\t\t<div class="scan-height-grid">
\t\t\t\t\t\t<div><span>Plot / Khasra</span><strong>\${this.scanState.chosenPlot.khasra}</strong></div>
\t\t\t\t\t\t<div><span>Boundary Coordinates</span><strong>6 Points Sealed</strong></div>
\t\t\t\t\t\t<div><span>Elevation Photos</span><strong>4 Sides Verified (Front, Back, Left, Right)</strong></div>
\t\t\t\t\t\t<div><span>Cadastral Area</span><strong>\${this.scanState.chosenPlot.area_sqyd} sq.yd (\${this.scanState.chosenPlot.area_sqft} sq.ft)</strong></div>
\t\t\t\t\t</div>
\t\t\t\t</div>

\t\t\t\t<div class="scan-actions" style="margin-top: 20px;">
\t\t\t\t\t<button type="button" class="btn-scan-secondary" onclick="window.app.renderScanStep2()">&larr; Back to Step 2</button>
\t\t\t\t\t<button type="button" class="btn-scan-primary" id="btn-complete-scan" onclick="window.app.completeBuildingScan()" disabled>
\t\t\t\t\t\tComplete Scan &amp; Apply to Land Registration &rarr;
\t\t\t\t\t</button>
\t\t\t\t</div>
\t\t\t</div>
\t\t\`;
\t}

\tcaptureExteriorPhoto(side) {
\t\tthis.scanState.exteriorPhotos[side] = true;
\t\tconst statusEl = document.getElementById(\`scan-side-status-\${side}\`);
\t\tconst cardEl = document.getElementById(\`scan-side-\${side}\`);
\t\tconst previewEl = document.getElementById(\`scan-side-preview-\${side}\`);
\t\tconst btnEl = document.getElementById(\`btn-scan-photo-\${side}\`);

\t\tif (statusEl) statusEl.innerHTML = '<span style="color: #16a34a; font-weight: 700;">Verified Captured</span>';
\t\tif (cardEl) cardEl.classList.add('captured');
\t\tif (btnEl) {
\t\t\tbtnEl.textContent = 'Recapture';
\t\t\tbtnEl.style.background = '#f1f5f9';
\t\t\tbtnEl.style.color = '#475569';
\t\t}
\t\tif (previewEl) {
\t\t\tpreviewEl.innerHTML = \`<div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 6px; color: #38bdf8; font-size: 0.78rem; font-weight: 700; padding: 10px; text-align: center;"><span>Verified \${side.toUpperCase()} ELEVATION</span><span style="font-size: 0.68rem; color: #94a3b8; font-weight: 400; margin-top: 4px;">Photo Sealed &bull; GPS Tagged</span></div>\`;
\t\t}

\t\tconst count = Object.values(this.scanState.exteriorPhotos).filter(Boolean).length;
\t\tconst progressEl = document.getElementById('scan-ext-progress');
\t\tconst progressLabel = document.getElementById('scan-ext-progress-label');
\t\tif (progressEl) progressEl.style.width = \`\${(count / 4) * 100}%\`;
\t\tif (progressLabel) progressLabel.textContent = \`\${count} of 4 photos captured\`;

\t\tif (count >= 4) {
\t\t\tconst heightCard = document.getElementById('scan-height-card');
\t\t\tif (heightCard) heightCard.style.display = 'block';
\t\t\tconst completeBtn = document.getElementById('btn-complete-scan');
\t\t\tif (completeBtn) completeBtn.disabled = false;
\t\t}
\t}

\tquickCaptureAll4Photos() {
\t\t['front', 'back', 'left', 'right'].forEach(side => {
\t\t\tthis.captureExteriorPhoto(side);
\t\t});
\t}

\tcompleteBuildingScan() {
\t\tthis.openRegisterModal();
\t\tconst khasraInput = document.getElementById('reg-khasra-input');
\t\tif (khasraInput && this.scanState.chosenPlot) {
\t\t\tkhasraInput.value = \`\${this.scanState.chosenPlot.khasra}, \${this.scanState.chosenPlot.locality}\`;
\t\t}

\t\tconst badge = document.getElementById('reg-status-badge');
\t\tif (badge) {
\t\t\tbadge.textContent = 'Verified: 6 Points + 4 Photos Completed';
\t\t\tbadge.style.background = '#dcfce7';
\t\t\tbadge.style.color = '#15803d';
\t\t}

\t\tconst vertexCount = document.getElementById('reg-vertex-count');
\t\tif (vertexCount) {
\t\t\tvertexCount.textContent = '6 points (Front, Back, Left, Right Photos Attached)';
\t\t}

\t\tconst areaDisplay = document.getElementById('reg-area-display');
\t\tif (areaDisplay && this.scanState.chosenPlot) {
\t\t\tareaDisplay.innerHTML = \`<strong style="color: #15803d;">\${this.scanState.chosenPlot.area_sqyd} sq.yd &bull; \${this.scanState.chosenPlot.area_sqft} sq.ft</strong>\`;
\t\t}

\t\tconst coordsInput = document.getElementById('reg-coordinates-json');
\t\tconst areaInput = document.getElementById('reg-area-sqft');
\t\tif (coordsInput && this.scanState.plotPoints.length >= 6) {
\t\t\tcoordsInput.value = JSON.stringify(this.scanState.plotPoints);
\t\t}
\t\tif (areaInput && this.scanState.chosenPlot) {
\t\t\tareaInput.value = this.scanState.chosenPlot.area_sqft;
\t\t}

\t\tif (typeof this.recalculateChallanFee === 'function') {
\t\t\tthis.recalculateChallanFee();
\t\t}
\t}`;

appJs = appJs.replace(scanFlowRegex, newScanWorkflowCode);

// Also ensure Proceed to Step 3 button enables when all 6 points are captured
appJs = appJs.replace(
  `const proceedBtn = document.getElementById('btn-proceed-phase2');`,
  `const proceedBtn = document.getElementById('btn-proceed-phase3') || document.getElementById('btn-proceed-phase2');`
);

fs.writeFileSync('src/app.js', appJs, 'utf8');
console.log('✓ src/app.js updated successfully');
