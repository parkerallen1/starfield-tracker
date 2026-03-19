// Outpost Management & Logistics view
import { getAll, create, update, remove } from '../data/store.js';
import { icons } from '../assets/icons.js';
import { setContentHeader, getContentBody } from '../components/layout.js';
import { openModal, closeModal, confirmDelete } from '../components/modal.js';

const COLLECTION = 'outposts';

export function renderOutposts() {
  setContentHeader(
    'Outpost Management',
    `<button class="btn btn-primary" id="add-outpost-btn">${icons.plus} Add Outpost</button>`
  );

  const body = getContentBody();
  refreshList(body);

  requestAnimationFrame(() => {
    document.getElementById('add-outpost-btn')?.addEventListener('click', () => showOutpostModal());
  });
}

function refreshList(container) {
  const outposts = getAll(COLLECTION);
  const body = container || getContentBody();

  if (outposts.length === 0) {
    body.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏗️</div>
        <h3>No Outposts Registered</h3>
        <p>Add your outposts to track production and cargo links.</p>
        <button class="btn btn-primary" id="empty-add-outpost">${icons.plus} Add Outpost</button>
      </div>
    `;
    body.querySelector('#empty-add-outpost')?.addEventListener('click', () => showOutpostModal());
    return;
  }

  const activeCount = outposts.filter((o) => o.status === 'active').length;
  const totalPower = outposts.reduce((sum, o) => sum + o.powerCapacity, 0);
  const usedPower = outposts.reduce((sum, o) => sum + o.powerUsed, 0);
  const totalExtractors = outposts.reduce((sum, o) => sum + o.extractors, 0);

  body.innerHTML = `
    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-value">${outposts.length}</div>
        <div class="stat-label">Total Outposts</div>
      </div>
      <div class="stat-card">
        <div class="stat-value text-green">${activeCount}</div>
        <div class="stat-label">Online</div>
      </div>
      <div class="stat-card">
        <div class="stat-value text-gold">${usedPower}<span class="text-muted" style="font-size: 0.9rem;">/${totalPower}</span></div>
        <div class="stat-label">Power Grid (kW)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalExtractors}</div>
        <div class="stat-label">Extractors</div>
      </div>
    </div>

    <div class="card-grid" id="outpost-grid"></div>
  `;

  renderCards(outposts);
}

function renderCards(outposts) {
  const grid = document.getElementById('outpost-grid');
  if (!grid) return;

  grid.innerHTML = outposts
    .map((o) => {
      const powerPct = o.powerCapacity > 0 ? Math.round((o.powerUsed / o.powerCapacity) * 100) : 0;
      const powerColor = powerPct > 85 ? 'red' : powerPct > 60 ? 'gold' : 'green';

      return `
      <div class="card" data-id="${o.id}">
        <div class="flex justify-between items-center" style="margin-bottom: var(--space-sm);">
          <div class="card-title">${o.name}</div>
          <span class="tag ${o.status === 'active' ? 'green' : 'red'}">
            <span class="status-dot ${o.status}"></span>${o.status}
          </span>
        </div>
        <div class="card-meta">${o.planet} // ${o.system} System</div>
        <div class="card-body">
          <div style="margin-bottom: var(--space-md); font-size: 0.85rem;">
            <span class="text-muted">Focus:</span> <span class="text-cyan">${o.focus}</span>
          </div>

          <div style="margin-bottom: var(--space-md);">
            <div class="flex justify-between" style="font-size: 0.75rem; margin-bottom: var(--space-xs);">
              <span class="text-muted">Power Grid</span>
              <span class="text-${powerColor}">${o.powerUsed}/${o.powerCapacity} kW</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill ${powerColor}" style="width: ${powerPct}%"></div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xs); font-size: 0.8rem; margin-bottom: var(--space-md);">
            <div><span class="text-muted">Extractors:</span> <span class="text-cyan">${o.extractors}</span></div>
            <div><span class="text-muted">Storage:</span> <span class="text-cyan">${o.storageUnits}</span></div>
          </div>

          ${
            o.cargoLinks.length > 0
              ? `<div style="margin-bottom: var(--space-sm);">
                  <span class="text-muted" style="font-size: 0.75rem;">${icons.link} Cargo Links:</span>
                  <div class="tag-list" style="margin-top: var(--space-xs);">
                    ${o.cargoLinks.map((l) => `<span class="tag gold">${l}</span>`).join('')}
                  </div>
                </div>`
              : ''
          }

          ${o.notes ? `<p style="margin-top: var(--space-sm); font-size: 0.8rem; color: var(--text-muted); font-style: italic;">${o.notes}</p>` : ''}
        </div>
        <div class="card-actions">
          <button class="btn btn-sm edit-outpost" data-id="${o.id}">${icons.edit} Edit</button>
          <button class="btn btn-sm btn-danger delete-outpost" data-id="${o.id}">${icons.trash} Delete</button>
        </div>
      </div>`;
    })
    .join('');

  grid.querySelectorAll('.edit-outpost').forEach((btn) => {
    btn.addEventListener('click', () => showOutpostModal(btn.dataset.id));
  });

  grid.querySelectorAll('.delete-outpost').forEach((btn) => {
    btn.addEventListener('click', () => {
      const outpost = getAll(COLLECTION).find((o) => o.id === btn.dataset.id);
      confirmDelete(outpost?.name || 'this outpost', () => {
        remove(COLLECTION, btn.dataset.id);
        refreshList();
      });
    });
  });
}

function showOutpostModal(editId) {
  const existing = editId ? getAll(COLLECTION).find((o) => o.id === editId) : null;

  const bodyHtml = `
    <div class="form-row">
      <div class="form-group">
        <label>Outpost Name</label>
        <input type="text" id="f-name" value="${existing?.name || ''}" />
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="f-status">
          <option value="active" ${existing?.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${existing?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Planet</label>
        <input type="text" id="f-planet" value="${existing?.planet || ''}" />
      </div>
      <div class="form-group">
        <label>Star System</label>
        <input type="text" id="f-system" value="${existing?.system || ''}" />
      </div>
    </div>
    <div class="form-group">
      <label>Production Focus</label>
      <input type="text" id="f-focus" value="${existing?.focus || ''}" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Power Capacity (kW)</label>
        <input type="number" id="f-powerCap" value="${existing?.powerCapacity || 0}" />
      </div>
      <div class="form-group">
        <label>Power Used (kW)</label>
        <input type="number" id="f-powerUsed" value="${existing?.powerUsed || 0}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Extractors</label>
        <input type="number" id="f-extractors" value="${existing?.extractors || 0}" />
      </div>
      <div class="form-group">
        <label>Storage Units</label>
        <input type="number" id="f-storage" value="${existing?.storageUnits || 0}" />
      </div>
    </div>
    <div class="form-group">
      <label>Cargo Links (comma separated)</label>
      <input type="text" id="f-cargoLinks" value="${existing?.cargoLinks?.join(', ') || ''}" />
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea id="f-notes">${existing?.notes || ''}</textarea>
    </div>
  `;

  openModal({
    title: existing ? 'Edit Outpost' : 'Add Outpost',
    bodyHtml,
    saveLabel: existing ? 'Update' : 'Add Outpost',
    onSave: () => {
      const data = {
        name: document.getElementById('f-name').value.trim(),
        status: document.getElementById('f-status').value,
        planet: document.getElementById('f-planet').value.trim(),
        system: document.getElementById('f-system').value.trim(),
        focus: document.getElementById('f-focus').value.trim(),
        powerCapacity: parseInt(document.getElementById('f-powerCap').value) || 0,
        powerUsed: parseInt(document.getElementById('f-powerUsed').value) || 0,
        extractors: parseInt(document.getElementById('f-extractors').value) || 0,
        storageUnits: parseInt(document.getElementById('f-storage').value) || 0,
        cargoLinks: document.getElementById('f-cargoLinks').value.split(',').map((s) => s.trim()).filter(Boolean),
        notes: document.getElementById('f-notes').value.trim(),
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
