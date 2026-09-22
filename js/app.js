/* SAT Intelligent Learning System — Main Application
   ponytail: vanilla JS, localStorage, fetch JSON, zero dependencies */

const DB_KEY = 'sat_system';
const SKILLS = [
  'Central Ideas and Details','Command of Evidence: Textual','Command of Evidence: Quantitative',
  'Inferences','Words in Context','Text Structure and Purpose','Cross-Text Connections',
  'Rhetorical Synthesis','Transitions','Boundaries','Form, Structure, and Sense',
  'Algebra','Advanced Math','Problem-Solving and Data Analysis','Geometry and Trigonometry'
];

// ── State Loading with Fallback Safety (Alibaba OCR - Robustness) ──
function loadState() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Corrupted state detected in localStorage, resetting to default:', e);
  }
  return {
    profile: null,
    skills: {},         // { skillName: { correct, total, mastery, history:[] } }
    errors: [],         // { question_id, domain, skill, answer, correct, error_type, timestamp, diagnosed }
    flashcardState: {}, // { card_id: { ease, interval, due, reviews } }
    sessionLog: [],     // { date, duration, skills_practiced, accuracy }
    diagnosticDone: false
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

// ── Security Helper: Prevent XSS in dynamic rendering (Alibaba OCR - Security) ──
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Question Cache ──
const qCache = {};
const fcCache = {};
const Q_FILES = {
  'rw-info': 'data/questions/rw_information_ideas.json',
  'rw-craft': 'data/questions/rw_craft_structure.json',
  'rw-expr': 'data/questions/rw_expression_ideas.json',
  'rw-conv': 'data/questions/rw_conventions.json',
  'math-alg': 'data/questions/math_algebra.json',
  'math-adv': 'data/questions/math_advanced.json',
  'math-psda': 'data/questions/math_psda.json',
  'math-geo': 'data/questions/math_geometry_trig.json'
};
const FC_FILES = [
  'vocabulary',
  'grammar',
  'transitions',
  'rhetorical',
  'math',
  'vocabulary_direct_hits',
  'vocabulary_secondary_meanings'
];

async function loadQuestions(key) {
  if (qCache[key]) return qCache[key];
  try {
    const r = await fetch(Q_FILES[key]);
    const d = await r.json();
    qCache[key] = d.questions || d;
    return qCache[key];
  } catch(e) { console.warn('Failed to load', key, e); return []; }
}

async function loadFlashcards(type) {
  if (fcCache[type]) return fcCache[type];
  try {
    const r = await fetch(`data/flashcards/${type}.json`);
    const d = await r.json();
    fcCache[type] = d.cards || d;
    return fcCache[type];
  } catch(e) { console.warn('Failed to load FC', type, e); return []; }
}

async function loadDiagnostic() {
  try {
    const r = await fetch('data/diagnostic/diagnostic_questions.json');
    const d = await r.json();
    return d.questions;
  } catch(e) { return []; }
}

async function loadFrameworks() {
  try {
    const r = await fetch('data/frameworks/rw_frameworks.json');
    return await r.json();
  } catch(e) { return null; }
}

// ── DOM ──
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ── Init ──
function init() {
  const modal = $('#setup-modal');
  if (!db.profile) {
    modal.style.display = 'flex';
  } else {
    modal.style.display = 'none';
    updateLanguage();
  }

  // Date
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const h1 = $('#today h1');
  if (h1) h1.textContent = greeting + '!';
  $$('.date-display').forEach(el => el.textContent = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }));

  // Route
  window.addEventListener('hashchange', handleRoute);
  handleRoute();

  // Setup submit
  $('#setup-submit').addEventListener('click', () => {
    db.profile = {
      grade: $('#setup-grade').value,
      level: $('#setup-level').value,
      setupDate: new Date().toISOString()
    };
    save();
    modal.style.display = 'none';
    updateLanguage();
    // Start diagnostic
    if (!db.diagnosticDone) startDiagnostic();
  });

  // Nav toggle for mobile
  setupMobileNav();

  // Practice
  $('#start-practice-btn')?.addEventListener('click', startPractice);

  // Flashcard flip
  $('#flip-btn')?.addEventListener('click', () => {
    $('.flashcard')?.classList.toggle('is-flipped');
  });

  // Language toggle
  $('#toggle-lang')?.addEventListener('click', () => {
    const levels = ['foundation','intermediate','advanced'];
    const cur = db.profile?.level || 'intermediate';
    const idx = levels.indexOf(cur);
    db.profile.level = levels[(idx+1) % levels.length];
    save();
    updateLanguage();
  });

  // Quick start buttons
  $$('#today .btn-outline').forEach(btn => {
    btn.addEventListener('click', () => {
      const mins = parseInt(btn.textContent);
      if (mins) startQuickSession(mins);
    });
  });

  // Dashboard update
  updateDashboard();
}

// ── Routing ──
function handleRoute() {
  const hash = location.hash || '#today';
  $$('.nav-item').forEach(i => i.classList.toggle('active', i.getAttribute('href') === hash));
  $$('.section').forEach(s => s.classList.toggle('active', '#'+s.id === hash));

  // Lazy load sections
  if (hash === '#flashcards') loadFlashcardSession();
  if (hash === '#progress') renderProgress();
  if (hash === '#mistakes') renderMistakes();
  if (hash === '#learn') renderLearn();
  if (hash === '#parent') renderParentCompanion();
}

// ── Language ──
function updateLanguage() {
  const lvl = db.profile?.level || 'intermediate';
  $$('.nav-item').forEach(item => {
    const en = item.dataset.en, vi = item.dataset.vi;
    if (!en) return;
    if (item.classList.contains('nav-parent-item')) {
      item.textContent = lvl === 'foundation' ? `👨‍👩‍👧 ${en} (${vi})` : `👨‍👩‍👧 ${vi}`;
    } else {
      item.textContent = lvl === 'foundation' ? `${en} (${vi})` : en;
    }
  });
  const toggleBtn = $('#toggle-lang');
  if (toggleBtn) {
    toggleBtn.textContent = `🌐 ${lvl.charAt(0).toUpperCase()+lvl.slice(1)}`;
  }
}

// ── Dashboard ──
function updateDashboard() {
  // Flashcards due
  let due = 0;
  const now = Date.now();
  Object.values(db.flashcardState).forEach(s => { if (!s.due || s.due <= now) due++; });
  const fcDue = $('#fc-due-count');
  if (fcDue) fcDue.textContent = due || '—';

  // Weakest skill
  let weakest = null, weakestScore = 1;
  for (const [skill, data] of Object.entries(db.skills)) {
    const m = data.total > 0 ? data.correct / data.total : 0;
    if (m < weakestScore) { weakestScore = m; weakest = skill; }
  }

  // Update dashboard cards dynamically
  const planCard = $('#today .card:first-child');
  if (planCard && weakest) {
    planCard.querySelector('p:nth-child(2)').innerHTML = `<strong>Focus:</strong> ${weakest}`;
    planCard.querySelector('p:nth-child(3)').innerHTML = `<strong>Why:</strong> Lowest accuracy (${Math.round(weakestScore*100)}%)`;
  }

  // Recent errors
  const recentErrors = db.errors.slice(-5);
  const errCard = $('#today .card:nth-child(3)');
  if (errCard && recentErrors.length > 0) {
    errCard.querySelector('p').textContent = `${recentErrors.length} recent errors in ${recentErrors[0].domain}`;
  }
}

// ── Mobile Nav ──
function setupMobileNav() {
  const sidebar = $('.sidebar');
  if (!sidebar) return;
  if ($('.mobile-menu-btn')) return; // Avoid duplicate buttons (Alibaba OCR)
  const burger = document.createElement('button');
  burger.className = 'mobile-menu-btn';
  burger.setAttribute('aria-label', 'Toggle Navigation Menu');
  burger.innerHTML = '☰';
  burger.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.body.prepend(burger);
  // Close on nav click
  $$('.nav-item').forEach(n => n.addEventListener('click', () => sidebar.classList.remove('open')));
}

// ── Diagnostic ──
let diagQuestions = [];
let diagIdx = 0;
let diagAnswers = [];

async function startDiagnostic() {
  diagQuestions = await loadDiagnostic();
  if (!diagQuestions.length) return;
  diagIdx = 0;
  diagAnswers = [];
  location.hash = '#practice';
  setTimeout(() => renderDiagQuestion(), 100);
}

function renderDiagQuestion() {
  const area = $('#practice-area');
  if (!area) return;
  area.classList.remove('hidden');
  area.style.display = 'block';

  const q = diagQuestions[diagIdx];
  if (!q) { finishDiagnostic(); return; }

  const progress = `Question ${diagIdx+1} / ${diagQuestions.length} — Diagnostic`;
  area.innerHTML = `
    <div class="text-sm text-muted mb-2">${progress}</div>
    <div class="tag mb-2">${q.domain} · ${q.skill} · Difficulty ${q.difficulty}</div>
    ${q.passage ? `<div class="passage mb-4">${q.passage}</div>` : ''}
    <p class="font-semibold mb-4">${q.question_stem}</p>
    <div class="choices flex-col gap-2">
      ${Object.entries(q.choices).map(([k,v]) =>
        `<button class="choice-btn btn btn-outline text-left" data-choice="${k}"><strong>${k}.</strong> ${v}</button>`
      ).join('')}
    </div>
    <div id="q-feedback" class="mt-4 hidden"></div>
  `;

  area.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDiagAnswer(btn.dataset.choice, q));
  });
}

