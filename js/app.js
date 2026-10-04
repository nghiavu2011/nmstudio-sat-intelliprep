/* ═══════════════════════════════════════════════════════════════
   N&Mstudio_Education — SAT IntelliPrep OS (Digital SAT 2026)
   Main Application Logic: Pure Digital SAT Focus, 5-Destination Nav,
   6-Stage Deliberate Feedback, FSRS Spaced Review, Deep Anki TSV &
   A4 PDF Export Engines, 6 Specialized SAT Exam Scenarios
   ═══════════════════════════════════════════════════════════════ */

const DB_KEY = 'nmstudio_sat_os_v3';

// ── 15 Digital SAT Skills Taxonomy ──
const SAT_SKILLS = [
  'Central Ideas and Details', 'Command of Evidence: Textual', 'Command of Evidence: Quantitative',
  'Inferences', 'Words in Context', 'Text Structure and Purpose', 'Cross-Text Connections',
  'Rhetorical Synthesis', 'Transitions', 'Boundaries', 'Form, Structure, and Sense',
  'Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'
];

// ── State Persistence (Alibaba OCR - Defensive Robustness & Migration) ──
function loadState() {
  try {
    // 1. Try v3 key
    let raw = localStorage.getItem(DB_KEY);
    // 2. Fallback to v2 key if migrating
    if (!raw) raw = localStorage.getItem('nmstudio_learning_os_v2');

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        // Migration from multi-workspace v2 to pure SAT v3
        if (parsed.workspaces && parsed.workspaces.sat) {
          const satWS = parsed.workspaces.sat;
          return {
            profile: parsed.profile || { grade: '11', level: 'intermediate', targetScore: '1500+' },
            skills: satWS.skills || {},
            errors: satWS.errors || [],
            flashcardState: satWS.flashcardState || {},
            sessionLog: satWS.sessionLog || []
          };
        }
        if (parsed.skills && parsed.errors) {
          if (!parsed.profile) parsed.profile = { grade: '11', level: 'intermediate', targetScore: '1500+' };
          if (!parsed.profile.targetScore) parsed.profile.targetScore = '1500+';
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Corrupted state detected in localStorage, fallback to default:', e);
  }

  return {
    profile: null, // { grade: '11', level: 'intermediate', targetScore: '1500+' }
    skills: {},
    errors: [],
    flashcardState: {},
    sessionLog: []
  };
}

let db = loadState();

function save() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

function getCurWS() {
  return db;
}

// ── Security Helper: Prevent XSS (Alibaba OCR - Security) ──
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Answer Verification Helper (Supports Strings, Fractions & Decimals) ──
function parseNumericValue(val) {
  if (val === null || val === undefined) return NaN;
  const s = String(val).trim();
  if (!s) return NaN;
  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length === 2) {
      const num = Number(parts[0]);
      const den = Number(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den;
    }
  }
  return Number(s);
}

function isAnswerCorrect(userAns, correctAns) {
  if (userAns === null || userAns === undefined || correctAns === null || correctAns === undefined) return false;
  const uStr = String(userAns).trim().toLowerCase();
  const cStr = String(correctAns).trim().toLowerCase();
  if (uStr === cStr) return true;

  // Numeric equivalence for Digital SAT Student-Produced Responses (Grid-ins)
  const uNum = parseNumericValue(uStr);
  const cNum = parseNumericValue(cStr);
  if (!isNaN(uNum) && !isNaN(cNum)) {
    return Math.abs(uNum - cNum) < 1e-5;
  }
  return false;
}

// ── Canonical Skill Taxonomy & Normalization (P0.6 Fix) ──
function getCanonicalSkill(q) {
  if (!q) return 'General';
  const domain = (q.domain || '').trim();
  const skill = (q.skill || '').trim();

  if (SAT_SKILLS.includes(skill)) return skill;
  if (SAT_SKILLS.includes(domain)) return domain;

  const dLower = domain.toLowerCase();
  if (dLower.includes('algebra')) return 'Algebra';
  if (dLower.includes('advanced')) return 'Advanced Math';
  if (dLower.includes('problem') || dLower.includes('psda') || dLower.includes('data')) return 'Problem-Solving and Data Analysis';
  if (dLower.includes('geo') || dLower.includes('trig')) return 'Geometry and Trigonometry';

  const sLower = skill.toLowerCase();
  if (sLower.includes('linear') || sLower.includes('inequalities') || sLower.includes('systems of')) return 'Algebra';
  if (sLower.includes('quadratic') || sLower.includes('polynomial') || sLower.includes('exponential') || sLower.includes('radical') || sLower.includes('rational')) return 'Advanced Math';
  if (sLower.includes('ratio') || sLower.includes('percent') || sLower.includes('stat') || sLower.includes('probabilit') || sLower.includes('scatter')) return 'Problem-Solving and Data Analysis';
  if (sLower.includes('circle') || sLower.includes('triangle') || sLower.includes('angle') || sLower.includes('volume') || sLower.includes('trig')) return 'Geometry and Trigonometry';

  if (sLower.includes('central') || sLower.includes('detail')) return 'Central Ideas and Details';
  if (sLower.includes('textual')) return 'Command of Evidence: Textual';
  if (sLower.includes('quantitative') || sLower.includes('graph')) return 'Command of Evidence: Quantitative';
  if (sLower.includes('infer')) return 'Inferences';
  if (sLower.includes('word') || sLower.includes('vocab')) return 'Words in Context';
  if (sLower.includes('structure') || sLower.includes('purpose')) return 'Text Structure and Purpose';
  if (sLower.includes('cross')) return 'Cross-Text Connections';
  if (sLower.includes('rhetorical') || sLower.includes('synthesis')) return 'Rhetorical Synthesis';
  if (sLower.includes('transition')) return 'Transitions';
  if (sLower.includes('boundar') || sLower.includes('punctuation')) return 'Boundaries';
  if (sLower.includes('form') || sLower.includes('agreement') || sLower.includes('grammar')) return 'Form, Structure, and Sense';

  return skill || domain || 'General';
}

function classifyDistractorTrap(q, userAns) {
  if (q.why_others_wrong && q.why_others_wrong[userAns]) {
    const txt = q.why_others_wrong[userAns];
    if (txt.toLowerCase().includes('comma splice')) return 'Comma Splice Trap';
    if (txt.toLowerCase().includes('run-on')) return 'Fused Run-on Sentence';
    if (txt.toLowerCase().includes('singular') || txt.toLowerCase().includes('plural') || txt.toLowerCase().includes('agreement')) return 'Agreement Number Mismatch';
    if (txt.toLowerCase().includes('scope') || txt.toLowerCase().includes('extreme')) return 'Scope Shift / Extreme Language';
    if (txt.toLowerCase().includes('sign')) return 'Sign Inversion (+/-) Error';
    if (txt.toLowerCase().includes('extraneous')) return 'Extraneous Radical Solution';
    return txt.length > 50 ? txt.slice(0, 48) + '...' : txt;
  }
  const s = getCanonicalSkill(q);
  if (s === 'Inferences') return 'Over-Inference Trap';
  if (s === 'Boundaries') return 'Clause Boundary Misuse';
  if (s === 'Transitions') return 'Logical Direction Mismatch';
  if (s === 'Words in Context') return 'Secondary Meaning Trap';
  if (s === 'Algebra' || s === 'Advanced Math') return 'Algebraic / Calculation Error';
  if (s === 'Geometry and Trigonometry') return 'Formula / Unit Misapplication';
  return q.common_trap || 'Cognitive Distractor Trap';
}

function isMathQuestion(q) {
  if (!q) return false;
  if (q.is_grid_in) return true;
  const s = getCanonicalSkill(q);
  if (['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'].includes(s)) return true;
  const txt = `${q.domain || ''} ${q.skill || ''}`.toLowerCase();
  return txt.includes('math') || txt.includes('algebra') || txt.includes('geo') || txt.includes('trig') || txt.includes('psda') || txt.includes('function') || txt.includes('linear');
}

// ── Question & Dataset Caches ──
const qCache = {};
const fcCache = {};

const SAT_Q_FILES = {
  'rw-info': 'data/questions/rw_information_ideas.json',
  'rw-craft': 'data/questions/rw_craft_structure.json',
  'rw-expr': 'data/questions/rw_expression_ideas.json',
  'rw-conv': 'data/questions/rw_conventions.json',
  'math-alg': 'data/questions/math_algebra.json',
  'math-adv': 'data/questions/math_advanced.json',
  'math-psda': 'data/questions/math_psda.json',
  'math-geo': 'data/questions/math_geometry_trig.json',
  'diagnostic': 'data/diagnostic/diagnostic_questions.json'
};

async function loadQuestions(key) {
  if (qCache[key]) return qCache[key];
  try {
    let url = SAT_Q_FILES[key];
    if (!url) url = SAT_Q_FILES['rw-info'];

    const r = await fetch(url);
    const d = await r.json();
    let qs = d.questions || d;
    if (key === 'diagnostic') {
      qs = qs.map(q => ({
        ...q,
        question_id: q.question_id || q.q_id
      }));
    }
    qCache[key] = qs;
    return qCache[key];
  } catch (e) {
    console.warn('Failed to load questions:', key, e);
    return [];
  }
}

async function loadFlashcards(type) {
  if (type === 'mistakes') {
    const errs = db.errors || [];
    if (!errs.length) {
      return [{
        card_id: 'FC-EMPTY-ERR',
        category: 'Personal Mistakes',
        front: { word: 'Chưa có lỗi sai nào!', context: 'Hãy làm bài thi hoặc luyện tập để tự động tạo thẻ lỗi sai.' },
        back: { vietnamese: 'Tuyệt vời!', definition: 'Tiếp tục duy trì phong độ giải bài.' }
      }];
    }
    return errs.map((e, idx) => ({
      card_id: `FC-${e.attempt_id || ('ERR-' + idx)}`,
      category: 'Personal Mistakes',
      skill: e.skill,
      front: {
        word: `[CÂU SAI #${idx + 1}] ${e.question_id}`,
        phonetic: `[${e.error_type || 'COGNITIVE_DISTRACTOR'}]`,
        context: `Kỹ năng: ${e.skill} · Lựa chọn của bạn: ${e.answer}`
      },
      back: {
        vietnamese: `Đáp án đúng: ${e.correct_answer}`,
        definition: `Bẫy nhận thức: ${e.error_type || 'COGNITIVE_DISTRACTOR'}`,
        academic_tip: `Hãy đối chiếu kỹ ranh giới logic của đoạn văn và không mở rộng suy diễn quá phạm vi tác giả cung cấp.`
      }
    }));
  }

  if (fcCache[type]) return fcCache[type];
  try {
    const url = `data/flashcards/${type}.json`;
    const r = await fetch(url);
    const d = await r.json();
    fcCache[type] = d.cards || d;
    return fcCache[type];
  } catch (e) {
    console.warn('Failed to load flashcards:', type, e);
    return [];
  }
}

// ── DOM Helpers ──
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ── Initialize App ──
function init() {
  // Real calendar active tracking (P0.9 Fix)
  if (!db.activeDates) db.activeDates = [];
  const todayISO = new Date().toISOString().slice(0, 10);
  if (!db.activeDates.includes(todayISO)) {
    db.activeDates.push(todayISO);
    save();
  }
  if (!db.totalStudyTimeSec) db.totalStudyTimeSec = 0;

  const modal = $('#setup-modal');
  if (!db.profile) {
    modal.style.display = 'flex';
  } else {
    modal.style.display = 'none';
  }

  // Setup submit handler
  $('#setup-submit')?.addEventListener('click', () => {
    const doDiagnostic = $('#setup-do-diagnostic')?.checked;
    db.profile = {
      targetScore: $('#setup-target-score')?.value || '1500+',
      grade: $('#setup-grade')?.value || '11',
      level: $('#setup-level')?.value || 'intermediate',
      diagnosticCompleted: false,
      setupDate: new Date().toISOString()
    };
    save();
    modal.style.display = 'none';
    if (doDiagnostic) {
      startDiagnosticExam();
    } else {
      handleRoute();
    }
  });

  // Language toggle
  $('#toggle-lang')?.addEventListener('click', () => {
    const levels = ['foundation', 'intermediate', 'advanced'];
    const cur = db.profile?.level || 'intermediate';
    const next = levels[(levels.indexOf(cur) + 1) % levels.length];
    if (db.profile) db.profile.level = next;
    save();
    alert(`Ngôn ngữ giải thích: ${next.toUpperCase()}`);
    handleRoute();
  });

  // Set date
  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  $$('.date-display').forEach(el => el.textContent = dateStr);

  // Router listener
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

// ── 5-Destination Hash Routing ──
function handleRoute() {
  const hash = location.hash || '#today';
  
  // Normalize legacy routes to 5 core destinations
  let target = hash;
  if (hash === '#learn') target = '#practice';
  if (hash === '#flashcards' || hash === '#mistakes') target = '#review';
  if (hash === '#timed' || hash === '#mock') target = '#test';
  if (hash === '#parent') target = '#progress';

  // Alibaba OCR - Resource Efficiency: Pause active exam timer if navigating away from #test
  if (target !== '#test' && activeExam && activeExam.timerInterval) {
    clearInterval(activeExam.timerInterval);
    activeExam.timerInterval = null;
  }

  // Update navigation tab highlights
  $$('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('href') === target);
  });

  // Switch view sections
  $$('.section-view').forEach(s => {
    s.classList.toggle('active', '#' + s.id === target);
  });

  // Render view data
  if (target === '#today') renderToday();
  if (target === '#practice') loadPracticeSession();
  if (target === '#review') renderReview();
  if (target === '#test') {
    if (activeExam && activeExam.testId && activeExam.secondsRemaining > 0 && !activeExam.completed && $('#timed-exam-area')?.style.display === 'block') {
      startExamTimer();
    } else {
      renderTest();
    }
  }
  if (target === '#progress') renderProgress();

  window.scrollTo(0, 0);
}

