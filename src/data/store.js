// Centralized data store using localStorage
import {
  seedPlanets,
  seedOutposts,
  seedUpgrades,
  seedManufacturing,
  seedTrade,
} from './seed.js';

const STORAGE_PREFIX = 'starfield_';
const COLLECTIONS = {
  planets: seedPlanets,
  outposts: seedOutposts,
  upgrades: seedUpgrades,
  manufacturing: seedManufacturing,
  trade: seedTrade,
};

// Initialize seed data on first load
function initStore() {
  for (const [key, seed] of Object.entries(COLLECTIONS)) {
    const storageKey = STORAGE_PREFIX + key;
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(seed));
    }
  }
}

// CRUD operations
export function getAll(collection) {
  const raw = localStorage.getItem(STORAGE_PREFIX + collection);
  return raw ? JSON.parse(raw) : [];
}

export function getById(collection, id) {
  return getAll(collection).find((item) => item.id === id) || null;
}

export function create(collection, item) {
  const items = getAll(collection);
  item.id = generateId();
  items.push(item);
  save(collection, items);
  return item;
}

export function update(collection, id, updates) {
  const items = getAll(collection);
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates };
  save(collection, items);
  return items[idx];
}

export function remove(collection, id) {
  const items = getAll(collection).filter((item) => item.id !== id);
  save(collection, items);
}

export function save(collection, items) {
  localStorage.setItem(STORAGE_PREFIX + collection, JSON.stringify(items));
}

export function resetCollection(collection) {
  const seed = COLLECTIONS[collection];
  if (seed) {
    localStorage.setItem(STORAGE_PREFIX + collection, JSON.stringify(seed));
  }
}

export function resetAll() {
  for (const key of Object.keys(COLLECTIONS)) {
    resetCollection(key);
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Auto-initialize on import
initStore();
