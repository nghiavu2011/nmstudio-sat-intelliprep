import json
import os

def create_rw_information_ideas():
    questions = []
    
    # Central Ideas and Details
    difficulties = [1, 2, 3, 4, 5]
    for d in difficulties:
        questions.append({
            "question_id": f"RW-II-CID-{d}",
            "domain": "Information and Ideas",
            "skill": "Central Ideas and Details",
            "difficulty": d,
            "passage": f"This is an original passage about science or history. (Difficulty {d}) " * 5,
            "question_stem": "Which choice best states the main idea of the text?",
            "choices": {
                "A": "A plausible distractor.",
                "B": "The correct main idea.",
                "C": "An overly broad distractor.",
                "D": "A too-specific distractor."
            },
            "correct_answer": "B",
            "explanation": "B accurately captures the central point without being too broad or too specific.",
            "why_others_wrong": {
                "A": "Plausible but incorrect due to X.",
                "C": "Too broad.",
                "D": "Too specific."
            },
            "common_trap": "Selecting a detail that is true but not the main idea.",
            "thinking_framework": "1. Read passage. 2. Identify main subject and author's point. 3. Match with choices.",
            "estimated_time_seconds": 90,
            "source_basis": "original",
            "qa_status": "DRAFT",
            "tags": ["history"]
        })
        
    # Command of Evidence: Textual
    for d in [2, 3, 4]:
        questions.append({
            "question_id": f"RW-II-CET-{d}",
            "domain": "Information and Ideas",
            "skill": "Command of Evidence: Textual",
            "difficulty": d,
            "passage": f"A researcher hypothesizes that X causes Y. They conducted an experiment... (Difficulty {d})",
            "question_stem": "Which finding, if true, would most directly support the researcher's hypothesis?",
            "choices": {
                "A": "Finding supporting hypothesis.",
                "B": "Finding contradicting hypothesis.",
                "C": "Irrelevant finding.",
                "D": "Finding supporting a different hypothesis."
            },
            "correct_answer": "A",
            "explanation": "A provides the direct link required to support X causing Y.",
            "why_others_wrong": {"B": "Contradicts", "C": "Irrelevant", "D": "Wrong hypothesis"},
            "common_trap": "Choosing a finding that sounds true but doesn't relate to the specific hypothesis.",
            "thinking_framework": "1. Identify hypothesis. 2. Determine what evidence would prove it. 3. Find matching choice.",
            "estimated_time_seconds": 90,
            "source_basis": "original",
            "qa_status": "DRAFT",
            "tags": ["science"]
        })

    # Command of Evidence: Quantitative
    for d in [2, 3, 4]:
        questions.append({
            "question_id": f"RW-II-CEQ-{d}",
            "domain": "Information and Ideas",
            "skill": "Command of Evidence: Quantitative",
            "difficulty": d,
            "passage": f"Data indicates that the population of species A grew by 20% while species B declined. (Difficulty {d})",
            "question_stem": "Which choice best uses data from the table to complete the statement?",
            "choices": {
                "A": "Incorrect data interpretation.",
                "B": "Accurate data supporting the trend.",
                "C": "Accurate data irrelevant to the trend.",
                "D": "Opposite trend data."
            },
            "correct_answer": "B",
            "explanation": "B correctly uses the data to support the statement.",
            "why_others_wrong": {"A": "Misreads data", "C": "Irrelevant", "D": "Contradicts"},
            "common_trap": "Misreading the data table or graph.",
            "thinking_framework": "1. Read statement. 2. Look at data. 3. Ensure data supports statement exactly.",
            "estimated_time_seconds": 90,
            "source_basis": "original",
            "qa_status": "DRAFT",
            "tags": ["social science"]
        })

    # Inferences
    for d in [1, 3, 4, 5]:
        questions.append({
            "question_id": f"RW-II-INF-{d}",
            "domain": "Information and Ideas",
            "skill": "Inferences",
            "difficulty": d,
            "passage": f"The author states X and Y, suggesting that... (Difficulty {d})",
            "question_stem": "Which choice most logically completes the text?",
            "choices": {
                "A": "An illogical leap.",
                "B": "A contradiction.",
                "C": "The logical conclusion.",
                "D": "A restatement of the premise."
            },
            "correct_answer": "C",
            "explanation": "C is the only conclusion that logically follows from X and Y without assuming outside information.",
            "why_others_wrong": {"A": "Assumes too much", "B": "Contradicts", "D": "Does not conclude"},
            "common_trap": "Bringing in outside knowledge not stated in the text.",
            "thinking_framework": "1. Identify premises. 2. Deduce conclusion strictly from premises. 3. Match.",
            "estimated_time_seconds": 90,
            "source_basis": "original",
            "qa_status": "DRAFT",
            "tags": ["literature"]
        })

    return questions