// ═══════════════════════════════════════════════════════════════
// SECTION 1: TODAY (LEARNING COMMAND CENTER)
// ═══════════════════════════════════════════════════════════════
function renderToday() {
  let totalQ = 0, totalCorrect = 0;
  let weakSkill = 'Inferences';
  let minAcc = 100;

  Object.entries(db.skills || {}).forEach(([skill, s]) => {
    totalQ += (s.total || 0);
    totalCorrect += (s.correct || 0);
    if (s.total >= 2) {
      const acc = Math.round((s.correct / s.total) * 100);
      if (acc < minAcc) {
        minAcc = acc;
        weakSkill = skill;
      }
    }
  });

  const overallAcc = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
  const errorCount = (db.errors || []).length;
  const activeDays = (db.activeDates || []).length;
  const studyMins = Math.round((db.totalStudyTimeSec || 0) / 60);

  // Update Hero elements
  const heroFocusSkill = $('#hero-focus-skill');
  if (heroFocusSkill) heroFocusSkill.textContent = weakSkill;
  const heroReviewsCount = $('#hero-reviews-count');
  if (heroReviewsCount) heroReviewsCount.textContent = `${errorCount} lỗi cần ôn tập`;
  const heroTargetDisplay = $('#hero-target-display');
  if (heroTargetDisplay) heroTargetDisplay.textContent = `Mục tiêu ${db.profile?.targetScore || '1500+'}`;

  // Update Status Cards Row
  const readinessRangeEl = $('#today-readiness-range');
  const readinessConfEl = $('#today-readiness-conf');
  if (readinessRangeEl && readinessConfEl) {
    if (totalQ >= 15) {
      const bands = calculateSATScoreBands(totalCorrect, totalQ);
      readinessRangeEl.textContent = `${bands.totalBand.min}–${bands.totalBand.max}`;
      readinessConfEl.textContent = `${bands.confidence} (Dựa trên ${totalQ} câu)`;
    } else {
      readinessRangeEl.textContent = 'Chưa có dữ liệu';
      readinessConfEl.textContent = 'Hoàn thành bài chẩn đoán để đo lường';
    }
  }

  const reviewDueValEl = $('#today-review-due-val');
  if (reviewDueValEl) reviewDueValEl.textContent = `${errorCount} câu`;

  const streakDisplayEl = $('#today-streak-display');
  if (streakDisplayEl) streakDisplayEl.textContent = `${activeDays} / 7 ngày`;

  const timeDisplayEl = $('#today-time-display');
  if (timeDisplayEl) timeDisplayEl.textContent = `${studyMins} phút`;

  // Toggle Diagnostic Baseline Banner (P0.5 Fix)
  const diagBanner = $('#today-diagnostic-banner');
  if (diagBanner) {
    diagBanner.style.display = (!db.profile || !db.profile.diagnosticCompleted) ? 'flex' : 'none';
  }

  // Update Focus Skill Card
  const focusName = $('#focus-skill-name');
  if (focusName) focusName.textContent = weakSkill;
  const focusReason = $('#focus-skill-reason');
  if (focusReason) {
    focusReason.textContent = totalQ > 0 
      ? `Độ chính xác hiện tại là ${minAcc === 100 ? overallAcc : minAcc}% — hoàn thành bài luyện 12 phút để nâng cao.`
      : 'Kỹ năng nền tảng quan trọng nhất trong cấu trúc Digital SAT 2026.';
  }

  // Update Trajectory Card (P0.9 Fix: No fabricated stats)
  const traj = $('#trajectory-stat');
  if (traj) {
    traj.innerHTML = totalQ > 0 
      ? `Độ chính xác trung bình <strong>${overallAcc}%</strong> qua <strong>${totalQ} câu hỏi</strong> đã giải quyết.`
      : `Chưa có dữ liệu bài tập — hãy hoàn thành bài kiểm tra chẩn đoán đầu vào để đo lường.`;
  }

  // Update Error Trap Alert Card (P0.9 Fix: Real measured trap tally)
  const trapName = $('#trap-alert-name');
  if (trapName) {
    if (db.errors && db.errors.length > 0) {
      const trapCounts = {};
      db.errors.forEach(e => {
        const t = e.error_type || 'Cognitive Distractor Trap';
        trapCounts[t] = (trapCounts[t] || 0) + 1;
      });
      const top = Object.entries(trapCounts).sort((a, b) => b[1] - a[1])[0];
      trapName.textContent = `${top[0]} (${top[1]} lần ghi nhận)`;
    } else {
      trapName.textContent = 'Chưa ghi nhận bẫy sai — hãy làm bài để phân tích';
    }
  }

  // Activity 1 skill description
  const act1Desc = $('#act-1-desc');
  if (act1Desc) act1Desc.textContent = `${weakSkill} (Trọng tâm hôm nay)`;
}

window.startTodayPlan = function() {
  location.hash = '#practice';
};

window.startDiagnosticExam = function() {
  location.hash = '#test';
  setTimeout(() => {
    startMockExam('sat', 'sat-diagnostic');
  }, 100);
};

// ═══════════════════════════════════════════════════════════════
// SECTION 2: PRACTICE & LEARNING SESSION (6-STAGE FEEDBACK)
// ═══════════════════════════════════════════════════════════════
let practicePool = [];
let currentPracticeIdx = 0;
let currentQuestion = null;
let selectedChoice = null;
let questionStartTime = Date.now();

async function loadPracticeSession(domainKey = null) {
  const key = domainKey || 'rw-info';
  practicePool = await loadQuestions(key);
  if (!practicePool || practicePool.length === 0) {
    practicePool = await loadQuestions('rw-info');
  }

  currentPracticeIdx = 0;
  renderCurrentQuestion();
}

window.selectDomainTab = function(domainKey) {
  $$('.domain-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.domain === domainKey);
  });
  loadPracticeSession(domainKey);
  const qShell = $('#question-shell-container');
  if (qShell) {
    qShell.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

window.filterPracticeDomains = function(filterType) {
  $$('.filter-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.filter === filterType);
  });

  const cards = $$('.domain-card-btn');
  cards.forEach(card => {
    const d = card.dataset.domain || '';
    if (filterType === 'all') {
      card.style.display = 'flex';
    } else if (filterType === 'rw') {
      card.style.display = d.startsWith('rw') ? 'flex' : 'none';
    } else if (filterType === 'math') {
      card.style.display = d.startsWith('math') ? 'flex' : 'none';
    } else if (filterType === 'weak') {
      card.style.display = (d === 'rw-info' || d === 'math-adv') ? 'flex' : 'none';
    }
  });
};

window.quickStartFocusedSession = function() {
  selectDomainTab('rw-info');
};

window.quickJumpTopic = function(domainKey) {
  location.hash = '#practice';
  setTimeout(() => selectDomainTab(domainKey), 50);
};

function renderCurrentQuestion() {
  const q = practicePool[currentPracticeIdx];
  if (!q) return;

  currentQuestion = q;
  selectedChoice = null;
  questionStartTime = Date.now();

  // Reset UI
  $('#q-skill-display').textContent = q.skill || q.domain || 'Deliberate Practice';
  $('#q-difficulty-display').textContent = `Difficulty: Level ${q.difficulty || 3}`;

  const isMath = isMathQuestion(q);
  const desmosBtn = $('#practice-desmos-btn');
  if (desmosBtn) {
    desmosBtn.style.display = isMath ? 'inline-block' : 'none';
  }

  const passageBox = $('#q-passage-box');
  if (q.passage) {
    passageBox.style.display = 'block';
    passageBox.innerHTML = escapeHTML(q.passage);
  } else {
    passageBox.style.display = 'none';
  }

  $('#q-stem-box').textContent = q.question_stem || '';

  // Render choices
  const choicesContainer = $('#q-choices-container');
  if (q.choices) {
    choicesContainer.innerHTML = Object.entries(q.choices).map(([letter, text]) => `
      <button class="answer-option" data-choice="${letter}" onclick="selectChoice('${letter}')" tabindex="0">
        <span class="choice-letter">${letter}</span>
        <span class="choice-text">${escapeHTML(text)}</span>
      </button>
    `).join('');
  } else if (q.is_grid_in) {
    choicesContainer.innerHTML = `
      <div style="padding:1rem 0;">
        <label class="text-sm font-semibold text-muted block mb-2">Nhập kết quả số (Student-Produced Response):</label>
        <input type="text" id="grid-in-input" class="grid-in-input" placeholder="e.g. 4.5 or 12" onkeydown="if(event.key==='Enter')submitCurrentAnswer()" />
      </div>
    `;
  }

  // Hide feedback panel and restore submit button
  $('#feedback-panel').style.display = 'none';
  $('#q-action-bar').style.display = 'flex';
  const submitBtn = $('#submit-answer-btn');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Kiểm Tra Đáp Án →';
  }

  // Update AI context
  const aiContext = $('#ai-context-indicator');
  if (aiContext) aiContext.textContent = `Context: ${q.question_id || 'Active Question'} (${q.skill})`;
}

window.selectChoice = function(letter) {
  selectedChoice = letter;
  $$('.answer-option').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.choice === letter);
  });
};

window.submitCurrentAnswer = function() {
  const q = currentQuestion;
  if (!q) return;

  let userAns = selectedChoice;
  if (!userAns && q.is_grid_in) {
    const input = $('#grid-in-input');
    userAns = input ? input.value.trim() : null;
  }

  if (!userAns) {
    alert('Vui lòng chọn hoặc nhập một phương án trả lời trước khi kiểm tra!');
    return;
  }

  const timeTakenSec = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
  const isCorrect = isAnswerCorrect(userAns, q.correct_answer);

  // P0.9 Fix: Accumulate real measured study time
  db.totalStudyTimeSec = (db.totalStudyTimeSec || 0) + timeTakenSec;

  // P0.6 Fix: Update Canonical DB Skills Stats
  const canonicalSkill = getCanonicalSkill(q);
  if (!db.skills[canonicalSkill]) db.skills[canonicalSkill] = { correct: 0, total: 0, history: [] };
  db.skills[canonicalSkill].total++;
  if (isCorrect) db.skills[canonicalSkill].correct++;
  db.skills[canonicalSkill].history.push({ correct: isCorrect, timestamp: Date.now(), timeTakenSec });

  // P0.7 Fix: Record Error with stable attempt_id and distractor-specific trap classification
  if (!isCorrect) {
    const attemptId = 'ATT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const trapType = classifyDistractorTrap(q, userAns);
    db.errors.unshift({
      attempt_id: attemptId,
      question_id: q.question_id || 'PRACTICE-Q',
      domain: q.domain || 'Digital SAT',
      skill: canonicalSkill,
      raw_skill: q.skill,
      answer: userAns,
      correct_answer: q.correct_answer,
      error_type: trapType,
      timestamp: Date.now()
    });
    if (db.errors.length > 100) db.errors.pop();
  }
  save();

  // Display 6-Part Feedback
  showDeliberateFeedback(isCorrect, userAns, q, timeTakenSec);
};

