// Reusable modal component
import { icons } from '../assets/icons.js';

let currentModal = null;

export function openModal({ title, bodyHtml, onSave, saveLabel = 'Save' }) {
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="btn btn-icon" id="modal-close-btn" aria-label="Close">${icons.close}</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-footer">
        <button class="btn" id="modal-cancel-btn">Cancel</button>
        <button class="btn btn-primary" id="modal-save-btn">${saveLabel}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  currentModal = overlay;

  // Event listeners
  overlay.querySelector('#modal-close-btn').addEventListener('click', closeModal);
  overlay.querySelector('#modal-cancel-btn').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  if (onSave) {
    overlay.querySelector('#modal-save-btn').addEventListener('click', () => {
      onSave();
    });
  }

  // Focus first input
  requestAnimationFrame(() => {
    const firstInput = overlay.querySelector('input, select, textarea');
    if (firstInput) firstInput.focus();
  });

  return overlay;
}

export function closeModal() {
  if (currentModal) {
    currentModal.remove();
    currentModal = null;
  }
}

export function confirmDelete(itemName, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal" style="max-width: 400px;">
      <div class="modal-header">
        <h2>Confirm Delete</h2>
      </div>
      <div class="modal-body">
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Are you sure you want to delete <strong style="color: var(--red);">${itemName}</strong>? This action cannot be undone.
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn" id="confirm-cancel">Cancel</button>
        <button class="btn btn-danger" id="confirm-delete">Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('#confirm-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  overlay.querySelector('#confirm-delete').addEventListener('click', () => {
    onConfirm();
    overlay.remove();
  });
}
