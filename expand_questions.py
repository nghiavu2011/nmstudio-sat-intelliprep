"""
Scale-Up Generator for SAT Question Banks
Generates rigorously calibrated Digital SAT questions for underrepresented domains.
"""
import json, os

def append_questions(file_path, new_questions):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Check if data is a list or dict with 'questions'
    if isinstance(data, list):
        data.extend(new_questions)
    elif isinstance(data, dict) and 'questions' in data:
        data['questions'].extend(new_questions)
    else:
        raise ValueError("Unknown JSON structure")
        
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Updated {file_path}: added {len(new_questions)} items (total {len(data) if isinstance(data, list) else len(data['questions'])}).")

# ─────────────────────────────────────────────────────────────
# 1. NEW QUESTIONS FOR rw_expression_ideas.json (Rhetorical Synthesis + Transitions)
# ─────────────────────────────────────────────────────────────
new_rw_expression = [
  {
    "question_id": "RW-EI-011",
    "domain": "Expression of Ideas",
    "skill": "Rhetorical Synthesis",
    "difficulty": 2,
    "passage": "While researching a presentation on solar sail technology, a student has taken the following notes:\n• Solar sails use the radiation pressure exerted by sunlight on large mirrors to propel spacecraft.\n• Unlike chemical rockets, solar sails require no onboard propellant once deployed in space.\n• The Japanese spacecraft IKAROS successfully demonstrated interplanetary solar sail propulsion in 2010.\n• Solar sails can theoretically achieve continuous acceleration over months or years.\n• The Planetary Society launched LightSail 2 into Earth orbit in 2019.",
    "question_stem": "The student wants to emphasize the primary advantage of solar sails over conventional rockets. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    "choices": {
      "A": "In 2010, the Japanese spacecraft IKAROS proved that solar sail propulsion could work across interplanetary distances.",
      "B": "Unlike conventional chemical rockets, solar sails do not require any onboard fuel, allowing them to accelerate continuously in space.",
      "C": "Both IKAROS in 2010 and LightSail 2 in 2019 demonstrated that solar sails use mirrors to reflect sunlight.",
      "D": "Solar sails rely on radiation pressure from sunlight on large mirrors to propel spacecraft through space."
    },
    "correct_answer": "B",
    "explanation": "Choice B directly addresses the student's goal by contrasting solar sails with conventional rockets and highlighting the primary advantage: requiring no onboard propellant.",
    "why_others_wrong": {
      "A": "Focuses on the IKAROS mission milestone rather than the advantage over chemical rockets.",
      "C": "Mentions two historical missions without highlighting the fuel advantage.",
      "D": "Explains the mechanism of solar sails but does not contrast them with conventional rockets."
    },
    "common_trap": "Selecting a choice that is factually accurate but fails to achieve the specific rhetorical goal stated in the prompt.",
    "thinking_framework": "1. Identify the goal: 'primary advantage of solar sails over conventional rockets'. 2. Scan notes for contrast: 'Unlike chemical rockets...'. 3. Match Choice B.",
    "estimated_time_seconds": 60,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["science", "space_exploration"]
  },
  {
    "question_id": "RW-EI-012",
    "domain": "Expression of Ideas",
    "skill": "Rhetorical Synthesis",
    "difficulty": 3,
    "passage": "While researching ancient agricultural terracing, a student has taken the following notes:\n• The Banaue Rice Terraces in the Philippines were carved into mountainsides by ancestors of the Ifugao people.\n• Constructed roughly 2,000 years ago, they are fed by an ancient rainforest irrigation system.\n• Terraced farming prevents soil erosion on steep slopes by slowing rainwater runoff.\n• Similar terracing systems were developed independently by the Inca in the Andean mountains of South America.\n• The Inca terraces, known as andenes, absorbed daytime solar heat to protect crops from freezing night temperatures.",
    "question_stem": "The student wants to introduce both the Banaue terraces and the Incan andenes to an audience unfamiliar with either. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    "choices": {
      "A": "Developed independently across the globe, the Ifugao's Banaue terraces in the Philippines and the Inca's andenes in South America are ancient mountainside systems designed for high-altitude agriculture.",
      "B": "The Banaue Rice Terraces were built 2,000 years ago in the Philippines, whereas the Incan andenes absorbed solar heat during the day to protect plants from cold night air.",
      "C": "Ancient farmers in the Philippines prevented soil erosion on steep slopes by creating elaborate stone and mud terraces fed by rainforest streams.",
      "D": "Both the Ifugao people and the Inca used rainforest irrigation systems to maintain sustainable crop yields on steep mountain slopes."
    },
    "correct_answer": "A",
    "explanation": "Choice A introduces both systems (Banaue terraces and Incan andenes), specifies their geographical origins (Philippines and South America), and provides the overarching concept (ancient mountainside agricultural systems) suitable for an unfamiliar audience.",
    "why_others_wrong": {
      "B": "Contrasts specific technical details (construction age vs thermal absorption) rather than introducing both systems broadly.",
      "C": "Mentions only the Philippine terraces and completely omits the Incan andenes.",
      "D": "Inaccurately claims that the Inca used rainforest irrigation (notes specify the Ifugao used rainforest streams, while Incan andenes were in the Andes)."
    },
    "common_trap": "Choosing an answer that mixes up specific facts from different notes.",
    "thinking_framework": "Goal: 'introduce both systems to an unfamiliar audience'. Look for a balanced, introductory sentence naming both cultures, locations, and purposes.",
    "estimated_time_seconds": 75,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["history", "anthropology"]
  },
  {
    "question_id": "RW-EI-013",
    "domain": "Expression of Ideas",
    "skill": "Rhetorical Synthesis",
    "difficulty": 4,
    "passage": "While researching bioacoustics in tropical rainforests, a student has taken the following notes:\n• Ecologist Dr. Amanda Santos uses autonomous recording units (ARUs) to capture rainforest soundscapes in Borneo.\n• Traditional biodiversity surveys require physical trapping or visual identification, which disrupts wildlife.\n• ARUs record continuous audio across a 24-hour cycle, capturing vocalizations of birds, amphibians, and mammals.\n• Machine learning algorithms analyze acoustic frequency spectra to detect elusive or endangered species.\n• In a 2023 study, Santos's algorithm identified the calls of the rare Bornean ground-cuckoo without human presence in the forest.",
    "question_stem": "The student wants to present Dr. Santos's research methodology to an audience of conservation biologists. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    "choices": {
      "A": "In a 2023 study, Dr. Amanda Santos detected the elusive Bornean ground-cuckoo, an endangered bird species inhabiting tropical forests.",
      "B": "By deploying autonomous recording units to capture continuous 24-hour audio and analyzing the soundscapes with machine learning algorithms, Dr. Amanda Santos monitors rainforest biodiversity without disrupting wildlife.",
      "C": "Traditional wildlife surveys that rely on trapping and visual identification can now be replaced because machine learning algorithms are more accurate.",
      "D": "Dr. Amanda Santos's research in Borneo demonstrates that acoustic frequency spectra can be recorded using automated hardware."
    },
    "correct_answer": "B",
    "explanation": "Choice B comprehensively summarizes Santos's methodology: the hardware tool (autonomous recording units), the data capture method (continuous 24-hour audio), the analytical technique (machine learning), and the methodological benefit (non-invasive monitoring).",
    "why_others_wrong": {
      "A": "Focuses on a specific finding (ground-cuckoo detection) rather than the overall methodology.",
      "C": "Makes an overgeneralized claim not stated in the notes (that traditional surveys 'can now be replaced because algorithms are more accurate').",
      "D": "Too vague and incomplete; omits the machine learning analysis and the non-disruptive conservation objective."
    },
    "common_trap": "Choosing a single exciting finding instead of a description of the methodology.",
    "thinking_framework": "Goal: 'present methodology to conservation biologists'. Must describe HOW the research is conducted and WHY it is advantageous.",
    "estimated_time_seconds": 80,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["biology", "technology"]
  },
  {
    "question_id": "RW-EI-014",
    "domain": "Expression of Ideas",
    "skill": "Rhetorical Synthesis",
    "difficulty": 5,
    "passage": "While researching the architectural acoustics of ancient Greek theaters, a student has taken the following notes:\n• The Theater of Epidaurus, constructed in the 4th century BCE, seats up to 14,000 spectators.\n• Performers' voices from the orchestra floor can be heard clearly in the highest rows without modern amplification.\n• Researchers at Georgia Tech discovered that the theater's limestone seats act as acoustic acoustic filters.\n• The limestone benches absorb low-frequency sounds (below 500 Hz), which correspond to crowd murmurs and wind noise.\n• High-frequency vocal sounds reflect off the stone tiers, reinforcing the actor's voice as it travels upward.",
    "question_stem": "The student wants to explain the physical mechanism behind the exceptional acoustics at Epidaurus. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    "choices": {
      "A": "Constructed in the 4th century BCE, the Theater of Epidaurus is renowned because all 14,000 spectators can hear actors without electronic amplification.",
      "B": "The theater's extraordinary acoustics result from its limestone seats, which filter out low-frequency background noise while reflecting high-frequency vocal sounds toward the upper rows.",
      "C": "Georgia Tech researchers discovered that ancient Greek architects preferred limestone because it absorbed crowd murmurs.",
      "D": "At Epidaurus, actors could project their voices from the orchestra floor to 14,000 people because the wind noise was naturally eliminated by the surrounding hillside."
    },
    "correct_answer": "B",
    "explanation": "Choice B precisely identifies the physical mechanism: the selective acoustic behavior of the limestone seats (absorbing low-frequency noise and reflecting high-frequency voice signals).",
    "why_others_wrong": {
      "A": "States the historical fact and the acoustic result, but does NOT explain the physical mechanism.",
      "C": "Makes an unjustified claim about the architects' preferences and leaves out the reflection of vocal frequencies.",
      "D": "Attributes the noise elimination to the hillside rather than the limestone seats described in the notes."
    },
    "common_trap": "Confusing the observable phenomenon (spectators can hear clearly) with the underlying physical mechanism (filtering and reflection).",
    "thinking_framework": "Goal: 'explain the physical mechanism'. Look for the scientific explanation: limestone acts as acoustic filter, absorbing low-frequency murmurs and reflecting high-frequency voices.",
    "estimated_time_seconds": 90,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["physics", "architecture", "history"]
  },
  {
    "question_id": "RW-EI-015",
    "domain": "Expression of Ideas",
    "skill": "Transitions",
    "difficulty": 3,
    "passage": "In traditional economics, models frequently assumed that human consumers make strictly rational decisions that maximize personal utility. _______, empirical findings in behavioral economics have revealed that cognitive biases, such as loss aversion and anchoring, systematically lead people to make suboptimal choices.",
    "question_stem": "Which choice completes the text with the most logical transition?",
    "choices": {
      "A": "In addition,",
      "B": "Consequently,",
      "C": "However,",
      "D": "Specifically,"
    },
    "correct_answer": "C",
    "explanation": "The first sentence describes the traditional assumption of rational decision-making. The second sentence presents evidence showing that humans systematically make suboptimal choices due to biases. This represents a contrast, making 'However,' the most logical connector.",
    "why_others_wrong": {
      "A": "'In addition' indicates continuation or adding similar ideas, but here the ideas conflict.",
      "B": "'Consequently' indicates a cause-and-effect relationship, but behavioral findings do not result from traditional assumptions.",
      "D": "'Specifically' introduces a detailed elaboration of the preceding claim, whereas this sentence introduces a contradictory finding."
    },
    "common_trap": "Choosing an addition transition when the two ideas present contrasting schools of thought.",
    "thinking_framework": "1. Sentence 1: Humans assumed rational. 2. Sentence 2: Evidence shows humans act irrationally. 3. Relationship: Contrast. 4. Choice: 'However,'.",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["economics", "psychology"]
  },
  {
    "question_id": "RW-EI-016",
    "domain": "Expression of Ideas",
    "skill": "Transitions",
    "difficulty": 4,
    "passage": "During deep sleep, the brain's glymphatic system expands, permitting cerebrospinal fluid to flush through neural tissue and clear away metabolic waste products like amyloid-beta. _______, individuals who experience chronic sleep deprivation demonstrate a significantly higher accumulation of toxic proteins associated with neurodegenerative disorders.",
    "question_stem": "Which choice completes the text with the most logical transition?",
    "choices": {
      "A": "Nonetheless,",
      "B": "Correspondingly,",
      "C": "In contrast,",
      "D": "Alternately,"
    },
    "correct_answer": "B",
    "explanation": "The first sentence explains the physiological mechanism: sleep enables the clearing of toxic waste. The second sentence describes the direct, expected corollary: lacking sleep leads to toxic protein buildup. 'Correspondingly' (or 'Accordingly') expresses this direct parallel cause-and-effect relationship.",
    "why_others_wrong": {
      "A": "'Nonetheless' implies a concession or unexpected outcome, but the second sentence follows directly from the first.",
      "C": "'In contrast' would be used if comparing two different subjects, but here the second sentence is a logical extension of the sleep mechanism.",
      "D": "'Alternately' suggests a different option or substitute, which is incorrect in this scientific context."
    },
    "common_trap": "Treating the lack of sleep as a contradiction rather than a direct negative application of the same mechanism.",
    "thinking_framework": "Sentence 1: Sleep cleans toxins. Sentence 2: No sleep = toxic buildup. Relationship: Direct corollary / consequence ('Correspondingly').",
    "estimated_time_seconds": 60,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["neuroscience", "biology"]
  }
]

