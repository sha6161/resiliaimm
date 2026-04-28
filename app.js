// ===== STATE =====
let currentView = 'dashboard';
let currentQ = 0;
let quizAnswers = [];
let selectedAnswer = null;
let activeExercise = 0;
let exerciseStates = {};
let filterDim = 'all';

let appData = {
  scores: { "Critical Evaluation": 2, "Cognitive Autonomy": 1, "Adaptive Regulation": 3, "Reflective Integration": 2 },
  history: [],
  sessionsCount: 3,
  exercisesDone: 7,
  xp: 120
};

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderDashboard();
});

function loadData() {
  try {
    const raw = localStorage.getItem('resiliai-data');
    if (raw) appData = { ...appData, ...JSON.parse(raw) };
  } catch(e) {}
}

function saveData() {
  localStorage.setItem('resiliai-data', JSON.stringify(appData));
}

// ===== NAVIGATION =====
function showView(view) {
  ['dashboard','assessment','training'].forEach(v => {
    document.getElementById('view-' + v).classList.toggle('hidden', v !== view);
  });
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === view);
  });
  currentView = view;
  if (view === 'assessment') initQuiz();
  if (view === 'training') initTraining();
  if (view === 'dashboard') renderDashboard();
}

// ===== STATE INDICATOR =====
function updateStateIndicator(level) {
  const map = {1:'thoughtless',2:'cautious',3:'collaborative',4:'reflective'};
  const labels = {1:'Thoughtless',2:'Cautious',3:'Collaborative',4:'Reflective'};
  const l = Math.max(1, Math.min(4, Math.round(level)));
  const ind = document.getElementById('state-indicator');
  ind.className = 'state-pill state-' + map[l];
  document.getElementById('state-text').textContent = labels[l];
}