function handleDiagAnswer(choice, q) {
  const correct = choice === q.correct_answer;
  diagAnswers.push({ q_id: q.q_id, domain: q.domain, skill: q.skill, choice, correct, difficulty: q.difficulty });

  // Record in skills
  if (!db.skills[q.skill]) db.skills[q.skill] = { correct:0, total:0, history:[] };
  db.skills[q.skill].total++;
  if (correct) db.skills[q.skill].correct++;
  db.skills[q.skill].history.push({ correct, timestamp: Date.now(), difficulty: q.difficulty });

  if (!correct) {
    db.errors.push({
      question_id: q.q_id, domain: q.domain, skill: q.skill,
      answer: choice, correct_answer: q.correct_answer,
      error_type: 'DIAGNOSTIC', timestamp: Date.now(), diagnosed: false
    });
  }
  save();

  // Visual feedback
  const btns = $$('.choice-btn');
  btns.forEach(b => {
    b.disabled = true;
    if (b.dataset.choice === q.correct_answer) b.style.borderColor = 'var(--color-success)';
    if (b.dataset.choice === choice && !correct) b.style.borderColor = 'var(--color-error)';
  });

  const fb = $('#q-feedback');
  fb.classList.remove('hidden');
  fb.style.display = 'block';
  fb.innerHTML = correct
    ? `<div style="color:var(--color-success)">✓ Correct!</div>`
    : `<div style="color:var(--color-error)">✗ The correct answer is ${q.correct_answer}.</div>`;

  setTimeout(() => { diagIdx++; renderDiagQuestion(); }, 1500);
}

function finishDiagnostic() {
  db.diagnosticDone = true;
  save();

  const area = $('#practice-area');
  const total = diagAnswers.length;
  const correct = diagAnswers.filter(a => a.correct).length;

  // Build skill profile
  let profileHTML = '<div class="flex-col gap-2 mt-4">';
  for (const skill of SKILLS) {
    const data = db.skills[skill];
    let level = 'NOT YET ASSESSED', color = 'var(--color-muted)';
    if (data && data.total > 0) {
      const pct = data.correct / data.total;
      if (pct >= 0.8) { level = 'STRONG'; color = 'var(--color-success)'; }
      else if (pct >= 0.5) { level = 'DEVELOPING'; color = 'var(--color-warning)'; }
      else { level = 'WEAK'; color = 'var(--color-error)'; }
    }
    profileHTML += `<div class="flex justify-between items-center p-2 rounded" style="border-left: 4px solid ${color}">
      <span class="text-sm">${skill}</span>
      <span class="tag" style="background:${color};color:white">${level}</span>
    </div>`;
  }
  profileHTML += '</div>';

  area.innerHTML = `
    <h2 class="text-xl font-bold mb-4">Diagnostic Complete</h2>
    <div class="text-lg mb-4">Score: ${correct} / ${total} (${Math.round(correct/total*100)}%)</div>
    <h3 class="font-semibold mb-2">Your Skill Profile</h3>
    ${profileHTML}
    <button class="btn btn-primary mt-4" onclick="location.hash='#today'">Go to Dashboard</button>
  `;
  updateDashboard();
}

// ── Practice Engine ──
let practiceQs = [];
let practiceIdx = 0;

async function startPractice() {
  const domain = $('#practice-domain').value;
  const diff = parseInt($('#practice-diff').value);
  const qs = await loadQuestions(domain);
  practiceQs = diff ? qs.filter(q => q.difficulty === diff) : qs;
  if (!practiceQs.length) practiceQs = qs; // fallback: show all
  practiceIdx = 0;
  renderPracticeQuestion();
}

function renderPracticeQuestion() {
  const area = $('#practice-area');
  area.classList.remove('hidden');
  area.style.display = 'block';

  const q = practiceQs[practiceIdx];
  if (!q) {
    area.innerHTML = `<div class="text-center p-8">
      <h2 class="text-xl font-bold mb-4">Session Complete!</h2>
      <p class="text-muted">You've completed all questions in this set.</p>
      <button class="btn btn-primary mt-4" onclick="location.hash='#today'">Back to Dashboard</button>
    </div>`;
    return;
  }

  const progress = `Question ${practiceIdx+1} / ${practiceQs.length}`;
  area.innerHTML = `
    <div class="text-sm text-muted mb-2">${progress}</div>
    <div class="flex gap-2 mb-2">
      <span class="tag">${q.domain}</span>
      <span class="tag">${q.skill}</span>
      <span class="tag">Diff ${q.difficulty}</span>
    </div>
    ${q.passage ? `<div class="passage mb-4">${q.passage}</div>` : ''}
    <p class="font-semibold mb-4">${q.question_stem}</p>
    ${q.choices ? `<div class="choices flex-col gap-2">
      ${Object.entries(q.choices).map(([k,v]) =>
        `<button class="choice-btn btn btn-outline text-left" data-choice="${k}"><strong>${k}.</strong> ${v}</button>`
      ).join('')}
    </div>` : `<input type="text" id="grid-in" class="mb-2" placeholder="Enter your answer...">
    <button class="btn btn-primary" id="grid-submit">Submit</button>`}
    <div id="q-feedback" class="mt-4 hidden"></div>
  `;

  if (q.choices) {
    area.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => handlePracticeAnswer(btn.dataset.choice, q));
    });
  } else {
    $('#grid-submit')?.addEventListener('click', () => {
      const val = $('#grid-in').value.trim();
      handlePracticeAnswer(val, q);
    });
  }
}

let currentPracticeConfidence = 'medium';

window.setPracticeConfidence = function(level) {
  currentPracticeConfidence = level;
  $$('.conf-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.conf === level);
  });
};

function parseMathValue(val) {
  if (val === null || val === undefined) return NaN;
  val = String(val).trim();
  if (val.includes('/')) {
    const parts = val.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (den !== 0) return num / den;
    }
  }
  return parseFloat(val);
}

function checkAnswerCorrectness(q, answer) {
  if (q.choices) {
    return String(answer).trim().toUpperCase() === String(q.correct_answer).trim().toUpperCase();
  }
  // Student-produced response (grid-in)
  const u = parseMathValue(answer);
  const c = parseMathValue(q.correct_answer);
  if (!isNaN(u) && !isNaN(c)) {
    return Math.abs(u - c) < 0.001;
  }
  return String(answer).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase();
}

function handlePracticeAnswer(answer, q) {
  const correct = checkAnswerCorrectness(q, answer);

  // Record in skills
  if (!db.skills[q.skill]) db.skills[q.skill] = { correct:0, total:0, history:[] };
  db.skills[q.skill].total++;
  if (correct) db.skills[q.skill].correct++;
  db.skills[q.skill].history.push({ 
    correct, 
    confidence: currentPracticeConfidence, 
    timestamp: Date.now(), 
    difficulty: q.difficulty 
  });

  const errType = correct ? null : classifyError(q, answer, currentPracticeConfidence);

  if (!correct) {
    db.errors.push({
      question_id: q.question_id, 
      domain: q.domain, 
      skill: q.skill,
      answer, 
      correct_answer: q.correct_answer,
      error_type: errType,
      confidence: currentPracticeConfidence,
      timestamp: Date.now(), 
      diagnosed: false
    });
  }
  save();

  // Disable choices
  $$('.choice-btn').forEach(b => {
    b.disabled = true;
    if (b.dataset.choice === q.correct_answer) b.style.borderColor = 'var(--color-success)';
    if (b.dataset.choice === answer && !correct) b.style.borderColor = 'var(--color-error)';
  });

  // Feedback with structured error diagnosis
  const fb = $('#q-feedback');
  fb.classList.remove('hidden');
  fb.style.display = 'block';

  if (correct) {
    fb.innerHTML = `
      <div style="color:var(--color-success); font-weight:700" class="mb-2">✓ Correct!</div>
      <div class="text-sm">${q.explanation || ''}</div>
      ${q.calculator_note ? `<div class="mt-2 text-xs text-muted">💡 Strategy: ${q.calculator_note}</div>` : ''}
    `;
  } else {
    const wrongExplanation = q.why_others_wrong?.[answer] || 'This option does not satisfy the requirements of the text/problem.';
    fb.innerHTML = `
      <div style="color:var(--color-error); font-weight:700" class="mb-2">✗ Incorrect (${errType})</div>
      <div class="error-diagnosis p-4 rounded" style="border-left:4px solid var(--color-error)">
        <p><strong>WHAT HAPPENED:</strong> You selected "${answer}". ${wrongExplanation}</p>
        <p class="mt-2"><strong>CORRECT METHOD:</strong> ${q.explanation || ''}</p>
        <p class="mt-2"><strong>COMMON TRAP:</strong> ${q.common_trap || 'Superficial distractor or misread premise.'}</p>
        ${q.thinking_framework ? `<p class="mt-2"><strong>REMEMBER:</strong> ${q.thinking_framework}</p>` : ''}
        ${q.calculator_note ? `<p class="mt-2 text-xs"><strong>CALCULATOR DECISION:</strong> ${q.calculator_note}</p>` : ''}
        <div class="mt-3 text-xs text-muted">Scheduled for spaced retrieval review.</div>
      </div>`;
  }

  // Reset confidence for next question
  currentPracticeConfidence = 'medium';

  setTimeout(() => { practiceIdx++; renderPracticeQuestion(); }, correct ? 2000 : 5000);
}

function classifyError(q, answer, confidence) {
  // Confidence miscalibration
  if (confidence === 'high') {
    return 'CONFIDENCE_MISCALIBRATION';
  }
  const trap = (q.common_trap || '').toLowerCase();
  const domain = (q.domain || '').toLowerCase();
  const skill = (q.skill || '').toLowerCase();

  if (domain.includes('math')) {
    if (trap.includes('sign') || trap.includes('arithmetic') || trap.includes('addition') || trap.includes('multiply')) return 'CALCULATION_ERROR';
    if (trap.includes('unit') || trap.includes('rate') || trap.includes('conversion')) return 'UNIT_ERROR';
    if (trap.includes('calculator') || trap.includes('desmos')) return 'CALCULATOR_MISUSE';
    if (trap.includes('formula') || trap.includes('concept') || trap.includes('definition')) return 'KNOWLEDGE_GAP';
    return 'ALGEBRA_ERROR';
  }

  // Reading & Writing
  if (skill.includes('words') || trap.includes('vocabulary') || trap.includes('dictionary')) return 'VOCABULARY_GAP';
  if (skill.includes('boundaries') || skill.includes('conventions') || skill.includes('form') || trap.includes('comma') || trap.includes('verb')) return 'GRAMMAR_RULE_GAP';
  if (skill.includes('evidence') || trap.includes('evidence')) return 'WRONG_EVIDENCE';
  if (skill.includes('inference') || trap.includes('inference') || trap.includes('assumption')) return 'UNSUPPORTED_INFERENCE';
  if (trap.includes('extreme') || trap.includes('opposite') || trap.includes('unrelated')) return 'DISTRACTOR_TRAP';
  if (trap.includes('misread') || trap.includes('overlook')) return 'MISREAD_QUESTION';

  return 'DISTRACTOR_TRAP';
}

