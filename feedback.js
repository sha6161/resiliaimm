// ===== SMART FEEDBACK ENGINE (no API required) =====
// Analyzes student responses using keyword detection, length, structure,
// and exercise-specific rubrics to generate meaningful, specific feedback.

function analyzResponse(exerciseId, userText) {
  const ex = EXERCISES.find(e => e.id === exerciseId);
  const text = userText.toLowerCase().trim();
  const wordCount = userText.trim().split(/\s+/).filter(Boolean).length;
  const sentences = userText.split(/[.!?]+/).filter(s => s.trim().length > 5).length;

  // ---- baseline checks ----
  if (wordCount < 10) return { score: 0, quality: 'weak', title: 'Too short', summary: 'Your response is too brief to evaluate. Write at least 2–3 sentences engaging with the exercise.', checks: [], nextStep: 'Go back and write a full response before submitting.' };
  if (wordCount < 25) return { score: 1, quality: 'weak', title: 'Needs more depth', summary: 'Your response is a start, but it needs more development. The exercise requires you to reason through ideas, not just state them.', checks: [], nextStep: 'Expand your answer with at least one explanation of why, not just what.' };

  // ---- keyword hit rate ----
  const keywords = ex.keywords || [];
  const hits = keywords.filter(kw => text.includes(kw.toLowerCase()));
  const hitRate = keywords.length > 0 ? hits.length / keywords.length : 0.5;

  // ---- exercise-specific rubric ----
  const rubric = getRubric(exerciseId, text, wordCount, sentences, hitRate);

  return rubric;
}

