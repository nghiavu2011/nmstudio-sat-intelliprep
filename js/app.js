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
  'True / False / Not Given', 'Yes / No / Not Given', 'Matching Headings',
  'Summary Completion', 'Multiple Choice', 'Matching Features',
  'Task 1 Data Description & Synthesis', 'Task 2 Academic Cohesion & Hedging'
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
    if (key.startsWith('ielts')) {
      if (!qCache['ielts_master']) {
        const r = await fetch('data/ielts/ielts_questions.json');
        const d = await r.json();
        qCache['ielts_master'] = d.questions || d;
      }
      const master = qCache['ielts_master'] || [];
      if (key === 'ielts' || key === 'ielts-all') {
        qCache[key] = master;
      } else if (key === 'ielts-tfng') {
        qCache[key] = master.filter(q => q.skill === 'True / False / Not Given' || q.skill === 'Yes / No / Not Given');
      } else if (key === 'ielts-headings') {
        qCache[key] = master.filter(q => q.skill === 'Matching Headings');
      } else if (key === 'ielts-summary') {
        qCache[key] = master.filter(q => q.skill === 'Summary Completion');
      } else if (key === 'ielts-mcq') {
        qCache[key] = master.filter(q => q.skill === 'Multiple Choice' || q.skill === 'Matching Features');
      } else if (key === 'ielts-task1') {
        qCache[key] = master.filter(q => q.skill === 'Task 1 Data Description & Synthesis');
      } else if (key === 'ielts-task2') {
        qCache[key] = master.filter(q => q.skill === 'Task 2 Academic Cohesion & Hedging');
      } else {
        qCache[key] = master;
      }
      return qCache[key];
    }

    let url = SAT_Q_FILES[key];
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
        <button class="domain-tab-btn active" data-domain="ielts-all" onclick="selectDomainTab('ielts-all')">Tất Cả Kỹ Năng</button>
        <button class="domain-tab-btn" data-domain="ielts-tfng" onclick="selectDomainTab('ielts-tfng')">Reading: T/F/NG &amp; Y/N/NG</button>
        <button class="domain-tab-btn" data-domain="ielts-headings" onclick="selectDomainTab('ielts-headings')">Reading: Matching Headings</button>
        <button class="domain-tab-btn" data-domain="ielts-summary" onclick="selectDomainTab('ielts-summary')">Reading: Summary &amp; Gap Fill</button>
        <button class="domain-tab-btn" data-domain="ielts-mcq" onclick="selectDomainTab('ielts-mcq')">Reading: Multiple Choice</button>
        <button class="domain-tab-btn" data-domain="ielts-task1" onclick="selectDomainTab('ielts-task1')">Writing: Task 1 Synthesis</button>
        <button class="domain-tab-btn" data-domain="ielts-task2" onclick="selectDomainTab('ielts-task2')">Writing: Task 2 Cohesion</button>
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
let currentFcType = null;