// ── Flashcard Engine (FSRS-lite) ──
let fcDeck = [];
let fcIdx = 0;

async function loadFlashcardSession() {
  fcDeck = [];
  for (const type of FC_FILES) {
    const cards = await loadFlashcards(type);
    fcDeck.push(...cards);
  }
  // Filter to due cards
  const now = Date.now();
  fcDeck = fcDeck.filter(c => {
    const state = db.flashcardState[c.card_id];
    return !state || !state.due || state.due <= now;
  });
  // Shuffle
  fcDeck.sort(() => Math.random() - 0.5);
  fcIdx = 0;

  // Update count
  const cnt = $('#fc-due');
  if (cnt) cnt.textContent = fcDeck.length;

  renderFlashcard();
}

function renderFlashcard() {
  const card = fcDeck[fcIdx];
  const front = $('#fc-front-text');
  const back = $('#fc-back-text');
  const fcEl = $('.flashcard');

  if (!card) {
    if (front) front.innerHTML = '<div class="text-center">🎉 All cards reviewed!</div>';
    if (back) back.textContent = '';
    return;
  }

  fcEl?.classList.remove('is-flipped');

  // Render front
  if (card.front) {
    if (card.type === 'vocabulary') {
      front.innerHTML = `<div class="text-lg font-bold mb-2">${card.front.word}</div>
        <div class="text-sm" style="font-style:italic">"${card.front.context}"</div>`;
    } else if (card.front.sentence) {
      front.innerHTML = `<div class="text-sm mb-2 tag">${card.type}</div>
        <div>${card.front.sentence || card.front.relationship || card.front.situation || card.front.concept || ''}</div>`;
    } else {
      front.innerHTML = `<div class="text-sm mb-2 tag">${card.type}</div>
        <div>${JSON.stringify(card.front).replace(/[{}"]/g, '').replace(/,/g, '<br>')}</div>`;
    }
  }

  // Render back
  if (card.back) {
    const backContent = typeof card.back === 'string' ? card.back :
      Object.entries(card.back).map(([k,v]) => `<strong>${k}:</strong> ${Array.isArray(v) ? v.join(', ') : v}`).join('<br>');
    back.innerHTML = backContent;
  }
}

window.nextCard = function(rating) {
  const card = fcDeck[fcIdx];
  if (!card) return;

  // FSRS-lite: simple interval scheduling
  const state = db.flashcardState[card.card_id] || { ease: 2.5, interval: 1, reviews: 0 };
  state.reviews++;

  const multipliers = { again: 0, hard: 0.5, good: 1, easy: 1.5 };
  const mult = multipliers[rating];

  if (rating === 'again') {
    state.interval = 1; // Reset to 1 day
    state.ease = Math.max(1.3, state.ease - 0.2);
  } else {
    state.interval = Math.max(1, Math.round(state.interval * state.ease * mult));
    if (rating === 'easy') state.ease += 0.15;
    if (rating === 'hard') state.ease = Math.max(1.3, state.ease - 0.15);
  }

  state.due = Date.now() + state.interval * 86400000; // days to ms
  db.flashcardState[card.card_id] = state;
  save();

  fcIdx++;
  const cnt = $('#fc-due');
  if (cnt) cnt.textContent = Math.max(0, fcDeck.length - fcIdx);

  setTimeout(renderFlashcard, 300);
};

// ── Progress ──
function renderProgress() {
  const container = $('#progress .card .flex-col');
  if (!container) return;

  container.innerHTML = '';
  for (const skill of SKILLS) {
    const data = db.skills[skill] || { correct:0, total:0 };
    const pct = data.total > 0 ? Math.round(data.correct / data.total * 100) : 0;
    let color = pct >= 80 ? 'var(--color-success)' : pct >= 50 ? 'var(--color-warning)' : pct > 0 ? 'var(--color-error)' : 'var(--color-muted)';
    let label = pct >= 80 ? 'STRONG' : pct >= 50 ? 'DEVELOPING' : pct > 0 ? 'WEAK' : '—';

    container.innerHTML += `<div>
      <div class="flex justify-between text-sm"><span>${skill}</span><span>${label} (${pct}%)</span></div>
      <div class="progress-container"><div class="progress-bar" style="width:${pct}%;background:${color}"></div></div>
    </div>`;
  }

  // Accuracy trend (simple)
  const trendCard = $$('#progress .card')[1];
  if (trendCard) {
    const recent = db.errors.slice(-20);
    const sessions = db.sessionLog.slice(-10);
    trendCard.innerHTML = `<h2>Statistics</h2>
      <div class="mt-4 flex-col gap-2">
        <p><strong>Total Questions Attempted:</strong> ${Object.values(db.skills).reduce((a,s) => a + s.total, 0)}</p>
        <p><strong>Overall Accuracy:</strong> ${
          Object.values(db.skills).reduce((a,s) => a + s.total, 0) > 0
          ? Math.round(Object.values(db.skills).reduce((a,s) => a + s.correct, 0) / Object.values(db.skills).reduce((a,s) => a + s.total, 0) * 100)
          : 0
        }%</p>
        <p><strong>Total Errors:</strong> ${db.errors.length}</p>
        <p><strong>Flashcards Reviewed:</strong> ${Object.keys(db.flashcardState).length}</p>
      </div>`;
  }
}

// ── Mistakes ──
function renderMistakes() {
  const list = $('#mistakes-list');
  if (!list) return;

  if (db.errors.length === 0) {
    list.innerHTML = '<p class="text-muted">No errors recorded yet. Start practicing to build your error profile.</p>';
    return;
  }

  // Group by error type
  const grouped = {};
  db.errors.forEach(e => {
    if (!grouped[e.error_type]) grouped[e.error_type] = [];
    grouped[e.error_type].push(e);
  });

  list.innerHTML = Object.entries(grouped).map(([type, errors]) => `
    <div class="p-4 border rounded mb-2" style="border-color:var(--color-border)">
      <div class="flex justify-between items-center">
        <span class="tag" style="background:var(--color-error);color:white">${type}</span>
        <span class="text-sm text-muted">${errors.length} error${errors.length>1?'s':''}</span>
      </div>
      ${errors.slice(-3).map(e => `
        <div class="mt-2 p-2 rounded" style="background:var(--color-bg)">
          <p class="text-sm"><strong>${e.skill}</strong> — Q: ${e.question_id}</p>
          <p class="text-sm text-muted">Your answer: ${e.answer} · Correct: ${e.correct_answer}</p>
          <p class="text-sm text-muted">${new Date(e.timestamp).toLocaleDateString()}</p>
        </div>
      `).join('')}
    </div>
  `).join('');
}

