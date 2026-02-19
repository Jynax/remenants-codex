# REMNANTS
### Project Document v0.3

---

## Overview

**Remnants** is a single-player, browser-based extraction shooter with base-building and character progression elements. The player controls a **House** — a clan/lineage of survivors — sending individual characters into the frontier to scavenge, fight, and extract. Characters are expendable. The House endures.

The core loop: Venture out into dangerous zones, scavenge resources and technology, survive encounters with alien life, and extract back to your home base. Between runs, upgrade your House, benefit from accumulated knowledge, and send the next Remnant out better prepared.

**Inspirations:** Escape from Tarkov, Arc Raiders, Shadowrun (tone/aesthetic), Kenshi, S.T.A.L.K.E.R.

---

## Core Pillars

1. **Tension & Stakes** — Every expedition has risk. Death means losing what you carried. Extraction isn't guaranteed. But even death teaches the House something.

2. **Meaningful Progression** — Operates on two timescales: the *character* (individual run adaptation, risk of mutation/injury) and the *House* (generational knowledge, tiny incremental bonuses, accumulated lore). Characters are expendable. The House endures.

3. **Emergent Storytelling** — The world has history. Creatures have ecology. Discovery is part of the reward. Items and fauna are unknown until catalogued through play.

4. **Grounded Sci-Fi** — No "magic" label, but alien biology and evolved human abilities can feel magical. Technology is advanced but often degraded, jury-rigged, or misunderstood.

5. **Accessible Complexity** — Deep systems, but learnable. No wiki required to start playing. The game teaches through discovery, not tutorials.

---

## Lore Summary

**500 years from now**, Earth launched hundreds of colony ships in a desperate bid to save humanity. 95% failed. One ship — a prison colony vessel carrying society's "undesirables" (criminals real and political) — crash-landed on a barely habitable world.

**The crash** killed 50% of the colonists. The survivors faced a hostile planet: heavy gravity, thin atmosphere, alien ecosystems, and indigenous life of varying intelligence.

**Three generations later**, the Remnants have adapted. Denser bones, enhanced lungs, and bodies shaped by necessity and science. They've salvaged what they can from the ship's wreckage, built settlements, and fractured into factions. Some retain old Earth morality; others have embraced the brutality their ancestors were accused of.

**The player's House** is one such faction — a small clan of survivors working to understand this world and carve out a future. Each character sent into the frontier is a member of this House. Their discoveries, their adaptations, their deaths all feed back into the collective knowledge of the lineage.

**The planet** is in evolutionary flux — dangerous, alien, but rich with resources. Native species range from animalistic predators to something approaching sapience. Ancient ruins suggest something came before. The flora blurs the line between plant and creature.

**Technology** exists in layers: Earth-tech relics (powerful but scarce), Remnant adaptations (jury-rigged, understood), and alien biology (mysterious, potent). AI systems from the ship have had generations to... change.

---

## The House System (Meta-Progression)

The House is the persistent entity. Characters are its instruments.

### Death Outcomes

Not every death is the same:

- **Clean Death** (killed quickly, early in run) — House learns almost nothing. A scrap of map data from where the body was found. The next character inherits very little.

- **Veteran Death** (character survived many runs, finally goes down) — The House inherits significantly. That character's experience, mutations, and knowledge fold into the House's gene pool. But losing a veteran hurts — their gear is gone, and the next character starts physically fresh.

- **Survival-at-a-Cost** (near-death) — Sometimes a "death" is actually a near-death. Character returns but *changed*. Lost an arm, gained pheromone sensitivity. Lost stamina, gained dark vision. The player must decide: keep running this damaged-but-evolved character, or retire them to pass their knowledge to the House?

### House Bonuses

