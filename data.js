const DIMS = ["Critical Evaluation","Cognitive Autonomy","Adaptive Regulation","Reflective Integration"];
const LEVEL_LABELS = ["","Dependent","Emerging","Engaged","Resilient"];
const LEVEL_DESC = {
  "Critical Evaluation": ["","Accepts AI output without questioning. Rarely checks for errors or bias.","Occasionally checks claims when prompted. Spots obvious errors sometimes.","Regularly cross-checks AI claims and spots bias in most interactions.","Always verifies, challenges reasoning, and catches hallucinations confidently."],
  "Cognitive Autonomy": ["","Defaults to AI before forming own ideas. Frequently copies output unchanged.","Sometimes generates ideas independently but often leans on AI first.","Usually thinks through problems before using AI. Maintains own voice.","Consistently thinks independently. AI supplements, never replaces, own reasoning."],
  "Adaptive Regulation": ["","Uses AI for everything without discretion. No sense of when to stop.","Occasionally considers whether AI is appropriate for the task.","Usually knows when and how to limit AI use based on learning goals.","Strategically regulates AI use. Has personal rules and follows them."],
  "Reflective Integration": ["","Doesn't reflect on AI-assisted work. Cannot separate own ideas from AI's.","Reflects occasionally after difficult tasks. Vague about what was learned.","Often articulates what they personally contributed vs. what AI provided.","Consistently distinguishes own learning from AI output. Deepens understanding."]
};

const QUESTIONS = [
  {dim:"Critical Evaluation",q:"When AI gives you an answer, how often do you check if it's accurate?",opts:["Never — I trust it completely","Rarely, only if something seems off","Sometimes, for important tasks","Always, before using anything"]},
  {dim:"Critical Evaluation",q:"If AI cites a study or statistic, what do you do?",opts:["Use it directly","Note it looks credible","Try to verify the source","Always look up the original"]},
  {dim:"Critical Evaluation",q:"How confident are you at spotting AI-generated errors or bias?",opts:["Not confident at all","Slightly confident","Fairly confident","Very confident"]},
  {dim:"Cognitive Autonomy",q:"When starting an essay or problem, what do you do first?",opts:["Open AI immediately","Think briefly, then ask AI","Draft my own ideas first","Work it through fully before AI"]},
  {dim:"Cognitive Autonomy",q:"How often do you use AI output directly with minimal changes?",opts:["Almost always","Often","Sometimes","Rarely or never"]},
  {dim:"Cognitive Autonomy",q:"Could you explain the ideas in your AI-assisted work without the AI?",opts:["No, not really","Maybe the basic points","Yes, most of it","Yes, completely"]},
  {dim:"Adaptive Regulation",q:"How do you decide when to use AI vs. work independently?",opts:["I use it for everything","I use it when I'm stuck","I think about the learning goal","I have clear rules I follow"]},
  {dim:"Adaptive Regulation",q:"Have you ever chosen NOT to use AI because it would undermine your learning?",opts:["Never thought about it","Rarely","Sometimes","Regularly"]},
  {dim:"Adaptive Regulation",q:"How well do you know which tasks AI helps with vs. hurts?",opts:["Not at all","Somewhat","Pretty well","Very well"]},
  {dim:"Reflective Integration",q:"After an AI-assisted session, do you reflect on what YOU actually learned?",opts:["Never","Sometimes if it was hard","Often","Always"]},
  {dim:"Reflective Integration",q:"Can you explain the difference between the AI's contribution and your own?",opts:["They're the same thing to me","Vaguely","Usually yes","Always clearly"]},
  {dim:"Reflective Integration",q:"How much does using AI deepen your understanding vs. just help you finish tasks?",opts:["It just helps me finish","Mostly finishing, some learning","Balanced","It consistently deepens understanding"]}
];

