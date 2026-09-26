import { verifyAadhaar, authProviderLabel } from './features/auth/auth-client.js';
import { fetchDashboardSummary } from './features/official-data/official-data-client.js';
import './styles.css';

const numberFormatter = new Intl.NumberFormat('en-IN');

function formatNumber(value) {
  return numberFormatter.format(Number(value || 0));
}

function formatPercent(value) {
  return Number(value || 0).toFixed(2) + '%';
}

function renderMetric(label, value, meta) {
  return [
    '<article class="metric-card">',
    '<div class="metric-label">', label, '</div>',
    '<div class="metric-value">', value, '</div>',
    '<div class="metric-meta">', meta, '</div>',
    '</article>'
  ].join('');
}

function renderShell(container) {
  container.innerHTML = [
    '<div class="portal">',
    '  <header class="portal-header">',
    '    <div>',
    '      <div class="eyebrow">BHAVANINFO · 3D CADASTRAL PLATFORM</div>',
    '      <h1>Land Records Modernization Console</h1>',
    '    </div>',
    '    <div class="header-meta"><span class="status-dot"></span><span>API data services</span></div>',
    '  </header>',
    '  <nav class="portal-nav" aria-label="Primary navigation">',
    '    <button class="nav-btn is-active" data-view="dashboard">Dashboard</button>',
    '    <button class="nav-btn" data-view="identity">Identity Verification</button>',
    '  </nav>',
    '  <main id="view" class="portal-main"></main>',
    '  <footer class="portal-footer">',
    '    <span>BHAVANINFO is an independent prototype.</span>',
    '    <span>Official programme statistics are shown with source provenance.</span>',
    '  </footer>',
    '</div>'
  ].join('');
  return container.querySelector('#view');
}

function renderDashboard(view, payload) {
  const dashboard = payload.dashboard;
  const state = dashboard.state;

  const rows = dashboard.focusDistricts.map(function(d) {
    return [
      '<tr>',
      '<td><strong>', d.district, '</strong></td>',
      '<td>', formatNumber(d.totalLandParcels), '</td>',
      '<td>', formatNumber(d.geoReferencedLandParcels), ' <span class="subtle">(', formatPercent(d.geoReferencedCoveragePct), ')</span></td>',
      '<td>', formatNumber(d.ulpinImplemented), ' <span class="subtle">(', formatPercent(d.ulpinCoveragePct), ')</span></td>',
      '<td>', formatNumber(d.digitizedMaps), '</td>',
      '</tr>'
    ].join('');
  }).join('');

  const tehsil = dashboard.focusTehsils[0];

  view.innerHTML = [
    '<section class="page-heading">',
    '  <div>',
    '    <div class="eyebrow">OFFICIAL DATA SNAPSHOT</div>',
    '    <h2>Punjab cadastral modernization</h2>',
    '    <p>Programme-level statistics from the Department of Land Resources DILRMP MIS. These figures do not represent an individual land record.</p>',
    '  </div>',
    '  <div class="source-badge"><strong>authoritative</strong><span>Retrieved ', new Date(dashboard.source.retrievedAt).toLocaleString('en-IN'), '</span></div>',
    '</section>',

    '<section class="metrics-grid" aria-label="Punjab programme statistics">',
      renderMetric('Land parcels', formatNumber(state.totalLandParcels), 'DILRMP Punjab'),
      renderMetric('Geo-referenced', formatNumber(state.geoReferencedLandParcels), formatPercent(state.geoReferencedCoveragePct) + ' of land parcels'),
      renderMetric('ULPIN implemented', formatNumber(state.ulpinImplemented), formatPercent(state.ulpinCoveragePct) + ' of land parcels'),
      renderMetric('ULPIN + SVAMITVA', formatNumber(state.totalUlpinAndSvamitva), 'Published programme total'),
    '</section>',

    '<section class="content-grid">',
    '  <article class="panel">',
    '    <div class="panel-header"><div><h3>Focus districts</h3><p>Government-published DILRMP status for the districts represented in the legacy prototype.</p></div></div>',
    '    <div class="table-wrap">',
    '      <table><thead><tr><th>District</th><th>Land parcels</th><th>Geo-referenced</th><th>ULPIN</th><th>Maps digitized</th></tr></thead>',
    '      <tbody>', rows, '</tbody></table>',
    '    </div>',
    '  </article>',

    '  <aside class="panel">',
    '    <div class="panel-header"><div><h3>Verified source registry</h3><p>Official metrics resolve to a documented government source.</p></div></div>',
    '    <dl class="source-list">',
    '      <div><dt>Programme</dt><dd>Digital India Land Records Modernization Programme — MIS 3.0</dd></div>',
    '      <div><dt>Organisation</dt><dd>', dashboard.source.sourceOrganization, '</dd></div>',
    '      <div><dt>Source</dt><dd><a href="', dashboard.source.sourceUrl, '" target="_blank" rel="noreferrer">DILRMP Punjab status</a></dd></div>',
    '      <div><dt>Scope</dt><dd>', dashboard.authoritativeScope, '</dd></div>',
    '    </dl>',
    '  </aside>',
    '</section>',

    '<section class="content-grid">',
    '  <article class="panel">',
    '    <div class="panel-header"><div><h3>Phagwara tehsil</h3><p>Dedicated tehsil-level snapshot from the official Kapurthala DILRMP page.</p></div></div>',
    '    <div class="detail-grid">',
      renderMetric('Land parcels', formatNumber(tehsil.totalLandParcels), 'Kapurthala · Phagwara'),
      renderMetric('Geo-referenced', formatNumber(tehsil.geoReferencedLandParcels), formatPercent(tehsil.geoReferencedCoveragePct)),
      renderMetric('ULPIN implemented', formatNumber(tehsil.ulpinImplemented), formatPercent(tehsil.ulpinCoveragePct)),
    '    </div>',
    '  </article>',

    '  <aside class="panel warning-panel">',
    '    <div class="panel-header"><div><h3>3D renderer protection boundary</h3><p>The existing Three.js renderer is intentionally untouched in this data-foundation phase.</p></div></div>',
    '    <div class="protection-note"><strong>', formatNumber(dashboard.legacy3d.featureCount), ' legacy building features</strong><p>remain isolated as synthetic_demo. They are not mixed with official DILRMP statistics.</p></div>',
    '    <div class="protection-note neutral"><strong>Punjab Land Records</strong><p><a href="', dashboard.officialPortal.url, '" target="_blank" rel="noreferrer">Portal</a> · <a href="', dashboard.officialPortal.cadastralMapUrl, '" target="_blank" rel="noreferrer">Cadastral Map</a> · <a href="', dashboard.officialPortal.onlineServicesUrl, '" target="_blank" rel="noreferrer">Online Services</a></p></div>',
    '  </aside>',
    '</section>'
  ].join('');
}

