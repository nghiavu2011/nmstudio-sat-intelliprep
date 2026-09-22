"""
Builds 3 Full Practice Test Packs from the 200 questions in the repository.
Each practice test is formatted with Module 1, Module 2 Hard, and Module 2 Standard for both RW and Math.
"""
import json, os, glob, random

random.seed(42)  # Deterministic packs

out_dir = r'd:\antigravity_scratch\real_estate_scoring\sql\SAT\data\practice_tests'
os.makedirs(out_dir, exist_ok=True)

# Load all questions
rw_questions = []
math_questions = []

for p in glob.glob(r'd:\antigravity_scratch\real_estate_scoring\sql\SAT\data\questions\rw_*.json'):
    with open(p, 'r', encoding='utf-8') as f:
        rw_questions.extend(json.load(f))

for p in glob.glob(r'd:\antigravity_scratch\real_estate_scoring\sql\SAT\data\questions\math_*.json'):
    with open(p, 'r', encoding='utf-8') as f:
        math_questions.extend(json.load(f))

print(f"Loaded {len(rw_questions)} RW questions and {len(math_questions)} Math questions.")

# Shuffle to distribute evenly
random.shuffle(rw_questions)
random.shuffle(math_questions)

def build_test_pack(test_id, title, rw_pool, math_pool):
    # RW: 15 for M1, 15 for M2 Hard, 15 for M2 Standard
    rw_m1 = rw_pool[:15]
    rw_m2_hard = sorted([q for q in rw_pool[15:] if q['difficulty'] >= 3], key=lambda x: -x['difficulty'])[:15]
    rw_m2_std = sorted([q for q in rw_pool[15:] if q['difficulty'] <= 3], key=lambda x: x['difficulty'])[:15]
    
    # If not enough, fill from remaining
    if len(rw_m2_hard) < 15:
        rw_m2_hard.extend(rw_pool[15:30-len(rw_m2_hard)])
    if len(rw_m2_std) < 15:
        rw_m2_std.extend(rw_pool[15:30-len(rw_m2_std)])

    # Math: 12 for M1, 12 for M2 Hard, 12 for M2 Standard
    m_m1 = math_pool[:12]
    m_m2_hard = sorted([q for q in math_pool[12:] if q['difficulty'] >= 3], key=lambda x: -x['difficulty'])[:12]
    m_m2_std = sorted([q for q in math_pool[12:] if q['difficulty'] <= 3], key=lambda x: x['difficulty'])[:12]

    if len(m_m2_hard) < 12:
        m_m2_hard.extend(math_pool[12:24-len(m_m2_hard)])
    if len(m_m2_std) < 12:
        m_m2_std.extend(math_pool[12:24-len(m_m2_std)])

    return {
        "test_id": test_id,
        "title": title,
        "reading_and_writing": {
            "module_1": rw_m1,
            "module_2_hard": rw_m2_hard,
            "module_2_standard": rw_m2_std
        },
        "math": {
            "module_1": m_m1,
            "module_2_hard": m_m2_hard,
            "module_2_standard": m_m2_std
        }
    }

# Build 3 packs with rotating slices
pack_1 = build_test_pack("PT-01", "Digital SAT Practice Test 1 (Full Simulation)", rw_questions[0:45], math_questions[0:36])
pack_2 = build_test_pack("PT-02", "Digital SAT Practice Test 2 (Full Simulation)", rw_questions[25:70], math_questions[20:56])
pack_3 = build_test_pack("PT-03", "Digital SAT Practice Test 3 (Full Simulation)", rw_questions[45:], math_questions[35:])

for p, filename in [(pack_1, 'practice_test_1.json'), (pack_2, 'practice_test_2.json'), (pack_3, 'practice_test_3.json')]:
    path = os.path.join(out_dir, filename)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(p, f, indent=2, ensure_ascii=False)
    print(f"Generated {filename}: RW M1 ({len(p['reading_and_writing']['module_1'])}), Math M1 ({len(p['math']['module_1'])})")

print("All 3 Practice Test Packs successfully built!")
