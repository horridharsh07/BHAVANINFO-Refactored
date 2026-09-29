const fs = require('fs');
const path = require('path');

// 1. UPDATE index.html
let html = fs.readFileSync('index.html', 'utf8');

// A. Insert notification bell button in .gov-nav-right
const notifBellBtn = `\t\t\t<!-- STATUTORY NOTICES NOTIFICATION (Badge Symbol On Top) -->
\t\t\t<button type="button" id="btn-nav-notifications" class="btn-nav-notification-bell" onclick="window.app && window.app.handleNotificationClick()" title="Statutory Notices (1 Active Notice under Sec 187)" aria-label="Notifications (1 Active Notice)">
\t\t\t\t<span class="notif-badge-top" id="top-nav-notif-badge">1</span>
\t\t\t\t<svg class="bell-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
\t\t\t\t\t<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
\t\t\t\t\t<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
\t\t\t\t</svg>
\t\t\t</button>
\t\t\t<!-- 5-STEP INTERACTIVE TUTORIAL & GUIDE TRIGGER BUTTON -->`;

if (!html.includes('id="btn-nav-notifications"')) {
  html = html.replace(/<!-- 5-STEP INTERACTIVE TUTORIAL & GUIDE TRIGGER BUTTON -->/, notifBellBtn);
  console.log('✅ Added notification bell button with symbol on top in top navbar');
}

// B. Replace hero carousel images with crisp SVG vector banners
html = html.replace(/src="assets\/banners\/mord-dilrmp-bhu-aadhaar\.jpg"/g, 'src="assets/banners/dilrmp-bhu-aadhaar-hero.svg"');
html = html.replace(/src="assets\/banners\/digital-india-dilrmp\.jpg"/g, 'src="assets/banners/drone-lidar-slam-hero.svg"');
console.log('✅ Updated hero carousel to pristine vector SVG banners');

// C. Update Officer Portal Statutory Notices button to have notification symbol on top
const oldOfficerNotifRegex = /<button class="btn-secondary" onclick="const n=document\.getElementById\('top-gov-notification-bar'\);[\s\S]*?<span>Statutory Notices<\/span>[\s\S]*?<\/button>/;

const newOfficerNotifBtn = `<button class="btn-secondary btn-officer-notif" onclick="const n=document.getElementById('top-gov-notification-bar'); if(n){n.style.display='flex'; n.scrollIntoView({behavior:'smooth'});}" style="position: relative; background: #dc2626; border-color: #b91c1c; color: #ffffff; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; padding: 7px 16px; border-radius: 6px; cursor: pointer;">
\t\t\t\t\t<span style="position: relative; display: inline-flex; align-items: center; justify-content: center;">
\t\t\t\t\t\t<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
\t\t\t\t\t\t<span class="officer-badge-top" style="position: absolute; top: -6px; right: -7px; background: #ffd700; color: #1e1b4b; font-size: 0.62rem; font-weight: 900; border-radius: 50%; width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; border: 1.5px solid #dc2626; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">1</span>
\t\t\t\t\t</span>
\t\t\t\t\t<span>Statutory Notices</span>
\t\t\t\t</button>`;

if (oldOfficerNotifRegex.test(html)) {
  html = html.replace(oldOfficerNotifRegex, newOfficerNotifBtn);
  console.log('✅ Updated Officer portal notice button with notification symbol on top');
}

fs.writeFileSync('index.html', html, 'utf8');

// 2. UPDATE src/styles/gov-theme.css
let css = fs.readFileSync('src/styles/gov-theme.css', 'utf8');
if (!css.includes('.btn-nav-notification-bell')) {
  const notifCss = `
/* ── TOP NAV NOTIFICATION BELL & BADGE ON TOP ── */
.btn-nav-notification-bell {
  position: relative;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #ffffff;
  border-radius: 6px;
  width: 36px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
  flex-shrink: 0;
}

.btn-nav-notification-bell:hover {
  background: rgba(255, 255, 255, 0.24);
  border-color: #ffd700;
  transform: translateY(-1px);
}

.notif-badge-top {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #dc2626;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 800;
  border-radius: 10px;
  min-width: 17px;
  height: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 1.5px solid #00274d;
  box-shadow: 0 2px 4px rgba(0,0,0,0.35);
  line-height: 1;
  animation: notifPulse 2s infinite ease-in-out;
}

@keyframes notifPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}
`;
  css += notifCss;
  fs.writeFileSync('src/styles/gov-theme.css', css, 'utf8');
  console.log('✅ Added CSS for notification button with badge on top');
}

// 3. UPDATE src/app.js: Add handleNotificationClick & adjust nav visibility
let appJs = fs.readFileSync('src/app.js', 'utf8');
if (!appJs.includes('handleNotificationClick()')) {
  const notifMethod = `
  handleNotificationClick() {
    this.switchView('officer');
    setTimeout(() => {
      const notifBar = document.getElementById('top-gov-notification-bar');
      if (notifBar) {
        notifBar.style.display = 'flex';
        notifBar.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  }
`;
  appJs = appJs.replace(/showTopNotification\(title, body\) \{/, `${notifMethod}\n  showTopNotification(title, body) {`);
  fs.writeFileSync('src/app.js', appJs, 'utf8');
  console.log('✅ Added handleNotificationClick() to app.js');
}

console.log('All updates applied successfully!');