- Incremental and tiny: +0.5% health, slightly better starting fog reveal, marginal speed increase
- Designed so grinding deaths is never a strategy — the bonuses from a quick death are negligible
- A character who survives 10+ runs and retires grants a meaningful House upgrade
- Some bonuses may have tradeoffs or negative side effects (mutations aren't always clean)
- The accumulation of small edges over many generations *is* the progression — mirrors the lore of three generations of adaptation

### Character Lifecycle

A character accumulates wear through survival:
- Near-death events grant adaptations but cost something (health cap, stamina, a limb)
- Eventually a character becomes too damaged to continue effectively
- The player chooses: one more run (risk losing them and their knowledge), or retire (safe transfer to House)
- This creates a natural tension between greed and prudence — the core extraction shooter feeling, applied to the character themselves

---

## Creature Ecology

The planet's fauna operates on a spectrum of temperament, not a binary hostile/friendly model.

### Temperaments

| Type | Behavior | Eyes | Combat | Drops |
|------|----------|------|--------|-------|
| **Aggressive** (e.g., Stalker) | Hunts player on sight. Fast, dangerous. | Red | Attacks immediately at range | Chitin Shards, Biosamples |
| **Territorial** (e.g., Thornback) | Ignores player unless approached too closely or attacked. Tough. | Orange | Only fights when provoked, then relentless | Alloy Plates, Chitin Shards |
| **Skittish** (e.g., Glimmer) | Flees when player approaches. Harmless but fast. Bioluminescent. | Green | Does not attack. Must be chased down. | Biolumen Glands, Xenoflora |

### Discovery

- All creatures appear as "Unknown Fauna" until the player engages with them
- Hitting a creature or getting close to a Glimmer catalogues the species
- Once catalogued, the creature's name and temperament tag appear on subsequent encounters
- Fauna catalogue persists across runs (House knowledge)

### Xenoflora (Interactive Plants)

Stationary organisms that blur plant/creature lines:
- **Sporepods** — Release clouds with random effects (heal, poison, reveal loot). Effects discovered through interaction.
- **Thornvines** — Damage if walked through, but yield samples if harvested (attacked).
- **Lumenblooms** — Increase fog reveal radius temporarily. Destroyed if attacked.

These teach the player that the world rewards careful observation over aggression.

---

## Discovery System

Knowledge accumulates across runs and persists within a session (future: persistent saves).

### What Gets Discovered

| Category | Unknown State | Discovery Trigger | Known State |
|----------|--------------|-------------------|-------------|
| Salvage items | "??? Unknown" | Extract with item | Name, description, value visible |
| Creature species | "Unknown Fauna" | Hit or approach closely | Name, temperament, behavior |
| Map terrain | Fog of war (black) | Walk near tiles | Permanently revealed |
| Extraction zone | Arrow indicator only | Walk to zone | Appears on minimap |
| Xenoflora effects | Unknown | Interact | Effect catalogued |

### Design Intent

The discovery system serves pillar #3 (Emergent Storytelling) and #5 (Accessible Complexity). A new player exploring for the first time has a genuine sense of the unknown. A veteran player has hard-won knowledge that makes them more efficient — but the world remains dangerous.

---

## Science & Speculation Framework

**The Rule:** *Grounded where we can be, imaginative where we must be.*

### Tier 1: Known Physics
When real science applies and enhances gameplay, we use it accurately.
- Gravity effects on movement, projectiles, fatigue
- Atmospheric density affecting respiration, fire, sound propagation
- Biology basics (evolution pressures, adaptation costs)

### Tier 2: Extrapolated Science
Where current theory exists but isn't proven, we extrapolate thoughtfully.
- Speculative physics (effects of living on a super-Earth long-term)
- AI evolution over generations without human oversight
- Genetic adaptation timelines (compressed for gameplay, but directionally plausible)

### Tier 3: Fictional Science (The Fun Zone)
Where we don't know — or where knowing would limit us — we invent with internal consistency.
- Alien biology that seems "magical" (bioluminescent navigation, pheromone-based telepathy, organic EMP)
- Xenoflora with macro-scale chemical effects
- Whatever the planet's previous inhabitants left behind

*The only rule: it has to be internally consistent. Our fake science has to follow its own logic.*

---

## Technical Approach

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Platform | Browser (React JSX artifacts) | No install friction, playable in Claude's code preview |
| Graphics | 2D, top-down canvas rendering | Achievable scope, performant, good art direction potential |
| Framework | React (component lifecycle) + Canvas (game loop) | React manages state/screens, Canvas handles 60fps rendering |
| Game State | React state + Refs | State for UI (screens, character), refs for game loop (timers, flags, messages) |
| Version Control | GitHub (planned) | Not yet implemented (Phase 3+) |
| AI Testing | Yes | Claude playtests each build, player (Michael) provides real feedback |

### Resolved Design Questions

| Question | Decision | Rationale |
|----------|----------|-----------|
| Visual style | Gritty, muted palette with colored accents | Matches tone; dark greens, browns, amber highlights |
| Camera | Top-down | Simplest, works well with fog of war |
| Combat | Real-time click-to-attack with arc/cooldown | Feels active; rewards positioning |
| Tone | Dark but with discovery as hope | Tension from danger, reward from knowledge |
| Base UI | Menu-based management screen | Functional first; spatial base can come later |
| Crafting scope | Workstation-based with discovery | Simple meaningful choices over complex trees |

---

## Phase Status

### Phase 1: "The Vertical Slice" — COMPLETE ✓

- [x] Control a character on a 2D map
- [x] See a defined extraction zone
- [x] Pick up items
- [x] Threats/obstacles
- [x] Successfully extract
- [x] Run complete summary

### Phase 1 Bonus (completed ahead of schedule)

- [x] Fog of war (persistent across runs)
- [x] Click-to-attack combat with knockback and stagger
- [x] Creature ecology (3 temperaments: aggressive, territorial, skittish)
- [x] Creature loot drops
- [x] Item and creature discovery/catalogue system
- [x] Extraction direction indicator with distance
- [x] Minimap with fog, proximity enemy detection
- [x] Floating damage/pickup text
- [x] Inventory slot HUD (6 slots)
- [x] Persistent map and tile colors across runs
- [x] Interactive Xenoflora (Sporepods, Thornvines, Lumenblooms)

### Phase 2.1: Home Base Foundation — COMPLETE ✓

**Built:**
- [x] Base screen with character roster and House knowledge display
- [x] Recovery timer system (5min base, scales +5min per zone depth)
- [x] Body markers on map (skull beacon, minimap indicator)
- [x] Recovery interaction (press E near body)
- [x] Degraded loot recovery (10-20% instant loss, 10% per 30s tick)
- [x] Character generation system (Remnant-XXXX naming)
- [x] Game flow redesign (Title → Base → Deploy → Game → Summary → Base)
- [x] Multi-run stability fixes

**Key Features:**
- House Knowledge tracker (Salvage/Fauna/Flora counts persist across runs)
- Active Character display (name, health, status, runs completed)
- Recovery timer with visual urgency (color shifts, pulsing when critical)
- Body location markers (visible once fog reveals, beacon on minimap)
- Degradation calculation (items recovered = floor(total * recoveryPercent))
- One-time recovery per body (new death overrides old marker)

**Design Principles Validated:**
- Death is meaningful without being purely punitive
- Time pressure creates real tension
- House knowledge accumulates naturally through play
- Characters feel expendable, House feels permanent

### Phase 2.2: Workstations & Crafting — NEXT

**Priority 1:** Polish existing systems
- Visual refinement (sprites, terrain variety, effects)
- Balance tuning (creature stats, loot distribution, map pacing)
- Feel improvements based on extended playtesting

**Priority 2:** Workstation System
- Default stations: Medical Bay, Tech Bench, Bio Lab
- Simple interaction model (drag items to station)
- Discovery-driven recipes (experiment to learn)
- Station UI design

**Priority 3:** Item Interactions
- Combine: Two items → one result
- Extract: Break down items → raw materials
- Use: Consume items for immediate effects
- Experiment: Try unknown combinations

### Phase 2.3: Character Wear & Mutations — PLANNED

- Track near-death events during runs
- Mutation triggers and effects (knowledge-driven randomness)
- Visual indication of character modifications
- Retire mechanic (safe knowledge transfer to House)
- House bonus system implementation
- Veteran death knowledge inheritance

---

## What We're NOT Doing

| NOT Doing | Why |
|-----------|-----|
| Multiplayer (for now) | Massive complexity increase. Single-player first, always. |
| Licensed Shadowrun IP | Legal risk. We're inspired by, not copying. |
| Realistic 3D graphics | Scope explosion. 2D can be beautiful and achievable. |
| Procedural generation (initially) | Hand-crafted maps first. Proc-gen is a rabbit hole. |
| Complex crafting trees | Keep it simple early. Depth comes from *meaningful* choices, not quantity. |
| Mobile optimization | Desktop browser first. Mobile is a different beast. |
| Monetization design | Make it good first. Business model is a later problem. |
| Perfect balance | We'll iterate. Playable beats polished. |
| Named characters (for now) | Numerical designations (Remnant-XXXX) fit the theme better. House name customization may come later. |
| Multiple body markers | One active recovery at a time. New death overrides old marker. Keeps system simple. |
| Permanent character progression | Characters are expendable. Progression lives in the House. Matches lore and prevents grinding. |

---

## Working Agreement

- **Michael:** Vision, feedback, creative direction, playtesting, final decisions on feel/tone/lore
- **Claude:** Technical implementation, architecture decisions, first-pass testing, design collaboration
- **Process:** Small iterations, always playable, questions welcome anytime. One specific feedback question per iteration. Lore and theme changes get captured in this document.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2025-02-17 | Initial document |
| 0.2 | 2025-02-17 | Phase 1 complete. Added: House meta-progression system, creature ecology, discovery system, xenoflora plans, resolved design questions, updated technical approach to React/Canvas, reorganized phases based on actual progress. |
| 0.3 | 2025-02-18 | Phase 2.1 complete. Added: Recovery system details, character lifecycle, Phase 2.1 status, updated "What We're NOT Doing" section, version control and game state rows in Technical Approach. |

---

*This document evolves as the project evolves.*
