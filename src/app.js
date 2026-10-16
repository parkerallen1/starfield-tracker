// Main app entry — router + initialization
import './styles/index.css';
import { renderLayout } from './components/layout.js';
import { renderPlanets } from './views/planets.js';
import { renderOutposts } from './views/outposts.js';
import { renderManufacturing } from './views/manufacturing.js';
import { renderTrade } from './views/trade.js';
import { renderTips } from './views/tips.js';
import { renderNextSteps } from './views/nextsteps.js';
const VIEWS = {
  planets: { render: renderPlanets, title: 'Planetary Resource Map' },
  outposts: { render: renderOutposts, title: 'Outpost Management' },
  manufacturing: { render: renderManufacturing, title: 'Manufacturing' },
  trade: { render: renderTrade, title: 'Trade Routes & Economics' },
  tips: { render: renderTips, title: 'Tips & Guides' },
  nextsteps: { render: renderNextSteps, title: 'Next Steps' },
};

const DEFAULT_VIEW = 'planets';

function getViewFromHash() {
  const hash = window.location.hash.replace('#', '');
  return VIEWS[hash] ? hash : DEFAULT_VIEW;
}

function navigate(viewId) {
  window.location.hash = viewId;
}

function renderApp() {
  const app = document.getElementById('app');
  const activeView = getViewFromHash();

  renderLayout(app, activeView, navigate);

  // Render the active view
  const view = VIEWS[activeView];
  if (view) {
    view.render();
  }
}

// Initial render
renderApp();

// Hash change listener
window.addEventListener('hashchange', renderApp);
