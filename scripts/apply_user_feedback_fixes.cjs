const fs = require('fs');

console.log('🚀 Applying user feedback fixes...');

// ─────────────────────────────────────────────────────────────
// 1. UPDATE index.html
// ─────────────────────────────────────────────────────────────
let html = fs.readFileSync('index.html', 'utf8');

// A. Remove "Building Scan" tab from top navigation
const scanNavRegex = /<li class="nav-item" data-view="scan" id="tour-nav-scan">[\s\S]*?<\/li>/;
if (scanNavRegex.test(html)) {
  html = html.replace(scanNavRegex, '');
  console.log('✅ Removed Building Scan tab from top navigation');
}

// B. Remove the "plane box with number 1" notification bell button (#btn-nav-notifications)
const notifBtnRegex = /<!-- STATUTORY NOTICES NOTIFICATION[\s\S]*?<button type="button" id="btn-nav-notifications"[\s\S]*?<\/button>/;
if (notifBtnRegex.test(html)) {
  html = html.replace(notifBtnRegex, '');
  console.log('✅ Removed #btn-nav-notifications (plane box with number 1)');
}

// C. In #register-property-modal, integrate 2-Phase GPS & Exterior Scan button
const oldRegButtons = `<div style="display: flex; gap: 8px; margin-bottom: 10px;">
\t\t\t\t\t\t\t<button type="button" id="btn-select-map-building" onclick="window.app.startSelectBuildingOnMap()" class="btn-card" style="flex: 1; padding: 9px 12px; font-size: 0.82rem; background: #0284c7; color: #fff; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; box-shadow: 0 2px 6px rgba(2,132,199,0.3);">
\t\t\t\t\t\t\t\t<span></span> Select Building on Map
\t\t\t\t\t\t\t</button>
\t\t\t\t\t\t\t<button type="button" id="btn-draw-map-polygon" onclick="window.app.startDrawBoundaryPolygon()" class="btn-card" style="flex: 1; padding: 9px 12px; font-size: 0.82rem; background: #16a34a; color: #fff; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; box-shadow: 0 2px 6px rgba(22,163,74,0.3);">
\t\t\t\t\t\t\t\t<span></span> Draw Boundary (6 Dots)
\t\t\t\t\t\t\t</button>
\t\t\t\t\t\t</div>`;

