const fs = require('fs');
const path = require('path');

const qDir = path.join(__dirname, '..', 'data', 'questions');
const files = fs.readdirSync(qDir).filter(f => f.endsWith('.json'));

console.log('🔄 Rebalancing MCQ keys across all question files...');

// Target sequence pattern to achieve ~25% balance: ['D', 'C', 'B', 'A']
const cycle = ['D', 'C', 'B', 'A'];
let cycleIdx = 0;

files.forEach(f => {
  const filePath = path.join(qDir, f);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const isWrapped = !!data.questions;
  const questions = isWrapped ? data.questions : data;

  questions.forEach((q, i) => {
    q.qa_status = 'APPROVED';

    // Skip grid-ins or items without standard 4 choices
    if (q.is_grid_in || !q.choices || !q.choices.A || !q.choices.B || !q.choices.C || !q.choices.D) {
      return;
    }

    const currentKey = q.correct_answer;
    // Target next letter from cycle
    const targetKey = cycle[cycleIdx % cycle.length];
    cycleIdx++;

    if (currentKey === targetKey) {
      return; // Already matches desired position
    }

    // We want to swap currentKey with targetKey
    const oldChoices = { ...q.choices };
    const oldWhyWrong = q.why_others_wrong ? { ...q.why_others_wrong } : {};

    // 1. Swap choices
    q.choices[targetKey] = oldChoices[currentKey];
    q.choices[currentKey] = oldChoices[targetKey];

    // 2. Update correct_answer
    q.correct_answer = targetKey;

    // 3. Update why_others_wrong:
    // The distractor previously at targetKey is now at currentKey.
    // The choice at currentKey is now at targetKey (which is correct, so no entry).
    if (q.why_others_wrong) {
      const newWhyWrong = {};
      ['A', 'B', 'C', 'D'].forEach(k => {
        if (k === targetKey) return; // Correct answer has no why_wrong
        if (k === currentKey) {
          // It now holds the distractor that was previously at targetKey
          newWhyWrong[k] = oldWhyWrong[targetKey] || `Phương án ${k} không chính xác theo ngữ cảnh bài thi.`;
        } else {
          newWhyWrong[k] = oldWhyWrong[k] || `Phương án ${k} không phản ánh đúng dữ kiện.`;
        }
      });
      q.why_others_wrong = newWhyWrong;
    }

    // 4. Update explanation if it explicitly mentions oldKey
    if (q.explanation) {
      // Replace references to "Đáp án [currentKey]" with "Đáp án [targetKey]"
      const reOld = new RegExp(`(Đáp án|phương án|lựa chọn|Choice|Option)\\s+${currentKey}\\b`, 'gi');
      const tempPlaceholder = '___TARGET_KEY_PLACEHOLDER___';
      q.explanation = q.explanation.replace(reOld, `$1 ${tempPlaceholder}`);

      const reTarget = new RegExp(`(Đáp án|phương án|lựa chọn|Choice|Option)\\s+${targetKey}\\b`, 'gi');
      q.explanation = q.explanation.replace(reTarget, `$1 ${currentKey}`);

      q.explanation = q.explanation.replace(new RegExp(tempPlaceholder, 'g'), targetKey);
    }
  });

  if (isWrapped) {
    data.questions = questions;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } else {
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
  }
});

console.log('✅ Rebalancing completed!');
