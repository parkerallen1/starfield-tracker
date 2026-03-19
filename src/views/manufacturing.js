// Manufacturing Supply Chain view
import { getAll, create, update, remove } from '../data/store.js';
import { icons } from '../assets/icons.js';
import { setContentHeader, getContentBody } from '../components/layout.js';
import { openModal, closeModal, confirmDelete } from '../components/modal.js';

const COLLECTION = 'manufacturing';

const CATEGORY_COLORS = {
  Structural: 'cyan',
  Electronics: 'purple',
  Advanced: 'gold',
};

export function renderManufacturing() {
  setContentHeader(
    'Manufacturing',
    `<button class="btn btn-primary" id="add-recipe-btn">${icons.plus} Add Recipe</button>`
  );

  const body = getContentBody();
  refreshList(body);

  requestAnimationFrame(() => {
    document.getElementById('add-recipe-btn')?.addEventListener('click', () => showRecipeModal());
  });
}

function refreshList(container) {
  const recipes = getAll(COLLECTION);
  const body = container || getContentBody();

  if (recipes.length === 0) {
    body.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏭</div>
        <h3>No Recipes Configured</h3>
        <p>Add manufacturing recipes to track production quotas.</p>
        <button class="btn btn-primary" id="empty-add-recipe">${icons.plus} Add Recipe</button>
      </div>
    `;
    body.querySelector('#empty-add-recipe')?.addEventListener('click', () => showRecipeModal());
    return;
  }

  const totalQuota = recipes.reduce((s, r) => s + r.quota, 0);
  const totalProduced = recipes.reduce((s, r) => s + r.produced, 0);
  const overallPct = totalQuota > 0 ? Math.round((totalProduced / totalQuota) * 100) : 0;
  const facilities = [...new Set(recipes.map((r) => r.facility).filter(Boolean))];

  body.innerHTML = `
    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-value">${recipes.length}</div>
        <div class="stat-label">Active Recipes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value text-gold">${overallPct}%</div>
        <div class="stat-label">Quota Fulfillment</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalProduced}<span class="text-muted" style="font-size: 0.9rem;">/${totalQuota}</span></div>
        <div class="stat-label">Units Produced</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${facilities.length}</div>
        <div class="stat-label">Facilities</div>
      </div>
    </div>

    <div class="card-grid" id="recipe-grid"></div>
  `;

  renderCards(recipes);
}

function renderCards(recipes) {
  const grid = document.getElementById('recipe-grid');
  if (!grid) return;

  grid.innerHTML = recipes
    .map((r) => {
      const pct = r.quota > 0 ? Math.round((r.produced / r.quota) * 100) : 0;
      const catColor = CATEGORY_COLORS[r.category] || 'cyan';
      const progressColor = pct >= 100 ? 'green' : catColor;

      return `
      <div class="card" data-id="${r.id}">
        <div class="flex justify-between items-center" style="margin-bottom: var(--space-sm);">
          <div class="card-title">${r.output}</div>
          <span class="tag ${catColor}">${r.category}</span>
        </div>
        <div class="card-meta">${r.facility || 'Unassigned'}</div>

        <div class="card-body">
          <!-- Input → Output flow -->
          <div style="margin-bottom: var(--space-md); padding: var(--space-md); background: var(--bg-input); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap;">
              ${r.inputs
                .map(
                  (inp) =>
                    `<span class="tag">${inp.name} ×${inp.quantity}</span>`
                )
                .join(`<span class="text-muted" style="font-size: 0.7rem;">+</span>`)}
              <span style="color: var(--cyan); font-size: 0.9rem; margin: 0 4px;">${icons.arrow}</span>
              <span class="tag green">${r.output} ×${r.outputQty}</span>
            </div>
          </div>

          <!-- Production quota -->
          <div style="margin-bottom: var(--space-sm);">
            <div class="flex justify-between" style="font-size: 0.75rem; margin-bottom: var(--space-xs);">
              <span class="text-muted">Production Quota</span>
              <span class="text-${progressColor}">${r.produced}/${r.quota} (${pct}%)</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill ${progressColor}" style="width: ${Math.min(pct, 100)}%"></div>
            </div>
          </div>

          <!-- Quick increment -->
          <div class="flex gap-sm" style="margin-top: var(--space-md);">
            <button class="btn btn-sm btn-primary increment-btn" data-id="${r.id}" data-amount="1">+1 Produced</button>
            <button class="btn btn-sm increment-btn" data-id="${r.id}" data-amount="5">+5</button>
            ${r.produced > 0 ? `<button class="btn btn-sm btn-danger decrement-btn" data-id="${r.id}">-1</button>` : ''}
          </div>
        </div>

        <div class="card-actions">
          <button class="btn btn-sm edit-recipe" data-id="${r.id}">${icons.edit} Edit</button>
          <button class="btn btn-sm btn-danger delete-recipe" data-id="${r.id}">${icons.trash} Delete</button>
        </div>
      </div>`;
    })
    .join('');

  // Increment buttons
  grid.querySelectorAll('.increment-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const recipe = getAll(COLLECTION).find((r) => r.id === btn.dataset.id);
      if (recipe) {
        const amount = parseInt(btn.dataset.amount) || 1;
        update(COLLECTION, recipe.id, { produced: recipe.produced + amount });
        refreshList();
      }
    });
  });

  grid.querySelectorAll('.decrement-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const recipe = getAll(COLLECTION).find((r) => r.id === btn.dataset.id);
      if (recipe && recipe.produced > 0) {
        update(COLLECTION, recipe.id, { produced: recipe.produced - 1 });
        refreshList();
      }
    });
  });

  grid.querySelectorAll('.edit-recipe').forEach((btn) => {
    btn.addEventListener('click', () => showRecipeModal(btn.dataset.id));
  });

  grid.querySelectorAll('.delete-recipe').forEach((btn) => {
    btn.addEventListener('click', () => {
      const recipe = getAll(COLLECTION).find((r) => r.id === btn.dataset.id);
      confirmDelete(recipe?.output || 'this recipe', () => {
        remove(COLLECTION, btn.dataset.id);
        refreshList();
      });
    });
  });
}

function showRecipeModal(editId) {
  const existing = editId ? getAll(COLLECTION).find((r) => r.id === editId) : null;

  const bodyHtml = `
    <div class="form-group">
      <label>Recipe Name</label>
      <input type="text" id="f-name" value="${existing?.name || ''}" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Category</label>
        <select id="f-category">
          <option value="Structural" ${existing?.category === 'Structural' ? 'selected' : ''}>Structural</option>
          <option value="Electronics" ${existing?.category === 'Electronics' ? 'selected' : ''}>Electronics</option>
          <option value="Advanced" ${existing?.category === 'Advanced' ? 'selected' : ''}>Advanced</option>
        </select>
      </div>
      <div class="form-group">
        <label>Facility</label>
        <input type="text" id="f-facility" value="${existing?.facility || ''}" />
      </div>
    </div>
    <div class="form-group">
      <label>Inputs (one per line: name, quantity)</label>
      <textarea id="f-inputs" rows="4" style="font-family: var(--font-mono); font-size: 0.8rem;">${
        existing ? existing.inputs.map((i) => `${i.name}, ${i.quantity}`).join('\n') : 'Iron, 2\nAluminum, 1'
      }</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Output Name</label>
        <input type="text" id="f-output" value="${existing?.output || ''}" />
      </div>
      <div class="form-group">
        <label>Output Qty</label>
        <input type="number" id="f-outputQty" value="${existing?.outputQty || 1}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Quota</label>
        <input type="number" id="f-quota" value="${existing?.quota || 10}" />
      </div>
      <div class="form-group">
        <label>Produced</label>
        <input type="number" id="f-produced" value="${existing?.produced || 0}" />
      </div>
    </div>
  `;

  openModal({
    title: existing ? 'Edit Recipe' : 'Add Recipe',
    bodyHtml,
    saveLabel: existing ? 'Update' : 'Add Recipe',
    onSave: () => {
      const name = document.getElementById('f-name').value.trim();
      if (!name) return;

      const inputLines = document.getElementById('f-inputs').value.trim().split('\n');
      const inputs = inputLines
        .map((line) => {
          const parts = line.split(',').map((s) => s.trim());
          if (parts.length < 2) return null;
          return { name: parts[0], quantity: parseInt(parts[1]) || 1 };
        })
        .filter(Boolean);

      const data = {
        name,
        category: document.getElementById('f-category').value,
        facility: document.getElementById('f-facility').value.trim(),
        inputs,
        output: document.getElementById('f-output').value.trim(),
        outputQty: parseInt(document.getElementById('f-outputQty').value) || 1,
        quota: parseInt(document.getElementById('f-quota').value) || 10,
        produced: parseInt(document.getElementById('f-produced').value) || 0,
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