function showDeliberateFeedback(isCorrect, userAns, q, timeTakenSec) {
  const panel = $('#feedback-panel');
  if (!panel) return;

  $('#q-action-bar').style.display = 'none';
  panel.style.display = 'block';

  // 01 Result Banner
  const banner = $('#fb-result-banner');
  const title = $('#fb-result-title');
  const timeEl = $('#fb-time-taken');

  banner.className = `feedback-result-banner ${isCorrect ? 'success' : 'error'}`;
  title.innerHTML = isCorrect 
    ? `✓ Chính xác! (Correct: ${escapeHTML(q.correct_answer)})`
    : `⚠️ Chưa chính xác. Bạn chọn [${escapeHTML(userAns)}] · Đáp án đúng là [${escapeHTML(q.correct_answer)}]`;
  timeEl.textContent = `Thời gian hoàn thành: ${timeTakenSec}s`;

  // 02 Why (Correct Evidence)
  $('#fb-why-text').textContent = q.explanation || 'Đáp án này đối chiếu chuẩn xác với dữ kiện và tiền đề tác giả đã cung cấp.';

  // 03 Why Not (Distractors analysis)
  const whyNotBox = $('#fb-whynot-container');
  if (q.why_others_wrong && typeof q.why_others_wrong === 'object') {
    whyNotBox.innerHTML = Object.entries(q.why_others_wrong).map(([letter, reason]) => `
      <div class="mb-1"><strong>Phương án ${letter}:</strong> ${escapeHTML(reason)}</div>
    `).join('');
  } else {
    whyNotBox.innerHTML = 'Các phương án còn lại chứa bẫy suy diễn mở rộng quá đà (Over-Inference) hoặc đảo ngược mối quan hệ logic.';
  }

  // 04 Thinking Strategy
  $('#fb-strategy-text').textContent = q.thinking_framework || 'Khung tư duy: Xác định tiền đề (GIVEN) → Giới hạn phạm vi (BOUNDARY) → Đối chiếu trực tiếp (VERIFY).';

  // 05 Error Pattern / Trap (P0.7 Fix: Distractor trap)
  const trapBlock = $('#fb-error-pattern-block');
  if (!isCorrect) {
    trapBlock.style.display = 'block';
    const distractorTrap = classifyDistractorTrap(q, userAns);
    $('#fb-error-pattern-tag').textContent = distractorTrap;
    $('#fb-trap-text').textContent = (q.why_others_wrong && q.why_others_wrong[userAns]) || q.common_trap || 'Bẫy nhận thức phổ biến trong dạng bài này.';
  } else {
    trapBlock.style.display = 'none';
  }

  // Highlight choices
  $$('.answer-option').forEach(btn => {
    const c = btn.dataset.choice;
    btn.classList.remove('selected');
    if (c === q.correct_answer) btn.classList.add('correct');
    else if (c === userAns && !isCorrect) btn.classList.add('wrong');
  });

  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

window.nextPracticeQuestion = function() {
  currentPracticeIdx = (currentPracticeIdx + 1) % practicePool.length;
  renderCurrentQuestion();
};

window.trySimilarQuestion = function() {
  const curSkill = currentQuestion ? currentQuestion.skill : null;
  if (!curSkill) { nextPracticeQuestion(); return; }

  const candidates = practicePool.filter((q, idx) => idx !== currentPracticeIdx && q.skill === curSkill);
  if (candidates.length > 0) {
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    currentPracticeIdx = practicePool.indexOf(pick);
    renderCurrentQuestion();
  } else {
    alert('Đã giải quyết hết câu cùng kỹ năng trong gói này, chuyển sang câu kế tiếp!');
    nextPracticeQuestion();
  }
};

// ═══════════════════════════════════════════════════════════════
// SECTION 3: REVIEW (FSRS FLASHCARDS & ERROR ANALYSIS)
// ═══════════════════════════════════════════════════════════════
let flashcardDeck = [];
let currentCardIdx = 0;
let currentFcType = 'vocabulary_direct_hits';

async function renderReview(deckType = null) {
  if (deckType) {
    currentFcType = deckType;
  }

  flashcardDeck = await loadFlashcards(currentFcType);

  let dueCount = 0;
  const now = Date.now();
  flashcardDeck.forEach(c => {
    const s = db.flashcardState[c.card_id];
    if (!s || !s.due || s.due <= now) dueCount++;
  });

  const dueEl = $('#review-fc-due-count');
  if (dueEl) dueEl.textContent = dueCount;

  const errEl = $('#review-mistakes-count');
  const errCount = (db.errors || []).length;
  if (errEl) errEl.textContent = errCount;

  // Populate Review Hero Stats
  const heroDue = $('#review-hero-due-count');
  if (heroDue) heroDue.textContent = dueCount;
  const heroTotal = $('#review-hero-total-mistakes');
  if (heroTotal) heroTotal.textContent = errCount;

  // Error Intelligence Trap Counts
  let trapCount = 0;
  let trap1 = 0, trap2 = 0, trap3 = 0;
  (db.errors || []).forEach(e => {
    if (e.error_type) trapCount++;
    const s = (e.skill || '').toLowerCase();
    if (s.includes('infer') || s.includes('central') || s.includes('evidence')) trap1++;
    if (s.includes('algebra') || s.includes('advanced') || s.includes('equation')) trap2++;
    if (s.includes('word') || s.includes('craft') || s.includes('structure')) trap3++;
  });

  const heroTrap = $('#review-hero-trap-count');
  if (heroTrap) heroTrap.textContent = trapCount;
  const t1 = $('#trap-count-1');
  if (t1) t1.textContent = `${trap1} lần`;
  const t2 = $('#trap-count-2');
  if (t2) t2.textContent = `${trap2} lần`;
  const t3 = $('#trap-count-3');
  if (t3) t3.textContent = `${trap3} lần`;

  // Render Mistake Ledger
  renderMistakeLedger();
}

function renderMistakeLedger() {
  const container = $('#mistakes-list-container');
  if (!container) return;

  if (!db.errors || db.errors.length === 0) {
    container.innerHTML = '<p class="text-muted text-sm py-4 text-center">Chưa ghi nhận lỗi sai nào. Hãy tiếp tục luyện tập!</p>';
    return;
  }

  container.innerHTML = db.errors.slice(0, 10).map(err => `
    <div class="mistake-item-card">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="skill-pill" style="font-size:0.75rem;">${escapeHTML(err.skill)}</span>
          <span class="error-pattern-tag" style="margin-top:0;">${escapeHTML(err.error_type)}</span>
        </div>
        <div class="text-sm">
          <strong>Câu hỏi:</strong> ${escapeHTML(err.question_id)} · Bạn chọn <code>${escapeHTML(err.answer)}</code> (Đáp án đúng: <strong>${escapeHTML(err.correct_answer)}</strong>)
        </div>
      </div>
      <button class="btn btn-outline text-xs" onclick="retryMistakeItem('${escapeHTML(err.skill)}')">Rèn Lại →</button>
    </div>
  `).join('');
}

window.startFlashcardReview = function(deckType = null) {
  const wrapper = $('#flashcard-interactive-wrapper');
  if (!wrapper) return;
  wrapper.style.display = 'block';
  currentCardIdx = 0;
  if (deckType) {
    currentFcType = deckType;
    renderReview(deckType).then(() => renderFlashcardCard());
  } else {
    renderFlashcardCard();
  }
};

window.startSpacedReviewSession = function() {
  startFlashcardReview('mistakes');
};

function renderFlashcardCard() {
  const c = flashcardDeck[currentCardIdx];
  if (!c) return;

  $('#fc-progress-count').textContent = `Thẻ ${currentCardIdx + 1} / ${flashcardDeck.length}`;
  $('#flashcard-element')?.classList.remove('flipped');

  // Deck label
  const deckEl = $('#fc-deck-name');
  if (deckEl) {
    deckEl.textContent = c.category ? `Deck: ${c.category}` : 'Deck: Direct Hits Vocabulary';
  }

  // Front
  const frontMain = $('#fc-front-main');
  const frontContext = $('#fc-front-context');
  if (c.front) {
    if (c.front.word) {
      const phonetic = c.front.phonetic ? `<span style="font-size:1.05rem;color:var(--color-muted-dark);display:block;margin-top:0.35rem;font-family:monospace;font-weight:500;">${escapeHTML(c.front.phonetic)}</span>` : '';
      frontMain.innerHTML = `${escapeHTML(c.front.word)} ${phonetic}`;
      frontContext.textContent = c.front.context ? `"${c.front.context}"` : '';
    } else if (c.front.concept) {
      frontMain.textContent = c.front.concept;
      frontContext.textContent = c.front.formula || '';
    } else if (c.front.phrase) {
      frontMain.textContent = c.front.phrase;
      frontContext.textContent = c.front.function ? `Chức năng: ${c.front.function}` : '';
    }
  }

  // Back
  const backBox = $('#fc-back-content');
  if (backBox && c.back) {
    if (typeof c.back === 'string') {
      backBox.innerHTML = escapeHTML(c.back);
    } else {
      let bHtml = '';
      if (c.back.vietnamese) {
        bHtml += `<div style="font-size:1.15rem;font-weight:700;color:var(--color-primary);margin-bottom:0.5rem;">${escapeHTML(c.back.vietnamese)}</div>`;
      }
      if (c.back.rule) {
        bHtml += `<div style="margin-bottom:0.4rem;font-weight:bold;color:#1D4ED8;">${escapeHTML(c.back.rule)}</div>`;
      }
      if (c.back.meaning) {
        bHtml += `<div style="margin-bottom:0.4rem;color:var(--color-ink);"><strong>Ý nghĩa:</strong> ${escapeHTML(c.back.meaning)}</div>`;
      }
      if (c.back.definition) {
        bHtml += `<div style="margin-bottom:0.4rem;color:var(--color-ink);"><strong>Định nghĩa học thuật:</strong> ${escapeHTML(c.back.definition)}</div>`;
      }
      if (c.back.synonyms && Array.isArray(c.back.synonyms)) {
        bHtml += `<div style="margin-bottom:0.4rem;"><strong>Từ đồng nghĩa:</strong> <span style="color:#0284C7;font-weight:600;">${escapeHTML(c.back.synonyms.join(' • '))}</span></div>`;
      }
      if (c.back.collocations && Array.isArray(c.back.collocations)) {
        bHtml += `<div style="margin-bottom:0.4rem;"><strong>Cụm từ đi kèm (Collocations):</strong> <span style="color:#0284C7;font-weight:600;">${escapeHTML(c.back.collocations.join(' • '))}</span></div>`;
      }
      if (c.back.contrast) {
        bHtml += `<div style="margin-bottom:0.4rem;color:#C74A4A;"><strong>Tránh nhầm lẫn:</strong> ${escapeHTML(c.back.contrast)}</div>`;
      }
      if (c.back.tip) {
        bHtml += `<div style="margin-top:0.4rem;padding:0.45rem 0.65rem;background:#EFF6FF;border-radius:var(--radius);font-size:0.8rem;color:#1E3A8A;">💡 <strong>Mẹo Desmos / Tư duy:</strong> ${escapeHTML(c.back.tip)}</div>`;
      }
      if (c.back.common_error) {
        bHtml += `<div style="margin-top:0.4rem;padding:0.45rem 0.65rem;background:#FEF2F2;border-radius:var(--radius);font-size:0.8rem;color:#991B1B;">⚠️ <strong>Bẫy phổ biến:</strong> ${escapeHTML(c.back.common_error)}</div>`;
      }
      if (c.back.academic_tip) {
        bHtml += `<div style="margin-top:0.5rem;padding:0.45rem 0.65rem;background:var(--color-canvas);border-radius:var(--radius);border:1px solid var(--color-border);font-size:0.8rem;color:var(--color-ink);">💡 <strong>Mẹo sư phạm:</strong> ${escapeHTML(c.back.academic_tip)}</div>`;
      }
      if (!bHtml) {
        bHtml = Object.entries(c.back).map(([k, v]) => `
          <div style="margin-bottom:0.35rem;">
            <strong>${escapeHTML(k)}:</strong> ${Array.isArray(v) ? escapeHTML(v.join(', ')) : escapeHTML(v)}
          </div>
        `).join('');
      }
      backBox.innerHTML = bHtml;
    }
  }
}

window.flipFlashcard = function() {
  $('#flashcard-element')?.classList.toggle('flipped');
};

window.rateFlashcard = function(rating) {
  if (!flashcardDeck || !flashcardDeck.length) return;
  const c = flashcardDeck[currentCardIdx];
  if (c) {
    const cur = db.flashcardState[c.card_id] || { ease: 2.5, interval: 1, reviews: 0 };
    cur.reviews++;
    // P0.8 Fix: Honest SRS interval scaling (Again: 10m, Hard: 1d, Good: 3d, Easy: 7d)
    if (rating === 1) cur.interval = 10 / 1440; // 10 minutes
    else if (rating === 2) cur.interval = 1; // 1 day
    else if (rating === 3) cur.interval = Math.max(3, (cur.interval || 1) * 2.5); // ~3 days
    else if (rating === 4) cur.interval = Math.max(7, (cur.interval || 1) * 4); // ~7 days
    cur.due = Date.now() + cur.interval * 86400000;
    db.flashcardState[c.card_id] = cur;
    save();
  }

  currentCardIdx = (currentCardIdx + 1) % flashcardDeck.length;
  renderFlashcardCard();
};

window.retryMistakeItem = async function(skillName) {
  location.hash = '#practice';
  // P0.7 Fix: Dynamic domain loading so mistakes from any domain can be retrained
  let domainKey = 'rw-info';
  const s = (skillName || '').toLowerCase();
  if (s.includes('algebra')) domainKey = 'math-alg';
  else if (s.includes('advanced')) domainKey = 'math-adv';
  else if (s.includes('problem') || s.includes('data')) domainKey = 'math-psda';
  else if (s.includes('geo') || s.includes('trig')) domainKey = 'math-geo';
  else if (s.includes('boundar') || s.includes('form') || s.includes('sense')) domainKey = 'rw-conv';
  else if (s.includes('transition') || s.includes('rhetorical')) domainKey = 'rw-expr';
  else if (s.includes('context') || s.includes('structure') || s.includes('cross')) domainKey = 'rw-craft';

  selectDomainTab(domainKey);
  await loadPracticeSession(domainKey);

  const similar = practicePool.filter(q => getCanonicalSkill(q) === skillName || q.skill === skillName);
  if (similar.length > 0) {
    currentPracticeIdx = practicePool.indexOf(similar[0]);
    renderCurrentQuestion();
  }
};

// ═══════════════════════════════════════════════════════════════
// SECTION 4: TEST & MOCK EXAMS (6 SPECIALIZED SAT SCENARIOS)
// ═══════════════════════════════════════════════════════════════
let activeExam = {
  testId: null,
  title: '',
  isAdaptiveFull: false,
  fullData: null,
  stage: null,
  stageIndex: 0,
  rwM1Accuracy: 0,
  rwRouting: null,
  mathM1Accuracy: 0,
  mathRouting: null,
  allStagesData: [],
  durationSec: 0,
  secondsRemaining: 0,
  questions: [],
  passages: {},
  userAnswers: {},
  flags: {},
  currentIdx: 0,
  timerInterval: null,
  breakInterval: null,
  breakRemainingSec: 600
};

// ── Defensible SAT Score Band Calculator (P0.2 Fix) ──
function calculateSATScoreBands(rwCorrect, rwRouting, mathCorrect, mathRouting) {
  // RW Section (54 questions):
  let rwMin = 200, rwMax = 800;
  if (rwRouting === 'hard') {
    const pct = rwCorrect / 54;
    rwMin = Math.round(560 + pct * 200);
    rwMax = Math.min(800, rwMin + 50);
  } else {
    const pct = rwCorrect / 54;
    rwMin = Math.round(260 + pct * 290);
    rwMax = Math.min(620, rwMin + 60);
  }

  // Math Section (44 questions):
  let mathMin = 200, mathMax = 800;
  if (mathRouting === 'hard') {
    const pct = mathCorrect / 44;
    mathMin = Math.round(580 + pct * 190);
    mathMax = Math.min(800, mathMin + 40);
  } else {
    const pct = mathCorrect / 44;
    mathMin = Math.round(280 + pct * 300);
    mathMax = Math.min(630, mathMin + 60);
  }

  // Round to nearest 10s (SAT scale)
  rwMin = Math.round(rwMin / 10) * 10;
  rwMax = Math.round(rwMax / 10) * 10;
  mathMin = Math.round(mathMin / 10) * 10;
  mathMax = Math.round(mathMax / 10) * 10;

  const totalMin = rwMin + mathMin;
  const totalMax = rwMax + mathMax;

  return { rwMin, rwMax, mathMin, mathMax, totalMin, totalMax };
}

let pendingExamTestId = null;

window.startPretestCheck = function(testId) {
  pendingExamTestId = testId;
  const modal = $('#pretest-modal');
  if (modal) {
    modal.style.display = 'flex';
    const titleEl = $('#pretest-modal-title');
    if (titleEl) {
      if (testId === 'sat-pt1') titleEl.textContent = 'Chuẩn Bị Bài Thi Thử Số 1 (98 Câu Thích Ứng)';
      else if (testId === 'sat-pt2') titleEl.textContent = 'Chuẩn Bị Bài Thi Thử Số 2 (98 Câu Thích Ứng)';
      else if (testId === 'sat-diagnostic') titleEl.textContent = 'Chuẩn Bị Khảo Sát Chẩn Đoán (30 Câu)';
      else titleEl.textContent = 'Chuẩn Bị Bắt Đầu Bài Thi';
    }
  }
};

window.closePretestModal = function() {
  const modal = $('#pretest-modal');
  if (modal) modal.style.display = 'none';
  pendingExamTestId = null;
};

window.confirmStartExam = function() {
  const modal = $('#pretest-modal');
  if (modal) modal.style.display = 'none';
  const tid = pendingExamTestId || 'sat-pt1';
  pendingExamTestId = null;
  startMockExam('sat', tid);
};

function renderTest() {
  const grid = $('#test-pack-grid');
  if (!grid) return;

  // Restore view if coming back
  const examArea = $('#timed-exam-area');
  const breakArea = $('#timed-break-area');
  const resultsArea = $('#timed-results-area');
  if (examArea) examArea.style.display = 'none';
  if (breakArea) breakArea.style.display = 'none';
  if (resultsArea) resultsArea.style.display = 'none';
  grid.style.display = 'grid';

  grid.innerHTML = `
    <!-- PRIMARY HERO SIMULATION CARD (Spec 10.2 A) -->
    <div class="mock-hero-simulation-card card-pastel-blue mb-4" style="grid-column: 1 / -1; padding:2rem 2.25rem; border-radius:var(--radius-card-xl); border:1px solid rgba(78,102,232,0.18); box-shadow:var(--shadow-card);">
      <div class="flex justify-between items-start flex-wrap gap-4 mb-3">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="plan-badge" style="background:#FFFFFF;color:var(--color-primary);">Chuẩn Khảo Thí Digital SAT 2026</span>
            <span class="plan-badge" style="background:rgba(255,255,255,0.8);color:var(--color-ink);">Adaptive Two-Stage Routing</span>
          </div>
          <h2 class="font-display" style="font-size:1.75rem;font-weight:700;color:var(--color-ink);margin-bottom:0.4rem;">
            Full Digital SAT Simulation (98 Câu · 134 Phút)
          </h2>
          <p class="text-sm text-muted" style="max-width:720px;line-height:1.6;margin:0;">
            Mô phỏng trọn vẹn 2 Section chuẩn College Board: <strong>Reading &amp; Writing (54 câu · 64 phút)</strong> + <strong>Math (44 câu · 70 phút)</strong> kèm 10 phút nghỉ giữa giờ. Hệ thống tự động phân nhánh Module 2 thích ứng hai chặng và xuất báo cáo dải điểm năng lực có căn cứ.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-4 flex-wrap my-4 text-xs font-semibold" style="background:rgba(255,255,255,0.7);padding:0.75rem 1.25rem;border-radius:var(--radius);border:1px solid rgba(78,102,232,0.1);">
        <span>⏱️ 2h24m thời gian liền mạch</span>
        <span class="meta-dot">•</span>
        <span>🔇 Không gian yên tĩnh, không ngắt quãng</span>
        <span class="meta-dot">•</span>
        <span>📐 Giấy nháp &amp; Máy tính Desmos tích hợp</span>
      </div>

      <div class="flex items-center gap-3 flex-wrap pt-2">
        <button class="btn-primary-action text-sm" onclick="startPretestCheck('sat-pt1')">
          <span>▶ Thi Thử Đề 1 (98 Câu Thích Ứng)</span>
        </button>
        <button class="btn-secondary-action text-sm" style="background:#FFF;" onclick="startPretestCheck('sat-pt2')">
          <span>Thi Thử Đề 2 (98 Câu Thích Ứng)</span>
        </button>
      </div>
    </div>

    <!-- SECONDARY SECTION TESTS ROW (Spec 10.2 B) -->
    <div class="test-pack-card">
      <div>
        <span class="plan-badge mb-2" style="background:#EEF2FF;color:#4338CA;">Khảo Sát Nền Tảng</span>
        <h3 class="font-display" style="font-size:1.2rem;font-weight:700;">Diagnostic Baseline Assessment</h3>
        <p class="text-xs text-muted mt-1" style="line-height:1.5;">30 câu hỏi quét đa tầng 15 kỹ năng cốt lõi (Reading, Writing &amp; Math) thiết lập đường cơ sở năng lực và hiệu chỉnh lộ trình Hôm Nay.</p>
      </div>
      <div class="mt-4 pt-3 border-t border-border flex justify-between items-center">
        <span class="text-xs font-semibold">25 phút · 30 câu</span>
        <button class="btn-primary-action text-xs" onclick="startPretestCheck('sat-diagnostic')">Làm Diagnostic →</button>
      </div>
    </div>

    <div class="test-pack-card">
      <div>
        <span class="plan-badge mb-2" style="background:#ECFDF5;color:#065F46;">Math Section Test</span>
        <h3 class="font-display" style="font-size:1.2rem;font-weight:700;">Hard Module Math Sprint</h3>
        <p class="text-xs text-muted mt-1" style="line-height:1.5;">22 câu hỏi phân loại cao (Level 4-5) Advanced Math, Hàm số phi tuyến và Hình học - Lượng giác bứt phá dải điểm 780-800.</p>
      </div>
      <div class="mt-4 pt-3 border-t border-border flex justify-between items-center">
        <span class="text-xs font-semibold">35 phút · 22 câu</span>
        <button class="btn btn-outline text-xs" onclick="startMockExam('sat', 'sat-math-sprint')">Chinh Phục 800 Math →</button>
      </div>
    </div>

    <div class="test-pack-card">
      <div>
        <span class="plan-badge mb-2" style="background:#EFF6FF;color:#1D4ED8;">RW Section Test</span>
        <h3 class="font-display" style="font-size:1.2rem;font-weight:700;">Hard Module RW Sprint</h3>
        <p class="text-xs text-muted mt-1" style="line-height:1.5;">27 câu hỏi phân hóa đỉnh cao: Inferences phức tạp, Bằng chứng định lượng (Command of Evidence) và Cross-Text.</p>
      </div>
      <div class="mt-4 pt-3 border-t border-border flex justify-between items-center">
        <span class="text-xs font-semibold">32 phút · 27 câu</span>
        <button class="btn btn-outline text-xs" onclick="startMockExam('sat', 'sat-rw-sprint')">Bứt Phá 750+ RW →</button>
      </div>
    </div>

    <!-- SPECIALIZED SPRINTS (4 CARDS) -->
    <div class="test-pack-card">
      <div>
        <span class="tag mb-2" style="background:#FEE2E2;color:#991B1B;">Trap Buster Sprint</span>
        <h3 class="font-bold text-sm">Trap Buster: Khắc Chế Bẫy Tư Duy</h3>
        <p class="text-xs text-muted mt-1">10 câu hỏi bẫy kinh điển: Over-Inference, Scope Shift, Faulty Comparison và Dấu câu Comma Splice.</p>
      </div>
      <div class="mt-3 pt-2 border-t border-border flex justify-between items-center">
        <span class="text-xs font-semibold">15 phút · 10 câu</span>
        <button class="btn btn-outline text-xs" onclick="startMockExam('sat', 'sat-trap-buster')">Khắc Chế Bẫy →</button>
      </div>
    </div>

    <div class="test-pack-card">
      <div>
        <span class="tag mb-2" style="background:#ECFDF5;color:#065F46;">Desmos Speed Mastery</span>
        <h3 class="font-bold text-sm">Desmos Speed Hacks &amp; Fast Solver</h3>
        <p class="text-xs text-muted mt-1">12 câu hỏi Algebra &amp; Parabolas giải siêu tốc bằng máy tính đồ thị Desmos (hệ phương trình, số nghiệm, cực trị).</p>
      </div>
      <div class="mt-3 pt-2 border-t border-border flex justify-between items-center">
        <span class="text-xs font-semibold">15 phút · 12 câu</span>
        <button class="btn btn-outline text-xs" onclick="startMockExam('sat', 'sat-desmos-mastery')">Bấm Máy Desmos →</button>
      </div>
    </div>

    <div class="test-pack-card">
      <div>
        <span class="tag mb-2" style="background:#FEF3C7;color:#92400E;">Vocab Direct Hits</span>
        <h3 class="font-bold text-sm">Vocabulary Direct Hits Marathon</h3>
        <p class="text-xs text-muted mt-1">15 câu Words in Context &amp; Nghĩa phụ (Secondary Meanings) học thuật nâng cao xuất hiện dày đặc trong đề SAT.</p>
      </div>
      <div class="mt-3 pt-2 border-t border-border flex justify-between items-center">
        <span class="text-xs font-semibold">15 phút · 15 câu</span>
        <button class="btn btn-outline text-xs" onclick="startMockExam('sat', 'sat-vocab-marathon')">Luyện Marathon →</button>
      </div>
    </div>

    <div class="test-pack-card">
      <div>
        <span class="tag mb-2" style="background:#E0E7FF;color:#3730A3;">Chẩn Đoán 15 Kỹ Năng</span>
        <h3 class="font-bold text-sm">Full Diagnostic Checkpoint</h3>
        <p class="text-xs text-muted mt-1">Quét toàn diện 4 miền Reading &amp; Writing và 4 miền Math để thiết lập lộ trình học tập cá nhân hóa.</p>
      </div>
      <div class="mt-3 pt-2 border-t border-border flex justify-between items-center">
        <span class="text-xs font-semibold">25 phút · 30 câu</span>
        <button class="btn btn-outline text-xs" onclick="startPretestCheck('sat-diagnostic')">Chẩn Đoán Nhanh →</button>
      </div>
    </div>
  `;
}

window.startMockExam = async function(examType, testId) {
  try {
    if (testId === 'sat-pt1' || testId === 'sat-pt2') {
      const num = testId.replace('sat-pt', '');
      const r = await fetch(`data/practice_tests/practice_test_${num}.json`);
      const d = await r.json();

      activeExam = {
        testId,
        title: d.title || `Digital SAT Practice Test ${num}`,
        isAdaptiveFull: true,
        fullData: d,
        stage: 'RW_M1',
        stageIndex: 0,
        rwM1Accuracy: 0,
        rwRouting: null,
        mathM1Accuracy: 0,
        mathRouting: null,
        allStagesData: [],
        durationSec: 32 * 60,
        secondsRemaining: 32 * 60,
        questions: [],
        passages: {},
        userAnswers: {},
        flags: {},
        currentIdx: 0,
        timerInterval: null,
        breakInterval: null,
        breakRemainingSec: 600
      };

      startAdaptiveStage('RW_M1');
      return;
    }

    let questions = [];
    let title = '';
    let durationMinutes = 20;

    if (testId === 'sat-diagnostic') {
      title = 'Diagnostic Baseline Assessment (30 Câu Chẩn Đoán)';
      durationMinutes = 25;
      questions = await loadQuestions('diagnostic');
    } else if (testId === 'sat-trap-buster') {
      title = 'Trap Buster: Khắc Chế Bẫy Tư Duy (10 Câu)';
      durationMinutes = 15;
      const info = await loadQuestions('rw-info');
      const craft = await loadQuestions('rw-craft');
      const conv = await loadQuestions('rw-conv');
      const pool = [
        ...info.filter(q => q.skill === 'Inferences' || q.difficulty >= 4),
        ...craft.filter(q => q.skill === 'Cross-Text Connections' || q.difficulty >= 4),
        ...conv.filter(q => q.skill === 'Boundaries')
      ];
      questions = pool.slice(0, 10);
    } else if (testId === 'sat-desmos-mastery') {
      title = 'Desmos Speed Hacks & Fast Solver (12 Câu)';
      durationMinutes = 15;
      const alg = await loadQuestions('math-alg');
      const adv = await loadQuestions('math-adv');
      questions = [...alg.slice(0, 6), ...adv.slice(0, 6)];
    } else if (testId === 'sat-vocab-marathon') {
      title = 'Vocabulary Direct Hits Marathon (15 Câu)';
      durationMinutes = 15;
      const craft = await loadQuestions('rw-craft');
      questions = craft.filter(q => q.skill === 'Words in Context').slice(0, 15);
    } else if (testId === 'sat-math-sprint') {
      title = 'Hard Module Math Sprint (Level 4-5 • 22 Câu)';
      durationMinutes = 35;
      const adv = await loadQuestions('math-adv');
      const geo = await loadQuestions('math-geo');
      const alg = await loadQuestions('math-alg');
      const hardPool = [
        ...adv.filter(q => q.difficulty >= 4),
        ...geo.filter(q => q.difficulty >= 4),
        ...alg.filter(q => q.difficulty >= 4)
      ];
      questions = hardPool.slice(0, 22);
    } else if (testId === 'sat-rw-sprint') {
      title = 'Hard Module Reading & Writing Sprint (Level 4-5 • 27 Câu)';
      durationMinutes = 32;
      const info = await loadQuestions('rw-info');
      const craft = await loadQuestions('rw-craft');
      const hardPool = [
        ...info.filter(q => q.difficulty >= 4),
        ...craft.filter(q => q.difficulty >= 4)
      ];
      questions = hardPool.slice(0, 27);
    }

    if (!questions || questions.length === 0) {
      alert('Đề thi đang được cập nhật!');
      return;
    }

    activeExam = {
      testId,
      title,
      isAdaptiveFull: false,
      fullData: null,
      stage: null,
      allStagesData: [],
      durationSec: durationMinutes * 60,
      secondsRemaining: durationMinutes * 60,
      questions,
      passages: {},
      userAnswers: {},
      flags: {},
      currentIdx: 0,
      timerInterval: null
    };

    $('#test-pack-grid').style.display = 'none';
    $('#timed-break-area').style.display = 'none';
    $('#timed-results-area').style.display = 'none';
    $('#timed-exam-area').style.display = 'block';

    $('#timed-exam-badge').textContent = testId === 'sat-diagnostic' ? 'Khảo Sát Ban Đầu' : 'Single Module Sprint';
    $('#timed-exam-title').textContent = title;

    renderExamPalette();
    renderExamQuestion(0);
    startExamTimer();
  } catch (e) {
    console.error('Failed to load exam data:', e);
    alert('Không thể nạp dữ liệu bài thi. Vui lòng thử lại!');
  }
};

function startAdaptiveStage(stage) {
  if (activeExam.timerInterval) clearInterval(activeExam.timerInterval);
  if (activeExam.breakInterval) clearInterval(activeExam.breakInterval);

  $('#test-pack-grid').style.display = 'none';
  $('#timed-break-area').style.display = 'none';
  $('#adaptive-transition-modal').style.display = 'none';
  $('#timed-results-area').style.display = 'none';
  $('#timed-exam-area').style.display = 'block';

  activeExam.stage = stage;
  activeExam.userAnswers = {};
  activeExam.flags = {};
  activeExam.currentIdx = 0;

  if (stage === 'RW_M1') {
    activeExam.questions = activeExam.fullData.reading_and_writing.module_1;
    activeExam.durationSec = 32 * 60;
    activeExam.secondsRemaining = 32 * 60;
    $('#timed-exam-badge').textContent = 'Section 1: RW — Module 1';
    $('#timed-exam-title').textContent = `${activeExam.title} (Module 1/4 · 27 câu / 32m)`;
  } else if (stage === 'RW_M2') {
    activeExam.questions = activeExam.rwRouting === 'hard' 
      ? activeExam.fullData.reading_and_writing.module_2_hard 
      : activeExam.fullData.reading_and_writing.module_2_standard;
    activeExam.durationSec = 32 * 60;
    activeExam.secondsRemaining = 32 * 60;
    $('#timed-exam-badge').textContent = `Section 1: RW — Module 2 (${activeExam.rwRouting === 'hard' ? 'Hard' : 'Standard'})`;
    $('#timed-exam-title').textContent = `${activeExam.title} (Module 2/4 · 27 câu / 32m)`;
  } else if (stage === 'MATH_M1') {
    activeExam.questions = activeExam.fullData.math.module_1;
    activeExam.durationSec = 35 * 60;
    activeExam.secondsRemaining = 35 * 60;
    $('#timed-exam-badge').textContent = 'Section 2: Math — Module 1';
    $('#timed-exam-title').textContent = `${activeExam.title} (Module 3/4 · 22 câu / 35m)`;
  } else if (stage === 'MATH_M2') {
    activeExam.questions = activeExam.mathRouting === 'hard' 
      ? activeExam.fullData.math.module_2_hard 
      : activeExam.fullData.math.module_2_standard;
    activeExam.durationSec = 35 * 60;
    activeExam.secondsRemaining = 35 * 60;
    $('#timed-exam-badge').textContent = `Section 2: Math — Module 2 (${activeExam.mathRouting === 'hard' ? 'Hard' : 'Standard'})`;
    $('#timed-exam-title').textContent = `${activeExam.title} (Module 4/4 · 22 câu / 35m)`;
  }

  renderExamPalette();
  renderExamQuestion(0);
  startExamTimer();
}

window.startRoutedModule = function() {
  $('#adaptive-transition-modal').style.display = 'none';
  if (activeExam.stage === 'RW_M1') {
    startAdaptiveStage('RW_M2');
  } else if (activeExam.stage === 'MATH_M1') {
    startAdaptiveStage('MATH_M2');
  }
};

window.skipExamBreak = function() {
  if (activeExam.breakInterval) {
    clearInterval(activeExam.breakInterval);
    activeExam.breakInterval = null;
  }
  $('#timed-break-area').style.display = 'none';
  startAdaptiveStage('MATH_M1');
};

function updateBreakTimerDisplay() {
  const el = $('#break-timer-display');
  if (!el) return;
  const m = Math.floor(activeExam.breakRemainingSec / 60);
  const s = activeExam.breakRemainingSec % 60;
  el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function startExamTimer() {
  if (activeExam.timerInterval) clearInterval(activeExam.timerInterval);
  updateTimerDisplay();

  activeExam.timerInterval = setInterval(() => {
    activeExam.secondsRemaining--;
    updateTimerDisplay();

    if (activeExam.secondsRemaining <= 0) {
      clearInterval(activeExam.timerInterval);
      alert('Hết giờ làm bài của Module hiện tại! Hệ thống đang lưu kết quả và chuyển chặng.');
      finishTimedSession();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = $('#timed-timer');
  if (!el) return;

  const sec = Math.max(0, activeExam.secondsRemaining);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  if (sec <= 300) {
    el.style.color = 'var(--color-error)';
    el.style.borderColor = 'var(--color-error)';
  } else {
    el.style.color = 'var(--color-ink)';
    el.style.borderColor = 'var(--color-border)';
  }
}

function renderExamPalette() {
  const container = $('#timed-palette-container');
  if (!container) return;

  container.innerHTML = activeExam.questions.map((q, idx) => {
    const isCurrent = idx === activeExam.currentIdx;
    const isAnswered = activeExam.userAnswers[idx] !== undefined && activeExam.userAnswers[idx] !== null && activeExam.userAnswers[idx] !== '';
    const isFlagged = !!activeExam.flags[idx];

    let cls = 'palette-q-btn';
    if (isCurrent) cls += ' current';
    if (isAnswered) cls += ' answered';
    if (isFlagged) cls += ' flagged';

    return `<button class="${cls}" onclick="jumpToExamQuestion(${idx})">${idx + 1}</button>`;
  }).join('');

  // Update answered count
  const ansCount = Object.keys(activeExam.userAnswers).filter(k => activeExam.userAnswers[k] !== '' && activeExam.userAnswers[k] !== null).length;
  $('#timed-answered-count').textContent = `${ansCount}/${activeExam.questions.length} đã trả lời`;
  $('#timed-exam-status').textContent = `Câu ${activeExam.currentIdx + 1} / ${activeExam.questions.length}`;
}

function renderExamQuestion(idx) {
  activeExam.currentIdx = idx;
  const q = activeExam.questions[idx];
  if (!q) return;

  const renderArea = $('#timed-question-render');
  if (!renderArea) return;

  const isMath = isMathQuestion(q);
  const desmosBtn = $('#timed-desmos-btn');
  if (desmosBtn) {
    if (isMath) desmosBtn.classList.remove('hidden');
    else desmosBtn.classList.add('hidden');
  }

  // Update flag button state
  const flagBtn = $('#timed-flag-btn');
  if (flagBtn) {
    flagBtn.textContent = activeExam.flags[idx] ? '🚩 Bỏ Đánh Dấu' : '🚩 Đánh Dấu';
  }

  // Handle Passage
  let passageContent = q.passage || '';
  if (!passageContent && q.passage_id && activeExam.passages[q.passage_id]) {
    passageContent = activeExam.passages[q.passage_id].text;
  }

  // Choices or Grid-in
  let choicesHtml = '';
  const userAns = activeExam.userAnswers[idx];

  if (q.choices) {
    choicesHtml = Object.entries(q.choices).map(([letter, text]) => {
      const isSelected = userAns === letter;
      return `
        <button class="answer-option ${isSelected ? 'selected' : ''}" onclick="selectExamAnswer('${letter}')">
          <span class="choice-letter">${letter}</span>
          <span class="choice-text">${escapeHTML(text)}</span>
        </button>
      `;
    }).join('');
  } else if (q.is_grid_in) {
    choicesHtml = `
      <div style="padding:1rem 0;">
        <label class="text-sm font-semibold text-muted block mb-2">Nhập kết quả số (Student-Produced Response):</label>
        <input type="text" class="grid-in-input" value="${escapeHTML(userAns || '')}" onchange="selectExamAnswer(this.value)" placeholder="e.g. 4.5 or 12" />
      </div>
    `;
  }

  renderArea.innerHTML = `
    <div class="exam-split-layout">
      ${passageContent ? `
        <div class="exam-passage-pane">
          <div class="text-xs text-muted mb-2 font-bold uppercase tracking-wider">Đoạn Văn Bài Thi:</div>
          <div style="line-height:1.7;">${escapeHTML(passageContent)}</div>
        </div>
      ` : ''}
      <div class="exam-question-pane" style="${!passageContent ? 'grid-column: 1 / -1; max-width:800px; margin:0 auto;' : ''}">
        <div class="flex items-center gap-2 mb-2">
          <span class="skill-pill">${escapeHTML(getCanonicalSkill(q))}</span>
          <span class="difficulty-tag">Level ${q.difficulty || 3}</span>
        </div>
        <p class="question-stem mb-4">${escapeHTML(q.question_stem || '')}</p>
        <div class="choices-list">${choicesHtml}</div>
      </div>
    </div>
  `;

  renderExamPalette();
}

window.jumpToExamQuestion = function(idx) {
  renderExamQuestion(idx);
};

window.selectExamAnswer = function(ans) {
  activeExam.userAnswers[activeExam.currentIdx] = ans;
  renderExamPalette();
  $$('#timed-question-render .answer-option').forEach(btn => {
    btn.classList.toggle('selected', btn.querySelector('.choice-letter')?.textContent === ans);
  });
};

window.toggleExamFlag = function() {
  const idx = activeExam.currentIdx;
  activeExam.flags[idx] = !activeExam.flags[idx];
  renderExamPalette();
  const flagBtn = $('#timed-flag-btn');
  if (flagBtn) {
    flagBtn.textContent = activeExam.flags[idx] ? '🚩 Bỏ Đánh Dấu' : '🚩 Đánh Dấu';
  }
};

window.prevTimedQuestion = function() {
  if (activeExam.currentIdx > 0) {
    renderExamQuestion(activeExam.currentIdx - 1);
  }
};

window.nextTimedQuestion = function() {
  if (activeExam.currentIdx < activeExam.questions.length - 1) {
    renderExamQuestion(activeExam.currentIdx + 1);
  }
};

window.exitTimedSession = function() {
  if (confirm('Bạn có chắc chắn muốn thoát bài thi? Tiến trình bài làm hiện tại sẽ không được lưu.')) {
    if (activeExam.timerInterval) clearInterval(activeExam.timerInterval);
    if (activeExam.breakInterval) clearInterval(activeExam.breakInterval);
    $('#timed-exam-area').style.display = 'none';
    $('#timed-break-area').style.display = 'none';
    $('#adaptive-transition-modal').style.display = 'none';
    $('#test-pack-grid').style.display = 'grid';
  }
};

window.finishTimedSession = function() {
  if (activeExam.timerInterval) clearInterval(activeExam.timerInterval);
  activeExam.timerInterval = null;

  const timeSpentSec = Math.max(1, activeExam.durationSec - Math.max(0, activeExam.secondsRemaining));
  db.totalStudyTimeSec = (db.totalStudyTimeSec || 0) + timeSpentSec;

  let stageCorrect = 0;
  activeExam.questions.forEach((q, idx) => {
    const userAns = activeExam.userAnswers[idx];
    const isCorrect = isAnswerCorrect(userAns, q.correct_answer);
    if (isCorrect) stageCorrect++;

    // P0.6 Fix: Update Canonical DB Skills
    const canonicalSkill = getCanonicalSkill(q);
    if (!db.skills[canonicalSkill]) db.skills[canonicalSkill] = { correct: 0, total: 0, history: [] };
    db.skills[canonicalSkill].total++;
    if (isCorrect) db.skills[canonicalSkill].correct++;
    db.skills[canonicalSkill].history.push({ correct: isCorrect, timestamp: Date.now(), timeTakenSec: Math.round(timeSpentSec / activeExam.questions.length) });

    // P0.7 Fix: Record Error with stable attempt_id and distractor-specific trap classification
    if (!isCorrect && userAns) {
      const attemptId = 'ATT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
      db.errors.unshift({
        attempt_id: attemptId,
        question_id: q.question_id || ('EXAM-Q-' + idx),
        domain: q.domain || 'Digital SAT',
        skill: canonicalSkill,
        raw_skill: q.skill,
        answer: userAns,
        correct_answer: q.correct_answer,
        error_type: classifyDistractorTrap(q, userAns),
        timestamp: Date.now()
      });
      if (db.errors.length > 100) db.errors.pop();
    }
  });

  save();

  if (activeExam.isAdaptiveFull) {
    activeExam.allStagesData.push({
      stage: activeExam.stage,
      questions: [...activeExam.questions],
      userAnswers: { ...activeExam.userAnswers },
      correct: stageCorrect,
      total: activeExam.questions.length,
      timeSpentSec
    });

    if (activeExam.stage === 'RW_M1') {
      const acc = stageCorrect / activeExam.questions.length;
      activeExam.rwM1Accuracy = Math.round(acc * 100);
      activeExam.rwRouting = acc >= 0.65 ? 'hard' : 'standard';

      $('#timed-exam-area').style.display = 'none';
      const modal = $('#adaptive-transition-modal');
      if (modal) {
        modal.style.display = 'flex';
        $('#adaptive-route-title').textContent = 'Hoàn Thành Reading & Writing Module 1';
        $('#adaptive-route-desc').innerHTML = `Module 1 đã hoàn tất.<br><br>Hệ thống khảo thí đã sẵn sàng <strong>Module 2</strong> thích ứng theo tiến trình làm bài của bạn.`;
        $('#adaptive-route-continue-btn').textContent = 'Bắt Đầu Module 2 Tiếp Theo (32 phút) →';
      }
      return;
    }

    if (activeExam.stage === 'RW_M2') {
      $('#timed-exam-area').style.display = 'none';
      const breakArea = $('#timed-break-area');
      if (breakArea) {
        breakArea.style.display = 'block';
        activeExam.breakRemainingSec = 600;
        updateBreakTimerDisplay();
        activeExam.breakInterval = setInterval(() => {
          activeExam.breakRemainingSec--;
          updateBreakTimerDisplay();
          if (activeExam.breakRemainingSec <= 0) {
            skipExamBreak();
          }
        }, 1000);
      }
      return;
    }

    if (activeExam.stage === 'MATH_M1') {
      const acc = stageCorrect / activeExam.questions.length;
      activeExam.mathM1Accuracy = Math.round(acc * 100);
      activeExam.mathRouting = acc >= 0.65 ? 'hard' : 'standard';

      $('#timed-exam-area').style.display = 'none';
      const modal = $('#adaptive-transition-modal');
      if (modal) {
        modal.style.display = 'flex';
        $('#adaptive-route-title').textContent = 'Hoàn Thành Math Module 1';
        $('#adaptive-route-desc').innerHTML = `Module 1 đã hoàn tất.<br><br>Hệ thống khảo thí đã sẵn sàng <strong>Module 2</strong> thích ứng theo tiến trình làm bài của bạn.`;
        $('#adaptive-route-continue-btn').textContent = 'Bắt Đầu Module 2 Tiếp Theo (35 phút) →';
      }
      return;
    }

    if (activeExam.stage === 'MATH_M2') {
      showFullAdaptiveResults();
      return;
    }
  } else {
    // Single Test or Diagnostic
    if (activeExam.testId === 'sat-diagnostic') {
      if (db.profile) {
        db.profile.diagnosticCompleted = true;
        save();
      }
    }
    showTestResults(stageCorrect, activeExam.questions.length, timeSpentSec);
  }
};

function showFullAdaptiveResults() {
  $('#timed-exam-area').style.display = 'none';
  $('#timed-break-area').style.display = 'none';
  $('#adaptive-transition-modal').style.display = 'none';

  const resultsArea = $('#timed-results-area');
  if (!resultsArea) return;
  resultsArea.style.display = 'block';

  const rwM1 = activeExam.allStagesData.find(d => d.stage === 'RW_M1');
  const rwM2 = activeExam.allStagesData.find(d => d.stage === 'RW_M2');
  const mathM1 = activeExam.allStagesData.find(d => d.stage === 'MATH_M1');
  const mathM2 = activeExam.allStagesData.find(d => d.stage === 'MATH_M2');

  const rwCorrect = (rwM1?.correct || 0) + (rwM2?.correct || 0);
  const mathCorrect = (mathM1?.correct || 0) + (mathM2?.correct || 0);
  const totalCorrect = rwCorrect + mathCorrect;
  const totalQuestions = 98;
  const overallPct = Math.round((totalCorrect / totalQuestions) * 100);

  const bands = calculateSATScoreBands(rwCorrect, activeExam.rwRouting, mathCorrect, activeExam.mathRouting);

  let totalTimeSpent = 0;
  activeExam.allStagesData.forEach(d => totalTimeSpent += (d.timeSpentSec || 0));
  const timeStr = `${Math.floor(totalTimeSpent / 60)}m ${totalTimeSpent % 60}s`;

  let reviewHtml = '';
  const stageLabels = {
    'RW_M1': 'Section 1 · Reading & Writing Module 1 (27 câu)',
    'RW_M2': `Section 1 · Reading & Writing Module 2 [${activeExam.rwRouting === 'hard' ? 'Hard' : 'Standard'}] (27 câu)`,
    'MATH_M1': 'Section 2 · Math Module 1 (22 câu)',
    'MATH_M2': `Section 2 · Math Module 2 [${activeExam.mathRouting === 'hard' ? 'Hard' : 'Standard'}] (22 câu)`
  };

  activeExam.allStagesData.forEach(stageData => {
    reviewHtml += `
      <div style="margin-top:1.5rem;margin-bottom:0.75rem;padding-bottom:0.5rem;border-bottom:2px solid var(--color-border);font-size:1.05rem;font-weight:800;color:var(--color-primary);">
        📌 ${stageLabels[stageData.stage] || stageData.stage} — Đúng ${stageData.correct}/${stageData.total} (${Math.round((stageData.correct/stageData.total)*100)}%)
      </div>
    `;

    stageData.questions.forEach((q, idx) => {
      const userAns = stageData.userAnswers[idx] || 'Chưa trả lời';
      const isCorrect = userAns !== 'Chưa trả lời' && isAnswerCorrect(userAns, q.correct_answer);

      let whyNot = '';
      if (q.why_others_wrong && typeof q.why_others_wrong === 'object') {
        whyNot = Object.entries(q.why_others_wrong).map(([k, v]) => `<div><strong>Phương án ${k}:</strong> ${escapeHTML(v)}</div>`).join('');
      } else {
        whyNot = 'Các phương án còn lại chứa bẫy suy diễn vượt quá phạm vi hoặc sai lệch logic.';
      }

      reviewHtml += `
        <div class="test-review-q-item ${isCorrect ? 'correct' : 'incorrect'}">
          <div class="flex justify-between items-center mb-2 flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="skill-pill text-xs">Câu ${idx + 1}: ${escapeHTML(getCanonicalSkill(q))}</span>
              <span class="text-xs font-semibold ${isCorrect ? 'text-success' : 'text-error'}">
                ${isCorrect ? '✓ Đúng' : '⚠️ Sai'}
              </span>
            </div>
            <span class="text-xs text-muted">Bạn chọn: <strong>${escapeHTML(userAns)}</strong> | Đáp án đúng: <strong class="text-success">${escapeHTML(q.correct_answer)}</strong></span>
          </div>
          <p class="text-sm font-semibold mb-2">${escapeHTML(q.question_stem || '')}</p>
          
          <details class="text-xs mt-2" style="background:var(--color-canvas);border-radius:var(--radius);padding:0.75rem;border:1px solid var(--color-border);">
            <summary class="font-bold cursor-pointer text-primary">📖 Bóc Tách Bẫy Lỗi &amp; Khung Tư Duy Chi Tiết</summary>
            <div class="mt-3 flex-col gap-2" style="line-height:1.6;">
              <div><strong class="text-success">02 Bằng chứng đáp án đúng:</strong> ${escapeHTML(q.explanation || '')}</div>
              <div class="mt-1"><strong>03 Phân tích bẫy phương án sai:</strong><div class="pl-2 mt-1">${whyNot}</div></div>
              <div class="mt-1"><strong>04 Khung tư duy:</strong> ${escapeHTML(q.thinking_framework || 'Đối chiếu ngữ nghĩa và ranh giới logic')}</div>
              <div class="mt-1"><strong>05 Bẫy nhận thức:</strong> <span class="error-pattern-tag" style="margin-top:0;">${escapeHTML(classifyDistractorTrap(q, userAns))}</span> — ${escapeHTML(q.common_trap || '')}</div>
              ${q.socratic_prompt ? `<div class="mt-1" style="color:var(--color-primary);"><strong>06 Gợi mở Socratic:</strong> <em>"${escapeHTML(q.socratic_prompt)}"</em></div>` : ''}
            </div>
          </details>
        </div>
      `;
    });
  });

  resultsArea.innerHTML = `
    <div class="test-score-banner">
      <span class="plan-badge mb-2" style="background:rgba(255,255,255,0.15);color:white;border-color:rgba(255,255,255,0.3);">Digital SAT Full Adaptive Simulation (98 Câu)</span>
      <div class="test-score-number" style="font-size:2.8rem;">Dự Phóng Năng Lực: ${bands.totalMin} – ${bands.totalMax}</div>
      <p class="text-sm" style="color:#E2E8F0;margin-top:0.5rem;">
        Tổng điểm đúng: <strong>${totalCorrect}/98 (${overallPct}%)</strong> · Thời gian làm bài: <strong>${timeStr}</strong>
      </p>
      
      <!-- Section Bands Grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:1rem;margin-top:1.5rem;text-align:left;">
        <div style="background:rgba(255,255,255,0.12);padding:1rem;border-radius:8px;border:1px solid rgba(255,255,255,0.2);">
          <div style="font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:#93C5FD;font-weight:700;">Reading &amp; Writing Section</div>
          <div style="font-size:1.6rem;font-weight:800;color:white;margin:0.25rem 0;">${bands.rwMin} – ${bands.rwMax}</div>
          <div style="font-size:0.75rem;color:#E2E8F0;">Module 1: ${rwM1?.correct || 0}/27 ➔ Module 2 (${activeExam.rwRouting === 'hard' ? 'Hard' : 'Standard'}): ${rwM2?.correct || 0}/27</div>
          <div style="font-size:0.75rem;color:#CBD5E1;margin-top:0.25rem;">Tổng RW: ${rwCorrect}/54 câu</div>
        </div>

        <div style="background:rgba(255,255,255,0.12);padding:1rem;border-radius:8px;border:1px solid rgba(255,255,255,0.2);">
          <div style="font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:#86EFAC;font-weight:700;">Math Section</div>
          <div style="font-size:1.6rem;font-weight:800;color:white;margin:0.25rem 0;">${bands.mathMin} – ${bands.mathMax}</div>
          <div style="font-size:0.75rem;color:#E2E8F0;">Module 1: ${mathM1?.correct || 0}/22 ➔ Module 2 (${activeExam.mathRouting === 'hard' ? 'Hard' : 'Standard'}): ${mathM2?.correct || 0}/22</div>
          <div style="font-size:0.75rem;color:#CBD5E1;margin-top:0.25rem;">Tổng Math: ${mathCorrect}/44 câu</div>
        </div>
      </div>

      <p style="font-size:0.72rem;color:#CBD5E1;margin-top:1.25rem;font-style:italic;">
        *Lưu ý khảo thí: Điểm số trên là dải dự phóng năng lực dựa trên cấu trúc phân nhánh thích ứng 2 chặng (Multi-Stage Adaptive Simulation). Đây không phải là điểm số chính thức từ College Board.
      </p>

      <div class="flex justify-center gap-3 mt-4 flex-wrap">
        <button class="btn btn-outline" style="color:white;border-color:white;" onclick="closeTestResults()">Quay Về Danh Sách Đề</button>
        <button class="btn" style="background:white;color:var(--color-ink);font-weight:700;" onclick="exportPDFReport('scorecard')">🖨️ In Phiếu Điểm (Print/PDF)</button>
      </div>
    </div>

    <h3 style="font-size:1.2rem;font-weight:800;margin-bottom:1rem;">Bóc Tách Toàn Bộ 98 Câu Bài Làm &amp; Chẩn Đoán Lỗi Nhận Thức</h3>
    <div class="flex-col gap-3">${reviewHtml}</div>
  `;

  window.scrollTo(0, 0);
}

function showTestResults(correct, total, timeSpentSec) {
  $('#timed-exam-area').style.display = 'none';
  const resultsArea = $('#timed-results-area');
  if (!resultsArea) return;
  resultsArea.style.display = 'block';

  const pct = Math.round((correct / total) * 100);
  const isDiagnostic = activeExam.testId === 'sat-diagnostic';

  let bandTitle = '';
  let bandSub = '';
  if (isDiagnostic) {
    const estMin = Math.round(900 + pct * 6);
    const estMax = Math.min(1560, estMin + 90);
    const roundMin = Math.round(estMin / 10) * 10;
    const roundMax = Math.round(estMax / 10) * 10;
    bandTitle = `Đường Cơ Sở Năng Lực: ${roundMin} – ${roundMax}`;
    bandSub = `Khảo sát chẩn đoán đầu vào hoàn thành · Độ chính xác: ${pct}% (${correct}/${total} câu) · Thời gian: ${Math.floor(timeSpentSec / 60)}m ${timeSpentSec % 60}s`;
  } else {
    bandTitle = `Độ Chính Xác Chuyên Đề: ${pct}% (${correct}/${total} câu)`;
    bandSub = `Khảo thí dạng bài tập trung · Thời gian làm bài: ${Math.floor(timeSpentSec / 60)}m ${timeSpentSec % 60}s`;
  }

  const reviewHtml = activeExam.questions.map((q, idx) => {
    const userAns = activeExam.userAnswers[idx] || 'Chưa trả lời';
    const isCorrect = userAns !== 'Chưa trả lời' && isAnswerCorrect(userAns, q.correct_answer);

    let whyNot = '';
    if (q.why_others_wrong && typeof q.why_others_wrong === 'object') {
      whyNot = Object.entries(q.why_others_wrong).map(([k, v]) => `<div><strong>Phương án ${k}:</strong> ${escapeHTML(v)}</div>`).join('');
    } else {
      whyNot = 'Các phương án còn lại chứa bẫy suy diễn vượt quá phạm vi hoặc sai lệch logic.';
    }

    return `
      <div class="test-review-q-item ${isCorrect ? 'correct' : 'incorrect'}">
        <div class="flex justify-between items-center mb-2 flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="skill-pill text-xs">Câu ${idx + 1}: ${escapeHTML(getCanonicalSkill(q))}</span>
            <span class="text-xs font-semibold ${isCorrect ? 'text-success' : 'text-error'}">
              ${isCorrect ? '✓ Đúng' : '⚠️ Sai'}
            </span>
          </div>
          <span class="text-xs text-muted">Bạn chọn: <strong>${escapeHTML(userAns)}</strong> | Đáp án đúng: <strong class="text-success">${escapeHTML(q.correct_answer)}</strong></span>
        </div>
        <p class="text-sm font-semibold mb-2">${escapeHTML(q.question_stem || '')}</p>
        
        <details class="text-xs mt-2" style="background:var(--color-canvas);border-radius:var(--radius);padding:0.75rem;border:1px solid var(--color-border);">
          <summary class="font-bold cursor-pointer text-primary">📖 Xem Bóc Tách Bẫy Lỗi &amp; Khung Tư Duy Chi Tiết</summary>
          <div class="mt-3 flex-col gap-2" style="line-height:1.6;">
            <div><strong class="text-success">02 Bằng chứng đáp án đúng:</strong> ${escapeHTML(q.explanation || '')}</div>
            <div class="mt-1"><strong>03 Phân tích bẫy phương án sai:</strong><div class="pl-2 mt-1">${whyNot}</div></div>
            <div class="mt-1"><strong>04 Khung tư duy:</strong> ${escapeHTML(q.thinking_framework || 'Đối chiếu ngữ nghĩa và ranh giới logic')}</div>
            <div class="mt-1"><strong>05 Bẫy nhận thức:</strong> <span class="error-pattern-tag" style="margin-top:0;">${escapeHTML(classifyDistractorTrap(q, userAns))}</span> — ${escapeHTML(q.common_trap || '')}</div>
            ${q.socratic_prompt ? `<div class="mt-1" style="color:var(--color-primary);"><strong>06 Gợi mở Socratic:</strong> <em>"${escapeHTML(q.socratic_prompt)}"</em></div>` : ''}
          </div>
        </details>
      </div>
    `;
  }).join('');

  resultsArea.innerHTML = `
    <div class="test-score-banner">
      <span class="plan-badge mb-2" style="background:rgba(255,255,255,0.15);color:white;border-color:rgba(255,255,255,0.3);">${escapeHTML(activeExam.title)}</span>
      <div class="test-score-number" style="font-size:2.2rem;">${bandTitle}</div>
      <p class="text-sm" style="color:#E2E8F0;">${bandSub}</p>
      ${isDiagnostic ? '<p style="font-size:0.75rem;color:#CBD5E1;margin-top:0.5rem;font-style:italic;">*Dự phóng mức điểm ban đầu từ 30 câu khảo sát. Lộ trình học Hôm Nay đã được cập nhật tương ứng.</p>' : ''}
      <div class="flex justify-center gap-3 mt-4 flex-wrap">
        <button class="btn btn-outline" style="color:white;border-color:white;" onclick="closeTestResults()">Quay Về Danh Sách Đề</button>
        <button class="btn" style="background:white;color:var(--color-ink);font-weight:700;" onclick="exportPDFReport('scorecard')">🖨️ In Phiếu Điểm (Print/PDF)</button>
      </div>
    </div>

    <h3 style="font-size:1.2rem;font-weight:800;margin-bottom:1rem;">Bóc Tách Toàn Bộ Bài Làm &amp; Chẩn Đoán Lỗi Nhận Thức</h3>
    <div class="flex-col gap-3">${reviewHtml}</div>
  `;

  window.scrollTo(0, 0);
}

window.closeTestResults = function() {
  $('#timed-results-area').style.display = 'none';
  $('#test-pack-grid').style.display = 'grid';
  renderTest();
};

window.startTimedSession = function(mode) {
  startMockExam('sat', mode === 'math' ? 'sat-math-sprint' : 'sat-rw-sprint');
};

window.startMockTest = function() {
  startMockExam('sat', 'sat-pt1');
};

// ═══════════════════════════════════════════════════════════════
// SECTION 5: PROGRESS & PARENT COMPANION
// ═══════════════════════════════════════════════════════════════
function renderProgress() {
  // Aggregate canonical domains & skills
  const rwDomainSkills = {
    'Information and Ideas': ['Central Ideas and Details', 'Command of Evidence: Textual', 'Command of Evidence: Quantitative', 'Inferences'],
    'Craft and Structure': ['Words in Context', 'Text Structure and Purpose', 'Cross-Text Connections'],
    'Expression of Ideas': ['Rhetorical Synthesis', 'Transitions'],
    'Standard English Conventions': ['Boundaries', 'Form, Structure, and Sense']
  };

  const mathDomainSkills = {
    'Algebra': ['Algebra'],
    'Advanced Math': ['Advanced Math'],
    'Problem-Solving and Data Analysis': ['Problem-Solving and Data Analysis'],
    'Geometry and Trigonometry': ['Geometry and Trigonometry']
  };

  let rwTotal = 0, rwCorrect = 0;
  let mathTotal = 0, mathCorrect = 0;
  let totalQ = 0, totalCorrect = 0, masteredCount = 0;

  // Track subskills
  Object.entries(db.skills || {}).forEach(([skill, s]) => {
    totalQ += (s.total || 0);
    totalCorrect += (s.correct || 0);
    if (s.total >= 3 && (s.correct / s.total) >= 0.75) masteredCount++;

    const isMath = ['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'].includes(skill);
    if (isMath) {
      mathTotal += (s.total || 0);
      mathCorrect += (s.correct || 0);
    } else {
      rwTotal += (s.total || 0);
      rwCorrect += (s.correct || 0);
    }
  });

  const totalSec = db.totalStudyTimeSec || 0;
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const activeDays = (db.activeDates || []).length;

  // 1. Overall Readiness Hero Card
  const bandEl = $('#prog-readiness-band');
  const confEl = $('#prog-confidence-badge');
  const noteEl = $('#prog-readiness-note');
  const trajEl = $('#prog-trajectory-val');

  if (totalQ > 0) {
    const overallPct = Math.round((totalCorrect / totalQ) * 100);
    const estMin = Math.round((920 + overallPct * 6) / 10) * 10;
    const estMax = Math.min(1560, estMin + 90);
    if (bandEl) bandEl.textContent = `${estMin} – ${estMax}`;
    if (confEl) confEl.textContent = totalQ >= 25 ? 'Độ Tin Cậy: Cao' : 'Độ Tin Cậy: Trung Bình';
    if (noteEl) noteEl.textContent = `Ước lượng năng lực dựa trên ${totalQ} câu hỏi thực tế đã giải (${overallPct}% chính xác).`;
    if (trajEl) trajEl.textContent = `+${Math.min(150, Math.round(totalQ * 1.5) + 30)} điểm`;
  } else {
    if (bandEl) bandEl.textContent = 'Chưa Có Dữ Liệu';
    if (confEl) confEl.textContent = 'Cần Làm Chẩn Đoán';
    if (noteEl) noteEl.textContent = 'Hoàn thành bài khảo sát chẩn đoán hoặc bài thi thử để kích hoạt dải điểm.';
    if (trajEl) trajEl.textContent = '--';
  }

  // 2. Section Overview Cards (RW vs Math)
  const rwAcc = rwTotal > 0 ? Math.round((rwCorrect / rwTotal) * 100) : 0;
  const mathAcc = mathTotal > 0 ? Math.round((mathCorrect / mathTotal) * 100) : 0;

  const rwMin = rwTotal > 0 ? Math.round((460 + rwAcc * 3.3) / 10) * 10 : 480;
  const rwMax = Math.min(790, rwMin + 60);
  const mathMin = mathTotal > 0 ? Math.round((460 + mathAcc * 3.4) / 10) * 10 : 490;
  const mathMax = Math.min(800, mathMin + 60);

  if ($('#prog-rw-range-text')) $('#prog-rw-range-text').textContent = rwTotal > 0 ? `${rwMin} – ${rwMax}` : '480 – 540 (Ước lượng)';
  if ($('#prog-rw-acc-pill')) $('#prog-rw-acc-pill').textContent = `Độ chính xác: ${rwAcc}% (${rwCorrect}/${rwTotal})`;
  if ($('#prog-math-range-text')) $('#prog-math-range-text').textContent = mathTotal > 0 ? `${mathMin} – ${mathMax}` : '490 – 550 (Ước lượng)';
  if ($('#prog-math-acc-pill')) $('#prog-math-acc-pill').textContent = `Độ chính xác: ${mathAcc}% (${mathCorrect}/${mathTotal})`;

  // 3. Momentum & Parent Metrics
  if ($('#prog-momentum-time')) $('#prog-momentum-time').textContent = `${hours}h ${mins}m`;
  if ($('#prog-momentum-days')) $('#prog-momentum-days').textContent = `${activeDays} / 7 ngày`;
  if ($('#prog-momentum-questions')) $('#prog-momentum-questions').textContent = `${totalQ} câu`;

  if ($('#parent-total-hours')) $('#parent-total-hours').textContent = `${hours}h ${mins}m`;
  if ($('#parent-total-questions')) $('#parent-total-questions').textContent = `${totalQ} câu`;
  if ($('#parent-active-days')) $('#parent-active-days').textContent = activeDays > 0 ? `${activeDays} ngày` : '0 ngày';
  if ($('#parent-mastered-skills')) $('#parent-mastered-skills').textContent = `${masteredCount} / ${SAT_SKILLS.length}`;

  // 4. Canonical 8-Domain Mastery Horizontal Bars
  const container = $('#skill-mastery-bars-container');
  if (container) {
    const allDomains = [
      { name: 'Information & Ideas', section: 'RW', skills: rwDomainSkills['Information and Ideas'] },
      { name: 'Craft & Structure', section: 'RW', skills: rwDomainSkills['Craft and Structure'] },
      { name: 'Expression of Ideas', section: 'RW', skills: rwDomainSkills['Expression of Ideas'] },
      { name: 'Standard English Conventions', section: 'RW', skills: rwDomainSkills['Standard English Conventions'] },
      { name: 'Algebra', section: 'Math', skills: mathDomainSkills['Algebra'] },
      { name: 'Advanced Math', section: 'Math', skills: mathDomainSkills['Advanced Math'] },
      { name: 'Problem-Solving & Data Analysis', section: 'Math', skills: mathDomainSkills['Problem-Solving and Data Analysis'] },
      { name: 'Geometry & Trigonometry', section: 'Math', skills: mathDomainSkills['Geometry and Trigonometry'] }
    ];

    container.innerHTML = allDomains.map(d => {
      let dTotal = 0, dCorrect = 0;
      d.skills.forEach(sk => {
        const s = db.skills[sk];
        if (s) {
          dTotal += (s.total || 0);
          dCorrect += (s.correct || 0);
        }
      });

      const pct = dTotal > 0 ? Math.round((dCorrect / dTotal) * 100) : 0;
      const colorClass = pct >= 75 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-error';
      const statusLabel = dTotal === 0 ? 'Chưa rèn luyện' : pct >= 75 ? 'Mastered' : pct >= 50 ? 'Proficient' : 'Developing';

      return `
        <div style="background:#FAFBFD;padding:0.85rem 1rem;border-radius:var(--radius);border:1px solid var(--color-border);">
          <div class="flex justify-between items-center text-xs mb-1.5 flex-wrap gap-1">
            <div class="flex items-center gap-2">
              <span class="plan-badge text-2xs" style="background:#FFF;">${d.section}</span>
              <strong style="font-size:0.85rem;">${escapeHTML(d.name)}</strong>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted">${dCorrect}/${dTotal} câu (${pct}%)</span>
              <span class="plan-badge text-2xs" style="background:${pct >= 75 ? '#DEF7EC' : pct >= 50 ? '#FEF3C7' : '#FDE8E8'};color:${pct >= 75 ? '#03543F' : pct >= 50 ? '#92400E' : '#9B1C1C'};border:none;">${statusLabel}</span>
            </div>
          </div>
          <div class="progress-container" style="height:7px;background:#E5E7EB;border-radius:999px;overflow:hidden;">
            <div class="progress-bar ${colorClass}" style="width:${Math.max(4, pct)}%;height:100%;transition:width 0.3s ease;"></div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ═══════════════════════════════════════════════════════════════
// CONTEXTUAL SAT STRATEGY COACH (TUTOR ENGINE) (P1.1 Fix)
// ═══════════════════════════════════════════════════════════════
window.askAICoach = function() {
  const modal = $('#ai-coach-modal');
  if (!modal) return;
  modal.classList.add('open');

  const q = currentQuestion;
  if (q) {
    $('#ai-context-indicator').textContent = `Context: ${q.question_id || 'Active Item'} (${escapeHTML(getCanonicalSkill(q))})`;
  }
};

window.closeAICoach = function() {
  $('#ai-coach-modal')?.classList.remove('open');
};

window.askAIPrompt = function(type) {
  const q = currentQuestion;
  const res = $('#ai-response-content');
  if (!res || !q) return;

  const isMath = isMathQuestion(q);

  if (isMath) {
    if (type === 'explain_another_way') {
      res.innerHTML = `
        <strong>💡 Mô hình hóa toán học &amp; Trực quan Desmos:</strong><br>
        Hãy chuyển bài toán chữ sang ngôn ngữ đại số: Đặt ẩn số x (hoặc y) là đại lượng cần tìm.<br>
        ${q.calculator_note ? `<em>Ghi chú máy tính: ${escapeHTML(q.calculator_note)}</em><br>` : ''}
        Sử dụng máy tính đồ thị Desmos để vẽ đồ thị hàm số và nhấp trực tiếp vào giao điểm hoặc đỉnh Parabol thay vì biến đổi tay phức tạp.
      `;
    } else if (type === 'why_distractor_wrong') {
      res.innerHTML = `
        <strong>🔍 Phân tích các bẫy số học &amp; đại số:</strong><br>
        ${q.why_others_wrong ? Object.entries(q.why_others_wrong).map(([k, v]) => `• <strong>${k}:</strong> ${escapeHTML(v)}<br>`).join('') : '• <strong>Bẫy đảo dấu (+/-):</strong> Quên đổi dấu khi chuyển vế hoặc nhân/chia cho số âm.<br>• <strong>Bẫy nhầm ẩn số:</strong> Giải ra x nhưng đề bài hỏi (2x + 1) hoặc (x + y).<br>• <strong>Bẫy nghiệm ngoại lai:</strong> Khi bình phương hai vế xuất hiện nghiệm không thỏa mãn điều kiện căn thức.'}
      `;
    } else if (type === 'give_hint') {
      res.innerHTML = `
        <strong>🧩 Gợi ý tư duy &amp; mẹo giải nhanh:</strong><br>
        1. Thử thay số trực tiếp (Back-solving / Plug-in): Lấy các phương án số thay ngược vào phương trình gốc.<br>
        2. Bấm máy Desmos: Nhập vế trái = y1, vế phải = y2, nhấp chuột vào giao điểm để đọc nghiệm x ngay lập tức.<br>
        3. Kiểm tra câu hỏi: Đề bài yêu cầu tìm x hay tìm một biểu thức liên quan?
      `;
    } else if (type === 'show_thinking_steps') {
      res.innerHTML = `
        <strong>📝 Quy trình 5 bước chuẩn Toán SAT (GIVEN → TARGET → MODEL → SOLVE → VERIFY):</strong><br>
        • <strong>Bước 1 (GIVEN):</strong> Liệt kê hằng số, hệ số và mối quan hệ đề bài đã cho.<br>
        • <strong>Bước 2 (TARGET):</strong> Đóng khung đại lượng chính xác cần tính.<br>
        • <strong>Bước 3 (MODEL):</strong> Thiết lập phương trình hoặc bất phương trình toán học.<br>
        • <strong>Bước 4 (SOLVE):</strong> Biến đổi đại số hoặc dùng Desmos tìm nghiệm.<br>
        • <strong>Bước 5 (VERIFY):</strong> Thay nghiệm vào lại phương trình gốc để loại nghiệm ngoại lai.
      `;
    } else if (type === 'easier_example') {
      res.innerHTML = `
        <strong>🌱 Ví dụ số học minh họa đơn giản:</strong><br>
        Nếu gặp phương trình dạng <em>2x + 5 = 15</em>:<br>
        ➔ Bước 1: Trừ 5 hai vế: 2x = 10<br>
        ➔ Bước 2: Chia 2: x = 5.<br>
        ➔ Nếu đề hỏi <em>x + 3</em>, đáp án phải là <strong>8</strong> chứ không phải 5 (tránh bẫy vội vàng chọn x).
      `;
    }
  } else {
    // Reading & Writing
    if (type === 'explain_another_way') {
      res.innerHTML = `
        <strong>💡 Giải thích trực quan:</strong><br>
        Hãy coi câu hỏi này như việc tìm mắt xích bị thiếu trong chuỗi logic.<br>
        Đoạn văn khẳng định: <em>"${escapeHTML((q.passage || '').slice(0, 140))}..."</em><br>
        Điểm mấu chốt là đối chiếu từ khóa chính với <strong>Đáp án ${escapeHTML(q.correct_answer)}</strong> mà không suy diễn thêm thông tin bên ngoài.
      `;
    } else if (type === 'why_distractor_wrong') {
      res.innerHTML = `
        <strong>🔍 Phân tích các phương án bẫy:</strong><br>
        ${q.why_others_wrong ? Object.entries(q.why_others_wrong).map(([k, v]) => `• <strong>${k}:</strong> ${escapeHTML(v)}<br>`).join('') : 'Các phương án nhiễu thường mắc bẫy khái quát hóa quá mức hoặc thay đổi trạng thái đối tượng.'}
      `;
    } else if (type === 'give_hint') {
      res.innerHTML = `
        <strong>🧩 Gợi ý tư duy:</strong><br>
        1. Đọc kỹ câu hỏi để xác định mục tiêu: Đang tìm ý chính, chi tiết chứng minh hay từ vựng trong ngữ cảnh?<br>
        2. Loại bỏ ngay 2 phương án chắc chắn sai (quá tiêu cực, quá cực đoan hoặc không được nhắc tới).<br>
        3. So sánh 2 phương án còn lại với từ ngữ gốc của bài.
      `;
    } else if (type === 'show_thinking_steps') {
      res.innerHTML = `
        <strong>📝 Từng bước suy luận (Khung ${escapeHTML(q.thinking_framework || 'GIVEN→TARGET→SOLVE')}):</strong><br>
        <strong>Bước 1:</strong> Xác định tiền đề tác giả đưa ra.<br>
        <strong>Bước 2:</strong> Khoanh vùng phạm vi bằng chứng.<br>
        <strong>Bước 3:</strong> Chọn phương án bảo toàn đúng nghĩa gốc mà không mở rộng phạm vi.
      `;
    } else if (type === 'easier_example') {
      res.innerHTML = `
        <strong>🌱 Ví dụ đơn giản tương đương:</strong><br>
        <em>"Tất cả học sinh trong lớp đều có sách giáo khoa. Nam là học sinh trong lớp."</em><br>
        ➔ <strong>Đúng:</strong> Nam có sách giáo khoa.<br>
        ➔ <strong>Bẫy suy diễn quá đà:</strong> Nam học rất giỏi môn này (Không thể suy ra từ tiền đề).
      `;
    }
  }
};

// ── Desmos Calculator Modal Toggle ──
window.toggleDesmos = function() {
  const m = $('#desmos-modal');
  if (!m) return;
  const isHidden = m.classList.contains('hidden') || m.style.display === 'none';
  if (isHidden) {
    m.classList.remove('hidden');
    m.style.display = 'flex';
    const iframe = $('#desmos-iframe');
    if (iframe && iframe.src === 'about:blank') {
      iframe.src = 'https://www.desmos.com/calculator';
    }
  } else {
    m.classList.add('hidden');
    m.style.display = 'none';
  }
};

// ── Social Share Modal ──
window.openShareModal = function() {
  const modal = $('#share-modal');
  if (!modal) return;

  let totalQ = 0, totalCorrect = 0, masteredCount = 0;
  Object.values(db.skills || {}).forEach(s => {
    totalQ += (s.total || 0);
    totalCorrect += (s.correct || 0);
    if (s.total >= 3 && (s.correct / s.total) >= 0.75) masteredCount++;
  });
  const acc = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

  $('#share-stat-q').textContent = totalQ;
  $('#share-stat-acc').textContent = `${acc}%`;
  $('#share-stat-skills').textContent = `${masteredCount}/${SAT_SKILLS.length}`;

  modal.style.display = 'flex';
};

window.closeShareModal = function() {
  $('#share-modal').style.display = 'none';
};

window.copyShareText = function() {
  const caption = `🎯 Hôm nay mình vừa hoàn thành bài rèn luyện trên N&Mstudio_Education — SAT IntelliPrep OS (Mục tiêu: 1500+ Digital SAT)!

🌱 "Mỗi lỗi sai được chẩn đoán là một bước tiến gần hơn tới điểm số tối đa."
👉 Khám phá nền tảng: https://sat-intelliprep.nmstudio.edu.vn
💬 Hotline Zalo hỗ trợ: +98 557 8385

#NandMstudio #DigitalSAT #SATIntelliPrep #GrowthMindset #IvyLeague`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(caption).then(() => {
      alert('Đã sao chép caption thành công!');
    });
  } else {
    prompt('Sao chép nội dung bài đăng:', caption);
  }
};

// ── Anki Modal & Deep TSV Export Engine (Ponytail Zero-Bloat) ──
window.openAnkiModal = function() {
  const m = $('#anki-export-modal');
  if (m) m.style.display = 'flex';
};

window.closeAnkiModal = function() {
  const m = $('#anki-export-modal');
  if (m) m.style.display = 'none';
};

window.exportAnkiDeck = async function(type) {
  let cards = [];
  let filename = '';
  let deckTag = '#SAT';

  if (type === 'vocab') {
    const d1 = await loadFlashcards('vocabulary_direct_hits');
    const d2 = await loadFlashcards('vocabulary_secondary_meanings');
    const d3 = await loadFlashcards('vocabulary');
    cards = [...d1, ...d2, ...d3];
    filename = 'SAT_Vocab_Direct_Hits';
    deckTag = '#SAT::Vocab::DirectHits';
  } else if (type === 'math') {
    cards = await loadFlashcards('math');
    filename = 'SAT_Math_Formulas_Desmos';
    deckTag = '#SAT::Math::Formulas';
  } else if (type === 'grammar') {
    const g = await loadFlashcards('grammar');
    const t = await loadFlashcards('transitions');
    const r = await loadFlashcards('rhetorical');
    cards = [...g, ...t, ...r];
    filename = 'SAT_Grammar_Transitions';
    deckTag = '#SAT::Conventions::Writing';
  } else if (type === 'mistakes') {
    const errs = db.errors || [];
    if (!errs.length) {
      alert('Bạn chưa có lỗi sai nào trong hệ thống! Hãy tiếp tục làm bài luyện tập.');
      return;
    }
    cards = errs.map((e, idx) => ({
      card_id: `ERR-${idx}`,
      front: {
        word: `[CÂU SAI #${idx + 1}] ${e.question_id}`,
        context: `Kỹ năng: ${e.skill} · Lựa chọn của bạn: ${e.answer}`
      },
      back: {
        vietnamese: `Đáp án đúng: ${e.correct_answer}`,
        definition: `Bẫy nhận thức: ${e.error_type || 'COGNITIVE_DISTRACTOR'}`,
        academic_tip: `Rút kinh nghiệm: Đối chiếu trực tiếp với bằng chứng trong bài đọc, không phóng đại suy luận.`
      }
    }));
    filename = 'SAT_My_Mistake_Workbook';
    deckTag = '#SAT::MyMistakes';
  }

  if (!cards.length) {
    alert('Không tìm thấy dữ liệu thẻ ghi nhớ.');
    return;
  }

  // Generate standard TSV with Anki headers and UTF-8 BOM
  const headerLines = [
    '#separator:tab',
    '#html:true',
    '#tags column:3'
  ];

  const cardRows = cards.map(c => {
    let front = '';
    if (c.front) {
      if (c.front.word) {
        front = `<h3>${escapeHTML(c.front.word)}</h3>`;
        if (c.front.phonetic) front += `<div style="color:#64748B;"><em>${escapeHTML(c.front.phonetic)}</em></div>`;
        if (c.front.context) front += `<p style="margin-top:8px;">"${escapeHTML(c.front.context)}"</p>`;
      } else if (c.front.concept) {
        front = `<h3>${escapeHTML(c.front.concept)}</h3>`;
        if (c.front.formula) front += `<p style="color:#1D4ED8;font-weight:bold;">${escapeHTML(c.front.formula)}</p>`;
      } else if (c.front.phrase) {
        front = `<h3>${escapeHTML(c.front.phrase)}</h3>`;
        if (c.front.function) front += `<p>${escapeHTML(c.front.function)}</p>`;
      }
    }

    let back = '';
    if (typeof c.back === 'string') {
      back = escapeHTML(c.back);
    } else if (c.back) {
      const parts = [];
      if (c.back.vietnamese) parts.push(`<div style="font-size:1.1em;font-weight:bold;color:#16866A;">${escapeHTML(c.back.vietnamese)}</div>`);
      if (c.back.rule) parts.push(`<div><strong>Quy tắc:</strong> ${escapeHTML(c.back.rule)}</div>`);
      if (c.back.meaning) parts.push(`<div><strong>Nghĩa học thuật:</strong> ${escapeHTML(c.back.meaning)}</div>`);
      if (c.back.definition) parts.push(`<div><strong>Giải thích:</strong> ${escapeHTML(c.back.definition)}</div>`);
      if (c.back.synonyms && Array.isArray(c.back.synonyms)) parts.push(`<div><strong>Đồng nghĩa:</strong> ${escapeHTML(c.back.synonyms.join(', '))}</div>`);
      if (c.back.contrast) parts.push(`<div><strong>Phân biệt:</strong> ${escapeHTML(c.back.contrast)}</div>`);
      if (c.back.tip) parts.push(`<div style="background:#EFF6FF;padding:6px;border-radius:4px;">💡 <strong>Mẹo:</strong> ${escapeHTML(c.back.tip)}</div>`);
      if (c.back.academic_tip) parts.push(`<div style="background:#EFF6FF;padding:6px;border-radius:4px;">💡 <strong>Mẹo sư phạm:</strong> ${escapeHTML(c.back.academic_tip)}</div>`);
      if (c.back.common_error) parts.push(`<div style="background:#FEF2F2;padding:6px;border-radius:4px;color:#991B1B;">⚠️ <strong>Bẫy thường gặp:</strong> ${escapeHTML(c.back.common_error)}</div>`);
      back = parts.join('<br>');
    }

    // Clean any newlines inside fields to <br> so TSV rows stay single lines
    front = front.replace(/\t/g, ' ').replace(/\r?\n/g, '<br>');
    back = back.replace(/\t/g, ' ').replace(/\r?\n/g, '<br>');

    return `${front}\t${back}\t${deckTag}`;
  });

  const tsvContent = '\uFEFF' + [...headerLines, ...cardRows].join('\n');
  const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.tsv`;
  a.click();
  URL.revokeObjectURL(url);

  closeAnkiModal();
  alert(`Đã xuất thành công ${cards.length} thẻ vào file ${a.download}! Bạn hãy mở Anki và Import vào để học nhé.`);
};

// ── PDF & Printable Reports Engine (Clean A4 Academic Standard) ──
window.exportPDFReport = function(type) {
  const portal = $('#print-portal');
  if (!portal) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  const grade = db.profile?.grade || '11';
  const targetScore = db.profile?.targetScore || '1500+';

  if (type === 'parent') {
    // Parent Progress Report
    let totalQ = 0, totalCorrect = 0, masteredCount = 0;
    Object.values(db.skills || {}).forEach(s => {
      totalQ += (s.total || 0);
      totalCorrect += (s.correct || 0);
      if (s.total >= 3 && (s.correct / s.total) >= 0.75) masteredCount++;
    });
    const overallAcc = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
    const totalSec = db.totalStudyTimeSec || 0;
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const totalHoursDisplay = totalSec > 0 ? `${hours}h ${mins}m` : '0h 0m';

    const skillsRows = SAT_SKILLS.map(skill => {
      const s = db.skills[skill] || { correct: 0, total: 0 };
      const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      let status = 'Chưa làm';
      let statusColor = '#64748B';
      if (s.total > 0) {
        if (pct >= 75) { status = 'Mastered (Vững)'; statusColor = '#16866A'; }
        else if (pct >= 50) { status = 'Developing (Tiến bộ)'; statusColor = '#B7791F'; }
        else { status = 'Needs Focus (Cần củng cố)'; statusColor = '#C74A4A'; }
      }
      return `
        <tr>
          <td><strong>${escapeHTML(skill)}</strong></td>
          <td style="text-align:center;">${s.total} câu</td>
          <td style="text-align:center;font-weight:bold;">${pct}%</td>
          <td style="text-align:center;color:${statusColor};font-weight:bold;">${status}</td>
        </tr>
      `;
    }).join('');

    portal.innerHTML = `
      <div class="print-doc-header">
        <div class="print-brand-left">
          <img src="assets/logo.png" alt="Logo">
          <div>
            <div class="print-doc-title">N&amp;Mstudio_Education — BẢN BÁO CÁO NĂNG LỰC DÀNH CHO PHỤ HUYNH</div>
            <div class="print-doc-sub">Hệ Thống Luyện Thi Digital SAT 2026 Chuyên Sâu • Đánh Giá Tiến Bộ Thực Chất</div>
          </div>
        </div>
        <div class="print-doc-meta-right">
          <div>Học sinh: <strong>Lớp ${grade}</strong></div>
          <div>Mục tiêu: <strong style="color:#1D4ED8;">${targetScore}</strong></div>
          <div>Ngày xuất: ${dateStr}</div>
        </div>
      </div>

      <div class="print-metric-grid">
        <div class="print-metric-box">
          <div class="print-metric-val">${totalHoursDisplay}</div>
          <div class="print-metric-lbl">Tổng giờ tập trung</div>
        </div>
        <div class="print-metric-box">
          <div class="print-metric-val">${totalQ}</div>
          <div class="print-metric-lbl">Khối lượng câu đã giải</div>
        </div>
        <div class="print-metric-box">
          <div class="print-metric-val">${overallAcc}%</div>
          <div class="print-metric-lbl">Độ chính xác thực tế</div>
        </div>
        <div class="print-metric-box">
          <div class="print-metric-val">${masteredCount}/${SAT_SKILLS.length}</div>
          <div class="print-metric-lbl">Kỹ năng đã làm chủ</div>
        </div>
      </div>

      <div class="print-section-heading">BẢNG TIẾN TRÌNH 15 KỸ NĂNG KHẢO THÍ DIGITAL SAT 2026</div>
      <table class="print-table">
        <thead>
          <tr>
            <th>Kỹ Năng Khảo Thí</th>
            <th style="text-align:center;width:100px;">Đã Thực Hành</th>
            <th style="text-align:center;width:100px;">Chính Xác</th>
            <th style="text-align:center;width:180px;">Trạng Thái Năng Lực</th>
          </tr>
        </thead>
        <tbody>
          ${skillsRows}
        </tbody>
      </table>

      <div class="print-section-heading">GÓC ĐỒNG HÀNH &amp; TÂM LÝ SƯ PHẠM DÀNH CHO PHỤ HUYNH</div>
      <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:12px;font-size:0.85rem;line-height:1.6;color:#334155;">
        <p><strong>1. Trọng tâm là nỗ lực và sự kiên trì:</strong> Trong kỳ thi Digital SAT, việc làm sai là điều tất yếu trong quá trình hiệu chỉnh tư duy. Phụ huynh nên khen ngợi tính kỷ luật rèn luyện hàng ngày thay vì chỉ chú trọng điểm số từng bài thi thử.</p>
        <p style="margin-top:6px;"><strong>2. Quản lý năng lượng &amp; giấc ngủ:</strong> Giai đoạn thi SAT đòi hỏi não bộ xử lý thông tin với mật độ dày đặc. Hãy đảm bảo con ngủ đủ 7-8 tiếng mỗi ngày để củng cố trí nhớ dài hạn (Spaced Retrieval).</p>
      </div>

      <div class="print-footer-notice">
        <span>N&amp;Mstudio_Education — Nền tảng học thuật chuẩn Calm Academic</span>
        <span>Hotline Zalo Cố Vấn: <strong>+98 557 8385</strong></span>
      </div>
    `;
  } else if (type === 'workbook') {
    // Cognitive Mistake Workbook
    const errs = db.errors || [];
    let errCards = '';

    if (!errs.length) {
      errCards = '<p style="text-align:center;color:#64748B;padding:2rem;">Chưa có dữ liệu lỗi sai được ghi nhận. Học sinh hãy tiếp tục rèn luyện trong phần Practice hoặc Test!</p>';
    } else {
      errCards = errs.map((e, idx) => `
        <div class="print-mistake-card">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #E2E8F0;padding-bottom:6px;margin-bottom:8px;">
            <div>
              <strong style="color:#1E3A8A;">#${idx + 1}. Câu hỏi: ${escapeHTML(e.question_id)}</strong>
              <span style="background:#EFF6FF;color:#1D4ED8;padding:2px 8px;border-radius:12px;font-size:0.75rem;margin-left:8px;font-weight:bold;">${escapeHTML(e.skill)}</span>
            </div>
            <div style="font-size:0.75rem;color:#64748B;">Ngày ghi nhận: ${new Date(e.timestamp).toLocaleDateString('vi-VN')}</div>
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.85rem;margin-bottom:8px;">
            <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:6px;padding:8px;color:#991B1B;">
              <strong>Lựa chọn của bạn:</strong> <code>${escapeHTML(e.answer)}</code> (Chưa chính xác)
            </div>
            <div style="background:#ECFDF5;border:1px solid #A7F3D0;border-radius:6px;padding:8px;color:#065F46;">
              <strong>Đáp án đúng:</strong> <code>${escapeHTML(e.correct_answer)}</code> (Chuẩn khảo thí)
            </div>
          </div>

          <div style="font-size:0.82rem;line-height:1.5;color:#334155;">
            <div><strong>⚠️ Bản chất bẫy nhận thức (Cognitive Trap):</strong> <span style="background:#FEF3C7;color:#92400E;padding:1px 6px;border-radius:4px;font-weight:bold;">${escapeHTML(e.error_type || 'COGNITIVE_DISTRACTOR')}</span></div>
            <div style="margin-top:4px;"><strong>🧠 Khung tư duy khắc phục:</strong> Khoanh vùng phạm vi bằng chứng, đối chiếu trực tiếp từ ngữ đoạn văn, tuyệt đối không suy diễn vượt quá tiền đề tác giả đã xác lập.</div>
            <div style="margin-top:6px;border-top:1px dashed #CBD5E1;padding-top:4px;color:#64748B;font-style:italic;">
              <strong>Ghi chú rút kinh nghiệm cá nhân:</strong> ............................................................................................................................................
            </div>
          </div>
        </div>
      `).join('');
    }

    portal.innerHTML = `
      <div class="print-doc-header">
        <div class="print-brand-left">
          <img src="assets/logo.png" alt="Logo">
          <div>
            <div class="print-doc-title">N&amp;Mstudio_Education — SỔ TAY CHẨN ĐOÁN LỖI SAI DIGITAL SAT 2026</div>
            <div class="print-doc-sub">Metacognitive Error Diagnosis &amp; Reasoning Frameworks</div>
          </div>
        </div>
        <div class="print-doc-meta-right">
          <div>Học sinh: <strong>Lớp ${grade}</strong></div>
          <div>Tổng số lỗi sai đã ghi nhận: <strong>${errs.length}</strong></div>
          <div>Ngày xuất: ${dateStr}</div>
        </div>
      </div>

      <div style="margin-bottom:1rem;background:#F1F5F9;border-radius:6px;padding:10px;font-size:0.8rem;color:#475569;">
        <strong>NGUYÊN TẮC HỌC TẬP TỪ LỖI SAI:</strong> "Một lỗi sai được chẩn đoán sâu sắc có giá trị hơn 10 câu làm đúng một cách tình cờ." Mỗi câu hỏi dưới đây đã được phân loại theo bẫy nhận thức cụ thể để bạn không bao giờ lặp lại bẫy tương tự trong phòng thi thật.
      </div>

      ${errCards}

      <div class="print-footer-notice">
        <span>N&amp;Mstudio_Education • Hotline Zalo: +98 557 8385</span>
        <span>Chúc bạn bứt phá 1500+ Digital SAT!</span>
      </div>
    `;
  } else if (type === 'scorecard') {
    // Test Scorecard Print
    portal.innerHTML = `
      <div class="print-doc-header">
        <div class="print-brand-left">
          <img src="assets/logo.png" alt="Logo">
          <div>
            <div class="print-doc-title">N&amp;Mstudio_Education — PHIẾU BÁO ĐIỂM THI THỬ DIGITAL SAT</div>
            <div class="print-doc-sub">${escapeHTML(activeExam.title || 'Digital SAT Official Practice Test')}</div>
          </div>
        </div>
        <div class="print-doc-meta-right">
          <div>Ngày thi: ${dateStr}</div>
          <div>Mục tiêu: <strong>${targetScore}</strong></div>
        </div>
      </div>

      <div id="print-scorecard-body">
        ${$('#timed-results-area') ? $('#timed-results-area').innerHTML : ''}
      </div>

      <div class="print-footer-notice">
        <span>N&amp;Mstudio_Education — Khảo thí Digital SAT 2026</span>
        <span>Hotline Zalo Cố Vấn: +98 557 8385</span>
      </div>
    `;
  }

  // Trigger browser native print
  window.print();
};

// ── Data Management Backup & Reset ──
window.exportUserData = function() {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nmstudio_sat_progress_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

window.exportErrorLogCSV = function() {
  if (!db.errors || !db.errors.length) { alert('Chưa có dữ liệu lỗi sai.'); return; }
  const headers = ['question_id', 'domain', 'skill', 'answer', 'correct_answer', 'error_type', 'date'];
  const cleanCell = val => `"${String(val || '').replace(/"/g, '""')}"`;
  const rows = db.errors.map(e => [
    cleanCell(e.question_id),
    cleanCell(e.domain),
    cleanCell(e.skill),
    cleanCell(e.answer),
    cleanCell(e.correct_answer),
    cleanCell(e.error_type),
    cleanCell(new Date(e.timestamp).toLocaleDateString('vi-VN'))
  ]);
  const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nmstudio_sat_mistakes_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

window.resetAllProgress = function() {
  if (!confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học tập SAT? Hành động này không thể hoàn tác.')) return;
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem('nmstudio_learning_os_v2');
  location.reload();
};

// ── Global Keyboard Shortcuts & Modal UX (Digital SAT Bluebook Standards) ──
document.addEventListener('keydown', e => {
  // Always allow Escape to close active modals
  if (e.key === 'Escape') {
    closeAICoach();
    closeShareModal();
    closeAnkiModal();
    const desmos = $('#desmos-modal');
    if (desmos && !desmos.classList.contains('hidden')) toggleDesmos();
    return;
  }

  // Do not intercept if user is typing in an input, textarea, or contenteditable
  const activeEl = document.activeElement;
  const isInput = activeEl && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.isContentEditable
  );
  if (isInput) return;

  const currentRoute = location.hash || '#today';
  const key = e.key.toUpperCase();

  // Test / Exam Screen Hotkeys (Bluebook Navigation)
  if (currentRoute === '#test' && $('#timed-exam-area')?.style.display === 'block') {
    if (['A', 'B', 'C', 'D'].includes(key)) {
      e.preventDefault();
      selectExamAnswer(key);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevTimedQuestion();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextTimedQuestion();
    }
    return;
  }

  // Practice Screen Hotkeys
  if (currentRoute === '#practice') {
    if (['A', 'B', 'C', 'D'].includes(key)) {
      e.preventDefault();
      selectChoice(key);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      submitCurrentAnswer();
    }
    return;
  }

  // Review / Flashcard Screen Hotkeys
  if (currentRoute === '#review' && $('#flashcard-interactive-wrapper')?.style.display === 'block') {
    if (e.key === ' ') {
      e.preventDefault();
      flipFlashcard();
    } else if (['1', '2', '3', '4'].includes(e.key)) {
      e.preventDefault();
      rateFlashcard(Number(e.key));
    }
  }
});

// Modal Backdrop Click-to-Close (Alibaba OCR - Usability & Ergonomics)
document.addEventListener('click', e => {
  const backdropConfigs = [
    { el: $('#desmos-modal'), close: toggleDesmos, isOpen: el => !el.classList.contains('hidden') && el.style.display !== 'none' },
    { el: $('#share-modal'), close: closeShareModal, isOpen: el => el.style.display === 'flex' },
    { el: $('#anki-export-modal'), close: closeAnkiModal, isOpen: el => el.style.display === 'flex' },
    { el: $('#ai-coach-modal'), close: closeAICoach, isOpen: el => el.classList.contains('open') }
  ];

  backdropConfigs.forEach(({ el, close, isOpen }) => {
    if (el && isOpen(el) && e.target === el) {
      close();
    }
  });
});

// ── App Startup ──
document.addEventListener('DOMContentLoaded', init);
