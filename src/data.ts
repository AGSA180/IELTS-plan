export const READING_PASSAGES = [
  {
    id: "r1",
    title: "The Psychology of Colour in Architecture",
    difficulty: 2,
    text: [
      "The relationship between colour and human psychology has fascinated researchers for over a century, yet its systematic application in architectural practice remains surprisingly limited. While interior designers have long operated on intuitive principles—painting hospital wards in calming pastels, using energising hues in sports facilities—the empirical basis for such choices is now being rigorously interrogated by environmental psychologists.",
      "A landmark study conducted by Elliot and Maier (2012) demonstrated that exposure to the colour red prior to cognitive performance tasks significantly impaired analytical reasoning, while simultaneously enhancing performance on tasks requiring creative association. The researchers proposed that red activates an avoidance motivation system, heightening vigilance in ways that constrain the associative thinking required for creativity but sharpen the focused attention demanded by analytical work.",
      "These findings carry direct implications for educational architecture. Traditional classroom design has favoured neutral tones—beiges, whites, and pale greys—on the assumption that visual neutrality minimises distraction. However, a meta-analysis of thirty-two studies by Hathaway (2018) suggests this approach may be fundamentally misguided. Classrooms incorporating strategically varied colour schemes—warm tones in collaborative zones, cooler hues in focused work areas—showed measurable improvements in both student engagement and task performance across age groups.",
      "The phenomenon known as chromatic adaptation complicates matters considerably. Prolonged exposure to any given colour causes the visual system to recalibrate, reducing the psychological impact of that colour over time. This suggests that the benefits of colour-coded environments may be temporary unless designers incorporate dynamic elements—variable lighting systems capable of shifting the apparent warmth of surfaces throughout the day, or modular furnishings that allow spatial colour relationships to evolve.",
      "Critics of this research tradition note that virtually all studies have been conducted in Western, industrialised contexts, with little attention to cross-cultural variation in colour symbolism. In many East Asian cultures, white is associated with mourning rather than clinical sterility; in parts of the Middle East, green carries sacred rather than merely naturalistic connotations. A globally applicable architectural colour theory, they argue, remains an aspiration rather than an achievement.",
    ],
    questions: [
      {
        type: "tfng",
        instruction: "Do the following statements agree with the information in the passage? Write TRUE, FALSE or NOT GIVEN.",
        items: [
          { q: "Red colour consistently improves performance on all types of cognitive tasks.", answer: "FALSE", id: "q1" },
          { q: "Hathaway's meta-analysis involved more than thirty separate studies.", answer: "TRUE", id: "q2" },
          { q: "Dynamic lighting systems are currently used in most modern school buildings.", answer: "NOT GIVEN", id: "q3" },
          { q: "The psychological effects of colour may diminish with extended exposure.", answer: "TRUE", id: "q4" },
          { q: "All cultures associate green with nature.", answer: "FALSE", id: "q5" },
        ]
      },
      {
        type: "mcq",
        instruction: "Choose the correct letter, A, B, C or D.",
        items: [
          {
            q: "What was the main finding of Elliot and Maier's study regarding red?",
            options: ["A. Red universally improves cognitive performance", "B. Red helps analytical thinking but hinders creativity", "C. Red helps creativity but hinders analytical reasoning", "D. Red has no measurable effect on cognition"],
            answer: "C", id: "q6"
          },
          {
            q: "Why do critics question the research on colour psychology in architecture?",
            options: ["A. The studies are too expensive to conduct", "B. The results are inconsistent across studies", "C. The research lacks cross-cultural diversity", "D. Architects refuse to apply the findings"],
            answer: "C", id: "q7"
          },
        ]
      },
      {
        type: "complete",
        instruction: "Complete the sentences below using NO MORE THAN TWO WORDS from the passage.",
        items: [
          { q: "The visual system adjusting to prolonged colour exposure is called __________.", answer: "chromatic adaptation", id: "q8" },
          { q: "Traditional classrooms have used __________ tones to minimise distraction.", answer: "neutral", id: "q9" },
        ]
      }
    ]
  }
];

