// Trade Routes & Economics view
import { getAll, create, update, remove } from '../data/store.js';
import { icons } from '../assets/icons.js';
import { setContentHeader, getContentBody } from '../components/layout.js';
import { openModal, closeModal, confirmDelete } from '../components/modal.js';

const COLLECTION = 'trade';

export function renderTrade() {
  setContentHeader(
    'Trade Routes & Economics',
    `<button class="btn btn-primary" id="add-vendor-btn">${icons.plus} Add Vendor</button>`
  );

  const body = getContentBody();
  refreshList(body);

  requestAnimationFrame(() => {
    document.getElementById('add-vendor-btn')?.addEventListener('click', () => showVendorModal());
  });
}

function refreshList(container) {
  const vendors = getAll(COLLECTION);
  const body = container || getContentBody();

  if (vendors.length === 0) {
    body.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💰</div>
        <h3>No Vendors Mapped</h3>
        <p>Add vendor locations and credit pools to optimize trade routes.</p>
        <button class="btn btn-primary" id="empty-add-vendor">${icons.plus} Add Vendor</button>
      </div>
    `;
    body.querySelector('#empty-add-vendor')?.addEventListener('click', () => showVendorModal());
    return;
  }

  const totalCredits = vendors.reduce((s, v) => s + v.creditPool, 0);
  const systems = [...new Set(vendors.map((v) => v.system))];

  body.innerHTML = `
    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-value">${vendors.length}</div>
        <div class="stat-label">Mapped Vendors</div>
      </div>
      <div class="stat-card">
        <div class="stat-value text-gold">${totalCredits.toLocaleString()}</div>
        <div class="stat-label">Total Credit Pool</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${systems.length}</div>
        <div class="stat-label">Systems Covered</div>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" class="search-input" id="vendor-search" placeholder="Search vendors, locations, or items..." />
    </div>

    <!-- Vendor Table -->
    <div style="overflow-x: auto; border: 1px solid var(--border-color); border-radius: var(--radius-lg); background: var(--bg-card);">
      <table class="data-table" id="vendor-table">
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Location</th>
            <th>System</th>
            <th>Credit Pool</th>
            <th>Restock</th>
            <th>Best Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="vendor-tbody"></tbody>
      </table>
    </div>
  `;

  renderTable(vendors);

  body.querySelector('#vendor-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = vendors.filter(
      (v) =>
        v.vendor.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.system.toLowerCase().includes(q) ||
        v.bestItems.some((item) => item.toLowerCase().includes(q))
    );
    renderTable(filtered);
  });
}

function renderTable(vendors) {
  const tbody = document.getElementById('vendor-tbody');
  if (!tbody) return;

  tbody.innerHTML = vendors
    .map(
      (v) => `
    <tr>
      <td>
        <div style="font-weight: 600; color: var(--text-primary);">${v.vendor}</div>
        ${v.notes ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${v.notes}</div>` : ''}
      </td>
      <td>${v.location}</td>
      <td><span class="tag">${v.system}</span></td>
      <td><span class="text-gold text-mono" style="font-weight: 600;">${v.creditPool.toLocaleString()} CR</span></td>
      <td><span class="text-muted text-mono">${v.restockDays}d</span></td>
      <td>
        <div class="tag-list">
          ${v.bestItems.map((item) => `<span class="tag gold">${item}</span>`).join('')}
        </div>
      </td>
      <td>
        <div class="flex gap-sm">
          <button class="btn btn-sm btn-icon edit-vendor" data-id="${v.id}">${icons.edit}</button>
          <button class="btn btn-sm btn-icon btn-danger delete-vendor" data-id="${v.id}">${icons.trash}</button>
        </div>
      </td>
    </tr>`
    )
    .join('');

  tbody.querySelectorAll('.edit-vendor').forEach((btn) => {
    btn.addEventListener('click', () => showVendorModal(btn.dataset.id));
  });

  tbody.querySelectorAll('.delete-vendor').forEach((btn) => {
    btn.addEventListener('click', () => {
      const vendor = getAll(COLLECTION).find((v) => v.id === btn.dataset.id);
      confirmDelete(vendor?.vendor || 'this vendor', () => {
        remove(COLLECTION, btn.dataset.id);
        refreshList();
      });
    });
  });
}

function showVendorModal(editId) {
  const existing = editId ? getAll(COLLECTION).find((v) => v.id === editId) : null;

  const bodyHtml = `
    <div class="form-group">
      <label>Vendor Name</label>
      <input type="text" id="f-vendor" value="${existing?.vendor || ''}" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Location</label>
        <input type="text" id="f-location" value="${existing?.location || ''}" />
      </div>
      <div class="form-group">
        <label>Star System</label>
        <input type="text" id="f-system" value="${existing?.system || ''}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Credit Pool</label>
        <input type="number" id="f-credits" value="${existing?.creditPool || 5000}" />
      </div>
      <div class="form-group">
        <label>Restock (days)</label>
        <input type="number" id="f-restock" value="${existing?.restockDays || 2}" />
      </div>
    </div>
    <div class="form-group">
      <label>Best Items to Sell (comma separated)</label>
      <input type="text" id="f-bestItems" value="${existing?.bestItems?.join(', ') || ''}" />
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea id="f-notes">${existing?.notes || ''}</textarea>
    </div>
  `;

  openModal({
    title: existing ? 'Edit Vendor' : 'Add Vendor',
    bodyHtml,
    saveLabel: existing ? 'Update' : 'Add Vendor',
    onSave: () => {
      const vendor = document.getElementById('f-vendor').value.trim();
      if (!vendor) return;

      const data = {
        vendor,
        location: document.getElementById('f-location').value.trim(),
        system: document.getElementById('f-system').value.trim(),
        creditPool: parseInt(document.getElementById('f-credits').value) || 0,
        restockDays: parseInt(document.getElementById('f-restock').value) || 2,
        bestItems: document.getElementById('f-bestItems').value.split(',').map((s) => s.trim()).filter(Boolean),
        notes: document.getElementById('f-notes').value.trim(),
      };

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
