// Layout — Sidebar navigation + content area
import { icons } from '../assets/icons.js';

const AI_HISTORY_KEY = 'starfield_ai_history';
const AI_HISTORY_MAX = 5;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(AI_HISTORY_KEY)) ?? []; }
  catch { return []; }
}

function saveToHistory(query, response) {
  const history = loadHistory();
  history.unshift({ query, response, ts: Date.now() });
  localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(history.slice(0, AI_HISTORY_MAX)));
}

const NAV_ITEMS = [
  { id: 'planets', label: 'Planetary Map', mobileLabel: 'Planets', icon: icons.planets },
  { id: 'outposts', label: 'Outposts', mobileLabel: 'Outposts', icon: icons.outpost },
{ id: 'manufacturing', label: 'Manufacturing', mobileLabel: 'Mfg', icon: icons.manufacturing },
  { id: 'trade', label: 'Trade Routes', mobileLabel: 'Trade', icon: icons.trade },
  { id: 'tips', label: 'Tips & Guides', mobileLabel: 'Tips', icon: icons.tips },
  { id: 'nextsteps', label: 'Next Steps', mobileLabel: 'Goals', icon: icons.nextSteps },
];

export function renderLayout(container, activeView, onNavigate) {
  container.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">Starfield Tracker</div>
        <div class="sidebar-subtitle">v1.0 // Command Center</div>
      </div>
      <nav class="sidebar-nav" id="sidebar-nav">
        ${NAV_ITEMS.map(
          (item) => `
          <button class="nav-item ${item.id === activeView ? 'active' : ''}" data-view="${item.id}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
          </button>`
        ).join('')}
      </nav>
      <div class="ai-panel" id="ai-panel">
        <button class="ai-panel-toggle" id="ai-panel-toggle">
          <span>AI ASSIST</span>
          <svg class="ai-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 5L6 8L9 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="ai-panel-body" id="ai-panel-body">
          <div class="ai-provider-tabs">
            <button class="ai-provider-btn active" data-provider="claude">Claude</button>
            <button class="ai-provider-btn" data-provider="gemini">Gemini</button>
          </div>
          <textarea id="ai-query" class="ai-query" placeholder="What would you like to change or add? (Ctrl+Enter to run)"></textarea>
          <div class="ai-panel-actions">
            <button id="ai-submit" class="btn btn-primary btn-sm">Run</button>
          </div>
          <div id="ai-output" class="ai-output"></div>
          <div id="ai-history" class="ai-history"></div>
        </div>
      </div>
      <div class="sidebar-footer">
        SYSTEM ONLINE // ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
      </div>
    </aside>
    <main class="main-content">
      <div class="content-header" id="content-header"></div>
      <div class="content-body" id="content-body"></div>
    </main>
    <nav class="mobile-nav" id="mobile-nav">
      ${NAV_ITEMS.map(
        (item) => `
        <button class="mobile-nav-item ${item.id === activeView ? 'active' : ''}" data-view="${item.id}">
          ${item.icon}
          <span>${item.mobileLabel}</span>
        </button>`
      ).join('')}
    </nav>
  `;

  // Nav click handlers (sidebar + mobile bottom nav)
  container.querySelectorAll('.nav-item, .mobile-nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      onNavigate(btn.dataset.view);
    });
  });

  // AI panel
  const aiPanel = container.querySelector('#ai-panel');
  const aiToggle = container.querySelector('#ai-panel-toggle');
  const aiQuery = container.querySelector('#ai-query');
  const aiSubmit = container.querySelector('#ai-submit');
  const aiOutput = container.querySelector('#ai-output');
  const aiHistoryEl = container.querySelector('#ai-history');
  let aiProvider = 'claude';

  function renderHistory() {
    const history = loadHistory();
    if (!history.length) { aiHistoryEl.innerHTML = ''; return; }
    const openIndex = localStorage.getItem('starfield_ai_history_open');
    aiHistoryEl.innerHTML = `
      <div class="ai-history-label">HISTORY</div>
      ${history.map((entry, i) => `
        <div class="ai-history-item ${String(i) === openIndex ? 'open' : ''}" data-index="${i}">
          <button class="ai-history-q">${entry.query.length > 48 ? entry.query.slice(0, 48) + '…' : entry.query}</button>
          <div class="ai-history-r">
            <div class="ai-history-r-q">${entry.query}</div>
            <div class="ai-history-r-body">${entry.response}</div>
          </div>
        </div>`).join('')}`;
    aiHistoryEl.querySelectorAll('.ai-history-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.ai-history-item');
        const isOpen = item.classList.toggle('open');
        localStorage.setItem('starfield_ai_history_open', isOpen ? item.dataset.index : '');
      });
    });
  }

  renderHistory();

  if (localStorage.getItem('starfield_ai_panel_open') === 'true') {
    aiPanel.classList.add('open');
  }

  aiToggle.addEventListener('click', () => {
    aiPanel.classList.toggle('open');
    localStorage.setItem('starfield_ai_panel_open', aiPanel.classList.contains('open'));
  });

  container.querySelectorAll('.ai-provider-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      aiProvider = btn.dataset.provider;
      container.querySelectorAll('.ai-provider-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  function getDataContext() {
    const collections = ['planets', 'outposts', 'manufacturing'];
    const data = {};
    for (const c of collections) {
      const raw = localStorage.getItem('starfield_' + c);
      data[c] = raw ? JSON.parse(raw) : [];
    }
    return JSON.stringify(data, null, 2);
  }

  async function runQuery() {
    const query = aiQuery.value.trim();
    if (!query) return;
    aiOutput.textContent = '';
    aiOutput.classList.add('loading');
    aiSubmit.disabled = true;
    aiSubmit.textContent = 'Running...';
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, provider: aiProvider, context: getDataContext() }),
      });
      if (!res.ok) {
        aiOutput.textContent = `Error: ${await res.text()}`;
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      aiOutput.classList.remove('loading');
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiOutput.textContent += decoder.decode(value, { stream: true });
        aiOutput.scrollTop = aiOutput.scrollHeight;
      }
      saveToHistory(query, aiOutput.textContent);
      renderHistory();
    } catch (err) {
      aiOutput.textContent = `Error: ${err.message}`;
    } finally {
      aiOutput.classList.remove('loading');
      aiSubmit.disabled = false;
      aiSubmit.textContent = 'Run';
    }
  }

  aiSubmit.addEventListener('click', runQuery);
  aiQuery.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runQuery();
  });
}

export function setContentHeader(title, actionsHtml = '') {
  const header = document.getElementById('content-header');
  if (header) {
    header.innerHTML = `
      <h1>${title}</h1>
      <div class="content-header-actions">${actionsHtml}</div>
    `;
  }
}

export function getContentBody() {
  return document.getElementById('content-body');
}
