const fs = require('fs');
const path = require('path');

function replaceEmojisInIndexHtml() {
  const file = path.join(__dirname, '../index.html');
  let content = fs.readFileSync(file, 'utf8');

  // Specific replacements in index.html
  // Top bar
  content = content.replace(/🇮🇳\s*/g, '');
  content = content.replace(/<span aria-hidden="true">📍<\/span>\s*/g, '<span class="loc-pin-svg" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg></span> ');
  content = content.replace(/<span class="compact-emblem">🏛️<\/span>/g, '<span class="compact-emblem"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v2h20V7L12 2zm-8 8v9h2v-9H4zm5 0v9h2v-9H9zm5 0v9h2v-9h-2zm5 0v9h2v-9h-2zM2 20v2h20v-2H2z"/></svg></span>');
  content = content.replace(/✅ 2,160 \/ 3,600/g, '2,160 / 3,600');

  // Navigation
  content = content.replace(/<span class="gov-nav-emblem">🏛️<\/span>/g, '<span class="gov-nav-emblem"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v2h20V7L12 2zm-8 8v9h2v-9H4zm5 0v9h2v-9H9zm5 0v9h2v-9h-2zm5 0v9h2v-9h-2zM2 20v2h20v-2H2z"/></svg></span>');
  content = content.replace(/<span class="nav-icon">🏠<\/span>/g, '<span class="nav-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg></span>');
  content = content.replace(/<span class="nav-icon">🏛️<\/span>/g, '<span class="nav-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v2h20V7L12 2zm-8 8v9h2v-9H4zm5 0v9h2v-9H9zm5 0v9h2v-9h-2zm5 0v9h2v-9h-2zM2 20v2h20v-2H2z"/></svg></span>');
  content = content.replace(/<span class="nav-icon">🌆<\/span>/g, '<span class="nav-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 7H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V8h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2zm0-4h-2V4h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg></span>');
  content = content.replace(/<span class="nav-icon">🏢<\/span>/g, '<span class="nav-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg></span>');
  content = content.replace(/<span class="nav-icon">📐<\/span>/g, '<span class="nav-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.07 4.93l-1.41-1.41a2 2 0 0 0-2.83 0L3.54 14.81a2 2 0 0 0 0 2.83l1.41 1.41c.78.78 2.05.78 2.83 0L19.07 7.76a2 2 0 0 0 0-2.83z"/></svg></span>');
  content = content.replace(/<span class="nav-icon">📊<\/span>/g, '<span class="nav-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg></span>');
  content = content.replace(/<span class="nav-icon">⚖️<\/span>/g, '<span class="nav-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></span>');

  content = content.replace(/<span class="search-ico">🔍<\/span>/g, '<span class="search-ico"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>');
  content = content.replace(/<span class="tutorial-star">✨<\/span>/g, '<span class="tutorial-star"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"></circle><path fill="#ffffff" d="M11 17h2v-6h-2v6zm0-8h2V7h-2v2z"/></svg></span>');
  content = content.replace(/<span>🔑<\/span>\s*Sign In/g, '<span>Sign In</span>');
  content = content.replace(/🔑\s*Citizen/g, 'Citizen');

  // Ribbon bar
  content = content.replace(/🎯\s*Filter:/g, 'Filter:');
  content = content.replace(/🌐\s*All Cities/g, 'All Cities');
  content = content.replace(/✅\s*Digitalized/g, 'Digitalized');
  content = content.replace(/🚨\s*AI Height/g, 'AI Height');
  content = content.replace(/⏳\s*Pending/g, 'Pending');
  content = content.replace(/🏢\s*Multi-Storey/g, 'Multi-Storey');
  content = content.replace(/🏠\s*Single Storey/g, 'Single Storey');
  content = content.replace(/💰\s*Property Tax/g, 'Property Tax');
  content = content.replace(/✅\s*Twins/g, 'Twins');
  content = content.replace(/🚨\s*Violations/g, 'Violations');
  content = content.replace(/📍\s*Fly To:/g, 'Fly To:');
  content = content.replace(/🛰️\s*3D Satellite/g, '3D Satellite');
  content = content.replace(/🗺️\s*Street Map/g, 'Street Map');
  content = content.replace(/<span>➕\s*Add \/ Survey Building<\/span>/g, '<span>+ Add / Survey Building</span>');

  // Cadastre history bar
  content = content.replace(/⏳\s*BUILDING MUTATION TIMELINE:/g, 'BUILDING MUTATION TIMELINE:');
  content = content.replace(/⚡\s*Meter:/g, 'Meter:');

  // Quick access cards
  const quickCardsRegex = /<div class="quick-access-grid">[\s\S]*?<\/section>/;
  const quickCardsClean = `<div class="quick-access-grid">
          <button type="button" class="quick-card" onclick="window.app && window.app.openLoginModal()">
            <div class="quick-icon" style="background: linear-gradient(135deg, #FF9933, #e67300);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h3>Citizen &amp; Officer Sign In</h3>
            <span class="quick-desc">Aadhaar OTP &bull; JanParichay SSO &bull; DSC</span>
          </button>
          <button type="button" class="quick-card" onclick="window.app && window.app.switchView('map')">
            <div class="quick-icon" style="background: linear-gradient(135deg, #0284c7, #0369a1);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
            </div>
            <h3>3D Cadastral City Map</h3>
            <span class="quick-desc">Explore 10,300+ Buildings &bull; Satellite GIS</span>
          </button>
          <button type="button" class="quick-card" onclick="window.app && window.app.switchView('scan')">
            <div class="quick-icon" style="background: linear-gradient(135deg, #138808, #0d6b06);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <h3>Manual Building Scan</h3>
            <span class="quick-desc">Plot Boundary &bull; 4-Sided Exterior Scan</span>
          </button>
          <button type="button" class="quick-card" onclick="window.app && window.app.switchView('twin')">
            <div class="quick-icon" style="background: linear-gradient(135deg, #7c3aed, #6d28d9);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line><line x1="9" y1="6" x2="9" y2="6.01"></line><line x1="15" y1="6" x2="15" y2="6.01"></line><line x1="9" y1="10" x2="9" y2="10.01"></line><line x1="15" y1="10" x2="15" y2="10.01"></line><line x1="9" y1="14" x2="9" y2="14.01"></line><line x1="15" y1="14" x2="15" y2="14.01"></line></svg>
            </div>
            <h3>3D Digital Twin Inspector</h3>
            <span class="quick-desc">Floor-by-Floor &bull; Sub-ULPIN Verification</span>
          </button>
          <button type="button" class="quick-card" onclick="window.app && window.app.switchView('officer')">
            <div class="quick-icon" style="background: linear-gradient(135deg, #dc2626, #b91c1c);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h3>Officer Authority Portal</h3>
            <span class="quick-desc">Approvals Queue &bull; Section 187 Enforcement</span>
          </button>
          <button type="button" class="quick-card" onclick="window.app && window.app.switchView('report')">
            <div class="quick-icon" style="background: linear-gradient(135deg, #0891b2, #0e7490);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            </div>
            <h3>District Cadastre Report</h3>
            <span class="quick-desc">Revenue Analytics &bull; Statutory Signoff Seal</span>
          </button>
          <button type="button" class="quick-card" id="side-menu-ai-btn" onclick="window.app && window.app.openAiAssistant && window.app.openAiAssistant()">
            <div class="quick-icon" style="background: linear-gradient(135deg, #4f46e5, #4338ca);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3>Bhu-Samvaad AI Chatbot</h3>
            <span class="quick-desc">24/7 RAG Legal Cadastre Assistant</span>
          </button>
        </div>
      </section>`;

  content = content.replace(quickCardsRegex, quickCardsClean);

  // Scheme cards icons
  content = content.replace(/<span class="scheme-icon"[^>]*>.*?<\/span>/g, '');

  // Features grid: remove feature-icon-circle emojis and use SVG
  const featureIcons = [
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00274d" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="9" y1="6" x2="9" y2="6.01"></line><line x1="15" y1="6" x2="15" y2="6.01"></line><line x1="9" y1="10" x2="9" y2="10.01"></line><line x1="15" y1="10" x2="15" y2="10.01"></line></svg>',
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00274d" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon></svg>',
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00274d" stroke-width="2"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>',
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00274d" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00274d" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>',
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00274d" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00274d" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00274d" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
  ];
  let fCount = 0;
  content = content.replace(/<div class="feature-icon-circle"[^>]*>.*?<\/div>/g, () => {
    const icon = featureIcons[fCount % featureIcons.length];
    fCount++;
    return `<div class="feature-icon-circle">${icon}</div>`;
  });

  // Footer branding
  content = content.replace(/<span style="font-size: 1\.4rem;" aria-hidden="true">🏛️<\/span>/g, '<span style="display:inline-flex; align-items:center;" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="#00274d"><path d="M12 2L2 7v2h20V7L12 2zm-8 8v9h2v-9H4zm5 0v9h2v-9H9zm5 0v9h2v-9h-2zm5 0v9h2v-9h-2zM2 20v2h20v-2H2z"/></svg></span>');

  // Citizen dashboard
  content = content.replace(/📊\s*District Cadastre Report/g, 'District Cadastre Report');
  content = content.replace(/➕\s*Register New Land \/ Building/g, '+ Register New Land / Building');
  content = content.replace(/<span>📋<\/span>\s*Properties Registered/g, '<span>Properties Registered</span>');
  content = content.replace(/✓\s*Aadhaar Verified Citizen/g, 'Aadhaar Verified Citizen');

  // Officer portal
  content = content.replace(/✓\s*Competent Authority/g, 'Competent Authority');
  content = content.replace(/🌆\s*Open 3D City Cadastre Map/g, 'Open 3D City Cadastre Map');
  content = content.replace(/📊\s*District Report/g, 'District Report');
  content = content.replace(/📋\s*All Requests &amp; Parcels/g, 'All Requests &amp; Parcels');
  content = content.replace(/✅\s*Approvals Queue/g, 'Approvals Queue');
  content = content.replace(/🚨\s*Statutory Section 187 Notices/g, 'Statutory Section 187 Notices');
  content = content.replace(/🛸\s*Drone Fleet Patrol/g, 'Drone Fleet Patrol');
  content = content.replace(/📊\s*Cadastral Analytics/g, 'Cadastral Analytics');

  // Building scan
  content = content.replace(/📐\s*Manual Building Survey/g, 'Manual Building Survey');
  content = content.replace(/1️⃣\s*Phase 1:/g, 'Phase 1:');
  content = content.replace(/2️⃣\s*Phase 2:/g, 'Phase 2:');
  content = content.replace(/3️⃣\s*Phase 3:/g, 'Phase 3:');

  // General cleanups of remaining emoji characters
  const emojiChars = ['🏛️', '🌆', '🏢', '📐', '📊', '⚖️', '🤖', '🔑', '🗺️', '🛰️', '🏘️', '📋', '🛸', '🔒', '📍', '🎯', '💰', '🏠', '⚡', '⏳', '🚨', '✨', '👁️', '📁', '📄', '👤', '🔄', '💡', '🚀', '✏️', '🚩', '✅', '❌', '➕'];
  emojiChars.forEach(em => {
    content = content.split(em).join('');
  });

  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ Removed all emojis from index.html');
}

replaceEmojisInIndexHtml();
