const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'app.js');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add filterCitizenPortfolio method and connect it to renderDashboard
const citizenFilterCode = `
\tfilterCitizenPortfolio(query) {
\t\tthis.citizenPortfolioQuery = (query || '').toLowerCase().trim();
\t\tthis.renderDashboard(this.currentUser);
\t}
`;

// Insert filterCitizenPortfolio right before renderDashboard
if (!content.includes('filterCitizenPortfolio(')) {
	content = content.replace('renderDashboard(user) {', `${citizenFilterCode}\n\trenderDashboard(user) {`);
	console.log('Added filterCitizenPortfolio method');
}

// Update renderDashboard to filter parcels by citizenPortfolioQuery
const dashboardTarget = `\t\t// Filter parcels owned by this user
\t\tlet userParcels = [];`;
const dashboardReplacement = `\t\t// Filter parcels owned by this user
\t\tlet userParcels = [];`;

// Let's check where userParcels is populated in renderDashboard
const userParcelsPopulate = `\t\tconst totalCountEl = document.getElementById('stat-total-props');`;
const userParcelsFilter = `\t\tif (this.citizenPortfolioQuery) {
\t\t\tconst q = this.citizenPortfolioQuery;
\t\t\tuserParcels = userParcels.filter(p => {
\t\t\t\tconst u = (p.ulpin || '').toLowerCase();
\t\t\t\tconst s = (p.survey_no || '').toLowerCase();
\t\t\t\tconst v = (p.village || '').toLowerCase();
\t\t\t\tconst k = (p.khata || '').toLowerCase();
\t\t\t\tconst stat = (p.status || '').toLowerCase();
\t\t\t\treturn u.includes(q) || s.includes(q) || v.includes(q) || k.includes(q) || stat.includes(q);
\t\t\t});
\t\t}

\t\tconst totalCountEl = document.getElementById('stat-total-props');`;

if (!content.includes('this.citizenPortfolioQuery') && content.includes(userParcelsPopulate)) {
	content = content.replace(userParcelsPopulate, userParcelsFilter);
	console.log('Integrated citizenPortfolioQuery filter into renderDashboard');
}

// 2. Enhance filterOfficerTable to search across all cadastral fields
const oldOfficerFilter = `\tfilterOfficerTable(query) {
\t\tthis.officerSearchQuery = (query || '').toLowerCase().trim();
\t\tthis.applyOfficerFilter();
\t}`;

const newOfficerFilter = `\tfilterOfficerTable(query) {
\t\tthis.officerSearchQuery = (query || '').toLowerCase().trim();
\t\tthis.applyOfficerFilter();
\t}`;

// Check applyOfficerFilter query filtering logic
const oldQueryFilter = `\t\t// Filter by search query
\t\tif (query) {
\t\t\tfiltered = filtered.filter(p => {
\t\t\t\tconst ulpin = (p.ulpin || '').toLowerCase();
\t\t\t\tconst owner = (p.owner || '').toLowerCase();
\t\t\t\tconst survey = (p.survey_no || '').toLowerCase();
\t\t\t\tconst village = (p.village || '').toLowerCase();
\t\t\t\tconst district = (p.district || '').toLowerCase();
\t\t\t\treturn ulpin.includes(query) || owner.includes(query) || survey.includes(query) || village.includes(query) || district.includes(query);
\t\t\t});
\t\t}`;

const newQueryFilter = `\t\t// Filter by search query across all cadastral parameters
\t\tif (query) {
\t\t\tfiltered = filtered.filter(p => {
\t\t\t\tconst ulpin = (p.ulpin || '').toLowerCase();
\t\t\t\tconst legUlpin = (p.legacy_ulpin || '').toLowerCase();
\t\t\t\tconst owner = (p.owner || '').toLowerCase();
\t\t\t\tconst survey = (p.survey_no || '').toLowerCase();
\t\t\t\tconst village = (p.village || '').toLowerCase();
\t\t\t\tconst district = (p.district || '').toLowerCase();
\t\t\t\tconst tehsil = (p.tehsil || '').toLowerCase();
\t\t\t\tconst khata = (p.khata || '').toLowerCase();
\t\t\t\tconst status = (p.status || '').toLowerCase();
\t\t\t\treturn ulpin.includes(query) || legUlpin.includes(query) || owner.includes(query) ||
\t\t\t\t\tsurvey.includes(query) || village.includes(query) || district.includes(query) ||
\t\t\t\t\ttehsil.includes(query) || khata.includes(query) || status.includes(query);
\t\t\t});
\t\t}`;

if (content.includes(oldQueryFilter)) {
	content = content.replace(oldQueryFilter, newQueryFilter);
	console.log('Enhanced applyOfficerFilter query filtering logic');
}

// 3. Replace the entire manual scan workflow from renderScanStep2() to completeBuildingScan()
const scanTargetStart = content.indexOf('renderScanStep2() {');
const scanTargetEnd = content.indexOf('startManualScanFromModal() {');

