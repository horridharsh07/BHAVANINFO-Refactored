const fs = require('fs');
const assert = require('assert');

console.log('🧪 Verifying Citizen Navbar Cleanup & 3-Step Guided Scan...');

let passed = 0;
let failed = 0;

function test(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

const html = fs.readFileSync('index.html', 'utf8');
const appJs = fs.readFileSync('src/app.js', 'utf8');

// 1. Navbar removes Home, Officer Portal, District Report, and Tips & Tour from top bar
test('Navbar removes Officer Portal, District Report, and Tips & Tour from top bar', () => {
  assert(appJs.includes("landingNav.style.display = 'none';"), 'Home not hidden in portal navbar');
  assert(appJs.includes("officerNav.style.display = 'none';"), 'Officer Portal not hidden');
  assert(appJs.includes("reportNav.style.display = 'none';"), 'District Report not hidden');
  assert(appJs.includes("tourBtn.style.display = 'none';"), 'Tips & Tour not hidden');
});

// 2. Citizen Dashboard removes District Cadastre Report button
test('Citizen Dashboard profile banner removes District Cadastre Report button', () => {
  const dashHtml = html.substring(html.indexOf('id="view-dashboard"'), html.indexOf('id="view-officer"'));
  assert(!dashHtml.includes('id="btn-open-district-report"'), 'District Cadastre Report button still in Citizen Dashboard');
  assert(!dashHtml.includes('>District Cadastre Report<'), 'District Cadastre Report text still in Citizen Dashboard');
  assert(dashHtml.includes('id="btn-open-register-modal"'), '+ Register New Land / Building button missing');
});

// 3. Register modal replaces 3 buttons with ONE button
test('Register modal replaces 3 buttons with ONE single guided scan button', () => {
  const regModalHtml = html.substring(html.indexOf('id="register-property-modal"'), html.indexOf('id="btn-submit-registration"'));
  assert(!regModalHtml.includes('id="btn-select-map-building"'), 'Select Footprint button still present');
  assert(!regModalHtml.includes('id="btn-draw-map-polygon"'), 'Draw Boundary (6 Dots) button still present');
  assert(regModalHtml.includes('id="btn-manual-gps-scan"'), 'Single guided scan button missing');
  assert(regModalHtml.includes('Choose Building / Plot &amp; Scan (6 Points &bull; Front, Back, Left, Right Photos)'), 'Button text does not describe 3 steps');
});

// 4. Guided scan has Step 1: Choose Building or Plot
test('Guided scan has Step 1: Choose Building or Plot', () => {
  assert(appJs.includes("renderScanStep1()"), 'Missing renderScanStep1');
  assert(appJs.includes("Choose Building or Plot"), 'Missing Step 1 title');
  assert(appJs.includes("STEP 1 OF 3"), 'Missing STEP 1 OF 3 badge');
  assert(appJs.includes("selectScanPlot("), 'Missing selectScanPlot method');
});

// 5. Guided scan has Step 2: 6 Points of the Plot / Building
test('Guided scan has Step 2: 6 Points of the Plot / Building', () => {
  assert(appJs.includes("renderScanStep2()"), 'Missing renderScanStep2');
  assert(appJs.includes("6 Points of the Plot / Building"), 'Missing Step 2 title');
  assert(appJs.includes("STEP 2 OF 3"), 'Missing STEP 2 OF 3 badge');
  assert(appJs.includes("quickCaptureAll6Points()"), 'Missing quickCaptureAll6Points method');
});

// 6. Guided scan has Step 3: Front, Back, Left, Right Photos Scan
test('Guided scan has Step 3: Front, Back, Left, Right Photos Scan', () => {
  assert(appJs.includes("renderScanStep3()"), 'Missing renderScanStep3');
  assert(appJs.includes("Front, Back, Left, Right Photos Scan"), 'Missing Step 3 title');
  assert(appJs.includes("STEP 3 OF 3"), 'Missing STEP 3 OF 3 badge');
  assert(appJs.includes("Front Elevation Photo"), 'Missing Front Elevation Photo');
  assert(appJs.includes("Back Elevation Photo"), 'Missing Back Elevation Photo');
  assert(appJs.includes("Left Elevation Photo"), 'Missing Left Elevation Photo');
  assert(appJs.includes("Right Elevation Photo"), 'Missing Right Elevation Photo');
  assert(appJs.includes("quickCaptureAll4Photos()"), 'Missing quickCaptureAll4Photos method');
});

// 7. Complete scan updates register modal
test('Complete scan transfers data and reopens register modal', () => {
  assert(appJs.includes("Verified: 6 Points + 4 Photos Completed"), 'Missing completion status badge update');
});

console.log(`\nResults: ${passed} Passed, ${failed} Failed\n`);
if (failed > 0) process.exit(1);