# ─────────────────────────────────────────────────────────────
# 2. NEW QUESTIONS FOR rw_information_ideas.json (Quantitative Evidence & Inferences)
# ─────────────────────────────────────────────────────────────
new_rw_info = [
  {
    "question_id": "RW-II-016",
    "domain": "Information and Ideas",
    "skill": "Command of Evidence: Quantitative",
    "difficulty": 3,
    "passage": "Ecologists surveyed mangrove density along four coastal estuaries (Estuary A, B, C, and D) following severe tropical storms. Estuary A, which had an average mangrove canopy cover of 78%, experienced 1.2 meters of storm surge inland. Estuary B, with 62% canopy cover, recorded 2.4 meters of surge. In contrast, Estuary C (35% canopy cover) recorded 4.1 meters of surge, and Estuary D (12% canopy cover) recorded 5.8 meters of surge. The researchers concluded that denser mangrove forests provide substantial shoreline buffering against storm surges.",
    "question_stem": "Which choice best uses data from the text to support the researchers' conclusion?",
    "choices": {
      "A": "Estuary A experienced 1.2 meters of storm surge despite having the lowest percentage of canopy cover.",
      "B": "Estuary D recorded the highest storm surge at 5.8 meters while possessing the lowest mangrove canopy cover at 12%.",
      "C": "Estuary B recorded a greater storm surge than Estuary C because its canopy cover was nearly twice as dense.",
      "D": "Estuaries with less than 50% canopy cover experienced identical storm surges regardless of tree density."
    },
    "correct_answer": "B",
    "explanation": "The researchers' claim is that denser mangroves reduce storm surge inland. Choice B directly supports this by pairing the lowest canopy cover (12%) with the highest inland surge (5.8 meters), illustrating the negative correlation between density and surge penetration.",
    "why_others_wrong": {
      "A": "Contradicts the data in the text: Estuary A had the *highest* canopy cover (78%), not the lowest.",
      "C": "Contradicts the data: Estuary B (2.4 m) had a *smaller* surge than Estuary C (4.1 m).",
      "D": "Contradicts the data: Estuary C (4.1 m) and Estuary D (5.8 m) recorded distinctly different surges."
    },
    "common_trap": "Choosing an option that states a plausible scientific trend but inverts or misreads the actual numbers in the passage.",
    "thinking_framework": "1. Identify claim: Denser mangroves = less storm surge. 2. Verify each option against exact numbers: Estuary D has 12% cover and 5.8 m surge (highest surge with lowest cover). Matches Choice B.",
    "estimated_time_seconds": 75,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["environmental_science", "data_interpretation"]
  },
  {
    "question_id": "RW-II-017",
    "domain": "Information and Ideas",
    "skill": "Command of Evidence: Quantitative",
    "difficulty": 4,
    "passage": "In an experiment testing heat tolerance in agricultural crops, botanists measured photosynthetic efficiency (percentage of optimal carbon fixation) at elevated temperatures of 35°C and 42°C. Variety 1 maintained 88% efficiency at 35°C and 64% at 42°C. Variety 2 achieved 92% efficiency at 35°C but plummeted to 31% at 42°C. Variety 3 recorded 76% at 35°C and 72% at 42°C. The lead author argued that while some crop varieties achieve superior baseline performance under moderate heat, they may lack the physiological stability necessary to withstand extreme thermal spikes.",
    "question_stem": "Which choice best uses data from the experiment to support the author's argument?",
    "choices": {
      "A": "Variety 2 demonstrated the highest efficiency at 35°C among all varieties, yet suffered the steepest drop when temperature increased to 42°C.",
      "B": "Variety 3 exhibited higher photosynthetic efficiency at 35°C than Variety 1, but its efficiency declined substantially at 42°C.",
      "C": "All three varieties retained more than half of their photosynthetic efficiency even when subjected to 42°C.",
      "D": "Variety 1 maintained higher carbon fixation rates at both 35°C and 42°C than either Variety 2 or Variety 3."
    },
    "correct_answer": "A",
    "explanation": "The author's argument is that varieties with top baseline performance under moderate heat (35°C) may fail under extreme heat (42°C). Choice A directly validates this: Variety 2 had the highest performance at 35°C (92%) but crashed to 31% at 42°C (a 61-point drop).",
    "why_others_wrong": {
      "B": "Contradicts the data: Variety 3 was at 76% at 35°C, which is *lower* than Variety 1 (88%), and its efficiency barely declined (72%).",
      "C": "Contradicts the data: Variety 2 fell to 31%, which is far below half (50%).",
      "D": "Contradicts the data: Variety 2 was higher at 35°C (92% vs 88%), and Variety 3 was higher at 42°C (72% vs 64%)."
    },
    "common_trap": "Focusing on overall averages rather than comparing the specific moderate-vs-extreme drop of the top performer.",
    "thinking_framework": "Author claim: High baseline under moderate heat + poor stability under extreme heat. Variety 2: 92% at 35°C (highest) -> 31% at 42°C (lowest). Choice A is exact.",
    "estimated_time_seconds": 85,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["agriculture", "biology", "data_interpretation"]
  },
  {
    "question_id": "RW-II-018",
    "domain": "Information and Ideas",
    "skill": "Inferences",
    "difficulty": 4,
    "passage": "In many social mammal species, cooperative breeding — in which non-breeding individuals help care for offspring — is thought to evolve primarily through kin selection, where helpers indirectly pass on their genes by assisting close relatives. However, in a 10-year study of banded mongooses, biologists discovered that helpers frequently assist pups to whom they are no more closely related than to average members of the group. Furthermore, helpers that provide the most food to pups are significantly more likely to receive defensive support from those same individuals once the pups reach adulthood.",
    "question_stem": "Which choice most logically completes the text's discussion?",
    "choices": {
      "A": "cooperative breeding in banded mongooses is driven by reciprocal altruism rather than strictly by kin selection.",
      "B": "young pups are capable of recognizing their biological parents despite the cooperative rearing system.",
      "C": "banded mongooses that refuse to feed pups are eventually expelled from the social group.",
      "D": "kin selection is an obsolete theoretical concept that cannot explain mammalian social behavior."
    },
    "correct_answer": "A",
    "explanation": "The passage provides two key facts: (1) helpers assist pups that are NOT close relatives (undermining kin selection as the primary cause), and (2) helpers receive future support from the pups they helped once those pups grow up (mutual reciprocal benefit). Therefore, it is logically justified to conclude that cooperative breeding in this species is driven by reciprocal altruism rather than solely kin selection.",
    "why_others_wrong": {
      "B": "The text does not discuss whether pups recognize their biological parents.",
      "C": "There is zero mention of expulsion or punishment for non-helping mongooses in the text.",
      "D": "Too extreme; the text shows that kin selection is not the primary driver *in this specific case*, not that the entire theory is obsolete across all species."
    },
    "common_trap": "Choosing an overly broad or speculative conclusion not restricted to the specific evidence presented.",
    "thinking_framework": "1. Fact 1: Helpers help non-relatives (rules out kin selection alone). 2. Fact 2: Helped pups repay helpers in adulthood (reciprocity). 3. Conclusion: Reciprocal altruism explains this behavior.",
    "estimated_time_seconds": 75,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["zoology", "evolution"]
  }
]