const newRegButtons = `<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 10px;">
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

if (html.includes('id="btn-select-map-building"') && !html.includes('id="btn-manual-gps-scan"')) {
  html = html.replace(/<div style="display: flex; gap: 8px; margin-bottom: 10px;">[\s\S]*?<\/div>\s*<!-- Cadastral Polygon/, `${newRegButtons}\n\n\t\t\t\t\t\t<!-- Cadastral Polygon`);
  console.log('✅ Integrated 2-Phase GPS & Exterior Scan into "+ Add / Survey Building" modal');
}

// D. In #view-officer, add search input and enhance tab header
const oldOfficerTabs = `<div style="display: flex; gap: 4px; margin-bottom: 0; background: #f8fafc; padding: 6px; border-radius: 8px 8px 0 0; border: 1px solid #e2e8f0; border-bottom: none;">
\t\t\t<button type="button" class="officer-tab active" data-tab="requests" onclick="window.app.switchOfficerTab('requests')">All Requests &amp; Parcels</button>
\t\t\t<button type="button" class="officer-tab" data-tab="approvals" onclick="window.app.switchOfficerTab('approvals')">Approvals Queue</button>
\t\t\t<button type="button" class="officer-tab" data-tab="violations" onclick="window.app.switchOfficerTab('violations')">Violations &amp; Enforcement</button>
\t\t\t<button type="button" class="officer-tab" data-tab="scans" onclick="window.app.switchOfficerTab('scans')"> Submitted Scans</button>
\t\t\t</div>`;

const newOfficerTabs = `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 0; background: #f8fafc; padding: 8px 12px; border-radius: 8px 8px 0 0; border: 1px solid #e2e8f0; border-bottom: none;">
\t\t\t\t<div style="display: flex; gap: 6px; flex-wrap: wrap;">
\t\t\t\t\t<button type="button" class="officer-tab active" data-tab="requests" onclick="window.app.switchOfficerTab('requests')">All Requests &amp; Parcels (<span id="officer-tab-count-all">10,300</span>)</button>
\t\t\t\t\t<button type="button" class="officer-tab" data-tab="approvals" onclick="window.app.switchOfficerTab('approvals')">Approvals Queue (<span id="officer-tab-count-approvals">0</span>)</button>
\t\t\t\t\t<button type="button" class="officer-tab" data-tab="violations" onclick="window.app.switchOfficerTab('violations')">Active Violations (<span id="officer-tab-count-violations">0</span>)</button>
\t\t\t\t\t<button type="button" class="officer-tab" data-tab="verified" onclick="window.app.switchOfficerTab('verified')">Verified Parcels (<span id="officer-tab-count-verified">0</span>)</button>
\t\t\t\t</div>
\t\t\t\t<div style="display: flex; gap: 8px; align-items: center;">
\t\t\t\t\t<input type="text" id="officer-search-input" placeholder="Filter by ULPIN, Owner, Survey No..." oninput="window.app.filterOfficerTable(this.value)" style="padding: 6px 12px; font-size: 0.8rem; border: 1.5px solid #cbd5e1; border-radius: 6px; width: 260px; outline: none; background: #ffffff;">
\t\t\t\t</div>
\t\t\t</div>`;

if (html.includes('class="officer-tab active" data-tab="requests"')) {
  html = html.replace(/<div style="display: flex; gap: 4px; margin-bottom: 0; background: #f8fafc;[\s\S]*?<\/div>\s*<!-- Requests Table -->/, `${newOfficerTabs}\n\n\t\t\t<!-- Requests Table -->`);
  console.log('✅ Updated Officer portal tabs and added live search filter');
}

fs.writeFileSync('index.html', html, 'utf8');


// ─────────────────────────────────────────────────────────────
// 2. UPDATE src/app.js (FILTER IMPLEMENTATION & CLEAN WORKFLOWS)
// ─────────────────────────────────────────────────────────────
let appJs = fs.readFileSync('src/app.js', 'utf8');

// A. Make sure landing page DOES NOT show nav bar ("landing is just a landing page")
appJs = appJs.replace(/govNav\.style\.display\s*=\s*'flex';/,
`govNav.style.display = (viewName === 'landing') ? 'none' : 'flex';`);

// B. Remove handleNotificationClick
appJs = appJs.replace(/handleNotificationClick\(\)\s*\{[\s\S]*?\n\s*showTopNotification/, 'showTopNotification');

// C. Update renderScanPhase1 back button to return to Add Building modal
appJs = appJs.replace(/onclick="window\.app\.switchView\('dashboard'\)">← Back to Dashboard<\/button>/,
`onclick="window.app.openRegisterModal()">&larr; Back to Add Building</button>`);

// D. Update completeBuildingScan to pre-fill registration modal
const newCompleteBuildingScan = `  completeBuildingScan() {
    this.showToast('Building survey complete! Scanned GPS coordinates and dimensions applied to Registration Form.', 4500);
    this.openRegisterModal();
    if (this.scanState && this.scanState.plotPoints && this.scanState.plotPoints.length >= 6) {
      const coordsInput = document.getElementById('reg-coordinates-json');
      const areaInput = document.getElementById('reg-area-sqft');
      const badge = document.getElementById('reg-status-badge');
      if (coordsInput) coordsInput.value = JSON.stringify(this.scanState.plotPoints);
      if (areaInput) areaInput.value = Math.round(this.scanState.plotArea * 9);
      if (badge) {
        badge.textContent = '6-Point GPS Survey Snapped';
        badge.style.background = '#dcfce7';
        badge.style.color = '#15803d';
      }
      const areaDisplay = document.getElementById('reg-area-display');
      if (areaDisplay) {
        areaDisplay.innerHTML = \`<strong>\${Math.round(this.scanState.plotArea).toLocaleString()} sq.yd &bull; \${Math.round(this.scanState.plotArea * 9).toLocaleString()} sq.ft</strong>\`;
      }
      if (this.recalculateChallanFee) this.recalculateChallanFee();
    }
  }

  startManualScanFromModal() {
    this.closeRegisterModal();
    this.switchView('scan');
  }`;

appJs = appJs.replace(/completeBuildingScan\(\)\s*\{[\s\S]*?\n\s*\/\/ ===== ENHANCED OFFICER AUTHORITY PORTAL =====/, `${newCompleteBuildingScan}\n\n  // ===== ENHANCED OFFICER AUTHORITY PORTAL =====`);

// E. Add switchOfficerTab and filterOfficerTable to app.js
const officerMethods = `
  switchOfficerTab(tabName) {
    this.currentOfficerTab = tabName;
    document.querySelectorAll('.officer-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
    });
    this.applyOfficerFilter();
  }

  filterOfficerTable(query) {
    this.officerSearchQuery = (query || '').toLowerCase().trim();
    this.applyOfficerFilter();
  }

  applyOfficerFilter() {
    if (!this.officerParcels) return;
    const tab = this.currentOfficerTab || 'requests';
    const query = this.officerSearchQuery || '';

    let filtered = this.officerParcels;

    // Filter by tab
    if (tab === 'approvals') {
      filtered = filtered.filter(p => p.status === 'PENDING_SURVEY' || p.status === 'PROVISIONAL' || !p.status);
    } else if (tab === 'violations') {
      filtered = filtered.filter(p => p.has_anomaly === true || p.has_anomaly === 1);
    } else if (tab === 'verified') {
      filtered = filtered.filter(p => p.status === 'VERIFIED' || p.status === 'PLAN_APPROVED');
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(p => {
        const ulpin = (p.ulpin || '').toLowerCase();
        const owner = (p.owner || '').toLowerCase();
        const survey = (p.survey_no || '').toLowerCase();
        const village = (p.village || '').toLowerCase();
        const district = (p.district || '').toLowerCase();
        return ulpin.includes(query) || owner.includes(query) || survey.includes(query) || village.includes(query) || district.includes(query);
      });
    }

    this.renderOfficerTableRows(filtered);
  }

  renderOfficerTableRows(parcels) {
    const tbody = document.getElementById('officer-requests-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!parcels || parcels.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="padding: 24px; text-align: center; color: #64748b; font-weight: 500;">No parcels found matching this filter criteria.</td></tr>';
      return;
    }

    parcels.slice(0, 100).forEach(parcel => {
      const row = document.createElement('tr');
      const isViolation = parcel.has_anomaly === true || parcel.has_anomaly === 1;
      const isVerified = parcel.status === 'VERIFIED' || parcel.status === 'PLAN_APPROVED';
      const statusClass = isViolation ? 'status-flagged' : (isVerified ? 'status-approved' : 'status-pending');
      const statusLabel = isViolation ? '24h Notice (Flagged)' : (isVerified ? 'Verified' : 'Pending Review');

      row.innerHTML = \`
        <td style="font-family: monospace; font-weight: 700; color: #0369a1; font-size: 0.78rem;">\${parcel.ulpin}</td>
        <td>\${parcel.survey_no || 'Khasra 429/1'}</td>
        <td><strong>\${parcel.owner || 'Registered Owner'}</strong></td>
        <td>\${parcel.village || 'Amritsar Urban'}, \${parcel.district || 'Amritsar'}</td>
        <td>\${parcel.total_floors || 2} Level(s)</td>
        <td><span class="officer-status-badge \${statusClass}">\${statusLabel}</span></td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            <button class="btn-officer-action btn-inspect" onclick="window.app.inspectParcel('\${parcel.ulpin}')">Inspect</button>
            \${!isVerified ? \`<button class="btn-officer-action btn-approve" onclick="window.app.approveParcel('\${parcel.ulpin}')">Approve</button>\` : ''}
            \${!isViolation ? \`<button class="btn-officer-action btn-flag" onclick="window.app.flagParcel('\${parcel.ulpin}')">Flag</button>\` : ''}
          </div>
        </td>
      \`;
      tbody.appendChild(row);
    });
  }
`;

// Replace loadOfficerRequests to populate officerParcels and tab counts
const newLoadOfficerRequests = `  async loadOfficerRequests() {
    const container = document.getElementById('officer-requests-container');
    if (!container) return;

    try {
      const res = await fetch('/api/parcels');
      if (!res.ok) return;
      const data = await res.json();
      this.officerParcels = data.data || [];

      const pendingParcels = this.officerParcels.filter(p => p.status === 'PENDING_SURVEY' || p.status === 'PROVISIONAL' || !p.status);
      const approvedParcels = this.officerParcels.filter(p => p.status === 'VERIFIED' || p.status === 'PLAN_APPROVED');
      const flaggedParcels = this.officerParcels.filter(p => p.has_anomaly === true || p.has_anomaly === 1);

      // Update KPI counters
      const statsEl = document.getElementById('officer-pending-count');
      if (statsEl) statsEl.textContent = pendingParcels.length;
      const approvedEl = document.getElementById('officer-approved-count');
      if (approvedEl) approvedEl.textContent = approvedParcels.length;
      const flaggedEl = document.getElementById('officer-flagged-count');
      if (flaggedEl) flaggedEl.textContent = flaggedParcels.length;

      // Update Tab counters
      const tabAll = document.getElementById('officer-tab-count-all');
      if (tabAll) tabAll.textContent = this.officerParcels.length.toLocaleString();
      const tabApp = document.getElementById('officer-tab-count-approvals');
      if (tabApp) tabApp.textContent = pendingParcels.length;
      const tabViol = document.getElementById('officer-tab-count-violations');
      if (tabViol) tabViol.textContent = flaggedParcels.length;
      const tabVer = document.getElementById('officer-tab-count-verified');
      if (tabVer) tabVer.textContent = approvedParcels.length;

      this.currentOfficerTab = this.currentOfficerTab || 'requests';
      this.applyOfficerFilter();
    } catch (e) {
      console.warn('Failed to load officer requests:', e);
    }
  }
${officerMethods}`;

appJs = appJs.replace(/async loadOfficerRequests\(\)\s*\{[\s\S]*?\n\s*approveParcel\(ulpin\)/, `${newLoadOfficerRequests}\n  approveParcel(ulpin)`);

fs.writeFileSync('src/app.js', appJs, 'utf8');
console.log('✅ Updated src/app.js with full officer tab filter and live search');

// ─────────────────────────────────────────────────────────────
// 3. UPDATE src/styles/gov-theme.css (OFFICER TAB ACTIVE STYLES)
// ─────────────────────────────────────────────────────────────
let css = fs.readFileSync('src/styles/gov-theme.css', 'utf8');
if (!css.includes('.officer-tab.active')) {
  css += `
/* ── OFFICER TABS STYLING ── */
.officer-tab {
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #475569;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.officer-tab:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.officer-tab.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(2, 132, 199, 0.25);
}
`;
  fs.writeFileSync('src/styles/gov-theme.css', css, 'utf8');
  console.log('✅ Added CSS for .officer-tab.active');
}

console.log('🚀 All user feedback fixes applied successfully!');
