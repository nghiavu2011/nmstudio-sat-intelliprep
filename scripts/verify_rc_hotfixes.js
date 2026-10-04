const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 SAT INTELLIPREP — RC HOTFIX RUNTIME ACCEPTANCE SUITE (T01–T08)');
console.log('═══════════════════════════════════════════════════════════\n');

let allPassed = true;
function check(title, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${title}`);
  } else {
    console.log(`  ❌ [FAIL] ${title} ${detail ? '— ' + detail : ''}`);
    allPassed = false;
  }
}

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      pageErrors.push(msg.text());
    }
  });

  // T08: CSS custom-property integrity
  console.log('── Running T08: CSS custom-property integrity ──');
  const cssPath = path.join(__dirname, '..', 'css', 'style.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  const usedVars = new Set();
  const varRegex = /var\((--[a-zA-Z0-9_-]+)/g;
  let match;
  while ((match = varRegex.exec(css)) !== null) {
    usedVars.add(match[1]);
  }
  const defRegex = /(--[a-zA-Z0-9_-]+)\s*:/g;
  const defVars = new Set();
  while ((match = defRegex.exec(css)) !== null) {
    defVars.add(match[1]);
  }
  const missingVars = Array.from(usedVars).filter(v => !defVars.has(v));
  check('T08: Every CSS var(--token) has a definition', missingVars.length === 0, `Missing: ${missingVars.join(', ')}`);

  // T06: Functional emoji regression in code & static controls
  console.log('── Running T06: Functional emoji regression ──');
  const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  check('T06.1: No 🚩 flag emoji in app.js', !appJs.includes('🚩'));
  check('T06.2: No 🚩 flag emoji in css/style.css', !css.includes('🚩'));
  check('T06.3: No legacy AI Coach label in index.html', !indexHtml.includes('>AI Coach<'));
  check('T06.4: No visible FSRS branding in index.html text nodes', !/>[^<]*FSRS[^<]*</i.test(indexHtml));

  // T01: Today after 15+ answered questions
  console.log('── Running T01: Today after 15+ answered questions ──');
  await page.goto('http://localhost:5500/#today');
  
  // Seed state with 18 questions answered
  await page.evaluate(() => {
    const testDb = {
      profile: { grade: '11', level: 'intermediate', targetScore: '1500+', diagnosticCompleted: true },
      skills: {
        'Central Ideas and Details': { correct: 8, total: 10 },
        'Algebra': { correct: 7, total: 8 }
      },
      errors: [],
      activeDates: ['2026-10-04'],
      totalStudyTimeSec: 1800,
      assessmentHistory: []
    };
    localStorage.setItem('nmstudio_sat_os_v3', JSON.stringify(testDb));
    location.reload();
  });

  await page.waitForTimeout(600);
  const todayErrors = pageErrors.filter(e => !e.includes('favicon'));
  check('T01.1: Today renders without pageerror or TypeError', todayErrors.length === 0, todayErrors.join('; '));

  const readinessRange = await page.$eval('#today-readiness-range', el => el.textContent.trim());
  const readinessConf = await page.$eval('#today-readiness-conf', el => el.textContent.trim());
  check('T01.2: Today readiness does not fabricate SAT band from practice accuracy', 
    readinessRange === 'Chưa có dải điểm' && readinessConf.includes('Độ chính xác luyện tập: 83% · 18 câu'),
    `Got range: "${readinessRange}", conf: "${readinessConf}"`);

  // T02: Progress with zero assessments
  console.log('── Running T02: Progress with zero assessments ──');
  await page.goto('http://localhost:5500/#progress');
  await page.waitForTimeout(400);

  const progBand = await page.$eval('#prog-readiness-band', el => el.textContent.trim());
  const progTraj = await page.$eval('#prog-trajectory-val', el => el.textContent.trim());
  const rwRangeText = await page.$eval('#prog-rw-range-text', el => el.textContent.trim());
  const mathRangeText = await page.$eval('#prog-math-range-text', el => el.textContent.trim());

  check('T02.1: Progress overall band displays honest non-assessed status', progBand === 'Chưa có dải điểm', `Got: ${progBand}`);
  check('T02.2: Progress trajectory is -- when no mock completed', progTraj === '--', `Got: ${progTraj}`);
  check('T02.3: Progress section bands display no-assessment label (no fake 480-540)', 
    rwRangeText === 'Chưa có dữ liệu khảo thí' && mathRangeText === 'Chưa có dữ liệu khảo thí',
    `RW: ${rwRangeText}, Math: ${mathRangeText}`);

  // T03: Progress after one adaptive full mock
  console.log('── Running T03: Progress after one adaptive full mock ──');
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('nmstudio_sat_os_v3'));
    raw.assessmentHistory = [{
      id: 'mock_1',
      type: 'full_adaptive_mock',
      timestamp: '2026-10-04T10:00:00.000Z',
      rwCorrect: 48,
      mathCorrect: 40,
      totalCorrect: 88,
      rwRouting: 'hard',
      mathRouting: 'hard',
      rwMin: 710,
      rwMax: 760,
      mathMin: 720,
      mathMax: 780,
      totalMin: 1430,
      totalMax: 1540
    }];
    localStorage.setItem('nmstudio_sat_os_v3', JSON.stringify(raw));
    location.reload();
  });
  await page.waitForTimeout(500);

  const progBand1 = await page.$eval('#prog-readiness-band', el => el.textContent.trim());
  const rwRangeText1 = await page.$eval('#prog-rw-range-text', el => el.textContent.trim());
  const mathRangeText1 = await page.$eval('#prog-math-range-text', el => el.textContent.trim());
  const progTraj1 = await page.$eval('#prog-trajectory-val', el => el.textContent.trim());

  check('T03.1: Progress total band matches persisted mock values exactly', progBand1 === '1430 – 1540', `Got: ${progBand1}`);
  check('T03.2: Progress RW and Math bands match persisted values exactly', 
    rwRangeText1 === '710 – 760' && mathRangeText1 === '720 – 780',
    `RW: ${rwRangeText1}, Math: ${mathRangeText1}`);
  check('T03.3: Trajectory is -- with only 1 mock', progTraj1 === '--', `Got: ${progTraj1}`);

  // T04: Progress after two adaptive full mocks
  console.log('── Running T04: Progress after two adaptive full mocks ──');
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('nmstudio_sat_os_v3'));
    raw.assessmentHistory.push({
      id: 'mock_2',
      type: 'full_adaptive_mock',
      timestamp: '2026-10-04T15:00:00.000Z',
      rwCorrect: 51,
      mathCorrect: 42,
      totalCorrect: 93,
      rwRouting: 'hard',
      mathRouting: 'hard',
      rwMin: 740,
      rwMax: 790,
      mathMin: 750,
      mathMax: 800,
      totalMin: 1490,
      totalMax: 1590
    });
    localStorage.setItem('nmstudio_sat_os_v3', JSON.stringify(raw));
    location.reload();
  });
  await page.waitForTimeout(500);

  // Mock 1 mid = (1430+1540)/2 = 1485
  // Mock 2 mid = (1490+1590)/2 = 1540
  // Delta = 1540 - 1485 = +55
  const progTraj2 = await page.$eval('#prog-trajectory-val', el => el.textContent.trim());
  check('T04: Trajectory equals latest midpoint minus first midpoint (+55 điểm)', progTraj2 === '+55 điểm', `Got: ${progTraj2}`);

  // T05: Weekly consistency (seed 30 lifetime active dates)
  console.log('── Running T05: Weekly consistency ──');
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('nmstudio_sat_os_v3'));
    // 30 consecutive old dates starting 40 days ago
    const dates = [];
    for (let i = 10; i <= 40; i++) {
      const d = new Date(Date.now() - i * 86400000);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${day}`);
    }
    // Plus today and yesterday
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const yestD = new Date(Date.now() - 86400000);
    const yest = `${yestD.getFullYear()}-${String(yestD.getMonth()+1).padStart(2,'0')}-${String(yestD.getDate()).padStart(2,'0')}`;
    dates.push(today, yest);

    raw.activeDates = dates;
    localStorage.setItem('nmstudio_sat_os_v3', JSON.stringify(raw));
    location.reload();
  });
  await page.waitForTimeout(500);

  const progDays = await page.$eval('#prog-momentum-days', el => el.textContent.trim());
  check('T05.1: Weekly display is clamped strictly to last 7 days (2 / 7 ngày)', progDays === '2 / 7 ngày', `Got: ${progDays}`);

  await page.goto('http://localhost:5500/#today');
  await page.waitForTimeout(400);
  const todayStreak = await page.$eval('#today-streak-display', el => el.textContent.trim());
  check('T05.2: Today streak display is clamped strictly to last 7 days (2 / 7 ngày)', todayStreak === '2 / 7 ngày', `Got: ${todayStreak}`);

  // T07: Setup modal keyboard focus management
  console.log('── Running T07: Setup modal keyboard focus management ──');
  await page.evaluate(() => {
    // Open setup modal
    window.openSetupModal();
  });
  await page.waitForTimeout(300);

  const activeTag = await page.evaluate(() => document.activeElement ? document.activeElement.id : null);
  check('T07.1: Opening setup modal focuses first form element', activeTag === 'setup-target-score', `Focused: ${activeTag}`);

  // Press Shift+Tab from first element -> should loop to last focusable (#setup-submit)
  await page.keyboard.down('Shift');
  await page.keyboard.press('Tab');
  await page.keyboard.up('Shift');
  const activeAfterShiftTab = await page.evaluate(() => document.activeElement ? document.activeElement.id : null);
  check('T07.2: Shift+Tab on first element wraps focus to last focusable element', activeAfterShiftTab === 'setup-submit', `Focused: ${activeAfterShiftTab}`);

  // Press Tab -> should loop back to #setup-target-score
  await page.keyboard.press('Tab');
  const activeAfterTab = await page.evaluate(() => document.activeElement ? document.activeElement.id : null);
  check('T07.3: Tab on last element wraps focus back to first element', activeAfterTab === 'setup-target-score', `Focused: ${activeAfterTab}`);

  // Close modal via Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const isModalHidden = await page.$eval('#setup-modal', el => el.style.display === 'none');
  check('T07.4: Escape key closes setup modal when profile already exists', isModalHidden);

  // Check weak domain dynamic filter
  console.log('── Running P1.5 Dynamic Weak Domain Filter ──');
  await page.goto('http://localhost:5500/#practice');
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    // Math Geometry is weak: 0/4
    // Algebra is strong: 10/10
    const raw = JSON.parse(localStorage.getItem('nmstudio_sat_os_v3'));
    raw.skills = {
      'Geometry and Trigonometry': { correct: 0, total: 4 },
      'Algebra': { correct: 10, total: 10 }
    };
    localStorage.setItem('nmstudio_sat_os_v3', JSON.stringify(raw));
    filterPracticeDomains('weak');
  });
  await page.waitForTimeout(200);

  const geoDisplay = await page.$eval('.domain-card-btn[data-domain="math-geo"]', el => el.style.display);
  const algDisplay = await page.$eval('.domain-card-btn[data-domain="math-alg"]', el => el.style.display);
  check('P1.5: Dynamic weak filter shows weakest domain (math-geo) and hides strong (math-alg)', 
    geoDisplay === 'flex' && algDisplay === 'none',
    `math-geo: ${geoDisplay}, math-alg: ${algDisplay}`);

  await browser.close();

  console.log('\n───────────────────────────────────────────────────────────');
  if (allPassed) {
    console.log('🎉 ALL RC HOTFIX TESTS (T01–T08) PASSED PERFECTLY!');
  } else {
    console.log('❌ SOME TESTS FAILED. CHECK DETAILS ABOVE.');
    process.exit(1);
  }
  console.log('───────────────────────────────────────────────────────────\n');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
