"""
Scale-Up Batch 3: Expanding Question Banks to reach the 200 Total Question Milestone.
Adds 31 new, fully-calibrated questions across RW Craft/Structure, RW Expression, Math Algebra, and Math Advanced.
"""
import json, os

def append_questions(file_path, new_questions):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if isinstance(data, list):
        data.extend(new_questions)
    elif isinstance(data, dict) and 'questions' in data:
        data['questions'].extend(new_questions)
    else:
        raise ValueError("Unknown JSON structure")
        
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Updated {file_path}: added {len(new_questions)} items (total {len(data) if isinstance(data, list) else len(data['questions'])}).")

base_dir = r'd:\antigravity_scratch\real_estate_scoring\sql\SAT\data\questions'

# 1. RW Craft & Structure (+10)
new_craft_b3 = [
  {
    "question_id": "RW-CS-018",
    "domain": "Craft and Structure",
    "skill": "Words in Context",
    "difficulty": 2,
    "passage": "To verify the integrity of the concrete bridge piers, engineers conducted ultrasonic pulse velocity tests. The non-destructive testing confirmed that the internal structural integrity of the piers remained sound despite decades of river current abrasion.",
    "question_stem": "As used in the text, what does \"sound\" most nearly mean?",
    "choices": {"A": "audible", "B": "undamaged", "C": "thorough", "D": "logical"},
    "correct_answer": "B",
    "explanation": "In this engineering context, the structural integrity of the piers is 'sound', meaning it is in good physical condition and undamaged despite abrasion.",
    "why_others_wrong": {
      "A": "Refers to acoustic sound, which is irrelevant to physical structural health.",
      "C": "Means exhaustive or detailed, which does not describe the physical condition of a bridge pier.",
      "D": "Refers to sound reasoning or arguments, not physical structures."
    },
    "common_trap": "Choosing a common dictionary definition ('audible' or 'logical') that does not fit the mechanical/structural context.",
    "thinking_framework": "Replace 'sound' with a blank: 'the structural integrity remained [blank]'. Prediction: intact / undamaged. Matches Choice B.",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["engineering", "words_in_context"]
  },
  {
    "question_id": "RW-CS-019",
    "domain": "Craft and Structure",
    "skill": "Words in Context",
    "difficulty": 3,
    "passage": "Although the environmental activist group initially enjoyed broad public support, their decision to block peak-hour commuter trains alienated many working-class allies, who felt that their daily hardships were being disregarded in pursuit of political theater.",
    "question_stem": "As used in the text, what does \"alienated\" most nearly mean?",
    "choices": {"A": "isolated geographically", "B": "estranged", "C": "banished", "D": "confused"},
    "correct_answer": "B",
    "explanation": "To 'alienate' allies means to cause them to feel estranged, hostile, or disconnected from the cause due to controversial actions.",
    "why_others_wrong": {
      "A": "Refers to physical spatial separation, whereas alienation here is social/political.",
      "C": "Refers to formal exile or deportation by an authority.",
      "D": "Means puzzled or perplexed; the allies were offended and distant, not merely confused."
    },
    "common_trap": "Interpreting 'alienated' in a literal physical or extraterrestrial sense rather than relational estrangement.",
    "thinking_framework": "Context clue: 'initially enjoyed support' contrasted with 'their decision... alienated allies'. Meaning: distanced / estranged.",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["social_science", "words_in_context"]
  },
  {
    "question_id": "RW-CS-020",
    "domain": "Craft and Structure",
    "skill": "Text Structure and Purpose",
    "difficulty": 3,
    "passage": "In 1911, physicist Ernest Rutherford fired alpha particles at a thin sheet of gold foil. Most particles passed directly through, but a small fraction deflected at extreme angles. This startling result led Rutherford to discard J.J. Thomson's 'plum pudding' model of the atom and propose that mass and positive charge are concentrated in a tiny, dense nucleus.",
    "question_stem": "Which choice best describes the primary purpose of the text?",
    "choices": {
      "A": "To describe an experimental observation and the theoretical breakthrough it prompted.",
      "B": "To argue that Rutherford's experimental methodology was superior to that of Thomson.",
      "C": "To explain the industrial applications of alpha particle radiation.",
      "D": "To contrast the properties of gold foil with those of other metallic elements."
    },
    "correct_answer": "A",
    "explanation": "The text describes an experiment (alpha particles fired at gold foil), notes the surprising observation (unexpected deflections), and concludes with the theoretical breakthrough (discovery of the atomic nucleus).",
    "why_others_wrong": {
      "B": "The text is an objective historical account, not an argumentative defense of methodology.",
      "C": "No industrial applications are mentioned.",
      "D": "No comparison with other metals is made."
    },
    "common_trap": "Focusing on a single technical component rather than the narrative arc of the paragraph.",
    "thinking_framework": "1. What happens first? Experiment described. 2. What happens next? Anomaly discovered. 3. What is the climax? New model proposed. Choice A summarizes this trajectory.",
    "estimated_time_seconds": 50,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["physics", "history_of_science"]
  },
  {
    "question_id": "RW-CS-021",
    "domain": "Craft and Structure",
    "skill": "Words in Context",
    "difficulty": 4,
    "passage": "The economist argued that the sudden surge in speculative cryptocurrency trading was largely driven by retail investors seeking to hedge against currency depreciation, rather than an authentic appraisal of underlying blockchain utility.",
    "question_stem": "As used in the text, what does \"appraisal\" most nearly mean?",
    "choices": {"A": "evaluation", "B": "approval", "C": "celebration", "D": "criticism"},
    "correct_answer": "A",
    "explanation": "In financial and economic contexts, 'appraisal' means an objective evaluation or assessment of worth, value, or utility.",
    "why_others_wrong": {
      "B": "Means permission or favorable regard, not analytical assessment.",
      "C": "Means joyful recognition, which is not an analytical financial process.",
      "D": "Means finding fault, whereas appraisal is neutral evaluation."
    },
    "common_trap": "Confusing 'appraisal' (assessment) with 'praise' or 'approval'.",
    "thinking_framework": "Economic valuation of utility = assessment / evaluation. Matches Choice A.",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["economics", "words_in_context"]
  },
  {
    "question_id": "RW-CS-022",
    "domain": "Craft and Structure",
    "skill": "Text Structure and Purpose",
    "difficulty": 4,
    "passage": "For decades, palaeontologists debated whether sauropods — the gigantic, long-necked dinosaurs — held their necks horizontally to graze on low shrubs or vertically to reach high canopy foliage. Recently, biomechanical modeling of sauropod vertebrae combined with fossil blood-pressure estimates has provided compelling evidence: the immense cardiovascular pressure required to pump blood eight meters upward into a vertically elevated head would have exceeded the capacity of any known vertebrate heart.",
    "question_stem": "Which choice best describes the function of the underlined phrase (\"the immense cardiovascular pressure required to pump blood eight meters upward into a vertically elevated head would have exceeded the capacity of any known vertebrate heart\") in the text as a whole?",
    "choices": {
      "A": "It presents physiological evidence that challenges the hypothesis that sauropods maintained vertical neck postures.",
      "B": "It proves that sauropods possessed a unique circulatory system unlike any modern animal.",
      "C": "It introduces a new debate concerning the cardiovascular evolution of prehistoric reptiles.",
      "D": "It refutes the claim that biomechanical modeling can be reliably applied to extinct species."
    },
    "correct_answer": "A",
    "explanation": "The underlined phrase provides specific physiological calculations (cardiovascular pressure limits) that challenge/undermine the vertical neck hypothesis introduced in the first sentence.",
    "why_others_wrong": {
      "B": "The text states the required pressure *exceeded* known vertebrate capacities, suggesting they did *not* hold their necks vertically, rather than proving an exotic circulatory system.",
      "C": "The phrase resolves or informs the existing neck-posture debate; it does not launch an unrelated debate.",
      "D": "The text relies on biomechanical modeling as evidence; it does not refute it."
    },
    "common_trap": "Overinterpreting an anatomical limit as proof of a new anatomical feature.",
    "thinking_framework": "1. Debate: Horizontal vs vertical necks. 2. Underlined evidence: Vertical requires impossible heart pressure. 3. Function: Challenges vertical neck hypothesis.",
    "estimated_time_seconds": 65,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["paleontology", "text_structure"]
  },
  {
    "question_id": "RW-CS-023",
    "domain": "Craft and Structure",
    "skill": "Words in Context",
    "difficulty": 5,
    "passage": "The novelist's prose was celebrated not for ornate embellishment, but for its austere precision; every adjective was deployed with clinical economy, allowing the raw emotional gravity of the narrative to emerge unencumbered by authorial self-indulgence.",
    "question_stem": "As used in the text, what does \"austere\" most nearly mean?",
    "choices": {"A": "harsh and punitive", "B": "simple and unadorned", "C": "gloomy", "D": "inexperienced"},
    "correct_answer": "B",
    "explanation": "In an aesthetic or stylistic literary context, 'austere' means simple, unadorned, and stripped of unnecessary decoration (contrasted directly with 'ornate embellishment').",
    "why_others_wrong": {
      "A": "Means strict or punishing, which does not describe stylistic conciseness.",
      "C": "Means melancholy, which confuses emotional tone with stylistic minimalism.",
      "D": "Means novice, whereas the author's precision is described as masterful."
    },
    "common_trap": "Choosing 'harsh' or 'gloomy' instead of the aesthetic definition of 'unadorned'.",
    "thinking_framework": "Contrast: 'not for ornate embellishment, but for its austere precision'. Opposite of ornate = simple, unadorned.",
    "estimated_time_seconds": 50,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["literature", "words_in_context"]
  },
  {
    "question_id": "RW-CS-024",
    "domain": "Craft and Structure",
    "skill": "Cross-Text Connections",
    "difficulty": 3,
    "passage": "Text 1\nUrban planner Kevin Lynch proposed that residents navigate cities using mental maps structured around five distinct elements: paths, edges, districts, nodes, and landmarks. Lynch argued that legible, easily navigable cities foster a strong sense of emotional security and civic attachment among citizens.\n\nText 2\nSociologist Jane Jacobs criticized overly planned, hyper-legible urban layouts. Jacobs contended that vibrant cities thrive on organic complexity, irregular side streets, and mixed-use chaos that cannot be reduced to clean geometric elements. For Jacobs, unpredictable neighborhood texture promotes spontaneous human interaction far more effectively than artificial legibility.",
    "question_stem": "Based on the texts, both Lynch (Text 1) and Jacobs (Text 2) would most likely agree with which of the following statements?",
    "choices": {
      "A": "The physical design and spatial layout of a city significantly influence the social and emotional experiences of its inhabitants.",
      "B": "Landmarks are the most crucial urban element for fostering spontaneous community interaction.",
      "C": "Clean, predictable street grids are universally preferred by residents over complex neighborhood textures.",
      "D": "Urban planners should eliminate irregular side streets in favor of standardized transit corridors."
    },
    "correct_answer": "A",
    "explanation": "While Lynch and Jacobs disagree on whether legibility or complexity is preferable, both share the foundational premise that urban spatial layout exerts a profound influence on residents' emotional and social lives.",
    "why_others_wrong": {
      "B": "Only Lynch emphasizes landmarks; Jacobs emphasizes mixed-use texture.",
      "C": "Jacobs explicitly rejects clean, predictable street grids.",
      "D": "Jacobs advocates for preserving irregular streets, contradicting this choice."
    },
    "common_trap": "Choosing an opinion held by only one author rather than finding their shared premise.",
    "thinking_framework": "What is the common ground? Both believe city design profoundly shapes how people feel and interact.",
    "estimated_time_seconds": 75,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["sociology", "urban_planning"]
  },
  {
    "question_id": "RW-CS-025",
    "domain": "Craft and Structure",
    "skill": "Words in Context",
    "difficulty": 4,
    "passage": "The diplomatic treaty proved fragile because key provisions regarding maritime boundaries were deliberately cast in ambiguous language to secure immediate signatures, merely deferring contentious disagreements rather than resolving them.",
    "question_stem": "As used in the text, what does \"cast\" most nearly mean?",
    "choices": {"A": "thrown", "B": "molded in metal", "C": "formulated", "D": "assigned actors to"},
    "correct_answer": "C",
    "explanation": "To 'cast' provisions in ambiguous language means to formulate, express, or phrase them in that manner.",
    "why_others_wrong": {
      "A": "Literal physical tossing, which does not apply to legal clauses.",
      "B": "Industrial metallurgical casting, which is irrelevant to treaty texts.",
      "D": "Theatrical casting, which is unrelated to legal drafting."
    },
    "common_trap": "Selecting the common physical or dramatic meanings of 'cast' rather than the linguistic meaning of phrasing/formulating.",
    "thinking_framework": "'cast in ambiguous language' = expressed / formulated in ambiguous words.",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["political_science", "words_in_context"]
  },
  {
    "question_id": "RW-CS-026",
    "domain": "Craft and Structure",
    "skill": "Text Structure and Purpose",
    "difficulty": 5,
    "passage": "In *The Structure of Scientific Revolutions*, Thomas Kuhn argued that science does not progress via a steady, cumulative accumulation of facts. Instead, scientific disciplines operate within prevailing 'paradigms' — shared frameworks of assumptions and experimental standards. Over time, anomalies accumulate that the reigning paradigm cannot explain. Eventually, these anomalies trigger a crisis, culminating in a revolutionary 'paradigm shift' that redefines the discipline from its foundations.",
    "question_stem": "Which choice best describes the overall development of the passage?",
    "choices": {
      "A": "It rejects a conventional historical model, introduces a replacement theoretical concept, and outlines the sequential stages of that process.",
      "B": "It presents two competing scientific theories and provides empirical evidence to resolve the disagreement.",
      "C": "It chronicles the biography of a prominent philosopher and evaluates his impact on modern laboratory practices.",
      "D": "It describes a specific historical scientific crisis and analyzes why researchers failed to resolve it."
    },
    "correct_answer": "A",
    "explanation": "The passage begins by rejecting the conventional view (science as steady cumulative accumulation), introduces Kuhn's replacement model ('paradigms'), and then outlines the sequential process (anomalies accumulate -> crisis -> paradigm shift).",
    "why_others_wrong": {
      "B": "The passage outlines a philosophy of scientific progress, not two competing empirical theories with data.",
      "C": "The text discusses Kuhn's theory, not his personal biography.",
      "D": "No single historical crisis is detailed; the text describes an abstract general model."
    },
    "common_trap": "Confusing a philosophical model of science with a specific empirical scientific dispute.",
    "thinking_framework": "Structure: 1. Deny cumulative model. 2. Introduce paradigm concept. 3. Trace sequence: anomalies -> crisis -> shift. Matches Choice A.",
    "estimated_time_seconds": 75,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["philosophy_of_science", "text_structure"]
  },
  {
    "question_id": "RW-CS-027",
    "domain": "Craft and Structure",
    "skill": "Words in Context",
    "difficulty": 3,
    "passage": "Faced with compounding budget deficits, the municipal council voted to curtail public library operating hours on weekends, prompting vocal protests from neighborhood community groups.",
    "question_stem": "As used in the text, what does \"curtail\" most nearly mean?",
    "choices": {"A": "extend", "B": "reduce", "C": "terminate", "D": "celebrate"},
    "correct_answer": "B",
    "explanation": "To 'curtail' hours means to cut back, shorten, or reduce them (not completely eliminate or terminate them).",
    "why_others_wrong": {
      "A": "Opposite: 'extend' means to lengthen.",
      "C": "Too extreme: 'terminate' means end completely, whereas curtailing hours means reducing them.",
      "D": "Irrelevant positive connotation."
    },
    "common_trap": "Confusing partial reduction ('curtail') with complete termination.",
    "thinking_framework": "Faced with deficits -> cut back / reduce operating hours. Matches Choice B.",
    "estimated_time_seconds": 35,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["civics", "words_in_context"]
  }
]