# ─────────────────────────────────────────────────────────────
# 3. NEW QUESTIONS FOR rw_craft_structure.json (Cross-Text Connections)
# ─────────────────────────────────────────────────────────────
new_rw_craft = [
  {
    "question_id": "RW-CS-016",
    "domain": "Craft and Structure",
    "skill": "Cross-Text Connections",
    "difficulty": 4,
    "passage": "Text 1\nHistorian Elena Rostova argues that the rapid urbanization of 19th-century Britain was primarily driven by the Enclosure Acts, which privatized common agricultural land. Deprived of communal pastures and small plots, hundreds of thousands of dispossessed rural laborers had no economic choice but to migrate to burgeoning industrial cities to seek factory employment.\n\nText 2\nEconomic historian Marcus Vance contends that urban migration patterns preceded the major wave of parliamentary enclosures. Vance emphasizes wage differentials, demonstrating that factory pay in northern textile centers was up to three times higher than agricultural wages long before common lands were enclosed. For Vance, cities pulled rural workers with the promise of higher living standards rather than rural legislation pushing them out.",
    "question_stem": "Based on the texts, how would Vance (Text 2) most likely respond to Rostova's claim in Text 1 regarding the cause of rural migration?",
    "choices": {
      "A": "By arguing that rural laborers were attracted to urban factories by significant wage incentives before the Enclosure Acts took widespread effect.",
      "B": "By asserting that the Enclosure Acts actually increased agricultural wages, making rural life more attractive than factory work.",
      "C": "By agreeing that land privatization was the primary push factor, but claiming it occurred earlier than Rostova suggests.",
      "D": "By demonstrating that living standards in industrial cities were too low to motivate voluntary migration."
    },
    "correct_answer": "A",
    "explanation": "Text 2 explicitly states Vance's argument: migration was driven by a 'pull' factor (factory pay was up to three times higher) that occurred *before* the major wave of enclosures, directly countering Rostova's claim that enclosures were the primary 'push' driver.",
    "why_others_wrong": {
      "B": "Vance does not claim agricultural wages increased; he highlights that factory wages were much higher.",
      "C": "Vance does not agree with the privatization push factor; he argues wage differentials pulled workers.",
      "D": "Contradicts Text 2, which states cities pulled workers with 'the promise of higher living standards'."
    },
    "common_trap": "Confusing push factors (enclosures forcing workers out) with pull factors (higher wages attracting workers in).",
    "thinking_framework": "1. Text 1 claim: Enclosure Acts pushed workers to cities. 2. Text 2 claim: Wage differentials pulled workers to cities BEFORE enclosures. 3. Vance's response: Wage incentives attracted workers before enclosures took effect.",
    "estimated_time_seconds": 85,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["history", "economics"]
  },
  {
    "question_id": "RW-CS-017",
    "domain": "Craft and Structure",
    "skill": "Cross-Text Connections",
    "difficulty": 5,
    "passage": "Text 1\nNeuroscientist Dr. Kenji Sato advocates for brain-computer interfaces (BCIs) that use non-invasive electroencephalography (EEG) caps. Sato contends that non-invasive BCIs avoid the severe medical risks of craniotomies and tissue inflammation while offering sufficient spatial resolution to decode broad motor intentions, such as steering a wheelchair or selecting on-screen text.\n\nText 2\nBioengineer Dr. Maya Lin argues that non-invasive EEG signals are inevitably degraded as electrical impulses pass through the skull and scalp, creating an insurmountable 'signal-to-noise' barrier. Lin maintains that restoring nuanced dexterity — such as individual finger articulation in robotic prosthetic hands — is fundamentally impossible without intracortical microelectrode arrays implanted directly into the motor cortex.",
    "question_stem": "Based on the texts, in what way does Lin (Text 2) qualify the claims made by Sato (Text 1)?",
    "choices": {
      "A": "Lin denies that non-invasive BCIs have any practical utility, whereas Sato believes they can decode all forms of neural activity.",
      "B": "Lin argues that non-invasive BCIs cannot achieve the high-resolution neural decoding needed for fine motor control, whereas Sato considers non-invasive resolution adequate for broader motor tasks.",
      "C": "Lin asserts that craniotomies carry no meaningful medical risks, directly contradicting Sato's safety concerns.",
      "D": "Lin believes that skull tissue enhances electrical impulses, whereas Sato claims bone attenuates neural signals."
    },
    "correct_answer": "B",
    "explanation": "Sato claims non-invasive BCIs have 'sufficient spatial resolution to decode broad motor intentions' (like steering). Lin qualifies this by arguing that because signals degrade through the skull, non-invasive BCIs cannot achieve the nuanced dexterity (like individual finger articulation) that implanted arrays allow.",
    "why_others_wrong": {
      "A": "Too extreme: Lin does not deny broad utility, she specifically argues against nuanced dexterity; Sato also explicitly mentions 'broad motor intentions', not all forms.",
      "C": "Lin does not discuss whether craniotomies carry risks; she focuses on signal quality.",
      "D": "Inverts the physics: both acknowledge skull degradation; Lin emphasizes that it creates an insurmountable barrier for fine control."
    },
    "common_trap": "Assuming the second author completely dismisses the first, rather than identifying the specific technical boundary where the two perspectives diverge.",
    "thinking_framework": "1. Sato: Non-invasive is safe and adequate for BROAD tasks. 2. Lin: Signal degrades through skull; non-invasive CANNOT do FINE/NUANCED dexterity. 3. Qualification: Non-invasive works for broad, but fails for fine motor control.",
    "estimated_time_seconds": 90,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["neuroscience", "bioengineering"]
  }
]

