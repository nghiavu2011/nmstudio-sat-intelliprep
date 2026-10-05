const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const VIEWPORTS = [
  { name: '1920x1080_desktop', width: 1920, height: 1080 },
  { name: '1440x900_macbook', width: 1440, height: 900 },
  { name: '1366x768_laptop', width: 1366, height: 768 },
  { name: '1180x820_ipad_air', width: 1180, height: 820 },
  { name: '1024x768_tablet', width: 1024, height: 768 },
  { name: '768x1024_portrait_tablet', width: 768, height: 1024 },
  { name: '390x844_iphone13', width: 390, height: 844 },
  { name: '360x800_android', width: 360, height: 800 }
];

const PORTAL_VIEWPORTS = [
  { name: 'portal_v2_desktop_1440', width: 1440, height: 900 },
  { name: 'portal_v2_tablet_1024', width: 1024, height: 768 },
  { name: 'portal_v2_mobile_390', width: 390, height: 844 }
];

const OUT_DIR = path.join(__dirname, '..', 'reports', 'screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📸 SAT INTELLIPREP — COMPREHENSIVE VISUAL QA CAPTURE SUITE');
  console.log('═══════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: true });
  const manifest = {
    generatedAt: new Date().toISOString(),
    viewports: [],
    portalCaptures: [],
    totalCaptured: 0
  };

  // 1. Capture Learner App Across 8 Viewports
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    // Step 1: Fresh state -> Landing
    await page.goto('http://localhost:5500/#landing');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(400);

    const landingPath = path.join(OUT_DIR, `${vp.name}_01_landing.png`);
    await page.screenshot({ path: landingPath });
    manifest.totalCaptured++;

    // Step 2: Open setup modal
    await page.evaluate(() => { if (window.openSetupModal) window.openSetupModal(); });
    await page.waitForTimeout(400);
    const setupPath = path.join(OUT_DIR, `${vp.name}_02_setup_modal.png`);
    await page.screenshot({ path: setupPath });
    manifest.totalCaptured++;

    // Step 3: Seed valid profile
    await page.evaluate(() => {
      const profile = {
        targetScore: '1500+',
        grade: '11',
        englishLevel: 'intermediate',
        dailyTargetMin: 45,
        setupDate: new Date().toISOString()
      };
      const state = { profile, skills: {}, errors: [], flashcardState: {}, sessionLog: [] };
      localStorage.setItem('nmstudio_sat_os_v3', JSON.stringify(state));
    });

    // Step 4: Route #today
    await page.goto('http://localhost:5500/#today');
    await page.waitForTimeout(400);
    const todayPath = path.join(OUT_DIR, `${vp.name}_03_today.png`);
    await page.screenshot({ path: todayPath });
    manifest.totalCaptured++;

    // Step 5: Route #practice
    await page.goto('http://localhost:5500/#practice');
    await page.waitForTimeout(400);
    const practicePath = path.join(OUT_DIR, `${vp.name}_04_practice.png`);
    await page.screenshot({ path: practicePath });
    manifest.totalCaptured++;

    // Step 6: Route #test
    await page.goto('http://localhost:5500/#test');
    await page.waitForTimeout(400);
    const mockPath = path.join(OUT_DIR, `${vp.name}_05_mock.png`);
    await page.screenshot({ path: mockPath });
    manifest.totalCaptured++;

    manifest.viewports.push(vp.name);
    console.log(`  ✅ Captured 5 screens for viewport: ${vp.name}`);
    await context.close();
  }

  // Step 7: Exam isolation at 1440x900
  const contextExam = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pageExam = await contextExam.newPage();
  await pageExam.goto('http://localhost:5500/#test');
  await pageExam.evaluate(() => {
    const profile = { targetScore: '1500+', grade: '11', englishLevel: 'intermediate', dailyTargetMin: 45 };
    localStorage.setItem('nmstudio_sat_os_v3', JSON.stringify({ profile, skills: {}, errors: [], flashcardState: {}, sessionLog: [] }));
  });
  await pageExam.reload();
  await pageExam.waitForTimeout(400);
  await pageExam.evaluate(() => window.startMockExam('sat', 'sat-diagnostic'));
  await pageExam.waitForTimeout(600);
  const examPath = path.join(OUT_DIR, '1440x900_06_exam_isolation.png');
  await pageExam.screenshot({ path: examPath });
  manifest.totalCaptured++;
  console.log('  ✅ Captured Exam isolation: 1440x900_06_exam_isolation.png');
  await contextExam.close();

  // Step 8: Portal v2 Captures
  for (const pvp of PORTAL_VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: pvp.width, height: pvp.height } });
    const pPage = await ctx.newPage();
    await pPage.goto(`http://localhost:5500/sat_interactive_review.html?app=http://localhost:5500`);
    await pPage.waitForTimeout(1000);
    const pPath = path.join(OUT_DIR, `${pvp.name}.png`);
    await pPage.screenshot({ path: pPath });
    manifest.portalCaptures.push(pvp.name);
    manifest.totalCaptured++;
    console.log(`  ✅ Captured Portal v2: ${pvp.name}.png`);
    await ctx.close();
  }

  await browser.close();

  // Save manifest
  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\n🎉 Visual QA completed! Total screenshots: ${manifest.totalCaptured}`);
  console.log(`Manifest written to: ${manifestPath}\n`);
}

run().catch(err => {
  console.error('Visual capture error:', err);
  process.exit(1);
});