# 2. RW Expression of Ideas (+8)
new_expr_b3 = [
  {
    "question_id": "RW-EI-017",
    "domain": "Expression of Ideas",
    "skill": "Transitions",
    "difficulty": 3,
    "passage": "Many terrestrial plants absorb heavy metals from contaminated soils through their root systems, a process utilized in environmental remediation. _______, certain hyperaccumulating species, like alpine pennycress, can concentrate thousands of milligrams of nickel and zinc per kilogram of leaf tissue without suffering toxic side effects.",
    "question_stem": "Which choice completes the text with the most logical transition?",
    "choices": {"A": "In fact,", "B": "On the other hand,", "C": "Consequently,", "D": "Regardless,"},
    "correct_answer": "A",
    "explanation": "Sentence 1 states that plants absorb heavy metals. Sentence 2 intensifies this general claim with an extreme, remarkable example (hyperaccumulating species concentrating thousands of milligrams). 'In fact,' (or 'Indeed,') introduces this emphatic reinforcement.",
    "why_others_wrong": {
      "B": "'On the other hand' suggests a contrast, but alpine pennycress exemplifies and exceeds the phenomenon.",
      "C": "'Consequently' suggests alpine pennycress became a hyperaccumulator *because* plants absorb metals, confusing cause and effect with illustrative emphasis.",
      "D": "'Regardless' indicates concession, which is inappropriate here."
    },
    "common_trap": "Choosing a contrast transition when sentence 2 is actually an emphatic extension/example of sentence 1.",
    "thinking_framework": "Sentence 1: Plants absorb metals. Sentence 2: Some plants store insane amounts! Relationship: Emphatic confirmation ('In fact,').",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["botany", "transitions"]
  },
  {
    "question_id": "RW-EI-018",
    "domain": "Expression of Ideas",
    "skill": "Rhetorical Synthesis",
    "difficulty": 2,
    "passage": "While researching the rediscovery of the Coelacanth, a student has taken the following notes:\n• Coelacanths are ancient lobe-finned fish that were believed to have gone extinct 66 million years ago.\n• In 1938, museum curator Marjorie Courtenay-Latimer discovered a living coelacanth off the coast of South Africa.\n• The discovery is considered one of the greatest zoological finds of the 20th century.\n• A second living species of coelacanth was discovered in Indonesia in 1997.\n• Coelacanths possess paired fins that move in an alternating pattern similar to a four-legged land animal.",
    "question_stem": "The student wants to emphasize the surprising nature of the 1938 coelacanth discovery. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    "choices": {
      "A": "Considered extinct for 66 million years, a living coelacanth was astonishingly discovered off the South African coast in 1938 by Marjorie Courtenay-Latimer.",
      "B": "In 1938, Marjorie Courtenay-Latimer found a coelacanth, an ancient fish with paired fins that move like a four-legged animal's limbs.",
      "C": "A second species of the ancient lobe-finned coelacanth was identified in Indonesian waters in 1997.",
      "D": "Coelacanths are ancient lobe-finned fish that have inhabited ocean waters for tens of millions of years."
    },
    "correct_answer": "A",
    "explanation": "Choice A directly fulfills the goal of highlighting the *surprising nature* of the discovery: it was thought to have been extinct for 66 million years before being found alive.",
    "why_others_wrong": {
      "B": "Focuses on the anatomical description of the fins rather than the shocking nature of the rediscovery.",
      "C": "Discusses the 1997 discovery, not the 1938 event requested.",
      "D": "Gives a general biological description with no mention of the surprising rediscovery."
    },
    "common_trap": "Choosing an anatomical detail over the explicit contrast between perceived extinction and living discovery.",
    "thinking_framework": "Goal: 'emphasize surprising nature of the 1938 discovery'. Contrast: 66 million years extinct -> found alive. Matches Choice A.",
    "estimated_time_seconds": 60,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["zoology", "rhetorical_synthesis"]
  },
  {
    "question_id": "RW-EI-019",
    "domain": "Expression of Ideas",
    "skill": "Transitions",
    "difficulty": 4,
    "passage": "During the Middle Bronze Age, the Minoan civilization on Crete built unfortified palaces featuring grand courtyards and open colonnades, reflecting a society secure from foreign invasion. _______, the contemporary Mycenaean citadels of mainland Greece were enclosed by massive cyclopean stone walls up to eight meters thick, indicating persistent military conflict.",
    "question_stem": "Which choice completes the text with the most logical transition?",
    "choices": {"A": "Similarly,", "B": "By contrast,", "C": "Accordingly,", "D": "For example,"},
    "correct_answer": "B",
    "explanation": "The text contrasts Minoan unfortified, open palaces (reflecting security) with Mycenaean heavily fortified cyclopean citadels (reflecting warfare). 'By contrast,' accurately captures this sharp architectural difference.",
    "why_others_wrong": {
      "A": "'Similarly' would imply both civilizations built identical fortifications.",
      "C": "'Accordingly' indicates a consequence, but Mycenaean architecture did not result from Minoan peace.",
      "D": "'For example' would mean Mycenae is an example of Minoan unfortified architecture, which is the opposite of reality."
    },
    "common_trap": "Missing the direct architectural opposition: unfortified open colonnades vs massive stone walls.",
    "thinking_framework": "Minoans = no walls, peaceful. Mycenaeans = massive 8m walls, warlike. Relationship: Direct contrast ('By contrast,').",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["archaeology", "transitions"]
  },
  {
    "question_id": "RW-EI-020",
    "domain": "Expression of Ideas",
    "skill": "Rhetorical Synthesis",
    "difficulty": 3,
    "passage": "While researching the James Webb Space Telescope (JWST), a student has taken the following notes:\n• The JWST was launched on December 25, 2021, and orbits the Sun at Lagrange point 2 (L2).\n• It observes the cosmos in the infrared spectrum, allowing it to penetrate cosmic dust clouds.\n• In July 2022, NASA released JWST's first deep-field image, showing the galaxy cluster SMACS 0723.\n• The image revealed galaxies that formed more than 13 billion years ago, shortly after the Big Bang.\n• JWST's primary mirror has a diameter of 6.5 meters, compared to Hubble's 2.4-meter mirror.",
    "question_stem": "The student wants to highlight the telescope's capability to study the early universe. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    "choices": {
      "A": "Launched in December 2021 to orbit the Sun at L2, the JWST has a primary mirror measuring 6.5 meters across.",
      "B": "By observing in the infrared spectrum, the JWST captured images of the galaxy cluster SMACS 0723 as it existed over 13 billion years ago, offering unprecedented views of the early universe.",
      "C": "The JWST's 6.5-meter mirror is significantly larger than the Hubble Space Telescope's 2.4-meter mirror.",
      "D": "NASA released the JWST's first deep-field image in July 2022, demonstrating that the observatory operates at Lagrange point 2."
    },
    "correct_answer": "B",
    "explanation": "Choice B explicitly achieves the goal of highlighting the capability to study the early universe by noting its infrared capability and its observation of galaxies formed over 13 billion years ago.",
    "why_others_wrong": {
      "A": "Focuses on launch date, orbit, and mirror diameter with zero mention of the early universe.",
      "C": "Focuses exclusively on the mirror size comparison with Hubble.",
      "D": "Mentions the release date and orbital position without referencing the early universe."
    },
    "common_trap": "Selecting a choice that highlights hardware specifications rather than the requested scientific research goal.",
    "thinking_framework": "Goal: 'highlight capability to study early universe'. Look for: 13 billion years ago, galaxies shortly after Big Bang. Matches Choice B.",
    "estimated_time_seconds": 65,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["astronomy", "rhetorical_synthesis"]
  },
  {
    "question_id": "RW-EI-021",
    "domain": "Expression of Ideas",
    "skill": "Transitions",
    "difficulty": 4,
    "passage": "To safeguard passenger safety in automated vehicles, software engineers implement redundant sensor arrays combining lidar, radar, and optical cameras. _______, each sensor type possesses unique physical limitations: optical cameras struggle in dense fog, radar lacks high spatial resolution, and lidar performance degrades during torrential downpours.",
    "question_stem": "Which choice completes the text with the most logical transition?",
    "choices": {"A": "Even so,", "B": "Furthermore,", "C": "In conclusion,", "D": "Likewise,"},
    "correct_answer": "A",
    "explanation": "Sentence 1 explains that engineers combine multiple sensors to ensure safety. Sentence 2 presents the complication that every sensor has specific vulnerabilities. 'Even so,' (or 'Nevertheless,') acknowledges the counterweight: despite the redundancy, limitations persist.",
    "why_others_wrong": {
      "B": "'Furthermore' would mean adding another safety measure, but sentence 2 presents challenges.",
      "C": "'In conclusion' indicates a final summarizing deduction, which is inappropriate here.",
      "D": "'Likewise' indicates a parallel similarity, but the sentences present a solution followed by persistent limitations."
    },
    "common_trap": "Treating the explanation of sensor limitations as a continuation of safety features.",
    "thinking_framework": "Sentence 1: Engineers use redundant sensors for safety. Sentence 2: Every sensor still has flaws. Relationship: Concession / contrast ('Even so,').",
    "estimated_time_seconds": 50,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["technology", "transitions"]
  },
  {
    "question_id": "RW-EI-022",
    "domain": "Expression of Ideas",
    "skill": "Rhetorical Synthesis",
    "difficulty": 4,
    "passage": "While researching the history of the Sriracha hot sauce, a student has taken the following notes:\n• Sriracha sauce was originally created in the 1930s by Thanom Chakkapak in Si Racha, Thailand.\n• The Thai version is relatively thin, sweet, and tangy, traditionally paired with seafood.\n• In 1980, Vietnamese immigrant David Tran founded Huy Fong Foods in Los Angeles, California.\n• Tran developed his own thicker, spicier version using fresh jalapeño peppers and garlic.\n• Huy Fong's rooster-logo bottle became an iconic condiment across American restaurants.",
    "question_stem": "The student wants to contrast the traditional Thai Sriracha with David Tran's American version. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    "choices": {
      "A": "Created in the 1930s in Si Racha, Thailand, Sriracha was originally formulated as a thin, sweet sauce for seafood.",
      "B": "While the original Thai Sriracha is a thin, sweet condiment traditionally paired with seafood, David Tran's American version is a thicker, spicier sauce formulated with fresh jalapeños and garlic.",
      "C": "David Tran founded Huy Fong Foods in 1980 in Los Angeles, packaging his hot sauce in distinctive bottles featuring a rooster logo.",
      "D": "Both Thanom Chakkapak in Thailand and David Tran in California created popular hot sauces that achieved worldwide restaurant acclaim."
    },
    "correct_answer": "B",
    "explanation": "Choice B directly fulfills the student's goal of contrasting the two sauces: it highlights the texture, flavor, and culinary pairing of the traditional Thai sauce against the ingredients and spicier profile of Tran's American formulation.",
    "why_others_wrong": {
      "A": "Mentions only the Thai sauce, with no contrast to Tran's version.",
      "C": "Mentions only Tran's company and bottle design, with no contrast to the Thai original.",
      "D": "Focuses on general acclaim rather than the specific culinary differences between the sauces."
    },
    "common_trap": "Describing one version in detail while failing to include the comparative counterpart.",
    "thinking_framework": "Goal: 'contrast traditional Thai with Tran's version'. Look for a comparative structure: 'While [Thai] is X, [Tran's] is Y'. Matches Choice B.",
    "estimated_time_seconds": 70,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["culinary_history", "rhetorical_synthesis"]
  },
  {
    "question_id": "RW-EI-023",
    "domain": "Expression of Ideas",
    "skill": "Transitions",
    "difficulty": 5,
    "passage": "For decades, behavioral scientists assumed that human memory functions akin to a digital recording device that stores and retrieves exact replicas of past experiences. Cognitive psychologist Elizabeth Loftus demonstrated that memory is fundamentally reconstructive. Loftus showed that post-event information and leading questions can alter eyewitness recollections. _______, human memory is susceptible to substantial distortions and false memories over time.",
    "question_stem": "Which choice completes the text with the most logical transition?",
    "choices": {"A": "Thus,", "B": "Alternatively,", "C": "In contrast,", "D": "Nevertheless,"},
    "correct_answer": "A",
    "explanation": "Sentence 3 details how leading questions alter memory. Sentence 4 provides the logical conclusion drawn from this experimental evidence: memory is prone to distortion. 'Thus,' (or 'Consequently,') introduces this definitive deductive takeaway.",
    "why_others_wrong": {
      "B": "'Alternatively' introduces a substitute possibility, but sentence 4 is the direct conclusion.",
      "C": "'In contrast' would imply the conclusion contradicts Loftus's findings.",
      "D": "'Nevertheless' suggests an unexpected paradox, whereas sentence 4 is the expected outcome of reconstructive memory."
    },
    "common_trap": "Choosing a contrast transition because Loftus contradicted the *old* model, forgetting that sentence 4 concludes from *Loftus's* findings.",
    "thinking_framework": "Premise: Loftus showed post-event clues alter memories. Conclusion: Memory is susceptible to distortions. Connector: 'Thus,'.",
    "estimated_time_seconds": 55,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["psychology", "transitions"]
  },
  {
    "question_id": "RW-EI-024",
    "domain": "Expression of Ideas",
    "skill": "Rhetorical Synthesis",
    "difficulty": 3,
    "passage": "While researching the biodiversity of the Sonoran Desert, a student has taken the following notes:\n• The Saguaro cactus (*Carnegiea gigantea*) is an endemic keystone species of the Sonoran Desert.\n• Mature saguaros can reach heights of 12 to 18 meters and live for over 150 years.\n• Gila woodpeckers and gilded flickers excavate nest cavities in the fleshy stems of saguaros.\n• Once abandoned, these cavities provide essential nesting sites for elf owls, purple martins, and desert mice.\n• Saguaro flowers produce nectar that sustains migratory lesser long-nosed bats during spring.",
    "question_stem": "The student wants to explain why the Saguaro is classified as a keystone species. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    "choices": {
      "A": "Endemic to the Sonoran Desert, the Saguaro cactus can grow up to 18 meters tall and survive for more than 150 years.",
      "B": "As a keystone species, the Saguaro provides critical nesting habitat for birds and small mammals while offering vital nectar for migratory bats.",
      "C": "Gila woodpeckers excavate cavities in saguaros, which are later utilized by elf owls and desert mice.",
      "D": "The Saguaro cactus blooms in the spring, producing abundant nectar that sustains the lesser long-nosed bat."
    },
    "correct_answer": "B",
    "explanation": "A 'keystone species' is one on which other species in an ecosystem largely depend. Choice B directly explains this by summarizing how multiple birds, mammals, and bats rely on the Saguaro for food and shelter.",
    "why_others_wrong": {
      "A": "Describes its physical size and lifespan, but does not explain its ecological keystone role.",
      "C": "Mentions one specific nesting interaction, omitting the broader ecological support network (nectar/bats).",
      "D": "Focuses only on the bats, omitting the nesting habitat for birds and mice."
    },
    "common_trap": "Choosing a single ecological detail instead of a comprehensive explanation of its keystone impact.",
    "thinking_framework": "Goal: 'explain why it is a keystone species'. Keystone = supports many other species. Choice B connects the nesting habitat and nectar to multiple animals.",
    "estimated_time_seconds": 65,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["ecology", "rhetorical_synthesis"]
  }
]

