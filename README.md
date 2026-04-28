# ResilliAI

**A cognitive resilience training platform for students navigating AI over-reliance.**

🌐 **Live demo:** `https://yourusername.github.io/resiliai`

No API key. No login. No setup. Just open and use.

---

## What it does

ResilliAI helps students assess and strengthen their ability to use AI critically — without losing independent thinking, creativity, or judgment.

Based on a four-dimension **Cognitive Resilience (CR) Framework**:

| Dimension | What it measures |
|---|---|
| **Critical Evaluation** | Questioning, verifying, and challenging AI output |
| **Cognitive Autonomy** | Thinking independently before/during/after AI use |
| **Adaptive Regulation** | Knowing when and how much to use AI |
| **Reflective Integration** | Learning from AI interactions, not just producing output |

Scores range from 1 (Dependent) → 2 (Emerging) → 3 (Engaged) → 4 (Resilient).

---

## Features

- ✅ **No API key required** — fully offline-capable feedback engine
- 📊 **Baseline Assessment** — 12-question quiz scoring all four CR dimensions
- 🏋️ **11 Training Exercises** — hands-on tasks with rubric-based feedback
- 🧠 **Smart Feedback** — keyword + rubric analysis gives specific, actionable feedback
- 📈 **Score History** — tracks your CR profile across sessions
- 🎯 **Filter by Dimension** — focus on your weakest area
- ⚡ **XP System** — earn points for completing exercises and assessments
- 💾 **Persistent Storage** — scores saved to browser localStorage

---

## Deploy on GitHub Pages (2 minutes)

1. **Fork** this repo
2. Go to **Settings → Pages → Source → main → / (root)** → Save
3. Visit `https://yourusername.github.io/resiliai`

Or run locally:
```bash
git clone https://github.com/yourusername/resiliai
cd resiliai
open index.html   # or just double-click it
```

No build step. No dependencies. Pure HTML/CSS/JS.

---

## File structure

```
resiliai/
├── index.html          # App shell
├── css/
│   └── style.css       # All styles
├── js/
│   ├── data.js         # Questions, exercises, framework constants
│   ├── feedback.js     # Smart feedback engine (no API)
│   └── app.js          # App logic, navigation, state
└── README.md
```

---

## Research basis

- **Zhai et al. (2024)** — AI over-reliance erodes critical thinking, decision-making, analytical thinking
- **Hou et al. (2026)** — Critical thinking interventions shift reliance patterns and improve creativity
- **Yang et al. (2025)** — LLM agents amplify herd effects and bias, compounding over-reliance risks

---

## Roadmap

- [ ] PDF progress report export
- [ ] More exercises (20+)
- [ ] Instructor/researcher view
- [ ] Mobile app

---

MIT License