function getRubric(id, text, wordCount, sentences, hitRate) {
  const ex = EXERCISES.find(e => e.id === id);
  const checks = ex.checkItems || [];

  // score each check item by detecting relevant content
  const checkResults = checks.map(item => {
    // rough heuristic: does the response contain thematic content for this check?
    const relevant = hitRate > 0.15 || wordCount > 60;
    return { label: item, passed: relevant };
  });

  // ---- per-exercise logic ----
  switch(id) {

    case 0: { // Spot the hallucination
      const foundMIT = text.includes('karen') || text.includes('mit') || text.includes('78') || text.includes('40%');
      const foundOECD = text.includes('oecd') || text.includes('2.3') || text.includes('grade point');
      const foundSweller = text.includes('sweller') || text.includes('cognitive load');
      const count = [foundMIT, foundOECD, foundSweller].filter(Boolean).length;
      checkResults[0].passed = foundMIT;
      checkResults[1].passed = foundOECD;
      checkResults[2].passed = foundSweller;
      if (count === 3) return { score: 4, quality: 'good', title: 'Excellent — all three caught', summary: `You identified all three problems: the fabricated MIT study, the invented OECD statistics, and questioned the Sweller citation. This is exactly what critical evaluation looks like — checking specific claims, not just accepting the overall argument.`, checks: checkResults, nextStep: 'Next level: practice checking citations in papers you actually want to use.' };
      if (count === 2) return { score: 3, quality: 'good', title: 'Good — two issues found', summary: `You caught ${foundMIT?'the MIT study':''}${foundMIT&&foundOECD?' and ':''}${foundOECD?'the OECD statistics':''}${foundSweller?'the Sweller framing':''}. The one you missed is still there — go back and look at each factual claim individually.`, checks: checkResults, nextStep: 'Try fact-checking the claim you missed. What would you search to verify it?' };
      if (count === 1) return { score: 2, quality: 'warn', title: 'Partial — keep looking', summary: `You caught one issue, which shows you're reading critically. But there are two more fabricated or misleading claims in that paragraph. Read each sentence in isolation and ask: could I verify this?`, checks: checkResults, nextStep: 'Re-read the paragraph sentence by sentence. Check every number and citation separately.' };
      return { score: 1, quality: 'weak', title: 'No specific errors identified', summary: `Your response didn't pinpoint specific errors in the text. Saying something "seems wrong" isn't critical evaluation — you need to identify which specific claim is fabricated and why.`, checks: checkResults, nextStep: 'Start with the statistics. Can you find a 2023 MIT study by Dr. Karen Chen on AI and student recall?' };
    }

    case 1: { // Bias detective
      const foundAbsolute = text.includes('overwhelm') || text.includes('revolution') || text.includes('absolute') || text.includes('always') || text.includes('never') || text.includes('all teacher');
      const foundMissing = text.includes('missing') || text.includes('counter') || text.includes('other side') || text.includes('downside') || text.includes('negative') || text.includes('criticism') || text.includes('concern');
      const foundFact = text.includes('evidence') || text.includes('research') || text.includes('study') || text.includes('proof') || text.includes('settled') || text.includes('fact') || text.includes('mixed');
      const count = [foundAbsolute, foundMissing, foundFact].filter(Boolean).length;
      checkResults[0].passed = foundAbsolute;
      checkResults[1].passed = foundMissing;
      checkResults[2].passed = foundFact;
      if (count >= 2) return { score: 4, quality: 'good', title: 'Sharp bias analysis', summary: `You correctly identified the rhetorical tactics: exaggerated language, missing counterevidence, and unsubstantiated claims treated as fact. This is the skill that protects you from being misled by AI-generated content that sounds confident.`, checks: checkResults, nextStep: 'Apply this same lens to the next AI response you use for real work.' };
      if (count === 1) return { score: 2, quality: 'warn', title: 'Partial detection', summary: `You caught one type of bias but missed others. The paragraph uses three distinct rhetorical moves to obscure its one-sidedness. Look at word choice, what's left out, and whether claims have evidence.`, checks: checkResults, nextStep: 'Re-read and highlight every adjective and adverb. Ask: is this a fact or a framing choice?' };
      return { score: 1, quality: 'weak', title: 'Bias not clearly identified', summary: `Your response didn't pinpoint specific bias techniques. Saying the paragraph is "positive" isn't analysis — identify which exact words, claims, or omissions create the one-sided effect.`, checks: checkResults, nextStep: 'Start by highlighting the words "revolutionized" and "overwhelmingly." What do these words do to the reader?' };
    }

    case 2: { // Prompt quality
      const favoursB = text.includes('b') && (text.includes('better') || text.includes('stronger') || text.includes('specific') || text.includes('narrow') || text.includes('evidence') || text.includes('perspective'));
      const explainWhy = text.includes('because') || text.includes('since') || text.includes('as it') || text.includes('which means') || text.includes('this means');
      const mentionsCognition = text.includes('think') || text.includes('outsourc') || text.includes('effort') || text.includes('cognitive') || text.includes('reason') || text.includes('ghostwrit');
      checkResults[0].passed = favoursB;
      checkResults[1].passed = explainWhy && mentionsCognition;
      checkResults[2].passed = mentionsCognition;
      if (favoursB && explainWhy && mentionsCognition) return { score: 4, quality: 'good', title: 'Strong analysis', summary: `You correctly identified that Prompt B shows stronger critical thinking and explained why — the student retains the cognitive work. You also connected prompt quality to learning outcomes, which is the deeper insight here.`, checks: checkResults, nextStep: 'Now write your own Prompt B-style version of the last AI query you made for school.' };
      if (favoursB && explainWhy) return { score: 3, quality: 'good', title: 'Good — needs the cognitive connection', summary: `You correctly chose B and gave reasons. To go deeper: explain what Prompt A actually asks the student to do cognitively (almost nothing), vs. what Prompt B requires the student to contribute.`, checks: checkResults, nextStep: 'Ask yourself: in Prompt A, where does the thinking happen — with the student or the AI?' };
      return { score: 2, quality: 'warn', title: 'Direction right, reasoning thin', summary: `Your response identifies a preference but doesn't fully analyze why. The key question is what each prompt asks the student to contribute — that's what connects prompt quality to learning quality.`, checks: checkResults, nextStep: 'Try analyzing Prompt A by listing what the AI does vs. what the student does.' };
    }

    case 3: { // Think first
      const hasReasoning = text.includes('because') || text.includes('since') || text.includes('when') || text.includes('if') || text.includes('means');
      const coversMemory = text.includes('memory') || text.includes('recall') || text.includes('remember') || text.includes('retain') || text.includes('retriev');
      const coversDependency = text.includes('depend') || text.includes('rely') || text.includes('without') || text.includes('scaffold') || text.includes('exam') || text.includes('no ai') || text.includes('on your own');
      const originalVoice = wordCount > 40 && sentences >= 2;
      checkResults[0].passed = coversMemory || coversDependency;
      checkResults[1].passed = hasReasoning;
      checkResults[2].passed = originalVoice;
      if (coversMemory && coversDependency && hasReasoning) return { score: 4, quality: 'good', title: 'Solid independent thinking', summary: `Good — you explained both the memory/retrieval problem and the exam-dependency trap. The fact that you wrote this before seeing the reference means this reasoning is genuinely yours. That's what cognitive autonomy looks like in practice.`, checks: checkResults, nextStep: 'Compare your answer to the reference. Where did you overlap? Where were you more or less specific?' };
      if ((coversMemory || coversDependency) && hasReasoning) return { score: 3, quality: 'good', title: 'Good reasoning, room to expand', summary: `You covered one key reason with reasoning behind it. There's at least one more mechanism worth exploring — think about what exams specifically demand that AI use during studying doesn't practice.`, checks: checkResults, nextStep: 'Add one more reason. What does exam pressure specifically expose that everyday AI use hides?' };
      if (wordCount > 40) return { score: 2, quality: 'warn', title: 'Ideas present, reasoning thin', summary: `You gave an answer but without much causal reasoning. "They rely on AI so they can't do it alone" describes the problem but doesn't explain the mechanism. What specifically gets lost when you outsource thinking?`, checks: checkResults, nextStep: 'Add "because" after your main claim and force yourself to explain the mechanism.' };
      return { score: 1, quality: 'weak', title: 'Too brief to evaluate independent thinking', summary: `A 2-sentence minimum was requested because it forces you to develop reasoning, not just state a conclusion. The point of this exercise is the process of thinking it through yourself.`, checks: checkResults, nextStep: 'Write at least 2–3 sentences. Start with "Students who use AI heavily struggle on exams because..."' };
    }

    case 4: { // Rewrite in own voice
      const originalPhrases = ['proliferation','paradox','wherein','simultaneously','habitually','delegate','intellectual labor','atrophying','cultivate'];
      const keptPhrases = originalPhrases.filter(p => text.includes(p.toLowerCase()));
      const isGenuinelyRewritten = keptPhrases.length <= 1 && wordCount > 25;
      const hasSubstance = wordCount > 40;
      checkResults[0].passed = keptPhrases.length === 0;
      checkResults[1].passed = hasSubstance;
      checkResults[2].passed = isGenuinelyRewritten;
      if (keptPhrases.length === 0 && hasSubstance) return { score: 4, quality: 'good', title: 'Genuinely rewritten', summary: `You didn't borrow any of the original's vocabulary, which means you processed the idea and re-expressed it — that's real cognitive ownership. The ability to paraphrase accurately without copying is one of the most important academic skills there is.`, checks: checkResults, nextStep: 'Try this with an AI response you actually used recently — can you rewrite it without looking at it?' };
      if (keptPhrases.length <= 2 && hasSubstance) return { score: 3, quality: 'good', title: 'Mostly rewritten', summary: `Good effort. You kept ${keptPhrases.length > 0 ? `"${keptPhrases.join('", "')}"` : 'some phrasing'} from the original. These small carries can indicate you understood the word but didn't fully process the idea underneath it.`, checks: checkResults, nextStep: 'Replace the borrowed phrase(s) with completely different wording. Can you explain the same idea using a different angle?' };
      if (keptPhrases.length > 3) return { score: 1, quality: 'weak', title: 'Too close to the original', summary: `You kept ${keptPhrases.length} phrases from the original: "${keptPhrases.slice(0,3).join('", "')}". This is paraphrasing by rearranging, not genuinely rewriting. The exercise is asking you to process the idea and re-express it from scratch.`, checks: checkResults, nextStep: 'Close the original, wait 30 seconds, then explain the idea to yourself out loud — then write that.' };
      return { score: 2, quality: 'warn', title: 'Partial rewrite', summary: `Some original phrasing remains. The test of a genuine rewrite: would someone who hadn't seen the original recognize this as your natural writing voice? If not, you still have some processing to do.`, checks: checkResults, nextStep: 'Read your version aloud. Does it sound like you, or does it sound like academic AI text?' };
    }

    case 5: { // Argue against AI
      const attacksAssumption = text.includes('process') || text.includes('purpose') || text.includes('point of') || text.includes('education is') || text.includes('not just') || text.includes('about more than') || text.includes('why we');
      const hasExample = text.includes('example') || text.includes('like') || text.includes('analogy') || text.includes('imagine') || text.includes('just as') || text.includes('similar to') || text.includes('same as');
      const hasReasoning = text.includes('because') || text.includes('therefore') || text.includes('means that') || text.includes('this shows') || text.includes('if') || text.includes('when');
      checkResults[0].passed = attacksAssumption;
      checkResults[1].passed = hasReasoning;
      checkResults[2].passed = hasExample;
      if (attacksAssumption && hasReasoning) return { score: 4, quality: 'good', title: 'Strong counter-argument', summary: `You attacked the right assumption — that education is about output quality rather than the process of developing thinking. This is exactly where the AI's argument is weakest. If you also used an analogy or example, that's excellent rhetorical technique.`, checks: checkResults, nextStep: 'Now steelman the AI\'s argument — what\'s the best version of it? Then counter that.' };
      if (hasReasoning && wordCount > 60) return { score: 3, quality: 'good', title: 'Good reasoning, stronger target needed', summary: `You gave a reasoned response, but check whether you attacked the core assumption (that output quality is all that matters) or just said "process matters." The goal is to expose why that assumption is wrong, not just assert that it is.`, checks: checkResults, nextStep: 'Ask: what does the AI\'s argument assume about the purpose of education? Attack that assumption specifically.' };
      return { score: 2, quality: 'warn', title: 'Counter-claim without argument', summary: `You disagreed with the AI but didn't build a full argument. Counter-arguments need reasoning — why is the AI wrong? What assumption are they making? What evidence or logic undermines their position?`, checks: checkResults, nextStep: 'Start with: "The AI\'s argument assumes X, but this is wrong because Y."' };
    }

    case 6: { // Should you use AI
      const hasAllFour = (text.includes('a)') || text.includes('scenario a') || text.match(/^a[:\.]|\ba\)/im)) &&
                         (text.includes('b)') || text.includes('scenario b') || text.match(/^b[:\.]|\bb\)/im)) &&
                         (text.includes('c)') || text.includes('scenario c') || text.match(/^c[:\.]|\bc\)/im)) &&
                         (text.includes('d)') || text.includes('scenario d') || text.match(/^d[:\.]|\bd\)/im));
      const hasDecisions = (text.includes('no ai') || text.includes('partial') || text.includes('use ai') || text.includes("don't use") || text.includes('yes') || text.includes('no'));
      const hasReasoning = (text.match(/because|since|as it|would|should|helps|hurts/gi) || []).length >= 2;
      checkResults[0].passed = hasAllFour;
      checkResults[1].passed = hasDecisions;
      checkResults[2].passed = hasReasoning;
      if (hasAllFour && hasDecisions && hasReasoning) return { score: 4, quality: 'good', title: 'Thoughtful regulation decisions', summary: `You addressed all four scenarios with decisions and reasoning — that's adaptive regulation in action. Notice that the skill isn't "use AI less" but "make conscious decisions about when AI helps vs. hurts your learning."`, checks: checkResults, nextStep: 'Take your rules from this exercise and apply them to your next real AI interaction.' };
      if (hasAllFour && hasDecisions) return { score: 3, quality: 'good', title: 'Good decisions, add reasoning', summary: `You covered all four scenarios and made decisions, but the reasoning could be deeper. The point isn't which answer is "right" — it's being able to explain what learning outcome is at stake in each choice.`, checks: checkResults, nextStep: 'Go back to one scenario and add a "because" with the specific learning outcome affected.' };
      if (!hasAllFour) return { score: 2, quality: 'warn', title: 'Missing some scenarios', summary: `The exercise asks you to address all four scenarios — each tests a different judgment call. Make sure you responded to A, B, C, and D specifically, not just the exercise in general.`, checks: checkResults, nextStep: 'Address each scenario (A, B, C, D) with a clear decision and one sentence of reasoning.' };
      return { score: 1, quality: 'weak', title: 'Decisions without reasoning', summary: `Choosing "use AI" or "no AI" without reasoning is the same as following a rule without understanding it. The value of this exercise is explaining what's at stake in each decision — what would be lost if you made the wrong call?`, checks: checkResults, nextStep: 'Pick one scenario and explain specifically what learning outcome is protected by your decision.' };
    }

    case 7: { // Design your own rules
      const ruleCount = (text.match(/\d\.|rule \d|first|second|third|fourth|fifth/gi) || []).length;
      const hasWhys = (text.match(/because|so that|in order to|to protect|ensures|helps me|builds|preserves/gi) || []).length;
      const isSpecific = wordCount > 80;
      checkResults[0].passed = ruleCount >= 2 || wordCount > 100;
      checkResults[1].passed = hasWhys >= 2;
      checkResults[2].passed = isSpecific;
      if ((ruleCount >= 3 || wordCount > 120) && hasWhys >= 2) return { score: 4, quality: 'good', title: 'Strong personal rules', summary: `You wrote specific rules with real reasoning behind them. The difference between these and generic advice is that you know why each rule protects your learning — which means you'll actually follow them.`, checks: checkResults, nextStep: 'Screenshot or write these rules somewhere visible. The hardest part is keeping them when you\'re under deadline pressure.' };
      if ((ruleCount >= 2 || wordCount > 80) && hasWhys >= 1) return { score: 3, quality: 'good', title: 'Good start — add more whys', summary: `You have some rules with reasoning, but a few feel more like policies than principles. For each rule, push yourself to answer: what specific cognitive skill does this protect, and what happens if I break it?`, checks: checkResults, nextStep: 'Take your weakest rule and add a specific "because" — name the learning mechanism it protects.' };
      if (wordCount > 50 && hasWhys < 2) return { score: 2, quality: 'warn', title: 'Rules without reasons', summary: `You listed rules but the reasoning is thin. Rules without "because" are easy to abandon when you're in a hurry. The reason is what makes the rule worth keeping.`, checks: checkResults, nextStep: 'For each rule, ask yourself: what would I lose if I broke this? Write that down.' };
      return { score: 1, quality: 'weak', title: 'Too vague to be useful', summary: `Rules like "use AI responsibly" don't help in practice — they don't tell you what to do in a specific situation. Make your rules concrete enough that you could follow them right now, today.`, checks: checkResults, nextStep: 'Start over. Complete this sentence: "I will never [specific AI action] when [specific situation] because it would [specific learning harm]."' };
    }

    case 8: { // Unpack AI session
      const hasAI = text.includes('ai') || text.includes('chatgpt') || text.includes('claude') || text.includes('gemini') || text.includes('it') || text.includes('tool');
      const hasMe = text.includes('i ') || text.includes("i'") || text.includes('my ') || text.includes('myself') || text.includes('i wrote') || text.includes('i thought') || text.includes('i chose');
      const hasLearned = text.includes('learned') || text.includes('understand') || text.includes('realized') || text.includes('now i') || text.includes('i now') || text.includes('made me') || text.includes('helped me see') || text.includes('i know');
      const separates = hasAI && hasMe;
      checkResults[0].passed = separates;
      checkResults[1].passed = hasMe && wordCount > 50;
      checkResults[2].passed = hasLearned;
      if (separates && hasLearned && wordCount > 70) return { score: 4, quality: 'good', title: 'Strong reflection', summary: `You clearly separated AI's contribution from yours and articulated what you actually learned. This kind of reflection — done consistently — is what turns AI use from outsourcing into genuine learning. The habit of asking "what did I contribute?" is the core of reflective integration.`, checks: checkResults, nextStep: 'Make this a habit: one sentence of reflection after every AI session. What did I contribute? What did I learn?' };
      if (separates && wordCount > 50) return { score: 3, quality: 'good', title: 'Good separation, deepen the learning', summary: `You separated AI and your contributions well. The missing piece is clarity on what you actually learned — not what the AI produced, but what changed in your own understanding. Can you articulate that specifically?`, checks: checkResults, nextStep: 'Complete this: "Before this session I thought X. Now I think Y. The change happened because..."' };
      if (!separates) return { score: 2, quality: 'warn', title: 'Contributions not clearly separated', summary: `Reflective integration requires distinguishing between what AI did and what you did. If those feel the same, that's the problem — it means the AI contribution replaced your contribution instead of supplementing it.`, checks: checkResults, nextStep: 'Try again. Write two separate bullet points: "AI contributed:" and "I contributed:"' };
      return { score: 1, quality: 'weak', title: 'Reflection too surface-level', summary: `A strong reflection is specific: what task, what AI response, what you added, what you learned. Vague reflections like "it was helpful" don't reveal anything about your cognitive engagement.`, checks: checkResults, nextStep: 'Think of one specific AI interaction. Describe exactly what you asked, what it answered, and what you had to add yourself.' };
    }

    case 9: { // Before and after
      const hasBefore = text.includes('before') || text.includes('used to') || text.includes('thought') || text.includes('didn\'t know') || text.includes('wasn\'t sure');
      const hasAfter = text.includes('now') || text.includes('after') || text.includes('understand') || text.includes('learned') || text.includes('realize') || text.includes('see');
      const hasCause = text.includes('because') || text.includes('ai') || text.includes('both') || text.includes('myself') || text.includes('thinking') || text.includes('worked out');
      const hasSpecific = wordCount > 60;
      checkResults[0].passed = hasSpecific;
      checkResults[1].passed = hasBefore && hasAfter;
      checkResults[2].passed = hasCause;
      if (hasBefore && hasAfter && hasCause && hasSpecific) return { score: 4, quality: 'good', title: 'Clear learning trace', summary: `You traced a genuine change in understanding — before, after, and the cause. This is one of the most useful self-assessment tools you can develop. The ability to answer "what caused this change?" tells you whether to trust the learning or repeat it.`, checks: checkResults, nextStep: 'Do this exercise once a week with any topic where AI helped. It reveals whether AI use leads to learning or just output.' };
      if (hasBefore && hasAfter) return { score: 3, quality: 'good', title: 'Good before/after — add the cause', summary: `You tracked what changed, which is good. The missing piece is the cause: was the change driven by the AI explanation, your own thinking, the combination, or something else? That distinction matters for replicating the learning.`, checks: checkResults, nextStep: 'Add: "This change happened because..." and be honest about AI\'s role vs. your own thinking\'s role.' };
      if (hasSpecific) return { score: 2, quality: 'warn', title: 'Missing the before or after', summary: `The exercise requires both a "before" state and an "after" state. Without both, you can't trace whether learning actually occurred. One of them seems vague or missing.`, checks: checkResults, nextStep: 'Structure it: "Before: I thought... After: Now I think... Because..."' };
      return { score: 1, quality: 'weak', title: 'Too vague to trace learning', summary: `Your response is too general to reveal a learning trace. Name a specific concept, describe your specific misconception before, and describe the specific understanding after.`, checks: checkResults, nextStep: 'Pick one concrete concept. Not "AI topics" — something specific like "how transformers work" or "what confirmation bias means."' };
    }

    case 10: { // Teach it back
      const hasPlainLanguage = !text.includes('furthermore') && !text.includes('paradigm') && !text.includes('aforementioned') && !text.includes('utilize') && !text.includes('heretofore');
      const hasAnalogy = text.includes('like') || text.includes('similar to') || text.includes('think of') || text.includes('imagine') || text.includes('same as') || text.includes('kind of');
      const hasMechanism = text.includes('because') || text.includes('which means') || text.includes('so that') || text.includes('how') || text.includes('works by') || text.includes('causes') || text.includes('when');
      const isSufficient = wordCount > 50 && sentences >= 3;
      checkResults[0].passed = hasPlainLanguage && isSufficient;
      checkResults[1].passed = hasMechanism;
      checkResults[2].passed = isSufficient;
      if (hasPlainLanguage && hasMechanism && isSufficient) return { score: 4, quality: 'good', title: 'Clear and genuine explanation', summary: `You explained the concept in plain language with some sense of how it works — not just what it is. The ability to teach something simply is one of the most reliable tests of genuine understanding. If you used an analogy, that's even better.`, checks: checkResults, nextStep: 'Share this explanation with someone who doesn\'t know the topic. Their questions will show you exactly where your understanding still has gaps.' };
      if (isSufficient && hasPlainLanguage) return { score: 3, quality: 'good', title: 'Good explanation — add the mechanism', summary: `You described what the concept is, but explaining how it works or why it matters would deepen the explanation. "It's a process where X happens" is stronger than "it's when you X."`, checks: checkResults, nextStep: 'Add one sentence: "It works by..." or "This matters because..."' };
      if (!isSufficient) return { score: 2, quality: 'warn', title: 'Too brief for a genuine explanation', summary: `3–5 sentences are needed because teaching requires unpacking. A one-sentence definition shows recognition, not understanding. The test is whether a non-expert could follow your explanation.`, checks: checkResults, nextStep: 'Write 3 more sentences. Cover: what it is, how it works, and why it matters or an example.' };
      return { score: 1, quality: 'weak', title: 'Jargon-heavy or unclear', summary: `An explanation full of technical terms works for people who already know the topic — it doesn't test understanding. The Feynman test is specifically about stripping away jargon and explaining the core idea.`, checks: checkResults, nextStep: 'Pretend you\'re explaining to a 12-year-old. Use no technical terms at all.' };
    }

    default: {
      // Generic fallback for any future exercises
      const quality = hitRate > 0.3 && wordCount > 60 ? 'good' : hitRate > 0.15 && wordCount > 40 ? 'warn' : 'weak';
      const score = quality === 'good' ? 3 : quality === 'warn' ? 2 : 1;
      checkResults.forEach(c => { c.passed = quality === 'good'; });
      return {
        score,
        quality,
        title: quality === 'good' ? 'Good response' : quality === 'warn' ? 'Needs more depth' : 'Needs development',
        summary: quality === 'good'
          ? `Your response engages meaningfully with the exercise. You covered the main ideas with appropriate reasoning.`
          : `Your response addresses the exercise but could go deeper. Try to engage more specifically with the concepts and explain your reasoning.`,
        checks: checkResults,
        nextStep: quality === 'good' ? 'Push further — what would a level-4 response add that yours doesn\'t?' : 'Identify one specific claim in your response and add a "because" to explain it.'
      };
    }
  }
}

function buildFeedbackHTML(result) {
  const scoreColor = result.score >= 4 ? '#1D9E75' : result.score === 3 ? '#5DCAA5' : result.score === 2 ? '#EF9F27' : '#E24B4A';
  const scorePct = Math.round(result.score / 4 * 100);

  const checksHTML = result.checks.length > 0
    ? `<div class="checklist">${result.checks.map(c => `<div class="check-item"><span class="check-icon">${c.passed ? '✓' : '○'}</span><span>${c.label}</span></div>`).join('')}</div>`
    : '';

  return `<div class="feedback-box ${result.quality}">
    <div class="feedback-label">Feedback</div>
    <div class="score-badge" style="color:${scoreColor}">
      Score: ${result.score}/4 — ${result.title}
    </div>
    <div class="score-bar-wrap">
      <div class="score-bar-fill" style="width:${scorePct}%; background:${scoreColor};"></div>
    </div>
    <div>${result.summary}</div>
    ${checksHTML}
    <div class="next-step">→ <strong>Next step:</strong> ${result.nextStep}</div>
  </div>`;
}
