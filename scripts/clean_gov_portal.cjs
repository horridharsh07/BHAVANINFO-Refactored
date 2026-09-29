const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../index.html');
let html = fs.readFileSync(indexPath, 'utf8');

console.log('Original index.html length:', html.length);

// 1. EXTRACT & RELOCATE #top-gov-notification-bar TO #view-officer
// Find notification bar block
const notifStartStr = '<!-- Top Government Notification Bar';
const notifEndStr = '<!-- Cadastre & Land Mutation History Timeline Slider Bar';

const notifStartIdx = html.indexOf(notifStartStr);
const notifEndIdx = html.indexOf(notifEndStr);

if (notifStartIdx !== -1 && notifEndIdx !== -1) {
  const originalNotifBlock = html.substring(notifStartIdx, notifEndIdx);
  // Cut it out from top
  html = html.substring(0, notifStartIdx) + html.substring(notifEndIdx);
  console.log('✅ Removed notification bar from global top');

  // Cleaned authority version of notification bar with SVG bell symbol
  const cleanedNotifBlock = `<!-- Statutory Discrepancy & Section 187 Enforcement Notice Bar (Competent Authority Exclusive) -->
        <div id="top-gov-notification-bar" class="gov-top-notification" style="display: flex; margin-bottom: 16px; border-radius: 8px;">
          <div class="notif-content">
            <span class="notif-icon" aria-label="Statutory Alert">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                <circle cx="18" cy="4" r="3" fill="#dc2626"></circle>
              </svg>
            </span>
            <div class="notif-text">
              <strong id="notif-title">2026 (Present Day): Autonomous LiDAR SLAM 3R drone survey detected statutory discrepancy</strong>
              <span id="notif-body">Declared G+1; Autonomous 3D LiDAR SLAM detected unauthorized Level 3 extension (+3.2m height excess). Statutory 24h notice active under Sec 187 Punjab Municipal Act.</span>
            </div>
          </div>
          <div class="notif-right-actions">
            <span class="notif-timer-pill" title="Statutory Section 187 Notice Compliance Deadline">
              Compliance Timer: <span class="timer-countdown" id="notif-card-timer">14h 22m 35s</span> remaining
            </span>
            <button type="button" id="btn-notif-inspect" class="btn-notif-inspect" onclick="window.app && window.app.inspectDiscrepancyTwin()" title="Inspect 3D Digital Twin Drone Telemetry">
              <span>Inspect 3D Twin &rarr;</span>
            </button>
            <button type="button" id="btn-close-notif" class="notif-close-btn" onclick="document.getElementById('top-gov-notification-bar').style.display='none'" title="Dismiss Alert">&times;</button>
          </div>
        </div>\n\n`;

  // Insert into #view-officer right after <div class="dashboard-container" style="max-width: 1400px; margin: 0 auto; padding: 20px;">
  const officerContainerStr = '<section id="view-officer" class="view-panel">\n      <div class="dashboard-container" style="max-width: 1400px; margin: 0 auto; padding: 20px;">';
  const officerIdx = html.indexOf(officerContainerStr);
  if (officerIdx !== -1) {
    const insertPos = officerIdx + officerContainerStr.length;
    html = html.substring(0, insertPos) + '\n\n        ' + cleanedNotifBlock + html.substring(insertPos);
    console.log('✅ Relocated notification bar to #view-officer exclusively');
  } else {
    console.error('❌ Could not locate officerContainerStr in index.html');
  }
} else {
  console.log('Notification bar already relocated or not found at top');
}

// 2. HERO CAROUSEL: REMOVE SVAMITVA POSTERS, REMOVE "GoI" / "svamitva.gov.in"
// Replace the entire hero carousel with a clean, 2-slide official DILRMP & Bhu-Aadhaar carousel
const heroCarouselOld = /<div class="hero-carousel" id="hero-carousel"[\s\S]*?<!-- Carousel Slide Indicators[\s\S]*?<\/div>\s*<\/div>/;

const heroCarouselClean = `<div class="hero-carousel" id="hero-carousel" aria-label="Government Schemes Carousel">
        <div class="carousel-track" id="carousel-track">

          <!-- Slide 1: MoRD DILRMP & Bhu-Aadhaar ULPIN -->
          <div class="carousel-slide active">
            <img src="assets/banners/mord-dilrmp-bhu-aadhaar.jpg" alt="Digital India Land Records Modernisation Programme (DILRMP) and 14-Digit Bhu-Aadhaar ULPIN by Ministry of Rural Development" loading="eager">
            <div class="carousel-overlay">
              <div class="carousel-badge">Department of Land Resources &bull; Ministry of Rural Development</div>
              <h2>Digital India Land Records Modernisation Programme (DILRMP)</h2>
              <p>14-Digit Bhu-Aadhaar (ULPIN) &bull; 100% Digitized Cadastral Records &bull; 3D Geospatial Boundary Audit</p>
              <div class="carousel-actions">
                <button type="button" class="btn-carousel-cta" onclick="window.app && window.app.switchView('map')">
                  Explore 3D City Cadastre Map &rarr;
                </button>
                <button type="button" class="btn-carousel-secondary" onclick="window.app && window.app.switchView('report')">
                  View District Cadastre Report
                </button>
              </div>
            </div>
          </div>

          <!-- Slide 2: 3D Cadastral Mapping & Drone LiDAR SLAM -->
          <div class="carousel-slide">
            <img src="assets/banners/digital-india-dilrmp.jpg" alt="Autonomous 3D Cadastral Mapping and Drone LiDAR Survey — Smart India Hackathon Innovation" loading="lazy">
            <div class="carousel-overlay">
              <div class="carousel-badge">Smart India Hackathon (SIH) Innovation</div>
              <h2>Autonomous LiDAR SLAM &amp; 3D Cadastral Digital Twin</h2>
              <p>RTK-GPS Autonomous Flights &bull; &le;2.5cm Survey Precision &bull; Automated Height &amp; Encroachment Audit</p>
              <div class="carousel-actions">
                <button type="button" class="btn-carousel-cta" onclick="window.app && window.app.switchView('twin')">
                  Inspect 3D Digital Twin &rarr;
                </button>
                <button type="button" class="btn-carousel-secondary" onclick="window.app && window.app.switchView('scan')">
                  Launch Manual Building Scan
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- Carousel Navigation Controls -->
        <button type="button" class="carousel-btn carousel-prev" onclick="window.app && window.app.carouselPrev()" aria-label="Previous Banner Slide">&lsaquo;</button>
        <button type="button" class="carousel-btn carousel-next" onclick="window.app && window.app.carouselNext()" aria-label="Next Banner Slide">&rsaquo;</button>

        <!-- Carousel Slide Indicators (2 Dots) -->
        <div class="carousel-dots" id="carousel-dots" role="tablist" aria-label="Banner Slide Dots">
          <span class="dot active" onclick="window.app && window.app.carouselGoTo(0)" role="tab" aria-label="Slide 1"></span>
          <span class="dot" onclick="window.app && window.app.carouselGoTo(1)" role="tab" aria-label="Slide 2"></span>
        </div>
      </div>`;

