import maplibregl from 'maplibre-gl';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { verifyAadhaar, authProviderLabel } from './features/auth/auth-client.js';
import {
  fetchDashboardSummary,
  fetchDemoParcels,
  searchDemoParcels,
  createDemoParcel
} from './features/official-data/official-data-client.js';
import { CadastreMap2D } from './features/map/CadastreMap2D.js';
import { DigitalTwin3D } from './features/twin/DigitalTwin3D.js';
import { normalizeTwinParcel } from './features/twin/twin-data-adapter.js';

import 'maplibre-gl/dist/maplibre-gl.css';
import './styles.css';

globalThis.maplibregl = maplibregl;
globalThis.THREE = THREE;
THREE.OrbitControls = OrbitControls;

const numberFormatter = new Intl.NumberFormat('en-IN');

function formatNumber(value) {
  return numberFormatter.format(Number(value || 0));
}

function formatPercent(value) {
  return Number(value || 0).toFixed(2) + '%';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

function makeRendererParcel(parcel) {
  const normalized = normalizeTwinParcel(parcel);
  return {
    ...parcel,
    coordinates: normalized.geometry.coordinates?.[0] || parcel.coordinates || [],
    elevation_m: normalized.elevationM,
    levels: normalized.floors.map((floor) => ({
      ...(parcel.levels || []).find((candidate) =>
        (candidate.level_code || candidate.levelCode) === floor.levelCode
      ),
      level_code: floor.levelCode,
      elevation_m: floor.elevationM,
      height_m: floor.heightM,
      use_type: floor.useType,
      is_flagged: floor.flagged
    }))
  };
}

class PrototypeApp {
  constructor(container) {
    this.container = container;
    this.parcels = [];
    this.activeParcel = null;
    this.dashboard = null;
    this.map2d = null;
    this.twin3d = null;
    this.view = 'home';
    this.viewContainer = null;
  }

  async init() {
    this.viewContainer = this.renderShell();
    this.renderSurveyModal();
    this.bindGlobalEvents();
    await this.loadParcels();
    await this.switchView('home');
  }

  renderShell() {
    this.container.innerHTML = [
      '<div class="app-shell">',
      '  <div class="prototype-banner"><strong>BHAVANINFO PROTOTYPE</strong><span>Independent demonstrator · official programme statistics + synthetic cadastral fixtures</span></div>',
      '  <header class="gov-header">',
      '    <div class="gov-topline"><span>Government-aligned technical demonstrator</span><span>Land records · GIS · 3D cadastral</span></div>',
      '    <div class="brand-row"><div class="brand-mark" aria-hidden="true">⌂</div><div><div class="brand-title">BHAVANINFO</div><div class="brand-subtitle">3D Cadastral &amp; Vertical Property Mapping</div></div><div class="header-status"><span class="status-indicator"></span><span>API services online</span></div></div>',
      '  </header>',
      '  <nav class="main-nav" aria-label="Primary navigation">',
      '    <button data-view="home" class="nav-btn is-active">Overview</button>',
      '    <button data-view="portfolio" class="nav-btn">Parcel Workspace</button>',
      '    <button data-view="map" class="nav-btn">2D / 3D Map</button>',
      '    <button data-view="twin" class="nav-btn">3D Twin</button>',
      '    <button data-view="official" class="nav-btn">Official Statistics</button>',
      '    <button data-view="identity" class="nav-btn">Identity Test</button>',
      '  </nav>',
      '  <main id="app-view" class="app-view"></main>',
      '  <footer class="app-footer"><span>BHAVANINFO is an independent prototype and is not a government portal.</span><span id="footer-source-state">Loading data…</span></footer>',
      '</div>'
    ].join('');
    return this.container.querySelector('#app-view');
  }

  bindGlobalEvents() {
    this.container.querySelectorAll('.nav-btn').forEach((button) => {
      button.addEventListener('click', () => this.switchView(button.dataset.view));
    });

    this.container.addEventListener('click', (event) => {
      const viewButton = event.target.closest('[data-action="view"]');
      if (viewButton) {
        const parcel = this.parcels.find((item) => item.ulpin === viewButton.dataset.ulpin);
        if (parcel) this.openTwin(parcel);
        return;
      }

      const mapButton = event.target.closest('[data-action="map"]');
      if (mapButton) {
        const parcel = this.parcels.find((item) => item.ulpin === mapButton.dataset.ulpin);
        if (parcel) this.locateParcel(parcel);
        return;
      }

      const cityButton = event.target.closest('[data-city]');
      if (cityButton) {
        const targets = {
          amritsar: { center: [74.8620, 31.6125], zoom: 16.5, pitch: 58, bearing: -24, name: 'Amritsar demo cadastre' },
          ludhiana: { center: [75.8450, 30.8950], zoom: 16.5, pitch: 58, bearing: -20, name: 'Ludhiana demo cadastre' },
          jalandhar: { center: [75.5650, 31.3150], zoom: 16.5, pitch: 58, bearing: -20, name: 'Jalandhar demo cadastre' },
          phagwara: { center: [75.7701, 31.2215], zoom: 16.5, pitch: 58, bearing: -18, name: 'Phagwara demo cadastre' }
        };
        this.switchView('map').then(() => setTimeout(() => this.map2d?.flyToLocation(targets[cityButton.dataset.city] || targets.amritsar), 120));
      }

      const filterButton = event.target.closest('[data-filter]');
      if (filterButton) this.map2d?.applyFilter(filterButton.dataset.filter);

      const baseButton = event.target.closest('[data-base]');
      if (baseButton) this.map2d?.setBaseLayer(baseButton.dataset.base);

      const twinAction = event.target.closest('[data-twin-action]');
      if (twinAction) this.handleTwinAction(twinAction.dataset.twinAction);
    });
  }

  teardownMap() {
    if (this.map2d?.resizeObserver) this.map2d.resizeObserver.disconnect();
    if (this.map2d?.map) this.map2d.map.remove();
    this.map2d = null;
  }

  teardownTwin() {
    if (this.twin3d) this.twin3d.destroy();
    this.twin3d = null;
  }

  async loadParcels() {
    const result = await fetchDemoParcels();
    this.parcels = result.data || [];
    const footer = this.container.querySelector('#footer-source-state');
    if (footer) footer.textContent = \`Demo layer: \${result.dataStatus} · \${this.parcels.length} prototype parcels\`;
  }

  async switchView(name) {
    if (this.view === 'map' && name !== 'map') this.teardownMap();
    if (this.view === 'twin' && name !== 'twin') this.teardownTwin();

    this.view = name;
    this.container.querySelectorAll('.nav-btn').forEach((button) => button.classList.toggle('is-active', button.dataset.view === name));

    if (name === 'home') this.renderHome();
    else if (name === 'portfolio') this.renderPortfolio();
    else if (name === 'map') this.renderMap();
    else if (name === 'twin') this.renderTwin();
    else if (name === 'official') await this.renderOfficial();
    else if (name === 'identity') this.renderIdentity();
  }

  renderHome() {
    const digitalized = this.parcels.filter((p) => p.status === 'DIGITALIZED').length;
    const flagged = this.parcels.filter((p) => p.status === 'FLAGGED_VIOLATION').length;
    const pending = this.parcels.filter((p) => p.status === 'PENDING_REGISTRATION').length;

    this.viewContainer.innerHTML = [
      '<section class="hero-panel"><div class="eyebrow">3D CADASTRAL · VERTICAL PROPERTY · GIS</div><h1>From parcel geometry to a navigable vertical property record.</h1><p>This working prototype connects an API-backed parcel layer to MapLibre and the protected Three.js digital-twin renderer. Official DILRMP statistics remain isolated from synthetic cadastral fixtures.</p>',
      '<div class="hero-actions"><button class="btn btn-primary" data-home="map">Open 2D / 3D Map</button><button class="btn btn-secondary" data-home="twin">Open 3D Twin</button><button class="btn btn-secondary" data-home="official">View official statistics</button></div>',
      '<div class="source-strip"><strong>DATA BOUNDARY</strong><span>Official: DILRMP programme snapshot</span><span>Demo: synthetic parcel/twin fixtures</span><span>Identity: UIDAI test fixture</span></div></section>',
      '<section class="metrics-grid">',
      this.metricCard('Prototype parcels', this.parcels.length, 'synthetic_demo'),
      this.metricCard('3D digitalized', digitalized, 'demo fixtures'),
      this.metricCard('Flagged demo', flagged, 'not a statutory finding'),
      this.metricCard('Pending survey', pending, 'demo workflow'),
      '</section>',
      '<section class="workspace-grid"><article class="panel"><div class="panel-heading"><div><div class="eyebrow">JURISDICTIONS</div><h2>Open a map extent</h2></div></div><div class="city-grid">',
      '<button class="city-card" data-city="amritsar"><strong>Amritsar</strong><span>Default prototype extent</span></button>',
      '<button class="city-card" data-city="ludhiana"><strong>Ludhiana</strong><span>Punjab prototype extent</span></button>',
      '<button class="city-card" data-city="jalandhar"><strong>Jalandhar</strong><span>Punjab prototype extent</span></button>',
      '<button class="city-card" data-city="phagwara"><strong>Phagwara</strong><span>Kapurthala prototype extent</span></button>',
      '</div></article><article class="panel"><div class="panel-heading"><div><div class="eyebrow">WORKING FEATURES</div><h2>What the prototype does</h2></div></div><div class="check-grid">',
      '<div><strong>✓ API-backed parcel layer</strong><span>Retrieve and search demo records.</span></div>',
      '<div><strong>✓ MapLibre 2D / 3D</strong><span>Satellite, street and extruded parcel views.</span></div>',
      '<div><strong>✓ Three.js digital twin</strong><span>Vertical floors and subterranean inspection.</span></div>',
      '<div><strong>✓ Boundary survey</strong><span>Draw a polygon and create a process-memory demo parcel.</span></div>',
      '</div></article></section>'
    ].join('');

    this.container.querySelectorAll('[data-home]').forEach((button) => {
      button.addEventListener('click', () => this.switchView(button.dataset.home));
    });
  }

  metricCard(label, value, meta) {
    return \`<article class="metric-card"><span class="metric-label">\${escapeHtml(label)}</span><strong class="metric-value">\${formatNumber(value)}</strong><span class="metric-meta">\${escapeHtml(meta)}</span></article>\`;
  }

  parcelRow(parcel) {
    const statusClass = parcel.status === 'FLAGGED_VIOLATION' ? 'danger' : parcel.status === 'PENDING_REGISTRATION' ? 'warning' : 'success';
    return [
      '<tr><td><code>', escapeHtml(parcel.ulpin), '</code></td><td>', escapeHtml(parcel.city), '</td><td>', escapeHtml(parcel.survey_no),
      '</td><td>', escapeHtml(parcel.owner), '</td><td><span class="status-pill ', statusClass, '">', escapeHtml(parcel.status),
      '</span></td><td class="row-actions"><button data-action="view" data-ulpin="', escapeHtml(parcel.ulpin),
      '">3D Twin</button><button data-action="map" data-ulpin="', escapeHtml(parcel.ulpin), '">Map</button></td></tr>'
    ].join('');
  }

  renderPortfolio() {
    this.viewContainer.innerHTML = [
      '<section class="page-title"><div><div class="eyebrow">PARCEL WORKSPACE</div><h1>Prototype cadastral register</h1><p>These records are synthetic fixtures used to exercise search, map, vertical-property and survey workflows. They are not official land records.</p></div><span class="data-badge synthetic">synthetic_demo</span></section>',
      '<section class="panel"><div class="toolbar"><label class="search-field"><span>⌕</span><input id="parcel-search" placeholder="Search ULPIN, owner, survey, city…" autocomplete="off"></label><button class="btn btn-secondary" id="btn-refresh-demo">Reload demo layer</button></div>',
      '<div class="table-wrap"><table><thead><tr><th>ULPIN</th><th>City</th><th>Survey</th><th>Owner</th><th>Status</th><th>Actions</th></tr></thead><tbody id="parcel-table-body">',
      this.parcels.map((parcel) => this.parcelRow(parcel)).join(''), '</tbody></table></div></section>',
      '<section class="panel survey-callout"><div class="panel-heading"><div><div class="eyebrow">SURVEY WORKFLOW</div><h2>Create a parcel from measured vertices</h2></div></div><p class="panel-copy">Open the map, draw a boundary and submit the captured geometry as a synthetic process-memory record.</p><button class="btn btn-primary" id="btn-start-survey">Start boundary survey</button></section>'
    ].join('');

    this.container.querySelector('#parcel-search').addEventListener('input', async (event) => {
      const q = event.target.value.trim();
      if (!q) {
        this.renderPortfolio();
        return;
      }
      try {
        const result = await searchDemoParcels(q);
        this.renderPortfolioRows(result.results || []);
        const input = this.container.querySelector('#parcel-search');
        if (input) { input.value = q; input.focus(); input.setSelectionRange(q.length, q.length); }
      } catch (error) {
        console.warn('Demo parcel search failed:', error);
      }
    });

    this.container.querySelector('#btn-refresh-demo').addEventListener('click', async () => {
      await this.loadParcels();
      this.renderPortfolio();
    });

    this.container.querySelector('#btn-start-survey').addEventListener('click', () => this.startBoundarySurvey());
  }

  renderPortfolioRows(parcels) {
    const body = this.container.querySelector('#parcel-table-body');
    if (!body) return;
    body.innerHTML = parcels.map((parcel) => this.parcelRow(parcel)).join('');
  }

  renderMap() {
    this.viewContainer.innerHTML = [
      '<section class="page-title"><div><div class="eyebrow">SPATIAL WORKSPACE</div><h1>2D cadastral map with 3D building extrusion</h1><p>Parcel features are synthetic demo records. External base imagery remains separately attributed by the map layer.</p></div><span class="data-badge synthetic">synthetic_demo</span></section>',
      '<section class="map-layout"><div class="map-card"><div class="map-toolbar">',
      '<div class="toolbar-group"><button class="toolbar-btn active" data-base="satellite">Satellite</button><button class="toolbar-btn" data-base="street">Street</button></div>',
      '<div class="toolbar-group"><button class="toolbar-btn" data-filter="all">All</button><button class="toolbar-btn" data-filter="digitalized">3D Twins</button><button class="toolbar-btn" data-filter="anomalies">Flagged</button><button class="toolbar-btn" data-filter="pending">Pending</button><button class="toolbar-btn" id="btn-map-survey">Draw Boundary</button></div>',
      '</div><div id="cadastre-map" class="map-viewport"></div><div id="map-hover-hud" class="map-hover-hud"></div><div id="map-toast" class="map-toast"></div><div id="map-zoom-badge" class="map-zoom-badge"></div>',
      '<div id="cadastral-picker-hud" class="picker-hud"><strong>Boundary survey mode</strong><span id="picker-dot-counter">0 vertices</span><span id="picker-area-counter">Area 0 sq.ft</span><div><button id="btn-picker-undo" class="toolbar-btn">Undo</button><button id="btn-picker-finish" class="toolbar-btn">Finish</button><button id="btn-picker-cancel" class="toolbar-btn">Cancel</button></div></div>',
      '</div><aside class="side-panel"><div class="panel-heading"><div><div class="eyebrow">NAVIGATION</div><h2>Punjab demo extents</h2></div></div><div class="city-list">',
      '<button class="city-list-btn" data-city="amritsar">Amritsar</button><button class="city-list-btn" data-city="ludhiana">Ludhiana</button><button class="city-list-btn" data-city="jalandhar">Jalandhar</button><button class="city-list-btn" data-city="phagwara">Phagwara</button></div>',
      '<div class="panel-heading"><div><div class="eyebrow">SELECTED PARCEL</div><h2 id="map-selection-title">Click a 3D footprint</h2></div></div><div id="map-selection-details" class="selection-details">No parcel selected.</div></aside></section>'
    ].join('');

    this.container.querySelector('#btn-map-survey').addEventListener('click', () => this.startBoundarySurvey());

    if (!this.map2d) {
      this.map2d = new CadastreMap2D('cadastre-map', this.parcels, (parcel) => {
        this.activeParcel = parcel;
        this.updateMapSelection(parcel);
        this.openTwin(parcel);
      });
      this.map2d.init();
    } else {
      this.map2d.parcels = this.parcels;
      this.map2d.invalidateSize();
    }
  }

  updateMapSelection(parcel) {
    const title = this.container.querySelector('#map-selection-title');
    const detail = this.container.querySelector('#map-selection-details');
    if (!title || !detail) return;
    title.textContent = parcel.ulpin || 'Selected parcel';
    detail.innerHTML = [
      '<div><strong>City</strong><span>', escapeHtml(parcel.city || '—'), '</span></div>',
      '<div><strong>Survey</strong><span>', escapeHtml(parcel.survey_no || '—'), '</span></div>',
      '<div><strong>Status</strong><span>', escapeHtml(parcel.status || '—'), '</span></div>',
      '<div><strong>Floors</strong><span>', escapeHtml(parcel.total_floors || 0), '</span></div>',
      '<div><strong>Data</strong><span class="data-badge synthetic">synthetic_demo</span></div>'
    ].join('');
  }

  renderTwin() {
    const parcel = this.activeParcel || this.parcels[0];
    if (!parcel) {
      this.viewContainer.innerHTML = '<section class="error-state"><h1>No parcel loaded</h1><p>Load the demo parcel layer first.</p></section>';
      return;
    }

    this.viewContainer.innerHTML = [
      '<section class="page-title"><div><div class="eyebrow">VERTICAL PROPERTY INSPECTOR</div><h1>3D Digital Twin</h1><p>The Three.js renderer is protected. The application normalizes data before passing it into the existing renderer. Current record is synthetic demo data.</p></div><span class="data-badge synthetic">synthetic_demo</span></section>',
      '<section class="twin-layout"><div class="twin-card"><div id="twin-viewport" class="twin-viewport"></div>',
      '<div id="twin-pending-survey-overlay" class="twin-overlay" style="display:none"><strong id="pending-survey-title"></strong><span id="pending-survey-desc"></span><div class="pending-grid"><span>ULPIN<strong id="pending-ulpin-val"></strong></span><span>Survey<strong id="pending-khasra-val"></strong></span><span>Floors<strong id="pending-floors-val"></strong></span><span>Area<strong id="pending-area-val"></strong></span></div><button id="btn-trigger-drone-sim" class="btn btn-primary">Run demo survey simulation</button></div>',
      '<div id="sub-ulpin-hover-tag" class="sub-ulpin-tag"></div></div>',
      '<aside class="side-panel twin-sidebar"><div class="panel-heading"><div><div class="eyebrow">INSPECTION CONTROLS</div><h2 id="twin-parcel-title"></h2></div></div>',
      '<div id="twin-parcel-meta" class="selection-details"></div><div class="control-stack">',
      '<button class="toolbar-btn" data-twin-action="zoomIn">Zoom in</button><button class="toolbar-btn" data-twin-action="zoomOut">Zoom out</button><button class="toolbar-btn" data-twin-action="reset">Reset camera</button>',
      '<button class="toolbar-btn" data-twin-action="textured">Textured</button><button class="toolbar-btn" data-twin-action="blueprint">Blueprint</button>',
      '<button class="toolbar-btn" data-twin-action="explode">Explode floors</button><button class="toolbar-btn" data-twin-action="subterranean">Subterranean</button></div>',
      '<div class="panel-heading"><div><div class="eyebrow">VERTICAL REGISTER</div><h2>Levels</h2></div></div><div id="twin-level-list" class="level-list"></div></aside></section>'
    ].join('');

    this.ensureTwin(parcel);

    const droneButton = this.container.querySelector('#btn-trigger-drone-sim');
    if (droneButton) droneButton.addEventListener('click', () => this.twin3d?.executeDroneScanSimulation());
  }

  ensureTwin(parcel) {
    this.activeParcel = parcel;

    const title = this.container.querySelector('#twin-parcel-title');
    if (title) title.textContent = parcel.ulpin;

    const meta = this.container.querySelector('#twin-parcel-meta');
    if (meta) {
      meta.innerHTML = [
        '<div><strong>Location</strong><span>', escapeHtml(parcel.city), ', Punjab</span></div>',
        '<div><strong>Survey</strong><span>', escapeHtml(parcel.survey_no), '</span></div>',
        '<div><strong>Status</strong><span>', escapeHtml(parcel.status), '</span></div>',
        '<div><strong>Source</strong><span class="data-badge synthetic">synthetic_demo</span></div>'
      ].join('');
    }

    const levelList = this.container.querySelector('#twin-level-list');
    const levels = Array.isArray(parcel.levels) ? parcel.levels : [];
    if (levelList) {
      levelList.innerHTML = levels.length
        ? levels.map((level) =>
            \`<button class="level-row \${level.is_flagged ? 'flagged' : ''}" data-level="\${escapeHtml(level.level_code)}"><span>\${escapeHtml(level.level_code)}</span><span>\${escapeHtml(level.name)}</span></button>\`
          ).join('')
        : '<div class="empty-state">Pending parcel — no vertical register yet.</div>';

      levelList.querySelectorAll('[data-level]').forEach((button) => {
        button.addEventListener('click', () => this.twin3d?.selectLevel(button.dataset.level));
      });
    }

    this.twin3d = new DigitalTwin3D('twin-viewport', (levelData) => {
      this.container.querySelectorAll('.level-row').forEach((button) =>
        button.classList.toggle('selected', button.dataset.level === levelData.level_code)
      );
    });
    this.twin3d.init();

    setTimeout(() => {
      if (this.twin3d) {
        this.twin3d.loadParcel(makeRendererParcel(parcel));
        this.twin3d.onResize();
      }
    }, 50);
  }

  openTwin(parcel) {
    if (!parcel) return;
    this.activeParcel = parcel;
    this.switchView('twin');
  }

  locateParcel(parcel) {
    this.activeParcel = parcel;
    this.switchView('map').then(() => setTimeout(() => this.map2d?.flyToParcel(parcel), 140));
  }

  handleTwinAction(action) {
    if (!this.twin3d) return;
    if (action === 'zoomIn') this.twin3d.zoomIn(1.3);
    if (action === 'zoomOut') this.twin3d.zoomOut(1.3);
    if (action === 'reset') this.twin3d.resetCamera();
    if (action === 'textured') this.twin3d.setViewMode('textured');
    if (action === 'blueprint') this.twin3d.setViewMode('blueprint');
    if (action === 'explode') this.twin3d.setExplodeFactor(this.twin3d.explodeFactor > 0 ? 0 : 0.65);
    if (action === 'subterranean') this.twin3d.setSubterraneanMode(!this.twin3d.subterraneanMode);
  }

  startBoundarySurvey() {
    this.switchView('map').then(() => {
      setTimeout(() => this.map2d?.startCadastralPicker('draw', (result) => this.openSurveyRegistration(result)), 150);
    });
  }

  openSurveyRegistration(result) {
    const modal = this.container.querySelector('#survey-modal');
    const form = this.container.querySelector('#survey-form');
    if (!modal || !form) return;

    form.elements.coordinates.value = JSON.stringify(result.coordinates);
    form.elements.area_sqft.value = String(Math.round(result.area_sqft));
    form.elements.area_sqyd.value = String(Math.round(result.area_sqyd));
    form.elements.centroid.value = JSON.stringify(result.centroid);
    modal.classList.add('is-open');
  }

  async submitSurvey(event) {
    event.preventDefault();
    const form = event.currentTarget;

    try {
      const data = new FormData(form);
      const created = await createDemoParcel({
        owner: data.get('owner'),
        survey_no: data.get('survey_no'),
        city: data.get('city'),
        district: data.get('district'),
        tehsil: data.get('tehsil'),
        village: data.get('village'),
        declared_floors: Number(data.get('declared_floors') || 0),
        coordinates: JSON.parse(data.get('coordinates')),
        centroid: JSON.parse(data.get('centroid')),
        area_sqft: Number(data.get('area_sqft')),
        area_sqyd: Number(data.get('area_sqyd'))
      });

      this.parcels.push(created.data);
      this.activeParcel = created.data;
      this.container.querySelector('#survey-modal')?.classList.remove('is-open');

      if (this.map2d?.map) this.map2d.addNewBuildingToMap(created.data);
      this.openTwin(created.data);
    } catch (error) {
      alert(error.message || 'Survey registration failed');
    }
  }

  renderOfficialError(error) {
    this.viewContainer.innerHTML = '<section class="error-state"><h1>Official data unavailable</h1><p>' + escapeHtml(error.message) + '</p><button class="btn btn-secondary" id="retry-official">Retry</button></section>';
    this.container.querySelector('#retry-official')?.addEventListener('click', () => this.switchView('official'));
  }

  async renderOfficial() {
    this.viewContainer.innerHTML = '<div class="loading-state">Loading official DILRMP programme snapshot…</div>';
    try {
      this.dashboard = await fetchDashboardSummary();
      const dashboard = this.dashboard.dashboard;
      const state = dashboard.state;
      const rows = dashboard.focusDistricts.map((district) => [
        '<tr><td><strong>', escapeHtml(district.district), '</strong></td><td>', formatNumber(district.totalLandParcels),
        '</td><td>', formatNumber(district.geoReferencedLandParcels), ' (', formatPercent(district.geoReferencedCoveragePct),
        ')</td><td>', formatNumber(district.ulpinImplemented), ' (', formatPercent(district.ulpinCoveragePct), ')</td></tr>'
      ].join('')).join('');

      this.viewContainer.innerHTML = [
        '<section class="page-title"><div><div class="eyebrow">OFFICIAL DATA WORKSPACE</div><h1>Punjab DILRMP programme statistics</h1><p>These figures describe programme-level implementation and are not individual land records.</p></div><span class="data-badge official">authoritative snapshot</span></section>',
        '<section class="metrics-grid">', this.metricCard('Land parcels', state.totalLandParcels, 'Punjab'), this.metricCard('Geo-referenced', state.geoReferencedLandParcels, formatPercent(state.geoReferencedCoveragePct)), this.metricCard('ULPIN implemented', state.ulpinImplemented, formatPercent(state.ulpinCoveragePct)), this.metricCard('ULPIN + SVAMITVA', state.totalUlpinAndSvamitva, 'published programme total'), '</section>',
        '<section class="workspace-grid"><article class="panel"><div class="panel-heading"><div><div class="eyebrow">FOCUS DISTRICTS</div><h2>Selected Punjab districts</h2></div></div><div class="table-wrap"><table><thead><tr><th>District</th><th>Parcels</th><th>Geo-referenced</th><th>ULPIN</th></tr></thead><tbody>',
        rows, '</tbody></table></div></article><article class="panel"><div class="panel-heading"><div><div class="eyebrow">PROVENANCE</div><h2>Source registry</h2></div></div><div class="source-list">',
        '<div><strong>Organisation</strong><span>', escapeHtml(dashboard.source.sourceOrganization), '</span></div>',
        '<div><strong>Source</strong><a href="', escapeHtml(dashboard.source.sourceUrl), '" target="_blank" rel="noreferrer">DILRMP Punjab status</a></div>',
        '<div><strong>Retrieved</strong><span>', escapeHtml(new Date(dashboard.source.retrievedAt).toLocaleString('en-IN')), '</span></div>',
        '</div><div class="notice-box">Official programme statistics are kept separate from the synthetic parcel/map/twin layer.</div></article></section>'
      ].join('');
    } catch (error) {
      this.renderOfficialError(error);
    }
  }

  renderIdentity() {
    this.viewContainer.innerHTML = [
      '<section class="page-title"><div><div class="eyebrow">IDENTITY</div><h1>UIDAI test-data verification</h1><p>Deterministic UIDAI-published test fixture. Not production Aadhaar authentication and not proof of land ownership.</p></div><span class="data-badge test">uidai_test</span></section>',
      '<section class="identity-layout"><article class="panel identity-panel"><div class="panel-heading"><div><div class="eyebrow">TEST FIXTURE</div><h2>Verify identity</h2></div></div>',
      '<form id="auth-form" class="auth-form"><label>UIDAI test identifier<input name="aadhaar" inputmode="numeric" required placeholder="999999990019"></label>',
      '<label>Name<input name="name" required placeholder="Shivshankar Choudhury"></label><button class="btn btn-primary" type="submit">Verify test identity</button>',
      '<p id="auth-status" class="form-status" role="status"></p></form></article>',
      '<article class="panel"><div class="panel-heading"><div><div class="eyebrow">AUTHORIZATION BOUNDARY</div><h2>Identity is not ownership</h2></div></div><div class="check-grid">',
      '<div><strong>Identity claim</strong><span>Checked against the configured UIDAI test fixture.</span></div><div><strong>Authorization</strong><span>Handled separately by application roles.</span></div><div><strong>Land ownership</strong><span>Not established by this flow.</span></div><div><strong>Production mode</strong><span>Requires authorized UIDAI sandbox configuration.</span></div>',
      '</div></article></section>'
    ].join('');

    this.container.querySelector('#auth-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const status = this.container.querySelector('#auth-status');
      status.textContent = 'Verifying…';
      status.className = 'form-status';

      try {
        const data = new FormData(form);
        const result = await verifyAadhaar({ aadhaar: data.get('aadhaar'), name: data.get('name') });
        status.textContent = 'Verified: ' + result.identity.displayName + ' · ' + authProviderLabel(result.authentication.provider);
        status.classList.add('success');
      } catch (error) {
        status.textContent = error.payload?.reason || error.message || 'Verification failed';
        status.classList.add('error');
      }
    });
  }

  renderSurveyModal() {
    this.container.insertAdjacentHTML('beforeend', [
      '<div id="survey-modal" class="modal-backdrop"><section class="modal-card"><div class="modal-header"><div><div class="eyebrow">DEMO REGISTRATION</div><h2>Create process-memory parcel</h2></div><button id="survey-close" class="modal-close" type="button" aria-label="Close">×</button></div>',
      '<p class="panel-copy">Captured geometry is stored in the running API process only. It is a synthetic demonstration record and is not written to a government registry.</p>',
      '<form id="survey-form" class="auth-form"><label>Owner / applicant<input name="owner" required value="Demo Applicant"></label>',
      '<label>Survey reference<input name="survey_no" required value="Prototype Survey Area"></label>',
      '<div class="form-grid"><label>City<input name="city" required value="Amritsar"></label><label>District<input name="district" required value="Amritsar"></label><label>Tehsil<input name="tehsil" required value="Amritsar-I"></label><label>Village<input name="village" required value="Demo Cadastre Sector"></label></div>',
      '<label>Declared floors<input name="declared_floors" type="number" min="0" max="50" value="2"></label>',
      '<input type="hidden" name="coordinates"><input type="hidden" name="centroid"><input type="hidden" name="area_sqft"><input type="hidden" name="area_sqyd">',
      '<div class="modal-actions"><button type="button" id="survey-cancel" class="btn btn-secondary">Cancel</button><button class="btn btn-primary" type="submit">Create demo parcel</button></div></form></section></div>'
    ].join(''));

    this.container.querySelector('#survey-close').addEventListener('click', () => this.container.querySelector('#survey-modal')?.classList.remove('is-open'));
    this.container.querySelector('#survey-cancel').addEventListener('click', () => this.container.querySelector('#survey-modal')?.classList.remove('is-open'));
    this.container.querySelector('#survey-form').addEventListener('submit', (event) => this.submitSurvey(event));
  }
}

const root = document.getElementById('app');
const app = new PrototypeApp(root);
window.app = app;
app.init().catch((error) => {
  root.innerHTML = '<section class="error-state"><h1>BHAVANINFO failed to start</h1><p>' + escapeHtml(error.message) + '</p><p>Start the API with <code>npm run dev:api</code> and reload.</p></section>';
});
