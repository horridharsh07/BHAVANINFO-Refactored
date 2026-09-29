const fs = require('fs');

console.log('🔧 Implementing Interactive Map in Step 1 (Choose Building/Plot from Map)...');

let appJs = fs.readFileSync('src/app.js', 'utf8');

// Replace renderScanStep1 and selectScanPlot with interactive MapLibre map implementation
const oldStep1Regex = /renderScanStep1\(\) \{[\s\S]*?selectScanPlot\(khasra, locality, ulpin, area_sqyd, lat, lng\) \{[\s\S]*?\}\s*\}/;

const newStep1Code = `renderScanStep1() {
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
\t\t\t\t\t<h2 class="scan-phase-title">Choose Building or Plot on Map</h2>
\t\t\t\t\t<p class="scan-phase-desc">Click directly on any building footprint or plot on the cadastral map below to select it for registration:</p>
\t\t\t\t</div>

\t\t\t\t<!-- Interactive Cadastral Map Container -->
\t\t\t\t<div style="position: relative; width: 100%; height: 420px; border-radius: 8px; overflow: hidden; border: 1.5px solid #cbd5e1; box-shadow: 0 4px 14px rgba(0,0,0,0.12); margin-bottom: 14px;">
\t\t\t\t\t<div id="scan-step1-map" style="width: 100%; height: 100%; background: #0f172a;"></div>

\t\t\t\t\t<!-- Floating Tip Overlay -->
\t\t\t\t\t<div style="position: absolute; top: 12px; left: 12px; z-index: 10; background: rgba(0,39,77,0.88); backdrop-filter: blur(6px); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; border: 1px solid #38bdf8; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
\t\t\t\t\t\t<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></span>
\t\t\t\t\t\t<span>Click any building or plot on the map to select</span>
\t\t\t\t\t</div>

\t\t\t\t\t<!-- Map Quick-Select Plot Chips -->
\t\t\t\t\t<div style="position: absolute; bottom: 12px; left: 12px; right: 12px; z-index: 10; display: flex; gap: 8px; flex-wrap: wrap; background: rgba(15,23,42,0.85); backdrop-filter: blur(8px); padding: 8px 12px; border-radius: 8px; border: 1px solid #334155;">
\t\t\t\t\t\t<span style="font-size: 0.74rem; color: #94a3b8; font-weight: 700; display: flex; align-items: center; margin-right: 4px;">Jump to Plot:</span>
\t\t\t\t\t\t\${samplePlots.map(p => \`
\t\t\t\t\t\t\t<button type="button" onclick="window.app.jumpToScanPlot('\${p.khasra}', '\${p.locality}', '\${p.ulpin}', \${p.area_sqyd}, \${p.lat}, \${p.lng})" style="padding: 4px 10px; font-size: 0.75rem; background: #1e293b; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.15s ease;">
\t\t\t\t\t\t\t\t<span>\${p.khasra}</span>
\t\t\t\t\t\t\t\t<span style="color: #94a3b8; font-size: 0.68rem;">(\${p.area_sqyd} sq.yd)</span>
\t\t\t\t\t\t\t</button>
\t\t\t\t\t\t\`).join('')}
\t\t\t\t\t</div>
\t\t\t\t</div>

\t\t\t\t<!-- Selected Plot Details Banner -->
\t\t\t\t<div id="scan-selected-plot-card" style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
\t\t\t\t\t<div>
\t\t\t\t\t\t<div style="font-size: 0.74rem; font-weight: 700; color: #15803d; text-transform: uppercase;">Selected from Cadastral Map:</div>
\t\t\t\t\t\t<div id="scan-selected-plot-title" style="font-size: 0.98rem; font-weight: 700; color: #0f172a; margin-top: 2px;">\${this.scanState.chosenPlot.khasra} &bull; \${this.scanState.chosenPlot.locality}</div>
\t\t\t\t\t\t<div id="scan-selected-plot-sub" style="font-size: 0.76rem; color: #64748b; margin-top: 2px;">ULPIN: <span style="font-family: monospace; color: #0284c7; font-weight: 700;">\${this.scanState.chosenPlot.ulpin}</span> &bull; Centroid: <span style="font-family: monospace;">\${this.scanState.chosenPlot.lat}&deg;N, \${this.scanState.chosenPlot.lng}&deg;E</span></div>
\t\t\t\t\t</div>
\t\t\t\t\t<div style="text-align: right;">
\t\t\t\t\t\t<div id="scan-selected-plot-area" style="font-size: 1.15rem; font-weight: 800; color: #166534;">\${this.scanState.chosenPlot.area_sqyd} sq.yd</div>
\t\t\t\t\t\t<div id="scan-selected-plot-sqft" style="font-size: 0.74rem; color: #64748b;">\${this.scanState.chosenPlot.area_sqft} sq.ft</div>
\t\t\t\t\t</div>
\t\t\t\t</div>

\t\t\t\t<div class="scan-actions">
\t\t\t\t\t<button type="button" class="btn-scan-secondary" onclick="window.app.openRegisterModal()">&larr; Back to Registration Form</button>
\t\t\t\t\t<button type="button" class="btn-scan-primary" id="btn-confirm-plot-step1" onclick="window.app.renderScanStep2()">
\t\t\t\t\t\tProceed to Step 2: 6 Boundary Points &rarr;
\t\t\t\t\t</button>
\t\t\t\t</div>
\t\t\t</div>
\t\t\`;

\t\t// Initialize the interactive MapLibre map on the next tick
\t\tsetTimeout(() => {
\t\t\tthis.initScanStep1Map();
\t\t}, 50);
\t}

\tinitScanStep1Map() {
\t\tconst container = document.getElementById('scan-step1-map');
\t\tif (!container) return;

\t\tif (this.scanStep1Map) {
\t\t\ttry { this.scanStep1Map.remove(); } catch(e) {}
\t\t\tthis.scanStep1Map = null;
\t\t}

\t\tconst center = [this.scanState.chosenPlot.lng || 74.86235, this.scanState.chosenPlot.lat || 31.61285];

\t\ttry {
\t\t\tif (typeof maplibregl !== 'undefined') {
\t\t\t\tconst map = new maplibregl.Map({
\t\t\t\t\tcontainer: 'scan-step1-map',
\t\t\t\t\tstyle: {
\t\t\t\t\t\tversion: 8,
\t\t\t\t\t\tsources: {
\t\t\t\t\t\t\t'esri-satellite': {
\t\t\t\t\t\t\t\ttype: 'raster',
\t\t\t\t\t\t\t\ttiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
\t\t\t\t\t\t\t\ttileSize: 256,
\t\t\t\t\t\t\t\tmaxzoom: 18
\t\t\t\t\t\t\t}
\t\t\t\t\t\t},
\t\t\t\t\t\tlayers: [
\t\t\t\t\t\t\t{ id: 'sat-bg', type: 'raster', source: 'esri-satellite' }
\t\t\t\t\t\t]
\t\t\t\t\t},
\t\t\t\t\tcenter: center,
\t\t\t\t\tzoom: 17,
\t\t\t\t\tpitch: 25
\t\t\t\t});

\t\t\t\tthis.scanStep1Map = map;

\t\t\t\tmap.on('load', () => {
\t\t\t\t\t// Create GeoJSON features from all parcels
\t\t\t\t\tconst parcels = (this.allParcels && this.allParcels.length > 0) ? this.allParcels : [
\t\t\t\t\t\t{ id: 'p1', ulpin: 'BCN501G6OF8R50', survey_no: 'Khasra No. 429/1', village: 'Kot Atma Singh / Heritage Cadastre Zone', area_sqyd: 385, centroid: [31.61285, 74.86235], coordinates: [[74.8621,31.6124],[74.8625,31.6123],[74.8628,31.6126],[74.8627,31.6129],[74.8623,31.6130],[74.8620,31.6127],[74.8621,31.6124]] },
\t\t\t\t\t\t{ id: 'p2', ulpin: 'BCN501B1NA2CH0', survey_no: 'Khasra No. 412/1', village: 'Heritage Cadastre Zone / Urban Amritsar-I', area_sqyd: 350, centroid: [31.61034, 74.85998], coordinates: [[74.8597,31.6105],[74.8596,31.6103],[74.8600,31.6102],[74.8602,31.6104],[74.8597,31.6105]] },
\t\t\t\t\t\t{ id: 'p3', ulpin: 'BCN501C2KB4M10', survey_no: 'Khasra No. 518/3', village: 'Mall Road Commercial Cadastre Division', area_sqyd: 580, centroid: [31.62145, 74.87120], coordinates: [[74.8709,31.6212],[74.8716,31.6212],[74.8716,31.6217],[74.8709,31.6217],[74.8709,31.6212]] }
\t\t\t\t\t];

\t\t\t\t\tconst features = parcels.slice(0, 500).map(p => {
\t\t\t\t\t\tlet coords = p.coordinates;
\t\t\t\t\t\tif (!coords || coords.length < 3) {
\t\t\t\t\t\t\tconst lat = p.centroid ? p.centroid[0] : 31.61285;
\t\t\t\t\t\t\tconst lng = p.centroid ? p.centroid[1] : 74.86235;
\t\t\t\t\t\t\tcoords = [
\t\t\t\t\t\t\t\t[lng - 0.0002, lat - 0.00015],
\t\t\t\t\t\t\t\t[lng + 0.0002, lat - 0.00015],
\t\t\t\t\t\t\t\t[lng + 0.0002, lat + 0.00015],
\t\t\t\t\t\t\t\t[lng - 0.0002, lat + 0.00015],
\t\t\t\t\t\t\t\t[lng - 0.0002, lat - 0.00015]
\t\t\t\t\t\t\t];
\t\t\t\t\t\t} else if (coords[0] && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
\t\t\t\t\t\t\tcoords = [...coords, coords[0]];
\t\t\t\t\t\t}
\t\t\t\t\t\treturn {
\t\t\t\t\t\t\ttype: 'Feature',
\t\t\t\t\t\t\tproperties: {
\t\t\t\t\t\t\t\tid: p.id,
\t\t\t\t\t\t\t\tulpin: p.ulpin,
\t\t\t\t\t\t\t\tkhasra: p.survey_no || p.khasra || 'Khasra No.',
\t\t\t\t\t\t\t\tlocality: p.village || 'Heritage Cadastre Zone',
\t\t\t\t\t\t\t\tarea_sqyd: p.area_sqyd || 350,
\t\t\t\t\t\t\t\tcentroid_lat: p.centroid ? p.centroid[0] : (coords[0] ? coords[0][1] : 31.61285),
\t\t\t\t\t\t\t\tcentroid_lng: p.centroid ? p.centroid[1] : (coords[0] ? coords[0][0] : 74.86235)
\t\t\t\t\t\t\t},
\t\t\t\t\t\t\tgeometry: {
\t\t\t\t\t\t\t\ttype: 'Polygon',
\t\t\t\t\t\t\t\tcoordinates: [coords]
\t\t\t\t\t\t\t}
\t\t\t\t\t\t};
\t\t\t\t\t});

\t\t\t\t\tmap.addSource('scan-parcels', {
\t\t\t\t\t\ttype: 'geojson',
\t\t\t\t\t\tdata: { type: 'FeatureCollection', features }
\t\t\t\t\t});

\t\t\t\t\t// Parcel Fill
\t\t\t\t\tmap.addLayer({
\t\t\t\t\t\tid: 'scan-parcels-fill',
\t\t\t\t\t\ttype: 'fill',
\t\t\t\t\t\tsource: 'scan-parcels',
\t\t\t\t\t\tpaint: {
\t\t\t\t\t\t\t'fill-color': '#0284c7',
\t\t\t\t\t\t\t'fill-opacity': 0.4
\t\t\t\t\t\t}
\t\t\t\t\t});

\t\t\t\t\t// Parcel Line
\t\t\t\t\tmap.addLayer({
\t\t\t\t\t\tid: 'scan-parcels-line',
\t\t\t\t\t\ttype: 'line',
\t\t\t\t\t\tsource: 'scan-parcels',
\t\t\t\t\t\tpaint: {
\t\t\t\t\t\t\t'line-color': '#38bdf8',
\t\t\t\t\t\t\t'line-width': 1.5
\t\t\t\t\t\t}
\t\t\t\t\t});

\t\t\t\t\t// Selection Highlight Layer
\t\t\t\t\tmap.addLayer({
\t\t\t\t\t\tid: 'scan-parcel-selected-fill',
\t\t\t\t\t\ttype: 'fill',
\t\t\t\t\t\tsource: 'scan-parcels',
\t\t\t\t\t\tfilter: ['==', 'ulpin', this.scanState.chosenPlot.ulpin || ''],
\t\t\t\t\t\tpaint: {
\t\t\t\t\t\t\t'fill-color': '#16a34a',
\t\t\t\t\t\t\t'fill-opacity': 0.75
\t\t\t\t\t\t}
\t\t\t\t\t});

\t\t\t\t\tmap.addLayer({
\t\t\t\t\t\tid: 'scan-parcel-selected-line',
\t\t\t\t\t\ttype: 'line',
\t\t\t\t\t\tsource: 'scan-parcels',
\t\t\t\t\t\tfilter: ['==', 'ulpin', this.scanState.chosenPlot.ulpin || ''],
\t\t\t\t\t\tpaint: {
\t\t\t\t\t\t\t'line-color': '#22c55e',
\t\t\t\t\t\t\t'line-width': 3.5
\t\t\t\t\t\t}
\t\t\t\t\t});

\t\t\t\t\t// Pointer cursor
\t\t\t\t\tmap.on('mouseenter', 'scan-parcels-fill', () => {
\t\t\t\t\t\tmap.getCanvas().style.cursor = 'pointer';
\t\t\t\t\t});
\t\t\t\t\tmap.on('mouseleave', 'scan-parcels-fill', () => {
\t\t\t\t\t\tmap.getCanvas().style.cursor = '';
\t\t\t\t\t});

\t\t\t\t\t// Click building footprint on map
\t\t\t\t\tmap.on('click', 'scan-parcels-fill', (e) => {
\t\t\t\t\t\tif (e.features && e.features[0]) {
\t\t\t\t\t\t\tconst props = e.features[0].properties;
\t\t\t\t\t\t\tthis.selectScanPlot(
\t\t\t\t\t\t\t\tprops.khasra,
\t\t\t\t\t\t\t\tprops.locality,
\t\t\t\t\t\t\t\tprops.ulpin,
\t\t\t\t\t\t\t\tprops.area_sqyd,
\t\t\t\t\t\t\t\tprops.centroid_lat,
\t\t\t\t\t\t\t\tprops.centroid_lng
\t\t\t\t\t\t\t);
\t\t\t\t\t\t\tmap.setFilter('scan-parcel-selected-fill', ['==', 'ulpin', props.ulpin]);
\t\t\t\t\t\t\tmap.setFilter('scan-parcel-selected-line', ['==', 'ulpin', props.ulpin]);
\t\t\t\t\t\t\tmap.flyTo({ center: [props.centroid_lng, props.centroid_lat], zoom: 17.5, duration: 800 });
\t\t\t\t\t\t}
\t\t\t\t\t});

\t\t\t\t\t// Click outside existing parcel -> create custom plot
\t\t\t\t\tmap.on('click', (e) => {
\t\t\t\t\t\tconst feats = map.queryRenderedFeatures(e.point, { layers: ['scan-parcels-fill'] });
\t\t\t\t\t\tif (!feats || feats.length === 0) {
\t\t\t\t\t\t\tconst lat = parseFloat(e.lngLat.lat.toFixed(5));
\t\t\t\t\t\t\tconst lng = parseFloat(e.lngLat.lng.toFixed(5));
\t\t\t\t\t\t\tconst customKhasra = \`Plot @ (\${lat}, \${lng})\`;
\t\t\t\t\t\t\tthis.selectScanPlot(customKhasra, 'Amritsar Cadastre Division', 'PB-CUSTOM-PLOT', 380, lat, lng);
\t\t\t\t\t\t\tmap.flyTo({ center: [lng, lat], zoom: 17.5, duration: 600 });
\t\t\t\t\t\t}
\t\t\t\t\t});

\t\t\t\t\tsetTimeout(() => map.resize(), 150);
\t\t\t\t\tsetTimeout(() => map.resize(), 400);
\t\t\t\t});
\t\t\t}
\t\t} catch(err) {
\t\t\tconsole.warn('MapLibre init error in scan step 1:', err);
\t\t}
\t}

\tjumpToScanPlot(khasra, locality, ulpin, area_sqyd, lat, lng) {
\t\tthis.selectScanPlot(khasra, locality, ulpin, area_sqyd, lat, lng);
\t\tif (this.scanStep1Map) {
\t\t\ttry {
\t\t\t\tthis.scanStep1Map.setFilter('scan-parcel-selected-fill', ['==', 'ulpin', ulpin]);
\t\t\t\tthis.scanStep1Map.setFilter('scan-parcel-selected-line', ['==', 'ulpin', ulpin]);
\t\t\t\tthis.scanStep1Map.flyTo({ center: [lng, lat], zoom: 17.5, duration: 800 });
\t\t\t} catch(e) {}
\t\t}
\t}

\tselectScanPlot(khasra, locality, ulpin, area_sqyd, lat, lng) {
\t\tthis.scanState.chosenPlot = { khasra, locality, ulpin, area_sqyd, area_sqft: area_sqyd * 9, lat, lng };
\t\tconst titleEl = document.getElementById('scan-selected-plot-title');
\t\tconst subEl = document.getElementById('scan-selected-plot-sub');
\t\tconst areaEl = document.getElementById('scan-selected-plot-area');
\t\tconst sqftEl = document.getElementById('scan-selected-plot-sqft');

\t\tif (titleEl) titleEl.innerHTML = \`\${khasra} &bull; \${locality}\`;
\t\tif (subEl) subEl.innerHTML = \`ULPIN: <span style="font-family: monospace; color: #0284c7; font-weight: 700;">\${ulpin}</span> &bull; Centroid: <span style="font-family: monospace;">\${lat}&deg;N, \${lng}&deg;E</span>\`;
\t\tif (areaEl) areaEl.textContent = \`\${area_sqyd} sq.yd\`;
\t\tif (sqftEl) sqftEl.textContent = \`\${area_sqyd * 9} sq.ft\`;
\t}`;

appJs = appJs.replace(oldStep1Regex, newStep1Code);

// Bump cache buster
appJs = appJs.replace(/v20260926_clean_nav_and_scan_\d+/, `v20260926_map_step1_${Date.now()}`);

fs.writeFileSync('src/app.js', appJs, 'utf8');
console.log('✓ src/app.js updated with interactive Map in Step 1');
