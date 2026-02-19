# REMNANTS - Terminology Reference
## Canonical Names & Conventions

This document serves as the single source of truth for all in-game terminology, UI labels, and naming conventions.

---

## Player-Facing Terms

### Core Concepts
- **House** - The player's clan/lineage (the persistent entity)
- **Remnant** - An individual member of a House
- **Character** - A specific Remnant currently being controlled
- **Run** - A single expedition into the frontier
- **Extraction** - Successfully reaching the extraction zone with loot
- **K.I.A.** - Killed In Action (death state)

### Character Naming
- **Format:** "Remnant-XXXX" where XXXX is the last 4 digits of timestamp
- **Examples:** Remnant-7161, Remnant-3789, Remnant-5494
- **Rationale:** Impersonal numbering reflects expendable nature of individuals vs. persistent House

### Location Naming
- **Format:** "Zone [number], Sector [number]-[letter]"
- **Example:** "Zone 1, Sector 4-D"
- **Structure:**
  - Zone: Concentric areas radiating from crash site (1, 2, 3...)
  - Sector: Grid coordinates within zone (1-A, 2-C, 4-D, etc.)

---

## UI Labels & Headers

### Base Screen
- **"HOUSE KNOWLEDGE"** - Section header for accumulated discoveries
- **"ACTIVE CHARACTER"** - Section header for current Remnant
- **"RECOVERY AVAILABLE"** - Alert when body recovery is possible
- **"Body Location:"** - Label for death site
- **"Time Remaining:"** - Label for recovery countdown
- **"Estimated Recovery:"** - Label for percentage of items remaining
- **"[ DEPLOY ]"** - Button to start expedition
- **"[ RETIRE ]"** - Button to retire veteran (Phase 2.3)

### In-Game HUD
- **"VITALS"** - Health display label
- **"Operational"** - Status during active gameplay
- **"SALVAGE X/Y"** - Inventory counter format
- **"[E] RECOVER"** - Body interaction prompt
- **"EXTRACT"** - Extraction zone indicator
- **"Unknown Fauna"** - Undiscovered creature label
- **"Unknown Flora"** - Undiscovered plant label

### Summary Screen
- **"EXTRACTED"** - Success header (green)
- **"K.I.A."** - Death header (red)
- **"Time survived:"** - Run duration label
- **"Health remaining:"** - Final health label
- **"New Discoveries"** - Section for newly catalogued items
- **"Recovered Salvage"** - Section for items extracted
- **"Total value:"** - Sum of extracted item values
- **"Nothing recovered."** - Message for empty extraction
- **"All salvage lost."** - Message for death
- **"[ RETURN TO BASE ]"** - Button to return to House screen

---

## Status Terms