// ── Learn / Frameworks & Track B Academic English ──
async function renderLearn() {
  const frameworks = await loadFrameworks();
  if (!frameworks) return;

  const learnSection = $('#learn');
  let rwHTML = '';
  if (frameworks.reading_and_writing) {
    for (const [key, fw] of Object.entries(frameworks.reading_and_writing)) {
      rwHTML += `<div class="card mb-4">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-semibold" style="margin-bottom:0">${fw.label}</h3>
          <span class="tag" style="background:#dbeafe;color:#1e40af">SAT-TESTED</span>
        </div>
        <div class="flex-col gap-1">
          ${fw.steps.map(s => `<div class="p-2 rounded text-sm" style="background:var(--color-bg)">
            <strong>Step ${s.step}:</strong> ${s.en}
            ${db.profile?.level === 'foundation' ? `<br><em class="text-muted">${s.vi}</em>` : ''}
          </div>`).join('')}
        </div>
        <p class="mt-2 text-sm" style="color:var(--color-primary)"><strong>Key:</strong> ${fw.key_reminder}</p>
      </div>`;
    }
  }

  let mathHTML = '';
  if (frameworks.math) {
    const mf = frameworks.math.general_framework;
    mathHTML += `<div class="card mb-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-semibold" style="margin-bottom:0">${mf.label}</h3>
        <span class="tag" style="background:#dbeafe;color:#1e40af">SAT-TESTED</span>
      </div>
      <div class="flex-col gap-1">
        ${mf.steps.map(s => `<div class="p-2 rounded text-sm" style="background:var(--color-bg)">
          <strong>${s.step}:</strong> ${s.en}
          ${db.profile?.level === 'foundation' ? `<br><em class="text-muted">${s.vi}</em>` : ''}
        </div>`).join('')}
      </div>
    </div>`;

    const cd = frameworks.math.calculator_decision;
    mathHTML += `<div class="card mb-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-semibold" style="margin-bottom:0">${cd.label}</h3>
        <span class="tag" style="background:#e0e7ff;color:#3730a3">STRATEGY</span>
      </div>
      <table class="text-sm" style="width:100%">
        <tr><th style="text-align:left;padding:4px 0">Situation</th><th style="text-align:left;padding:4px 0">Decision</th></tr>
        ${cd.rules.map(r => `<tr><td style="padding:4px 0">${r.situation}</td><td style="padding:4px 0"><strong>${r.decision}</strong></td></tr>`).join('')}
      </table>
    </div>`;
  }

  // Track B: Academic English Mastery modules
  const academicEnglishHTML = `
    <div class="card mb-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-semibold" style="margin-bottom:0">1. Words in Context & Morphology</h3>
        <span class="tag" style="background:#dbeafe;color:#1e40af">SAT-TESTED</span>
      </div>
      <p class="text-sm text-muted mb-2">Analyze Greek/Latin roots, prefixes, and nuances rather than dictionary rote memorization.</p>
      <div class="p-2 rounded text-sm mb-2" style="background:var(--color-bg)">
        <strong>Core Principle:</strong> Read context clues for tone (+/-), contrast signals (<em>although, yet</em>), and function.
      </div>
    </div>
    <div class="card mb-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-semibold" style="margin-bottom:0">2. Sentence Architecture & Syntax</h3>
        <span class="tag" style="background:#dbeafe;color:#1e40af">SAT-TESTED</span>
      </div>
      <p class="text-sm text-muted mb-2">Master independent vs dependent clauses, essential vs non-essential modifiers, and parallelism.</p>
      <div class="p-2 rounded text-sm mb-2" style="background:var(--color-bg)">
        <strong>Check:</strong> Subject-Verb Agreement across prepositional phrases; Comma splices vs Semicolons.
      </div>
    </div>
    <div class="card mb-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-semibold" style="margin-bottom:0">3. Rhetorical Moves & Transitions</h3>
        <span class="tag" style="background:#fef3c7;color:#92400e">SAT-SUPPORTING</span>
      </div>
      <p class="text-sm text-muted mb-2">Categorize logical connectors: Addition (<em>furthermore</em>), Contrast (<em>however</em>), Cause/Effect (<em>therefore</em>).</p>
    </div>
    <div class="card mb-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-semibold" style="margin-bottom:0">4. Paraphrase & Summary Synthesis</h3>
        <span class="tag" style="background:#f3f4f6;color:#4b5563">GENERAL-ENGLISH</span>
      </div>
      <p class="text-sm text-muted mb-2">Build genuine comprehension by distilling complex academic texts into concise 1-sentence summaries.</p>
    </div>
  `;

  let rootsHTML = '';
  try {
    const rootsRes = await fetch('data/frameworks/academic_roots.json');
    const rootsData = await rootsRes.json();
    if (rootsData.academic_roots) {
      rootsHTML = `
        <div class="card mb-4">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-semibold" style="margin-bottom:0">5. Greek & Latin Roots Dictionary</h3>
            <span class="tag" style="background:#e0e7ff;color:#3730a3">MORPHOLOGY</span>
          </div>
          <p class="text-sm text-muted mb-3">Learn high-yield roots to decipher unfamiliar Digital SAT vocabulary in context.</p>
          <div class="flex-col gap-2">
            ${rootsData.academic_roots.map(r => `
              <div class="p-2 rounded text-sm" style="background:var(--color-bg);border-left:3px solid var(--color-primary)">
                <strong>${r.root}</strong> (${r.origin}) = <em>"${r.meaning}"</em><br>
                <span class="text-xs text-muted">${r.sat_words.map(w => `<strong>${w.word}</strong>: ${w.meaning}`).join(' · ')}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  } catch(e) {}

  let blackBookHTML = '';
  try {
    const bbRes = await fetch('data/frameworks/black_book_distractors.json');
    const bbData = await bbRes.json();
    if (bbData.black_book_principles) {
      const p = bbData.black_book_principles;
      blackBookHTML = `
        <div class="card mb-4" style="border-left:4px solid #f59e0b">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-semibold" style="margin-bottom:0">6. Black Book Distractor Guide</h3>
            <span class="tag" style="background:#fef3c7;color:#92400e">ELIMINATION STRATEGY</span>
          </div>
          <p class="text-sm font-semibold mb-2" style="color:var(--color-primary)">${p.core_rule}</p>
          <div class="flex-col gap-2">
            ${p.reading_and_writing_distractors.map(d => `
              <div class="p-2 rounded text-sm" style="background:var(--color-bg)">
                <strong>${d.name}:</strong> ${d.mechanism}<br>
                <span class="text-xs text-muted">💡 <em>Antidote:</em> ${d.antidote}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  } catch(e) {}

  const grids = learnSection.querySelectorAll('.grid-2');
  if (grids[0]) {
    grids[0].innerHTML = `
      <div>
        <h2 class="text-lg font-bold mb-4">Track A: Digital SAT Mastery</h2>
        <h4 class="font-semibold mb-2">Reading & Writing Frameworks</h4>
        ${rwHTML}
        <h4 class="font-semibold mb-2 mt-6">Math Frameworks</h4>
        ${mathHTML}
      </div>
      <div>
        <h2 class="text-lg font-bold mb-4">Track B: Academic English Mastery</h2>
        ${academicEnglishHTML}
        ${rootsHTML}
        ${blackBookHTML}
      </div>`;
  }
}

// ── Reflection Engine (Phase M) ──
function generateReflectionReport(sessionData) {
  // sessionData: { title, total, correct, accuracy, questions: [...], timeSpent }
  const skillCounts = {};
  const errorTypeCounts = {};

  sessionData.questions.forEach(q => {
    if (!skillCounts[q.skill]) skillCounts[q.skill] = { correct: 0, total: 0 };
    skillCounts[q.skill].total++;
    if (q.userCorrect) skillCounts[q.skill].correct++;
    else if (q.userErrorType) {
      errorTypeCounts[q.userErrorType] = (errorTypeCounts[q.userErrorType] || 0) + 1;
    }
  });

  const mastered = [];
  const unstable = [];
  for (const [sk, st] of Object.entries(skillCounts)) {
    const acc = st.correct / st.total;
    if (acc >= 0.8) mastered.push(`${sk} (${Math.round(acc*100)}%)`);
    else if (acc < 0.65) unstable.push(`${sk} (${Math.round(acc*100)}%)`);
  }

  // Thinking habit based on top error
  let topError = Object.entries(errorTypeCounts).sort((a,b) => b[1] - a[1])[0]?.[0];
  let habit = "Maintain a steady pace and always eliminate three choices with evidence.";
  if (topError === 'CALCULATION_ERROR') habit = "Write out arithmetic and algebraic steps clearly; avoid mental shortcuts on signs and fractions.";
  else if (topError === 'UNSUPPORTED_INFERENCE') habit = "Stick strictly to what the text guarantees; do not import outside assumptions.";
  else if (topError === 'CONFIDENCE_MISCALIBRATION') habit = "Beware of overconfidence on seemingly easy questions; verify the exact prompt question stem.";
  else if (topError === 'GRAMMAR_RULE_GAP') habit = "Identify sentence boundaries and subjects first before looking at answer choices.";
  else if (topError === 'DISTRACTOR_TRAP') habit = "Watch out for choices using true facts from the passage that do NOT answer the specific question.";

  const reminders = [
    "Digital SAT Reading: Exactly one answer is 100% defensible from the text alone.",
    "Math: Plug values into Desmos or test boundary cases to verify algebra.",
    "Time Management: If stuck on a question for > 60s, flag it and move forward."
  ];

  return `
    <div class="reflection-card">
      <h3 class="text-xl font-bold mb-3">🎓 End-of-Session Learning Reflection</h3>
      <div class="text-sm text-muted mb-4">
        Session: <strong>${sessionData.title}</strong> · Accuracy: <strong>${sessionData.correct}/${sessionData.total} (${sessionData.accuracy}%)</strong>
      </div>
      <div class="reflection-section">
        <h4><span style="color:var(--color-success)">✓</span> TODAY YOU MASTERED</h4>
        <div>${mastered.length > 0 ? mastered.map(m => `<span class="reflection-tag" style="background:#dcfce7;color:#166534">${m}</span>`).join('') : '<span class="text-sm text-muted">Keep practicing to build mastery!</span>'}</div>
      </div>
      <div class="reflection-section">
        <h4><span style="color:var(--color-error)">⚠</span> STILL UNSTABLE (Needs Reinforcement)</h4>
        <div>${unstable.length > 0 ? unstable.map(u => `<span class="reflection-tag" style="background:#fee2e2;color:#991b1b">${u}</span>`).join('') : '<span class="text-sm text-muted">No unstable skills detected in this session!</span>'}</div>
      </div>
      <div class="reflection-section">
        <h4><span style="color:var(--color-warning)">🔍</span> ERROR PATTERNS</h4>
        <div>${Object.keys(errorTypeCounts).length > 0 ? Object.entries(errorTypeCounts).map(([err, cnt]) => `<span class="reflection-tag" style="background:#fef3c7;color:#92400e">${err}: ${cnt}</span>`).join('') : '<span class="text-sm text-muted">Zero errors in this session. Excellent execution!</span>'}</div>
      </div>
      <div class="reflection-section">
        <h4>🧠 THINKING HABIT TO FIX</h4>
        <p class="text-sm" style="background:var(--color-bg);padding:0.5rem;border-radius:4px">${habit}</p>
      </div>
      <div class="reflection-section">
        <h4>📌 REMEMBER THIS</h4>
        <ul class="text-sm flex-col gap-1">
          ${reminders.map(r => `<li>• ${r}</li>`).join('')}
        </ul>
      </div>
      <div class="mt-4 flex gap-2 flex-wrap">
        <button class="btn btn-primary" onclick="location.hash='#today'">Return to Dashboard</button>
        <button class="btn btn-outline" onclick="location.hash='#mistakes'">View Error Intelligence</button>
        <button class="btn btn-outline" onclick="window.print()">🖨️ Print / Save PDF Report Card</button>
      </div>
    </div>
  `;
}

// ── Quick Session ──
async function startQuickSession(minutes) {
  const targetCount = Math.min(25, Math.max(5, Math.round(minutes * 0.8)));
  let allQs = [];
  for (const key of Object.keys(Q_FILES)) {
    const qs = await loadQuestions(key);
    allQs.push(...qs);
  }
  allQs.sort(() => Math.random() - 0.5);
  practiceQs = allQs.slice(0, targetCount);
  practiceIdx = 0;
  location.hash = '#practice';
  setTimeout(renderPracticeQuestion, 100);
}

// ── Spaced Review Session (Phase G) ──
window.startSpacedReviewSession = async function() {
  let reviewQs = [];
  let allQs = [];
  for (const key of Object.keys(Q_FILES)) {
    const qs = await loadQuestions(key);
    allQs.push(...qs);
  }

  // 1. Questions that student got wrong previously
  const errorIds = new Set(db.errors.map(e => e.question_id));
  const errMatching = allQs.filter(q => errorIds.has(q.question_id));
  reviewQs.push(...errMatching);

  // 2. Questions from weak skills
  const weakSkills = Object.entries(db.skills)
    .filter(([,d]) => d.total > 0 && d.correct / d.total < 0.65)
    .map(([s]) => s);
  const weakMatching = allQs.filter(q => weakSkills.includes(q.skill));
  reviewQs.push(...weakMatching);

  // Fallback: mix of questions
  if (reviewQs.length < 5) {
    allQs.sort(() => Math.random() - 0.5);
    reviewQs.push(...allQs.slice(0, 10));
  }

  // Deduplicate and cap at 15
  const uniqueMap = new Map();
  reviewQs.forEach(q => uniqueMap.set(q.question_id, q));
  practiceQs = Array.from(uniqueMap.values()).slice(0, 15);
  practiceIdx = 0;

  location.hash = '#practice';
  setTimeout(() => {
    alert(`Starting Spaced Review: ${practiceQs.length} priority items loaded based on your error history.`);
    renderPracticeQuestion();
  }, 100);
};

// ── Timed Practice Engine ──
let timedSession = {
  active: false,
  questions: [],
  currentIndex: 0,
  answers: {},
  flags: {},
  confidences: {},
  timerInterval: null,
  secondsRemaining: 0,
  totalSeconds: 0,
  title: ''
};

window.startTimedSession = async function(mode, minutes, count) {
  let pool = [];
  if (mode === 'rw') {
    const r1 = await loadQuestions('rw-info');
    const r2 = await loadQuestions('rw-craft');
    const r3 = await loadQuestions('rw-expr');
    const r4 = await loadQuestions('rw-conv');
    pool.push(...r1, ...r2, ...r3, ...r4);
  } else if (mode === 'math') {
    const m1 = await loadQuestions('math-alg');
    const m2 = await loadQuestions('math-adv');
    const m3 = await loadQuestions('math-psda');
    const m4 = await loadQuestions('math-geo');
    pool.push(...m1, ...m2, ...m3, ...m4);
  } else {
    for (const k of Object.keys(Q_FILES)) pool.push(...(await loadQuestions(k)));
  }

  pool.sort(() => Math.random() - 0.5);
  timedSession.questions = pool.slice(0, count);
  timedSession.currentIndex = 0;
  timedSession.answers = {};
  timedSession.flags = {};
  timedSession.confidences = {};
  timedSession.secondsRemaining = minutes * 60;
  timedSession.totalSeconds = minutes * 60;
  timedSession.title = `${mode.toUpperCase()} Sprint (${count} Qs, ${minutes}m)`;
  timedSession.active = true;

  $('#timed-config').classList.add('hidden');
  $('#timed-report-area').classList.add('hidden');
  $('#timed-exam-area').classList.remove('hidden');

  clearInterval(timedSession.timerInterval);
  timedSession.timerInterval = setInterval(updateTimedTimer, 1000);
  updateTimedTimer();

  renderTimedPalette();
  renderTimedCurrentQuestion();
};

function updateTimedTimer() {
  if (timedSession.secondsRemaining <= 0) {
    clearInterval(timedSession.timerInterval);
    alert('Time is up! Submitting your timed session.');
    finishTimedSession();
    return;
  }
  timedSession.secondsRemaining--;
  const mins = Math.floor(timedSession.secondsRemaining / 60);
  const secs = timedSession.secondsRemaining % 60;
  const badge = $('#timed-timer');
  if (badge) {
    badge.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    badge.classList.toggle('warning', timedSession.secondsRemaining <= 300);
  }
}

function renderTimedPalette() {
  const pal = $('#timed-palette');
  if (!pal) return;
  pal.innerHTML = timedSession.questions.map((q, idx) => {
    const isAnswered = timedSession.answers[q.question_id] !== undefined;
    const isFlagged = timedSession.flags[q.question_id];
    const isActive = idx === timedSession.currentIndex;
    return `
      <button class="palette-btn ${isActive ? 'active' : ''} ${isAnswered ? 'answered' : ''} ${isFlagged ? 'flagged' : ''}" 
        onclick="jumpToTimedQuestion(${idx})">
        ${idx + 1}
      </button>
    `;
  }).join('');
}

window.jumpToTimedQuestion = function(idx) {
  timedSession.currentIndex = idx;
  renderTimedPalette();
  renderTimedCurrentQuestion();
};

window.navigateTimedQuestion = function(dir) {
  const next = timedSession.currentIndex + dir;
  if (next >= 0 && next < timedSession.questions.length) {
    jumpToTimedQuestion(next);
  }
};

window.toggleFlagCurrentQuestion = function() {
  const q = timedSession.questions[timedSession.currentIndex];
  if (!q) return;
  timedSession.flags[q.question_id] = !timedSession.flags[q.question_id];
  renderTimedPalette();
  updateTimedFlagButton();
};

function updateTimedFlagButton() {
  const q = timedSession.questions[timedSession.currentIndex];
  const btn = $('#timed-flag-btn');
  if (btn && q) {
    const isF = timedSession.flags[q.question_id];
    btn.style.background = isF ? '#fef3c7' : 'transparent';
    btn.style.borderColor = isF ? '#f59e0b' : 'var(--color-border)';
  }
}

window.setConfidence = function(level) {
  const q = timedSession.questions[timedSession.currentIndex];
  if (!q) return;
  timedSession.confidences[q.question_id] = level;
  $$('#timed-conf-container .conf-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.conf === level);
  });
};

function renderTimedCurrentQuestion() {
  const q = timedSession.questions[timedSession.currentIndex];
  if (!q) return;

  $('#timed-exam-title').textContent = timedSession.title;
  $('#timed-exam-status').textContent = `Question ${timedSession.currentIndex + 1} of ${timedSession.questions.length}`;

  const currentAns = timedSession.answers[q.question_id];
  const currentConf = timedSession.confidences[q.question_id] || 'medium';
  timedSession.confidences[q.question_id] = currentConf;

  // Update confidence buttons
  $$('#timed-conf-container .conf-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.conf === currentConf);
  });

  updateTimedFlagButton();

  // Navigation buttons state
  $('#timed-prev-btn').disabled = timedSession.currentIndex === 0;
  $('#timed-next-btn').textContent = timedSession.currentIndex === timedSession.questions.length - 1 ? 'Finish →' : 'Next →';
  if (timedSession.currentIndex === timedSession.questions.length - 1) {
    $('#timed-next-btn').onclick = () => finishTimedSession();
  } else {
    $('#timed-next-btn').onclick = () => navigateTimedQuestion(1);
  }

  const container = $('#timed-q-content');
  container.innerHTML = `
    <div class="flex gap-2 mb-2">
      <span class="tag">${q.domain}</span>
      <span class="tag">${q.skill}</span>
      <span class="tag">Difficulty: ${q.difficulty}</span>
    </div>
    ${q.passage ? `<div class="passage mb-4">${q.passage}</div>` : ''}
    <p class="font-semibold mb-4">${q.question_stem}</p>
    ${q.choices ? `
      <div class="choices flex-col gap-2">
        ${Object.entries(q.choices).map(([k,v]) => {
          const selected = currentAns === k;
          return `
            <button class="choice-btn btn btn-outline text-left ${selected ? 'btn-primary' : ''}" 
              style="${selected ? 'background:var(--color-primary);color:white;border-color:var(--color-primary)' : ''}"
              onclick="selectTimedChoice('${k}')">
              <strong>${k}.</strong> ${v}
            </button>
          `;
        }).join('')}
      </div>
    ` : `
      <div>
        <label class="text-xs text-muted block mb-1">Student-Produced Response (Fraction or Decimal):</label>
        <input type="text" class="grid-in-input" id="timed-grid-in" value="${currentAns || ''}" 
          placeholder="e.g. 3/4 or 0.75" oninput="selectTimedGridIn(this.value)">
      </div>
    `}
  `;
}

