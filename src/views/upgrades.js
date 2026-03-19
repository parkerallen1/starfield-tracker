// Upgrade Tracker view
import { getAll, update, create, remove } from '../data/store.js';
import { icons } from '../assets/icons.js';
import { setContentHeader, getContentBody } from '../components/layout.js';
import { openModal, closeModal, confirmDelete } from '../components/modal.js';

const COLLECTION = 'upgrades';
const CATEGORIES = {
  weapon: { label: 'Weapons', emoji: '🔫', color: 'red' },
  armor: { label: 'Armor', emoji: '🛡️', color: 'purple' },
  ship: { label: 'Ships', emoji: '🚀', color: 'cyan' },
};

export function renderUpgrades() {
  setContentHeader(
    'Upgrade Tracker',
    `<button class="btn btn-primary" id="add-upgrade-btn">${icons.plus} Add Upgrade</button>`
  );

  const body = getContentBody();
  refreshList(body);

  requestAnimationFrame(() => {
    document.getElementById('add-upgrade-btn')?.addEventListener('click', () => showUpgradeModal());
  });
}

function refreshList(container) {
  const upgrades = getAll(COLLECTION);
  const body = container || getContentBody();

  if (upgrades.length === 0) {
    body.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⭐</div>
        <h3>No Upgrades Tracked</h3>
        <p>Add weapon, armor, or ship upgrades to track required materials.</p>
        <button class="btn btn-primary" id="empty-add-upgrade">${icons.plus} Add Upgrade</button>
      </div>
    `;
    body.querySelector('#empty-add-upgrade')?.addEventListener('click', () => showUpgradeModal());
    return;
  }

  // Overall stats
  let totalComponents = 0;
  let acquiredComponents = 0;
  upgrades.forEach((u) => {
    u.components.forEach((c) => {
      totalComponents += c.required;
      acquiredComponents += Math.min(c.acquired, c.required);
    });
  });

  const overallPct = totalComponents > 0 ? Math.round((acquiredComponents / totalComponents) * 100) : 0;

  body.innerHTML = `
    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-value">${upgrades.length}</div>
        <div class="stat-label">Tracked Upgrades</div>
      </div>
      <div class="stat-card">
        <div class="stat-value text-gold">${overallPct}%</div>
        <div class="stat-label">Overall Completion</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalComponents - acquiredComponents}</div>
        <div class="stat-label">Components Needed</div>
      </div>
    </div>

    <div id="upgrade-categories"></div>
  `;

  const categoriesEl = document.getElementById('upgrade-categories');
  for (const [catKey, catInfo] of Object.entries(CATEGORIES)) {
    const catUpgrades = upgrades.filter((u) => u.category === catKey);
    if (catUpgrades.length === 0) continue;

    const section = document.createElement('div');
    section.innerHTML = `
      <div class="section-heading">${catInfo.emoji} ${catInfo.label}</div>
      ${catUpgrades.map((u) => renderUpgradePanel(u, catInfo.color)).join('')}
    `;
    categoriesEl.appendChild(section);
  }

  // Bind expand toggles
  body.querySelectorAll('.expand-header').forEach((header) => {
    header.addEventListener('click', () => {
      header.closest('.expand-panel').classList.toggle('open');
    });
  });

  // Bind checkbox toggles
  body.querySelectorAll('.checklist-checkbox').forEach((cb) => {
    cb.addEventListener('click', () => {
      const upgradeId = cb.dataset.upgradeId;
      const compIdx = parseInt(cb.dataset.compIdx);
      const upgrades = getAll(COLLECTION);
      const upgrade = upgrades.find((u) => u.id === upgradeId);
      if (!upgrade) return;

      const comp = upgrade.components[compIdx];
      if (comp.acquired >= comp.required) {
        comp.acquired = 0;
      } else {
        comp.acquired = comp.required;
      }
      update(COLLECTION, upgradeId, { components: upgrade.components });
      refreshList();
    });
  });

  // Bind edit/delete
  body.querySelectorAll('.edit-upgrade').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showUpgradeModal(btn.dataset.id);
    });
  });

  body.querySelectorAll('.delete-upgrade').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const upgrade = getAll(COLLECTION).find((u) => u.id === btn.dataset.id);
      confirmDelete(upgrade?.name || 'this upgrade', () => {
        remove(COLLECTION, btn.dataset.id);
        refreshList();
      });
    });
  });
}

function renderUpgradePanel(upgrade, color) {
  const totalReq = upgrade.components.reduce((s, c) => s + c.required, 0);
  const totalAcq = upgrade.components.reduce((s, c) => s + Math.min(c.acquired, c.required), 0);
  const pct = totalReq > 0 ? Math.round((totalAcq / totalReq) * 100) : 0;
  const progressColor = pct === 100 ? 'green' : color;

  return `
    <div class="expand-panel">
      <button class="expand-header">
        <div style="flex: 1;">
          <div class="card-title" style="margin-bottom: 2px;">${upgrade.name} ${pct === 100 ? '<span class="text-green">✓</span>' : ''}</div>
          <div class="card-meta">${upgrade.description}</div>
          <div style="margin-top: var(--space-sm); max-width: 300px;">
            <div class="progress-bar">
              <div class="progress-fill ${progressColor}" style="width: ${pct}%"></div>
            </div>
            <div class="progress-label">${totalAcq}/${totalReq} components — ${pct}%</div>
          </div>
        </div>
        <div class="flex gap-sm items-center">
          <button class="btn btn-sm edit-upgrade" data-id="${upgrade.id}">${icons.edit}</button>
          <button class="btn btn-sm btn-danger delete-upgrade" data-id="${upgrade.id}">${icons.trash}</button>
          <span class="expand-chevron">${icons.chevronDown}</span>
        </div>
      </button>
      <div class="expand-body">
        ${upgrade.components
          .map(
            (c, i) => `
          <div class="checklist-item ${c.acquired >= c.required ? 'acquired' : ''}">
            <button class="checklist-checkbox ${c.acquired >= c.required ? 'checked' : ''}" data-upgrade-id="${upgrade.id}" data-comp-idx="${i}">
              ${c.acquired >= c.required ? icons.check : ''}
            </button>
            <span style="flex: 1;">${c.name}</span>
            <span class="text-mono text-muted" style="font-size: 0.8rem;">${Math.min(c.acquired, c.required)}/${c.required}</span>
          </div>`
          )
          .join('')}
      </div>
    </div>
  `;
}

function showUpgradeModal(editId) {
  const existing = editId ? getAll(COLLECTION).find((u) => u.id === editId) : null;

  const bodyHtml = `
    <div class="form-group">
      <label>Upgrade Name</label>
      <input type="text" id="f-name" value="${existing?.name || ''}" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Category</label>
        <select id="f-category">
          ${Object.entries(CATEGORIES)
            .map(([k, v]) => `<option value="${k}" ${existing?.category === k ? 'selected' : ''}>${v.label}</option>`)
            .join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>Description</label>
      <input type="text" id="f-desc" value="${existing?.description || ''}" />
    </div>
    <div class="form-group">
      <label>Components (one per line: name, required, acquired)</label>
      <textarea id="f-components" rows="6" style="font-family: var(--font-mono); font-size: 0.8rem;">${
        existing
          ? existing.components.map((c) => `${c.name}, ${c.required}, ${c.acquired}`).join('\n')
          : 'Titanium, 4, 0\nAdhesive, 2, 0'
      }</textarea>
      <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">Format: ComponentName, RequiredQty, AcquiredQty</div>
    </div>
  `;

  openModal({
    title: existing ? 'Edit Upgrade' : 'Add Upgrade',
    bodyHtml,
    saveLabel: existing ? 'Update' : 'Add Upgrade',
    onSave: () => {
      const name = document.getElementById('f-name').value.trim();
      if (!name) return;

      const compLines = document.getElementById('f-components').value.trim().split('\n');
      const components = compLines
        .map((line) => {
          const parts = line.split(',').map((s) => s.trim());
          if (parts.length < 2) return null;
          return {
            name: parts[0],
            required: parseInt(parts[1]) || 0,
            acquired: parseInt(parts[2]) || 0,
          };
        })
        .filter(Boolean);

      const data = {
        name,
        category: document.getElementById('f-category').value,
        description: document.getElementById('f-desc').value.trim(),
        components,
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