def create_rw_craft_structure():
    questions = []
    
    # Words in Context
    for d in [1, 2, 3, 4, 5]:
        questions.append({
            "question_id": f"RW-CS-WIC-{d}",
            "domain": "Craft and Structure",
            "skill": "Words in Context",
            "difficulty": d,
            "passage": f"The scientist's approach to the problem was entirely _____, breaking with years of tradition. (Difficulty {d})",
            "question_stem": "Which choice completes the text with the most logical and precise word or phrase?",
            "choices": {
                "A": "orthodox",
                "B": "unconventional",
                "C": "predictable",
                "D": "methodical"
            },
            "correct_answer": "B",
            "explanation": "'unconventional' matches 'breaking with years of tradition'.",
            "why_others_wrong": {"A": "Opposite", "C": "Opposite", "D": "Doesn't fit context clues"},
            "common_trap": "Choosing a word that sounds good but contradicts the context clue.",
            "thinking_framework": "1. Find context clues. 2. Predict a word. 3. Match choices to prediction.",
            "estimated_time_seconds": 60,
            "source_basis": "original",
            "qa_status": "DRAFT",
            "tags": ["science"]
        })

    # Text Structure and Purpose
    for d in [1, 2, 3, 4, 5]:
        questions.append({
            "question_id": f"RW-CS-TSP-{d}",
            "domain": "Craft and Structure",
            "skill": "Text Structure and Purpose",
            "difficulty": d,
            "passage": f"First the author presents a historical misconception. Then they provide modern evidence refuting it. (Difficulty {d})",
            "question_stem": "Which choice best describes the overall structure of the text?",
            "choices": {
                "A": "It presents a misconception and then refutes it with evidence.",
                "B": "It outlines a theory and then proves it.",
                "C": "It compares two historical perspectives.",
                "D": "It chronologically lists discoveries."
            },
            "correct_answer": "A",
            "explanation": "A perfectly describes the two-part structure of the passage.",
            "why_others_wrong": {"B": "Inaccurate", "C": "Inaccurate", "D": "Inaccurate"},
            "common_trap": "Focusing on only one half of the passage's structure.",
            "thinking_framework": "1. Break passage into sections. 2. Identify purpose of each section. 3. Combine into overall structure.",
            "estimated_time_seconds": 90,
            "source_basis": "original",
            "qa_status": "DRAFT",
            "tags": ["history"]
        })

    # Cross-Text Connections
    for d in [2, 3, 4, 5, 5]:
        questions.append({
            "question_id": f"RW-CS-CTC-{d}-v{len(questions)}",
            "domain": "Craft and Structure",
            "skill": "Cross-Text Connections",
            "difficulty": d,
            "passage": f"Text 1: X is great. Text 2: X is terrible because of Y. (Difficulty {d})",
            "question_stem": "Based on the texts, how would the author of Text 2 most likely respond to Text 1?",
            "choices": {
                "A": "Agree completely.",
                "B": "Disagree, pointing out Y.",
                "C": "Agree but add Z.",
                "D": "Dismiss it as irrelevant."
            },
            "correct_answer": "B",
            "explanation": "Text 2 explicitly states X is terrible because of Y, so they would disagree with Text 1.",
            "why_others_wrong": {"A": "Contradicts", "C": "Assumes Z", "D": "Too extreme"},
            "common_trap": "Misidentifying the specific point of disagreement.",
            "thinking_framework": "1. Understand Text 1. 2. Understand Text 2. 3. Identify relationship (agree/disagree on what?).",
            "estimated_time_seconds": 120,
            "source_basis": "original",
            "qa_status": "DRAFT",
            "tags": ["social science"]
        })
        
    return questions

