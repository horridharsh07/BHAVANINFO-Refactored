const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function runTest() {
  console.log('🚀 Starting Comprehensive Browser Test: No Double Header, Separate Auth, Clean Views...');
  
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // Step 0: Clear session storage and load fresh landing
    await page.goto('http://localhost:3000/#/', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      sessionStorage.clear();
      window.location.hash = '';
      if (window.app) window.app.logoutUser();
    });
    await new Promise(r => setTimeout(r, 600));

    // Verify Step 0: Landing state
    const landingState = await page.evaluate(() => {
      const govHeader = document.querySelector('.gov-header');
      const govNav = document.querySelector('.gov-nav');
      const topAuth = document.querySelector('.top-auth-actions');
      const citBtn = document.getElementById('btn-top-citizen-signin');
      const offBtn = document.getElementById('btn-top-officer-login');
      return {
        govHeaderDisplay: govHeader ? window.getComputedStyle(govHeader).display : null,
        govNavDisplay: govNav ? window.getComputedStyle(govNav).display : null,
        topAuthDisplay: topAuth ? window.getComputedStyle(topAuth).display : null,
        citBtnExists: !!citBtn,
        offBtnExists: !!offBtn
      };
    });
    console.log('Step 0 (Landing Page State):', landingState);
    if (landingState.govHeaderDisplay !== 'flex' || landingState.govNavDisplay !== 'none') {
      throw new Error(`Landing page header state incorrect: govHeader=${landingState.govHeaderDisplay}, govNav=${landingState.govNavDisplay}`);
    }

    // Step 1: Open Citizen Modal
    await page.click('#btn-top-citizen-signin');
    await new Promise(r => setTimeout(r, 300));
    const citModalState = await page.evaluate(() => {
      const cit = document.getElementById('modal-citizen-login');
      const off = document.getElementById('modal-officer-login');
      return {
        citDisplay: cit ? window.getComputedStyle(cit).display : null,
        offDisplay: off ? window.getComputedStyle(off).display : null
      };
    });
    console.log('Step 1 (Citizen Modal Opened):', citModalState);
    if (citModalState.citDisplay !== 'flex' || citModalState.offDisplay !== 'none') {
      throw new Error('Citizen modal did not open exclusively');
    }

    // Step 2: Citizen Demo Login -> Sardar Harpreet Singh
    await page.evaluate(() => {
      if (window.app) window.app.loginDemoHarpreet();
    });
    await new Promise(r => setTimeout(r, 600));

    const citizenLoggedState = await page.evaluate(() => {
      const govHeader = document.querySelector('.gov-header');
      const govNav = document.querySelector('.gov-nav');
      const topAuth = document.querySelector('.top-auth-actions');
      const btnNavSignin = document.getElementById('btn-nav-signin');
      const btnNavOfficer = document.getElementById('btn-nav-officer');
      const pillName = document.getElementById('user-pill-name')?.textContent;
      const logoutBtn = document.getElementById('btn-logout');
      const dashPanel = document.getElementById('view-dashboard');
      return {
        hash: window.location.hash,
        govHeaderDisplay: govHeader ? window.getComputedStyle(govHeader).display : null,
        govNavDisplay: govNav ? window.getComputedStyle(govNav).display : null,
        topAuthDisplay: topAuth ? window.getComputedStyle(topAuth).display : null,
        btnNavSigninDisplay: btnNavSignin ? window.getComputedStyle(btnNavSignin).display : null,
        btnNavOfficerDisplay: btnNavOfficer ? window.getComputedStyle(btnNavOfficer).display : null,
        pillName,
        logoutVisible: logoutBtn ? window.getComputedStyle(logoutBtn).display : null,
        dashVisible: dashPanel ? window.getComputedStyle(dashPanel).display : null
      };
    });
    console.log('Step 2 (Citizen Logged In - Dashboard):', citizenLoggedState);
    if (citizenLoggedState.govHeaderDisplay !== 'none') {
      throw new Error(`Double header detected! govHeader is still: ${citizenLoggedState.govHeaderDisplay}`);
    }
    if (citizenLoggedState.govNavDisplay !== 'flex') {
      throw new Error(`govNav not shown: ${citizenLoggedState.govNavDisplay}`);
    }
    if (citizenLoggedState.hash !== '#/dashboard') {
      throw new Error(`Citizen not routed to dashboard: hash is ${citizenLoggedState.hash}`);
    }

    // Step 3: Sign Out
    await page.click('#btn-logout');
    await new Promise(r => setTimeout(r, 600));
    const logoutState = await page.evaluate(() => {
      const govHeader = document.querySelector('.gov-header');
      const govNav = document.querySelector('.gov-nav');
      return {
        hash: window.location.hash,
        govHeaderDisplay: govHeader ? window.getComputedStyle(govHeader).display : null,
        govNavDisplay: govNav ? window.getComputedStyle(govNav).display : null
      };
    });
    console.log('Step 3 (Signed Out to Landing):', logoutState);
    if (logoutState.govHeaderDisplay !== 'flex' || logoutState.govNavDisplay !== 'none') {
      throw new Error('Sign out did not restore landing header / hide govNav');
    }

    // Step 4: Open Authority Modal
    await page.click('#btn-top-officer-login');
    await new Promise(r => setTimeout(r, 300));
    const offModalState = await page.evaluate(() => {
      const cit = document.getElementById('modal-citizen-login');
      const off = document.getElementById('modal-officer-login');
      return {
        citDisplay: cit ? window.getComputedStyle(cit).display : null,
        offDisplay: off ? window.getComputedStyle(off).display : null
      };
    });
    console.log('Step 4 (Officer Modal Opened):', offModalState);
    if (offModalState.offDisplay !== 'flex' || offModalState.citDisplay !== 'none') {
      throw new Error('Officer modal did not open exclusively');
    }

    // Step 5: Officer Authority Demo Login -> Shri Vikramjit Singh, PCS
    await page.evaluate(() => {
      if (window.app) window.app.loginDemoOfficer();
    });
    await new Promise(r => setTimeout(r, 600));

    const officerLoggedState = await page.evaluate(() => {
      const govHeader = document.querySelector('.gov-header');
      const govNav = document.querySelector('.gov-nav');
      const btnNavOfficer = document.getElementById('btn-nav-officer');
      const notifBar = document.getElementById('top-gov-notification-bar');
      const pillName = document.getElementById('user-pill-name')?.textContent;
      const logoutBtn = document.getElementById('btn-logout');
      const officerPanel = document.getElementById('view-officer');
      return {
        hash: window.location.hash,
        govHeaderDisplay: govHeader ? window.getComputedStyle(govHeader).display : null,
        govNavDisplay: govNav ? window.getComputedStyle(govNav).display : null,
        btnNavOfficerDisplay: btnNavOfficer ? window.getComputedStyle(btnNavOfficer).display : null,
        notifBarDisplay: notifBar ? window.getComputedStyle(notifBar).display : null,
        pillName,
        logoutVisible: logoutBtn ? window.getComputedStyle(logoutBtn).display : null,
        officerVisible: officerPanel ? window.getComputedStyle(officerPanel).display : null
      };
    });
    console.log('Step 5 (Officer Logged In - Officer Portal):', officerLoggedState);
    if (officerLoggedState.govHeaderDisplay !== 'none') {
      throw new Error(`Double header detected! govHeader is still: ${officerLoggedState.govHeaderDisplay}`);
    }
    if (officerLoggedState.btnNavOfficerDisplay !== 'none') {
      throw new Error(`Duplicate Officer Portal button still visible in govNav!`);
    }
    if (officerLoggedState.hash !== '#/officer') {
      throw new Error(`Officer not routed to officer portal: hash is ${officerLoggedState.hash}`);
    }

    // Step 6: Test Statutory Notices Toggle
    await page.evaluate(() => {
      const notifBtn = document.querySelector('.btn-officer-notif');
      if (notifBtn) notifBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));
    const notifToggled = await page.evaluate(() => {
      const n = document.getElementById('top-gov-notification-bar');
      return n ? window.getComputedStyle(n).display : null;
    });
    console.log('Step 6 (Statutory Notices Toggled):', notifToggled);
    if (notifToggled !== 'flex') {
      throw new Error('Statutory notice did not toggle to flex on click');
    }

    console.log('\n🎉 ALL 6 COMPREHENSIVE TESTS PASSED! ZERO DOUBLE HEADERS, ZERO BUGS!\n');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
