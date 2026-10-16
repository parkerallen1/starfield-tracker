// Centralized data store using localStorage
import {
  seedPlanets,
  seedOutposts,
  seedManufacturing,
} from './seed.js';

const STORAGE_PREFIX = 'starfield_';
const COLLECTIONS = {
  planets: seedPlanets,
  outposts: seedOutposts,
  manufacturing: seedManufacturing,
};

const SEED_VERSION = '3';

// Initialize seed data, resetting if seed version changed
function initStore() {
  const versionKey = STORAGE_PREFIX + 'seed_version';
  if (localStorage.getItem(versionKey) !== SEED_VERSION) {
    for (const [key, seed] of Object.entries(COLLECTIONS)) {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(seed));
    }
    localStorage.setItem(versionKey, SEED_VERSION);
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