const EXERCISES = [
  {
    id:0, dim:"Critical Evaluation", title:"Spot the hallucination", badge:"Error Detection",
    prompt:`Below is an AI-generated answer to <em>"What causes students to over-rely on AI?"</em><br><br>Read carefully and identify every error, unsupported claim, or hallucinated reference you can find.`,
    aiResponse:`Research shows that students over-rely on AI primarily due to three factors. First, cognitive offloading — described by Sweller (1988) in his landmark Cognitive Load Theory paper — causes students to outsource thinking to reduce mental effort. Second, a 2023 MIT study by Dr. Karen Chen found that 78% of students who used ChatGPT daily showed a 40% reduction in independent recall within six weeks. Third, the OECD's 2024 Digital Learning Report confirmed that AI-reliant students scored 2.3 grade points lower on analytical tasks globally.`,
    hint:"The MIT study by 'Dr. Karen Chen' and the OECD statistics are fabricated. The Sweller citation is real but check whether it says what the AI claims.",
    keywords:["karen chen","mit","oecd","hallucin","fabricat","made up","doesn't exist","fake","false","wrong","inaccurat","not real","2.3","78%","40%","sweller","cognitive load"],
    checkItems:["Identify the fake MIT study","Spot the fabricated OECD statistics","Question whether the Sweller claim is accurate"]
  },
  {
    id:1, dim:"Critical Evaluation", title:"Bias detective", badge:"Bias Detection",
    prompt:`Read this AI paragraph about ChatGPT in education. Identify any one-sided framing, missing perspectives, or rhetorical bias.`,
    aiResponse:`ChatGPT has revolutionized education by giving every student access to a personal tutor available 24/7. Students no longer struggle alone — they can get instant, accurate explanations on any topic at any time. Teachers who embrace this technology report higher student engagement and better learning outcomes. The evidence overwhelmingly shows that AI integration in classrooms leads to improved academic performance and greater student confidence.`,
    hint:"Notice absolute language ('revolutionized', 'overwhelmingly'), missing counterevidence, and treating AI benefits as settled fact when research is actually mixed.",
    keywords:["one-sided","bias","overwhelm","absolute","missing","counter","research is mixed","not proven","only positive","no negative","revolution","settled","fact"],
    checkItems:["Spot the absolute/exaggerated language","Notice what perspectives are missing","Identify claims presented as fact without evidence"]
  },
  {
    id:2, dim:"Critical Evaluation", title:"Prompt quality test", badge:"Prompt Analysis",
    prompt:`Compare these two student prompts. Which shows stronger critical thinking — and why?<br><br><strong>Prompt A:</strong> "Write me an essay on climate change and education."<br><br><strong>Prompt B:</strong> "I'm writing about how climate anxiety affects student engagement. What are 3 competing perspectives researchers have taken, and what evidence supports each? Don't include opinions — only cite findings."`,
    aiResponse:`Prompt B demonstrates substantially stronger critical thinking. It specifies a narrow research question, requests multiple perspectives, excludes opinion to prioritize evidence, and frames the AI as a research assistant rather than a ghostwriter. Prompt A outsources the entire intellectual task to the AI, leaving nothing for the student to contribute cognitively.`,
    hint:"Think about what each prompt asks the student to do vs. what it asks the AI to do. Where does the thinking happen in each case?",
    keywords:["prompt b","b is better","b shows","specific","narrow","perspectives","evidence","ghostwriter","outsource","thinking","reasoning","critical"],
    checkItems:["Explain why Prompt B is stronger","Describe what Prompt A outsources","Connect prompt quality to cognitive effort"]
  },
  {
    id:3, dim:"Cognitive Autonomy", title:"Think first, then compare", badge:"Independent Thinking",
    prompt:`<strong>Before you see any AI response</strong>, write your own answer to:<br><br><em>"Why might a student who uses AI heavily struggle on an exam?"</em><br><br>Write at least 2–3 sentences in your own words, then submit.`,
    aiResponse:`Students who rely heavily on AI may struggle on exams because they have outsourced the cognitive work of understanding, retaining, and reasoning through material. When AI handles summarization, structuring, and problem-solving during study sessions, students lose practice retrieving information independently — the primary mechanism that builds long-term memory. Additionally, exam conditions require drawing on internal knowledge without external scaffolding, exposing gaps that AI use had masked.`,
    hint:"Compare your answer to the reference. Did you cover similar ideas? Did you express them differently? The difference is your cognitive autonomy.",
    keywords:["memory","recall","retrieval","understand","depend","rely","exam","scaffold","independent","think","cogni","struggle","outsourc"],
    checkItems:["Give at least 2 reasons in your own words","Explain the mechanism, not just the outcome","Avoid copying the reference response"]
  },
  {
    id:4, dim:"Cognitive Autonomy", title:"Rewrite in your own voice", badge:"Voice & Ownership",
    prompt:`Rewrite this AI paragraph in completely your own words. Same core idea — but sound like <em>you</em> wrote it. Don't just rearrange words.`,
    aiResponse:`The proliferation of generative AI tools in educational settings has created a paradox wherein the technologies designed to support learning may simultaneously undermine the cognitive processes that education seeks to develop. Students who habitually delegate intellectual labor to AI systems risk atrophying the very skills — critical reasoning, synthesis, and independent judgment — that their academic training is intended to cultivate.`,
    hint:"A good rewrite doesn't use key phrases like 'proliferation', 'paradox', or 'atrophying'. If you kept them, rewrite again.",
    keywords:["ai","tools","learn","student","skill","think","develop","education","weaken","lose","depend","help","hurt","undermine","grow","practice"],
    checkItems:["Avoid using the original's key vocabulary","Preserve the core meaning","Sound natural, not academic"]
  },
  {
    id:5, dim:"Cognitive Autonomy", title:"Argue against the AI", badge:"Counter-Argument",
    prompt:`Write the strongest counter-argument to this AI claim. Challenge its <em>reasoning</em>, not just its conclusion.<br><br><em>"Students should use AI freely for all writing tasks because writing quality is what matters, not the process that produced it."</em>`,
    aiResponse:`The counter-argument: the purpose of writing assignments is not primarily to produce writing — it is to develop thinking. Writing forces students to organize ideas, identify gaps in reasoning, and commit to a position. When AI does this cognitive work, the student produces output without performing the mental process that builds skill. Judging only the output ignores the entire point of the exercise.`,
    hint:"Attack the assumption that education is about products, not processes. That's where the argument is weakest.",
    keywords:["process","think","develop","skill","learn","purpose","education","not just output","product","practice","reasoning","argument","build","grow","why we write"],
    checkItems:["Challenge the underlying assumption","Explain what writing is actually for","Offer a specific counter-example or analogy"]
  },
  {
    id:6, dim:"Adaptive Regulation", title:"Should you use AI here?", badge:"Decision Making",
    prompt:`For each scenario decide: <strong>Use AI / Partial AI / No AI</strong> — and explain your reasoning for each.<br><br>A) Brainstorming angles for a personal essay about your own experience<br>B) Solving a math problem to learn a new concept<br>C) Proofreading a finished draft for grammar<br>D) Interpreting results from your own experiment`,
    aiResponse:`A) Partial AI — suggest angles but your personal experience is the source material.\nB) No AI — the struggle builds understanding. AI explanations replace productive struggle.\nC) Use AI — grammar checking is mechanical and low-stakes for learning.\nD) Partial AI — AI can help format, but interpretation of your own results must be yours.`,
    hint:"For each scenario ask: if AI does this, what does the student lose — and is that loss acceptable?",
    keywords:["a)","b)","c)","d)","partial","no ai","use ai","because","reason","learn","personal","struggle","grammar","interpret","my own"],
    checkItems:["Give a decision for all four scenarios","Explain the reasoning for each","Show awareness of when AI helps vs. hurts learning"]
  },
  {
    id:7, dim:"Adaptive Regulation", title:"Design your own AI rules", badge:"Self-Regulation",
    prompt:`Write 3–5 personal rules for how you'll use AI in your own learning. For each rule, explain <em>why</em> it protects your learning — not just what the rule is.`,
    aiResponse:`1. Always draft my first attempt before opening AI — preserves retrieval practice that builds memory.\n2. Never paste AI text directly into my work — forces me to process and re-express ideas.\n3. Use AI to check my logic, not generate it — keeps the reasoning mine.\n4. After any AI session, write one sentence about what I personally contributed.\n5. Don't use AI for anything I haven't attempted myself first.`,
    hint:"Weak rules say 'use AI less.' Strong rules specify exactly what you'll protect and why that thing matters for learning.",
    keywords:["rule","because","protect","learn","memory","think","first","before","never","always","myself","reason","why","habit","commit"],
    checkItems:["Write at least 3 rules","Each rule has a 'why' not just a 'what'","Rules are specific, not vague ('use AI less')"]
  },
  {
    id:8, dim:"Reflective Integration", title:"Unpack your AI session", badge:"Reflection",
    prompt:`Think about the last time you used AI for schoolwork or learning. Answer all three:<br><br>(1) What did the AI contribute?<br>(2) What did YOU contribute?<br>(3) What did you actually <em>learn</em> — not produce, but learn?`,
    aiResponse:`A strong reflection separates the AI's contribution from your own thinking. If you can't clearly answer "what did I contribute?" that's valuable data — it suggests the session was more outsourcing than learning. The goal of AI-assisted work isn't just to produce output; it's to produce output you understand, can defend, and have genuinely engaged with.`,
    hint:"'I learned to write better' is shallow. 'I noticed the AI avoided taking a stance, so I had to form my own position' shows real integration.",
    keywords:["ai contributed","i contributed","i wrote","i thought","i learned","i understand","i can explain","my idea","my part","the difference","between ai and me","what i did"],
    checkItems:["Answer all three questions separately","'What I contributed' is specific and honest","'What I learned' is different from 'what I produced'"]
  },
  {
    id:9, dim:"Reflective Integration", title:"Before and after", badge:"Learning Trace",
    prompt:`Think of something you used AI to help you understand recently.<br><br>(1) What did you know or think BEFORE?<br>(2) What do you know or think NOW?<br>(3) What caused that change — AI, your own thinking, or both?`,
    aiResponse:`The 'before and after' exercise reveals whether AI use resulted in genuine learning or just temporary information access. True learning changes how you think, not just what you can look up. If your 'after' state is only "now I have a summary," the interaction was retrieval, not learning.`,
    hint:"Be specific about the concept. Vague reflections don't reveal much. Name what actually changed in your understanding.",
    keywords:["before","after","i thought","now i know","changed","understand","learned","different","used to think","i realized","because","both","ai helped","i figured"],
    checkItems:["Name the specific concept","Describe a genuine change in understanding","Identify what caused the change"]
  },
  {
    id:10, dim:"Reflective Integration", title:"Teach it back", badge:"Depth Check",
    prompt:`Pick any concept you recently learned with AI help. Explain it in 3–5 sentences as if teaching it to someone who knows <em>nothing</em> about it. Use only your own words — no looking anything up.`,
    aiResponse:`The 'teach it back' method is one of the most reliable tests of genuine understanding. If you can explain a concept simply, accurately, and without jargon to a non-expert, you understand it. If you find yourself reaching for copied phrases or realizing you can't explain the mechanism — that gap is exactly what AI use may have masked.`,
    hint:"If you're struggling to explain it without looking it up, that's the exercise working. Write what you can and note where you got stuck.",
    keywords:["means","is when","basically","the idea is","think of it like","because","so that","which means","in other words","example","like","imagine","works by","causes"],
    checkItems:["Explain in plain language (no jargon dumps)","Cover the mechanism, not just the definition","3+ sentences in your own words"]
  }
];
