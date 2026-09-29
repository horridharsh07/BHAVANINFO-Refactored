const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'src', 'app.js');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Update backBtn in setupModalHandlers
const oldBackBtn = `\t// Back button from 3D view to 2D Map
\tconst backBtn = document.getElementById('btn-back-to-map');
\tif (backBtn) {
\t\tbackBtn.addEventListener('click', () => {
\t\t\tthis.switchView('map');
\t\t});
\t}`;

const newBackBtn = `\t// Back button from 3D view to 2D Map or Officer Portal
\tconst backBtn = document.getElementById('btn-back-to-map');
\tif (backBtn) {
\t\tbackBtn.addEventListener('click', () => {
\t\t\tif (this.currentUser && this.currentUser.role === 'AUTHORITY_HEAD') {
\t\t\t\tthis.switchView('officer');
\t\t\t} else {
\t\t\t\tthis.switchView('map');
\t\t\t}
\t\t});
\t}`;

if (content.includes('this.switchView(\'map\');') && content.includes('const backBtn = document.getElementById(\'btn-back-to-map\');')) {
	content = content.replace(
		/const backBtn = document\.getElementById\('btn-back-to-map'\);[\s\S]*?this\.switchView\('map'\);[\s\S]*?\}\);[\s\S]*?\}/,
		`const backBtn = document.getElementById('btn-back-to-map');
\tif (backBtn) {
\t\tbackBtn.addEventListener('click', () => {
\t\t\tif (this.currentUser && this.currentUser.role === 'AUTHORITY_HEAD') {
\t\t\t\tthis.switchView('officer');
\t\t\t} else {
\t\t\t\tthis.switchView('map');
\t\t\t}
\t\t});
\t}`
	);
	console.log('Updated backBtn logic successfully');
}

// 2. Update renderDossierHUD to toggle officer actions and update backBtn label
const targetHUD = `\t\tconst isPending = (parcel.status === 'PENDING_REGISTRATION' || parcel.status === 'PENDING');`;
const replacementHUD = `\t\tconst isPending = (parcel.status === 'PENDING_REGISTRATION' || parcel.status === 'PENDING' || parcel.status === 'PENDING_SURVEY' || parcel.status === 'PROVISIONAL');
\t\tconst isOfficer = this.currentUser && this.currentUser.role === 'AUTHORITY_HEAD';
\t\tconst backBtnEl = document.getElementById('btn-back-to-map');
\t\tif (backBtnEl) {
\t\t\tbackBtnEl.innerHTML = isOfficer ? '&larr; Back to Officer Portal' : '&larr; Back to Map';
\t\t}
\t\tconst officerActionsEl = document.getElementById('dossier-officer-actions');
\t\tif (officerActionsEl) {
\t\t\tconst isApproved = parcel.status === 'VERIFIED' || parcel.status === 'PLAN_APPROVED' || parcel.status === 'APPROVED';
\t\t\tofficerActionsEl.style.display = (isOfficer && !isApproved) ? 'block' : 'none';
\t\t}`;

if (content.includes(targetHUD)) {
	content = content.replace(targetHUD, replacementHUD);
	console.log('Updated renderDossierHUD successfully');
} else {
	// Try flexible match
	const regexHUD = /const isPending = \(parcel\.status === 'PENDING_REGISTRATION' \|\| parcel\.status === 'PENDING'\);/;
	if (regexHUD.test(content)) {
		content = content.replace(regexHUD, replacementHUD);
		console.log('Updated renderDossierHUD via regex');
	}
}

// 3. Replace loadOfficerRequests up to flagParcel
const startIdx = content.indexOf('async loadOfficerRequests() {');
const endIdx = content.indexOf('flagParcel(ulpin) {');

