:root {
  --bg: #17172a;
  --bg-glow-1: #2a1f45;
  --bg-glow-2: #1a2a3d;
  --panel: #22223a;
  --panel-raised: #292948;
  --border: rgba(255, 255, 255, 0.08);
  --text: #f2efff;
  --text-muted: #9a96b5;
  --accent: #ff5d73;
  --accent-soft: rgba(255, 93, 115, 0.16);
  --yellow: #ffd166;
  --teal: #4ecdc4;

  --font-display: "M PLUS Rounded 1c", "Zen Kaku Gothic New", sans-serif;
  --font-body: "Zen Kaku Gothic New", "M PLUS Rounded 1c", sans-serif;
}

* { box-sizing: border-box; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  min-height: 100vh;
}

body {
  position: relative;
  overflow-x: hidden;
  padding-bottom: 64px;
}

.bg-glow {
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(circle at 15% 10%, var(--bg-glow-1) 0%, transparent 45%),
    radial-gradient(circle at 85% 25%, var(--bg-glow-2) 0%, transparent 40%),
    var(--bg);
}

/* ---------------- Header ---------------- */

.page-header {
  text-align: center;
  padding: 40px 20px 8px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.logo-capsule {
  color: var(--accent);
  font-size: 28px;
  line-height: 1;
}

.page-header h1 {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(28px, 5vw, 38px);
  letter-spacing: 0.02em;
  margin: 0;
}

.tagline {
  color: var(--text-muted);
  margin: 6px 0 0;
  font-size: 14px;
  letter-spacing: 0.02em;
}

/* ---------------- Tabs ---------------- */

.tabs {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin: 28px auto 0;
  max-width: 560px;
  padding: 0 16px;
  flex-wrap: wrap;
}

.tab-btn {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
  color: var(--text-muted);
  background: transparent;
  border: none;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.tab-btn:hover { color: var(--text); }

.tab-btn.is-active {
  color: var(--bg);
  background: var(--text);
}

.tab-btn:focus-visible,
.chip:focus-visible,
.gacha-btn:focus-visible,
.fav-btn:focus-visible,
.submit-btn:focus-visible {
  outline: 2px solid var(--teal);
  outline-offset: 2px;
}

main {
  max-width: 560px;
  margin: 0 auto;
  padding: 24px 20px 0;
}

.tab-panel { display: none; }
.tab-panel.is-active { display: block; animation: fade-in 0.25s ease; }

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ---------------- Category chips ---------------- */

.category-select {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}

.chip {
  --chip-color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chip-color);
  flex-shrink: 0;
}

.chip:hover { transform: translateY(-1px); color: var(--text); }

.chip.is-active {
  color: var(--bg);
  background: var(--chip-color);
  border-color: var(--chip-color);
  font-weight: 700;
}

/* ---------------- Machine ---------------- */

.machine-stage {
  position: relative;
  display: flex;
  justify-content: center;
  margin: 8px auto 6px;
}

.machine {
  width: min(240px, 68vw);
  height: auto;
  filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.35));
}

#capsule-cluster {
  transform-origin: 160px 150px;
  animation: cluster-idle 4s ease-in-out infinite;
}

@keyframes cluster-idle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

#lever-knob {
  transform-origin: 235px 235px;
  transition: transform 0.25s ease;
}

.machine.is-spinning #lever-knob {
  animation: lever-turn 0.6s ease;
}

@keyframes lever-turn {
  0% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
  100% { transform: rotate(360deg); }
}

.machine.is-spinning #capsule-cluster {
  animation: cluster-shake 0.6s ease;
}

@keyframes cluster-shake {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-2px, 1px); }
  40% { transform: translate(2px, -1px); }
  60% { transform: translate(-2px, 1px); }
  80% { transform: translate(2px, 0); }
}

.capsule-drop {
  position: absolute;
  bottom: 18px;
  left: 50%;
  width: 22px;
  height: 22px;
  margin-left: -11px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0;
  pointer-events: none;
}

.capsule-drop.is-dropping {
  animation: drop-fall 0.5s cubic-bezier(0.5, 0, 0.75, 0.5) 0.35s;
}

@keyframes drop-fall {
  0% { opacity: 1; transform: translateY(-60px) scale(0.8); }
  80% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(4px) scale(1); }
}

/* ---------------- Gacha button ---------------- */

.gacha-btn {
  display: block;
  width: 100%;
  max-width: 320px;
  margin: 18px auto 28px;
  padding: 16px 20px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(180deg, var(--accent) 0%, #e2465d 100%);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 17px;
  letter-spacing: 0.03em;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(255, 93, 115, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.gacha-btn:hover { transform: translateY(-2px); }
.gacha-btn:active { transform: translateY(1px) scale(0.99); box-shadow: 0 4px 12px rgba(255, 93, 115, 0.25); }
.gacha-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

/* ---------------- Result card ---------------- */

.result-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px 22px;
  margin-bottom: 20px;
  animation: pop-in 0.35s ease;
}

@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.92) translateY(6px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.result-category {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--bg);
  background: var(--yellow);
  padding: 4px 12px;
  border-radius: 999px;
  margin-bottom: 14px;
}

.result-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 21px;
  line-height: 1.55;
  margin: 0 0 18px;
}

.result-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.result-time {
  font-size: 12px;
  color: var(--text-muted);
}

.fav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 999px;
  padding: 8px 14px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}

.fav-btn:hover { border-color: var(--yellow); }

.fav-btn.is-favorited {
  background: var(--yellow);
  border-color: var(--yellow);
  color: var(--bg);
  font-weight: 700;
}

.fav-btn.is-favorited .fav-icon::before { content: "★"; }
.fav-icon::before { content: "☆"; }

/* ---------------- Panels: history / favorites ---------------- */

.panel-title {
  font-family: var(--font-display);
  font-size: 22px;
  margin: 4px 0 2px;
}

.panel-sub {
  color: var(--text-muted);
  font-size: 13px;
  margin: 0 0 20px;
}

.history-list, .favorite-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-item {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.list-item-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.list-item-body { flex: 1; min-width: 0; }

.list-item-meta {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.list-item-text {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  word-break: break-word;
}

.remove-fav-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 4px;
  flex-shrink: 0;
}

.remove-fav-btn:hover { color: var(--accent); }

.empty-hint {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  padding: 32px 12px;
  line-height: 1.7;
}

/* ---------------- Add form ---------------- */

.add-form {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  margin: 18px 0 8px;
}

.field-label:first-of-type { margin-top: 0; }

textarea {
  width: 100%;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 14px;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 15px;
  padding: 14px;
  resize: vertical;
}

textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.char-count {
  text-align: right;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
}

.submit-btn {
  margin-top: 24px;
  padding: 15px 20px;
  border: none;
  border-radius: 14px;
  background: var(--teal);
  color: var(--bg);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.12s ease;
}

.submit-btn:hover { transform: translateY(-1px); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.form-message {
  margin-top: 14px;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--panel);
}

.form-message.is-error { color: #ff8fa3; }
.form-message.is-success { color: var(--teal); }

/* ---------------- Toast ---------------- */

.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  background: var(--text);
  color: var(--bg);
  font-size: 13px;
  font-weight: 700;
  padding: 12px 20px;
  border-radius: 999px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
  z-index: 50;
  animation: toast-in 0.25s ease;
}

@keyframes toast-in {
  from { opacity: 0; transform: translate(-50%, 8px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

@media (max-width: 420px) {
  .page-header { padding-top: 28px; }
  .tabs { gap: 2px; }
  .tab-btn { padding: 9px 12px; font-size: 13px; }
}
