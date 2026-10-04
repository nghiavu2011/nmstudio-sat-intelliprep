const fs = require('fs');
const path = require('path');

const qDir = 'D:/antigravity_scratch/real_estate_scoring/sql/SAT/data/questions';
const outDir = 'D:/antigravity_scratch/real_estate_scoring/sql/SAT/data/practice_tests';

const rwFiles = fs.readdirSync(qDir).filter(f => f.startsWith('rw_'));
const mathFiles = fs.readdirSync(qDir).filter(f => f.startsWith('math_'));

let rwPool = [];
let mathPool = [];

rwFiles.forEach(f => {
  const d = JSON.parse(fs.readFileSync(path.join(qDir, f), 'utf8'));
  rwPool.push(...(Array.isArray(d) ? d : d.questions));
});

mathFiles.forEach(f => {
  const d = JSON.parse(fs.readFileSync(path.join(qDir, f), 'utf8'));
  mathPool.push(...(Array.isArray(d) ? d : d.questions));
});

console.log(`Loaded ${rwPool.length} RW items and ${mathPool.length} Math items.`);

// Deterministic shuffle
function pseudoShuffle(arr, seed = 123) {
  const a = [...arr];
  let m = a.length, t, i;
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  while (m) {
    i = Math.floor(rnd() * m--);
    t = a[m];
    a[m] = a[i];
    a[i] = t;
  }
  return a;
}

const rwShuffled = pseudoShuffle(rwPool, 42);
const mathShuffled = pseudoShuffle(mathPool, 84);

// Build Test 1: FULL 98-QUESTION ADAPTIVE SAT SIMULATION
// RW: 27 M1, 27 M2 Hard, 27 M2 Standard
// Math: 22 M1, 22 M2 Hard, 22 M2 Standard
const rw_m1 = rwShuffled.slice(0, 27);
const rwRemaining = rwShuffled.slice(27);
// Sort remaining by difficulty for hard vs standard
const rw_m2_hard = [...rwRemaining].sort((a, b) => b.difficulty - a.difficulty).slice(0, 27);
const rw_m2_std = [...rwRemaining].sort((a, b) => a.difficulty - b.difficulty).slice(0, 27);

const math_m1 = mathShuffled.slice(0, 22);
const mathRemaining = mathShuffled.slice(22);
const math_m2_hard = [...mathRemaining].sort((a, b) => b.difficulty - a.difficulty).slice(0, 22);
const math_m2_std = [...mathRemaining].sort((a, b) => a.difficulty - b.difficulty).slice(0, 22);

const test1 = {
  test_id: "PT-01",
  title: "Digital SAT Full Adaptive Practice Test 1 (Simulated)",
  format: "full_adaptive",
  timing: {
    rw_m1_min: 32,
    rw_m2_min: 32,
    break_min: 10,
    math_m1_min: 35,
    math_m2_min: 35
  },
  reading_and_writing: {
    module_1: rw_m1,
    module_2_hard: rw_m2_hard,
    module_2_standard: rw_m2_std
  },
  math: {
    module_1: math_m1,
    module_2_hard: math_m2_hard,
    module_2_standard: math_m2_std
  }
};

fs.writeFileSync(path.join(outDir, 'practice_test_1.json'), JSON.stringify(test1, null, 2), 'utf8');
console.log('Generated practice_test_1.json (Full 98 questions: 27 RW M1, 27 RW M2, 22 Math M1, 22 Math M2)!');

// Also update practice_test_2 and practice_test_3 with clean metadata
const test2 = {
  test_id: "PT-02",
  title: "Digital SAT Full Adaptive Practice Test 2 (Simulated)",
  format: "full_adaptive",
  timing: {
    rw_m1_min: 32,
    rw_m2_min: 32,
    break_min: 10,
    math_m1_min: 35,
    math_m2_min: 35
  },
  reading_and_writing: {
    module_1: pseudoShuffle(rw_m1, 99),
    module_2_hard: pseudoShuffle(rw_m2_hard, 88),
    module_2_standard: pseudoShuffle(rw_m2_std, 77)
  },
  math: {
    module_1: pseudoShuffle(math_m1, 66),
    module_2_hard: pseudoShuffle(math_m2_hard, 55),
    module_2_standard: pseudoShuffle(math_m2_std, 44)
  }
};
fs.writeFileSync(path.join(outDir, 'practice_test_2.json'), JSON.stringify(test2, null, 2), 'utf8');

console.log('Generated practice_test_2.json!');