window.selectTimedChoice = function(choice) {
  const q = timedSession.questions[timedSession.currentIndex];
  if (!q) return;
  timedSession.answers[q.question_id] = choice;
  renderTimedPalette();
  renderTimedCurrentQuestion();
};

window.selectTimedGridIn = function(val) {
  const q = timedSession.questions[timedSession.currentIndex];
  if (!q) return;
  timedSession.answers[q.question_id] = val.trim();
  renderTimedPalette();
};

window.finishTimedSession = function() {
  if (!confirm('Are you sure you want to finish and submit this timed session?')) return;
  clearInterval(timedSession.timerInterval);
  timedSession.active = false;

  let correctCount = 0;
  const evaluatedQuestions = timedSession.questions.map(q => {
    const userAns = timedSession.answers[q.question_id];
    const userCorrect = userAns ? checkAnswerCorrectness(q, userAns) : false;
    const userConf = timedSession.confidences[q.question_id] || 'medium';
    let errType = null;

    if (!userCorrect) {
      errType = classifyError(q, userAns || 'UNANSWERED', userConf);
      db.errors.push({
        question_id: q.question_id,
        domain: q.domain,
        skill: q.skill,
        answer: userAns || 'UNANSWERED',
        correct_answer: q.correct_answer,
        error_type: errType,
        confidence: userConf,
        timestamp: Date.now(),
        diagnosed: false
      });
    }

    if (!db.skills[q.skill]) db.skills[q.skill] = { correct: 0, total: 0, history: [] };
    db.skills[q.skill].total++;
    if (userCorrect) {
      db.skills[q.skill].correct++;
      correctCount++;
    }
    db.skills[q.skill].history.push({ correct: userCorrect, confidence: userConf, timestamp: Date.now() });

    return { ...q, userAns, userCorrect, userErrorType: errType, userConf };
  });

  const accuracy = Math.round((correctCount / timedSession.questions.length) * 100);
  db.sessionLog.push({
    title: timedSession.title,
    date: new Date().toISOString(),
    total: timedSession.questions.length,
    correct: correctCount,
    accuracy
  });
  save();
  updateDashboard();

  $('#timed-exam-area').classList.add('hidden');
  const rep = $('#timed-report-area');
  rep.classList.remove('hidden');
  rep.innerHTML = generateReflectionReport({
    title: timedSession.title,
    total: timedSession.questions.length,
    correct: correctCount,
    accuracy,
    questions: evaluatedQuestions,
    timeSpent: timedSession.totalSeconds - timedSession.secondsRemaining
  });
};