export const LISTENING_SECTIONS = [
  {
    id: "l1",
    section: 1,
    context: "A conversation between a student (Maya) and a university accommodation officer.",
    scenario: "Section 1 · Social/Transactional",
    transcript: `OFFICER: Good morning, University Accommodation Services. How can I help you?

MAYA: Hi, I'm calling about my room booking for next term. My name is Maya Chen.

OFFICER: Let me pull up your record. Can I have your student ID?

MAYA: It's SC-4419-B.

OFFICER: Got it. You're booked into Hartley Hall, room 214, from the 24th of September. Is there a problem?

MAYA: Yes, actually. I requested a room on the ground floor due to a mobility issue, but I've been assigned a second-floor room.

OFFICER: I'm very sorry about that. We do have ground-floor accessible rooms in both Hartley Hall and in Pemberton Block. Pemberton is slightly further from the library — about 8 minutes on foot — but it has better accessibility features overall, including a wet room.

MAYA: I think Pemberton would actually be preferable. Would there be any extra charge?

OFFICER: The rooms are the same weekly rate — £165 per week. But I should mention that Pemberton has a shared kitchen on each floor with 6 residents, whereas Hartley has larger kitchens shared by 12. Some students prefer the smaller setup.

MAYA: That sounds fine. How do I confirm the change?

OFFICER: I can process it now if you have your emergency contact details to hand — we need those before finalising any room change.

MAYA: Sure. The contact is my mother — Dr Patricia Chen. Her mobile is 07823 441 092.

OFFICER: Excellent. And can I confirm your course?

MAYA: MSc Environmental Management, starting September.

OFFICER: Perfect. I'll send a confirmation email to your university address within 24 hours. Is there anything else?

MAYA: Yes — I'd also like to know about the parking situation for when my family drops me off.

OFFICER: Unloading is permitted on Pemberton Lane between 9am and 2pm on Saturdays only during the first two weekends of term. After that, there's a permit system.`,
    questions: [
      { id: "lq1", q: "What is Maya's student ID?", type: "short", answer: "SC-4419-B" },
      { id: "lq2", q: "What is the weekly rent for the new room? £", type: "short", answer: "165" },
      { id: "lq3", q: "How many residents share a kitchen in Pemberton Block?", type: "short", answer: "6" },
      { id: "lq4", q: "What is the name of Maya's emergency contact?", type: "short", answer: "Dr Patricia Chen" },
      { id: "lq5", q: "What is Maya's course of study?", type: "short", answer: "MSc Environmental Management" },
      {
        id: "lq6", q: "When is unloading permitted at Pemberton Lane?",
        type: "mcq",
        options: ["A. Weekdays between 8am and 6pm", "B. Saturdays 9am–2pm during the first two weekends of term", "C. Any day during the first week only", "D. Sundays from 10am"],
        answer: "B"
      },
    ]
  }
];

