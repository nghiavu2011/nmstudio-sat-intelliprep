/* ═══════════════════════════════════════════════════════════════
   N&Mstudio_Education — Intelligent Learning OS
   Main Application Logic: Multi-Workspace (SAT / IELTS),
   5-Destination Navigation, 6-Stage Deliberate Feedback, FSRS Spaced Review,
   Contextual AI Coach & Interpretive Progress Analytics
   ═══════════════════════════════════════════════════════════════ */

const DB_KEY = 'nmstudio_learning_os_v2';

// ── Skill Taxonomies ──
const SAT_SKILLS = [
  'Central Ideas and Details', 'Command of Evidence: Textual', 'Command of Evidence: Quantitative',
  'Inferences', 'Words in Context', 'Text Structure and Purpose', 'Cross-Text Connections',
  'Rhetorical Synthesis', 'Transitions', 'Boundaries', 'Form, Structure, and Sense',
  'Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'
];

const IELTS_SKILLS = [
  'True / False / Not Given', 'Matching Headings', 'Summary Completion',
  'Task 1 Data Description & Synthesis', 'Task 2 Academic Cohesion & Hedging',
  'Academic Lexical Resource', 'Coherence & Cohesion'
];

// ── State Persistence (Alibaba OCR - Defensive Robustness) ──
function loadState() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.warn('Corrupted state detected in localStorage, fallback to default:', e);
  }
  return {
    activeWorkspace: 'sat', // 'sat' | 'ielts'
    profile: null,          // { grade, level, setupDate }
    workspaces: {
      sat: {
        skills: {},         // { skillName: { correct, total, history: [] } }
        errors: [],         // { question_id, domain, skill, answer, correct_answer, error_type, timestamp }
        flashcardState: {}, // { card_id: { ease, interval, due, reviews } }
        sessionLog: []
      },
      ielts: {
        skills: {},
        errors: [],
        flashcardState: {},
        sessionLog: []
      }
    }
  };
}

let db = loadState();

// Backward compatibility migration if upgrading from v1
if (!db.workspaces) {
  const oldSkills = db.skills || {};
  const oldErrors = db.errors || [];
  const oldFc = db.flashcardState || {};
  const oldLog = db.sessionLog || [];
  db = {
    activeWorkspace: 'sat',
    profile: db.profile || null,
    workspaces: {
      sat: { skills: oldSkills, errors: oldErrors, flashcardState: oldFc, sessionLog: oldLog },
      ielts: { skills: {}, errors: [], flashcardState: {}, sessionLog: [] }
    }
  };
}

function save() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

function getCurWS() {
  return db.workspaces[db.activeWorkspace] || db.workspaces.sat;
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
  'math-geo': 'data/questions/math_geometry_trig.json'
};

const SAT_FC_FILES = [
  'vocabulary', 'grammar', 'transitions', 'rhetorical',
  'math', 'vocabulary_direct_hits', 'vocabulary_secondary_meanings'
];

async function loadQuestions(key) {
  if (qCache[key]) return qCache[key];
  try {
    let url = SAT_Q_FILES[key];
    if (key === 'ielts' || key === 'ielts-all') url = 'data/ielts/ielts_questions.json';
    if (!url) url = SAT_Q_FILES['rw-info'];

    const r = await fetch(url);
    const d = await r.json();
    qCache[key] = d.questions || d;
    return qCache[key];
  } catch (e) {
    console.warn('Failed to load questions:', key, e);
    return [];
  }
}