// ── Mock Test Adaptive Engine (Phase R) ──
let mockSession = {
  section: 'rw',
  currentModule: 1,
  module1Questions: [],
  module2Questions: [],
  allQuestions: [],
  currentIndex: 0,
  answers: {},
  flags: {},
  confidences: {},
  timerInterval: null,
  secondsRemaining: 0,
  totalSeconds: 0,
  module1Score: 0,
  adaptivePath: 'Standard'
};

window.startMockTest = async function(section) {
  mockSession.section = section;
  mockSession.currentModule = 1;
  mockSession.answers = {};
  mockSession.flags = {};
  mockSession.confidences = {};

  const selectedPackNum = $('#mock-test-selector')?.value || '1';
  let pack = null;
  try {
    const res = await fetch(`data/practice_tests/practice_test_${selectedPackNum}.json`);
    pack = await res.json();
  } catch(e) {}

  if (pack) {
    const dataKey = section === 'rw' ? 'reading_and_writing' : 'math';
    mockSession.packData = pack[dataKey];
    mockSession.module1Questions = pack[dataKey].module_1;
  } else {
    let pool = [];
    if (section === 'rw') {
      const r1 = await loadQuestions('rw-info');
      const r2 = await loadQuestions('rw-craft');
      const r3 = await loadQuestions('rw-expr');
      const r4 = await loadQuestions('rw-conv');
      pool.push(...r1, ...r2, ...r3, ...r4);
    } else {
      const m1 = await loadQuestions('math-alg');
      const m2 = await loadQuestions('math-adv');
      const m3 = await loadQuestions('math-psda');
      const m4 = await loadQuestions('math-geo');
      pool.push(...m1, ...m2, ...m3, ...m4);
    }
    pool.sort(() => Math.random() - 0.5);
    const qCount = section === 'rw' ? 15 : 12;
    mockSession.module1Questions = pool.slice(0, qCount);
    mockSession.packData = null;
  }

  mockSession.allQuestions = [...mockSession.module1Questions];
  mockSession.currentIndex = 0;
  mockSession.secondsRemaining = 18 * 60;
  mockSession.totalSeconds = 18 * 60;

  $('#mock-config').classList.add('hidden');
  $('#mock-break-area').classList.add('hidden');
  $('#mock-report-area').classList.add('hidden');
  $('#mock-exam-area').classList.remove('hidden');

  clearInterval(mockSession.timerInterval);
  mockSession.timerInterval = setInterval(updateMockTimer, 1000);
  updateMockTimer();

  renderMockPalette();
  renderMockCurrentQuestion();
};

function updateMockTimer() {
  if (mockSession.secondsRemaining <= 0) {
    clearInterval(mockSession.timerInterval);
    alert('Time is up for this module! Submitting module.');
    submitCurrentMockModule();
    return;
  }
  mockSession.secondsRemaining--;
  const mins = Math.floor(mockSession.secondsRemaining / 60);
  const secs = mockSession.secondsRemaining % 60;
  const badge = $('#mock-timer');
  if (badge) {
    badge.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    badge.classList.toggle('warning', mockSession.secondsRemaining <= 300);
  }
}

function getActiveMockQuestions() {
  return mockSession.currentModule === 1 ? mockSession.module1Questions : mockSession.module2Questions;
}

function renderMockPalette() {
  const pal = $('#mock-palette');
  if (!pal) return;
  const qs = getActiveMockQuestions();
  pal.innerHTML = qs.map((q, idx) => {
    const isAnswered = mockSession.answers[q.question_id] !== undefined;
    const isFlagged = mockSession.flags[q.question_id];
    const isActive = idx === mockSession.currentIndex;
    return `
      <button class="palette-btn ${isActive ? 'active' : ''} ${isAnswered ? 'answered' : ''} ${isFlagged ? 'flagged' : ''}" 
        onclick="jumpToMockQuestion(${idx})">
        ${idx + 1}
      </button>
    `;
  }).join('');
}

window.jumpToMockQuestion = function(idx) {
  mockSession.currentIndex = idx;
  renderMockPalette();
  renderMockCurrentQuestion();
};

window.navigateMockQuestion = function(dir) {
  const qs = getActiveMockQuestions();
  const next = mockSession.currentIndex + dir;
  if (next >= 0 && next < qs.length) {
    jumpToMockQuestion(next);
  }
};

window.toggleMockFlagCurrentQuestion = function() {
  const qs = getActiveMockQuestions();
  const q = qs[mockSession.currentIndex];
  if (!q) return;
  mockSession.flags[q.question_id] = !mockSession.flags[q.question_id];
  renderMockPalette();
  updateMockFlagButton();
};

function updateMockFlagButton() {
  const qs = getActiveMockQuestions();
  const q = qs[mockSession.currentIndex];
  const btn = $('#mock-flag-btn');
  if (btn && q) {
    const isF = mockSession.flags[q.question_id];
    btn.style.background = isF ? '#fef3c7' : 'transparent';
    btn.style.borderColor = isF ? '#f59e0b' : 'var(--color-border)';
  }
}

window.setMockConfidence = function(level) {
  const qs = getActiveMockQuestions();
  const q = qs[mockSession.currentIndex];
  if (!q) return;
  mockSession.confidences[q.question_id] = level;
  $$('#mock-conf-container .conf-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.conf === level);
  });
};

function renderMockCurrentQuestion() {
  const qs = getActiveMockQuestions();
  const q = qs[mockSession.currentIndex];
  if (!q) return;

  $('#mock-stage-badge').textContent = `Module ${mockSession.currentModule}: ${mockSession.currentModule === 1 ? 'Routing Stage' : mockSession.adaptivePath + ' Track'}`;
  $('#mock-exam-status').textContent = `Question ${mockSession.currentIndex + 1} of ${qs.length}`;

  const currentAns = mockSession.answers[q.question_id];
  const currentConf = mockSession.confidences[q.question_id] || 'medium';
  mockSession.confidences[q.question_id] = currentConf;

  $$('#mock-conf-container .conf-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.conf === currentConf);
  });

  updateMockFlagButton();

  $('#mock-prev-btn').disabled = mockSession.currentIndex === 0;
  $('#mock-next-btn').textContent = mockSession.currentIndex === qs.length - 1 ? (mockSession.currentModule === 1 ? 'Submit Module 1 →' : 'Finish Mock Test →') : 'Next →';
  if (mockSession.currentIndex === qs.length - 1) {
    $('#mock-next-btn').onclick = () => submitCurrentMockModule();
  } else {
    $('#mock-next-btn').onclick = () => navigateMockQuestion(1);
  }

  const container = $('#mock-q-content');
  container.innerHTML = `
    <div class="flex gap-2 mb-2">
      <span class="tag">${q.domain}</span>
      <span class="tag">${q.skill}</span>
      <span class="tag">Diff: ${q.difficulty}</span>
    </div>
    ${q.passage ? `<div class="passage mb-4">${q.passage}</div>` : ''}
    <p class="font-semibold mb-4">${q.question_stem}</p>
    ${q.choices ? `
      <div class="choices flex-col gap-2">
        ${Object.entries(q.choices).map(([k,v]) => {
          const selected = currentAns === k;
          return `
            <button class="choice-btn btn btn-outline text-left ${selected ? 'btn-primary' : ''}" 
              style="${selected ? 'background:var(--color-primary);color:white;border-color:var(--color-primary)' : ''}"
              onclick="selectMockChoice('${k}')">
              <strong>${k}.</strong> ${v}
            </button>
          `;
        }).join('')}
      </div>
    ` : `
      <div>
        <label class="text-xs text-muted block mb-1">Student-Produced Response (Fraction or Decimal):</label>
        <input type="text" class="grid-in-input" value="${currentAns || ''}" 
          placeholder="e.g. 3/4 or 0.75" oninput="selectMockGridIn(this.value)">
      </div>
    `}
  `;
}

window.selectMockChoice = function(choice) {
  const qs = getActiveMockQuestions();
  const q = qs[mockSession.currentIndex];
  if (!q) return;
  mockSession.answers[q.question_id] = choice;
  renderMockPalette();
  renderMockCurrentQuestion();
};

window.selectMockGridIn = function(val) {
  const qs = getActiveMockQuestions();
  const q = qs[mockSession.currentIndex];
  if (!q) return;
  mockSession.answers[q.question_id] = val.trim();
  renderMockPalette();
};