export const WRITING_T1_PROMPTS = [
  {
    id: "w1a",
    title: "The graph below shows the percentage of households in five countries owning at least one car between 1990 and 2020.",
    type: "line graph",
    data: "Key data: In 1990, Norway led at 72%, followed by the UK (58%), Germany (55%), Poland (32%), and Turkey (18%). By 2020, Norway remained highest at 81%, Germany rose to 79%, UK to 74%, Poland jumped dramatically to 68%, and Turkey grew to 45%. The most significant growth was in Poland (+36 percentage points) and Turkey (+27 percentage points).",
    chartData: [
      { year: '1990', Norway: 72, UK: 58, Germany: 55, Poland: 32, Turkey: 18 },
      { year: '2000', Norway: 75, UK: 63, Germany: 62, Poland: 45, Turkey: 26 },
      { year: '2010', Norway: 78, UK: 68, Germany: 70, Poland: 58, Turkey: 35 },
      { year: '2020', Norway: 81, UK: 74, Germany: 79, Poland: 68, Turkey: 45 },
    ],
    timeLimit: 1200,
  },
  {
    id: "w1b",
    title: "The bar chart below shows the percentage of students who passed their high school competency exams, by subject and gender, during the period 2010-2011.",
    type: "bar chart",
    data: "Key data: Girls outperformed boys in all subjects except Geography. In Mathematics, 48% of girls passed compared to 46% of boys. In Foreign Languages, the gap was much wider: 47% of girls passed versus only 30% of boys. Geography was the only subject where boys scored higher (30% vs 20%). The highest pass rate overall was for girls in Computer Science (56%).",
    chartData: [
      { subject: 'Mathematics', Boys: 46, Girls: 48 },
      { subject: 'Foreign Languages', Boys: 30, Girls: 47 },
      { subject: 'Geography', Boys: 30, Girls: 20 },
      { subject: 'Computer Science', Boys: 42, Girls: 56 },
      { subject: 'History', Boys: 35, Girls: 40 },
    ],
    timeLimit: 1200,
  },
  {
    id: "w1c",
    title: "The pie charts below show the primary reasons that students chose to attend a particular university in 1990 and 2010.",
    type: "pie chart",
    data: "Key data: In 1990, 'Proximity to home' was the main reason (35%), followed by 'Quality of teaching' (25%), 'Sports facilities' (20%), and 'Cost' (20%). By 2010, 'Quality of teaching' became the dominant reason (40%), while 'Proximity to home' dropped to 15%. 'Cost' increased slightly to 25%, and 'Sports facilities' remained stable at 20%.",
    chartData: {
      year1990: [
        { name: 'Proximity to home', value: 35 },
        { name: 'Quality of teaching', value: 25 },
        { name: 'Sports facilities', value: 20 },
        { name: 'Cost', value: 20 },
      ],
      year2010: [
        { name: 'Proximity to home', value: 15 },
        { name: 'Quality of teaching', value: 40 },
        { name: 'Sports facilities', value: 20 },
        { name: 'Cost', value: 25 },
      ]
    },
    timeLimit: 1200,
  },
  {
    id: "w1d",
    title: "The table below gives information about the underground railway systems in six cities.",
    type: "table",
    data: "Key data: London has the oldest system (opened in 1863) and the longest route (394km) but carries 775 million passengers yearly. Tokyo opened in 1927, has 155km of route, and carries 1927 million passengers. Paris opened in 1900, has 199km of route, and carries 1191 million passengers. Los Angeles is the newest (2001), has 28km of route, and carries 50 million passengers.",
    chartData: {
      headers: ["City", "Date opened", "Kilometres of route", "Passengers per year (in millions)"],
      rows: [
        ["London", "1863", "394", "775"],
        ["Paris", "1900", "199", "1191"],
        ["Tokyo", "1927", "155", "1927"],
        ["Washington DC", "1976", "126", "144"],
        ["Kyoto", "1981", "11", "45"],
        ["Los Angeles", "2001", "28", "50"]
      ]
    },
    timeLimit: 1200,
  },
  {
    id: "w1e",
    title: "The diagram below illustrates the process by which municipal solid waste is converted into electricity at a waste-to-energy plant.",
    type: "process diagram",
    data: "Process stages: (1) Waste collection and delivery by trucks → (2) Tipping floor — waste deposited and inspected for hazardous materials → (3) Combustion chamber — waste burned at 850°C → (4) Boiler — heat generates steam → (5) Steam turbine — drives electricity generator → (6) Electricity distributed to grid → (7) Flue gas treatment — filters remove pollutants → (8) Residual ash collected for road construction.",
    chartData: {
      steps: [
        "1. Waste collection & delivery",
        "2. Tipping floor (inspection)",
        "3. Combustion chamber (850°C)",
        "4. Boiler (generates steam)",
        "5. Steam turbine (drives generator)",
        "6. Electricity distributed to grid",
        "7. Flue gas treatment (filters)",
        "8. Residual ash collected"
      ]
    },
    timeLimit: 1200,
  },
  {
    id: "w1f",
    title: "The maps below show the centre of a small town called Islip as it is now, and plans for its development.",
    type: "map comparison",
    data: "Key data: Currently, a main road runs east-west through the town centre, lined with shops. There is a park to the north of the shops and housing to the south. The planned development includes a dual carriageway ring road around the centre. The main road will become pedestrianised. New housing will be built to the east, and a bus station and shopping centre will replace some existing shops to the north.",
    chartData: {
      before: "Main road (E-W) with shops on both sides. Park to the north. Housing to the south.",
      after: "Ring road added. Main road pedestrianised. Bus station & shopping centre replace north shops. New housing to the east."
    },
    timeLimit: 1200,
  },
  {
    id: "w1g",
    title: "The bar chart shows the number of visitors to three London museums between 2007 and 2012, and the pie chart shows the age distribution of visitors in 2012.",
    type: "mixed charts",
    data: "Key data: Bar chart: The British Museum had the most visitors overall, peaking at 6 million in 2012. The Science Museum saw a steady increase from 3m to 4.5m. The Natural History Museum fluctuated around 4m. Pie chart (2012): The largest age group was 16-30 years old (35%), followed by 31-45 (25%), under 15 (20%), 46-60 (15%), and over 60 (5%).",
    chartData: {
      bar: [
        { year: '2007', 'British Museum': 4.5, 'Science Museum': 3.0, 'Natural History': 3.8 },
        { year: '2009', 'British Museum': 5.2, 'Science Museum': 3.5, 'Natural History': 4.1 },
        { year: '2012', 'British Museum': 6.0, 'Science Museum': 4.5, 'Natural History': 3.9 },
      ],
      pie: [
        { name: 'Under 15', value: 20 },
        { name: '16-30', value: 35 },
        { name: '31-45', value: 25 },
        { name: '46-60', value: 15 },
        { name: 'Over 60', value: 5 },
      ]
    },
    timeLimit: 1200,
  }
];

