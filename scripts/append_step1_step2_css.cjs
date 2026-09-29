const fs = require('fs');
const path = require('path');

console.log('🔧 Updating src/styles/gov-theme.css with Step 1 dual mode and Step 2 satellite map styles...');

let css = fs.readFileSync('src/styles/gov-theme.css', 'utf8');

const newStyles = `
/* ── STEP 1: DUAL SELECTION MODES (CHOOSE BUILDING VS SELECT 6 POINTS) ── */
.scan-step1-mode-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.btn-step1-mode {
  padding: 11px 16px;
  background: #f8fafc;
  color: #334155;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.88rem;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.btn-step1-mode:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.btn-step1-mode.active {
  background: #00274d;
  color: #ffffff;
  border-color: #0284c7;
  box-shadow: 0 3px 10px rgba(0, 39, 77, 0.25);
}

.scan-building-search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.scan-search-input {
  flex: 1;
  min-width: 240px;
  padding: 9px 14px;
  border: 1.5px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.84rem;
  font-family: inherit;
  color: #0f172a;
  background: #ffffff;
  outline: none;
  transition: border-color 0.15s ease;
}

.scan-search-input:focus {
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
}

.scan-building-dropdown {
  flex: 1.4;
  min-width: 280px;
  padding: 9px 14px;
  border: 1.5px solid #0284c7;
  border-radius: 6px;
  font-size: 0.84rem;
  font-family: inherit;
  background: #f0f9ff;
  color: #0369a1;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

/* ── STEP 2: SATELLITE MAP CONTAINER ── */
.scan-step2-map-wrapper {
  position: relative;
  width: 100%;
  height: 280px;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid #cbd5e1;
  box-shadow: 0 4px 14px rgba(0,0,0,0.12);
  margin-bottom: 14px;
  background: #0f172a;
}

#scan-step2-map {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.scan-step2-hud-top {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background: rgba(0, 39, 77, 0.88);
  backdrop-filter: blur(6px);
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid #38bdf8;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.scan-step2-hud-right {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(6px);
  color: #4ade80;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  border: 1px solid #22c55e;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
`;

if (!css.includes('.scan-step1-mode-tabs')) {
  css += '\n' + newStyles;
  fs.writeFileSync('src/styles/gov-theme.css', css, 'utf8');
  console.log('✅ Appended styles to src/styles/gov-theme.css');
} else {
  console.log('Styles already present in gov-theme.css');
}