function renderIdentity(view) {
  view.innerHTML = [
    '<section class="page-heading">',
    '  <div><div class="eyebrow">AUTHENTICATION</div><h2>UIDAI test-data identity verification</h2><p>This prototype uses the configured UIDAI test fixture unless a real sandbox integration is supplied. Authentication and application authorization remain separate.</p></div>',
    '</section>',
    '<section class="identity-card">',
    '  <div class="source-badge"><strong>UIDAI TEST DATA</strong><span>Not production Aadhaar authentication</span></div>',
    '  <form id="auth-form" class="auth-form">',
    '    <label>Aadhaar test identifier<input name="aadhaar" inputmode="numeric" autocomplete="off" required></label>',
    '    <label>Name<input name="name" autocomplete="name" required></label>',
    '    <button type="submit" class="primary-btn">Verify identity</button>',
    '    <p id="auth-status" class="form-status" role="status"></p>',
    '  </form>',
    '</section>'
  ].join('');

  const form = view.querySelector('#auth-form');
  const status = view.querySelector('#auth-status');

  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    status.textContent = 'Verifying…';
    status.className = 'form-status';

    try {
      const data = new FormData(form);
      const result = await verifyAadhaar({
        aadhaar: data.get('aadhaar'),
        name: data.get('name')
      });

      status.textContent =
        'Identity verified: ' +
        result.identity.displayName +
        ' · provider=' +
        authProviderLabel(result.authentication.provider) +
        ' · authentication only';
      status.classList.add('success');
    } catch (error) {
      const errorPayload = error.payload || {};
      status.textContent =
        'Verification failed: ' +
        (errorPayload.reason || error.message || 'Unknown error');
      status.classList.add('error');
    }
  });
}

export async function createAuthDemo(container) {
  const view = renderShell(container);
  let payload = null;

  async function loadDashboard() {
    view.innerHTML = '<div class="loading">Loading official data from BHAVANINFO API…</div>';

    try {
      payload = await fetchDashboardSummary();
      renderDashboard(view, payload);
    } catch (error) {
      view.innerHTML = [
        '<section class="error-state">',
        '<h2>Data service unavailable</h2>',
        '<p>', error.message, '</p>',
        '<p>Start the API with <code>npm run dev:api</code>, then reload the dashboard.</p>',
        '</section>'
      ].join('');
    }
  }

  function switchView(name) {
    container.querySelectorAll('.nav-btn').forEach(function(button) {
      button.classList.toggle('is-active', button.dataset.view === name);
    });

    if (name === 'identity') {
      renderIdentity(view);
    } else if (payload) {
      renderDashboard(view, payload);
    } else {
      loadDashboard();
    }
  }

  container.querySelectorAll('.nav-btn').forEach(function(button) {
    button.addEventListener('click', function() {
      switchView(button.dataset.view);
    });
  });

  await loadDashboard();
}