# ─────────────────────────────────────────────────────────────
# 4. NEW QUESTIONS FOR math_algebra.json & math_advanced.json (Grid-ins & Complex items)
# ─────────────────────────────────────────────────────────────
new_math_algebra = [
  {
    "question_id": "MATH-ALG-016",
    "domain": "Algebra",
    "skill": "Systems of two linear equations in two variables",
    "difficulty": 4,
    "question_stem": "In the xy-plane, the system of equations below has no solution:\n  kx - 6y = 14\n  4x - 8y = 21\nWhat is the value of the constant k?",
    "choices": None,
    "correct_answer": "3",
    "explanation": "A system of two linear equations has no solution when the two lines are parallel and distinct (same slope, different y-intercepts). Rewriting both in slope-intercept form: line 1 has slope m1 = k/6, and line 2 has slope m2 = 4/8 = 1/2. Setting slopes equal: k/6 = 1/2 => 2k = 6 => k = 3. Check y-intercepts: -14/6 != -21/8, so the lines are parallel and distinct.",
    "why_others_wrong": None,
    "common_trap": "Equating coefficients without adjusting for the opposite side or signs.",
    "calculator_note": "Can graph 4x - 8y = 21 in Desmos and test k values to find the parallel line.",
    "estimated_time_seconds": 60,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": True
  },
  {
    "question_id": "MATH-ALG-017",
    "domain": "Algebra",
    "skill": "Linear functions",
    "difficulty": 3,
    "question_stem": "A catering company charges a base setup fee of $120 plus $18.50 per guest. If a client's total bill before tax was $786, how many guests attended the event?",
    "choices": {
      "A": "32",
      "B": "36",
      "C": "42",
      "D": "48"
    },
    "correct_answer": "B",
    "explanation": "Let g be the number of guests. The cost equation is 120 + 18.50g = 786. Subtract 120 from both sides: 18.50g = 666. Divide by 18.50: g = 666 / 18.50 = 36.",
    "why_others_wrong": {
      "A": "Corresponds to (786 - 194) / 18.50.",
      "C": "Added 120 instead of subtracting: (786 + 120) / 18.50 = 48.97.",
      "D": "Divided total bill directly by base fee: 786 / 18.50 ≈ 42.48."
    },
    "common_trap": "Dividing the total cost directly by the per-guest rate without subtracting the fixed setup fee.",
    "calculator_note": "Mental/scratchpad: 666 / 18.5 = 36. Desmos can solve 120 + 18.5x = 786 directly.",
    "estimated_time_seconds": 50,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  }
]

