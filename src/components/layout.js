// Layout — Sidebar navigation + content area
import { icons } from '../assets/icons.js';

const NAV_ITEMS = [
  { id: 'planets', label: 'Planetary Map', icon: icons.planets },
  { id: 'outposts', label: 'Outposts', icon: icons.outpost },
  { id: 'upgrades', label: 'Upgrades', icon: icons.upgrade },
  { id: 'manufacturing', label: 'Manufacturing', icon: icons.manufacturing },
  { id: 'trade', label: 'Trade Routes', icon: icons.trade },
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
      <div class="sidebar-footer">
        SYSTEM ONLINE // ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
      </div>
    </aside>
    <main class="main-content">
      <div class="content-header" id="content-header"></div>
      <div class="content-body" id="content-body"></div>
    </main>
  `;

  // Nav click handlers
  container.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      onNavigate(btn.dataset.view);
    });
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
