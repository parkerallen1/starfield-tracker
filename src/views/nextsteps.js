import { setContentHeader, getContentBody } from '../components/layout.js';
import { icons } from '../assets/icons.js';

const STORAGE_KEY = 'starfield_nextsteps_done';

function loadDone() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []); }
  catch { return new Set(); }
}

function saveDone(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

const GOALS = [
  {
    id: 'andraphon-setup',
    priority: 'HIGH',
    priorityColor: 'gold',
    title: 'Build out Andraphon Outpost',
    description: 'Andraphon Outpost is active but has 0 extractors, 0 storage, and no power — essentially an empty plot. Follow these steps in order to get it producing.',
    details: [
      '<strong>Power first</strong> — Solar arrays work well on Andraphon (no atmosphere = consistent solar output). Add enough capacity before anything else, since extractors and storage both draw power.',
      '<strong>Extractors</strong> — Andraphon has 4 resources: Aluminum, Beryllium, Helium-3, and Iron. He-3 and Beryllium are the most valuable for mid/late-game crafting — prioritize those. Add at least one extractor per resource you want to farm.',
      '<strong>Storage</strong> — Add storage containers matched to what you\'re extracting: gas storage for He-3, solid storage for Aluminum, Beryllium, and Iron. Extractors stop when storage is full.',
      '<strong>Cargo Link</strong> — Once you\'re producing, a cargo link to a hub outpost or vendor-adjacent system lets resources flow automatically without manual pickup runs.',
      '<strong>Medium-term goal</strong> — Use Andraphon\'s Aluminum + Iron to seed a manufacturing setup for crafted components like Adaptive Frames and Isocentered Magnets. These are high-demand items for ship building and modding.',
    ],
  },
  {
    id: 'outpost-iron-pair',
    priority: 'HIGH',
    priorityColor: 'gold',
    title: 'Set up new outpost: Iron + companion metal',
    description: 'Find a planet that has Iron paired with Nickel, Tungsten, Lead, or Copper. These combos co-locate two key materials in one outpost, cutting cargo link hops and enabling mid/late-game manufacturing chains.',
    details: [
      '<strong>Iron + Nickel</strong> — produces Nickel-Iron Alloy, a structural component used in advanced ship parts and industrial modules.',
      '<strong>Iron + Tungsten</strong> — Tungsten feeds Tungsten Carbide and weapon components; pairing with Iron lets you run structural and tooling fabrication from a single facility.',
      '<strong>Iron + Lead</strong> — Lead is used in shielding and some ammunition types. Co-locating with Iron reduces the number of cargo links needed for parts production.',
      '<strong>Iron + Copper</strong> — Copper is essential for wiring, power conduits, and electronics. This is one of the most versatile combos for an all-purpose manufacturing hub.',
      'Survey from orbit and look for biome convergence zones — the boundary between a rocky and a plains biome often yields two metallic resources within a single outpost boundary.',
      'Check the <strong>Cheyenne</strong>, <strong>Valo</strong>, and <strong>Olympus</strong> systems first — they have a high density of rocky/barren worlds with metallic resource pairs.',
    ],
  },
  {
    id: 'tier1-extraction-network',
    priority: 'HIGH',
    priorityColor: 'cyan',
    title: 'Build Tier 1 raw extraction outposts',
    description: 'Expansion outposts exist only to mine and ship — keep them lean. Add Grimsey, Bessel III-b, and Vega II-c to cover copper, nickel, cobalt, and tungsten alongside your Andraphon base.',
    details: [
      '<strong>Grimsey (Narion)</strong> — Aluminum, Copper, Iron, Lead. Close to Andraphon in the same system, so only a standard Cargo Link is needed (no He-3 cost).',
      '<strong>Bessel III-b</strong> — Copper, Nickel, Cobalt, Iron, Tetrafluorides. Cobalt unlocks Mag Pressure Tank and other mid-game recipes.',
      '<strong>Vega II-c</strong> — Tungsten, Nickel, Cobalt, Aluminum. Tungsten is needed for Tungsten Carbide and advanced weapon parts.',
      '<strong>Per-outpost setup</strong> — 4–8 Extractors per resource, matched solid/liquid/gas storage, minimum power (He-3 reactor or solar + wind combo), and 1 Cargo Link to your hub.',
      'Keep extraction outposts lean — no manufacturing, minimal crew, just extractors, storage, and a link out.',
    ],
  },
  {
    id: 'tier2-manufacturing-hub',
    priority: 'HIGH',
    priorityColor: 'cyan',
    title: 'Establish a central manufacturing hub',
    description: 'One planet receives all raw materials from extraction outposts and produces finished goods. Pick flat terrain with strong power options — He-3 or a star with good solar yield.',
    details: [
      '<strong>Storage</strong> — Large or Industrial Storage for each incoming material type. Organize by solid/liquid/gas to avoid mixed-type bottlenecks.',
      '<strong>Manufacturers</strong> — Pharmaceutical Lab, Industrial Workbench, Research Lab as needed. Prioritize Adaptive Frame and Isocentered Magnet production early.',
      '<strong>Cargo Link - Intersystem</strong> — Required for cross-system routes. Costs He-3 to run, so ensure Andraphon is fully supplying He-3 before activating.',
      '<strong>Power</strong> — Aim for 60+ units capacity using He-3 reactors. Manufacturing draws heavy power; solar alone won\'t cut it at hub scale.',
      '<strong>Recommended network</strong> — Andraphon and Grimsey feed raw metals → Hub manufactures components → Intersystem link delivers finished goods wherever needed.',
    ],
  },
  {
    id: 'cargo-link-network',
    priority: 'MED',
    priorityColor: 'purple',
    title: 'Configure directional cargo link network',
    description: 'Cargo links are directional — each link has a designated sender and receiver. Plan your network so every extraction outpost feeds the hub, not each other.',
    details: [
      '<strong>Same-system links</strong> — Standard Cargo Link, free to operate. Use for Andraphon → Hub and Grimsey → Hub if they share a system.',
      '<strong>Cross-system links</strong> — Cargo Link - Intersystem required. Costs He-3 per shipment, so always prioritize He-3 extraction first.',
      '<strong>He-3 is the bottleneck</strong> — Every active intersystem link burns He-3. Make sure Andraphon\'s He-3 extractors are running before enabling long-distance routes.',
      'Each link carries all resource types simultaneously — you don\'t need separate links per material.',
      'Label outpost storage clearly (use the outpost naming convention) so you can track which materials are backing up when links get saturated.',
    ],
  },
  {
    id: 'key-materials-priority',
    priority: 'MED',
    priorityColor: 'green',
    title: 'Secure the 5 key materials for self-sufficiency',
    description: 'These five materials underpin almost every outpost build and crafting recipe. Prioritize them in order — each unlocks the next tier of production.',
    details: [
      '<strong>1. Aluminum</strong> — Required in virtually every construction recipe. Andraphon already covers this; make sure extractors are running.',
      '<strong>2. Iron</strong> — Structural components across the board. Andraphon has Iron too — pair with a second planet for redundancy.',
      '<strong>3. Beryllium</strong> — Used in reactors and power components. Andraphon is one of the best sources; protect this outpost.',
      '<strong>4. Copper</strong> — Wiring, electronics, power conduits. Not on Andraphon — Grimsey or Bessel III-b should cover this next.',
      '<strong>5. He-3</strong> — Powers all intersystem cargo links. Andraphon is ideal for He-3. Do not let He-3 storage fill and halt extraction.',
      'Your Andraphon outpost already covers He-3, Al, Be, and Fe — the strongest possible start. Adding Copper/Nickel from a second planet unlocks the majority of remaining manufacturing recipes.',
    ],
  },
];

export function renderNextSteps() {
  setContentHeader('Next Steps');
  const body = getContentBody();
  const done = loadDone();
  const total = GOALS.length;
  const doneCount = GOALS.filter(g => done.has(g.id)).length;

  body.innerHTML = `
    <div class="nextsteps-intro">
      <span class="nextsteps-intro-icon">${icons.nextSteps}</span>
      <div>
        <div class="nextsteps-intro-title">Goals & Next Steps</div>
        <div class="nextsteps-intro-sub">Track your next objectives. Check off goals as you complete them — progress is saved locally.</div>
        <div class="nextsteps-progress">${doneCount} / ${total} COMPLETE</div>
      </div>
    </div>
    <div class="goal-list">
      ${GOALS.map(g => {
        const isDone = done.has(g.id);
        return `
        <div class="goal-card ${isDone ? 'done' : ''}" data-goal="${g.id}">
          <div class="goal-card-header" data-toggle="${g.id}">
            <button class="goal-checkbox" data-check="${g.id}" title="${isDone ? 'Mark incomplete' : 'Mark complete'}">
              ${isDone ? icons.check : ''}
            </button>
            <div class="goal-card-header-mid">
              <span class="tag ${g.priorityColor}">${g.priority}</span>
              <span class="goal-card-title">${g.title}</span>
            </div>
            <span class="goal-chevron">${icons.chevronDown}</span>
          </div>
          <div class="goal-card-body">
            <p class="tips-intro-text">${g.description}</p>
            <ul class="tips-list">
              ${g.details.map(d => `
                <li class="tips-item">
                  <span class="tips-bullet">${icons.arrow}</span>
                  <span>${d}</span>
                </li>`).join('')}
            </ul>
          </div>
        </div>`;
      }).join('')}
    </div>
  `;

  // Accordion toggle (clicking header row, but not the checkbox)
  body.querySelectorAll('.goal-card-header').forEach(header => {
    header.addEventListener('click', e => {
      if (e.target.closest('.goal-checkbox')) return;
      const card = header.closest('.goal-card');
      const isOpen = card.classList.contains('open');
      body.querySelectorAll('.goal-card').forEach(c => c.classList.remove('open'));
      if (!isOpen) card.classList.add('open');
    });
  });

  // Checkbox toggle
  body.querySelectorAll('.goal-checkbox').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.check;
      const updated = loadDone();
      if (updated.has(id)) { updated.delete(id); } else { updated.add(id); }
      saveDone(updated);
      renderNextSteps();
    });
  });

  // Open first incomplete goal by default
  const firstIncomplete = body.querySelector('.goal-card:not(.done)');
  (firstIncomplete ?? body.querySelector('.goal-card'))?.classList.add('open');
}