new_math_advanced = [
  {
    "question_id": "MATH-ADV-016",
    "domain": "Advanced Math",
    "skill": "Nonlinear functions",
    "difficulty": 4,
    "question_stem": "The quadratic function f is defined by f(x) = a(x - 3)² - 16, where a is a positive constant. If f(7) = 0, what is the value of f(0)?",
    "choices": None,
    "correct_answer": "-7",
    "explanation": "Use f(7) = 0 to solve for a: a(7 - 3)² - 16 = 0 => a(4)² = 16 => 16a = 16 => a = 1. Now evaluate f(0): f(0) = 1(0 - 3)² - 16 = 1(-3)² - 16 = 9 - 16 = -7.",
    "why_others_wrong": None,
    "common_trap": "Forgetting that (-3)² is positive 9, or forgetting to subtract 16.",
    "calculator_note": "Can graph f(x) = (x - 3)^2 - 16 in Desmos and inspect the y-intercept at x = 0.",
    "estimated_time_seconds": 60,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": True
  },
  {
    "question_id": "MATH-ADV-017",
    "domain": "Advanced Math",
    "skill": "Equivalent expressions",
    "difficulty": 5,
    "question_stem": "Which of the following expressions is equivalent to (x² - 9) / (2x² + 5x - 3) for all x > 3?",
    "choices": {
      "A": "(x - 3) / (2x - 1)",
      "B": "(x + 3) / (2x - 1)",
      "C": "(x - 3) / (2x + 1)",
      "D": "(x + 3) / (2x + 1)"
    },
    "correct_answer": "A",
    "explanation": "Factor the numerator: x² - 9 = (x - 3)(x + 3). Factor the denominator: 2x² + 5x - 3 = (2x - 1)(x + 3). The expression becomes [(x - 3)(x + 3)] / [(2x - 1)(x + 3)]. Canceling the common factor (x + 3) yields (x - 3) / (2x - 1).",
    "why_others_wrong": {
      "B": "Canceled (x - 3) instead of (x + 3).",
      "C": "Factored denominator incorrectly as (2x + 1)(x - 3).",
      "D": "Sign errors in both numerator and denominator factors."
    },
    "common_trap": "Factoring quadratic with leading coefficient 2 incorrectly, or canceling unequal binomials.",
    "calculator_note": "Desmos strategy: Graph y = (x^2 - 9)/(2x^2 + 5x - 3) and y = (x - 3)/(2x - 1); the curves will overlap completely.",
    "estimated_time_seconds": 70,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  }
]

# Execute updates
base_dir = r'd:\antigravity_scratch\real_estate_scoring\sql\SAT\data\questions'
append_questions(os.path.join(base_dir, 'rw_expression_ideas.json'), new_rw_expression)
append_questions(os.path.join(base_dir, 'rw_information_ideas.json'), new_rw_info)
append_questions(os.path.join(base_dir, 'rw_craft_structure.json'), new_rw_craft)
append_questions(os.path.join(base_dir, 'math_algebra.json'), new_math_algebra)
append_questions(os.path.join(base_dir, 'math_advanced.json'), new_math_advanced)
print('All question banks successfully expanded!')