html = html.replace(heroCarouselOld, heroCarouselClean);
console.log('✅ Replaced hero carousel with clean DILRMP / Bhu-Aadhaar banners (No SVAMITVA)');

// 3. SCHEME PILLARS: REPLACE SVAMITVA CARD WITH 3D CADASTRAL LADM STANDARD
const svamitvaCardRegex = /<article class="scheme-card">[\s\S]*?SVAMITVA 2\.0[\s\S]*?<\/article>/;
const ladmCardClean = `<article class="scheme-card">
            <div class="scheme-header" style="background: linear-gradient(135deg, #138808, #1a9e0e);">
              <span class="scheme-badge" style="background: #ffffff; color: #00274d; font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 4px;">ISO Standard</span>
            </div>
            <div class="scheme-body">
              <div class="scheme-tag">Geospatial Standards</div>
              <h3>ISO 19152 (3D LADM)</h3>
              <span class="scheme-full">3D Land Administration Domain Model</span>
              <ul class="scheme-points">
                <li>Volumetric 3D Sub-ULPIN Floor Title Identification</li>
                <li>Seamless Multi-Storey Vertical Ownership Demarcation</li>
                <li>Interoperable Cadastral GIS Data Infrastructure</li>
              </ul>
            </div>
          </article>`;

html = html.replace(svamitvaCardRegex, ladmCardClean);
console.log('✅ Replaced SVAMITVA scheme card with ISO 19152 3D LADM card');

// Replace footer link to svamitva.nic.in
html = html.replace(/<li><a href="https:\/\/svamitva\.nic\.in"[\s\S]*?<\/li>/g,
  '<li><a href="https://bhuvan.nrsc.gov.in" target="_blank" rel="noopener noreferrer" title="Bhuvan Geospatial Portal (External Website, opens in new window)">ISRO Bhuvan Geospatial Portal &nearr;</a></li>');
html = html.replace(/<li><a href="https:\/\/svamitva\.nic\.in"[\s\S]*?<\/a><\/li>/g,
  '<li><a href="https://dilrmp.gov.in" target="_blank" rel="noopener noreferrer">DILRMP Guidelines &nearr;</a></li>');

// Replace any remaining SVAMITVA in text
html = html.replace(/SVAMITVA 2\.0 Guidelines/g, 'DILRMP Operational Directives');
html = html.replace(/SVAMITVA 2\.0/g, 'DILRMP 2.0');
html = html.replace(/SVAMITVA/g, 'DILRMP');
html = html.replace(/svamitva/g, 'dilrmp');

// 4. ADD NOTIFICATION BUTTON WITH BELL ICON IN OFFICER AUTHORITY BANNER
const officerActionsOld = `<button class="btn-secondary" onclick="window.app.switchView('map')" style="background: var(--gov-saffron); border-color: #ff9933; color: #00274d; font-weight: 700;">
            Open 3D City Cadastre Map
          </button>
          <button class="btn-secondary" onclick="window.app.switchView('report')" style="background: #0284c7; border-color: #38bdf8; color: #ffffff; font-weight: 700;">
            District Report
          </button>`;

// Check if officer actions exists
if (html.includes('Shri Vikramjit Singh, PCS')) {
  // Let's replace officer actions to include notification bell button
  html = html.replace(
    /(<div style="display: flex; gap: 8px; flex-wrap: wrap;">\s*<button class="btn-secondary" onclick="window\.app\.switchView\('map'\)")/g,
    `<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <button class="btn-secondary" onclick="const n=document.getElementById('top-gov-notification-bar'); if(n){n.style.display='flex'; n.scrollIntoView({behavior:'smooth'});}" style="background: #dc2626; border-color: #b91c1c; color: #ffffff; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span>Statutory Notices</span>
              <span style="background: #ffffff; color: #dc2626; font-size: 0.68rem; font-weight: 800; border-radius: 10px; padding: 1px 6px;">1</span>
            </button>
            <button class="btn-secondary" onclick="window.app.switchView('map')"`
  );
  console.log('✅ Added notification bell button to officer banner');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Saved preliminary changes to index.html');