### Character Status (Base Screen)
- **"Ready"** - Health >60% (color: #6a9a5a green)
- **"Damaged"** - Health 30-60% (color: #cc8a3a amber)
- **"Critical"** - Health <30% (color: #cc4a3a red)

### Gameplay Status (In-Game)
- **"Operational"** - Standard active status
- **"Damaged"** - When health drops below 60%
- **"Critical"** - When health drops below 30%
- **"K.I.A."** - When health reaches 0

---

## Salvage Types (Items)

### High Value
- **"Salvage Core"** - Ship reactor fragment (value: 3)
- **"Biolumen Gland"** - Pulsing organic light source (value: 3)

### Medium Value
- **"Biosamples"** - Native tissue samples (value: 2)
- **"Data Shard"** - Encrypted memory chip (value: 2)
- **"Xenoflora"** - Bioluminescent plant sample (value: 2)
- **"Chitin Shard"** - Hardened creature shell (value: 2)

### Low Value
- **"Stim Pack"** - Medical stimulant (value: 1, healing item)
- **"Alloy Plate"** - Ship hull fragment (value: 1)

---

## Fauna (Creatures)

### Stalker
- **Temperament:** Aggressive
- **Tag:** [aggressive]
- **Description:** "Apex predator. Hunts on sight."
- **Eye Color:** Red (#cc4a3a)
- **Drops:** Chitin Shard (50%), Biosamples (30%)

### Thornback
- **Temperament:** Territorial
- **Tag:** [territorial]
- **Description:** "Territorial. Attacks if provoked or cornered."
- **Eye Color:** Orange (#cc8a3a)
- **Drops:** Alloy Plate (30%), Chitin Shard (40%)

### Glimmer
- **Temperament:** Skittish
- **Tag:** [skittish]
- **Description:** "Flees on approach. Bioluminescent."
- **Eye Color:** Green (#5aba7a)
- **Drops:** Biolumen Gland (60%), Xenoflora (30%)

---

## Flora (Interactive Plants)

### Sporepod
- **Type:** Active (triggers on proximity)
- **Description:** "Organic pod. Releases spores on proximity."
- **Color:** Purple-pink (#6a4a6a)
- **Glow:** #8a5a9a
- **Effects:**
  - Heal Spores: +15 HP restoration
  - Toxic Spores: 3 damage/second for 4 seconds
  - Reveal Spores: Shows all loot on minimap temporarily
- **Discovery:** Each effect type is tracked separately

### Thornvine
- **Type:** Passive hazard
- **Description:** "Dense tangle. Damages on contact, yields samples when attacked."
- **Color:** Green-brown (#4a5a3a)
- **Glow:** #5a6a4a
- **Mechanics:**
  - Walk through: 5 damage
  - Attack (2 hits to destroy): Drops Xenoflora sample
- **Design Note:** "The obstacle is the resource"

### Lumenbloom
- **Type:** Proximity buff
- **Description:** "Bioluminescent flower. Enhances visibility nearby."
- **Color:** Teal-cyan (#3a6a6a)
- **Glow:** #4aaaaa
- **Mechanics:**
  - Proximity: +4 tile fog reveal radius
  - Visual: Teal screen glow when active
  - Attack: Destroys permanently (no drop)
- **Design Note:** "Not everything should be attacked"

---

## Color Palette Reference

### Status Colors
- **Ready/Success Green:** #6a9a5a
- **Damaged/Warning Amber:** #cc8a3a
- **Critical/Danger Red:** #cc4a3a
- **UI Gold/Highlight:** #b89d6a
- **Muted Gray (disabled):** #3a3530
- **Text Primary:** #c8c0b0
- **Text Secondary:** #665e50
- **Text Tertiary:** #4a4540

### Creature Eye Colors
- **Aggressive (Stalker):** #cc4a3a (red)
- **Territorial (Thornback):** #cc8a3a (orange)
- **Skittish (Glimmer):** #5aba7a (green)

### Flora Glow Colors
- **Sporepod:** #8a5a9a (purple)
- **Thornvine:** #5a6a4a (muted green)
- **Lumenbloom:** #4aaaaa (teal)

---

## Message Templates

### Recovery System
- Success: `"Recovered X/Y items (Z% preserved)"`
- Inventory Full: `"Inventory full - cannot recover items"`
- Complete Degradation: `"Body completely degraded - nothing recoverable"`
- Floating Text: `"+X RECOVERED"`

### Item Discovery
- Summary Section: `"✦ [Item Name] — [Description]"`
- Format Example: `"✦ Salvage Core — Ship reactor fragment"`

### Combat
- Damage Dealt: `"-X"` (enemy hit)
- Damage Received: `"-X"` (player hit)
- Kill: `"KILL"`
- Healing: `"+X"` (health restored)

### Flora Interaction
- Sporepod Trigger: `"POISONED"` or no message (heal/reveal are silent)
- Thornvine Harvest: `"SAMPLE"` (when destroyed)
- Lumenbloom Destroy: `"DESTROYED"`

---

## Controls Reference

### Current Bindings
- **WASD** - Move
- **SHIFT** - Sprint
- **CLICK** - Attack (in range and arc)
- **E** - Recover body (when near marker)

### Future Considerations
- **Tab** - Open inventory/crafting (Phase 2.2)
- **Space** - Interact with workstation (Phase 2.2)
- **I** - Toggle info overlay (Phase 2+)

---

## Technical Constants

### Naming Formats (Code)
```javascript
// Character ID generation
const id = Date.now();
const name = `Remnant-${String(id).slice(-4)}`;

// Location format
const location = `Zone ${zoneNum}, Sector ${sectorX}-${sectorLetter}`;

// Item display (undiscovered)
const display = knownItemsRef.current.has(item.id) ? item.name : "??? Unknown";

// Creature display (undiscovered)
const display = enemy.discovered ? enemy.creatureType.name : "Unknown Fauna";

// Flora display (undiscovered)
const display = knownFloraRef.current.has(flora.type.id) ? flora.type.name : "Unknown Flora";
```

### Color Constants (Code)
```javascript
const STATUS_COLORS = {
  ready: "#6a9a5a",
  damaged: "#cc8a3a", 
  critical: "#cc4a3a"
};

const EYE_COLORS = {
  aggressive: "#cc4a3a",
  territorial: "#cc8a3a",
  skittish: "#5aba7a"
};
```

---

## Lore Notes

### Why These Names?

**"House"** - Chosen to evoke:
- Medieval feudal structure (persistence across generations)
- Family lineage (blood/adopted connections)
- Physical structure (base/home)
- Distinct from "Clan" (too tribal) or "Guild" (too commercial)

**"Remnant"** - Chosen to evoke:
- What's left after catastrophe
- Echoes of greater civilization
- Survivors clinging to existence
- Not "Colonist" (too optimistic) or "Survivor" (too generic)

**"K.I.A."** - Retained from Earth military culture:
- Formalizes death with dignity
- Contrasts with impersonal living numbering
- Shows cultural continuity despite three generations
- Familiar to players (genre convention)

**Numerical Character Names** - Reflects:
- Prison colony origin (dehumanization)
- Survival pragmatism (emotional distance)
- High mortality rate (don't get attached)
- House > Individual philosophy

**Zone/Sector Grid** - Implies:
- Organized surveying efforts
- Scientific/military methodology survived
- Houses cooperate on mapping (shared system)
- Some level of civilization remains

---

*Last Updated: February 18, 2025 - Phase 2.1 Complete*