async function loadFlashcards(type) {
  if (fcCache[type]) return fcCache[type];
  try {
    let url = `data/flashcards/${type}.json`;
    if (type === 'ielts' || type === 'ielts-awl') url = 'data/ielts/ielts_flashcards.json';

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
  const modal = $('#setup-modal');
  if (!db.profile) {
    modal.style.display = 'flex';
  } else {
    modal.style.display = 'none';
  }

  // Setup submit handler
  $('#setup-submit')?.addEventListener('click', () => {
    db.activeWorkspace = $('#setup-workspace').value || 'sat';
    db.profile = {
      grade: $('#setup-grade').value || '11',
      level: $('#setup-level').value || 'intermediate',
      setupDate: new Date().toISOString()
    };
    save();
    modal.style.display = 'none';
    syncWorkspaceUI();
    handleRoute();
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

  // Sync workspace selector dropdown
  const wsSelect = $('#workspace-select');
  if (wsSelect) {
    wsSelect.value = db.activeWorkspace || 'sat';
  }

  // Set date
  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  $$('.date-display').forEach(el => el.textContent = dateStr);

  // Router listener
  window.addEventListener('hashchange', handleRoute);
  syncWorkspaceUI();
  handleRoute();
}

// ── Workspace Switcher ──
window.switchWorkspace = function(ws) {
  if (ws !== 'sat' && ws !== 'ielts') ws = 'sat';
  db.activeWorkspace = ws;
  save();
  syncWorkspaceUI();
  handleRoute();
};

function syncWorkspaceUI() {
  const ws = db.activeWorkspace;
  const wsSelect = $('#workspace-select');
  if (wsSelect) wsSelect.value = ws;

  const badge = $('#current-workspace-badge');
  if (badge) {
    badge.textContent = ws === 'sat' ? 'Digital SAT 2026 Workspace' : 'IELTS Academic Workspace';
  }

  const shareTitle = $('#share-workspace-title');
  if (shareTitle) {
    shareTitle.textContent = ws === 'sat' ? 'Digital SAT 2026' : 'IELTS Academic';
  }

  // Update Practice Domain Tabs for SAT vs IELTS
  const domainTabsContainer = $('#practice-domain-tabs');
  if (domainTabsContainer) {
    if (ws === 'sat') {
      domainTabsContainer.innerHTML = `
        <button class="domain-tab-btn active" data-domain="rw-info" onclick="selectDomainTab('rw-info')">Information &amp; Ideas</button>
        <button class="domain-tab-btn" data-domain="rw-craft" onclick="selectDomainTab('rw-craft')">Craft &amp; Structure</button>
        <button class="domain-tab-btn" data-domain="rw-expr" onclick="selectDomainTab('rw-expr')">Expression</button>
        <button class="domain-tab-btn" data-domain="rw-conv" onclick="selectDomainTab('rw-conv')">Conventions</button>
        <button class="domain-tab-btn" data-domain="math-alg" onclick="selectDomainTab('math-alg')">Algebra</button>
        <button class="domain-tab-btn" data-domain="math-adv" onclick="selectDomainTab('math-adv')">Advanced Math</button>
        <button class="domain-tab-btn" data-domain="math-psda" onclick="selectDomainTab('math-psda')">Problem Solving</button>
        <button class="domain-tab-btn" data-domain="math-geo" onclick="selectDomainTab('math-geo')">Geometry &amp; Trig</button>
      `;
      $('#practice-desmos-btn')?.classList.remove('hidden');
    } else {
      domainTabsContainer.innerHTML = `
        <button class="domain-tab-btn active" data-domain="ielts-all" onclick="selectDomainTab('ielts-all')">All Academic Skills</button>
        <button class="domain-tab-btn" data-domain="ielts-reading" onclick="selectDomainTab('ielts-all')">Reading (T/F/NG &amp; Headings)</button>
        <button class="domain-tab-btn" data-domain="ielts-writing" onclick="selectDomainTab('ielts-all')">Writing (Tasks 1 &amp; 2)</button>
      `;
      $('#practice-desmos-btn')?.classList.add('hidden');
    }
  }
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
  if (target === '#test') renderTest();
  if (target === '#progress') renderProgress();

  window.scrollTo(0, 0);
}

// ═══════════════════════════════════════════════════════════════
// SECTION 1: TODAY (LEARNING COMMAND CENTER)
// ═══════════════════════════════════════════════════════════════
function renderToday() {
  const ws = getCurWS();
  const isSAT = db.activeWorkspace === 'sat';

  // Compute accuracy & question stats
  let totalQ = 0, totalCorrect = 0;
  let weakSkill = isSAT ? 'Inferences' : 'True / False / Not Given';
  let minAcc = 100;

  Object.entries(ws.skills || {}).forEach(([skill, s]) => {
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

  const overallAcc = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 75;

  // Update Focus Skill Card
  const focusName = $('#focus-skill-name');
  if (focusName) focusName.textContent = weakSkill;
  const focusReason = $('#focus-skill-reason');
  if (focusReason) {
    focusReason.textContent = totalQ > 0 
      ? `Độ chính xác hiện tại là ${minAcc === 100 ? overallAcc : minAcc}% — hoàn thành bài luyện 12 phút để nâng cao.`
      : (isSAT ? 'Kỹ năng nền tảng quan trọng nhất trong cấu trúc Digital SAT 2026.' : 'Kỹ năng bẫy paraphrase cốt lõi trong IELTS Reading.');
  }

  // Update Trajectory Card
  const traj = $('#trajectory-stat');
  if (traj) {
    traj.innerHTML = `Độ chính xác trung bình <strong>${overallAcc}%</strong> qua <strong>${totalQ} câu hỏi</strong> đã giải quyết.`;
  }

  // Update Error Trap Alert Card
  const trapName = $('#trap-alert-name');
  if (trapName) {
    trapName.textContent = isSAT ? 'Over-Inference & Extreme Scope' : 'True / False / Not Given Paraphrase Gap';
  }
}

window.startTodayPlan = function() {
  location.hash = '#practice';
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
  const isSAT = db.activeWorkspace === 'sat';
  const key = domainKey || (isSAT ? 'rw-info' : 'ielts-all');

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
        <input type="text" id="grid-in-input" class="grid-in-input" placeholder="e.g. 4.5 or 12" />
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
  $$('.answer-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.choice === letter);
  });
};

window.submitCurrentAnswer() = function() {
  if (!currentQuestion) return;

  let answer = selectedChoice;
  if (currentQuestion.is_grid_in) {
    const input = $('#grid-in-input');
    if (input) answer = input.value.trim();
  }

  if (!answer) {
    alert('Vui lòng chọn hoặc nhập câu trả lời trước khi kiểm tra.');
    return;
  }

  const correct = String(answer).trim().toLowerCase() === String(currentQuestion.correct_answer).trim().toLowerCase();
  const timeTakenSec = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
  const ws = getCurWS();

  // Record to skills progress
  const skill = currentQuestion.skill || 'General';
  if (!ws.skills[skill]) ws.skills[skill] = { correct: 0, total: 0, history: [] };
  ws.skills[skill].total++;
  if (correct) ws.skills[skill].correct++;
  ws.skills[skill].history.push({ correct, timestamp: Date.now(), timeTakenSec });

  // Record error if wrong
  if (!correct) {
    ws.errors.unshift({
      question_id: currentQuestion.question_id || 'Q-' + Date.now(),
      domain: currentQuestion.domain || 'Reading',
      skill: skill,
      answer: answer,
      correct_answer: currentQuestion.correct_answer,
      error_type: currentQuestion.error_type || 'COGNITIVE_DISTRACTOR',
      timestamp: Date.now()
    });
    if (ws.errors.length > 100) ws.errors.pop();
  }
  save();

  // Highlight choices
  $$('.answer-option').forEach(opt => {
    const ch = opt.dataset.choice;
    if (ch === currentQuestion.correct_answer) opt.classList.add('correct');
    else if (ch === answer && !correct) opt.classList.add('wrong');
  });

  // ── Render 6-Stage Deliberate Feedback ──
  renderDeliberateFeedback(correct, timeTakenSec);
};

function renderDeliberateFeedback(correct, timeTakenSec) {
  const q = currentQuestion;
  const panel = $('#feedback-panel');
  if (!panel) return;

  // 01 Result
  const banner = $('#fb-result-banner');
  const title = $('#fb-result-title');
  if (banner && title) {
    banner.className = `feedback-result-banner ${correct ? 'success' : 'review'}`;
    title.textContent = correct ? '✓ Chính xác! (Correct)' : '⚠️ Cần Xem Lại & Khắc Phục (Needs Review)';
  }
  const timeEl = $('#fb-time-taken');
  if (timeEl) timeEl.textContent = `Thời gian thực hiện: ${timeTakenSec}s`;

  // 02 Why
  const whyEl = $('#fb-why-text');
  if (whyEl) whyEl.textContent = q.explanation || 'Đáp án đúng dựa trên bằng chứng trực tiếp từ đoạn văn.';

  // 03 Why Not (Distractor analysis)
  const whyNotContainer = $('#fb-whynot-container');
  if (whyNotContainer) {
    if (q.why_others_wrong && typeof q.why_others_wrong === 'object') {
      whyNotContainer.innerHTML = Object.entries(q.why_others_wrong).map(([letter, reason]) => `
        <div style="margin-bottom:0.4rem;">
          <strong>Phương án ${letter}:</strong> ${escapeHTML(reason)}
        </div>
      `).join('');
    } else {
      whyNotContainer.innerHTML = 'Các phương án còn lại chứa bẫy suy diễn vượt phạm vi hoặc thông tin không được văn bản xác thực.';
    }
  }

  // 04 Thinking Strategy
  const stratEl = $('#fb-strategy-text');
  if (stratEl) stratEl.textContent = q.thinking_framework || 'Đối chiếu 3 điểm chốt: Chủ ngữ, Trạng thái logic và Điều kiện giới hạn.';

  // 05 Error Pattern
  const trapTag = $('#fb-error-pattern-tag');
  const trapText = $('#fb-trap-text');
  if (trapTag) trapTag.textContent = q.error_type || (correct ? 'MASTERY' : 'OVER_INFERENCE');
  if (trapText) trapText.textContent = q.common_trap || 'Bẫy thường gặp: Lựa chọn câu có từ ngữ giống đề bài nhưng đổi hướng lập luận.';

  // Show panel, hide submit
  $('#q-action-bar').style.display = 'none';
  panel.style.display = 'block';
}

window.nextPracticeQuestion = function() {
  currentPracticeIdx = (currentPracticeIdx + 1) % practicePool.length;
  renderCurrentQuestion();
};

window.trySimilarQuestion = function() {
  const currentSkill = currentQuestion?.skill;
  const similar = practicePool.filter(q => q.skill === currentSkill && q.question_id !== currentQuestion?.question_id);
  if (similar.length > 0) {
    currentPracticeIdx = practicePool.indexOf(similar[0]);
    renderCurrentQuestion();
  } else {
    nextPracticeQuestion();
  }
};

// ═══════════════════════════════════════════════════════════════
// SECTION 3: REVIEW (FSRS FLASHCARDS & ERROR ANALYSIS)
// ═══════════════════════════════════════════════════════════════
let flashcardDeck = [];
let currentCardIdx = 0;

async function renderReview() {
  const ws = getCurWS();
  const isSAT = db.activeWorkspace === 'sat';

  // Flashcards due count
  const fcType = isSAT ? 'vocabulary_direct_hits' : 'ielts';
  flashcardDeck = await loadFlashcards(fcType);

  let dueCount = 0;
  const now = Date.now();
  flashcardDeck.forEach(c => {
    const s = ws.flashcardState[c.card_id];
    if (!s || !s.due || s.due <= now) dueCount++;
  });

  const dueEl = $('#review-fc-due-count');
  if (dueEl) dueEl.textContent = dueCount || flashcardDeck.length;

  const errEl = $('#review-mistakes-count');
  if (errEl) errEl.textContent = (ws.errors || []).length;

  // Render Mistake Ledger
  renderMistakeLedger();
}

function renderMistakeLedger() {
  const ws = getCurWS();
  const container = $('#mistakes-list-container');
  if (!container) return;

  if (!ws.errors || ws.errors.length === 0) {
    container.innerHTML = '<p class="text-muted text-sm py-4 text-center">Chưa ghi nhận lỗi sai nào. Hãy tiếp tục luyện tập!</p>';
    return;
  }

  container.innerHTML = ws.errors.slice(0, 10).map((err, idx) => `
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

window.startFlashcardReview = function() {
  const wrapper = $('#flashcard-interactive-wrapper');
  if (!wrapper) return;
  wrapper.style.display = 'block';
  currentCardIdx = 0;
  renderFlashcardCard();
};

function renderFlashcardCard() {
  const c = flashcardDeck[currentCardIdx];
  if (!c) return;

  $('#fc-progress-count').textContent = `Thẻ ${currentCardIdx + 1} / ${flashcardDeck.length}`;
  $('#flashcard-element')?.classList.remove('flipped');

  // Front
  const frontMain = $('#fc-front-main');
  const frontContext = $('#fc-front-context');
  if (c.front) {
    if (c.front.word) {
      frontMain.textContent = c.front.word;
      frontContext.textContent = c.front.context ? `"${c.front.context}"` : '';
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
      backBox.innerHTML = Object.entries(c.back).map(([k, v]) => `
        <div style="margin-bottom:0.35rem;">
          <strong>${escapeHTML(k)}:</strong> ${Array.isArray(v) ? escapeHTML(v.join(', ')) : escapeHTML(v)}
        </div>
      `).join('');
    }
  }
}

window.flipFlashcard = function() {
  $('#flashcard-element')?.classList.toggle('flipped');
};

window.rateFlashcard = function(rating) {
  const c = flashcardDeck[currentCardIdx];
  if (c) {
    const ws = getCurWS();
    const cur = ws.flashcardState[c.card_id] || { ease: 2.5, interval: 1, reviews: 0 };
    cur.reviews++;
    // FSRS interval scaling
    if (rating === 1) cur.interval = 1;
    else if (rating === 2) cur.interval = Math.max(1, cur.interval * 1.2);
    else if (rating === 3) cur.interval = Math.max(2, cur.interval * 2.2);
    else if (rating === 4) cur.interval = Math.max(4, cur.interval * 3.5);
    cur.due = Date.now() + cur.interval * 86400000;
    ws.flashcardState[c.card_id] = cur;
    save();
  }

  currentCardIdx = (currentCardIdx + 1) % flashcardDeck.length;
  renderFlashcardCard();
};

window.retryMistakeItem = function(skillName) {
  location.hash = '#practice';
  setTimeout(() => {
    const similar = practicePool.filter(q => q.skill === skillName);
    if (similar.length > 0) {
      currentPracticeIdx = practicePool.indexOf(similar[0]);
      renderCurrentQuestion();
    }
  }, 100);
};

// ═══════════════════════════════════════════════════════════════
// SECTION 4: TEST & MOCK EXAMS
// ═══════════════════════════════════════════════════════════════
function renderTest() {
  // Test section ready
}

let timedInterval = null;
let timedSecRemaining = 0;

window.startTimedSession = async function(mode, minutes, count) {
  const isSAT = db.activeWorkspace === 'sat';
  const pool = isSAT ? await loadQuestions('rw-info') : await loadQuestions('ielts-all');

  practicePool = pool.slice(0, count);
  currentPracticeIdx = 0;
  location.hash = '#practice';

  timedSecRemaining = minutes * 60;
  clearInterval(timedInterval);
  timedInterval = setInterval(() => {
    if (timedSecRemaining <= 0) {
      clearInterval(timedInterval);
      alert('Hết giờ làm bài!');
      return;
    }
    timedSecRemaining--;
  }, 1000);
};

window.startMockTest = function(section) {
  startTimedSession(section, 32, 27);
};

// ═══════════════════════════════════════════════════════════════
// SECTION 5: PROGRESS & PARENT COMPANION
// ═══════════════════════════════════════════════════════════════
function renderProgress() {
  const ws = getCurWS();
  const isSAT = db.activeWorkspace === 'sat';
  const skillsList = isSAT ? SAT_SKILLS : IELTS_SKILLS;

  // Skill Mastery Bars
  const container = $('#skill-mastery-bars-container');
  if (container) {
    container.innerHTML = skillsList.map(skill => {
      const s = ws.skills[skill] || { correct: 0, total: 0 };
      const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      const colorClass = pct >= 75 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-error';
      return `
        <div>
          <div class="flex justify-between text-xs mb-1">
            <strong>${escapeHTML(skill)}</strong>
            <span>${pct}% (${s.correct}/${s.total})</span>
          </div>
          <div class="progress-container">
            <div class="progress-bar ${colorClass}" style="width:${Math.max(5, pct)}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Parent Companion stats
  let totalMin = 0, totalQ = 0, masteredCount = 0;
  Object.values(ws.skills || {}).forEach(s => {
    totalQ += (s.total || 0);
    if (s.total >= 3 && (s.correct / s.total) >= 0.75) masteredCount++;
  });
  totalMin = Math.round(totalQ * 1.5);

  $('#parent-total-hours').textContent = `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`;
  $('#parent-total-questions').textContent = `${totalQ} câu`;
  $('#parent-active-days').textContent = totalQ > 0 ? `${Math.min(7, Math.ceil(totalQ / 15))} ngày` : '0 ngày';
  $('#parent-mastered-skills').textContent = `${masteredCount} / ${skillsList.length}`;
}

// ═══════════════════════════════════════════════════════════════
// CONTEXTUAL AI COACH (TUTOR ENGINE)
// ═══════════════════════════════════════════════════════════════
window.askAICoach = function() {
  const modal = $('#ai-coach-modal');
  if (!modal) return;
  modal.classList.add('open');

  const q = currentQuestion;
  if (q) {
    $('#ai-context-indicator').textContent = `Context: ${q.question_id || 'Active Item'} (${q.skill || 'Academic Skill'})`;
  }
};

window.closeAICoach = function() {
  $('#ai-coach-modal')?.classList.remove('open');
};

window.askAIPrompt = function(type) {
  const q = currentQuestion;
  const res = $('#ai-response-content');
  if (!res || !q) return;

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

  const ws = getCurWS();
  let totalQ = 0, totalCorrect = 0, masteredCount = 0;
  Object.values(ws.skills || {}).forEach(s => {
    totalQ += (s.total || 0);
    totalCorrect += (s.correct || 0);
    if (s.total >= 3 && (s.correct / s.total) >= 0.75) masteredCount++;
  });
  const acc = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 80;

  $('#share-stat-q').textContent = totalQ || 25;
  $('#share-stat-acc').textContent = `${acc}%`;
  $('#share-stat-skills').textContent = `${masteredCount || 2}/15`;

  modal.style.display = 'flex';
};

window.closeShareModal = function() {
  $('#share-modal').style.display = 'none';
};

window.copyShareText = function() {
  const wsName = db.activeWorkspace === 'sat' ? 'Digital SAT 2026' : 'IELTS Academic';
  const caption = `🎯 Hôm nay mình vừa hoàn thành bài rèn luyện trên N&Mstudio_Education — Intelligent Learning OS (${wsName})!

🌱 "Mỗi lỗi sai là một bước tiến gần hơn tới mục tiêu 1500+ SAT / 7.5+ IELTS."
👉 Khám phá nền tảng: https://sat-intelliprep.nmstudio.edu.vn
💬 Hotline Zalo hỗ trợ: +98 557 8385

#NandMstudio #DigitalSAT #IELTSAcademic #GrowthMindset`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(caption).then(() => {
      alert('Đã sao chép caption thành công!');
    });
  } else {
    prompt('Sao chép nội dung bài đăng:', caption);
  }
};

// ── Data Management Exports ──
window.exportUserData = function() {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nmstudio_learning_data_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

window.exportErrorLogCSV = function() {
  const ws = getCurWS();
  if (!ws.errors || !ws.errors.length) { alert('Chưa có dữ liệu lỗi sai.'); return; }
  const headers = ['question_id', 'domain', 'skill', 'answer', 'correct_answer', 'error_type', 'date'];
  const rows = ws.errors.map(e => [
    e.question_id, `"${e.domain}"`, `"${e.skill}"`, `"${e.answer}"`, `"${e.correct_answer}"`, e.error_type, new Date(e.timestamp).toLocaleDateString()
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nmstudio_mistakes_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

window.exportAnkiTSV = async function() {
  const cards = await loadFlashcards(db.activeWorkspace === 'sat' ? 'vocabulary_direct_hits' : 'ielts');
  if (!cards.length) { alert('Không có thẻ flashcard.'); return; }
  
  const lines = cards.map(c => {
    let front = c.front?.word || c.front?.phrase || '';
    if (c.front?.context) front += `<br><small><i>"${c.front.context}"</i></small>`;
    let back = typeof c.back === 'string' ? c.back : Object.entries(c.back || {}).map(([k, v]) => `<b>${k}:</b> ${Array.isArray(v) ? v.join(', ') : v}`).join('<br>');
    return `${front.replace(/\t/g, ' ')}\t${back.replace(/\t/g, ' ')}\t${db.activeWorkspace.toUpperCase()}`;
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/tab-separated-values;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nmstudio_anki_${db.activeWorkspace}_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  alert(`Đã xuất thành công ${cards.length} thẻ Anki TSV! Mở Anki -> File -> Import để nạp vào học.`);
};

window.resetAllProgress = function() {
  if (!confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học tập? Hành động này không thể hoàn tác.')) return;
  localStorage.removeItem(DB_KEY);
  location.reload();
};

// ── Global Keyboard Shortcuts ──
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAICoach();
    closeShareModal();
    const desmos = $('#desmos-modal');
    if (desmos && !desmos.classList.contains('hidden')) toggleDesmos();
  }
});

// ── App Startup ──
document.addEventListener('DOMContentLoaded', init);