export const WRITING_T2_PROMPTS = [
  {
    id: "w2a",
    prompt: "Some people believe that universities should focus primarily on academic subjects, providing students with theoretical knowledge. Others argue that universities should prepare students for employment by developing practical skills. Discuss both views and give your own opinion.",
    type: "Discussion + Opinion",
    timeLimit: 2400,
    wordTarget: 250,
    tips: ["Dedicate one paragraph to each view", "Use hedging: 'Proponents argue…', 'Critics contend…'", "Your opinion should be clear in the introduction and conclusion", "Aim for 280–320 words for a Band 7.5+"]
  },
  {
    id: "w2b",
    prompt: "Governments should invest more money in public transport rather than in building new roads. To what extent do you agree or disagree with this statement?",
    type: "Opinion Essay",
    timeLimit: 2400,
    wordTarget: 250,
    tips: ["State your position clearly from the start", "It's fine to partially agree — acknowledge the merit before disagreeing", "Provide a counter-argument and refute it", "Strong conclusion: restate position, no new ideas"]
  },
  {
    id: "w2c",
    prompt: "In many countries, the gap between the rich and the poor is increasing. What are the causes of this problem and what measures could be taken to address it?",
    type: "Causes & Solutions",
    timeLimit: 2400,
    wordTarget: 250,
    tips: ["Two body paragraphs: one for causes, one for solutions", "Be specific — name concrete policies, not vague ideas", "Use causal language: 'stems from', 'gives rise to', 'can be attributed to'", "Ensure causes and solutions are logically linked"]
  },
  {
    id: "w2d",
    prompt: "Many cities are suffering from severe traffic congestion. What problems does this cause, and what are the possible solutions?",
    type: "Problem & Solution",
    timeLimit: 2400,
    wordTarget: 250,
    tips: ["Identify 2–3 specific problems with examples", "Solutions must be realistic and directly address the problems", "Avoid generic phrases like 'governments should do more'", "Use linking words to connect problems to their respective solutions"]
  },
  {
    id: "w2e",
    prompt: "In some countries, young people are encouraged to work or travel for a year between finishing high school and starting university studies. Discuss the advantages and disadvantages for young people who decide to do this.",
    type: "Advantages & Disadvantages",
    timeLimit: 2400,
    wordTarget: 250,
    tips: ["Balanced structure: advantages then disadvantages", "Use concession: 'While X offers benefits, it nonetheless…'", "Conclude with your overall assessment", "Provide specific examples of both positive and negative outcomes"]
  },
  {
    id: "w2f",
    prompt: "Many people prefer to watch foreign films rather than locally produced films. Why could this be? Should governments give more financial support to local film industries?",
    type: "Two-part Question",
    timeLimit: 2400,
    wordTarget: 250,
    tips: ["Answer both parts of the question equally", "Dedicate one body paragraph to each question", "Ensure a clear transition between the two parts", "Summarise both answers in the conclusion"]
  }
];

