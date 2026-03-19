// Planetary Resource Map view
import { getAll, create, update, remove } from '../data/store.js';
import { icons } from '../assets/icons.js';
import { setContentHeader, getContentBody } from '../components/layout.js';
import { openModal, closeModal, confirmDelete } from '../components/modal.js';

const COLLECTION = 'planets';

export function renderPlanets() {
  setContentHeader(
    'Planetary Resource Map',
    `<button class="btn btn-primary" id="add-planet-btn">${icons.plus} Add Planet</button>`
  );

  const body = getContentBody();
  refreshList(body);

  // Bind add button after header renders
  requestAnimationFrame(() => {
    document.getElementById('add-planet-btn')?.addEventListener('click', () => showPlanetModal());
  });
}

function refreshList(container) {
  const planets = getAll(COLLECTION);
  const body = container || getContentBody();

  if (planets.length === 0) {
    body.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🪐</div>
        <h3>No Planets Logged</h3>
        <p>Start by adding surveyed planets and their resources.</p>
        <button class="btn btn-primary" id="empty-add-planet">${icons.plus} Add Planet</button>
      </div>
    `;
    body.querySelector('#empty-add-planet')?.addEventListener('click', () => showPlanetModal());
    return;
  }

  // Stats row
  const totalResources = new Set(planets.flatMap((p) => p.resources)).size;
  const surveyedCount = planets.filter((p) => p.surveyed).length;

  body.innerHTML = `
    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-value">${planets.length}</div>
        <div class="stat-label">Planets Logged</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${surveyedCount}</div>
        <div class="stat-label">Fully Surveyed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalResources}</div>
        <div class="stat-label">Unique Resources</div>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" class="search-input" id="planet-search" placeholder="Search planets or resources..." />
    </div>

    <div class="card-grid" id="planet-grid"></div>
  `;

  renderCards(planets);

  body.querySelector('#planet-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = planets.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.system.toLowerCase().includes(q) ||
        p.resources.some((r) => r.toLowerCase().includes(q))
    );
    renderCards(filtered);
  });
}

function renderCards(planets) {
  const grid = document.getElementById('planet-grid');
  if (!grid) return;

  grid.innerHTML = planets
    .map(
      (p) => `
    <div class="card" data-id="${p.id}">
      <div class="flex justify-between items-center" style="margin-bottom: var(--space-sm);">
        <div class="card-title">${p.name}</div>
        <span class="tag ${p.surveyed ? 'green' : 'gold'}">${p.surveyed ? 'Surveyed' : 'Unsurveyed'}</span>
      </div>
      <div class="card-meta">${p.system} System // ${p.biome}</div>
      <div class="card-body">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xs); margin-bottom: var(--space-md); font-size: 0.8rem;">
          <div><span class="text-muted">Gravity:</span> <span class="text-cyan">${p.gravity}</span></div>
          <div><span class="text-muted">Temp:</span> <span class="text-cyan">${p.temperature}</span></div>
          <div style="grid-column: 1 / -1;"><span class="text-muted">Atmos:</span> <span class="text-cyan">${p.atmosphere}</span></div>
        </div>
        <div class="tag-list">
          ${p.resources.map((r) => `<span class="tag">${r}</span>`).join('')}
        </div>
        ${p.notes ? `<p style="margin-top: var(--space-md); font-size: 0.8rem; color: var(--text-muted); font-style: italic;">${p.notes}</p>` : ''}
      </div>
      <div class="card-actions">
        <button class="btn btn-sm edit-planet" data-id="${p.id}">${icons.edit} Edit</button>
        <button class="btn btn-sm btn-danger delete-planet" data-id="${p.id}">${icons.trash} Delete</button>
      </div>
    </div>`
    )
    .join('');

  grid.querySelectorAll('.edit-planet').forEach((btn) => {
    btn.addEventListener('click', () => showPlanetModal(btn.dataset.id));
  });

  grid.querySelectorAll('.delete-planet').forEach((btn) => {
    btn.addEventListener('click', () => {
      const planet = getAll(COLLECTION).find((p) => p.id === btn.dataset.id);
      confirmDelete(planet?.name || 'this planet', () => {
        remove(COLLECTION, btn.dataset.id);
        refreshList();
      });
    });
  });
}

function showPlanetModal(editId) {
  const existing = editId ? getAll(COLLECTION).find((p) => p.id === editId) : null;

  const bodyHtml = `
    <div class="form-row">
      <div class="form-group">
        <label>Planet Name</label>
        <input type="text" id="f-name" value="${existing?.name || ''}" />
      </div>
      <div class="form-group">
        <label>Star System</label>
        <input type="text" id="f-system" value="${existing?.system || ''}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Biome</label>
        <input type="text" id="f-biome" value="${existing?.biome || ''}" />
      </div>
      <div class="form-group">
        <label>Gravity</label>
        <input type="text" id="f-gravity" value="${existing?.gravity || ''}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Atmosphere</label>
        <input type="text" id="f-atmosphere" value="${existing?.atmosphere || ''}" />
      </div>
      <div class="form-group">
        <label>Temperature</label>
        <input type="text" id="f-temperature" value="${existing?.temperature || ''}" />
      </div>
    </div>
    <div class="form-group">
      <label>Resources (comma separated)</label>
      <input type="text" id="f-resources" value="${existing?.resources?.join(', ') || ''}" />
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea id="f-notes">${existing?.notes || ''}</textarea>
    </div>
    <div class="form-group">
      <label>Surveyed</label>
      <select id="f-surveyed">
        <option value="true" ${existing?.surveyed !== false ? 'selected' : ''}>Yes</option>
        <option value="false" ${existing?.surveyed === false ? 'selected' : ''}>No</option>
      </select>
    </div>
  `;

  openModal({
    title: existing ? 'Edit Planet' : 'Add Planet',
    bodyHtml,
    saveLabel: existing ? 'Update' : 'Add Planet',
    onSave: () => {
      const data = {
        name: document.getElementById('f-name').value.trim(),
        system: document.getElementById('f-system').value.trim(),
        biome: document.getElementById('f-biome').value.trim(),
        gravity: document.getElementById('f-gravity').value.trim(),
        atmosphere: document.getElementById('f-atmosphere').value.trim(),
        temperature: document.getElementById('f-temperature').value.trim(),
        resources: document.getElementById('f-resources').value.split(',').map((s) => s.trim()).filter(Boolean),
        notes: document.getElementById('f-notes').value.trim(),
        surveyed: document.getElementById('f-surveyed').value === 'true',
      };

      if (!data.name) return;

      if (existing) {
        update(COLLECTION, existing.id, data);
      } else {
        create(COLLECTION, data);
      }

      closeModal();
      refreshList();
    },
  });
}