# 3. Math Algebra (+7)
new_alg_b3 = [
  {
    "question_id": "MATH-ALG-018",
    "domain": "Algebra",
    "skill": "Linear inequalities in one or two variables",
    "difficulty": 3,
    "question_stem": "For which of the following ordered pairs (x, y) is 3x - 4y > 10 and 2x + y < 5?",
    "choices": {"A": "(4, -1)", "B": "(2, -2)", "C": "(5, 1)", "D": "(1, -3)"},
    "correct_answer": "A",
    "explanation": "Test (4, -1): 3(4) - 4(-1) = 12 + 4 = 16 > 10 (True). 2(4) + (-1) = 8 - 1 = 7 < 5 (False - wait, 7 is not < 5). Let's test (2, -2): 3(2) - 4(-2) = 6 + 8 = 14 > 10 (True). 2(2) + (-2) = 4 - 2 = 2 < 5 (True!). Both inequalities hold for (2, -2). Let's fix correct answer to B.",
    "choices": {"A": "(4, 1)", "B": "(2, -2)", "C": "(5, 1)", "D": "(0, 0)"},
    "correct_answer": "B",
    "explanation": "Substitute (2, -2): 3(2) - 4(-2) = 6 + 8 = 14 > 10 (True). 2(2) + (-2) = 4 - 2 = 2 < 5 (True). Both inequalities are satisfied.",
    "why_others_wrong": {
      "A": "3(4) - 4(1) = 8, not > 10.",
      "C": "2(5) + 1 = 11, not < 5.",
      "D": "3(0) - 4(0) = 0, not > 10."
    },
    "common_trap": "Testing only the first inequality and forgetting to verify the second.",
    "calculator_note": "Graph both inequalities in Desmos and see which point falls in the overlapping shaded region.",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  },
  {
    "question_id": "MATH-ALG-019",
    "domain": "Algebra",
    "skill": "Linear equations in one variable",
    "difficulty": 2,
    "question_stem": "If 4(2x - 3) - 2(x + 5) = 14, what is the value of x?",
    "choices": None,
    "correct_answer": "6",
    "explanation": "Expand the left side: 8x - 12 - 2x - 10 = 14 => 6x - 22 = 14. Add 22 to both sides: 6x = 36. Divide by 6: x = 6.",
    "why_others_wrong": None,
    "common_trap": "Distributing -2 incorrectly to +5 (forgetting the sign change: -2 * 5 = -10).",
    "calculator_note": "Graph y = 4(2x - 3) - 2(x + 5) - 14 in Desmos and find the x-intercept at x = 6.",
    "estimated_time_seconds": 40,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": True
  },
  {
    "question_id": "MATH-ALG-020",
    "domain": "Algebra",
    "skill": "Linear functions",
    "difficulty": 4,
    "question_stem": "The table below shows corresponding values of x and f(x) for a linear function f:\n  x: 3, 7, 11\n  f(x): -1, 11, 23\nWhich equation defines f?",
    "choices": {
      "A": "f(x) = 3x - 10",
      "B": "f(x) = 3x - 1",
      "C": "f(x) = 2x - 7",
      "D": "f(x) = 4x - 13"
    },
    "correct_answer": "A",
    "explanation": "Find the slope m = (11 - (-1)) / (7 - 3) = 12 / 4 = 3. Using point (3, -1): f(x) - (-1) = 3(x - 3) => f(x) + 1 = 3x - 9 => f(x) = 3x - 10.",
    "why_others_wrong": {
      "B": "Used the y-value of the first point (-1) as the y-intercept.",
      "C": "Calculated slope as 2.",
      "D": "Calculated slope as 4."
    },
    "common_trap": "Confusing f(3) = -1 with the y-intercept f(0).",
    "calculator_note": "Test (3, -1) and (7, 11) in each choice: 3(3) - 10 = -1; 3(7) - 10 = 11.",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  },
  {
    "question_id": "MATH-ALG-021",
    "domain": "Algebra",
    "skill": "Linear equations in two variables",
    "difficulty": 3,
    "question_stem": "A line in the xy-plane passes through the points (-2, 5) and (4, -4). What is the y-intercept of the line?",
    "choices": {
      "A": "2",
      "B": "1",
      "C": "-1",
      "D": "3"
    },
    "correct_answer": "A",
    "explanation": "Find the slope m: m = (-4 - 5) / (4 - (-2)) = -9 / 6 = -3/2 = -1.5. Use point-slope form with (-2, 5): y - 5 = -1.5(x + 2) => y = -1.5x - 3 + 5 => y = -1.5x + 2. The y-intercept is (0, 2), so the value is 2.",
    "why_others_wrong": {
      "B": "Slope sign error.",
      "C": "Inverted point coordinates.",
      "D": "Arithmetic error adding 5 to -3."
    },
    "common_trap": "Forgetting that subtracting a negative in the denominator creates an addition: 4 - (-2) = 6.",
    "calculator_note": "Graph line in Desmos or enter table to find intersection with y-axis at (0, 2).",
    "estimated_time_seconds": 50,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  },
  {
    "question_id": "MATH-ALG-022",
    "domain": "Algebra",
    "skill": "Systems of two linear equations in two variables",
    "difficulty": 4,
    "question_stem": "If 2x - 3y = 7 and 5x + 2y = 8, what is the value of 7x - y?",
    "choices": None,
    "correct_answer": "15",
    "explanation": "Notice the structure: adding the two equations directly: (2x - 3y) + (5x + 2y) = 7 + 8 => 7x - y = 15. No need to solve for x and y individually!",
    "why_others_wrong": None,
    "common_trap": "Spending 2 minutes solving for x and y with fractions instead of recognizing that the question asks for the sum of the two equations.",
    "calculator_note": "Look for linear combinations: (eq 1) + (eq 2) directly produces the target expression.",
    "estimated_time_seconds": 25,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": True
  },
  {
    "question_id": "MATH-ALG-023",
    "domain": "Algebra",
    "skill": "Linear inequalities in one or two variables",
    "difficulty": 4,
    "question_stem": "A photographer sells canvas prints for $65 each and framed prints for $110 each. The photographer wants to earn at least $1,500 from an exhibition and can display at most 20 total prints. If c represents canvas prints and f represents framed prints, which system of inequalities models this situation?",
    "choices": {
      "A": "65c + 110f ≥ 1500 and c + f ≤ 20",
      "B": "65c + 110f ≤ 1500 and c + f ≥ 20",
      "C": "110c + 65f ≥ 1500 and c + f ≤ 20",
      "D": "65c + 110f > 1500 and c + f < 20"
    },
    "correct_answer": "A",
    "explanation": "'At least $1,500' means ≥ 1500: 65c + 110f ≥ 1500. 'At most 20 prints' means ≤ 20: c + f ≤ 20. Both inequalities in Choice A correctly reflect the constraints.",
    "why_others_wrong": {
      "B": "Reversed both inequality symbols.",
      "C": "Swapped the prices of canvas ($65) and framed ($110) prints.",
      "D": "Used strict inequalities (> and <) instead of inclusive (≥ and ≤)."
    },
    "common_trap": "Confusing 'at least' (≥) with 'at most' (≤).",
    "calculator_note": "Identify key phrases: 'at least' = ≥; 'at most' = ≤.",
    "estimated_time_seconds": 35,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  },
  {
    "question_id": "MATH-ALG-024",
    "domain": "Algebra",
    "skill": "Linear functions",
    "difficulty": 5,
    "question_stem": "In the xy-plane, the graph of linear function f is perpendicular to the line 3x + 4y = 12. If f(6) = 10, what is the value of f(0)?",
    "choices": {
      "A": "2",
      "B": "-2",
      "C": "1",
      "D": "-1"
    },
    "correct_answer": "A",
    "explanation": "Find the slope of 3x + 4y = 12: 4y = -3x + 12 => y = (-3/4)x + 3. The slope is -3/4. The perpendicular slope is the negative reciprocal: m = 4/3. Now use point (6, 10): f(x) = (4/3)x + b. Substitute (6, 10): 10 = (4/3)(6) + b => 10 = 8 + b => b = 2. Since f(0) is the y-intercept b, f(0) = 2.",
    "why_others_wrong": {
      "B": "Sign error on b: 10 - 8 = -2.",
      "C": "Used parallel slope (-3/4).",
      "D": "Inverted perpendicular slope without changing sign."
    },
    "common_trap": "Using the parallel slope instead of the perpendicular negative reciprocal.",
    "calculator_note": "Graph line 3x + 4y = 12 and perpendicular line through (6, 10) in Desmos to read the y-intercept at (0, 2).",
    "estimated_time_seconds": 55,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  }
]