export const SPEAKING_PARTS = {
  part1: [
    { topic: "Hometown", questions: ["Where are you from originally?", "What do you like most about where you grew up?", "Has your hometown changed much in recent years?", "Would you like to continue living there in the future?"] },
  ],
  part2: [
    {
      cue: "Describe a book or article that has had a significant influence on you.",
      bullets: ["What the book or article was about", "When and where you read it", "Why you chose to read it", "Explain why it has been so influential for you"],
      time: 120,
    }
  ],
  part3: [
    {
      topic: "Education and Society",
      questions: [
        "In your opinion, how well do schools in your country prepare young people for adult life?",
        "Some people believe that private schools create social inequality. What is your view?",
        "How has the role of the university changed in modern society compared to a generation ago?",
        "Do you think academic performance is the best way to measure a student's potential?",
      ]
    },
    {
      topic: "The Future of Work",
      questions: [
        "How do you think artificial intelligence and automation will change the types of jobs available in the next twenty years?",
        "Some people argue that the traditional five-day working week will soon become obsolete. To what extent do you agree?",
        "What are the main advantages and disadvantages of the increasing trend towards remote working?",
        "How should education systems adapt to prepare students for careers that do not even exist yet?",
      ]
    },
    {
      topic: "Digital Society",
      questions: [
        "How has the widespread use of social media affected the way people form and maintain relationships?",
        "Some people argue that the internet has made society more isolated despite being more connected. What is your view?",
        "What are the main privacy concerns associated with living in a highly digitalised society?",
        "Do you think governments should have more control over the information shared on the internet?",
      ]
    }
  ]
};