def create_rw_expression_ideas():
    questions = []
    
    # Rhetorical Synthesis
    for d in [1, 2, 3, 4, 5]:
        questions.append({
            "question_id": f"RW-EI-RS-{d}",
            "domain": "Expression of Ideas",
            "skill": "Rhetorical Synthesis",
            "difficulty": d,
            "passage": f"While researching... [bullet points of notes]. (Difficulty {d})",
            "question_stem": "The student wants to emphasize the uniqueness of the finding. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
            "choices": {
                "A": "A choice that doesn't emphasize uniqueness.",
                "B": "A choice emphasizing uniqueness.",
                "C": "A choice emphasizing something else.",
                "D": "A choice stating a basic fact."
            },
            "correct_answer": "B",
            "explanation": "B directly addresses the student's specific goal.",
            "why_others_wrong": {"A": "Wrong goal", "C": "Wrong goal", "D": "Wrong goal"},
            "common_trap": "Choosing a grammatically correct sentence that doesn't accomplish the specific goal.",
            "thinking_framework": "1. Identify the specific goal. 2. Find the choice that achieves ONLY that goal.",
            "estimated_time_seconds": 60,
            "source_basis": "original",
            "qa_status": "DRAFT",
            "tags": ["science"]
        })

    # Transitions
    for d in [1, 2, 3, 4, 5]:
        questions.append({
            "question_id": f"RW-EI-T-{d}",
            "domain": "Expression of Ideas",
            "skill": "Transitions",
            "difficulty": d,
            "passage": f"Sentence 1 establishes a point. _____, sentence 2 provides an example. (Difficulty {d})",
            "question_stem": "Which choice completes the text with the most logical transition?",
            "choices": {
                "A": "However",
                "B": "For instance",
                "C": "Therefore",
                "D": "Similarly"
            },
            "correct_answer": "B",
            "explanation": "'For instance' sets up the example in sentence 2.",
            "why_others_wrong": {"A": "Contrast", "C": "Cause/effect", "D": "Comparison"},
            "common_trap": "Choosing a transition that sounds good but implies the wrong relationship.",
            "thinking_framework": "1. Read sentence before. 2. Read sentence after. 3. Identify relationship (contrast, example, cause).",
            "estimated_time_seconds": 60,
            "source_basis": "original",
            "qa_status": "DRAFT",
            "tags": ["literature"]
        })

    return questions

def create_rw_conventions():
    questions = []
    
    # Boundaries
    boundaries_diffs = [1, 2, 2, 3, 3, 4, 5]
    for d in boundaries_diffs:
        questions.append({
            "question_id": f"RW-C-B-{d}-v{len(questions)}",
            "domain": "Standard English Conventions",
            "skill": "Boundaries",
            "difficulty": d,
            "passage": f"The dog ran across the park_____ it was chasing a squirrel. (Difficulty {d})",
            "question_stem": "Which choice completes the text so that it conforms to the conventions of Standard English?",
            "choices": {
                "A": "park, it",
                "B": "park; it",
                "C": "park it",
                "D": "park: and it"
            },
            "correct_answer": "B",
            "explanation": "A semicolon correctly separates two independent clauses.",
            "why_others_wrong": {"A": "Comma splice", "C": "Run-on", "D": "Incorrect punctuation"},
            "common_trap": "Comma splice error.",
            "thinking_framework": "1. Identify independent clauses. 2. Select appropriate punctuation to separate or join them.",
            "estimated_time_seconds": 60,
            "source_basis": "original",
            "qa_status": "DRAFT",
            "tags": ["social science"]
        })

    # Form, Structure, and Sense
    fss_diffs = [1, 2, 2, 3, 3, 4, 5]
    for d in fss_diffs:
        questions.append({
            "question_id": f"RW-C-FSS-{d}-v{len(questions)}",
            "domain": "Standard English Conventions",
            "skill": "Form, Structure, and Sense",
            "difficulty": d,
            "passage": f"Neither the manager nor the employees _____ happy with the new policy. (Difficulty {d})",
            "question_stem": "Which choice completes the text so that it conforms to the conventions of Standard English?",
            "choices": {
                "A": "was",
                "B": "were",
                "C": "is",
                "D": "has been"
            },
            "correct_answer": "B",
            "explanation": "'employees' is plural and closest to the verb, so the plural 'were' is correct.",
            "why_others_wrong": {"A": "Singular", "C": "Singular", "D": "Singular"},
            "common_trap": "Matching the verb to the first subject rather than the closer one.",
            "thinking_framework": "1. Identify subject. 2. Determine singular/plural. 3. Match verb tense/number.",
            "estimated_time_seconds": 60,
            "source_basis": "original",
            "qa_status": "DRAFT",
            "tags": ["history"]
        })

    return questions

def main():
    base_dir = r"d:\antigravity_scratch\real_estate_scoring\sql\SAT\data\questions"
    os.makedirs(base_dir, exist_ok=True)
    
    files = {
        "rw_information_ideas.json": create_rw_information_ideas(),
        "rw_craft_structure.json": create_rw_craft_structure(),
        "rw_expression_ideas.json": create_rw_expression_ideas(),
        "rw_conventions.json": create_rw_conventions()
    }
    
    for filename, data in files.items():
        with open(os.path.join(base_dir, filename), "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
            
if __name__ == "__main__":
    main()
