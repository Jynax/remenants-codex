# REMNANTS â€” Development Log

---

## Session 1 â€” February 17, 2025

### Phase 1.0: The Vertical Slice

**Goal:** Get a playable browser game running with the core extraction loop.

**Built:**
- 60Ã—45 tile procedural map with terrain types (ground, rock, wreckage, flora)
- WASD movement + SHIFT sprint
- 12 loot items scattered across the map (random types from 6 item categories)
- 9 hostile enemies with patrol/chase AI
- 4-slot inventory with pickup on proximity
- Extraction zone in the bottom-right corner
- Run summary screen (time, health, items recovered)
- Title screen with flavor text
- HUD: health bar, inventory slots, minimap
- React component architecture with Canvas rendering at 60fps

**First Playtest (Michael):**
- Successfully extracted: 4 items, 76% health, 1:43
- **Issues identified:**
  1. Navigation unclear â€” didn't know where to go
  2. Visual elements too small (playing in Claude's side panel)
  3. Inventory limit (4 slots) felt too restrictive for exploration
  4. No combat option â€” only avoidance
  5. Uncertain about item values as a new player

**Key Decision:** The navigation problem led to the fog of war design. Instead of showing the whole map, start with limited visibility and let the player reveal it through exploration. This solves navigation (gives purpose to movement) AND creates progression (map knowledge persists across runs).

---

### Phase 1.2: Fog of War, Combat, Discovery

**Built (same session):**
- **Fog of war system** â€” 6-tile reveal radius, unexplored tiles blacked out, fog edge dimming
- **Click-to-attack combat** â€” 38px range, 72Â° arc, 0.5s cooldown, visible slash animation
- **Enemy health system** â€” 3 HP each, knockback on hit, white hit-flash, particle burst on death
- **Item discovery** â€” items show as "??? Unknown" until first extraction, then permanently identified
- **Persistent knowledge** â€” discovered items tracked via ref, survive across runs within session
- **Floating text** â€” damage numbers, item pickups, kills
- **Inventory expansion** â€” 4â†’6 slots
- **Larger sprites** â€” player 14Ã—14, enemies 18Ã—18, loot 10Ã—10
- **Enhanced minimap** â€” only shows revealed tiles, hides fogged entities
- **Direction indicator** â€” always points toward extraction zone

**Second Playtest (Michael):**
- Fog of war worked well â€” liked the exploration loop
- Combat felt good: "I like that I have a way to fight, but that it costs me"
- **Bug found:** Map and fog not persisting across runs (reset on redeploy)
- **Request:** Show extraction zone even when far away (player should know where pickup is)

---

### Phase 1.3: Persistent Map + Extraction Indicator

**Built:**
- **Persistent map/fog refs** â€” map generates once, fog reveals carry across runs
- **Persistent tile colors** â€” visual consistency between runs
- **Extraction zone always visible** â€” pulsing green arrow at screen edge with distance readout
- **Minimap EZ** â€” only shows after player has physically discovered it via fog reveal

**Third Playtest (Michael):**
- Fog persistence confirmed working
- Extraction indicator "Love it"
- Item discovery working across runs â€” known items show names on subsequent runs

---

### Phase 1.4: Creature Ecology

**Design conversation:** Michael suggested that not all creatures should be aggressive. Some should be passive, some should flee. The player would "discover" behavior through interaction, like they discover items. Led to the three-temperament system.

**Built:**
- **Stalkers** (aggressive, red eyes) â€” hunt on sight, fast, 3 HP, 15 damage
- **Thornbacks** (territorial, orange eyes) â€” ignore until provoked, then relentless, 4 HP, 18 damage
- **Glimmers** (skittish, green eyes) â€” flee on approach, bioluminescent glow, 1 HP, harmless, fast
- **Creature discovery** â€” all show as "Unknown Fauna" until engaged, then catalogued with name + temperament tag
- **Creature loot drops** â€” each type has specific drop table with percentage chances
- **Two new loot types** â€” Chitin Shard, Biolumen Gland
- **Improved knockback** â€” 14px with 12-frame stagger animation (creature can't act while staggered)
- **Creature catalogue** â€” tracked across runs, shown in summary screen

**Fourth Playtest (Michael):**
- "I feel like I want to run a little when I see the Thornbacks, but then I want to get closer when I see they aren't going to attack me right away"
- Chased a Glimmer, enjoyed the speed challenge
- "After I discover what they do, I'm more curious" â€” emergent storytelling working
- **New idea:** Stationary creatures (plants) with random effects, discoverable through interaction

**Key Design Conversation â€” The House System:**
Michael proposed the meta-progression concept. Key ideas:
1. Player controls a "House" (clan), not just a character
2. Death outcomes vary: clean death (little learning), veteran death (significant inheritance), survival-at-a-cost (character returns changed/mutated)
3. House bonuses are tiny and incremental â€” never worth grinding deaths
4. Characters accumulate wear through survival â†’ eventually retire or risk one more run
5. Mutations should *seem* random early but become predictable as the House learns more about the planet's biology. "Knowledge reduces randomness, but never eliminates it."

---

## Session 2 â€” February 18, 2025

### Priority Ranking (Player Choice)
1. Polish what we have (balance, visuals)
2. Interactive xenoflora
3. Home base
4. Inventory & loot depth

### Phase 1.5: Balance & Terrain Polish

**Design conversation:** Michael proposed a multi-zone model where Zone 1 is a relatively safe training ground, with danger scaling as you push into deeper zones. Instead of making Zone 1 harder, keep it approachable and build difficulty outward.

**Built:**
- **Empty extraction allowed** â€” can bail without loot, summary reflects "Nothing recovered"
- **Intentional loot placement** â€” 10 items (down from 12 random), placed by risk/reward:
  - Safe items (Alloy Plate, Xenoflora) near spawn
  - Mid-value items (Biosamples, Data Shard, Stim Pack) in moderate-risk areas
  - High-value items (Salvage Core) deep in dangerous territory near enemy patrols
- **More creatures** â€” 14 total (up from 11): 4 Stalkers, 5 Thornbacks, 5 Glimmers
  - Stalkers block key routes between spawn and extraction
  - Thornbacks guard every high-value loot location
  - Thornback placed near extraction as a final obstacle
  - Glimmers scattered at edges rewarding exploration
- **New terrain types:**
  - Scorched ground (dark, charred) rings wreckage clusters
  - Sandy/dry patches break up visual monotony
  - More distinct rock/wreckage rendering with additional detail

**Fifth Playtest (Michael):**
- Run 1: 1:08, 100% health, 5 items â€” safe loot run
- Run 2: 1:34, 64% health, 6 items including deep loot (Salvage Core, Data Shard) â€” took real damage going for the good stuff
- "The loot feels decent" â€” risk/reward balance working
- Balance shift confirmed: longer runs, more risk for better hauls

---

### Phase 1.6: Xenoflora System

**Built:**
- **Sporepods** â€” pulsing purple/pink sacs, burst on proximity with one of three effects:
  - Heal: +15 HP
  - Poison: 3 damage per tick for 4 seconds, purple screen vignette
  - Reveal: shows all loot on minimap temporarily (blue dots through fog)
  - Effects catalogued per type after first encounter
- **Thornvines** â€” spiky green tangles, 5 damage on walk-through, 2 hits to destroy, drops Xenoflora sample
- **Lumenblooms** â€” soft teal glowing flowers, expand fog reveal radius by 4 tiles while nearby, teal screen glow when active, destroyed if attacked (no drop)
- **Flora discovery system** â€” all show as "Unknown Flora" until interacted with
- **Sporepod effect tracking** â€” individual effects (heal/poison/reveal) tracked separately from base species discovery
- **Summary screen** â€” now shows Salvage, Fauna, and Flora catalogue counts
- **Visual effects** â€” poison vignette (purple), lumenbloom boost indicator (teal)
- **15 xenoflora placed** across map: 5 Sporepods, 5 Thornvines, 5 Lumenblooms

**Sixth Playtest (Michael):**
- 1:58, 85% health, 6 items, 4/7 salvage, 3/3 fauna, 4/6 flora catalogued
- "I do feel like I'm learning something for sure, so not a cheap shot"
- Confirmed the design principle: fair learning experiences that become progressively more dangerous in deeper zones

---

## Current State (End of Session 2)

### What's Built
- 2D top-down extraction shooter, fully playable in browser
- ~850 lines of React/Canvas code in a single JSX file
- 60Ã—45 tile hand-placed map with 7 terrain types
- Fog of war with persistent map knowledge across runs
- Click-to-attack combat with knockback and stagger
- 3 creature types with distinct AI (aggressive, territorial, skittish)
- 3 xenoflora types with discoverable effects
- 8 loot types with intentional risk/reward placement
- Triple discovery system (salvage, fauna, flora)
- Extraction direction indicator with distance
- Minimap with fog, entity detection, EZ discovery
- HUD: vitals, inventory slots, floating text
- Title screen, run summary with discovery tracking
- Persistent knowledge across runs (items, creatures, flora, map)

### What's Designed But Not Built
- House meta-progression system (death outcomes, bonuses, character lifecycle)
- Multi-zone progression (Zone 2+)
- Mutation system (knowledge-driven randomness reduction)
- Home base screen
- Character management (retire, send out)
- Inventory depth (weight/value tradeoffs, gear, crafting)
- Pick vs. attack interaction model for xenoflora
- Sound

### Key Design Principles Established
1. **Emergent storytelling over tutorials** â€” the game teaches through interaction, not instruction
2. **Knowledge reduces randomness** â€” applies to mutations, sporepod effects, creature behavior
3. **Fair learning experiences** â€” every "gotcha" moment should feel like the world taught you something, not that the game cheated you
4. **Zone-based difficulty scaling** â€” Zone 1 is safe enough to learn; deeper zones apply the same mechanics at lethal intensity
5. **The House is the player** â€” characters are expendable instruments of a persistent lineage
6. **Death should matter without being purely punitive** â€” the House persistence concept addresses the fundamental extraction shooter challenge
7. **Iterative development through playtesting** â€” build, play, observe, adjust. Every feature is tested by a real player before moving on.


---

## Session 3 — February 18, 2025

### Phase 2.1: Home Base & Recovery System

**Goal:** Create the base management screen and implement the body recovery mechanic.

**Built:**
- **Home Base Screen**
  - House Knowledge tracker (Salvage/Fauna/Flora counts)
  - Active Character roster with stats (name, health, status, runs)
  - Recovery timer display with visual urgency
  - Deploy/Retire action buttons
  - Status color coding (Ready/Damaged/Critical)

- **Recovery System**
  - 5-minute degradation timer (10-20% instant loss, 10% per 30s tick)
  - Body markers with skull beacon (☠) on map
  - Minimap indicator (orange pulsing dot through fog)
  - Recovery interaction (press E within 30px)
  - Degraded item calculation and recovery
  - Edge case handling (full inventory, complete degradation)

- **Character System**
  - Procedural naming: "Remnant-XXXX" format
  - Health/status tracking across runs
  - Runs completed counter
  - New character generation on death
  - Character persistence between base visits

- **Game Flow Redesign**
  - Title → Base → Deploy → Game → Summary → Base (loop)
  - Clean transitions between all states
  - Multiple run stability

**Major Technical Challenge: Game Loop Stability**

Encountered persistent freezing on second extraction. Root causes:
1. Event listeners accumulating without proper cleanup
2. State updates triggering mid-game re-renders
3. Multiple simultaneous game loops after screen transitions
4. Race conditions in endRun() callback

**Solutions Implemented:**
- Named event listener functions for proper cleanup
- Converted recovery message from state to ref (prevents mid-game re-renders)
- Added running/runEnded flags to control loop lifecycle
- State transition guard (isTransitioningRef)
- setTimeout batching for multiple state updates
- Proper cleanup sequence on component unmount

**Result:** Game now runs stable indefinitely across multiple runs.

**Playtest Results (Michael):**
- Recovery system works as intended
- Body markers visible and navigable
- Degradation timing feels appropriate
- Timer urgency creates real pressure
- Multiple extraction cycles work without freezing
- Knowledge tracking persists correctly

**Design Decisions:**
- Character names are impersonal numbers (fits theme)
- Death location format: "Zone 1, Sector X-Y"
- One active body marker at a time (new death overrides old)
- Recovery is one-time only per body
- Minimap beacon visible through fog to guide players back
- Timer displays both remaining time and recovery percentage

**Terminology Established:**
- "House" for player's clan/lineage
- "House Knowledge" for accumulated discoveries
- "Remnant-XXXX" for character naming
- "Recovery Available" for timer state
- "K.I.A." for death screen
- Status terms: Operational, Ready, Damaged, Critical

---

*Log maintained across development sessions.*