// ===== HELPERS =====
function overallScore() {
  const vals = Object.values(appData.scores);
  return (vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(1);
}
function weakestDim() {
  return Object.entries(appData.scores).sort((a,b) => a[1]-b[1])[0][0];
}
function dimColor(lvl) {
  return ['','#E24B4A','#EF9F27','#1D9E75','#378ADD'][Math.min(4, Math.max(1, Math.round(lvl)))];
}
function xpLevel() {
  const xp = appData.xp || 0;
  return { xp, level: Math.floor(xp/100)+1, next: (Math.floor(xp/100)+1)*100, pct: (xp % 100) };
}

// ===== DASHBOARD =====
function renderDashboard() {
  const overall = overallScore();
  const lvl = Math.min(4, Math.max(1, Math.round(parseFloat(overall))));
  updateStateIndicator(lvl);
  const xpInfo = xpLevel();

  let historyHTML = '';
  if (appData.history.length > 0) {
    historyHTML = `<div class="history-section">
      <div class="section-title">Score history (${appData.history.length} past session${appData.history.length>1?'s':''})</div>
      <div class="history-rows">
        ${DIMS.map(dim => {
          const past = appData.history.map(h => h.scores[dim] || 0);
          const cur = appData.scores[dim];
          const all = [...past, cur];
          const bars = all.map((v,i) => {
            const pct = Math.round(v/4*100);
            const c = dimColor(v);
            const isCur = i === all.length-1;
            return `<div class="history-bar" style="height:${pct}%;background:${c};opacity:${isCur?1:0.4};" data-val="${v.toFixed(1)}${isCur?' (now)':''}"></div>`;
          }).join('');
          const c = dimColor(cur);
          return `<div class="history-row">
            <div class="history-label">${dim}</div>
            <div class="history-bars">${bars}</div>
            <div class="history-score" style="color:${c}">${cur}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  document.getElementById('view-dashboard').innerHTML = `
    <div class="metrics">
      <div class="metric">
        <div class="metric-label">Overall CR Score</div>
        <div class="metric-value">${overall}</div>
        <div class="metric-sub">${LEVEL_LABELS[lvl]}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Sessions</div>
        <div class="metric-value">${appData.sessionsCount}</div>
        <div class="metric-sub">Total completed</div>
      </div>
      <div class="metric">
        <div class="metric-label">Exercises done</div>
        <div class="metric-value">${appData.exercisesDone}</div>
        <div class="metric-sub">of ${EXERCISES.length} total</div>
      </div>
      <div class="metric">
        <div class="metric-label">Focus area</div>
        <div class="metric-value" style="font-size:17px;">${weakestDim().split(' ')[0]}</div>
        <div class="metric-sub">Lowest dimension</div>
      </div>
    </div>

    <div class="xp-bar-wrap">
      <div class="xp-row">
        <div class="xp-label">Level ${xpInfo.level} · ${xpInfo.xp} XP total</div>
        <div class="xp-val">${xpInfo.pct}/100 XP to next level</div>
      </div>
      <div class="xp-track"><div class="xp-fill" style="width:${xpInfo.pct}%"></div></div>
    </div>

    <div class="section-title">Cognitive resilience profile</div>
    <div class="dims-grid">
      ${DIMS.map(dim => {
        const v = appData.scores[dim];
        const l = Math.min(4, Math.max(1, Math.round(v)));
        return `<div class="dim-card">
          <div class="dim-header">
            <div class="dim-name">${dim}</div>
            <div class="dim-level level-${l}">${LEVEL_LABELS[l]} · ${v}/4</div>
          </div>
          <div class="progress-track"><div class="progress-fill fill-${l}" style="width:${Math.round(v/4*100)}%"></div></div>
          <div class="dim-desc">${LEVEL_DESC[dim][l]}</div>
        </div>`;
      }).join('')}
    </div>
    ${historyHTML}
    <div class="actions">
      <button class="btn btn-primary" onclick="showView('training')">Start training →</button>
      <button class="btn" onclick="showView('assessment')">Retake assessment</button>
      <button class="btn btn-danger btn-sm" onclick="resetData()">Reset data</button>
    </div>`;
}

function resetData() {
  if (!confirm('Reset all ResilliAI data? This cannot be undone.')) return;
  appData = { scores:{"Critical Evaluation":2,"Cognitive Autonomy":1,"Adaptive Regulation":3,"Reflective Integration":2}, history:[], sessionsCount:0, exercisesDone:0, xp:0 };
  exerciseStates = {};
  saveData();
  renderDashboard();
}

// ===== ASSESSMENT =====
function initQuiz() {
  currentQ = 0; quizAnswers = []; selectedAnswer = null;
  document.getElementById('view-assessment').innerHTML = `<div class="quiz-wrap"><div class="quiz-card">
    <div class="quiz-prog-bar"><div class="quiz-prog-fill" id="quiz-prog" style="width:0%"></div></div>
    <div id="quiz-dim-tag" class="quiz-dim-tag"></div>
    <div id="quiz-q" class="quiz-q"></div>
    <div id="quiz-opts" class="quiz-options"></div>
    <div class="quiz-nav">
      <span class="quiz-counter" id="quiz-counter"></span>
      <button class="btn btn-primary" id="quiz-next" onclick="nextQuestion()" style="display:none">Next →</button>
    </div>
  </div></div>`;
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[currentQ];
  document.getElementById('quiz-prog').style.width = (currentQ/QUESTIONS.length*100)+'%';
  document.getElementById('quiz-dim-tag').textContent = q.dim;
  document.getElementById('quiz-q').textContent = q.q;
  document.getElementById('quiz-counter').textContent = `Question ${currentQ+1} of ${QUESTIONS.length}`;
  document.getElementById('quiz-next').style.display = 'none';
  selectedAnswer = null;
  const optsEl = document.getElementById('quiz-opts');
  optsEl.innerHTML = '';
  q.opts.forEach((opt,i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.onclick = () => {
      document.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAnswer = i;
      document.getElementById('quiz-next').style.display = 'inline-flex';
      updateStateIndicator(i+1);
    };
    optsEl.appendChild(btn);
  });
}

function nextQuestion() {
  if (selectedAnswer === null) return;
  quizAnswers.push({ q: currentQ, a: selectedAnswer, dim: QUESTIONS[currentQ].dim });
  currentQ++;
  if (currentQ >= QUESTIONS.length) showQuizResults();
  else renderQuestion();
}

function showQuizResults() {
  const newScores = {};
  const counts = {};
  DIMS.forEach(d => { newScores[d]=0; counts[d]=0; });
  quizAnswers.forEach(a => { newScores[a.dim]+=a.a; counts[a.dim]++; });
  DIMS.forEach(d => { newScores[d]=parseFloat((newScores[d]/counts[d]/3*4).toFixed(1)); });

  appData.history.push({ date: new Date().toLocaleDateString(), scores: {...appData.scores} });
  if (appData.history.length > 8) appData.history.shift();
  appData.scores = newScores;
  appData.sessionsCount = (appData.sessionsCount||0)+1;
  appData.xp = (appData.xp||0)+30;
  saveData();

  document.querySelector('.quiz-card').innerHTML = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:22px;font-weight:600;margin-bottom:6px;">Assessment complete</div>
      <div style="font-size:13px;color:#5A5A5A;">+30 XP · Results saved</div>
    </div>
    ${DIMS.map(d => {
      const v = newScores[d];
      const l = Math.min(4,Math.max(1,Math.round(v)));
      return `<div class="dim-card" style="margin-bottom:10px;">
        <div class="dim-header">
          <div class="dim-name">${d}</div>
          <div class="dim-level level-${l}">${LEVEL_LABELS[l]} · ${v}/4</div>
        </div>
        <div class="progress-track"><div class="progress-fill fill-${l}" style="width:${Math.round(v/4*100)}%"></div></div>
      </div>`;
    }).join('')}
    <button class="btn btn-primary" style="width:100%;justify-content:center;margin-top:14px;" onclick="showView('training')">Go to training →</button>`;
}

// ===== TRAINING =====
function getFiltered() {
  return filterDim === 'all' ? EXERCISES : EXERCISES.filter(e => e.dim === filterDim);
}

function initTraining() { renderTrainingPanel(); }

function renderTrainingPanel() {
  const filtered = getFiltered();
  const weakest = weakestDim();
  const donePct = Math.round(Object.keys(exerciseStates).filter(k=>exerciseStates[k]==='done').length/EXERCISES.length*100);

  const listHTML = filtered.map(ex => {
    const done = exerciseStates[ex.id]==='done';
    const isActive = ex.id===activeExercise;
    return `<div class="ex-item ${isActive?'active':''} ${done?'done':''}" onclick="selectExercise(${ex.id})">
      <div class="ex-item-title">${done?'✓ ':''}${ex.title}</div>
      <div class="ex-item-dim">${ex.dim}</div>
    </div>`;
  }).join('');

  document.getElementById('view-training').innerHTML = `
    <div class="notice">Recommended focus: <strong>${weakest}</strong> — your lowest dimension. ${donePct}% of exercises completed this session.</div>
    <div class="exercise-panel">
      <div class="ex-sidebar">
        <div class="sidebar-title">Exercises (${EXERCISES.length})</div>
        <div class="dim-filters">
          <button class="filter-btn ${filterDim==='all'?'active':''}" onclick="setFilter('all')">All</button>
          ${DIMS.map(d=>`<button class="filter-btn ${filterDim===d?'active':''}" onclick="setFilter('${d}')">${d.split(' ')[0]}</button>`).join('')}
        </div>
        <div class="ex-list">${listHTML}</div>
      </div>
      <div class="ex-main" id="exercise-main"></div>
    </div>`;

  const ex = filtered.find(e=>e.id===activeExercise)||filtered[0];
  if (ex) { activeExercise=ex.id; renderExercise(ex.id); }
}

function setFilter(dim) {
  filterDim = dim;
  const filtered = getFiltered();
  if (!filtered.find(e=>e.id===activeExercise)) activeExercise=filtered[0]?.id??0;
  renderTrainingPanel();
}

function selectExercise(id) {
  activeExercise = id;
  document.querySelectorAll('.ex-item').forEach((el,i) => {
    el.classList.toggle('active', getFiltered()[i]?.id===id);
  });
  renderExercise(id);
}

function renderExercise(id) {
  const ex = EXERCISES.find(e=>e.id===id);
  if(!ex) return;
  document.getElementById('exercise-main').innerHTML = `
    <div class="ex-header">
      <div class="ex-title-wrap">
        <div class="ex-title">${ex.title}</div>
        <div class="ex-dim-sub">${ex.dim}</div>
      </div>
      <div class="ex-badge">${ex.badge}</div>
    </div>
    <div class="ex-prompt">${ex.prompt}</div>
    <div>
      <div class="field-label">Your response</div>
      <textarea id="resp-${id}" class="user-textarea" placeholder="Write your response here..."></textarea>
    </div>
    <div class="ex-actions">
      <button class="btn btn-primary" onclick="submitExercise(${id})">Get feedback →</button>
      <button class="btn btn-sm" onclick="toggleHint(${id})">Hint</button>
    </div>
    <div id="hint-${id}" class="hint-box" style="display:none;"><div class="field-label">Hint</div>${ex.hint}</div>
    <div id="feedback-${id}"></div>
    <div id="reveal-${id}" style="display:none;">
      <div class="field-label">Reference response</div>
      <div class="ai-response-box">${ex.aiResponse}</div>
    </div>`;
}

function toggleHint(id) {
  const h = document.getElementById('hint-'+id);
  h.style.display = h.style.display==='none'?'block':'none';
}

function submitExercise(id) {
  const userResp = document.getElementById('resp-'+id)?.value.trim();
  if (!userResp) { alert('Please write a response first.'); return; }

  const result = analyzResponse(id, userResp);
  const feedbackEl = document.getElementById('feedback-'+id);
  feedbackEl.innerHTML = buildFeedbackHTML(result);

  // show reference
  document.getElementById('reveal-'+id).style.display = 'block';

  // update state indicator
  updateStateIndicator(result.score);

  // award XP and mark done
  if (exerciseStates[id] !== 'done') {
    exerciseStates[id] = 'done';
    appData.exercisesDone = (appData.exercisesDone||0)+1;
    const xpGain = result.score >= 4 ? 25 : result.score === 3 ? 15 : result.score === 2 ? 8 : 3;
    appData.xp = (appData.xp||0)+xpGain;
    saveData();

    // update sidebar item
    const filtered = getFiltered();
    const items = document.querySelectorAll('.ex-item');
    filtered.forEach((e,i) => {
      if (e.id===id && items[i]) {
        items[i].classList.add('done');
        items[i].querySelector('.ex-item-title').textContent = '✓ '+e.title;
      }
    });
  }
}