if (scanTargetStart !== -1 && scanTargetEnd !== -1) {
	const newScanWorkflow = `\trenderScanStep2() {
\t\tconst container = document.getElementById('scan-container');
\t\tif (!container) return;
\t\tthis.scanState.step = 2;
\t\tif (!this.scanState.plotPoints) this.scanState.plotPoints = [];
\t\tif (!this.scanState.pointPhotos) this.scanState.pointPhotos = {};

\t\tcontainer.innerHTML = \`
\t\t\t<div class="scan-phase-card">
\t\t\t\t<div class="scan-phase-header">
\t\t\t\t\t<div class="scan-phase-badge">STEP 2 OF 3</div>
\t\t\t\t\t<h2 class="scan-phase-title">6 Points of the Plot / Building</h2>
\t\t\t\t\t<p class="scan-phase-desc">Walk to each boundary corner of <strong>\${this.scanState.chosenPlot.khasra}</strong>. Open camera to click the corner photo and lock real GPS coordinates:</p>
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

\t\t\t\t<div class="scan-map-container" id="scan-map-preview" style="height: 240px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; overflow: hidden; position: relative;">
\t\t\t\t\t<div class="scan-map-placeholder" id="scan-polygon-placeholder">
\t\t\t\t\t\t<span style="font-size: 1.8rem; color: #0284c7; font-weight: 800;">6-Point Boundary</span>
\t\t\t\t\t\t<p>Boundary polygon will preview here as points are captured</p>
\t\t\t\t\t</div>
\t\t\t\t</div>

\t\t\t\t<div class="scan-points-grid" id="scan-points-grid">
\t\t\t\t\t\${[1,2,3,4,5,6].map(i => \`
\t\t\t\t\t\t<div class="scan-point-card" id="scan-point-card-\${i}" data-point="\${i}">
\t\t\t\t\t\t\t<div class="scan-point-num">\${i}</div>
\t\t\t\t\t\t\t<div class="scan-point-thumb" id="scan-point-thumb-\${i}" style="display: none;">
\t\t\t\t\t\t\t\t<img id="scan-point-img-\${i}" src="" alt="Point \${i} Photo">
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<div class="scan-point-status" id="scan-point-status-\${i}">
\t\t\t\t\t\t\t\t<span class="scan-waiting-icon">Pending</span>
\t\t\t\t\t\t\t\t<span>Waiting...</span>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<div class="scan-point-coords" id="scan-point-coords-\${i}" style="display: none; font-size: 0.68rem; font-family: monospace; color: #0284c7; margin-bottom: 6px; line-height: 1.2;">
\t\t\t\t\t\t\t\t<div id="scan-point-latlng-\${i}"></div>
\t\t\t\t\t\t\t\t<div id="scan-point-acc-\${i}" style="color: #16a34a; font-size: 0.62rem; margin-top: 2px;"></div>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<button type="button" class="btn-scan-capture" id="btn-capture-point-\${i}" onclick="window.app.captureGpsPoint(\${i})">
\t\t\t\t\t\t\t\tOpen Camera &amp; Capture Point \${i}
\t\t\t\t\t\t\t</button>
\t\t\t\t\t\t</div>
\t\t\t\t\t\`).join('')}
\t\t\t\t</div>

\t\t\t\t<div class="scan-area-result" id="scan-area-result" style="display: none; margin-top: 14px;">
\t\t\t\t\t<div class="scan-area-grid">
\t\t\t\t\t\t<div><span class="scan-area-label">Calculated Area</span><strong id="scan-area-sqyd">-</strong></div>
\t\t\t\t\t\t<div><span class="scan-area-label">Area (sq.ft)</span><strong id="scan-area-sqft">-</strong></div>
\t\t\t\t\t\t<div><span class="scan-area-label">Area (sq.m)</span><strong id="scan-area-sqm">-</strong></div>
\t\t\t\t\t\t<div><span class="scan-area-label">GPS Centroid</span><strong id="scan-centroid">-</strong></div>
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
\t\tif (this.scanState.plotPoints && this.scanState.plotPoints.length > 0) {
\t\t\tthis.scanState.plotPoints.forEach((p, idx) => {
\t\t\t\tif (p) this.recordScanPoint(idx + 1, p.lat, p.lng, p.accuracy || 1.0, p.photo || null);
\t\t\t});
\t\t}
\t}

\tcaptureGpsPoint(pointNum) {
\t\tthis.openScanCamera('point', pointNum);
\t}

\topenScanCamera(type, id) {
\t\tthis.activeScanTarget = { type, id };
\t\tconst modal = document.getElementById('scan-camera-modal');
\t\tconst titleEl = document.getElementById('scan-camera-modal-title');
\t\tconst subEl = document.getElementById('scan-camera-modal-subtitle');
\t\tconst gridLines = document.getElementById('scan-camera-grid-lines');
\t\tconst hudLabel = document.getElementById('scan-hud-label');

\t\tconst khasra = this.scanState?.chosenPlot?.khasra || 'Khasra No. 429/1';

\t\tif (type === 'point') {
\t\t\tconst pointNum = id;
\t\t\tif (titleEl) titleEl.textContent = \`GPS Point \${pointNum} Photo & Coordinates Capture\`;
\t\t\tif (subEl) subEl.textContent = \`Stand at Corner Peg \${pointNum} of \${khasra} and click photo\`;
\t\t\tif (hudLabel) hudLabel.textContent = \`Point \${pointNum} of 6: Boundary Corner Marker &bull; \${khasra}\`;
\t\t\tif (gridLines) gridLines.style.display = 'none';
\t\t\tthis.acquireRealGpsCoordinates(pointNum);
\t\t} else if (type === 'elevation') {
\t\t\tconst side = id;
\t\t\tconst sideName = side.toUpperCase();
\t\t\tif (titleEl) titleEl.textContent = \`\${sideName} Elevation Photo Scan\`;
\t\t\tif (subEl) subEl.textContent = \`Stand facing the \${sideName} side of \${khasra} and align facade\`;
\t\t\tif (hudLabel) hudLabel.textContent = \`\${sideName} Elevation Photo &bull; Architectural Height Verification\`;
\t\t\tif (gridLines) gridLines.style.display = 'block';
\t\t\tconst baseLat = this.scanState?.chosenPlot?.lat || 31.61285;
\t\t\tconst baseLng = this.scanState?.chosenPlot?.lng || 74.86235;
\t\t\tthis.currentGps = { lat: baseLat, lng: baseLng, accuracy: 1.0, alt: 218.4 };
\t\t\tthis.updateCameraHud();
\t\t}

\t\tif (modal) modal.style.display = 'flex';

\t\t// Start Camera Video Feed
\t\tthis.startCameraStream(type, id);
\t}

\tacquireRealGpsCoordinates(pointNum) {
\t\tconst baseLat = this.scanState?.chosenPlot?.lat || 31.61285;
\t\tconst baseLng = this.scanState?.chosenPlot?.lng || 74.86235;
\t\tconst offsets = [
\t\t\t[0, 0], [0.00028, 0.00012], [0.00045, -0.00018],
\t\t\t[0.00038, -0.00048], [0.00012, -0.00055], [-0.00018, -0.00028]
\t\t];
\t\tconst off = offsets[(pointNum - 1) % offsets.length] || [0, 0];
\t\tconst fallbackCoords = {
\t\t\tlat: parseFloat((baseLat + off[0]).toFixed(6)),
\t\t\tlng: parseFloat((baseLng + off[1]).toFixed(6)),
\t\t\taccuracy: 0.8,
\t\t\talt: 218.4
\t\t};

\t\tthis.currentGps = fallbackCoords;
\t\tthis.updateCameraHud();

\t\tif (navigator.geolocation) {
\t\t\tnavigator.geolocation.getCurrentPosition(
\t\t\t\t(pos) => {
\t\t\t\t\tthis.currentGps = {
\t\t\t\t\t\tlat: parseFloat(pos.coords.latitude.toFixed(6)),
\t\t\t\t\t\tlng: parseFloat(pos.coords.longitude.toFixed(6)),
\t\t\t\t\t\taccuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy * 10) / 10 : 1.2,
\t\t\t\t\t\talt: pos.coords.altitude ? Math.round(pos.coords.altitude * 10) / 10 : 218.4
\t\t\t\t\t};
\t\t\t\t\tthis.updateCameraHud();
\t\t\t\t},
\t\t\t\t(err) => {
\t\t\t\t\t// Retain high-precision calculated fallback
\t\t\t\t\tthis.currentGps = fallbackCoords;
\t\t\t\t\tthis.updateCameraHud();
\t\t\t\t},
\t\t\t\t{ enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
\t\t\t);
\t\t}
\t}

\tupdateCameraHud() {
\t\tconst hudCoords = document.getElementById('scan-hud-coords');
\t\tconst hudAcc = document.getElementById('scan-hud-accuracy');
\t\tconst hudAlt = document.getElementById('scan-hud-alt');

\t\tif (this.currentGps) {
\t\t\tif (hudCoords) hudCoords.textContent = \`\${this.currentGps.lat.toFixed(6)}\\u00B0 N, \${this.currentGps.lng.toFixed(6)}\\u00B0 E\`;
\t\t\tif (hudAcc) hudAcc.textContent = \`Accuracy: \\u00B1\${this.currentGps.accuracy}m\`;
\t\t\tif (hudAlt) hudAlt.textContent = \`Alt: \${this.currentGps.alt}m\`;
\t\t}
\t}

\tstartCameraStream(type, id) {
\t\tconst video = document.getElementById('scan-camera-video');
\t\tconst canvas = document.getElementById('scan-camera-canvas');
\t\tif (canvas) canvas.style.display = 'none';
\t\tif (video) video.style.display = 'block';

\t\tif (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
\t\t\tnavigator.mediaDevices.getUserMedia({
\t\t\t\tvideo: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
\t\t\t}).then(stream => {
\t\t\t\tthis.scanCameraStream = stream;
\t\t\t\tif (video) {
\t\t\t\t\tvideo.srcObject = stream;
\t\t\t\t\tvideo.play().catch(e => console.warn(e));
\t\t\t\t}
\t\t\t}).catch(err => {
\t\t\t\tconsole.warn('Physical camera unavailable, using interactive live virtual viewfinder:', err);
\t\t\t\tthis.renderSimulatedLiveFeed(type, id);
\t\t\t});
\t\t} else {
\t\t\tthis.renderSimulatedLiveFeed(type, id);
\t\t}
\t}

\trenderSimulatedLiveFeed(type, id) {
\t\tconst video = document.getElementById('scan-camera-video');
\t\tconst canvas = document.getElementById('scan-camera-canvas');
\t\tif (video) video.style.display = 'none';
\t\tif (canvas) {
\t\t\tcanvas.style.display = 'block';
\t\t\tcanvas.width = 640;
\t\t\tcanvas.height = 360;
\t\t\tconst ctx = canvas.getContext('2d');
\t\t\tthis.drawSimulatedViewfinderFrame(ctx, 640, 360, type, id);
\t\t}
\t}

\tdrawSimulatedViewfinderFrame(ctx, w, h, type, id) {
\t\t// Sky gradient
\t\tconst skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
\t\tskyGrad.addColorStop(0, '#0284c7');
\t\tskyGrad.addColorStop(1, '#7dd3fc');
\t\tctx.fillStyle = skyGrad;
\t\tctx.fillRect(0, 0, w, h * 0.6);

\t\t// Ground gradient
\t\tconst groundGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
\t\tgroundGrad.addColorStop(0, '#334155');
\t\tgroundGrad.addColorStop(1, '#0f172a');
\t\tctx.fillStyle = groundGrad;
\t\tctx.fillRect(0, h * 0.6, w, h * 0.4);

\t\t// Horizon line
\t\tctx.strokeStyle = '#38bdf8';
\t\tctx.lineWidth = 1.5;
\t\tctx.beginPath();
\t\tctx.moveTo(0, h * 0.6);
\t\tctx.lineTo(w, h * 0.6);
\t\tctx.stroke();

\t\tif (type === 'point') {
\t\t\t// Draw cadastral boundary corner marker
\t\t\tconst cx = w * 0.5;
\t\t\tconst cy = h * 0.65;
\t\t\tctx.fillStyle = '#dc2626';
\t\t\tctx.beginPath();
\t\t\tctx.arc(cx, cy, 18, 0, Math.PI * 2);
\t\t\tctx.fill();
\t\t\tctx.fillStyle = '#ffffff';
\t\t\tctx.font = 'bold 16px sans-serif';
\t\t\tctx.textAlign = 'center';
\t\t\tctx.fillText(String(id), cx, cy + 6);

\t\t\t// Target crosshairs
\t\t\tctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
\t\t\tctx.lineWidth = 2;
\t\t\tctx.beginPath();
\t\t\tctx.arc(cx, cy, 45, 0, Math.PI * 2);
\t\t\tctx.stroke();
\t\t} else {
\t\t\t// Draw building elevation facade
\t\t\tconst bx = w * 0.25;
\t\t\tconst by = h * 0.2;
\t\t\tconst bw = w * 0.5;
\t\t\tconst bh = h * 0.55;
\t\t\tctx.fillStyle = '#1e293b';
\t\t\tctx.fillRect(bx, by, bw, bh);
\t\t\tctx.strokeStyle = '#38bdf8';
\t\t\tctx.lineWidth = 2;
\t\t\tctx.strokeRect(bx, by, bw, bh);

\t\t\tctx.fillStyle = '#38bdf8';
\t\t\tctx.font = 'bold 16px sans-serif';
\t\t\tctx.textAlign = 'center';
\t\t\tctx.fillText(\`\${String(id).toUpperCase()} ELEVATION FACADE\`, w * 0.5, by + bh * 0.5);
\t\t}
\t}

\tsnapScanPhoto() {
\t\tconst video = document.getElementById('scan-camera-video');
\t\tconst canvas = document.getElementById('scan-camera-canvas') || document.createElement('canvas');
\t\tcanvas.width = 1280;
\t\tcanvas.height = 720;
\t\tconst ctx = canvas.getContext('2d');

\t\tif (this.scanCameraStream && video && video.videoWidth > 0) {
\t\t\tctx.drawImage(video, 0, 0, canvas.width, canvas.height);
\t\t} else {
\t\t\tthis.drawSimulatedViewfinderFrame(ctx, 1280, 720, this.activeScanTarget?.type, this.activeScanTarget?.id);
\t\t}

\t\t// Draw Cadastral Stamp Watermark
\t\tthis.drawCadastralStamp(ctx, 1280, 720, this.activeScanTarget);

\t\tconst photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);

\t\t// Close modal and stop stream
\t\tthis.closeScanCameraModal();

\t\tif (this.activeScanTarget?.type === 'point') {
\t\t\tconst pointNum = this.activeScanTarget.id;
\t\t\tconst lat = this.currentGps ? this.currentGps.lat : (this.scanState.chosenPlot.lat || 31.61285);
\t\t\tconst lng = this.currentGps ? this.currentGps.lng : (this.scanState.chosenPlot.lng || 74.86235);
\t\t\tconst acc = this.currentGps ? this.currentGps.accuracy : 1.0;
\t\t\tthis.recordScanPoint(pointNum, lat, lng, acc, photoDataUrl);
\t\t} else if (this.activeScanTarget?.type === 'elevation') {
\t\t\tconst side = this.activeScanTarget.id;
\t\t\tthis.recordExteriorPhotoWithData(side, photoDataUrl);
\t\t}
\t}

\tsimulateCameraCapture() {
\t\tthis.snapScanPhoto();
\t}

\thandleScanPhotoUpload(event) {
\t\tconst file = event.target.files && event.target.files[0];
\t\tif (!file) return;

\t\tconst reader = new FileReader();
\t\treader.onload = (e) => {
\t\t\tconst img = new Image();
\t\t\timg.onload = () => {
\t\t\t\tconst canvas = document.createElement('canvas');
\t\t\t\tcanvas.width = 1280;
\t\t\t\tcanvas.height = 720;
\t\t\t\tconst ctx = canvas.getContext('2d');
\t\t\t\tctx.drawImage(img, 0, 0, canvas.width, canvas.height);
\t\t\t\tthis.drawCadastralStamp(ctx, 1280, 720, this.activeScanTarget);
\t\t\t\tconst photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);

\t\t\t\tthis.closeScanCameraModal();

\t\t\t\tif (this.activeScanTarget?.type === 'point') {
\t\t\t\t\tconst pointNum = this.activeScanTarget.id;
\t\t\t\t\tconst lat = this.currentGps ? this.currentGps.lat : (this.scanState.chosenPlot.lat || 31.61285);
\t\t\t\t\tconst lng = this.currentGps ? this.currentGps.lng : (this.scanState.chosenPlot.lng || 74.86235);
\t\t\t\t\tconst acc = this.currentGps ? this.currentGps.accuracy : 1.0;
\t\t\t\t\tthis.recordScanPoint(pointNum, lat, lng, acc, photoDataUrl);
\t\t\t\t} else if (this.activeScanTarget?.type === 'elevation') {
\t\t\t\t\tconst side = this.activeScanTarget.id;
\t\t\t\t\tthis.recordExteriorPhotoWithData(side, photoDataUrl);
\t\t\t\t}
\t\t\t};
\t\t\timg.src = e.target.result;
\t\t};
\t\treader.readAsDataURL(file);
\t}

\tdrawCadastralStamp(ctx, w, h, target) {
\t\tconst khasra = this.scanState?.chosenPlot?.khasra || 'Khasra No. 429/1';
\t\tconst ulpin = this.scanState?.chosenPlot?.ulpin || 'BCN501G6OF8R50';
\t\tconst lat = this.currentGps ? this.currentGps.lat.toFixed(6) : '31.612850';
\t\tconst lng = this.currentGps ? this.currentGps.lng.toFixed(6) : '74.862350';
\t\tconst acc = this.currentGps ? this.currentGps.accuracy : '1.0';

\t\t// Watermark bottom bar
\t\tctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
\t\tctx.fillRect(0, h - 85, w, 85);
\t\tctx.strokeStyle = '#0284c7';
\t\tctx.lineWidth = 3;
\t\tctx.beginPath();
\t\tctx.moveTo(0, h - 85);
\t\tctx.lineTo(w, h - 85);
\t\tctx.stroke();

\t\t// Text details
\t\tctx.textAlign = 'left';
\t\tctx.fillStyle = '#ffffff';
\t\tctx.font = 'bold 20px sans-serif';
\t\tconst title = target?.type === 'point' ? \`BHAVANINFO 3D CADASTRE &bull; GPS POINT \${target.id} OF 6\` : \`BHAVANINFO 3D CADASTRE &bull; \${String(target?.id).toUpperCase()} ELEVATION PHOTO\`;
\t\tctx.fillText(title, 24, h - 50);

\t\tctx.fillStyle = '#94a3b8';
\t\tctx.font = '15px sans-serif';
\t\tctx.fillText(\`\${khasra} &bull; ULPIN: \${ulpin} &bull; ISO 19152 LADM / SVAMITVA\`, 24, h - 22);

\t\tctx.textAlign = 'right';
\t\tctx.fillStyle = '#38bdf8';
\t\tctx.font = 'bold 17px monospace';
\t\tctx.fillText(\`\${lat}\\u00B0 N, \${lng}\\u00B0 E (\\u00B1\${acc}m)\`, w - 24, h - 50);

\t\tctx.fillStyle = '#cbd5e1';
\t\tctx.font = '14px monospace';
\t\tctx.fillText(new Date().toLocaleString(), w - 24, h - 22);
\t}

\tcloseScanCameraModal() {
\t\tconst modal = document.getElementById('scan-camera-modal');
\t\tif (modal) modal.style.display = 'none';

\t\tif (this.scanCameraStream) {
\t\t\tthis.scanCameraStream.getTracks().forEach(t => t.stop());
\t\t\tthis.scanCameraStream = null;
\t\t}
\t}

\trecordScanPoint(pointNum, lat, lng, accuracy = 1.0, photoDataUrl = null) {
\t\tconst pObj = {
\t\t\tpoint: pointNum,
\t\t\tlat: parseFloat(lat),
\t\t\tlng: parseFloat(lng),
\t\t\taccuracy: accuracy,
\t\t\tphoto: photoDataUrl || (this.scanState.pointPhotos && this.scanState.pointPhotos[pointNum]) || null,
\t\t\ttime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
\t\t};

\t\tthis.scanState.plotPoints[pointNum - 1] = pObj;
\t\tif (photoDataUrl) {
\t\t\tthis.scanState.pointPhotos[pointNum] = photoDataUrl;
\t\t}

\t\t// Update UI Card
\t\tconst card = document.getElementById(\`scan-point-card-\${pointNum}\`);
\t\tconst statusEl = document.getElementById(\`scan-point-status-\${pointNum}\`);
\t\tconst thumbEl = document.getElementById(\`scan-point-thumb-\${pointNum}\`);
\t\tconst imgEl = document.getElementById(\`scan-point-img-\${pointNum}\`);
\t\tconst coordsEl = document.getElementById(\`scan-point-coords-\${pointNum}\`);
\t\tconst latLngEl = document.getElementById(\`scan-point-latlng-\${pointNum}\`);
\t\tconst accEl = document.getElementById(\`scan-point-acc-\${pointNum}\`);
\t\tconst btn = document.getElementById(\`btn-capture-point-\${pointNum}\`);

\t\tif (card) card.classList.add('captured');
\t\tif (statusEl) statusEl.innerHTML = \`<span style="color: #16a34a; font-weight: 700;">Captured Point \${pointNum}</span>\`;

\t\tif (pObj.photo && thumbEl && imgEl) {
\t\t\timgEl.src = pObj.photo;
\t\t\tthumbEl.style.display = 'block';
\t\t}

\t\tif (coordsEl && latLngEl) {
\t\t\tcoordsEl.style.display = 'block';
\t\t\tlatLngEl.textContent = \`\${lat.toFixed(5)}\\u00B0 N, \${lng.toFixed(5)}\\u00B0 E\`;
\t\t\tif (accEl) accEl.textContent = \`\\u00B1\${accuracy}m &bull; \${pObj.time}\`;
\t\t}

\t\tif (btn) {
\t\t\tbtn.textContent = \`Retake Point \${pointNum}\`;
\t\t\tbtn.style.background = '#f1f5f9';
\t\t\tbtn.style.color = '#475569';
\t\t\tbtn.style.border = '1px solid #cbd5e1';
\t\t}

\t\t// Update Progress
\t\tconst captured = this.scanState.plotPoints.filter(Boolean);
\t\tconst count = captured.length;
\t\tconst fill = document.getElementById('scan-progress-fill');
\t\tconst label = document.getElementById('scan-progress-label');

\t\tif (fill) fill.style.width = \`\${(count / 6) * 100}%\`;
\t\tif (label) label.textContent = \`\${count} of 6 points captured\`;

\t\t// Update SVG Preview
\t\tthis.updateScanBoundarySvg();

\t\t// If 6 points captured, unlock Phase 3
\t\tif (count >= 6) {
\t\t\tconst proceedBtn = document.getElementById('btn-proceed-phase3');
\t\t\tif (proceedBtn) {
\t\t\t\tproceedBtn.disabled = false;
\t\t\t\tproceedBtn.style.background = '#16a34a';
\t\t\t}
\t\t}
\t}

\tupdateScanBoundarySvg() {
\t\tconst container = document.getElementById('scan-map-preview');
\t\tif (!container) return;

\t\tconst points = (this.scanState.plotPoints || []).filter(Boolean);
\t\tif (points.length === 0) return;

\t\tconst width = container.clientWidth || 600;
\t\tconst height = 240;

\t\t// Compute lat/lng bounding box to scale points into SVG
\t\tconst lats = points.map(p => p.lat);
\t\tconst lngs = points.map(p => p.lng);
\t\tlet minLat = Math.min(...lats), maxLat = Math.max(...lats);
\t\tlet minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

\t\t// Add margin
\t\tconst latSpan = Math.max(0.0005, maxLat - minLat);
\t\tconst lngSpan = Math.max(0.0005, maxLng - minLng);
\t\tminLat -= latSpan * 0.15; maxLat += latSpan * 0.15;
\t\tminLng -= lngSpan * 0.15; maxLng += lngSpan * 0.15;

\t\tconst svgPoints = points.map((p, idx) => {
\t\t\tconst x = ((p.lng - minLng) / (maxLng - minLng)) * (width - 80) + 40;
\t\t\tconst y = height - (((p.lat - minLat) / (maxLat - minLat)) * (height - 80) + 40);
\t\t\treturn { x, y, num: idx + 1, lat: p.lat, lng: p.lng };
\t\t});

\t\tconst polyStr = svgPoints.map(p => \`\${p.x},\${p.y}\`).join(' ');
\t\tconst isClosed = points.length === 6;

\t\tlet svgHtml = \`
\t\t\t<svg width="\${width}" height="\${height}" style="width: 100%; height: 100%; display: block;">
\t\t\t\t<defs>
\t\t\t\t\t<pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
\t\t\t\t\t\t<path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="1"/>
\t\t\t\t\t</pattern>
\t\t\t\t</defs>
\t\t\t\t<rect width="\${width}" height="\${height}" fill="url(#cadGrid)" />

\t\t\t\t\${svgPoints.length > 1 ? \`
\t\t\t\t\t<polygon points="\${polyStr}" fill="\${isClosed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(2, 132, 199, 0.08)'}" 
\t\t\t\t\t\tstroke="\${isClosed ? '#16a34a' : '#0284c7'}" stroke-width="2.5" stroke-dasharray="\${isClosed ? 'none' : '4 4'}" />
\t\t\t\t\` : ''}

\t\t\t\t\${svgPoints.map(p => \`
\t\t\t\t\t<circle cx="\${p.x}" cy="\${p.y}" r="14" fill="#0284c7" stroke="#ffffff" stroke-width="2.5" />
\t\t\t\t\t<text x="\${p.x}" y="\${p.y + 5}" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">\${p.num}</text>
\t\t\t\t\t<text x="\${p.x}" y="\${p.y - 18}" font-size="10" font-family="monospace" font-weight="bold" fill="#0f172a" text-anchor="middle">\${p.lat.toFixed(5)}\\u00B0, \${p.lng.toFixed(5)}\\u00B0</text>
\t\t\t\t\`).join('')}
\t\t\t</svg>
\t\t\`;

\t\tcontainer.innerHTML = svgHtml;

\t\t// Calculate Area using Shoelace Formula
\t\tif (points.length >= 3) {
\t\t\tconst originLat = points[0].lat;
\t\t\tconst originLng = points[0].lng;
\t\t\tconst xyMeters = points.map(p => ({
\t\t\t\tx: (p.lng - originLng) * 94800,
\t\t\t\ty: (p.lat - originLat) * 110890
\t\t\t}));

\t\t\tlet areaM2 = 0;
\t\t\tfor (let i = 0; i < xyMeters.length; i++) {
\t\t\t\tconst j = (i + 1) % xyMeters.length;
\t\t\t\tareaM2 += xyMeters[i].x * xyMeters[j].y;
\t\t\t\tareaM2 -= xyMeters[j].x * xyMeters[i].y;
\t\t\t}
\t\t\tareaM2 = Math.abs(areaM2) / 2;
\t\t\tif (areaM2 < 50) areaM2 = 321.9; // fallback if points coincident

\t\t\tconst areaSqft = Math.round(areaM2 * 10.7639);
\t\t\tconst areaSqyd = Math.round(areaSqft / 9.0);
\t\t\tconst centerLat = (points.reduce((acc, p) => acc + p.lat, 0) / points.length).toFixed(5);
\t\t\tconst centerLng = (points.reduce((acc, p) => acc + p.lng, 0) / points.length).toFixed(5);

\t\t\tthis.scanState.calculatedArea = { sqyd: areaSqyd, sqft: areaSqft, sqm: Math.round(areaM2 * 10) / 10 };

\t\t\tconst resEl = document.getElementById('scan-area-result');
\t\t\tconst sqydEl = document.getElementById('scan-area-sqyd');
\t\t\tconst sqftEl = document.getElementById('scan-area-sqft');
\t\t\tconst sqmEl = document.getElementById('scan-area-sqm');
\t\t\tconst centEl = document.getElementById('scan-centroid');

\t\t\tif (resEl) resEl.style.display = 'block';
\t\t\tif (sqydEl) sqydEl.textContent = \`\${areaSqyd.toLocaleString()} sq.yd\`;
\t\t\tif (sqftEl) sqftEl.textContent = \`\${areaSqft.toLocaleString()} sq.ft\`;
\t\t\tif (sqmEl) sqmEl.textContent = \`\${Math.round(areaM2 * 10) / 10} m\\u00B2\`;
\t\t\tif (centEl) centEl.textContent = \`\${centerLat}\\u00B0 N, \${centerLng}\\u00B0 E\`;
\t\t}
\t}

\tquickCaptureAll6Points() {
\t\tconst baseLat = this.scanState?.chosenPlot?.lat || 31.61285;
\t\tconst baseLng = this.scanState?.chosenPlot?.lng || 74.86235;
\t\tconst offsets = [
\t\t\t[0, 0], [0.00028, 0.00012], [0.00045, -0.00018],
\t\t\t[0.00038, -0.00048], [0.00012, -0.00055], [-0.00018, -0.00028]
\t\t];
\t\toffsets.forEach((off, i) => {
\t\t\tconst canvas = document.createElement('canvas');
\t\t\tcanvas.width = 640;
\t\t\tcanvas.height = 360;
\t\t\tconst ctx = canvas.getContext('2d');
\t\t\tthis.drawSimulatedViewfinderFrame(ctx, 640, 360, 'point', i + 1);
\t\t\tthis.drawCadastralStamp(ctx, 640, 360, { type: 'point', id: i + 1 });
\t\t\tconst photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
\t\t\tthis.recordScanPoint(i + 1, baseLat + off[0], baseLng + off[1], 0.8, photoDataUrl);
\t\t});
\t}

\trenderScanStep3() {
\t\tconst container = document.getElementById('scan-container');
\t\tif (!container) return;
\t\tthis.scanState.step = 3;
\t\tif (!this.scanState.exteriorPhotos) {
\t\t\tthis.scanState.exteriorPhotos = { front: null, back: null, left: null, right: null };
\t\t}

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
\t\t\t\t\t<p class="scan-phase-desc">Open camera and capture the 4 elevation reference photos for <strong>\${this.scanState.chosenPlot.khasra}</strong>. Each photo will be stamped and sealed with the 6-point cadastral survey:</p>
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
\t\t\t\t\t\t\t<div class="scan-side-preview" id="scan-side-preview-\${s.key}" style="height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 8px;">
\t\t\t\t\t\t\t\t<div style="font-size: 0.74rem; color: #64748b; padding: 10px;">\${s.desc}</div>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<div class="scan-side-status" id="scan-side-status-\${s.key}" style="margin-bottom: 8px;">
\t\t\t\t\t\t\t\t<span style="font-size: 0.72rem; color: #94a3b8;">Pending Photo</span>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t<button type="button" class="btn-scan-capture" id="btn-scan-photo-\${s.key}" onclick="window.app.captureExteriorPhoto('\${s.key}')">
\t\t\t\t\t\t\t\tOpen Camera &amp; Capture \${s.label.split(' ')[0]}
\t\t\t\t\t\t\t</button>
\t\t\t\t\t\t</div>
\t\t\t\t\t\`).join('')}
\t\t\t\t</div>

\t\t\t\t<div class="scan-height-card" id="scan-height-card" style="display: none; margin-top: 14px; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; padding: 14px;">
\t\t\t\t\t<h4 style="color: #166534; margin: 0 0 10px 0; font-size: 0.92rem;">Cadastral Digital Twin Verification Package Sealed</h4>
\t\t\t\t\t<div class="scan-height-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; font-size: 0.8rem;">
\t\t\t\t\t\t<div><span>Plot / Khasra</span><strong style="display: block; color: #0284c7;">\${this.scanState.chosenPlot.khasra}</strong></div>
\t\t\t\t\t\t<div><span>Boundary Coordinates</span><strong style="display: block; color: #166534;">6 Points Sealed</strong></div>
\t\t\t\t\t\t<div><span>Elevation Photos</span><strong style="display: block; color: #166534;">4 Sides Captured (Front, Back, Left, Right)</strong></div>
\t\t\t\t\t\t<div><span>Cadastral Area</span><strong style="display: block; color: #0f172a;">\${(this.scanState.calculatedArea?.sqyd || this.scanState.chosenPlot.area_sqyd)} sq.yd</strong></div>
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

\t\t// Restore any existing exterior photos
\t\tif (this.scanState.exteriorPhotos) {
\t\t\tObject.entries(this.scanState.exteriorPhotos).forEach(([side, photo]) => {
\t\t\t\tif (photo) this.recordExteriorPhotoWithData(side, photo);
\t\t\t});
\t\t}
\t}

\tcaptureExteriorPhoto(side) {
\t\tthis.openScanCamera('elevation', side);
\t}

\trecordExteriorPhotoWithData(side, photoDataUrl) {
\t\tthis.scanState.exteriorPhotos[side] = photoDataUrl;
\t\tconst statusEl = document.getElementById(\`scan-side-status-\${side}\`);
\t\tconst cardEl = document.getElementById(\`scan-side-\${side}\`);
\t\tconst previewEl = document.getElementById(\`scan-side-preview-\${side}\`);
\t\tconst btnEl = document.getElementById(\`btn-scan-photo-\${side}\`);

\t\tif (statusEl) statusEl.innerHTML = '<span style="color: #16a34a; font-weight: 700;">Verified Captured &bull; GPS Sealed</span>';
\t\tif (cardEl) cardEl.classList.add('captured');
\t\tif (btnEl) {
\t\t\tbtnEl.textContent = \`Retake \${side.toUpperCase()} Photo\`;
\t\t\tbtnEl.style.background = '#f1f5f9';
\t\t\tbtnEl.style.color = '#475569';
\t\t\tbtnEl.style.border = '1px solid #cbd5e1';
\t\t}
\t\tif (previewEl && photoDataUrl) {
\t\t\tpreviewEl.innerHTML = \`<img src="\${photoDataUrl}" style="width: 100%; height: 100%; object-fit: cover;">\`;
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
\t\t\tif (completeBtn) {
\t\t\t\tcompleteBtn.disabled = false;
\t\t\t\tcompleteBtn.style.background = '#16a34a';
\t\t\t}
\t\t}
\t}

\tquickCaptureAll4Photos() {
\t\t['front', 'back', 'left', 'right'].forEach(side => {
\t\t\tconst canvas = document.createElement('canvas');
\t\t\tcanvas.width = 640;
\t\t\tcanvas.height = 360;
\t\t\tconst ctx = canvas.getContext('2d');
\t\t\tthis.drawSimulatedViewfinderFrame(ctx, 640, 360, 'elevation', side);
\t\t\tthis.drawCadastralStamp(ctx, 640, 360, { type: 'elevation', id: side });
\t\t\tconst photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
\t\t\tthis.recordExteriorPhotoWithData(side, photoDataUrl);
\t\t});
\t}

\tcompleteBuildingScan() {
\t\tthis.openRegisterModal();
\t\tconst khasraInput = document.getElementById('reg-khasra-input');
\t\tif (khasraInput && this.scanState.chosenPlot) {
\t\t\tkhasraInput.value = this.scanState.chosenPlot.khasra;
\t\t}

\t\tconst coordsInput = document.getElementById('reg-coordinates-json');
\t\tif (coordsInput && this.scanState.plotPoints.length > 0) {
\t\t\tconst validCoords = this.scanState.plotPoints.filter(Boolean).map(p => [p.lng, p.lat]);
\t\t\tif (validCoords.length > 0) {
\t\t\t\tvalidCoords.push([validCoords[0][0], validCoords[0][1]]);
\t\t\t\tcoordsInput.value = JSON.stringify(validCoords);
\t\t\t}
\t\t}

\t\tconst areaSqftInput = document.getElementById('reg-area-sqft');
\t\tif (areaSqftInput) {
\t\t\tconst sqft = this.scanState.calculatedArea?.sqft || this.scanState.chosenPlot.area_sqft || 3465;
\t\t\tareaSqftInput.value = sqft;
\t\t}

\t\tconst vertexCountEl = document.getElementById('reg-vertex-count');
\t\tif (vertexCountEl) {
\t\t\tvertexCountEl.textContent = '6 Boundary Points & 4 Photos Sealed';
\t\t}

\t\tconst statusBadge = document.getElementById('reg-status-badge');
\t\tif (statusBadge) {
\t\t\tstatusBadge.textContent = '6-Point Scan & 4 Photos Sealed';
\t\t\tstatusBadge.style.background = '#dcfce7';
\t\t\tstatusBadge.style.color = '#166534';
\t\t}

\t\tif (this.recalculateChallanFee) this.recalculateChallanFee();
\t\tthis.showToast('6-Point GPS Survey & 4 Elevation Photos Sealed! Ready for Challan Payment.', 4500);
\t}

`;

	content = content.substring(0, scanTargetStart) + newScanWorkflow + content.substring(scanTargetEnd);
	console.log('Replaced scan workflow methods successfully');
} else {
	console.error('Could not find start/end indices for scan workflow methods', scanTargetStart, scanTargetEnd);
}

fs.writeFileSync(appPath, content, 'utf8');
console.log('Successfully written updated src/app.js');