async function renderReview(deckType = null) {
  const ws = getCurWS();
  const isSAT = db.activeWorkspace === 'sat';

  if (!deckType) {
    currentFcType = isSAT ? 'vocabulary_direct_hits' : 'ielts';
  } else {
    currentFcType = deckType;
  }

  flashcardDeck = await loadFlashcards(currentFcType);

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

window.startFlashcardReview = function(deckType = null) {
  const wrapper = $('#flashcard-interactive-wrapper');
  if (!wrapper) return;
  wrapper.style.display = 'block';
  currentCardIdx = 0;
  if (deckType) {
    renderReview(deckType).then(() => renderFlashcardCard());
  } else {
    renderFlashcardCard();
  }
};

function renderFlashcardCard() {
  const c = flashcardDeck[currentCardIdx];
  if (!c) return;

  $('#fc-progress-count').textContent = `Thẻ ${currentCardIdx + 1} / ${flashcardDeck.length}`;
  $('#flashcard-element')?.classList.remove('flipped');

  // Deck label
  const deckEl = $('#fc-deck-name');
  if (deckEl) {
    deckEl.textContent = c.category ? `Deck: ${c.category}` : (db.activeWorkspace === 'sat' ? 'Deck: Direct Hits Vocabulary' : 'Deck: IELTS Academic Word List');
  }

  // Front
  const frontMain = $('#fc-front-main');
  const frontContext = $('#fc-front-context');
  if (c.front) {
    if (c.front.word) {
      const phonetic = c.front.phonetic ? `<span style="font-size:1.05rem;color:var(--color-muted-dark);display:block;margin-top:0.35rem;font-family:monospace;font-weight:500;">${escapeHTML(c.front.phonetic)}</span>` : '';
      frontMain.innerHTML = `${escapeHTML(c.front.word)} ${phonetic}`;
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
      let bHtml = '';
      if (c.back.vietnamese) {
        bHtml += `<div style="font-size:1.15rem;font-weight:700;color:var(--color-primary);margin-bottom:0.5rem;">${escapeHTML(c.back.vietnamese)}</div>`;
      }
      if (c.back.definition) {
        bHtml += `<div style="margin-bottom:0.4rem;color:var(--color-ink);"><strong>Định nghĩa học thuật:</strong> ${escapeHTML(c.back.definition)}</div>`;
      }
      if (c.back.collocations && Array.isArray(c.back.collocations)) {
        bHtml += `<div style="margin-bottom:0.4rem;"><strong>Cụm từ đi kèm (Collocations):</strong> <span style="color:#0284C7;font-weight:600;">${escapeHTML(c.back.collocations.join(' • '))}</span></div>`;
      }
      if (c.back.example) {
        bHtml += `<div style="margin-bottom:0.4rem;font-style:italic;color:var(--color-muted-dark);"><strong>Ví dụ chuẩn Band 8+:</strong> "${escapeHTML(c.back.example)}"</div>`;
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
// SECTION 4: TEST & MOCK EXAMS (FULL EXAM ENGINE)
// ═══════════════════════════════════════════════════════════════
let activeExam = {
  testId: null,
  title: '',
  durationSec: 0,
  secondsRemaining: 0,
  questions: [],
  passages: {},
  userAnswers: {},
  flags: {},
  currentIdx: 0,
  timerInterval: null
};

function renderTest() {
  const isSAT = db.activeWorkspace === 'sat';
  const grid = $('#test-pack-grid');
  if (!grid) return;

  // Restore view if coming back
  const examArea = $('#timed-exam-area');
  const resultsArea = $('#timed-results-area');
  if (examArea) examArea.style.display = 'none';
  if (resultsArea) resultsArea.style.display = 'none';
  grid.style.display = 'grid';

  if (isSAT) {
    grid.innerHTML = `
      <div class="test-pack-card featured">
        <div>
          <span class="plan-badge mb-2">Digital SAT Full Simulation</span>
          <h3 style="font-size:1.15rem;font-weight:800;">Digital SAT Official Practice Pack 1</h3>
          <p class="text-xs text-muted mt-1">Trọn vẹn 2 Module Reading &amp; Writing + 2 Module Math (98 câu), bám sát khảo thí College Board 2026.</p>
        </div>
        <div class="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span class="text-xs font-semibold">134 phút · 98 câu</span>
          <button class="btn-primary-action text-xs" onclick="startMockExam('sat', 'sat-pt1')">Vào Thi Thử →</button>
        </div>
      </div>

      <div class="test-pack-card">
        <div>
          <span class="tag mb-2">Digital SAT Mock 2</span>
          <h3 style="font-size:1.15rem;font-weight:800;">Digital SAT Official Practice Pack 2</h3>
          <p class="text-xs text-muted mt-1">Bộ đề chuẩn hóa số 2 với cấu trúc phân hóa thích ứng cao (Adaptive Test).</p>
        </div>
        <div class="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span class="text-xs font-semibold">134 phút · 98 câu</span>
          <button class="btn btn-outline text-xs" onclick="startMockExam('sat', 'sat-pt2')">Vào Thi Thử →</button>
        </div>
      </div>

      <div class="test-pack-card">
        <div>
          <span class="tag mb-2">Digital SAT Mock 3</span>
          <h3 style="font-size:1.15rem;font-weight:800;">Digital SAT Official Practice Pack 3</h3>
          <p class="text-xs text-muted mt-1">Bộ đề nâng cao tập trung kiểm tra tốc độ tư duy và kỹ năng phân tích phản biện.</p>
        </div>
        <div class="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span class="text-xs font-semibold">134 phút · 98 câu</span>
          <button class="btn btn-outline text-xs" onclick="startMockExam('sat', 'sat-pt3')">Vào Thi Thử →</button>
        </div>
      </div>

      <div class="test-pack-card">
        <div>
          <span class="tag mb-2" style="background:#EFF6FF;color:#1D4ED8;">Math Hard Sprint</span>
          <h3 style="font-size:1.15rem;font-weight:800;">Math Hard Module Sprint</h3>
          <p class="text-xs text-muted mt-1">22 câu hỏi phân loại cao (Level 4-5) Algebra &amp; Advanced Math với máy tính Desmos.</p>
        </div>
        <div class="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span class="text-xs font-semibold">35 phút · 22 câu</span>
          <button class="btn btn-outline text-xs" onclick="startMockExam('sat', 'sat-math-sprint')">Luyện Tốc Độ →</button>
        </div>
      </div>

      <div class="test-pack-card">
        <div>
          <span class="tag mb-2" style="background:#EFF6FF;color:#1D4ED8;">RW Section Sprint</span>
          <h3 style="font-size:1.15rem;font-weight:800;">Reading &amp; Writing Sprint</h3>
          <p class="text-xs text-muted mt-1">27 câu hỏi trọn vẹn 1 Module với các dạng Inferences, Evidence và Craft &amp; Structure.</p>
        </div>
        <div class="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span class="text-xs font-semibold">32 phút · 27 câu</span>
          <button class="btn btn-outline text-xs" onclick="startMockExam('sat', 'sat-rw-sprint')">Luyện Tốc Độ →</button>
        </div>
      </div>

      <div class="test-pack-card">
        <div>
          <span class="tag mb-2">Quick 10-Min</span>
          <h3 style="font-size:1.15rem;font-weight:800;">Speed Diagnostic 10 Phút</h3>
          <p class="text-xs text-muted mt-1">10 câu hỏi ngẫu nhiên tổng hợp để khởi động não bộ trước buổi học.</p>
        </div>
        <div class="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span class="text-xs font-semibold">10 phút · 10 câu</span>
          <button class="btn btn-outline text-xs" onclick="startMockExam('sat', 'sat-quick-sprint')">Khởi Động →</button>
        </div>
      </div>
    `;
  } else {
    // IELTS Workspace
    grid.innerHTML = `
      <div class="test-pack-card featured">
        <div>
          <span class="plan-badge mb-2" style="background:#ECFDF5;color:#065F46;border-color:#A7F3D0;">IELTS Full Reading Mock</span>
          <h3 style="font-size:1.15rem;font-weight:800;">IELTS Academic Reading Test 1</h3>
          <p class="text-xs text-muted mt-1">Mô phỏng chân thực 60 phút gồm 3 bài đọc học thuật: Biomimetics Architecture, Cave Art &amp; Writing, Deep Neural Syntax.</p>
        </div>
        <div class="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span class="text-xs font-semibold">60 phút · 20 câu</span>
          <button class="btn-primary-action text-xs" onclick="startMockExam('ielts', 'ielts-pt1')">Vào Thi Thử →</button>
        </div>
      </div>

      <div class="test-pack-card">
        <div>
          <span class="tag mb-2" style="background:#ECFDF5;color:#065F46;">IELTS Full Reading Mock 2</span>
          <h3 style="font-size:1.15rem;font-weight:800;">IELTS Academic Reading Test 2</h3>
          <p class="text-xs text-muted mt-1">3 bài đọc học thuật nâng cao: Hydrokinetic Marine Energy, Behavioral Nudges, và Transgenerational Epigenetics.</p>
        </div>
        <div class="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span class="text-xs font-semibold">60 phút · 20 câu</span>
          <button class="btn btn-outline text-xs" onclick="startMockExam('ielts', 'ielts-pt2')">Vào Thi Thử →</button>
        </div>
      </div>

      <div class="test-pack-card">
        <div>
          <span class="tag mb-2" style="background:#ECFDF5;color:#065F46;">IELTS Reading Sprint</span>
          <h3 style="font-size:1.15rem;font-weight:800;">Reading T/F/NG &amp; Headings Sprint</h3>
          <p class="text-xs text-muted mt-1">12 câu hỏi tập trung rèn luyện phản xạ bẫy paraphrase và tóm tắt đoạn văn.</p>
        </div>
        <div class="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span class="text-xs font-semibold">20 phút · 12 câu</span>
          <button class="btn btn-outline text-xs" onclick="startMockExam('ielts', 'ielts-reading-sprint')">Luyện Tốc Độ →</button>
        </div>
      </div>

      <div class="test-pack-card">
        <div>
          <span class="tag mb-2" style="background:#FEF3C7;color:#92400E;">Writing Strategy Sprint</span>
          <h3 style="font-size:1.15rem;font-weight:800;">Writing Task 1 &amp; 2 Masterclass Sprint</h3>
          <p class="text-xs text-muted mt-1">10 câu hỏi chiến lược tổng hợp biểu đồ Task 1 và cấu trúc lập luận, hedging Task 2 chuẩn Band 8+.</p>
        </div>
        <div class="mt-4 pt-3 border-t border-border flex justify-between items-center">
          <span class="text-xs font-semibold">25 phút · 10 câu</span>
          <button class="btn btn-outline text-xs" onclick="startMockExam('ielts', 'ielts-writing-sprint')">Rèn Lập Luận →</button>
        </div>
      </div>
    `;
  }
}

window.startMockExam = async function(examType, testId) {
  let questions = [];
  let passages = {};
  let title = '';
  let durationMinutes = 60;

  try {
    if (testId === 'sat-pt1') {
      const r = await fetch('data/practice_tests/practice_test_1.json');
      const d = await r.json();
      title = d.title || 'Digital SAT Official Practice Test 1';
      durationMinutes = 60;
      const rw1 = d.reading_and_writing?.module_1 || [];
      const rw2 = d.reading_and_writing?.module_2 || [];
      const m1 = d.math?.module_1 || [];
      const m2 = d.math?.module_2 || [];
      questions = [...rw1, ...rw2, ...m1, ...m2];
    } else if (testId === 'sat-pt2') {
      const r = await fetch('data/practice_tests/practice_test_2.json');
      const d = await r.json();
      title = d.title || 'Digital SAT Official Practice Test 2';
      durationMinutes = 60;
      const rw1 = d.reading_and_writing?.module_1 || [];
      const rw2 = d.reading_and_writing?.module_2 || [];
      const m1 = d.math?.module_1 || [];
      const m2 = d.math?.module_2 || [];
      questions = [...rw1, ...rw2, ...m1, ...m2];
    } else if (testId === 'sat-pt3') {
      const r = await fetch('data/practice_tests/practice_test_3.json');
      const d = await r.json();
      title = d.title || 'Digital SAT Official Practice Test 3';
      durationMinutes = 60;
      const rw1 = d.reading_and_writing?.module_1 || [];
      const rw2 = d.reading_and_writing?.module_2 || [];
      const m1 = d.math?.module_1 || [];
      const m2 = d.math?.module_2 || [];
      questions = [...rw1, ...rw2, ...m1, ...m2];
    } else if (testId === 'sat-math-sprint') {
      title = 'Math Hard Module Sprint (Level 4-5)';
      durationMinutes = 35;
      const adv = await loadQuestions('math-adv');
      const alg = await loadQuestions('math-alg');
      questions = [...adv.slice(0, 12), ...alg.slice(0, 10)];
    } else if (testId === 'sat-rw-sprint') {
      title = 'Reading & Writing Module 1 Sprint';
      durationMinutes = 32;
      const info = await loadQuestions('rw-info');
      const craft = await loadQuestions('rw-craft');
      questions = [...info.slice(0, 14), ...craft.slice(0, 13)];
    } else if (testId === 'sat-quick-sprint') {
      title = 'Speed Diagnostic 10 Phút';
      durationMinutes = 10;
      const pool = await loadQuestions('rw-info');
      questions = pool.slice(0, 10);
    } else if (testId === 'ielts-pt1') {
      const r = await fetch('data/ielts/ielts_practice_test_1.json');
      const d = await r.json();
      title = d.title || 'IELTS Academic Reading Simulation 1';
      durationMinutes = d.duration_minutes || 60;
      questions = d.questions || [];
      (d.passages || []).forEach(p => { passages[p.passage_id] = p; });
    } else if (testId === 'ielts-pt2') {
      const r = await fetch('data/ielts/ielts_practice_test_2.json');
      const d = await r.json();
      title = d.title || 'IELTS Academic Reading Simulation 2';
      durationMinutes = d.duration_minutes || 60;
      questions = d.questions || [];
      (d.passages || []).forEach(p => { passages[p.passage_id] = p; });
    } else if (testId === 'ielts-reading-sprint') {
      title = 'IELTS Reading T/F/NG & Headings Sprint';
      durationMinutes = 20;
      const all = await loadQuestions('ielts-all');
      questions = all.filter(q => q.domain === 'Reading').slice(0, 12);
    } else if (testId === 'ielts-writing-sprint') {
      title = 'IELTS Writing Task 1 & 2 Masterclass Sprint';
      durationMinutes = 25;
      const all = await loadQuestions('ielts-all');
      questions = all.filter(q => q.domain === 'Writing').slice(0, 10);
    }
  } catch (e) {
    console.error('Failed to load exam data:', e);
    alert('Không thể nạp dữ liệu đề thi. Vui lòng thử lại!');
    return;
  }

  if (!questions || questions.length === 0) {
    alert('Đề thi đang được cập nhật!');
    return;
  }

  // Initialize activeExam state
  activeExam = {
    testId,
    title,
    durationSec: durationMinutes * 60,
    secondsRemaining: durationMinutes * 60,
    questions,
    passages,
    userAnswers: {},
    flags: {},
    currentIdx: 0,
    timerInterval: null
  };

  // Start Timer
  clearInterval(activeExam.timerInterval);
  activeExam.timerInterval = setInterval(() => {
    if (activeExam.secondsRemaining <= 0) {
      clearInterval(activeExam.timerInterval);
      alert('Đã hết thời gian làm bài! Hệ thống tự động nộp bài để chấm điểm.');
      finishTimedSession();
      return;
    }
    activeExam.secondsRemaining--;
    updateTimerDisplay();
  }, 1000);

  // Switch views
  $('#test-pack-grid').style.display = 'none';
  const resultsArea = $('#timed-results-area');
  if (resultsArea) resultsArea.style.display = 'none';
  $('#timed-exam-area').style.display = 'block';

  // Toggle Desmos button visibility
  const desmosBtn = $('#timed-desmos-btn');
  if (desmosBtn) {
    desmosBtn.classList.toggle('hidden', examType !== 'sat');
  }

  updateTimerDisplay();
  renderExamCurrentQuestion();
  window.scrollTo(0, 0);
};

function updateTimerDisplay() {
  const timerEl = $('#timed-timer');
  if (!timerEl) return;
  const s = activeExam.secondsRemaining;
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    timerEl.textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  } else {
    timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  timerEl.classList.toggle('warning', s <= 300);
}

function renderExamCurrentQuestion() {
  const q = activeExam.questions[activeExam.currentIdx];
  if (!q) return;

  $('#timed-exam-title').textContent = activeExam.title;
  $('#timed-exam-status').textContent = `Câu ${activeExam.currentIdx + 1} / ${activeExam.questions.length} (${q.skill || q.domain})`;

  // Render Palette
  renderExamPalette();

  // Check passage
  let passageText = q.passage || '';
  if (!passageText && q.passage_id && activeExam.passages[q.passage_id]) {
    const pObj = activeExam.passages[q.passage_id];
    passageText = `<strong>${escapeHTML(pObj.title || '')}</strong>\n\n${escapeHTML(pObj.text || '')}`;
  }

  const renderContainer = $('#timed-question-render');
  const curAns = activeExam.userAnswers[activeExam.currentIdx] || '';

  let choicesHtml = '';
  if (q.choices) {
    choicesHtml = Object.entries(q.choices).map(([letter, text]) => `
      <button class="answer-option ${curAns === letter ? 'selected' : ''}" onclick="selectExamChoice('${letter}')">
        <span class="choice-letter">${letter}</span>
        <span class="choice-text">${escapeHTML(text)}</span>
      </button>
    `).join('');
  } else if (q.is_grid_in) {
    choicesHtml = `
      <div style="padding:1rem 0;">
        <label class="text-sm font-semibold text-muted block mb-2">Nhập kết quả số (Student-Produced Response):</label>
        <input type="text" id="exam-gridin-input" class="grid-in-input" value="${escapeHTML(curAns)}" placeholder="e.g. 12 or 4.5" oninput="selectExamChoice(this.value.trim())" />
      </div>
    `;
  }

  if (passageText) {
    renderContainer.innerHTML = `
      <div class="exam-split-layout">
        <div class="exam-passage-pane">
          <div style="white-space: pre-wrap; font-family: var(--font-body); line-height:1.75;">${passageText}</div>
        </div>
        <div class="exam-question-pane">
          <div class="text-base font-semibold mb-4" style="line-height:1.6;">${escapeHTML(q.question_stem || '')}</div>
          <div class="flex-col gap-2">${choicesHtml}</div>
        </div>
      </div>
    `;
  } else {
    renderContainer.innerHTML = `
      <div style="max-width:760px;margin:0 auto;padding-top:1rem;">
        <div class="text-base font-semibold mb-4" style="line-height:1.6;">${escapeHTML(q.question_stem || '')}</div>
        <div class="flex-col gap-2">${choicesHtml}</div>
      </div>
    `;
  }

  // Update Flag Button
  const isFlagged = !!activeExam.flags[activeExam.currentIdx];
  const flagBtn = $('#timed-flag-btn');
  if (flagBtn) {
    flagBtn.textContent = isFlagged ? '🚩 Bỏ Đánh Dấu' : '🚩 Đánh Dấu';
    flagBtn.style.color = isFlagged ? 'var(--color-warning)' : '';
  }

  // Update Answered Count & Next/Prev buttons
  const ansCount = Object.keys(activeExam.userAnswers).length;
  $('#timed-answered-count').textContent = `${ansCount}/${activeExam.questions.length} đã trả lời`;
  $('#timed-prev-btn').disabled = (activeExam.currentIdx === 0);
  $('#timed-next-btn').disabled = (activeExam.currentIdx === activeExam.questions.length - 1);
}

function renderExamPalette() {
  const container = $('#timed-palette-container');
  if (!container) return;

  container.innerHTML = activeExam.questions.map((q, idx) => {
    const isCurrent = idx === activeExam.currentIdx;
    const isAns = activeExam.userAnswers[idx] !== undefined && activeExam.userAnswers[idx] !== '';
    const isFlag = !!activeExam.flags[idx];

    let cls = 'palette-q-btn';
    if (isCurrent) cls += ' current';
    if (isAns) cls += ' answered';
    if (isFlag) cls += ' flagged';

    return `<button class="${cls}" onclick="jumpToExamQuestion(${idx})">${idx + 1}</button>`;
  }).join('');
}

window.selectExamChoice = function(choice) {
  activeExam.userAnswers[activeExam.currentIdx] = choice;
  // Update choice button UI
  $$('#timed-question-render .answer-option').forEach(opt => {
    opt.classList.toggle('selected', opt.querySelector('.choice-letter')?.textContent.trim() === choice);
  });
  renderExamPalette();
  const ansCount = Object.keys(activeExam.userAnswers).length;
  $('#timed-answered-count').textContent = `${ansCount}/${activeExam.questions.length} đã trả lời`;
};

window.toggleExamFlag = function() {
  activeExam.flags[activeExam.currentIdx] = !activeExam.flags[activeExam.currentIdx];
  renderExamCurrentQuestion();
};

window.jumpToExamQuestion = function(idx) {
  if (idx >= 0 && idx < activeExam.questions.length) {
    activeExam.currentIdx = idx;
    renderExamCurrentQuestion();
  }
};

window.prevTimedQuestion = function() {
  if (activeExam.currentIdx > 0) {
    activeExam.currentIdx--;
    renderExamCurrentQuestion();
  }
};

window.nextTimedQuestion = function() {
  if (activeExam.currentIdx < activeExam.questions.length - 1) {
    activeExam.currentIdx++;
    renderExamCurrentQuestion();
  }
};

window.exitTimedSession = function() {
  if (confirm('Bạn có chắc chắn muốn thoát khỏi bài thi thử? Mọi câu trả lời chưa nộp sẽ bị hủy.')) {
    clearInterval(activeExam.timerInterval);
    $('#timed-exam-area').style.display = 'none';
    $('#test-pack-grid').style.display = 'grid';
  }
};

window.finishTimedSession = function() {
  const total = activeExam.questions.length;
  const answered = Object.keys(activeExam.userAnswers).length;
  const unanswered = total - answered;

  if (activeExam.secondsRemaining > 0 && unanswered > 0) {
    if (!confirm(`Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài ngay bây giờ?`)) {
      return;
    }
  }

  clearInterval(activeExam.timerInterval);
  const timeSpentSec = activeExam.durationSec - activeExam.secondsRemaining;

  // Grade test
  let correctCount = 0;
  const ws = getCurWS();
  const isSAT = db.activeWorkspace === 'sat';

  activeExam.questions.forEach((q, idx) => {
    const userAns = activeExam.userAnswers[idx];
    const isCorrect = userAns && String(userAns).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase();
    if (isCorrect) correctCount++;

    // Update skill progress in background
    const skill = q.skill || 'General';
    if (!ws.skills[skill]) ws.skills[skill] = { correct: 0, total: 0, history: [] };
    ws.skills[skill].total++;
    if (isCorrect) ws.skills[skill].correct++;
    ws.skills[skill].history.push({ correct: isCorrect, timestamp: Date.now(), timeTakenSec: Math.round(timeSpentSec / total) });

    // Record to errors if wrong
    if (!isCorrect && userAns) {
      ws.errors.unshift({
        question_id: q.question_id || 'EXAM-Q-' + idx,
        domain: q.domain || (isSAT ? 'Reading and Writing' : 'Reading'),
        skill: skill,
        answer: userAns,
        correct_answer: q.correct_answer,
        error_type: q.error_type || 'COGNITIVE_DISTRACTOR',
        timestamp: Date.now()
      });
      if (ws.errors.length > 100) ws.errors.pop();
    }
  });

  save();

  // Display Score & Review Area
  showTestResults(correctCount, total, timeSpentSec);
};

function showTestResults(correct, total, timeSpentSec) {
  $('#timed-exam-area').style.display = 'none';
  const resultsArea = $('#timed-results-area');
  if (!resultsArea) return;
  resultsArea.style.display = 'block';

  const isSAT = db.activeWorkspace === 'sat';
  const pct = Math.round((correct / total) * 100);

  // Scaled Score or Band Score calculation
  let scoreTitle = '';
  let scoreSub = '';
  if (isSAT) {
    const scaledScore = Math.min(1600, Math.max(400, Math.round(400 + (correct / total) * 1200)));
    scoreTitle = `${scaledScore} / 1600`;
    scoreSub = `Độ chính xác: ${pct}% · Trả lời đúng ${correct}/${total} câu · Thời gian: ${Math.floor(timeSpentSec / 60)}m ${timeSpentSec % 60}s`;
  } else {
    let band = '5.0';
    if (pct >= 90) band = '8.5 - 9.0';
    else if (pct >= 80) band = '7.5 - 8.0';
    else if (pct >= 70) band = '6.5 - 7.0';
    else if (pct >= 60) band = '6.0';
    else if (pct >= 50) band = '5.5';
    scoreTitle = `IELTS Band ${band}`;
    scoreSub = `Độ chính xác: ${pct}% · Trả lời đúng ${correct}/${total} câu · Thời gian: ${Math.floor(timeSpentSec / 60)}m ${timeSpentSec % 60}s`;
  }

  // Generate Review Accordion HTML
  const reviewHtml = activeExam.questions.map((q, idx) => {
    const userAns = activeExam.userAnswers[idx] || 'Chưa trả lời';
    const isCorrect = userAns !== 'Chưa trả lời' && String(userAns).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase();

    // Why others wrong
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
            <span class="skill-pill text-xs">Câu ${idx + 1}: ${escapeHTML(q.skill || q.domain)}</span>
            <span class="text-xs font-semibold ${isCorrect ? 'text-success' : 'text-error'}">
              ${isCorrect ? '✓ Đúng' : '⚠️ Sai'}
            </span>
          </div>
          <span class="text-xs text-muted">Bạn chọn: <strong>${escapeHTML(userAns)}</strong> | Đáp án đúng: <strong class="text-success">${escapeHTML(q.correct_answer)}</strong></span>
        </div>
        <p class="text-sm font-semibold mb-2">${escapeHTML(q.question_stem || '')}</p>
        
        <!-- 6-Stage Deliberate Feedback Expansion -->
        <details class="text-xs mt-2" style="background:var(--color-canvas);border-radius:var(--radius);padding:0.75rem;border:1px solid var(--color-border);">
          <summary class="font-bold cursor-pointer text-primary">📖 Xem Bóc Tách Bẫy Lỗi &amp; Khung Tư Duy Chi Tiết</summary>
          <div class="mt-3 flex-col gap-2" style="line-height:1.6;">
            <div><strong class="text-success">02 Bằng chứng đáp án đúng:</strong> ${escapeHTML(q.explanation || '')}</div>
            <div class="mt-1"><strong>03 Phân tích bẫy phương án sai:</strong><div class="pl-2 mt-1">${whyNot}</div></div>
            <div class="mt-1"><strong>04 Khung tư duy:</strong> ${escapeHTML(q.thinking_framework || 'Đối chiếu ngữ nghĩa và ranh giới logic')}</div>
            <div class="mt-1"><strong>05 Bẫy nhận thức:</strong> <span class="error-pattern-tag" style="margin-top:0;">${escapeHTML(q.error_type || 'COGNITIVE_DISTRACTOR')}</span> — ${escapeHTML(q.common_trap || '')}</div>
            ${q.socratic_prompt ? `<div class="mt-1" style="color:var(--color-primary);"><strong>06 Gợi mở Socratic:</strong> <em>"${escapeHTML(q.socratic_prompt)}"</em></div>` : ''}
          </div>
        </details>
      </div>
    `;
  }).join('');

  resultsArea.innerHTML = `
    <div class="test-score-banner">
      <span class="plan-badge mb-2" style="background:rgba(255,255,255,0.15);color:white;border-color:rgba(255,255,255,0.3);">Kết Quả Khảo Thí</span>
      <div class="test-score-number">${scoreTitle}</div>
      <p class="text-sm" style="color:#E2E8F0;">${scoreSub}</p>
      <div class="flex justify-center gap-3 mt-4 flex-wrap">
        <button class="btn btn-outline" style="color:white;border-color:white;" onclick="closeTestResults()">Quay Về Danh Sách Đề</button>
        <button class="btn" style="background:white;color:var(--color-ink);font-weight:700;" onclick="window.print()">🖨️ In Bảng Điểm (Print/PDF)</button>
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

window.startTimedSession = function(mode, minutes, count) {
  startMockExam(db.activeWorkspace, mode === 'math' ? 'sat-math-sprint' : (mode === 'ielts' ? 'ielts-reading-sprint' : 'sat-quick-sprint'));
};

window.startMockTest = function(section) {
  startMockExam('sat', 'sat-pt1');
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