export const VOCAB_AWL = [
  { w:"Albeit", p:"/ɔːlˈbiː.ɪt/", d:"Although; even though", e:"The results were positive, albeit inconclusive.", s:["although","even though","though"], band: 7, collocations:["albeit briefly","albeit slowly","albeit reluctantly"] },
  { w:"Paradigm", p:"/ˈpær.ə.daɪm/", d:"A typical example or pattern; a world view", e:"The discovery represented a paradigm shift in evolutionary biology.", s:["model","framework","archetype"], band:7, collocations:["paradigm shift","dominant paradigm","challenge the paradigm"] },
  { w:"Ubiquitous", p:"/juːˈbɪk.wɪ.təs/", d:"Present, appearing, or found everywhere", e:"Smartphones have become ubiquitous in contemporary society.", s:["omnipresent","pervasive","universal"], band:7, collocations:["ubiquitous presence","become ubiquitous","seemingly ubiquitous"] },
  { w:"Exacerbate", p:"/ɪɡˈzæs.ə.beɪt/", d:"To make a problem or bad situation worse", e:"The drought was exacerbated by decades of unsustainable land use.", s:["aggravate","worsen","compound","intensify"], band:7, collocations:["exacerbate tensions","exacerbate the problem","further exacerbated by"] },
  { w:"Mitigate", p:"/ˈmɪt.ɪ.ɡeɪt/", d:"To make less severe or serious", e:"Policy-makers have introduced several measures to mitigate the effects of inflation.", s:["alleviate","reduce","lessen","diminish"], band:7, collocations:["mitigate risks","mitigate the impact","help to mitigate"] },
  { w:"Pragmatic", p:"/præɡˈmæt.ɪk/", d:"Dealing with things sensibly and realistically", e:"We need to adopt a more pragmatic approach to solving this issue.", s:["practical","realistic","sensible"], band:7, collocations:["pragmatic approach","pragmatic solution","highly pragmatic"] },
  { w:"Ambiguous", p:"/æmˈbɪɡ.ju.əs/", d:"Open to more than one interpretation; not having one obvious meaning", e:"The wording of the agreement was ambiguous and led to confusion.", s:["equivocal","unclear","vague"], band:7, collocations:["highly ambiguous","remain ambiguous","deliberately ambiguous"] },
  { w:"Empirical", p:"/ɪmˈpɪr.ɪ.kəl/", d:"Based on, concerned with, or verifiable by observation or experience", e:"There is no empirical evidence to support his claims.", s:["observed","factual","experimental"], band:8, collocations:["empirical evidence","empirical research","empirical study"] },
  { w:"Intrinsic", p:"/ɪnˈtrɪn.zɪk/", d:"Belonging naturally; essential", e:"Access to arts is an intrinsic part of a well-rounded education.", s:["inherent","innate","fundamental"], band:8, collocations:["intrinsic value","intrinsic nature","intrinsic motivation"] },
  { w:"Profound", p:"/prəˈfaʊnd/", d:"Very great or intense; having or showing great knowledge", e:"The invention of the internet had a profound impact on society.", s:["deep","intense","significant"], band:7, collocations:["profound impact","profound effect","profound understanding"] },
  { w:"Lucrative", p:"/ˈluː.krə.tɪv/", d:"Producing a great deal of profit", e:"Many graduates are drawn to lucrative careers in finance and tech.", s:["profitable","rewarding","well-paid"], band:7, collocations:["lucrative market","lucrative business","highly lucrative"] },
  { w:"Resilient", p:"/rɪˈzɪl.i.ənt/", d:"Able to withstand or recover quickly from difficult conditions", e:"The local economy proved to be remarkably resilient during the crisis.", s:["tough","robust","adaptable"], band:7, collocations:["highly resilient","resilient economy","resilient materials"] },
  { w:"Deterrent", p:"/dɪˈter.ənt/", d:"A thing that discourages or is intended to discourage someone from doing something", e:"Strict fines act as an effective deterrent against speeding.", s:["disincentive","discouragement","obstacle"], band:7, collocations:["effective deterrent","act as a deterrent","nuclear deterrent"] },
  { w:"Feasible", p:"/ˈfiː.zə.bəl/", d:"Possible to do easily or conveniently", e:"It is not commercially feasible to extract the minerals from this site.", s:["practicable","viable","achievable"], band:7, collocations:["commercially feasible","economically feasible","perfectly feasible"] },
  { w:"Inevitable", p:"/ɪˈnev.ɪ.tə.bəl/", d:"Certain to happen; unavoidable", e:"With more cars on the road, traffic congestion is inevitable.", s:["unavoidable","inescapable","certain"], band:7, collocations:["almost inevitable","seem inevitable","inevitable consequence"] },
  { w:"Plausible", p:"/ˈplɔː.zə.bəl/", d:"Seeming reasonable or probable", e:"The theory provides a plausible explanation for the sudden climate shift.", s:["credible","reasonable","believable"], band:8, collocations:["plausible explanation","plausible excuse","perfectly plausible"] },
  { w:"Scrutinise", p:"/ˈskruː.tɪ.naɪz/", d:"Examine or inspect closely and thoroughly", e:"The government's spending plans will be closely scrutinised by the committee.", s:["examine","inspect","analyze"], band:8, collocations:["closely scrutinise","carefully scrutinise","scrutinise the details"] },
  { w:"Tentative", p:"/ˈten.tə.tɪv/", d:"Not certain or fixed; provisional", e:"They have reached a tentative agreement, pending final approval.", s:["provisional","unconfirmed","hesitant"], band:7, collocations:["tentative agreement","tentative steps","tentative conclusion"] },
  { w:"Viable", p:"/ˈvaɪ.ə.bəl/", d:"Capable of working successfully; feasible", e:"Solar power is now a commercially viable alternative to fossil fuels.", s:["feasible","workable","practicable"], band:7, collocations:["commercially viable","economically viable","viable alternative"] },
  { w:"Vulnerable", p:"/ˈvʌl.nər.ə.bəl/", d:"Susceptible to physical or emotional attack or harm", e:"Older people are especially vulnerable to cold temperatures.", s:["susceptible","defenseless","exposed"], band:7, collocations:["highly vulnerable","vulnerable to","vulnerable groups"] },
  { w:"Adequate", p:"/ˈæd.ə.kwət/", d:"Satisfactory or acceptable in quality or quantity", e:"The school did not have adequate resources to support children with special needs.", s:["sufficient","enough","satisfactory"], band:6, collocations:["adequate resources","adequate preparation","perfectly adequate"] },
  { w:"Comprehensive", p:"/ˌkɒm.prɪˈhen.sɪv/", d:"Complete and including everything that is necessary", e:"The government has published a comprehensive review of the healthcare system.", s:["thorough","complete","exhaustive"], band:7, collocations:["comprehensive review","comprehensive guide","comprehensive approach"] },
  { w:"Discrepancy", p:"/dɪˈskrep.ən.si/", d:"A lack of compatibility or similarity between two or more facts", e:"There is a significant discrepancy between the two sets of figures.", s:["inconsistency","difference","variance"], band:8, collocations:["significant discrepancy","explain the discrepancy","discrepancy between"] },
  { w:"Elicit", p:"/iˈlɪs.ɪt/", d:"Evoke or draw out a response, answer, or fact from someone", e:"The questionnaire was designed to elicit detailed responses from participants.", s:["evoke","extract","obtain"], band:8, collocations:["elicit a response","elicit information","elicit support"] },
  { w:"Fluctuate", p:"/ˈflʌk.tʃu.eɪt/", d:"Rise and fall irregularly in number or amount", e:"Vegetable prices fluctuate according to the season.", s:["vary","change","oscillate"], band:7, collocations:["fluctuate wildly","fluctuate significantly","tend to fluctuate"] },
  { w:"Inherent", p:"/ɪnˈher.ənt/", d:"Existing in something as a permanent, essential, or characteristic attribute", e:"There are inherent risks in any surgical procedure.", s:["intrinsic","innate","fundamental"], band:7, collocations:["inherent risk","inherent weakness","inherent nature"] },
  { w:"Marginal", p:"/ˈmɑː.dʒɪ.nəl/", d:"Minor and not important; not central", e:"The new tax will have only a marginal effect on most people's incomes.", s:["slight","small","insignificant"], band:7, collocations:["marginal effect","marginal increase","marginal difference"] },
  { w:"Prevalent", p:"/ˈprev.əl.ənt/", d:"Widespread in a particular area or at a particular time", e:"These diseases are more prevalent among young children.", s:["widespread","common","frequent"], band:7, collocations:["highly prevalent","become prevalent","prevalent among"] },
  { w:"Redundant", p:"/rɪˈdʌn.dənt/", d:"Not or no longer needed or useful; superfluous", e:"Many of the old skills have become redundant in the modern workplace.", s:["unnecessary","superfluous","obsolete"], band:7, collocations:["become redundant","make redundant","largely redundant"] },
  { w:"Subsequent", p:"/ˈsʌb.sɪ.kwənt/", d:"Coming after something in time; following", e:"The theory was developed further in subsequent publications.", s:["following","ensuing","succeeding"], band:6, collocations:["subsequent events","subsequent years","subsequent to"] }
];

