import { setContentHeader, getContentBody } from '../components/layout.js';
import { icons } from '../assets/icons.js';

const SECTIONS = [
  {
    id: 'location',
    category: 'Foundation',
    color: 'cyan',
    title: 'Planetary Selection & Convergence Points',
    intro: 'Finding the right location dictates the efficiency of the entire outpost network. Instead of building on the first planet available, scan from orbit and look for convergence points where multiple resource biomes intersect.',
    tips: [
      'The most critical starting resources are <strong>Aluminum</strong> and <strong>Iron</strong> to manufacture Adaptive Frames.',
      '<strong>Andraphon</strong> (Narion system) and <strong>Bessel III-b</strong> are premier starter locations. Landing near the border of a crater and mountain biome gives you Aluminum, Iron, and Helium-3 within a single outpost boundary.',
      '<strong>Helium-3</strong> is mandatory for powering interstellar cargo ships. A location that natively provides it alongside building materials eliminates the need to import fuel.',
    ],
  },
  {
    id: 'skills',
    category: 'Skills',
    color: 'purple',
    title: 'Core Skill Investments',
    intro: 'The Science and Social skill trees contain mandatory perks for large-scale operations.',
    tips: [
      '<strong>Research Methods</strong> reduces material cost of unlocking new modules and occasionally auto-completes research steps for free.',
      '<strong>Outpost Engineering</strong> unlocks advanced extractors, superior generators, and high-tier fabricators. Maxing it cuts building cost of all structures by half.',
      '<strong>Planetary Habitation</strong> raises the global outpost cap from 8 up to 24 and unlocks building on extreme-environment planets — which house the rarest tier-3 and tier-4 resources.',
      '<strong>Outpost Management</strong> increases the number of cargo links, crew members, and robots allowed per outpost.',
      '<strong>Botany & Zoology</strong> are required to build greenhouses and animal husbandry facilities for automating organic resources like adhesives, sealants, and structural materials.',
    ],
  },
  {
    id: 'extraction',
    category: 'Automation',
    color: 'green',
    title: 'Extraction & Storage Automation',
    intro: 'Efficient resource management relies on output links to prevent bottlenecks.',
    tips: [
      'Resource extractors hold very little inventory. Use <strong>modify mode</strong> to draw an output link directly from each extractor to a designated storage container.',
      'Create <strong>storage chains</strong> by linking one container to the next — when the first fills, overflow automatically pushes to the next in the sequence.',
      'Build a <strong>Transfer Container</strong> near the landing pad. Linking local storage to it lets you access and move outpost inventory directly from the ship\'s cargo hold without becoming overencumbered.',
      '<strong>Solar and wind power fluctuate</strong> based on atmospheric density and planetary rotation. Nuclear or fueled generators provide a stable baseline power supply regardless of environment.',
    ],
  },
  {
    id: 'cargo',
    category: 'Logistics',
    color: 'gold',
    title: 'Cargo Link Logistics & Network Design',
    intro: 'Moving resources between planets is the most complex mechanic and requires strict traffic control to avoid gridlock.',
    tips: [
      '<strong>Standard Cargo Links</strong> move materials between planets in the same star system and require no fuel.',
      '<strong>Inter-System Cargo Links</strong> move materials across the galaxy but require a constant feed of Helium-3 into the fuel tank on the cargo pad.',
      '<strong>Never mix resources on a single cargo link.</strong> The faster-producing resource will fill the entire cargo ship, choking off supply of the slower one. Dedicate one cargo link per resource type.',
      'Use a <strong>hub-and-spoke model</strong> instead of daisy-chaining outposts. Designate one central planet as your manufacturing hub and have all raw extraction outposts ship their single resource directly there.',
      'Route incoming Helium-3 through a <strong>dedicated gas storage container</strong> before linking it to the fuel tank of an Inter-System Cargo Link — prevents fuel lines from drying up during transit cycles.',
    ],
  },
  {
    id: 'manufacturing',
    category: 'Advanced',
    color: 'cyan',
    title: 'Advanced Manufacturing & XP Farming',
    intro: 'Outposts serve as an infinite source of credits and experience points when optimized.',
    tips: [
      'Route Aluminum and Iron extractors into a shared storage array connected to an <strong>Industrial Workbench</strong> to craft thousands of Adaptive Frames in minutes. Crafting grants XP per item for rapid leveling.',
      'Sleeping on <strong>high time-dilation planets</strong> (like Venus in Sol) forces the engine to calculate hundreds of hours of local extraction time in seconds — instantly filling all linked storage containers.',
      'High-tier items like <strong>Vytinium Fuel Rods</strong> or <strong>Aldumite Drilling Rigs</strong> require routing four or five processed components into a Multiplex Fabricator. Use powered switches to toggle Fabricators off when not needed to protect raw material stockpiles.',
    ],
  },
  {
    id: 'defense',
    category: 'Defense & QoL',
    color: 'red',
    title: 'Outpost Defense & Quality of Life',
    intro: 'Protect your investment and maximize crew efficiency.',
    tips: [
      'Assign companions with <strong>Outpost Management</strong> and <strong>Outpost Engineering</strong> skills to a Crew Station to passively buff the facility\'s output.',
      'Build the <strong>Superior Landing Pad with Shipbuilder</strong> — it provides access to ship parts from nearly every manufacturer in the game, allowing centralized ship customization.',
      'Install <strong>Bounty Clearance Terminals and Mission Boards</strong> to handle faction bounties and acquire new contracts safely.',
      '<strong>Hostile wildlife and pirate raids</strong> target power generators and extractors first. Max the six-turret limit using highest-tier ballistic or laser defenses, and always repair damaged modules via the modify menu after an attack.',
    ],
  },
];

const COLOR_TAG = { cyan: 'cyan', purple: 'purple', green: 'green', gold: 'gold', red: 'red' };

export function renderTips() {
  setContentHeader('Tips & Guides');
  const body = getContentBody();

  body.innerHTML = `
    <div class="tips-intro">
      <span class="tips-intro-icon">${icons.tips}</span>
      <div>
        <div class="tips-intro-title">Outpost Mastery Guide</div>
        <div class="tips-intro-sub">Strategies for building an optimized interstellar resource network — from your first landing pad to a galaxy-spanning industrial empire.</div>
      </div>
    </div>
    <div class="tips-grid">
      ${SECTIONS.map(s => `
        <div class="tips-card" data-section="${s.id}">
          <div class="tips-card-header" data-toggle="${s.id}">
            <div class="tips-card-header-left">
              <span class="tag ${COLOR_TAG[s.color]}">${s.category}</span>
              <span class="tips-card-title">${s.title}</span>
            </div>
            <span class="tips-chevron">${icons.chevronDown}</span>
          </div>
          <div class="tips-card-body" id="tips-body-${s.id}">
            <p class="tips-intro-text">${s.intro}</p>
            <ul class="tips-list">
              ${s.tips.map(t => `<li class="tips-item"><span class="tips-bullet">${icons.arrow}</span><span>${t}</span></li>`).join('')}
            </ul>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Accordion toggle
  body.querySelectorAll('[data-toggle]').forEach(header => {
    header.addEventListener('click', () => {
      const card = header.closest('.tips-card');
      const isOpen = card.classList.contains('open');
      // Close all
      body.querySelectorAll('.tips-card').forEach(c => c.classList.remove('open'));
      // Open clicked if it was closed
      if (!isOpen) card.classList.add('open');
    });
  });

  // Open first section by default
  body.querySelector('.tips-card')?.classList.add('open');
}