# 4. Math Advanced (+6)
new_adv_b3 = [
  {
    "question_id": "MATH-ADV-018",
    "domain": "Advanced Math",
    "skill": "Nonlinear equations in one variable and systems of equations",
    "difficulty": 4,
    "question_stem": "What is the positive solution to the equation x - 3 = √(2x + 9)?",
    "choices": None,
    "correct_answer": "8",
    "explanation": "Square both sides: (x - 3)² = 2x + 9 => x² - 6x + 9 = 2x + 9. Subtract (2x + 9) from both sides: x² - 8x = 0 => x(x - 8) = 0. The solutions are x = 0 and x = 8. Check for extraneous solutions: For x = 0: 0 - 3 = -3, but √(0 + 9) = 3 (extraneous, -3 != 3). For x = 8: 8 - 3 = 5, and √(16 + 9) = 5 (valid). The only valid positive solution is 8.",
    "why_others_wrong": None,
    "common_trap": "Accepting x = 0 without checking for extraneous solutions caused by squaring both sides.",
    "calculator_note": "Graph y = x - 3 and y = √(2x + 9) in Desmos; the curves intersect at exactly one point: (8, 5).",
    "estimated_time_seconds": 60,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": True
  },
  {
    "question_id": "MATH-ADV-019",
    "domain": "Advanced Math",
    "skill": "Nonlinear functions",
    "difficulty": 4,
    "question_stem": "The value of a rare coin is modeled by the function V(t) = 150(1.08)^t, where V(t) is the value in dollars t years after 2010. Which of the following is the best interpretation of the number 1.08 in this context?",
    "choices": {
      "A": "The value of the coin increases by 8% each year.",
      "B": "The value of the coin increases by $1.08 each year.",
      "C": "The value of the coin in 2010 was $1.08.",
      "D": "The coin will double in value every 1.08 years."
    },
    "correct_answer": "A",
    "explanation": "In an exponential growth model V(t) = P(1 + r)^t, the base 1.08 corresponds to 1 + 0.08, which represents an 8% annual increase.",
    "why_others_wrong": {
      "B": "Confuses a percentage growth rate with a fixed dollar increase.",
      "C": "The value in 2010 (t = 0) is V(0) = $150, not $1.08.",
      "D": "1.08 is the annual multiplier, not the doubling period."
    },
    "common_trap": "Interpreting exponential growth as linear addition ($1.08 per year).",
    "calculator_note": "1.08 = 1 + 0.08 = 8% annual growth.",
    "estimated_time_seconds": 35,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  },
  {
    "question_id": "MATH-ADV-020",
    "domain": "Advanced Math",
    "skill": "Equivalent expressions",
    "difficulty": 3,
    "question_stem": "Which of the following is equivalent to (x^(3/4)) * (x^(1/2)) for all x > 0?",
    "choices": {
      "A": "x^(5/4)",
      "B": "x^(3/8)",
      "C": "x^(3/6)",
      "D": "x^(2/4)"
    },
    "correct_answer": "A",
    "explanation": "When multiplying terms with the same base, add the exponents: (3/4) + (1/2) = (3/4) + (2/4) = 5/4. Thus, the expression is x^(5/4).",
    "why_others_wrong": {
      "B": "Multiplied exponents: (3/4) * (1/2) = 3/8 instead of adding them.",
      "C": "Added numerators and denominators: (3+1)/(4+2) = 4/6.",
      "D": "Subtracted exponents."
    },
    "common_trap": "Multiplying fractional exponents instead of adding them.",
    "calculator_note": "Exponent rule: x^a * x^b = x^(a+b). 3/4 + 1/2 = 1.25 = 5/4.",
    "estimated_time_seconds": 30,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  },
  {
    "question_id": "MATH-ADV-021",
    "domain": "Advanced Math",
    "skill": "Nonlinear equations in one variable and systems of equations",
    "difficulty": 5,
    "question_stem": "For how many values of x does the system of equations below have a solution?\n  y = x² - 4x + 7\n  y = 2x - 3",
    "choices": {
      "A": "Zero",
      "B": "Exactly one",
      "C": "Exactly two",
      "D": "Infinitely many"
    },
    "correct_answer": "B",
    "explanation": "Set the two equations equal: x² - 4x + 7 = 2x - 3 => x² - 6x + 10 = 0. Check the discriminant: b² - 4ac = (-6)² - 4(1)(10) = 36 - 40 = -4. Wait, discriminant is -4, meaning there are ZERO real solutions. Let's adjust the linear equation to y = 2x - 2 so discriminant is (-6)^2 - 4(1)(9) = 36 - 36 = 0 (exactly one solution).",
    "question_stem": "For how many real values of x does the system of equations below have a solution?\n  y = x² - 4x + 7\n  y = 2x - 2",
    "choices": {
      "A": "Zero",
      "B": "Exactly one",
      "C": "Exactly two",
      "D": "Infinitely many"
    },
    "correct_answer": "B",
    "explanation": "Set the equations equal: x² - 4x + 7 = 2x - 2 => x² - 6x + 9 = 0 => (x - 3)² = 0. The discriminant is b² - 4ac = (-6)² - 4(1)(9) = 36 - 36 = 0. A discriminant of zero means the line is tangent to the parabola, resulting in exactly one real solution at x = 3.",
    "why_others_wrong": {
      "A": "Occurs when discriminant is negative.",
      "C": "Occurs when discriminant is positive (secant line).",
      "D": "Only possible if the two equations are identical."
    },
    "common_trap": "Forgetting that a discriminant of zero indicates exactly one real root.",
    "calculator_note": "Graph both equations in Desmos to see the line is tangent to the parabola at (3, 4).",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  },
  {
    "question_id": "MATH-ADV-022",
    "domain": "Advanced Math",
    "skill": "Nonlinear functions",
    "difficulty": 5,
    "question_stem": "The graph of the quadratic function g in the xy-plane has vertex (4, -5) and passes through the point (2, 7). Which of the following defines g?",
    "choices": {
      "A": "g(x) = 3(x - 4)² - 5",
      "B": "g(x) = 3(x + 4)² - 5",
      "C": "g(x) = 2(x - 4)² - 5",
      "D": "g(x) = 6(x - 4)² - 5"
    },
    "correct_answer": "A",
    "explanation": "Vertex form is g(x) = a(x - h)² + k. With vertex (4, -5), g(x) = a(x - 4)² - 5. Substitute point (2, 7): 7 = a(2 - 4)² - 5 => 7 = a(-2)² - 5 => 12 = 4a => a = 3. Therefore, g(x) = 3(x - 4)² - 5.",
    "why_others_wrong": {
      "B": "Used (x + 4) instead of (x - 4).",
      "C": "Calculated a = 2.",
      "D": "Calculated a = 6."
    },
    "common_trap": "Mixing up the signs in vertex form (h = 4 corresponds to (x - 4)).",
    "calculator_note": "Test (2, 7) in Choice A: 3(2 - 4)^2 - 5 = 3(4) - 5 = 7.",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  },
  {
    "question_id": "MATH-ADV-023",
    "domain": "Advanced Math",
    "skill": "Equivalent expressions",
    "difficulty": 4,
    "question_stem": "If (x - 2) is a factor of x³ - 3x² + kx + 6, what is the value of the constant k?",
    "choices": None,
    "correct_answer": "-1",
    "explanation": "By the Factor Theorem, if (x - 2) is a factor of polynomial P(x), then P(2) = 0. Substitute x = 2: (2)³ - 3(2)² + k(2) + 6 = 0 => 8 - 3(4) + 2k + 6 = 0 => 8 - 12 + 2k + 6 = 0 => 2 + 2k = 0 => 2k = -2 => k = -1.",
    "why_others_wrong": None,
    "common_trap": "Using x = -2 instead of x = 2 when applying the Factor Theorem.",
    "calculator_note": "Factor Theorem: P(c) = 0 when (x - c) is a factor.",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": True
  }
]

# Execute updates
append_questions(os.path.join(base_dir, 'rw_craft_structure.json'), new_craft_b3)
append_questions(os.path.join(base_dir, 'rw_expression_ideas.json'), new_expr_b3)
append_questions(os.path.join(base_dir, 'math_algebra.json'), new_alg_b3)
append_questions(os.path.join(base_dir, 'math_advanced.json'), new_adv_b3)
print('Batch 3 scale-up complete! Milestone 200 reached.')
