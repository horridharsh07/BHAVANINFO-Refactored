const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const marker = '<!-- Slide 2: 3D Cadastral Mapping & Drone LiDAR SLAM -->';

const insertBlock = `<!-- Unified Sleek Government Navigation & Brand Bar (Strictly Hidden on Landing Page; Shown once redirected/logged in) -->
	<nav class="gov-nav" style="display: none;">
		<div class="gov-nav-brand" onclick="window.app && window.app.switchView('landing')" title="BHAVANINFO • Cadastre Home" style="cursor: pointer;">
			<span class="gov-nav-emblem"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v2h20V7L12 2zm-8 8v9h2v-9H4zm5 0v9h2v-9H9zm5 0v9h2v-9h-2zm5 0v9h2v-9h-2zM2 20v2h20v-2H2z"/></svg></span>
			<div class="gov-nav-brand-text">
				<span class="gov-nav-title">BHAVANINFO</span>
				<span class="header-domain-pill">bhavaninfo.gov.in</span>
			</div>
		</div>

		<ul class="nav-links">
			<li class="nav-item active" data-view="landing" id="tour-nav-landing">
				<span class="nav-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></span>
				<span class="nav-label">Home</span>
			</li>
			<li class="nav-item" data-view="dashboard" id="tour-nav-dashboard" style="display: none;">
				<span class="nav-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v2h20V7L12 2zm-8 8v9h2v-9H4zm5 0v9h2v-9H9zm5 0v9h2v-9h-2zm5 0v9h2v-9h-2zM2 20v2h20v-2H2z"/></svg></span>
				<span class="nav-label">My Portfolio</span>
			</li>
			<li class="nav-item" data-view="map" id="tour-nav-map">
				<span class="nav-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 7H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V8h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2zm0-4h-2V4h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg></span>
				<span class="nav-label">3D City Map</span>
			</li>
			<li class="nav-item" data-view="twin" id="tour-nav-twin">
				<span class="nav-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg></span>
				<span class="nav-label">3D Twin</span>
			</li>
			<li class="nav-item" data-view="report" id="tour-nav-report">
				<span class="nav-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg></span>
				<span class="nav-label">District Report</span>
			</li>
			<li class="nav-item" data-view="officer" id="tour-nav-officer">
				<span class="nav-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></span>
				<span class="nav-label">Officer Portal</span>
			</li>
		</ul>

		<!-- UNIVERSAL CADASTRAL & GEOGRAPHIC SEARCH BAR -->
		<div class="nav-search-box" id="tour-nav-search">
			<span class="search-ico"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>
			<input type="text" id="global-cadastre-search" 
				placeholder="Search ULPIN, City, Owner..." 
				autocomplete="off">
			<span class="search-kbd-hint">Ctrl K</span>
			<button type="button" id="btn-clear-search" class="search-clear-btn" style="display: none;">&times;</button>
			<div id="search-autocomplete-dropdown" class="search-dropdown-menu" style="display: none;"></div>
		</div>

		<div class="gov-nav-right">
			<!-- 5-STEP INTERACTIVE TUTORIAL & GUIDE TRIGGER BUTTON -->
			<button type="button" id="btn-open-tutorial" class="btn-tutorial-trigger" onclick="window.app && window.app.openTutorialMenu()" title="Open 5-Step Interactive Guide &amp; Navigation Tips">
				<span class="tutorial-star"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"></circle><path fill="#ffffff" d="M11 17h2v-6h-2v6zm0-8h2V7h-2v2z"/></svg></span>
				<span class="tutorial-btn-text">Tips &amp; Tour</span>
			</button>

			<!-- Public Sign In Button (Visible when unauthenticated) -->
			<button type="button" id="btn-nav-signin" class="btn-gov-signin" onclick="window.app && window.app.openLoginModal('citizen')" title="Citizen Sign In with Aadhaar e-KYC" style="display: flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 0.8rem;">
				<span>Sign In</span>
			</button>
			<button type="button" id="btn-nav-officer" class="btn-gov-officer-signin" onclick="window.app && (window.app.loginDemoOfficer ? window.app.loginDemoOfficer() : window.app.switchView('officer'))" title="Officer Authority Portal" style="display: flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 0.8rem;">
				<span>Officer Portal</span>
			</button>

			<!-- Authenticated Profile Pill (Visible when logged in) -->
			<div id="user-profile-pill" class="user-status-pill" style="display: none;">
				<span class="status-dot"></span>
				<span id="user-pill-name">Harpreet Singh</span>
				<span class="user-ekyc-tag">Verified</span>
			</div>
			<button id="btn-logout" class="btn-logout-pill" style="display: none;" onclick="window.app.logoutUser()">Sign Out</button>
		</div>
	</nav>

	<!-- CADASTRAL MAP CONTROLS HEADER RIBBON (Ultra-thin single row, sits cleanly BELOW gov-nav in map view) -->
	<div id="map-sub-header-bar" class="map-sub-header-bar" style="display: none;">
		<div class="header-ribbon-left">
			<div class="ribbon-filter-group" id="tour-step-filters">
				<span class="ribbon-label">Filter:</span>
				<select id="select-building-filter" class="ribbon-select" onchange="window.app.applyMapFilter(this.value)">
					<option value="all" selected>All Cities &amp; Buildings (10,300 Properties)</option>
					<option value="digitalized">Digitalized 3D Twins</option>
					<option value="anomalies">AI Height Violations (Flagged Notice)</option>
					<option value="pending">Pending Drone SLAM Survey</option>
					<option value="highrise">Multi-Storey (3+ Storeys)</option>
					<option value="single_floor">Single Storey</option>
					<option value="tax_paid">Property Tax Paid</option>
				</select>
				<div class="ribbon-chips">
					<button type="button" class="btn-quick-filter active" data-filter="all" onclick="window.app.applyMapFilter('all')">All</button>
					<button type="button" class="btn-quick-filter" data-filter="digitalized" onclick="window.app.applyMapFilter('digitalized')">Twins</button>
					<button type="button" class="btn-quick-filter" data-filter="anomalies" onclick="window.app.applyMapFilter('anomalies')">Violations</button>
					<button type="button" class="btn-quick-filter" data-filter="pending" onclick="window.app.applyMapFilter('pending')">Pending</button>
				</div>
			</div>

			<div class="ribbon-v-divider"></div>

			<div class="ribbon-city-quicklinks" id="tour-step-flyto">
				<span class="ribbon-label">Fly To:</span>
				<button type="button" class="btn-city-chip" onclick="window.app.flyToCity('amritsar')">Amritsar</button>
				<button type="button" class="btn-city-chip" onclick="window.app.flyToCity('ludhiana')">Ludhiana (3,000+)</button>
				<button type="button" class="btn-city-chip" onclick="window.app.flyToCity('phagwara')">Phagwara (1,200+)</button>
				<button type="button" class="btn-city-chip" onclick="window.app.flyToCity('jalandhar')">Jalandhar (2,500+)</button>
				<button type="button" class="btn-city-chip" onclick="window.app.flyToCity('patiala')">Patiala</button>
				<button type="button" class="btn-city-chip" onclick="window.app.flyToCity('mohali')">Mohali</button>
			</div>
		</div>

		<div class="header-ribbon-right" id="tour-step-actions">
			<div class="map-layer-switcher">
				<button id="btn-layer-satellite" class="layer-switch-btn active" onclick="window.app.setMapLayer('satellite')">3D Satellite</button>
				<button id="btn-layer-street" class="layer-switch-btn" onclick="window.app.setMapLayer('street')">Street Map</button>
			</div>
			<button id="btn-add-building-map" class="btn-ribbon-add" onclick="window.app.openRegisterModal()">
				<span>+ Add / Survey Building</span>
			</button>
		</div>
	</div>

	<!-- Cadastre & Land Mutation History Timeline Slider Bar (Dynamically Adapted per Building) -->
	<div id="cadastre-history-bar" class="history-timeline-bar" style="display: none;">
		<div class="history-header">
			<div style="display: flex; align-items: center; gap: 8px;">
				<span style="color: #0f172a; font-weight: 700; font-size: 0.78rem;">BUILDING MUTATION TIMELINE:</span>
				<span id="history-building-tag" style="font-family: monospace; font-size: 0.75rem; background: #f0f9ff; color: #0284c7; padding: 2px 8px; border-radius: 4px; border: 1px solid #bae6fd; font-weight: 700;">BCN501B1NA2CH0</span>
				<span id="history-owner-tag" style="font-size: 0.72rem; color: #475569; font-weight: 600;">Sardar Harpreet Singh</span>
			</div>
			<div style="display: flex; align-items: center; gap: 8px;">
				<span id="history-meter-tag" style="font-size: 0.7rem; background: #fefce8; color: #854d0e; padding: 2px 8px; border-radius: 4px; border: 1px solid #fef08a; font-weight: 600;">Meter: PSPCL-LT-8821</span>
				<span id="history-active-badge" class="history-badge">2026 (PRESENT DAY) &bull; DRONE SURVEY</span>
			</div>
		</div>
		<div class="history-slider-container">
			<input type="range" id="history-year-slider" min="2016" max="2026" step="1" value="2026" class="history-slider">
			<div id="history-milestones-container" class="history-milestones">
				<!-- Dynamically generated for each specific building! -->
			</div>
		</div>
		<div id="history-event-desc" class="history-event-desc">
			<!-- Dynamically generated for each specific building! -->
		</div>
	</div>

	<!-- ═══════════════════════════════════════════════════════════════ -->
	<!-- VIEW 1: PUBLIC GOVERNMENT LANDING PORTAL (GIGW 3.0 COMPLIANT) -->
	<!-- ═══════════════════════════════════════════════════════════════ -->
	<section id="view-landing" class="view-panel active">
		<div class="gov-landing-redesign">

			<!-- ═══════════════════════════════════════════════════════════ -->
			<!-- HERO BANNER CAROUSEL (Official Government Scheme Posters) -->
			<!-- ═══════════════════════════════════════════════════════════ -->
			<div class="hero-carousel" id="hero-carousel" aria-label="Government Schemes Carousel">
				<div class="carousel-track" id="carousel-track">

					<!-- Slide 1: MoRD DILRMP & Bhu-Aadhaar ULPIN -->
					<div class="carousel-slide active">
						<img src="assets/banners/dilrmp-bhu-aadhaar-hero.svg" alt="Digital India Land Records Modernisation Programme (DILRMP) and 14-Digit Bhu-Aadhaar ULPIN by Ministry of Rural Development" loading="eager">
						<div class="carousel-overlay">
							<div class="carousel-badge">Department of Land Resources &bull; Ministry of Rural Development</div>
							<h2>Digital India Land Records Modernisation Programme (DILRMP)</h2>
							<p>14-Digit Bhu-Aadhaar (ULPIN) &bull; 100% Digitized Cadastral Records &bull; 3D Geospatial Boundary Audit</p>
							<div class="carousel-actions">
								<button type="button" class="btn-carousel-cta" onclick="window.app && window.app.openLoginModal('citizen')">
									Citizen Sign In &rarr;
								</button>
								<button type="button" class="btn-carousel-secondary" onclick="window.app && window.app.openLoginModal('officer')">
									Authority Login
								</button>
							</div>
						</div>
					</div>

					`;

const parts = html.split(marker);
if (parts.length === 2) {
  html = parts[0] + insertBlock + marker + parts[1];
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('✅ index.html properly restored and updated with full gov-nav and Slide 1!');
} else {
  console.error('Marker not found or duplicate');
}
