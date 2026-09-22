"""
Scale-Up Batch 2: Expanding Math Geometry/Trig, Math PSDA, RW Conventions, and RW Info/Ideas.
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

# 1. Math Geometry & Trig (+5)
new_geo_trig = [
  {
    "question_id": "MATH-GEO-011",
    "domain": "Geometry and Trigonometry",
    "skill": "Right triangles and trigonometry",
    "difficulty": 3,
    "question_stem": "In triangle ABC, angle C is a right angle. If cos(A) = 5/13, what is the value of sin(B)?",
    "choices": {
      "A": "5/13",
      "B": "12/13",
      "C": "5/12",
      "D": "13/5"
    },
    "correct_answer": "A",
    "explanation": "In any right triangle where angle C is 90°, angles A and B are complementary (A + B = 90°). By the cofunction identity, cos(A) = sin(90° - A) = sin(B). Therefore, sin(B) = cos(A) = 5/13.",
    "why_others_wrong": {
      "B": "This is the value of sin(A) or cos(B), calculated via sqrt(1 - (5/13)^2) = 12/13.",
      "C": "This is tan(A) = 12/5 inverted.",
      "D": "This is sec(A) = 13/5."
    },
    "common_trap": "Calculating sin(A) instead of sin(B), forgetting that cos(A) = sin(B) for complementary angles.",
    "calculator_note": "Can be answered in 5 seconds via cofunction identity without any calculation.",
    "estimated_time_seconds": 30,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  },
  {
    "question_id": "MATH-GEO-012",
    "domain": "Geometry and Trigonometry",
    "skill": "Circles",
    "difficulty": 4,
    "question_stem": "In the xy-plane, the circle with equation x² + y² - 6x + 8y = 24 has center (h, k) and radius r. What is the value of h + k + r?",
    "choices": None,
    "correct_answer": "6",
    "explanation": "Complete the square for x and y: (x² - 6x + 9) + (y² + 8y + 16) = 24 + 9 + 16 => (x - 3)² + (y + 4)² = 49. The center is (h, k) = (3, -4), and radius r = sqrt(49) = 7. Thus, h + k + r = 3 + (-4) + 7 = 6.",
    "why_others_wrong": None,
    "common_trap": "Forgetting to take the square root of 49 to find the radius, or mixing up signs of h and k.",
    "calculator_note": "Graph the equation in Desmos to immediately observe the center at (3, -4) and radius 7.",
    "estimated_time_seconds": 60,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": True
  },
  {
    "question_id": "MATH-GEO-013",
    "domain": "Geometry and Trigonometry",
    "skill": "Area and volume",
    "difficulty": 3,
    "question_stem": "A right circular cylinder has radius r and height h. If the radius is doubled and the height is halved, by what factor does the volume of the cylinder change?",
    "choices": {
      "A": "It remains the same.",
      "B": "It increases by a factor of 2.",
      "C": "It increases by a factor of 4.",
      "D": "It decreases by a factor of 2."
    },
    "correct_answer": "B",
    "explanation": "The formula for volume of a cylinder is V = πr²h. When r is replaced by 2r and h is replaced by (1/2)h, the new volume is V' = π(2r)²((1/2)h) = π(4r²)((1/2)h) = 2πr²h = 2V. Therefore, the volume doubles (increases by a factor of 2).",
    "why_others_wrong": {
      "A": "Mistakenly assumes doubling the radius cancels out halving the height.",
      "C": "Forgot that the height was halved.",
      "D": "Did not square the factor of 2 for radius."
    },
    "common_trap": "Assuming linear scaling applies to volume instead of squaring the radius.",
    "calculator_note": "Test with simple numbers: r=1, h=2 => V = 2π; new r=2, new h=1 => V = 4π. Ratio = 2.",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  },
  {
    "question_id": "MATH-GEO-014",
    "domain": "Geometry and Trigonometry",
    "skill": "Lines, angles, and triangles",
    "difficulty": 4,
    "question_stem": "In triangle PQR, PQ = PR and the measure of angle P is 40°. If point S lies on side QR such that PS is perpendicular to QR, what is the measure, in degrees, of angle QPS?",
    "choices": None,
    "correct_answer": "20",
    "explanation": "Since PQ = PR, triangle PQR is isosceles with base QR. The altitude PS from vertex P to base QR bisects the vertex angle P. Therefore, angle QPS = (1/2) * angle P = (1/2) * 40° = 20°.",
    "why_others_wrong": None,
    "common_trap": "Finding angle PQS (which is 70°) instead of angle QPS.",
    "calculator_note": "Draw and label a quick sketch on scratch paper.",
    "estimated_time_seconds": 40,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": True
  },
  {
    "question_id": "MATH-GEO-015",
    "domain": "Geometry and Trigonometry",
    "skill": "Circles",
    "difficulty": 5,
    "question_stem": "A circle in the xy-plane has center (2, -1). If the line y = 3 is tangent to the circle, which of the following is an equation of the circle?",
    "choices": {
      "A": "(x - 2)² + (y + 1)² = 4",
      "B": "(x - 2)² + (y + 1)² = 16",
      "C": "(x + 2)² + (y - 1)² = 16",
      "D": "(x - 2)² + (y + 1)² = 9"
    },
    "correct_answer": "B",
    "explanation": "The distance from the center (2, -1) to the horizontal tangent line y = 3 is the radius r. r = |3 - (-1)| = 4. The standard equation of the circle is (x - h)² + (y - k)² = r², which gives (x - 2)² + (y - (-1))² = 4² => (x - 2)² + (y + 1)² = 16.",
    "why_others_wrong": {
      "A": "Used r = 2 instead of r = 4, or forgot to square the radius.",
      "C": "Inverted the signs of the center coordinates (h, k).",
      "D": "Used r = 3."
    },
    "common_trap": "Confusing the radius value r with r² in the equation.",
    "calculator_note": "Graph y = 3 and the choices in Desmos to see which circle touches the line at exactly one point.",
    "estimated_time_seconds": 50,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  }
]

# 2. Math PSDA (+5)
new_psda = [
  {
    "question_id": "MATH-PSDA-011",
    "domain": "Problem-Solving and Data Analysis",
    "skill": "Probability and conditional probability",
    "difficulty": 3,
    "question_stem": "A survey of 120 college students recorded their major and whether they participate in varsity athletics:\n• STEM: 15 athletes, 45 non-athletes (Total: 60)\n• Humanities: 10 athletes, 50 non-athletes (Total: 60)\nIf a student is selected at random from among the athletes, what is the probability that the student is a STEM major?",
    "choices": {
      "A": "15/120",
      "B": "15/60",
      "C": "15/25",
      "D": "25/120"
    },
    "correct_answer": "C",
    "explanation": "This is conditional probability: P(STEM | Athlete). The condition restricts the sample space to athletes only. Total athletes = 15 (STEM) + 10 (Humanities) = 25. Number of STEM athletes = 15. Therefore, the probability is 15/25 (or 3/5).",
    "why_others_wrong": {
      "A": "Calculated P(STEM and Athlete) relative to the total student population: 15/120.",
      "B": "Divided by total STEM students (60) instead of total athletes: 15/60.",
      "D": "Calculated total probability of being an athlete: 25/120."
    },
    "common_trap": "Using the total population (120) or row total as the denominator instead of the restricted conditional group (athletes = 25).",
    "calculator_note": "Identify the restricted denominator first: 'from among the athletes' = 25.",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  },
  {
    "question_id": "MATH-PSDA-012",
    "domain": "Problem-Solving and Data Analysis",
    "skill": "Percentages",
    "difficulty": 3,
    "question_stem": "The price of a share of stock increased by 20% on Monday and then decreased by 20% on Tuesday. If the price at the end of Tuesday was $96, what was the original price of the stock before Monday's increase?",
    "choices": {
      "A": "$96",
      "B": "$100",
      "C": "$104",
      "D": "$120"
    },
    "correct_answer": "B",
    "explanation": "Let P be the original price. After a 20% increase, the price is P * 1.20. After a 20% decrease, the price is (P * 1.20) * 0.80 = 0.96P. We are given 0.96P = 96. Solving for P: P = 96 / 0.96 = 100.",
    "why_others_wrong": {
      "A": "Assumes a 20% increase followed by a 20% decrease returns to the exact starting price.",
      "C": "Added 8% arbitrarily.",
      "D": "Divided 96 by 0.8."
    },
    "common_trap": "Believing that +20% and -20% cancel out to 0% change.",
    "calculator_note": "Simple calculation: 96 / (1.2 * 0.8) = 96 / 0.96 = 100.",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  },
  {
    "question_id": "MATH-PSDA-013",
    "domain": "Problem-Solving and Data Analysis",
    "skill": "Two-variable data: models and scatterplots",
    "difficulty": 4,
    "question_stem": "A scatterplot displays the relationship between temperature x (in degrees Celsius) and the chirping rate y (chirps per minute) of a cricket species. The line of best fit has equation y = 4.2x - 18. Based on this model, what is the predicted chirping rate for a temperature of 25°C?",
    "choices": None,
    "correct_answer": "87",
    "explanation": "Substitute x = 25 into the equation of the line of best fit: y = 4.2(25) - 18 = 105 - 18 = 87 chirps per minute.",
    "why_others_wrong": None,
    "common_trap": "Arithmetic error multiplying 4.2 * 25, or adding 18 instead of subtracting.",
    "calculator_note": "4.2 * 25 - 18 = 87.",
    "estimated_time_seconds": 35,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": True
  },
  {
    "question_id": "MATH-PSDA-014",
    "domain": "Problem-Solving and Data Analysis",
    "skill": "Inference from sample statistics and margin of error",
    "difficulty": 4,
    "question_stem": "A random sample of 500 registered voters in a city found that 54% support a proposed municipal transit tax, with an associated margin of error of 4% at a 95% confidence level. Which of the following is the most appropriate conclusion based on this result?",
    "choices": {
      "A": "Exactly 54% of all registered voters in the city support the tax.",
      "B": "It is plausible that between 50% and 58% of all registered voters in the city support the tax.",
      "C": "If another sample of 500 voters is surveyed, exactly 54% will support the tax.",
      "D": "The tax is guaranteed to pass with at least 50% of the vote."
    },
    "correct_answer": "B",
    "explanation": "The margin of error of ±4% around the sample estimate of 54% creates a confidence interval of [54% - 4%, 54% + 4%] = [50%, 58%]. It is statistically plausible that the true population proportion lies within this interval.",
    "why_others_wrong": {
      "A": "Sample statistics provide an estimate, not an exact count of the entire population.",
      "C": "Sampling variability means different samples will yield slightly different percentages.",
      "D": "Statistics never provides an absolute guarantee, and 50% is at the boundary of the interval."
    },
    "common_trap": "Choosing an absolute statement ('exactly', 'guaranteed') instead of an inferential range ('plausible between X and Y').",
    "calculator_note": "Margin of error: 54 ± 4 = [50, 58].",
    "estimated_time_seconds": 50,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": False
  },
  {
    "question_id": "MATH-PSDA-015",
    "domain": "Problem-Solving and Data Analysis",
    "skill": "Ratios, rates, proportional relationships, and units",
    "difficulty": 4,
    "question_stem": "A water filtration system processes 45 gallons of water every 12 minutes. At this constant rate, how many hours will it take to process 900 gallons of water?",
    "choices": None,
    "correct_answer": "4",
    "explanation": "First find the processing rate in gallons per minute: 45 gallons / 12 minutes = 3.75 gallons/min. To process 900 gallons: 900 / 3.75 = 240 minutes. Convert minutes to hours: 240 / 60 = 4 hours. Alternatively: 900 / 45 = 20 intervals of 12 minutes = 240 minutes = 4 hours.",
    "why_others_wrong": None,
    "common_trap": "Giving the answer in minutes (240) instead of converting to the requested unit of hours.",
    "calculator_note": "(900 / 45) * 12 / 60 = 4.",
    "estimated_time_seconds": 50,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "is_grid_in": True
  }
]

# 3. RW Conventions (+5)
new_rw_conv = [
  {
    "question_id": "RW-SEC-016",
    "domain": "Standard English Conventions",
    "skill": "Boundaries",
    "difficulty": 3,
    "passage": "In 1928, bacteriologist Alexander Fleming returned from vacation to discover that a green mold had contaminated a petri dish of Staphylococcus _______ the bacteria surrounding the mold had been completely lysed, leading directly to the discovery of penicillin.",
    "question_stem": "Which choice completes the text so that it conforms to the conventions of Standard English?",
    "choices": {
      "A": "bacteria; remarkably,",
      "B": "bacteria, remarkably",
      "C": "bacteria remarkably",
      "D": "bacteria, remarkably,"
    },
    "correct_answer": "A",
    "explanation": "Both clauses on either side of the punctuation are independent clauses ('Alexander Fleming returned...' and 'the bacteria... had been completely lysed'). A semicolon followed by an introductory adverb with a comma ('bacteria; remarkably,') correctly separates two independent clauses without creating a comma splice.",
    "why_others_wrong": {
      "B": "Creates a comma splice by joining two independent clauses with only a comma.",
      "C": "Creates a run-on sentence with zero punctuation between clauses.",
      "D": "Creates a comma splice."
    },
    "common_trap": "Using a comma alone to separate two complete thoughts.",
    "thinking_framework": "Clause 1: 'Fleming returned...'. Clause 2: 'the bacteria... had been lysed'. Both independent -> require semicolon or period.",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["history", "science", "grammar"]
  },
  {
    "question_id": "RW-SEC-017",
    "domain": "Standard English Conventions",
    "skill": "Form, Structure, and Sense",
    "difficulty": 3,
    "passage": "Discovered in deep hydrothermal vents along the Mariana Trench, _______ unusual physiological adaptations that allow them to survive in complete darkness under immense hydrostatic pressure.",
    "question_stem": "Which choice completes the text so that it conforms to the conventions of Standard English?",
    "choices": {
      "A": "biologists were fascinated by the snailfish's",
      "B": "the Mariana snailfish possesses",
      "C": "the immense pressure explains the snailfish's",
      "D": "extreme darkness is tolerated by the snailfish, which has"
    },
    "correct_answer": "B",
    "explanation": "The introductory modifying phrase 'Discovered in deep hydrothermal vents along the Mariana Trench' describes the organism that was discovered. Therefore, the noun immediately following the comma must be the organism ('the Mariana snailfish'). Choice B correctly places 'the Mariana snailfish' as the subject.",
    "why_others_wrong": {
      "A": "Dangling modifier: suggests the biologists were discovered in deep hydrothermal vents.",
      "C": "Dangling modifier: suggests the immense pressure was discovered in hydrothermal vents.",
      "D": "Dangling modifier: suggests extreme darkness was discovered in hydrothermal vents."
    },
    "common_trap": "Dangling modifier trap: placing the observer (biologists) right after the modifying phrase describing the organism.",
    "thinking_framework": "Modifier: 'Discovered in hydrothermal vents...'. WHO was discovered? The snailfish. Subject must be 'the Mariana snailfish'.",
    "estimated_time_seconds": 50,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["biology", "modifiers"]
  },
  {
    "question_id": "RW-SEC-018",
    "domain": "Standard English Conventions",
    "skill": "Form, Structure, and Sense",
    "difficulty": 4,
    "passage": "Neither the lead climatologist nor her international research collaborators _______ that the Arctic permafrost would thaw at the unprecedented rate documented over the past decade.",
    "question_stem": "Which choice completes the text so that it conforms to the conventions of Standard English?",
    "choices": {
      "A": "anticipates",
      "B": "anticipate",
      "C": "was anticipating",
      "D": "has anticipated"
    },
    "correct_answer": "B",
    "explanation": "In subject-verb agreement with correlative conjunctions ('neither... nor'), the verb agrees with the closer subject. Here, the closer subject is 'her international research collaborators', which is plural. Therefore, the plural verb 'anticipate' (Choice B) is required.",
    "why_others_wrong": {
      "A": "Singular verb; mistakenly agrees with 'lead climatologist'.",
      "C": "Singular verb ('was').",
      "D": "Singular verb ('has')."
    },
    "common_trap": "Making the verb agree with the first subject instead of the subject closer to the verb in 'neither... nor' constructions.",
    "thinking_framework": "Rule: 'Neither A nor B' -> verb agrees with B ('collaborators' = plural -> 'anticipate').",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["climate_science", "grammar"]
  },
  {
    "question_id": "RW-SEC-019",
    "domain": "Standard English Conventions",
    "skill": "Boundaries",
    "difficulty": 4,
    "passage": "Renowned architect Zaha Hadid designed structures characterized by dynamic, fluid _______ her signature style earned her the Pritzker Architecture Prize in 2004, making her the first woman to receive the prestigious honor.",
    "question_stem": "Which choice completes the text so that it conforms to the conventions of Standard English?",
    "choices": {
      "A": "curves,",
      "B": "curves;",
      "C": "curves",
      "D": "curves:"
    },
    "correct_answer": "B",
    "explanation": "The text consists of two independent clauses: 'Renowned architect Zaha Hadid designed structures characterized by dynamic, fluid curves' and 'her signature style earned her the Pritzker Architecture Prize in 2004...'. A semicolon correctly joins two related independent clauses without a coordinating conjunction.",
    "why_others_wrong": {
      "A": "Comma splice: commas cannot separate two independent clauses.",
      "C": "Run-on sentence: no punctuation between independent clauses.",
      "D": "A colon introduces an explanation or list; here the second clause is a full subsequent development, better served by a semicolon."
    },
    "common_trap": "Selecting a comma because the two thoughts are closely related.",
    "thinking_framework": "Check clauses: Clause 1 is independent; Clause 2 is independent. Semicolon required.",
    "estimated_time_seconds": 40,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["architecture", "grammar"]
  },
  {
    "question_id": "RW-SEC-020",
    "domain": "Standard English Conventions",
    "skill": "Form, Structure, and Sense",
    "difficulty": 5,
    "passage": "During the Renaissance, botanists who cataloged medicinal plants sought not only to classify newly discovered flora with anatomical precision but also _______ practical cultivation techniques for European apothecaries.",
    "question_stem": "Which choice completes the text so that it conforms to the conventions of Standard English?",
    "choices": {
      "A": "standardizing",
      "B": "to standardize",
      "C": "standardized",
      "D": "they standardized"
    },
    "correct_answer": "B",
    "explanation": "The sentence uses the correlative conjunction 'not only... but also...'. To maintain parallel structure, the element following 'but also' must match the grammatical form of the element following 'not only'. Since 'not only' is followed by the infinitive 'to classify', 'but also' must be followed by the infinitive 'to standardize' (Choice B).",
    "why_others_wrong": {
      "A": "Gerund ('standardizing') violates parallelism with the infinitive 'to classify'.",
      "C": "Past tense verb ('standardized') violates parallelism with 'to classify'.",
      "D": "Clause ('they standardized') violates parallelism with the infinitive phrase."
    },
    "common_trap": "Switching verb forms mid-sentence across correlative conjunctions.",
    "thinking_framework": "Correlative pair: 'not only [to classify]... but also [to standardize]'. Strict parallelism required.",
    "estimated_time_seconds": 50,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["history", "parallelism"]
  }
]

# 4. RW Information and Ideas (+4)
new_rw_info_b2 = [
  {
    "question_id": "RW-II-019",
    "domain": "Information and Ideas",
    "skill": "Central Ideas and Details",
    "difficulty": 3,
    "passage": "In many arid ecosystems, biological soil crusts (biocrusts) — communities of cyanobacteria, mosses, and lichens living on the soil surface — perform vital ecological services. They bind loose sand particles together, preventing wind and water erosion, while fixing atmospheric nitrogen into bioavailable soil nutrients. When heavy livestock grazing or off-road vehicles disrupt biocrusts, soil loss increases dramatically, and native vegetation struggles to recolonize the disturbed landscape.",
    "question_stem": "Which choice best states the main idea of the text?",
    "choices": {
      "A": "Biocrusts stabilize soil and provide essential nutrients in arid environments, making their preservation crucial for ecosystem health.",
      "B": "Heavy livestock grazing is the single greatest threat to desert biodiversity worldwide.",
      "C": "Cyanobacteria are more resilient than mosses when exposed to vehicular disruption in desert soils.",
      "D": "Native vegetation in arid regions can only grow in soils with high concentrations of atmospheric nitrogen."
    },
    "correct_answer": "A",
    "explanation": "Choice A accurately synthesizes both key components of the text: the beneficial functions of biocrusts (soil stabilization and nutrient fixation) and the consequence of their disruption (highlighting the importance of preservation).",
    "why_others_wrong": {
      "B": "Too extreme: the text mentions grazing as one disruption, but does not claim it is 'the single greatest threat worldwide'.",
      "C": "The text makes no comparison between the resilience of cyanobacteria versus mosses.",
      "D": "Too extreme and scientifically inaccurate: the text states biocrusts help, not that native plants 'can only grow' through them."
    },
    "common_trap": "Choosing an overly narrow detail or an unsubstantiated extreme claim.",
    "thinking_framework": "1. What is the subject? Biocrusts. 2. What do they do? Prevent erosion, fix nitrogen. 3. What happens if damaged? Severe soil loss. 4. Synthesis: Biocrusts are crucial for arid soil stability and nutrients.",
    "estimated_time_seconds": 60,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["ecology", "science"]
  },
  {
    "question_id": "RW-II-020",
    "domain": "Information and Ideas",
    "skill": "Command of Evidence: Textual",
    "difficulty": 4,
    "passage": "Literary scholar Marcus Thorne contends that Mary Shelley's 1818 novel *Frankenstein* reflects the era's anxiety regarding the ethical limits of experimental science, rather than simply expressing a fear of technological advancement. Thorne argues that Shelley specifically critiques the protagonist Victor Frankenstein's reckless abandonment of moral responsibility after bringing his creature to life, portraying him as a creator who refuses to nurture or educate his creation.",
    "question_stem": "Which quotation from *Frankenstein*, if authentic, would most directly support Thorne's contention?",
    "choices": {
      "A": "\"I beheld the wretch—the miserable monster whom I had created; he held up the curtain of the bed, and his eyes were fixed on me.\"",
      "B": "\"A new species would bless me as its creator and source; many happy and excellent natures would owe their being to me.\"",
      "C": "\"I had endowed it with the ability to perceive and learn, yet I fled my laboratory in horror, leaving the being helpless and untaught to wander a hostile world.\"",
      "D": "\"The materials of my workshop were scattered around, and the instruments of electrical science lay gleaming upon the marble table.\""
    },
    "correct_answer": "C",
    "explanation": "Thorne's specific claim is that Shelley critiques Victor's 'reckless abandonment of moral responsibility' and failure to 'nurture or educate his creation'. Choice C directly corroborates this by showing Victor acknowledging he created an entity capable of learning, yet fled and left it 'helpless and untaught'.",
    "why_others_wrong": {
      "A": "Merely describes Victor seeing the creature, not his abdication of moral/parental responsibility.",
      "B": "Shows Victor's initial hubris and desire for glory, not his post-creation abandonment of responsibility.",
      "D": "Describes the laboratory equipment and technology, which Thorne argues is NOT the central critique."
    },
    "common_trap": "Choosing a quote that describes the technology or the monster's appearance rather than the author's moral/parental critique.",
    "thinking_framework": "Claim: Shelley critiques Victor's abandonment of responsibility (refusing to nurture/educate). Match with Choice C: 'fled... leaving the being helpless and untaught'.",
    "estimated_time_seconds": 75,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["literature", "evidence"]
  },
  {
    "question_id": "RW-II-021",
    "domain": "Information and Ideas",
    "skill": "Inferences",
    "difficulty": 4,
    "passage": "In an investigation of visual camouflage in cephalopods, researchers observed cuttlefish placed in tanks with varying substrate patterns: solid gray, fine checkerboards, and large irregular stones. When over small checkerboards, the cuttlefish produced fine mottle skin patterns matching the scale of the checks. However, when placed in complete darkness, cuttlefish on checkerboards displayed a uniform resting coloration regardless of the tactile texture of the substrate beneath their tentacles.",
    "question_stem": "Which choice most logically completes the text's reasoning?",
    "choices": {
      "A": "tactile feedback from the seafloor is the primary sensory mechanism triggering cephalopod camouflage.",
      "B": "cuttlefish rely on visual sensory input rather than tactile perception to coordinate substrate-matching skin patterns.",
      "C": "cuttlefish are incapable of detecting different substrate textures with their tentacles.",
      "D": "cephalopod camouflage is an entirely subconscious reflex that operates independently of the nervous system."
    },
    "correct_answer": "B",
    "explanation": "The experiment demonstrates that cuttlefish match the visual scale of substrates when they can see them, but fail to do so in total darkness even though their tentacles are touching the substrate. This justifies the conclusion that their camouflage coordination depends on visual input rather than tactile cues.",
    "why_others_wrong": {
      "A": "Directly contradicted by the darkness experiment, where tactile contact alone failed to trigger camouflage.",
      "C": "Too broad: the tentacles may detect texture for other purposes (feeding, gripping); the experiment only shows tactile cues don't trigger camouflage.",
      "D": "Unsubstantiated speculation unsupported by the passage."
    },
    "common_trap": "Generalizing that cuttlefish cannot feel texture at all, rather than recognizing that texture alone does not drive their camouflage response.",
    "thinking_framework": "Observation 1: Cuttlefish camouflage matches visual pattern. Observation 2: In darkness, touching the pattern produces no camouflage. Inference: Camouflage relies on vision, not touch.",
    "estimated_time_seconds": 70,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["zoology", "neurobiology"]
  },
  {
    "question_id": "RW-II-022",
    "domain": "Information and Ideas",
    "skill": "Central Ideas and Details",
    "difficulty": 2,
    "passage": "Urban rooftop gardens provide multiple environmental benefits to densely populated metropolitan areas. By absorbing solar radiation that would otherwise heat concrete and asphalt, rooftop greenery helps mitigate the urban heat island effect. Additionally, these gardens capture stormwater runoff, reducing the volume of water entering municipal drainage systems during intense downpours and mitigating flash flood risks.",
    "question_stem": "Which choice best describes the main idea of the text?",
    "choices": {
      "A": "Rooftop gardens in cities reduce both urban temperatures and stormwater runoff risks.",
      "B": "Concrete and asphalt are the primary contributors to urban flash flooding.",
      "C": "Municipal drainage systems are unable to handle summer rainstorms without rooftop gardens.",
      "D": "Rooftop gardens produce organic food for residents in densely populated areas."
    },
    "correct_answer": "A",
    "explanation": "The text focuses on two main benefits of rooftop gardens: mitigating the urban heat island effect (reducing temperature) and capturing runoff to reduce flash floods. Choice A directly summarizes both points.",
    "why_others_wrong": {
      "B": "The text says greenery absorbs radiation that would heat concrete, not that concrete causes flash floods.",
      "C": "Too extreme: the text does not say drainage systems 'are unable to handle' storms without gardens.",
      "D": "The text discusses environmental and stormwater benefits, not organic food production."
    },
    "common_trap": "Choosing a detail or an outside benefit (food production) not mentioned in the passage.",
    "thinking_framework": "Benefit 1: Cools urban heat. Benefit 2: Captures stormwater runoff. Main idea: Rooftop gardens reduce temperatures and runoff.",
    "estimated_time_seconds": 45,
    "source_basis": "original",
    "qa_status": "DRAFT",
    "tags": ["urban_planning", "environmental_science"]
  }
]

# Execute updates
append_questions(os.path.join(base_dir, 'math_geometry_trig.json'), new_geo_trig)
append_questions(os.path.join(base_dir, 'math_psda.json'), new_psda)
append_questions(os.path.join(base_dir, 'rw_conventions.json'), new_rw_conv)
append_questions(os.path.join(base_dir, 'rw_information_ideas.json'), new_rw_info_b2)
print('Batch 2 expansion complete!')