export const READING_TOPICS = ["urban agriculture","quantum computing","mass migration","dark matter","microplastics"];
export const LISTENING_CONTEXTS = [
  { s:1, ctx:"university enrolment office", speakers:"student and administrator" },
  { s:3, ctx:"seminar on climate policy", speakers:"two postgraduate students and their supervisor" },
];
export const T2_TYPES = [
  { type:"Discussion + Opinion", tip1:"Present both sides before giving your view", tip2:"Use: 'Proponents argue… However, critics contend…'", tip3:"State opinion clearly in intro AND conclusion" },
  { type:"Opinion Essay", tip1:"Commit to a clear position from the first sentence", tip2:"Acknowledge the opposing view and refute it", tip3:"Avoid sitting on the fence" },
  { type:"Causes & Solutions", tip1:"Dedicate one body paragraph to causes, one to solutions", tip2:"Ensure solutions directly address the causes mentioned", tip3:"Use language of cause and effect clearly" },
  { type:"Problem & Solution", tip1:"Identify specific problems, not general ones", tip2:"Propose realistic, actionable solutions", tip3:"Use linking words to connect problems to solutions" },
  { type:"Advantages & Disadvantages", tip1:"Maintain a balanced structure", tip2:"Use concession clauses (e.g., 'While X is true, Y...')", tip3:"Give a clear overall assessment in the conclusion" },
  { type:"Two-part Question", tip1:"Answer both questions equally", tip2:"Dedicate one body paragraph to each question", tip3:"Summarise both answers in the conclusion" }
];
export const SPEAKING_P1_TOPICS = ["travel","music","cooking","sport","the environment"];
export const SPEAKING_P3_THEMES = ["globalisation","environmental responsibility","the future of work","digital society"];
