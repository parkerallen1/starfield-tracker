// Seed data for all 5 databases

export const seedPlanets = [
  {
    id: 'p1',
    name: 'Andraphon',
    system: 'Narion',
    biome: 'Barren',
    gravity: '0.07 G',
    atmosphere: 'None',
    temperature: 'Frozen',
    resources: ['Aluminum', 'Beryllium', 'Helium-3', 'Iron'],
    notes: '',
    surveyed: true,
  },
];

export const seedOutposts = [
  {
    id: 'o1',
    name: 'Andraphon Outpost',
    planet: 'Andraphon',
    system: 'Narion',
    status: 'active',
    focus: '',
    powerCapacity: 0,
    powerUsed: 0,
    extractors: 0,
    storageUnits: 0,
    cargoLinks: [],
    notes: '',
  },
];

export const seedManufacturing = [];