window.submitCurrentMockModule = async function() {
  if (mockSession.currentModule === 1) {
    if (!confirm('Are you ready to submit Module 1? You cannot change answers after moving to Module 2.')) return;
    clearInterval(mockSession.timerInterval);

    // Evaluate Module 1
    let m1Correct = 0;
    mockSession.module1Questions.forEach(q => {
      const a = mockSession.answers[q.question_id];
      if (a && checkAnswerCorrectness(q, a)) m1Correct++;
    });
    const m1Pct = m1Correct / mockSession.module1Questions.length;
    mockSession.module1Score = m1Pct;

    // Adaptive Routing Rule: >= 65% routes to Hard module, < 65% routes to Standard module
    mockSession.adaptivePath = m1Pct >= 0.65 ? 'Higher Difficulty (Hard)' : 'Standard Difficulty (Core)';

    // Load Module 2
    if (mockSession.packData) {
      mockSession.module2Questions = m1Pct >= 0.65 
        ? mockSession.packData.module_2_hard 
        : mockSession.packData.module_2_standard;
      mockSession.allQuestions.push(...mockSession.module2Questions);
    } else {
      let pool = [];
      if (mockSession.section === 'rw') {
        const r1 = await loadQuestions('rw-info');
        const r2 = await loadQuestions('rw-craft');
        const r3 = await loadQuestions('rw-expr');
        const r4 = await loadQuestions('rw-conv');
        pool.push(...r1, ...r2, ...r3, ...r4);
      } else {
        const m1 = await loadQuestions('math-alg');
        const m2 = await loadQuestions('math-adv');
        const m3 = await loadQuestions('math-psda');
        const m4 = await loadQuestions('math-geo');
        pool.push(...m1, ...m2, ...m3, ...m4);
      }

      const m1Ids = new Set(mockSession.module1Questions.map(q => q.question_id));
      let available = pool.filter(q => !m1Ids.has(q.question_id));
      
      if (m1Pct >= 0.65) {
        available.sort((a,b) => b.difficulty - a.difficulty);
      } else {
        available.sort((a,b) => a.difficulty - b.difficulty);
      }

      const qCount = mockSession.section === 'rw' ? 15 : 12;
      mockSession.module2Questions = available.slice(0, qCount);
      mockSession.allQuestions.push(...mockSession.module2Questions);
    }

    $('#mock-exam-area').classList.add('hidden');
    $('#mock-break-area').classList.remove('hidden');
    $('#mock-routing-message').innerHTML = `
      You completed Module 1 with <strong>${m1Correct}/${mockSession.module1Questions.length} (${Math.round(m1Pct*100)}%)</strong>.<br>
      Based on your performance, the Digital SAT adaptive engine has routed you to:<br>
      <span class="tag mt-2" style="font-size:1rem;background:${m1Pct >= 0.65 ? '#dcfce7;color:#166534' : '#fef3c7;color:#92400e'}">
        ${mockSession.adaptivePath} Module 2
      </span>
    `;
  } else {
    // Finish Module 2
    finishMockTest();
  }
};

window.proceedToMockModule2 = function() {
  mockSession.currentModule = 2;
  mockSession.currentIndex = 0;
  mockSession.secondsRemaining = 18 * 60;
  mockSession.totalSeconds = 18 * 60;

  $('#mock-break-area').classList.add('hidden');
  $('#mock-exam-area').classList.remove('hidden');

  clearInterval(mockSession.timerInterval);
  mockSession.timerInterval = setInterval(updateMockTimer, 1000);
  updateMockTimer();

  renderMockPalette();
  renderMockCurrentQuestion();
};

window.finishMockTest = function() {
  if (!confirm('Are you ready to submit your full Mock SAT test?')) return;
  clearInterval(mockSession.timerInterval);

  let totalCorrect = 0;
  const evaluated = mockSession.allQuestions.map(q => {
    const userAns = mockSession.answers[q.question_id];
    const userCorrect = userAns ? checkAnswerCorrectness(q, userAns) : false;
    const userConf = mockSession.confidences[q.question_id] || 'medium';
    let errType = null;

    if (!userCorrect) {
      errType = classifyError(q, userAns || 'UNANSWERED', userConf);
      db.errors.push({
        question_id: q.question_id,
        domain: q.domain,
        skill: q.skill,
        answer: userAns || 'UNANSWERED',
        correct_answer: q.correct_answer,
        error_type: errType,
        confidence: userConf,
        timestamp: Date.now(),
        diagnosed: false
      });
    }

    if (!db.skills[q.skill]) db.skills[q.skill] = { correct: 0, total: 0, history: [] };
    db.skills[q.skill].total++;
    if (userCorrect) {
      db.skills[q.skill].correct++;
      totalCorrect++;
    }
    db.skills[q.skill].history.push({ correct: userCorrect, confidence: userConf, timestamp: Date.now() });

    return { ...q, userAns, userCorrect, userErrorType: errType, userConf };
  });

  const accuracy = Math.round((totalCorrect / mockSession.allQuestions.length) * 100);
  db.sessionLog.push({
    title: `Full Mock SAT (${mockSession.section.toUpperCase()}) - ${mockSession.adaptivePath}`,
    date: new Date().toISOString(),
    total: mockSession.allQuestions.length,
    correct: totalCorrect,
    accuracy
  });
  save();
  updateDashboard();

  $('#mock-exam-area').classList.add('hidden');
  const rep = $('#mock-report-area');
  rep.classList.remove('hidden');
  rep.innerHTML = `
    <div class="card mb-4" style="border-left: 4px solid var(--color-primary)">
      <h2 class="text-xl font-bold mb-2">Digital SAT Simulation Performance</h2>
      <div class="grid-3 mb-2">
        <div><strong>Section:</strong> ${mockSession.section.toUpperCase()}</div>
        <div><strong>Routing Path:</strong> ${mockSession.adaptivePath}</div>
        <div><strong>Total Score:</strong> ${totalCorrect} / ${mockSession.allQuestions.length} (${accuracy}%)</div>
      </div>
      <p class="text-xs text-muted">Official Digital SAT reports domain mastery profiles rather than arbitrary point conversions without validated scaling tables.</p>
    </div>
    ${generateReflectionReport({
      title: `Mock SAT ${mockSession.section.toUpperCase()} Adaptive Test`,
      total: mockSession.allQuestions.length,
      correct: totalCorrect,
      accuracy,
      questions: evaluated,
      timeSpent: 36 * 60
    })}
  `;
};