if (startIdx !== -1 && endIdx !== -1) {
	const newOfficerMethods = `async loadOfficerRequests() {
\t\tconst container = document.getElementById('officer-requests-container');
\t\tif (!container) return;

\t\ttry {
\t\t\tconst res = await fetch('/api/parcels');
\t\t\tif (!res.ok) return;
\t\t\tconst data = await res.json();
\t\t\tthis.officerParcels = data.data || [];

\t\t\tconst pendingParcels = this.officerParcels.filter(p => p.status === 'PENDING_SURVEY' || p.status === 'PROVISIONAL' || p.status === 'PENDING_REGISTRATION' || p.status === 'PENDING' || p.status === 'PENDING_REVIEW' || !p.status);
\t\t\tconst approvedParcels = this.officerParcels.filter(p => p.status === 'VERIFIED' || p.status === 'PLAN_APPROVED' || p.status === 'APPROVED');
\t\t\tconst flaggedParcels = this.officerParcels.filter(p => p.has_anomaly === true || p.has_anomaly === 1);

\t\t\t// Update KPI counters
\t\t\tconst statsEl = document.getElementById('officer-pending-count');
\t\t\tif (statsEl) statsEl.textContent = pendingParcels.length;
\t\t\tconst approvedEl = document.getElementById('officer-approved-count');
\t\t\tif (approvedEl) approvedEl.textContent = approvedParcels.length;
\t\t\tconst flaggedEl = document.getElementById('officer-flagged-count');
\t\t\tif (flaggedEl) flaggedEl.textContent = flaggedParcels.length;

\t\t\t// Update Tab counters
\t\t\tconst tabAll = document.getElementById('officer-tab-count-all');
\t\t\tif (tabAll) tabAll.textContent = this.officerParcels.length.toLocaleString();
\t\t\tconst tabApp = document.getElementById('officer-tab-count-approvals');
\t\t\tif (tabApp) tabApp.textContent = pendingParcels.length;
\t\t\tconst tabViol = document.getElementById('officer-tab-count-violations');
\t\t\tif (tabViol) tabViol.textContent = flaggedParcels.length;
\t\t\tconst tabVer = document.getElementById('officer-tab-count-verified');
\t\t\tif (tabVer) tabVer.textContent = approvedParcels.length;

\t\t\tthis.currentOfficerTab = this.currentOfficerTab || 'requests';
\t\t\tthis.applyOfficerFilter();
\t\t} catch (e) {
\t\t\tconsole.warn('Failed to load officer requests:', e);
\t\t}
\t}

\tswitchOfficerTab(tabName) {
\t\tthis.currentOfficerTab = tabName;
\t\tdocument.querySelectorAll('.officer-tab').forEach(t => {
\t\t\tt.classList.toggle('active', t.getAttribute('data-tab') === tabName);
\t\t});
\t\tthis.applyOfficerFilter();
\t}

\tfilterOfficerTable(query) {
\t\tthis.officerSearchQuery = (query || '').toLowerCase().trim();
\t\tthis.applyOfficerFilter();
\t}

\tapplyOfficerFilter() {
\t\tif (!this.officerParcels) return;
\t\tconst tab = this.currentOfficerTab || 'requests';
\t\tconst query = this.officerSearchQuery || '';

\t\tlet filtered = [...this.officerParcels];

\t\t// Filter by tab
\t\tif (tab === 'approvals') {
\t\t\tfiltered = filtered.filter(p => p.status === 'PENDING_SURVEY' || p.status === 'PROVISIONAL' || p.status === 'PENDING_REGISTRATION' || p.status === 'PENDING' || p.status === 'PENDING_REVIEW' || !p.status);
\t\t} else if (tab === 'violations') {
\t\t\tfiltered = filtered.filter(p => p.has_anomaly === true || p.has_anomaly === 1);
\t\t} else if (tab === 'verified') {
\t\t\tfiltered = filtered.filter(p => p.status === 'VERIFIED' || p.status === 'PLAN_APPROVED' || p.status === 'APPROVED');
\t\t\t// Sort so that newly approved parcels appear at the very top of the Approved List!
\t\t\tfiltered.sort((a, b) => {
\t\t\t\tif (a.justApproved && !b.justApproved) return -1;
\t\t\t\tif (!a.justApproved && b.justApproved) return 1;
\t\t\t\tif (a.approved_at && b.approved_at) return b.approved_at - a.approved_at;
\t\t\t\tif (a.approved_at && !b.approved_at) return -1;
\t\t\t\tif (!a.approved_at && b.approved_at) return 1;
\t\t\t\treturn 0;
\t\t\t});
\t\t}

\t\t// Filter by search query
\t\tif (query) {
\t\t\tfiltered = filtered.filter(p => {
\t\t\t\tconst ulpin = (p.ulpin || '').toLowerCase();
\t\t\t\tconst owner = (p.owner || '').toLowerCase();
\t\t\t\tconst survey = (p.survey_no || '').toLowerCase();
\t\t\t\tconst village = (p.village || '').toLowerCase();
\t\t\t\tconst district = (p.district || '').toLowerCase();
\t\t\t\treturn ulpin.includes(query) || owner.includes(query) || survey.includes(query) || village.includes(query) || district.includes(query);
\t\t\t});
\t\t}

\t\t// Update table heading based on active tab
\t\tconst headingEl = document.getElementById('officer-table-heading');
\t\tif (headingEl) {
\t\t\tif (tab === 'verified') {
\t\t\t\theadingEl.innerHTML = 'Approved List &bull; Digitally Sanctioned &amp; Verified Cadastral Parcels';
\t\t\t} else if (tab === 'approvals') {
\t\t\t\theadingEl.innerHTML = 'Approvals Queue &bull; Pending Citizen Registrations &amp; Building Sanctions';
\t\t\t} else if (tab === 'violations') {
\t\t\t\theadingEl.innerHTML = 'Active Violations &bull; Statutory 24h Notices';
\t\t\t} else {
\t\t\t\theadingEl.innerHTML = 'Complete Cadastral Parcel Register &bull; Officer Authority View';
\t\t\t}
\t\t}

\t\tthis.renderOfficerTableRows(filtered);
\t}

\trenderOfficerTableRows(parcels) {
\t\tconst tbody = document.getElementById('officer-requests-tbody');
\t\tif (!tbody) return;
\t\ttbody.innerHTML = '';

\t\tconst tab = this.currentOfficerTab || 'requests';

\t\tif (!parcels || parcels.length === 0) {
\t\t\tlet emptyMsg = 'No parcels found matching this filter criteria.';
\t\t\tif (tab === 'verified') {
\t\t\t\temptyMsg = 'No approved parcels found. Once an officer approves a pending request, it will appear here in the Approved List.';
\t\t\t} else if (tab === 'approvals') {
\t\t\t\temptyMsg = 'No pending approval requests. All cadastral applications have been reviewed.';
\t\t\t}
\t\t\ttbody.innerHTML = \`<tr><td colspan="7" style="padding: 28px; text-align: center; color: #64748b; font-weight: 500;">\${emptyMsg}</td></tr>\`;
\t\t\treturn;
\t\t}

\t\tparcels.slice(0, 100).forEach(parcel => {
\t\t\tconst row = document.createElement('tr');
\t\t\tconst isViolation = parcel.has_anomaly === true || parcel.has_anomaly === 1;
\t\t\tconst isVerified = parcel.status === 'VERIFIED' || parcel.status === 'PLAN_APPROVED' || parcel.status === 'APPROVED';
\t\t\tconst statusClass = isViolation ? 'status-flagged' : (isVerified ? 'status-approved' : 'status-pending');
\t\t\tconst statusLabel = isViolation ? '24h Notice (Flagged)' : (isVerified ? (parcel.justApproved ? 'Approved Just Now' : 'Verified & Approved') : 'Pending Review');

\t\t\tif (parcel.justApproved) {
\t\t\t\trow.style.background = '#f0fdf4';
\t\t\t\trow.style.borderLeft = '4px solid #16a34a';
\t\t\t}

\t\t\trow.innerHTML = \`
\t\t\t\t<td style="font-family: monospace; font-weight: 700; color: #0369a1; font-size: 0.78rem;">\${parcel.ulpin}</td>
\t\t\t\t<td>\${parcel.survey_no || 'Khasra 429/1'}</td>
\t\t\t\t<td><strong>\${parcel.owner || 'Registered Owner'}</strong></td>
\t\t\t\t<td>\${parcel.village || 'Amritsar Urban'}, \${parcel.district || 'Amritsar'}</td>
\t\t\t\t<td>\${parcel.total_floors || 2} Level(s)</td>
\t\t\t\t<td><span class="officer-status-badge \${statusClass}">\${statusLabel}</span></td>
\t\t\t\t<td>
\t\t\t\t\t<div style="display: flex; gap: 4px; flex-wrap: wrap;">
\t\t\t\t\t\t<button class="btn-officer-action btn-inspect" onclick="window.app.inspectParcel('\${parcel.ulpin}')">Inspect</button>
\t\t\t\t\t\t\${!isVerified ? \`<button class="btn-officer-action btn-approve" onclick="window.app.approveParcel('\${parcel.ulpin}')">Approve</button>\` : \`<span style="font-size: 0.75rem; color: #16a34a; font-weight: 700; background: #dcfce7; padding: 3px 8px; border-radius: 4px; border: 1px solid #bbf7d0;">Approved</span>\`}
\t\t\t\t\t\t\${!isViolation && !isVerified ? \`<button class="btn-officer-action btn-flag" onclick="window.app.flagParcel('\${parcel.ulpin}')">Flag</button>\` : ''}
\t\t\t\t\t</div>
\t\t\t\t</td>
\t\t\t\`;
\t\t\ttbody.appendChild(row);
\t\t});
\t}

\tasync approveParcel(ulpin) {
\t\t// Clear search filter so the approved parcel is guaranteed to be visible
\t\tconst searchInput = document.getElementById('officer-search-input');
\t\tif (searchInput) searchInput.value = '';
\t\tthis.officerSearchQuery = '';

\t\t// Find parcel in memory
\t\tlet parcel = (this.officerParcels || []).find(p => p.ulpin === ulpin || p.legacy_ulpin === ulpin || String(p.ulpin).trim().toUpperCase() === String(ulpin).trim().toUpperCase());
\t\tconst mainP = (this.allParcels || []).find(p => p.ulpin === ulpin || p.legacy_ulpin === ulpin || String(p.ulpin).trim().toUpperCase() === String(ulpin).trim().toUpperCase());

\t\tif (!parcel && mainP) {
\t\t\tparcel = mainP;
\t\t\tif (!this.officerParcels) this.officerParcels = [];
\t\t\tthis.officerParcels.unshift(parcel);
\t\t}

\t\tconst ownerName = parcel ? parcel.owner : 'Property Owner';
\t\tconst surveyNo = parcel ? parcel.survey_no : ulpin;

\t\t// 1. Update in-memory parcel status
\t\tif (parcel) {
\t\t\tparcel.status = 'PLAN_APPROVED';
\t\t\tparcel.has_anomaly = false;
\t\t\tparcel.anomaly_desc = null;
\t\t\tparcel.justApproved = true;
\t\t\tparcel.approved_at = Date.now();
\t\t}

\t\tif (mainP) {
\t\t\tmainP.status = 'PLAN_APPROVED';
\t\t\tmainP.has_anomaly = false;
\t\t\tmainP.anomaly_desc = null;
\t\t\tmainP.justApproved = true;
\t\t\tmainP.approved_at = Date.now();
\t\t}

\t\t// Move to the very beginning of officerParcels so it shows at the top
\t\tif (parcel && this.officerParcels) {
\t\t\tthis.officerParcels = [parcel, ...this.officerParcels.filter(p => p !== parcel && p.ulpin !== ulpin)];
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
\t\tconst pendingParcels = (this.officerParcels || []).filter(p => p.status === 'PENDING_SURVEY' || p.status === 'PROVISIONAL' || p.status === 'PENDING_REGISTRATION' || p.status === 'PENDING' || p.status === 'PENDING_REVIEW' || !p.status);
\t\tconst approvedParcels = (this.officerParcels || []).filter(p => p.status === 'VERIFIED' || p.status === 'PLAN_APPROVED' || p.status === 'APPROVED');
\t\tconst flaggedParcels = (this.officerParcels || []).filter(p => p.has_anomaly === true || p.has_anomaly === 1);

\t\tconst statsEl = document.getElementById('officer-pending-count');
\t\tif (statsEl) statsEl.textContent = pendingParcels.length;
\t\tconst approvedEl = document.getElementById('officer-approved-count');
\t\tif (approvedEl) approvedEl.textContent = approvedParcels.length;
\t\tconst flaggedEl = document.getElementById('officer-flagged-count');
\t\tif (flaggedEl) flaggedEl.textContent = flaggedParcels.length;

\t\tconst tabAll = document.getElementById('officer-tab-count-all');
\t\tif (tabAll) tabAll.textContent = (this.officerParcels || []).length.toLocaleString();
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

\t\t// 6. Scroll officer requests container smoothly into view
\t\tconst reqContainer = document.getElementById('officer-requests-container');
\t\tif (reqContainer) {
\t\t\treqContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
\t\t}
\t}

\tasync approveParcelFromDossier() {
\t\tif (!this.activeParcel) return;
\t\tconst ulpin = this.activeParcel.ulpin;
\t\tawait this.approveParcel(ulpin);
\t\tthis.switchView('officer');
\t\tthis.switchOfficerTab('verified');
\t}

\t`;

	content = content.substring(0, startIdx) + newOfficerMethods + content.substring(endIdx);
	console.log('Replaced officer portal methods successfully');
} else {
	console.error('Could not find start/end indices for officer methods');
}

fs.writeFileSync(appPath, content, 'utf8');
console.log('Successfully wrote changes to src/app.js');
