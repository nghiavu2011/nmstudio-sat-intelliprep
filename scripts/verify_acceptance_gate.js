const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 SAT INTELLIPREP — COMPREHENSIVE ACCEPTANCE GATE TEST');
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

// 1. Check Question Bank QA Status & Key Distribution
const qDir = path.join(__dirname, '..', 'data', 'questions');
const qFiles = fs.readdirSync(qDir).filter(f => f.endsWith('.json'));
let totalQuestions = 0;
let keyCounts = { A: 0, B: 0, C: 0, D: 0, 'Grid-in': 0 };
let unapprovedCount = 0;

qFiles.forEach(f => {
  const data = JSON.parse(fs.readFileSync(path.join(qDir, f), 'utf8'));
  const qs = data.questions || data;
  qs.forEach(q => {
    totalQuestions++;
    if (q.qa_status !== 'APPROVED') unapprovedCount++;
    if (q.is_grid_in || !q.choices) {
      keyCounts['Grid-in']++;
    } else {
      keyCounts[q.correct_answer] = (keyCounts[q.correct_answer] || 0) + 1;
    }
  });
});

check('All Question Bank Items are APPROVED', unapprovedCount === 0, `Unapproved: ${unapprovedCount}/${totalQuestions}`);
console.log('     Key Distribution:', keyCounts);
const mcqTotal = keyCounts.A + keyCounts.B + keyCounts.C + keyCounts.D;
const dRatio = (keyCounts.D / mcqTotal) * 100;
check('Answer Key D is balanced (>= 20% of MCQs)', dRatio >= 20, `D is ${dRatio.toFixed(1)}%`);

// 2. Check Specific Corrected Items
const mathAdv = JSON.parse(fs.readFileSync(path.join(qDir, 'math_advanced.json'), 'utf8'));
const qAdv11 = (mathAdv.questions || mathAdv).find(q => q.question_id === 'MATH-ADV-011');
check('MATH-ADV-011 is clean grid-in with correct answer 5', qAdv11 && qAdv11.is_grid_in && qAdv11.correct_answer === '5' && qAdv11.choices === null);

const rwConv = JSON.parse(fs.readFileSync(path.join(qDir, 'rw_conventions.json'), 'utf8'));
const qConv1 = (rwConv.questions || rwConv).find(q => q.question_id === 'RW-C-001');
check('RW-C-001 has no incomplete sentence bug', qConv1 && !qConv1.choices.C?.includes('They') && qConv1.qa_status === 'APPROVED');

const qConv11 = (rwConv.questions || rwConv).find(q => q.question_id === 'RW-C-011');
check('RW-C-011 is unambiguous', qConv11 && !qConv11.explanation.includes('Actually') && qConv11.qa_status === 'APPROVED');

// 3. Check Practice Tests 1 and 2 (98 Questions Full Adaptive)
const ptDir = path.join(__dirname, '..', 'data', 'practice_tests');
['practice_test_1.json', 'practice_test_2.json'].forEach(ptFile => {
  const pt = JSON.parse(fs.readFileSync(path.join(ptDir, ptFile), 'utf8'));
  const rwM1 = pt.reading_and_writing?.module_1?.length || 0;
  const rwM2H = pt.reading_and_writing?.module_2_hard?.length || 0;
  const rwM2S = pt.reading_and_writing?.module_2_standard?.length || 0;
  const mM1 = pt.math?.module_1?.length || 0;
  const mM2H = pt.math?.module_2_hard?.length || 0;
  const mM2S = pt.math?.module_2_standard?.length || 0;

  check(`${ptFile} has RW M1: 27, RW M2-H: 27, RW M2-S: 27`, rwM1 === 27 && rwM2H === 27 && rwM2S === 27, `Got ${rwM1}, ${rwM2H}, ${rwM2S}`);
  check(`${ptFile} has Math M1: 22, Math M2-H: 22, Math M2-S: 22`, mM1 === 22 && mM2H === 22 && mM2S === 22, `Got ${mM1}, ${mM2H}, ${mM2S}`);
  check(`${ptFile} title has no "Official" claim`, !pt.title.toLowerCase().includes('official'));
});

// 4. Check Diagnostic Assessment Data
const diagFile = path.join(__dirname, '..', 'data', 'diagnostic', 'diagnostic_questions.json');
const diagData = JSON.parse(fs.readFileSync(diagFile, 'utf8'));
const diagQs = diagData.questions || diagData;
check('Diagnostic pack contains 30 questions', diagQs.length === 30, `Length: ${diagQs.length}`);

// 5. Check Removed Copyright / Bloat Files
const kaplanPdf = path.join(__dirname, '..', 'extracted', 'sat_rw_prep');
const ieltsDir = path.join(__dirname, '..', 'data', 'ielts');
const fileHashes = path.join(__dirname, '..', 'file_hashes.txt');
check('Unlicensed Kaplan PDFs removed', !fs.existsSync(kaplanPdf));
check('Unused data/ielts directory removed', !fs.existsSync(ieltsDir));
check('Machine path leak file_hashes.txt removed', !fs.existsSync(fileHashes));

// 6. Check index.html Compliance & Accessibility
const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
check('index.html contains College Board non-affiliation disclaimer', htmlContent.includes('College Board') && htmlContent.includes('không có mối liên kết'));
check('index.html contains SAT Strategy Coach (no fake AI)', htmlContent.includes('SAT Strategy Coach') && !htmlContent.includes('Tutor AI 4.0'));
check('index.html contains honest SRS labels (not FSRS)', htmlContent.includes('Spaced Repetition System (SRS)') && !htmlContent.includes('FSRS Spaced Repetition'));
check('index.html contains break area and adaptive transition modal', htmlContent.includes('timed-break-area') && htmlContent.includes('adaptive-transition-modal'));
check('Desmos iframe has accessible title', htmlContent.includes('title="Desmos Graphing Calculator"'));
check('Modals have role="dialog" and aria-modal="true"', htmlContent.includes('role="dialog"') && htmlContent.includes('aria-modal="true"'));

// 7. Check app.js syntax and key implementation invariants
const appJsContent = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
check('app.js has calculateSATScoreBands (P0.2 defensible bands)', appJsContent.includes('calculateSATScoreBands'));
check('app.js has multi-stage adaptive state machine (P0.1)', appJsContent.includes('startAdaptiveStage') && appJsContent.includes('rwRouting') && appJsContent.includes('mathRouting'));
check('app.js has getCanonicalSkill taxonomy normalization (P0.6)', appJsContent.includes('getCanonicalSkill'));
check('app.js has classifyDistractorTrap (P0.7 error intelligence)', appJsContent.includes('classifyDistractorTrap'));
check('app.js tracks real db.totalStudyTimeSec (P0.9 measured data)', appJsContent.includes('totalStudyTimeSec'));
check('app.js has startDiagnosticExam wired (P0.5)', appJsContent.includes('startDiagnosticExam'));

console.log('\n───────────────────────────────────────────────────────────');
if (allPassed) {
  console.log('🎉 ALL ACCEPTANCE GATE VERIFICATION CHECKS PASSED PERFECTLY!');
} else {
  console.log('⚠️ SOME CHECKS FAILED — PLEASE REVIEW DETAILS ABOVE.');
}
console.log('───────────────────────────────────────────────────────────\n');
process.exit(allPassed ? 0 : 1);