// ── Desmos Calculator Modal Toggle ──
window.toggleDesmos = function() {
  const m = $('#desmos-modal');
  if (!m) return;
  const isHidden = m.classList.contains('hidden');
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

// ── Data Management (Export & Reset) ──
window.exportUserData = function() {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sat_learning_profile_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

window.exportErrorLogCSV = function() {
  if (!db.errors.length) { alert('No errors recorded yet.'); return; }
  const headers = ['question_id', 'domain', 'skill', 'answer', 'correct_answer', 'error_type', 'confidence', 'date'];
  const rows = db.errors.map(e => [
    e.question_id, `"${e.domain}"`, `"${e.skill}"`, `"${e.answer}"`, `"${e.correct_answer}"`, e.error_type, e.confidence || 'medium', new Date(e.timestamp).toLocaleDateString()
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sat_mistakes_ledger_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

window.resetAllProgress = function() {
  if (!confirm('Are you sure you want to reset all your learning progress, mastery stats, and error history? This cannot be undone.')) return;
  localStorage.removeItem(DB_KEY);
  location.reload();
};

window.exportAnkiTSV = async function() {
  let allCards = [];
  for (const type of FC_FILES) {
    const cards = await loadFlashcards(type);
    allCards.push(...cards);
  }
  if (!allCards.length) { alert('No flashcards loaded.'); return; }
  
  const lines = allCards.map(c => {
    let front = '';
    if (c.front) {
      if (c.front.word) front = `<b>${c.front.word}</b><br><small><i>"${c.front.context || ''}"</i></small>`;
      else if (c.front.sentence) front = `${c.front.sentence}`;
      else front = JSON.stringify(c.front).replace(/[{}"\\]/g, ' ');
    }
    let back = '';
    if (c.back) {
      if (typeof c.back === 'string') back = c.back;
      else back = Object.entries(c.back).map(([k,v]) => `<b>${k}:</b> ${Array.isArray(v) ? v.join(', ') : v}`).join('<br>');
    }
    front = front.replace(/\t/g, ' ').replace(/\n/g, '<br>');
    back = back.replace(/\t/g, ' ').replace(/\n/g, '<br>');
    return `${front}\t${back}\t${c.type || 'SAT'}`;
  });

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/tab-separated-values;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sat_flashcards_anki_${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  alert(`Đã xuất thành công ${allCards.length} thẻ ghi nhớ chuẩn Anki TSV (.txt)! Bạn có thể mở Anki -> File -> Import để nạp vào học.`);
};

// ── Parent Companion Portal Engine (Góc Phụ Huynh) ──
window.renderParentCompanion = function() {
  const container = $('#parent');
  if (!container) return;

  // 1. Calculate total focus time
  let totalMinutes = 0;
  if (db.sessionLog && db.sessionLog.length > 0) {
    totalMinutes = db.sessionLog.reduce((acc, s) => acc + (s.duration || 0), 0);
  }
  let totalQCount = 0;
  let totalCorrect = 0;
  Object.values(db.skills || {}).forEach(s => {
    totalQCount += (s.total || 0);
    totalCorrect += (s.correct || 0);
  });
  if (totalMinutes === 0 && totalQCount > 0) {
    totalMinutes = Math.round(totalQCount * 1.5);
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const hoursStr = `${hours} giờ ${String(mins).padStart(2, '0')}p`;
  const hoursEl = $('#parent-total-hours');
  if (hoursEl) hoursEl.textContent = hoursStr;

  // 2. Total questions
  const totalQEl = $('#parent-total-questions');
  if (totalQEl) totalQEl.textContent = `${totalQCount} câu`;

  // 3. Consistency / Active days
  const activeDaysSet = new Set();
  (db.sessionLog || []).forEach(s => {
    if (s.date) activeDaysSet.add(new Date(s.date).toLocaleDateString());
  });
  Object.values(db.skills || {}).forEach(s => {
    (s.history || []).forEach(h => {
      if (h.timestamp) activeDaysSet.add(new Date(h.timestamp).toLocaleDateString());
    });
  });
  const activeDays = Math.max(activeDaysSet.size, totalQCount > 0 ? 1 : 0);
  const daysEl = $('#parent-active-days');
  if (daysEl) daysEl.textContent = `${activeDays} ngày`;

  // 4. Mastered skills (accuracy >= 75% and total >= 3)
  let masteredCount = 0;
  let strongSkills = [];
  let developingSkills = [];
  Object.entries(db.skills || {}).forEach(([skillName, s]) => {
    if (s.total >= 3) {
      const acc = Math.round((s.correct / s.total) * 100);
      if (acc >= 75) {
        masteredCount++;
        strongSkills.push(skillName);
      } else {
        developingSkills.push(skillName);
      }
    }
  });
  const masteredEl = $('#parent-mastered-skills');
  if (masteredEl) masteredEl.textContent = `${masteredCount} / ${SKILLS.length}`;

  // 5. Parent Report Summary Text
  const dateEl = $('#parent-report-date');
  if (dateEl) {
    dateEl.textContent = `Cập nhật: ${new Date().toLocaleDateString('vi-VN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`;
  }

  const grade = db.profile?.grade || '11';
  const overallAcc = totalQCount > 0 ? Math.round((totalCorrect / totalQCount) * 100) : 0;
  const summaryEl = $('#parent-report-summary');
  if (summaryEl) {
    let summaryHTML = `
      <p><strong>Khối lớp hiện tại:</strong> Lớp ${escapeHTML(grade)} — Mục tiêu Digital SAT 2026</p>
      <p><strong>Tiến trình rèn luyện:</strong> Học sinh đã hoàn thành <strong>${totalQCount} câu hỏi</strong> với tỷ lệ chính xác chung <strong>${overallAcc}%</strong>.</p>
    `;
    if (strongSkills.length > 0) {
      summaryHTML += `<p><strong>Kỹ năng nổi bật:</strong> ${strongSkills.slice(0, 3).map(s => `<span class="tag tag-success text-xs">${escapeHTML(s)}</span>`).join(' ')}</p>`;
    }
    if (developingSkills.length > 0) {
      summaryHTML += `<p><strong>Kỹ năng đang bứt phá:</strong> ${developingSkills.slice(0, 3).map(s => `<span class="tag text-xs">${escapeHTML(s)}</span>`).join(' ')}</p>`;
    }
    summaryHTML += `
      <div class="mt-3 p-3 bg-muted-light rounded text-xs text-muted">
        <strong>Lời nhắn gửi cha mẹ:</strong> Tiến trình học SAT là một cuộc chạy marathon bền bỉ. Học sinh đang thể hiện tính kỷ luật rất đáng khen ngợi. Cha mẹ hãy tiếp tục động viên tinh thần và đảm bảo con duy trì nhịp sinh học, giấc ngủ đầy đủ nhé!
      </div>
    `;
    summaryEl.innerHTML = summaryHTML;
  }
};

// ── Social Share Modal Engine ──
window.openShareModal = function() {
  const modal = $('#share-modal');
  if (!modal) return;

  let totalQCount = 0;
  let totalCorrect = 0;
  let masteredCount = 0;
  Object.values(db.skills || {}).forEach(s => {
    totalQCount += (s.total || 0);
    totalCorrect += (s.correct || 0);
    if (s.total >= 3 && (s.correct / s.total) >= 0.75) masteredCount++;
  });
  const acc = totalQCount > 0 ? Math.round((totalCorrect / totalQCount) * 100) : 0;

  const grade = db.profile?.grade || '11';
  const gradeEl = $('#share-badge-grade');
  if (gradeEl) gradeEl.textContent = `Lớp ${grade}`;

  const qEl = $('#share-stat-q');
  if (qEl) qEl.textContent = totalQCount || 20;

  const accEl = $('#share-stat-acc');
  if (accEl) accEl.textContent = `${acc || 80}%`;

  const skillsEl = $('#share-stat-skills');
  if (skillsEl) skillsEl.textContent = `${masteredCount || 1}/15`;

  const headlineEl = $('#share-headline');
  if (headlineEl) {
    if (acc >= 85) headlineEl.textContent = '🌟 1500+ Trajectory';
    else if (acc >= 70) headlineEl.textContent = '🎯 1450+ Trajectory';
    else headlineEl.textContent = '🚀 SAT Foundation Builder';
  }

  modal.classList.remove('hidden');
  modal.style.display = 'flex';
};

window.closeShareModal = function() {
  const modal = $('#share-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.style.display = 'none';
};

window.copyShareText = function() {
  let totalQCount = 0;
  let totalCorrect = 0;
  let masteredCount = 0;
  Object.values(db.skills || {}).forEach(s => {
    totalQCount += (s.total || 0);
    totalCorrect += (s.correct || 0);
    if (s.total >= 3 && (s.correct / s.total) >= 0.75) masteredCount++;
  });
  const acc = totalQCount > 0 ? Math.round((totalCorrect / totalQCount) * 100) : 85;
  const grade = db.profile?.grade || '11';

  const caption = `🎯 Hôm nay mình vừa hoàn thành thêm một chặng rèn luyện Digital SAT trên hệ thống N&Mstudio_Education — SAT IntelliPrep!

📊 Thành quả rèn luyện của mình (Lớp ${grade}):
• Đã giải quyết: ${totalQCount || 20}+ câu hỏi chuẩn Digital SAT 2026
• Độ chính xác: ${acc}%
• Kỹ năng đã làm chủ: ${masteredCount || 1}/15 nhóm kỹ năng Reading, Writing & Math

🌱 "Kỷ luật bản thân từng ngày tạo nên thành quả vượt trội. Mỗi lỗi sai hôm nay là một bước tiến gần hơn tới điểm 1500+!"

👉 Trải nghiệm nền tảng luyện thi Digital SAT miễn phí: https://sat-intelliprep.nmstudio.edu.vn
💬 Liên hệ tư vấn lộ trình & hợp tác cùng N&Mstudio: +98 557 8385 (Zalo)

#NandMstudio #SATIntelliPrep #DigitalSAT2026 #DuHocMy #GrowthMindset`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(caption).then(() => {
      alert('Đã sao chép caption thành công! Bạn có thể dán lên Facebook, Threads hoặc Zalo kèm ảnh chụp màn hình thẻ nhé!');
    }).catch(() => {
      prompt('Hãy sao chép đoạn nội dung dưới đây để đăng lên mạng xã hội:', caption);
    });
  } else {
    prompt('Hãy sao chép đoạn nội dung dưới đây để đăng lên mạng xã hội:', caption);
  }
};

// ── Quick Hero Search & Practice Launcher Engine ──
window.executeHeroSearch = function() {
  const input = $('#hero-search-input');
  if (!input) return;
  const rawQuery = input.value.trim().toLowerCase();
  if (!rawQuery) {
    location.hash = '#practice';
    return;
  }

  // Check special keywords
  if (rawQuery.includes('desmos') || rawQuery.includes('máy tính') || rawQuery.includes('graph')) {
    if (typeof toggleDesmos === 'function') toggleDesmos();
    return;
  }
  if (rawQuery.includes('phụ huynh') || rawQuery.includes('parent') || rawQuery.includes('cha mẹ')) {
    location.hash = '#parent';
    return;
  }
  if (rawQuery.includes('flashcard') || rawQuery.includes('từ vựng') || rawQuery.includes('vocab')) {
    location.hash = '#flashcards';
    return;
  }
  if (rawQuery.includes('mock') || rawQuery.includes('thi thử') || rawQuery.includes('test')) {
    location.hash = '#mock';
    return;
  }
  if (rawQuery.includes('lỗi') || rawQuery.includes('mistake') || rawQuery.includes('sai')) {
    location.hash = '#mistakes';
    return;
  }
  if (rawQuery.includes('learn') || rawQuery.includes('học') || rawQuery.includes('phương pháp')) {
    location.hash = '#learn';
    return;
  }

  // Domain / Skill matches
  let targetDomain = 'rw-info';
  if (rawQuery.includes('algebra') || rawQuery.includes('đại số') || rawQuery.includes('linear')) {
    targetDomain = 'math-alg';
  } else if (rawQuery.includes('advanced') || rawQuery.includes('quadratic') || rawQuery.includes('hàm số')) {
    targetDomain = 'math-adv';
  } else if (rawQuery.includes('geometry') || rawQuery.includes('hình học') || rawQuery.includes('trig')) {
    targetDomain = 'math-geo';
  } else if (rawQuery.includes('craft') || rawQuery.includes('context') || rawQuery.includes('ngữ cảnh')) {
    targetDomain = 'rw-craft';
  } else if (rawQuery.includes('conventions') || rawQuery.includes('grammar') || rawQuery.includes('ngữ pháp')) {
    targetDomain = 'rw-conv';
  } else if (rawQuery.includes('expression') || rawQuery.includes('transition') || rawQuery.includes('liên kết')) {
    targetDomain = 'rw-expr';
  } else if (rawQuery.includes('math') || rawQuery.includes('toán')) {
    targetDomain = 'math-alg';
  }

  location.hash = '#practice';
  setTimeout(() => {
    const domainSelect = $('#domain-select');
    if (domainSelect) {
      domainSelect.value = targetDomain;
      if (typeof startPractice === 'function') startPractice();
    }
  }, 100);
};

window.quickJumpTopic = function(topic) {
  if (topic === 'fc') {
    location.hash = '#flashcards';
    return;
  }
  location.hash = '#practice';
  setTimeout(() => {
    const domainSelect = $('#domain-select');
    if (domainSelect) {
      domainSelect.value = topic;
      if (typeof startPractice === 'function') startPractice();
    }
  }, 100);
};

// ── Global Keyboard Shortcuts (Escape to close modals) ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (typeof closeShareModal === 'function') closeShareModal();
    const desmos = $('#desmos-modal');
    if (desmos && !desmos.classList.contains('hidden')) {
      if (typeof toggleDesmos === 'function') toggleDesmos();
    }
  }
});

// ── Start ──
document.addEventListener('DOMContentLoaded', init);




