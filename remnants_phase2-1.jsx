import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// REMNANTS — Phase 2.1: Home Base & Recovery System
// ============================================================

const TILE = 32;
const MAP_W = 60;
const MAP_H = 45;
const WORLD_W = MAP_W * TILE;
const WORLD_H = MAP_H * TILE;
const FOG_REVEAL_RADIUS = 6;
const EZ_CENTER_X = (MAP_W - 5) * TILE;
const EZ_CENTER_Y = (MAP_H - 4) * TILE;

// Recovery system constants
const BASE_RECOVERY_TIME = 300; // 5 minutes in seconds
const INSTANT_LOSS_MIN = 0.1;
const INSTANT_LOSS_MAX = 0.2;
const DEGRADATION_TICK = 30; // seconds per tick
const DEGRADATION_PER_TICK = 0.1; // 10% per tick

const LOOT_TYPES = [
  { id: "salvage_core", name: "Salvage Core", color: "#b89d6a", desc: "Ship reactor fragment", value: 3 },
  { id: "biosamples", name: "Biosamples", color: "#5a9a6a", desc: "Native tissue samples", value: 2 },
  { id: "data_shard", name: "Data Shard", color: "#6a8ab8", desc: "Encrypted memory chip", value: 2 },
  { id: "stim_pack", name: "Stim Pack", color: "#9a5a5a", desc: "Medical stimulant", value: 1, isHeal: true },
  { id: "alloy_plate", name: "Alloy Plate", color: "#8a8a8a", desc: "Ship hull fragment", value: 1 },
  { id: "xenoflora", name: "Xenoflora", color: "#4aaa6a", desc: "Bioluminescent sample", value: 2 },
  { id: "chitin_shard", name: "Chitin Shard", color: "#7a6a55", desc: "Hardened creature shell", value: 2 },
  { id: "biolumen_gland", name: "Biolumen Gland", color: "#55aa88", desc: "Pulsing organic light source", value: 3 },
];

const CREATURE_TYPES = [
  { id: "stalker", name: "Stalker", temperament: "aggressive", color: "#5a2a2a",
    eyeColor: "#cc4a3a", eyeChaseColor: "#ff5544", speed: 1.4, health: 3, damage: 15,
    aggroRange: 180, desc: "Apex predator. Hunts on sight.",
    drops: [{ id: "chitin_shard", chance: 0.5 }, { id: "biosamples", chance: 0.3 }] },
  { id: "thornback", name: "Thornback", temperament: "territorial", color: "#3a4a3a",
    eyeColor: "#cc8a3a", eyeChaseColor: "#ee7733", speed: 1.0, health: 4, damage: 18,
    aggroRange: 70, desc: "Territorial. Attacks if provoked or cornered.",
    drops: [{ id: "alloy_plate", chance: 0.3 }, { id: "chitin_shard", chance: 0.4 }] },
  { id: "glimmer", name: "Glimmer", temperament: "skittish", color: "#2a3a3a",
    eyeColor: "#5aba7a", eyeChaseColor: "#5aba7a", speed: 2.2, health: 1, damage: 0,
    aggroRange: 120, desc: "Flees on approach. Bioluminescent.",
    drops: [{ id: "biolumen_gland", chance: 0.6 }, { id: "xenoflora", chance: 0.3 }] },
];

const FLORA_TYPES = [
  { id: "sporepod", name: "Sporepod", color: "#6a4a6a", glowColor: "#8a5a9a",
    desc: "Organic pod. Releases spores on proximity.", size: 10,
    effects: ["heal", "poison", "reveal"] },
  { id: "thornvine", name: "Thornvine", color: "#4a5a3a", glowColor: "#5a6a4a",
    desc: "Dense tangle. Damages on contact, yields samples when attacked.", size: 12 },
  { id: "lumenbloom", name: "Lumenbloom", color: "#3a6a6a", glowColor: "#4aaaaa",
    desc: "Bioluminescent flower. Enhances visibility nearby.", size: 8 },
];

function spawnXenoflora(map) {
  const placements = [
    { x:10,y:14,type:0,effect:"heal" },{ x:28,y:10,type:0,effect:"poison" },{ x:42,y:25,type:0,effect:"reveal" },
    { x:18,y:35,type:0,effect:"heal" },{ x:50,y:32,type:0,effect:"poison" },
    { x:32,y:18,type:1 },{ x:44,y:14,type:1 },{ x:26,y:32,type:1 },{ x:48,y:36,type:1 },{ x:36,y:40,type:1 },
    { x:6,y:20,type:2 },{ x:22,y:26,type:2 },{ x:38,y:12,type:2 },{ x:54,y:18,type:2 },{ x:14,y:40,type:2 },
  ];
  return placements.map(p => {
    let sx=p.x, sy=p.y;
    if (map[sy]&&(map[sy][sx]===1||map[sy][sx]===2)) sx++;
    const ft = FLORA_TYPES[p.type];
    return {
      x: sx*TILE+TILE/2, y: sy*TILE+TILE/2, type: ft, typeIndex: p.type,
      effect: p.effect || null, health: p.type === 1 ? 2 : 1, alive: true,
      triggered: false, triggerTimer: 0, pulsePhase: Math.random()*Math.PI*2,
    };
  });
}

const MAP_COLORS = {
  0: ["#1a1f16", "#1c2118", "#191e15"], 1: ["#3a3530", "#352f2a", "#403a34"],
  2: ["#2a2a30", "#252530", "#30303a"], 3: ["#1a2a18", "#1e2e1a", "#162816"],
  4: ["#1a2a20", "#1c2e22", "#182a1e"], 5: ["#201a16", "#221c18", "#1e1814"],
  6: ["#1e1c16", "#201e18", "#1c1a14"],
};

function generateMap() {
  const map = [];
  for (let y = 0; y < MAP_H; y++) { map[y] = []; for (let x = 0; x < MAP_W; x++) map[y][x] = 0; }
  for (let x = 0; x < MAP_W; x++) { map[0][x] = 1; map[MAP_H - 1][x] = 1; }
  for (let y = 0; y < MAP_H; y++) { map[y][0] = 1; map[y][MAP_W - 1] = 1; }
  const wreckClusters = [{ cx:15,cy:8,r:5 },{ cx:30,cy:6,r:4 },{ cx:45,cy:10,r:6 },{ cx:25,cy:15,r:3 }];
  wreckClusters.forEach(c => {
    for (let dy = -c.r; dy <= c.r; dy++) for (let dx = -c.r; dx <= c.r; dx++) {
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (dist < c.r && Math.random() < 0.5) {
        const mx = c.cx+dx, my = c.cy+dy;
        if (mx > 0 && mx < MAP_W-1 && my > 0 && my < MAP_H-1)
          map[my][mx] = dist < c.r*0.4 ? 2 : (Math.random() < 0.3 ? 1 : 0);
      }
    }
  });
  wreckClusters.forEach(c => {
    for (let dy = -(c.r+2); dy <= c.r+2; dy++) for (let dx = -(c.r+2); dx <= c.r+2; dx++) {
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (dist >= c.r*0.6 && dist < c.r+2 && Math.random() < 0.4) {
        const mx = c.cx+dx, my = c.cy+dy;
        if (mx > 0 && mx < MAP_W-1 && my > 0 && my < MAP_H-1 && map[my][mx] === 0) map[my][mx] = 5;
      }
    }
  });
  [{ cx:8,cy:25,r:4 },{ cx:50,cy:30,r:5 },{ cx:30,cy:35,r:3 },{ cx:20,cy:22,r:2 },{ cx:40,cy:20,r:3 }].forEach(c => {
    for (let dy = -c.r; dy <= c.r; dy++) for (let dx = -c.r; dx <= c.r; dx++) {
      if (Math.sqrt(dx*dx+dy*dy) < c.r && Math.random() < 0.6) {
        const mx = c.cx+dx, my = c.cy+dy;
        if (mx > 1 && mx < MAP_W-2 && my > 1 && my < MAP_H-2) map[my][mx] = 1;
      }
    }
  });
  [{ cx:12,cy:18,r:3 },{ cx:35,cy:28,r:4 },{ cx:48,cy:20,r:2 },{ cx:18,cy:38,r:3 }].forEach(c => {
    for (let dy = -c.r; dy <= c.r; dy++) for (let dx = -c.r; dx <= c.r; dx++) {
      if (Math.sqrt(dx*dx+dy*dy) < c.r && Math.random() < 0.5) {
        const mx = c.cx+dx, my = c.cy+dy;
        if (mx > 0 && mx < MAP_W-1 && my > 0 && my < MAP_H-1 && map[my][mx] === 0) map[my][mx] = 3;
      }
    }
  });
  for (let i = 0; i < 30; i++) {
    const x = Math.floor(Math.random()*(MAP_W-2))+1, y = Math.floor(Math.random()*(MAP_H-2))+1;
    if (map[y][x] === 0 && Math.random() < 0.5) map[y][x] = 6;
  }
  for (let y = MAP_H-7; y < MAP_H-1; y++) for (let x = MAP_W-9; x < MAP_W-1; x++) map[y][x] = 4;
  return map;
}

const mapRef = { current: null, colors: null };
const fogRef = { current: null };
const knownItemsRef = { current: new Set() };
const knownCreaturesRef = { current: new Set() };
const knownFloraRef = { current: new Set() };
const ezDiscoveredRef = { current: false };

const bodyMarkerRef = { current: null }; // Persistent body location across runs

function spawnLoot(map) {
  const placements = [
    { x:6,y:5,id:"alloy_plate" },{ x:14,y:12,id:"xenoflora" },{ x:22,y:8,id:"biosamples" },
    { x:35,y:14,id:"data_shard" },{ x:42,y:20,id:"stim_pack" },{ x:28,y:22,id:"chitin_shard" },
    { x:48,y:12,id:"salvage_core" },{ x:18,y:28,id:"biosamples" },{ x:38,y:34,id:"xenoflora" },
    { x:52,y:38,id:"data_shard" },
  ];
  return placements.map(p => {
    let sx = p.x, sy = p.y;
    while (map[sy] && (map[sy][sx] === 1 || map[sy][sx] === 2)) sx++;
    const type = LOOT_TYPES.find(l => l.id === p.id);
    return { x: sx*TILE + TILE/2, y: sy*TILE + TILE/2, type, collected: false };
  });
}

function spawnEnemies(map) {
  const placements = [
    { x:20,y:10,type:0 },{ x:38,y:8,type:0 },{ x:28,y:18,type:0 },{ x:44,y:28,type:0 },
    { x:16,y:16,type:1 },{ x:32,y:12,type:1 },{ x:42,y:22,type:1 },{ x:24,y:30,type:1 },{ x:52,y:40,type:1 },
    { x:8,y:30,type:2 },{ x:24,y:38,type:2 },{ x:46,y:16,type:2 },{ x:34,y:36,type:2 },{ x:54,y:24,type:2 },
  ];
  return placements.map((p,i) => {
    let sx = p.x, sy = p.y;
    while (map[sy] && (map[sy][sx] === 1 || map[sy][sx] === 2)) { sx++; if (sx >= MAP_W-2) { sx = p.x-1; sy++; }}
    const ct = CREATURE_TYPES[p.type];
    return {
      id: `enemy_${i}`, x: sx*TILE+TILE/2, y: sy*TILE+TILE/2, creatureType: ct,
      health: ct.health, maxHealth: ct.health, staggerTimer: 0, hitFlash: 0,
      chasing: false, patrolAngle: Math.random()*Math.PI*2, patrolTimer: 0,
      discovered: false,
    };
  });
}

export default function Remnants() {
  const [gameState, setGameState] = useState("title");
  const [character, setCharacter] = useState(null);
  const [recoveryTimer, setRecoveryTimer] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [hudData, setHudData] = useState({ health: 100, status: "Operational", inventory: [], maxInv: 6 });
  const isTransitioningRef = useRef(false); // Prevent rapid state changes
  
  const canvasRef = useRef(null);
  const miniRef = useRef(null);
  const floatingTextsRef = useRef([]);
  const recoveryIntervalRef = useRef(null);

  // Initialize/generate character
  const generateCharacter = useCallback(() => {
    const id = Date.now();
    return {
      id,
      name: `Remnant-${String(id).slice(-4)}`,
      health: 100,
      maxHealth: 100,
      status: "Ready",
      runsCompleted: 0,
      mutations: [],
    };
  }, []);

  // Start recovery timer countdown
  useEffect(() => {
    if (recoveryTimer && recoveryTimer.active) {
      recoveryIntervalRef.current = setInterval(() => {
        setRecoveryTimer(prev => {
          if (!prev || !prev.active) return prev;
          
          const elapsed = Math.floor((Date.now() - prev.startTime) / 1000);
          const remaining = prev.duration - elapsed;
          
          if (remaining <= 0) {
            // Timer expired - body is gone
            clearInterval(recoveryIntervalRef.current);
            bodyMarkerRef.current = null; // Remove body from map
            return { ...prev, active: false, expired: true };
          }
          
          // Calculate degradation
          const ticksPassed = Math.floor(elapsed / DEGRADATION_TICK);
          const degradation = prev.instantLoss + (ticksPassed * DEGRADATION_PER_TICK);
          const recoveryPercent = Math.max(0, 1 - degradation);
          
          return { ...prev, remaining, recoveryPercent };
        });
      }, 1000);
      
      return () => clearInterval(recoveryIntervalRef.current);
    }
  }, [recoveryTimer?.active]);

  const startRecovery = useCallback((deathData) => {
    const instantLoss = INSTANT_LOSS_MIN + Math.random() * (INSTANT_LOSS_MAX - INSTANT_LOSS_MIN);
    const timer = {
      active: true,
      startTime: Date.now(),
      duration: BASE_RECOVERY_TIME,
      remaining: BASE_RECOVERY_TIME,
      location: deathData.location,
      inventory: deathData.inventory,
      deathX: deathData.x,
      deathY: deathData.y,
      instantLoss,
      recoveryPercent: 1 - instantLoss,
      expired: false,
    };
    setRecoveryTimer(timer);
    
    // Set body marker for game world
    bodyMarkerRef.current = {
      x: deathData.x,
      y: deathData.y,
      inventory: deathData.inventory,
      startTime: Date.now(),
      duration: BASE_RECOVERY_TIME,
      instantLoss,
    };
  }, []);

  const initGame = useCallback(() => {
    if (!mapRef.current) {
      mapRef.current = generateMap();
      const colors = [];
      for (let y = 0; y < MAP_H; y++) { colors[y] = [];
        for (let x = 0; x < MAP_W; x++) {
          const tile = mapRef.current[y][x];
          const variants = MAP_COLORS[tile];
          colors[y][x] = variants[Math.floor(Math.random()*variants.length)];
        }
      }
      mapRef.colors = colors;
    }
    if (!fogRef.current) {
      fogRef.current = [];
      for (let y = 0; y < MAP_H; y++) { fogRef.current[y] = []; for (let x = 0; x < MAP_W; x++) fogRef.current[y][x] = 0; }
    }
    
    // Update character for new run
    if (character) {
      setCharacter(prev => ({ ...prev, health: prev.maxHealth, status: "Deployed" }));
    }
    
    // Reset HUD data
    setHudData({ health: 100, status: "Operational", inventory: [], maxInv: 6 });
    
    setGameState("playing");
  }, [character]);

  const endRun = useCallback((data) => {
    if (isTransitioningRef.current) return; // Prevent double calls
    isTransitioningRef.current = true;
    
    const newItems = [];
    if (data.extracted) {
      data.inventory.forEach(item => {
        if (!knownItemsRef.current.has(item.type.id)) {
          knownItemsRef.current.add(item.type.id);
          newItems.push(item.type);
        }
      });
    }
    
    setSummaryData({ ...data, newItems });
    
    // Batch all state updates together
    setTimeout(() => {
      // Update character
      if (character) {
        if (data.extracted) {
          setCharacter(prev => ({
            ...prev,
            health: data.health,
            runsCompleted: prev.runsCompleted + 1,
            status: data.health > 60 ? "Ready" : data.health > 30 ? "Damaged" : "Critical",
          }));
        } else {
          // Character died - start recovery timer with death coordinates
          startRecovery({
            location: data.deathLocation || "Unknown",
            inventory: data.inventory,
            x: data.deathX,
            y: data.deathY,
          });
          
          // Generate new character for next run
          setCharacter(generateCharacter());
        }
      }
      
      setGameState("summary");
      isTransitioningRef.current = false;
    }, 0);
  }, [character, generateCharacter, startRecovery]);

  const goToBase = useCallback(() => {
    setGameState("base");
    setSummaryData(null);
  }, []);

  const deployCharacter = useCallback(() => {
    if (character) {
      initGame();
    }
  }, [character, initGame]);

  // Initialize first character on mount
  useEffect(() => {
    if (!character) {
      setCharacter(generateCharacter());
    }
  }, [character, generateCharacter]);

  // Render base screen
  if (gameState === "base" && character) {
    const hasRecovery = recoveryTimer && recoveryTimer.active && !recoveryTimer.expired;
    const urgency = hasRecovery ? Math.max(0, 1 - (recoveryTimer.remaining / recoveryTimer.duration)) : 0;
    const urgentColor = urgency > 0.6 ? "#cc4a3a" : urgency > 0.3 ? "#cc8a3a" : "#8b7a5a";
    
    const statusColor = character.status === "Ready" ? "#6a9a5a" : 
                       character.status === "Damaged" ? "#cc8a3a" : "#cc4a3a";
    
    return (
      <div style={{
        background: "#0a0a0c",
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        color: "#c8c0b0",
      }}>
        <div style={{
          background: "rgba(20,18,15,0.95)",
          border: "1px solid #2a2520",
          padding: "40px 60px",
          maxWidth: 600,
          width: "90%",
        }}>
          {/* House Knowledge */}
          <div style={{
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: "1px solid #2a2520",
          }}>
            <h2 style={{
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              margin: "0 0 12px",
              color: "#8b7a5a",
            }}>HOUSE KNOWLEDGE</h2>
            <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#665e50" }}>
              <div>Salvage: <span style={{ color: "#b89d6a" }}>{knownItemsRef.current.size}/{LOOT_TYPES.filter(l => !l.isHeal).length}</span></div>
              <div>Fauna: <span style={{ color: "#b89d6a" }}>{knownCreaturesRef.current.size}/{CREATURE_TYPES.length}</span></div>
              <div>Flora: <span style={{ color: "#b89d6a" }}>{knownFloraRef.current.size}/{FLORA_TYPES.length + 3}</span></div>
            </div>
          </div>

          {/* Active Character */}
          <div style={{
            marginBottom: hasRecovery ? 24 : 32,
            paddingBottom: hasRecovery ? 16 : 0,
            borderBottom: hasRecovery ? "1px solid #2a2520" : "none",
          }}>
            <h2 style={{
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              margin: "0 0 12px",
              color: "#8b7a5a",
            }}>ACTIVE CHARACTER</h2>
            <div style={{ fontSize: 14, color: "#c8c0b0", marginBottom: 8 }}>
              {character.name}
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
              <div style={{ color: "#665e50" }}>
                Health: <span style={{ color: character.health === character.maxHealth ? "#6a9a5a" : "#cc8a3a" }}>
                  {character.health}/{character.maxHealth}
                </span>
              </div>
              <div style={{ color: "#665e50" }}>
                Status: <span style={{ color: statusColor }}>{character.status}</span>
              </div>
              <div style={{ color: "#665e50" }}>
                Runs: <span style={{ color: "#b89d6a" }}>{character.runsCompleted}</span>
              </div>
            </div>
          </div>

          {/* Recovery Timer */}
          {hasRecovery && (
            <div style={{
              marginBottom: 32,
              padding: 16,
              background: `rgba(${urgency > 0.6 ? '139,58,58' : urgency > 0.3 ? '139,122,58' : '90,122,90'},0.1)`,
              border: `1px solid ${urgentColor}40`,
              animation: urgency > 0.6 ? "pulse 1s infinite" : "none",
            }}>
              <h3 style={{
                fontSize: 14,
                letterSpacing: 3,
                textTransform: "uppercase",
                margin: "0 0 12px",
                color: urgentColor,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span style={{ fontSize: 18 }}>☠</span> RECOVERY AVAILABLE
              </h3>
              <div style={{ fontSize: 13, color: "#665e50", marginBottom: 6 }}>
                Body Location: <span style={{ color: "#b89d6a" }}>{recoveryTimer.location}</span>
              </div>
              <div style={{ fontSize: 13, color: "#665e50", marginBottom: 6 }}>
                Time Remaining: <span style={{ color: urgentColor }}>
                  {Math.floor(recoveryTimer.remaining / 60)}:{String(recoveryTimer.remaining % 60).padStart(2, '0')}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "#665e50" }}>
                Estimated Recovery: <span style={{ color: urgentColor }}>
                  {Math.floor(recoveryTimer.recoveryPercent * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <button
              onClick={deployCharacter}
              disabled={character.status === "Critical"}
              style={{
                background: "none",
                border: `1px solid ${character.status === "Critical" ? "#3a3530" : "#6a9a5a"}`,
                color: character.status === "Critical" ? "#3a3530" : "#6a9a5a",
                fontFamily: "monospace",
                fontSize: 14,
                letterSpacing: 1,
                padding: "12px 32px",
                cursor: character.status === "Critical" ? "not-allowed" : "pointer",
                opacity: character.status === "Critical" ? 0.5 : 1,
              }}
            >
              [ DEPLOY ]
            </button>
            <button
              onClick={() => {/* TODO: Retire character */}}
              disabled={character.runsCompleted === 0}
              style={{
                background: "none",
                border: `1px solid ${character.runsCompleted === 0 ? "#3a3530" : "#8b7a5a"}`,
                color: character.runsCompleted === 0 ? "#3a3530" : "#8b7a5a",
                fontFamily: "monospace",
                fontSize: 14,
                letterSpacing: 1,
                padding: "12px 32px",
                cursor: character.runsCompleted === 0 ? "not-allowed" : "pointer",
                opacity: character.runsCompleted === 0 ? 0.5 : 1,
              }}
            >
              [ RETIRE ]
            </button>
          </div>
        </div>
        
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Title screen now goes to base
  if (gameState === "title") {
    return (
      <div style={{
        background: "#0a0a0c",
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        color: "#c8c0b0",
      }}>
        <h1 style={{
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: 14,
          textTransform: "uppercase",
          margin: 0,
        }}>REMNANTS</h1>
        <div style={{
          fontSize: 12,
          color: "#665e50",
          letterSpacing: 3,
          marginBottom: 12,
          marginTop: 4,
        }}>GENERATION III — HOSTILE FRONTIER</div>
        <div style={{
          fontSize: 12,
          color: "#4a4540",
          letterSpacing: 1,
          marginBottom: 40,
          maxWidth: 360,
          textAlign: "center",
          lineHeight: 1.7,
        }}>
          Control your House. Send Remnants into the frontier. Scavenge, fight, extract. Die, and the House remembers.
        </div>
        <button
          onClick={() => setGameState("base")}
          style={{
            background: "none",
            border: "1px solid #3a3530",
            color: "#8b7a5a",
            fontFamily: "monospace",
            fontSize: 15,
            letterSpacing: 1,
            padding: "14px 36px",
            cursor: "pointer",
            animation: "titlePulse 2s infinite",
          }}
        >[ ENTER BASE ]</button>
        <style>{`
          @keyframes titlePulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Summary screen now returns to base
  if (gameState === "summary" && summaryData) {
    const totalValue = summaryData.inventory.reduce((s, i) => s + i.value, 0);
    
    return (
      <div style={{
        background: "#0a0a0c",
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        color: "#c8c0b0",
      }}>
        <div style={{
          background: "rgba(20,18,15,0.95)",
          border: "1px solid #2a2520",
          padding: "40px 60px",
          maxWidth: 500,
          textAlign: "center",
        }}>
          <h2 style={{
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            margin: "0 0 8px",
            color: summaryData.extracted ? "#6a9a5a" : "#8b3a3a",
          }}>
            {summaryData.extracted ? "EXTRACTED" : "K.I.A."}
          </h2>
          <div style={{ fontSize: 13, color: "#665e50", margin: "6px 0" }}>
            Time survived: <span style={{ color: "#b89d6a" }}>{summaryData.time}</span>
          </div>
          <div style={{ fontSize: 13, color: "#665e50", margin: "6px 0" }}>
            Health remaining: <span style={{ color: "#b89d6a" }}>{summaryData.health}%</span>
          </div>

          {summaryData.newItems && summaryData.newItems.length > 0 && (
            <div style={{
              margin: "16px 0 4px",
              padding: 12,
              background: "rgba(90,160,100,0.08)",
              border: "1px solid rgba(90,160,100,0.2)",
            }}>
              <h3 style={{
                fontSize: 11,
                color: "#6a9a5a",
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 6,
              }}>New Discoveries</h3>
              {summaryData.newItems.map((item, i) => (
                <div key={i} style={{ fontSize: 13, color: "#6a9a5a", margin: "3px 0" }}>
                  ✦ <span style={{ color: item.color }}>{item.name}</span> — {item.desc}
                </div>
              ))}
            </div>
          )}

          <div style={{
            margin: "16px 0",
            padding: 16,
            background: "rgba(10,10,12,0.5)",
            border: "1px solid #1a1816",
          }}>
            <h3 style={{
              fontSize: 12,
              color: "#665e50",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 8,
            }}>Recovered Salvage</h3>
            {summaryData.extracted && summaryData.inventory.length > 0 ? (
              <>
                {summaryData.inventory.map((item, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#665e50", margin: "4px 0" }}>
                    <span style={{ color: item.color }}>◆ {item.name}</span> — {item.desc}
                  </div>
                ))}
                <div style={{ fontSize: 13, color: "#b89d6a", marginTop: 12 }}>
                  Total value: {totalValue} units
                </div>
              </>
            ) : (
              <div style={{
                fontSize: 13,
                color: summaryData.extracted ? "#665e50" : "#8b3a3a",
              }}>
                {summaryData.extracted ? "Nothing recovered." : "All salvage lost."}
              </div>
            )}
          </div>
          
          <button
            onClick={goToBase}
            style={{
              background: "none",
              border: "1px solid #3a3530",
              color: "#8b7a5a",
              fontFamily: "monospace",
              fontSize: 14,
              letterSpacing: 1,
              padding: "10px 28px",
              cursor: "pointer",
              marginTop: 4,
            }}
          >[ RETURN TO BASE ]</button>
        </div>
      </div>
    );
  }

  // Game screen - use existing game loop (keeping it mostly identical)
  return <GameScreen hudData={hudData} setHudData={setHudData} endRun={endRun} />;
}

// Separate game screen component to keep the game loop clean
function GameScreen({ hudData, setHudData, endRun }) {
  const canvasRef = useRef(null);
  const miniRef = useRef(null);
  const floatingTextsRef = useRef([]);
  const recoveryMessageRef = useRef(null);
  const recoveryMessageTimerRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const miniCanvas = miniRef.current;
    if (!canvas || !miniCanvas) return;

    const ctx = canvas.getContext("2d");
    const miniCtx = miniCanvas.getContext("2d");
    const VIEW_W = 960, VIEW_H = 640;

    let running = true; // Flag to stop the loop when component unmounts
    let runEnded = false; // Flag to prevent multiple endRun calls

    const g = {
      map: mapRef.current,
      colors: mapRef.colors,
      fog: fogRef.current,
      loot: spawnLoot(mapRef.current),
      enemies: spawnEnemies(mapRef.current),
      xenoflora: spawnXenoflora(mapRef.current),
    };

    const p = { x: 5*TILE, y: 5*TILE, health: 100, maxHealth: 100, inv: [], atkCool: 0, sprintCool: 0,
      poisonTimer: 0, poisonTickTimer: 0 };
    const cam = { x: 0, y: 0 };
    const keys = {};
    const mouse = { x: 0, y: 0 };
    let runStart = Date.now();
    let animId;

    function isWall(x, y) {
      const tx = Math.floor(x/TILE), ty = Math.floor(y/TILE);
      return g.map[ty]?.[tx] === 1 || g.map[ty]?.[tx] === 2;
    }

    function revealFog(cx, cy, r) {
      const tx = Math.floor(cx/TILE), ty = Math.floor(cy/TILE);
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (dx*dx + dy*dy <= r*r) {
          const fx = tx+dx, fy = ty+dy;
          if (g.fog[fy]?.[fx] !== undefined) g.fog[fy][fx] = 1;
        }
      }
      if (!ezDiscoveredRef.current) {
        const ezTX = Math.floor(EZ_CENTER_X/TILE), ezTY = Math.floor(EZ_CENTER_Y/TILE);
        if (g.fog[ezTY]?.[ezTX] === 1) ezDiscoveredRef.current = true;
      }
    }

    function addFloatingText(x, y, text, color) {
      floatingTextsRef.current.push({ x, y, text, color, life: 60, vy: -1.2 });
    }

    function tryMove(dx, dy) {
      const corners = [[0,-7],[0,7],[-7,0],[7,0],[-7,-7],[7,-7],[-7,7],[7,7]];
      for (let [ox,oy] of corners) if (isWall(p.x+dx+ox, p.y+dy+oy)) return;
      p.x += dx; p.y += dy;
    }

    function onClick(e) {
      const rect = canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * VIEW_W + cam.x;
      const my = ((e.clientY - rect.top) / rect.height) * VIEW_H + cam.y;
      const dx = mx - p.x, dy = my - p.y, dist = Math.hypot(dx, dy);
      if (p.atkCool > 0 || dist > 38) return;
      p.atkCool = 30;
      const ang = Math.atan2(dy, dx);
      g.enemies.forEach(en => {
        if (en.health <= 0) return;
        const edx = en.x - p.x, edy = en.y - p.y, eDist = Math.hypot(edx, edy);
        const eAng = Math.atan2(edy, edx);
        let aDiff = Math.abs(ang - eAng);
        if (aDiff > Math.PI) aDiff = 2*Math.PI - aDiff;
        if (eDist < 38 && aDiff < 72*Math.PI/180) {
          en.health--;
          en.hitFlash = 15;
          en.staggerTimer = 12;
          const kbDist = 14, kbAng = Math.atan2(en.y - p.y, en.x - p.x);
          en.x += Math.cos(kbAng)*kbDist; en.y += Math.sin(kbAng)*kbDist;
          if (isWall(en.x, en.y)) { en.x -= Math.cos(kbAng)*kbDist; en.y -= Math.sin(kbAng)*kbDist; }
          addFloatingText(en.x, en.y - 10, "-1", "#e0d8c0");
          if (en.health <= 0) {
            addFloatingText(en.x, en.y - 15, "KILL", "#8b7a5a");
            for (let i = 0; i < 8; i++) floatingTextsRef.current.push({
              x: en.x, y: en.y, vx: (Math.random()-0.5)*3, vy: (Math.random()-0.5)*3, life: 40,
              color: en.creatureType.color, size: 3,
            });
            if (!en.discovered) {
              en.discovered = true;
              knownCreaturesRef.current.add(en.creatureType.id);
            }
            en.creatureType.drops.forEach(drop => {
              if (Math.random() < drop.chance) {
                const lootType = LOOT_TYPES.find(l => l.id === drop.id);
                if (lootType) {
                  const offset = (Math.random()-0.5)*20;
                  g.loot.push({ x: en.x+offset, y: en.y+offset, type: lootType, collected: false });
                }
              }
            });
          } else if (!en.discovered) {
            en.discovered = true;
            knownCreaturesRef.current.add(en.creatureType.id);
          }
        }
      });
      g.xenoflora.forEach(xf => {
        if (!xf.alive) return;
        const xdx = xf.x - p.x, xdy = xf.y - p.y, xDist = Math.hypot(xdx, xdy);
        const xAng = Math.atan2(xdy, xdx);
        let xaDiff = Math.abs(ang - xAng);
        if (xaDiff > Math.PI) xaDiff = 2*Math.PI - xaDiff;
        if (xDist < 38 && xaDiff < 72*Math.PI/180) {
          if (xf.typeIndex === 1) {
            xf.health--;
            addFloatingText(xf.x, xf.y - 10, "-1", "#5a6a4a");
            if (xf.health <= 0) {
              xf.alive = false;
              g.loot.push({ x: xf.x, y: xf.y, type: LOOT_TYPES.find(l => l.id === "xenoflora"), collected: false });
              addFloatingText(xf.x, xf.y - 15, "SAMPLE", "#4aaa6a");
            }
          } else {
            xf.alive = false;
            addFloatingText(xf.x, xf.y - 10, "DESTROYED", "#8b3a3a");
          }
        }
      });
    }

    const onKeyDown = (e) => keys[e.key.toLowerCase()] = true;
    const onKeyUp = (e) => keys[e.key.toLowerCase()] = false;
    
    canvas.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    function update() {
      if (!running) return; // Stop updating if component is unmounting
      
      if (p.atkCool > 0) p.atkCool--;
      if (p.sprintCool > 0) p.sprintCool--;
      if (p.poisonTimer > 0) {
        p.poisonTimer--;
        p.poisonTickTimer++;
        if (p.poisonTickTimer >= 60) {
          p.poisonTickTimer = 0;
          p.health = Math.max(1, p.health - 3);
          addFloatingText(p.x, p.y - 15, "-3", "#8a5a9a");
        }
      }

      const sprint = keys.shift && p.sprintCool === 0;
      const spd = sprint ? 2.8 : 2.2;
      if (sprint) p.sprintCool = 90;
      if (keys.w || keys.arrowup) tryMove(0, -spd);
      if (keys.s || keys.arrowdown) tryMove(0, spd);
      if (keys.a || keys.arrowleft) tryMove(-spd, 0);
      if (keys.d || keys.arrowright) tryMove(spd, 0);

      revealFog(p.x, p.y, FOG_REVEAL_RADIUS);

      g.loot.forEach(item => {
        if (item.collected) return;
        if (Math.hypot(p.x - item.x, p.y - item.y) < 20) {
          if (p.inv.length < 6) {
            if (item.type.isHeal) {
              p.health = Math.min(p.maxHealth, p.health + 25);
              addFloatingText(p.x, p.y - 20, "+25", "#4a7a4a");
            } else {
              p.inv.push(item.type);
            }
            item.collected = true;
            addFloatingText(item.x, item.y, `+${item.type.name}`, item.type.color);
          }
        }
      });

      // Check for body recovery
      if (bodyMarkerRef.current && !bodyMarkerRef.current.recovered) {
        const bodyDist = Math.hypot(p.x - bodyMarkerRef.current.x, p.y - bodyMarkerRef.current.y);
        
        if (bodyDist < 30 && keys.e) {
          // Calculate current degradation
          const elapsed = Math.floor((Date.now() - bodyMarkerRef.current.startTime) / 1000);
          const ticksPassed = Math.floor(elapsed / DEGRADATION_TICK);
          const degradation = bodyMarkerRef.current.instantLoss + (ticksPassed * DEGRADATION_PER_TICK);
          const recoveryPercent = Math.max(0, 1 - degradation);
          
          if (recoveryPercent > 0) {
            // Recover degraded items
            const itemsToRecover = Math.floor(bodyMarkerRef.current.inventory.length * recoveryPercent);
            let recovered = 0;
            
            for (let i = 0; i < itemsToRecover && p.inv.length < 6; i++) {
              p.inv.push(bodyMarkerRef.current.inventory[i]);
              recovered++;
            }
            
            if (recovered > 0) {
              addFloatingText(p.x, p.y - 20, `+${recovered} RECOVERED`, "#b89d6a");
              const msg = `Recovered ${recovered}/${bodyMarkerRef.current.inventory.length} items (${Math.floor(recoveryPercent * 100)}% preserved)`;
              recoveryMessageRef.current = msg;
              recoveryMessageTimerRef.current = 180;
            } else {
              const msg = "Inventory full - cannot recover items";
              recoveryMessageRef.current = msg;
              recoveryMessageTimerRef.current = 120;
            }
          } else {
            const msg = "Body completely degraded - nothing recoverable";
            recoveryMessageRef.current = msg;
            recoveryMessageTimerRef.current = 120;
          }
          
          // Mark as recovered and clear body marker
          bodyMarkerRef.current.recovered = true;
          bodyMarkerRef.current = null;
          keys.e = false; // Prevent multiple triggers
        }
      }
      
      if (recoveryMessageTimerRef.current > 0) {
        recoveryMessageTimerRef.current--;
        if (recoveryMessageTimerRef.current === 0) recoveryMessageRef.current = null;
      }

      g.enemies.forEach(en => {
        if (en.health <= 0) return;
        if (en.staggerTimer > 0) { en.staggerTimer--; return; }
        if (en.hitFlash > 0) en.hitFlash--;

        const dx = p.x - en.x, dy = p.y - en.y, dist = Math.hypot(dx, dy);
        const inRange = dist < en.creatureType.aggroRange;

        if (en.creatureType.temperament === "aggressive") {
          en.chasing = inRange;
        } else if (en.creatureType.temperament === "territorial") {
          if (!en.chasing && inRange) en.chasing = true;
        } else if (en.creatureType.temperament === "skittish") {
          en.chasing = inRange;
        }

        if (!en.discovered && dist < 60) {
          en.discovered = true;
          knownCreaturesRef.current.add(en.creatureType.id);
        }

        if (en.chasing) {
          const moveDir = en.creatureType.temperament === "skittish" ? -1 : 1;
          const ang = Math.atan2(dy, dx);
          const mx = Math.cos(ang) * en.creatureType.speed * moveDir;
          const my = Math.sin(ang) * en.creatureType.speed * moveDir;
          if (!isWall(en.x + mx, en.y)) en.x += mx;
          if (!isWall(en.x, en.y + my)) en.y += my;

          if (en.creatureType.temperament !== "skittish" && dist < 12) {
            p.health = Math.max(0, p.health - en.creatureType.damage);
            addFloatingText(p.x, p.y - 20, `-${en.creatureType.damage}`, "#cc4a3a");
            const kbAng = Math.atan2(p.y - en.y, p.x - en.x);
            const kbDist = 18;
            if (!isWall(p.x + Math.cos(kbAng)*kbDist, p.y + Math.sin(kbAng)*kbDist)) {
              p.x += Math.cos(kbAng)*kbDist;
              p.y += Math.sin(kbAng)*kbDist;
            }
            en.chasing = false;
          }
        } else {
          en.patrolTimer++;
          if (en.patrolTimer > 120) {
            en.patrolAngle = Math.random()*Math.PI*2;
            en.patrolTimer = 0;
          }
          const mx = Math.cos(en.patrolAngle)*0.5, my = Math.sin(en.patrolAngle)*0.5;
          if (!isWall(en.x + mx, en.y)) en.x += mx;
          if (!isWall(en.x, en.y + my)) en.y += my;
        }
      });

      g.xenoflora.forEach(xf => {
        if (!xf.alive) return;
        xf.pulsePhase += 0.05;
        const dist = Math.hypot(p.x - xf.x, p.y - xf.y);

        if (xf.typeIndex === 0 && !xf.triggered && dist < 30) {
          xf.triggered = true;
          xf.triggerTimer = 240;
          const effectId = `${xf.typeIndex}_${xf.effect}`;
          if (!knownFloraRef.current.has(xf.type.id)) {
            knownFloraRef.current.add(xf.type.id);
          }
          if (!knownFloraRef.current.has(effectId)) {
            knownFloraRef.current.add(effectId);
          }

          if (xf.effect === "heal") {
            p.health = Math.min(p.maxHealth, p.health + 15);
            addFloatingText(p.x, p.y - 20, "+15 HP", "#6a9a5a");
          } else if (xf.effect === "poison") {
            p.poisonTimer = 240;
            p.poisonTickTimer = 0;
            addFloatingText(p.x, p.y - 20, "POISONED", "#8a5a9a");
          } else if (xf.effect === "reveal") {
            addFloatingText(p.x, p.y - 20, "SCAN ACTIVE", "#6a8ab8");
          }
        }

        if (xf.triggerTimer > 0) xf.triggerTimer--;

        if (xf.typeIndex === 1 && dist < 14 && !xf.triggered) {
          xf.triggered = true;
          p.health = Math.max(1, p.health - 5);
          addFloatingText(p.x, p.y - 20, "-5", "#cc4a3a");
          if (!knownFloraRef.current.has(xf.type.id)) {
            knownFloraRef.current.add(xf.type.id);
          }
        }
        if (xf.typeIndex === 1 && dist > 20) xf.triggered = false;

        if (xf.typeIndex === 2 && !knownFloraRef.current.has(xf.type.id) && dist < 60) {
          knownFloraRef.current.add(xf.type.id);
        }
      });

      floatingTextsRef.current.forEach(ft => {
        ft.life--;
        ft.y += ft.vy || 0;
        if (ft.vx !== undefined) { ft.x += ft.vx; ft.y += ft.vy; }
      });
      floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.life > 0);

      cam.x = Math.max(0, Math.min(WORLD_W - VIEW_W, p.x - VIEW_W/2));
      cam.y = Math.max(0, Math.min(WORLD_H - VIEW_H, p.y - VIEW_H/2));

      const healthPct = Math.floor((p.health / p.maxHealth) * 100);
      setHudData({
        health: healthPct,
        status: p.health > 0 ? (healthPct > 60 ? "Operational" : healthPct > 30 ? "Damaged" : "Critical") : "K.I.A.",
        inventory: p.inv,
        maxInv: 6,
      });

      if (p.health <= 0) {
        if (runEnded) return; // Prevent multiple calls
        runEnded = true;
        const deathLoc = `Zone 1, Sector ${Math.floor(p.x/(TILE*10))}-${String.fromCharCode(65 + Math.floor(p.y/(TILE*10)))}`;
        endRun({
          extracted: false,
          time: `${Math.floor((Date.now() - runStart)/60000)}:${String(Math.floor(((Date.now() - runStart)%60000)/1000)).padStart(2,'0')}`,
          health: 0,
          inventory: p.inv.map(type => ({ ...type })),
          deathLocation: deathLoc,
          deathX: p.x,
          deathY: p.y,
        });
      }

      const inEZ = p.x > (MAP_W-9)*TILE && p.x < (MAP_W-1)*TILE && p.y > (MAP_H-7)*TILE && p.y < (MAP_H-1)*TILE;
      if (inEZ) {
        if (runEnded) return; // Prevent multiple calls
        runEnded = true;
        endRun({
          extracted: true,
          time: `${Math.floor((Date.now() - runStart)/60000)}:${String(Math.floor(((Date.now() - runStart)%60000)/1000)).padStart(2,'0')}`,
          health: healthPct,
          inventory: p.inv.map(type => ({ ...type })),
        });
      }
    }

    function render() {
      ctx.fillStyle = "#0a0a0c";
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      for (let ty = 0; ty < MAP_H; ty++) for (let tx = 0; tx < MAP_W; tx++) {
        const fogVal = g.fog[ty][tx];
        if (fogVal === 0) continue;
        const sx = tx*TILE - cam.x, sy = ty*TILE - cam.y;
        if (sx < -TILE || sx > VIEW_W || sy < -TILE || sy > VIEW_H) continue;
        const tile = g.map[ty][tx];
        ctx.fillStyle = g.colors[ty][tx];
        ctx.fillRect(sx, sy, TILE, TILE);

        if (tile === 1) {
          ctx.fillStyle = "rgba(60,55,50,0.3)";
          ctx.fillRect(sx+2, sy+2, TILE-4, TILE-4);
        } else if (tile === 2) {
          ctx.fillStyle = "rgba(50,50,60,0.2)";
          ctx.fillRect(sx+4, sy+4, TILE-8, TILE-8);
          ctx.strokeStyle = "rgba(80,80,100,0.3)";
          ctx.lineWidth = 1;
          ctx.strokeRect(sx+6, sy+6, TILE-12, TILE-12);
        }
      }

      g.loot.forEach(item => {
        if (item.collected) return;
        const itx = Math.floor(item.x/TILE), ity = Math.floor(item.y/TILE);
        if (g.fog[ity]?.[itx] === 0) return;
        const sx = item.x - cam.x, sy = item.y - cam.y;
        const known = knownItemsRef.current.has(item.type.id);
        ctx.fillStyle = known ? item.type.color : "#4a4540";
        ctx.fillRect(sx-5, sy-5, 10, 10);
        if (!known) {
          ctx.font = "9px monospace";
          ctx.fillStyle = "#2a2520";
          ctx.textAlign = "center";
          ctx.fillText("?", sx, sy+3);
        }
      });

      g.xenoflora.forEach(xf => {
        if (!xf.alive) return;
        const xtx = Math.floor(xf.x/TILE), xty = Math.floor(xf.y/TILE);
        if (g.fog[xty]?.[xtx] === 0) return;
        const sx = xf.x - cam.x, sy = xf.y - cam.y;
        const pulse = Math.sin(xf.pulsePhase)*0.15 + 0.85;
        const known = knownFloraRef.current.has(xf.type.id);
        ctx.fillStyle = known ? xf.type.color : "#3a3530";
        ctx.globalAlpha = pulse;
        ctx.fillRect(sx - xf.type.size/2, sy - xf.type.size/2, xf.type.size, xf.type.size);
        ctx.fillStyle = known ? xf.type.glowColor : "#4a4540";
        ctx.globalAlpha = pulse*0.4;
        ctx.fillRect(sx - xf.type.size/2 - 2, sy - xf.type.size/2 - 2, xf.type.size+4, xf.type.size+4);
        ctx.globalAlpha = 1;

        if (xf.typeIndex === 2 && xf.alive) {
          const dist = Math.hypot(p.x - xf.x, p.y - xf.y);
          if (dist < 100) {
            ctx.fillStyle = `rgba(74,170,170,${0.05*(1 - dist/100)})`;
            ctx.fillRect(0, 0, VIEW_W, VIEW_H);
          }
        }
      });

      // Render body marker
      if (bodyMarkerRef.current && !bodyMarkerRef.current.recovered) {
        const btx = Math.floor(bodyMarkerRef.current.x/TILE);
        const bty = Math.floor(bodyMarkerRef.current.y/TILE);
        const bodyVisible = g.fog[bty]?.[btx] === 1;
        
        if (bodyVisible) {
          const bsx = bodyMarkerRef.current.x - cam.x;
          const bsy = bodyMarkerRef.current.y - cam.y;
          const bodyPulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
          
          // Skull beacon
          ctx.globalAlpha = bodyPulse;
          ctx.fillStyle = "#cc8a3a";
          ctx.font = "24px monospace";
          ctx.textAlign = "center";
          ctx.fillText("☠", bsx, bsy + 8);
          
          // Pulsing ring
          ctx.strokeStyle = "#cc8a3a";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(bsx, bsy, 16 + Math.sin(Date.now() * 0.005) * 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
          
          // Distance check for interaction prompt
          const bodyDist = Math.hypot(p.x - bodyMarkerRef.current.x, p.y - bodyMarkerRef.current.y);
          if (bodyDist < 30) {
            ctx.font = "10px monospace";
            ctx.fillStyle = "#b89d6a";
            ctx.textAlign = "center";
            ctx.fillText("[E] RECOVER", bsx, bsy - 24);
            
            // Calculate current recovery percent
            const elapsed = Math.floor((Date.now() - bodyMarkerRef.current.startTime) / 1000);
            const ticksPassed = Math.floor(elapsed / DEGRADATION_TICK);
            const degradation = bodyMarkerRef.current.instantLoss + (ticksPassed * DEGRADATION_PER_TICK);
            const recoveryPercent = Math.max(0, 1 - degradation);
            const itemCount = Math.floor(bodyMarkerRef.current.inventory.length * recoveryPercent);
            
            ctx.fillStyle = "#665e50";
            ctx.fillText(`${itemCount}/${bodyMarkerRef.current.inventory.length} items`, bsx, bsy - 14);
          }
        } else {
          // Show beacon pulse on minimap even through fog
          const bmx = bodyMarkerRef.current.x / TILE * (140/MAP_W);
          const bmy = bodyMarkerRef.current.y / TILE * (100/MAP_H);
          const beaconPulse = Math.sin(Date.now() * 0.004) * 0.4 + 0.6;
          miniCtx.globalAlpha = beaconPulse;
          miniCtx.fillStyle = "#cc8a3a";
          miniCtx.fillRect(bmx - 2, bmy - 2, 4, 4);
          miniCtx.globalAlpha = 1;
        }
      }

      g.enemies.forEach(en => {
        if (en.health <= 0) return;
        const etx = Math.floor(en.x/TILE), ety = Math.floor(en.y/TILE);
        if (g.fog[ety]?.[etx] === 0) return;
        const sx = en.x - cam.x, sy = en.y - cam.y;
        ctx.fillStyle = en.hitFlash > 0 ? "#e0d8c0" : en.creatureType.color;
        ctx.fillRect(sx-9, sy-9, 18, 18);
        const eyeC = en.chasing ? en.creatureType.eyeChaseColor : en.creatureType.eyeColor;
        ctx.fillStyle = eyeC;
        ctx.fillRect(sx-3, sy-2, 2, 2);
        ctx.fillRect(sx+1, sy-2, 2, 2);

        if (en.discovered) {
          ctx.font = "8px monospace";
          ctx.fillStyle = eyeC;
          ctx.textAlign = "center";
          ctx.fillText(en.creatureType.name, sx, sy - 14);
          const tempColor = en.creatureType.temperament === "aggressive" ? "#cc4a3a" :
                           en.creatureType.temperament === "territorial" ? "#cc8a3a" : "#5aba7a";
          ctx.fillStyle = tempColor;
          ctx.fillText(`[${en.creatureType.temperament}]`, sx, sy - 22);
        } else {
          ctx.font = "8px monospace";
          ctx.fillStyle = "#4a4540";
          ctx.textAlign = "center";
          ctx.fillText("Unknown Fauna", sx, sy - 14);
        }
      });

      ctx.fillStyle = "#c8c0b0";
      ctx.fillRect(p.x - cam.x - 7, p.y - cam.y - 7, 14, 14);
      ctx.fillStyle = "#0a0a0c";
      ctx.fillRect(p.x - cam.x - 4, p.y - cam.y - 4, 8, 8);

      if (p.atkCool > 0) {
        const aProg = 1 - p.atkCool/30;
        ctx.strokeStyle = `rgba(200,192,176,${aProg*0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x - cam.x, p.y - cam.y, 38, -Math.PI/2, -Math.PI/2 + Math.PI*2*aProg);
        ctx.stroke();
      }

      if (p.poisonTimer > 0) {
        ctx.fillStyle = `rgba(138,90,154,${0.15*Math.sin(Date.now()*0.01)})`;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      }

      // Recovery message
      if (recoveryMessageRef.current && recoveryMessageTimerRef.current > 0) {
        const msgAlpha = Math.min(1, recoveryMessageTimerRef.current / 60);
        ctx.globalAlpha = msgAlpha;
        ctx.fillStyle = "rgba(20,18,15,0.9)";
        ctx.fillRect(VIEW_W/2 - 200, 60, 400, 50);
        ctx.strokeStyle = "#b89d6a";
        ctx.lineWidth = 1;
        ctx.strokeRect(VIEW_W/2 - 200, 60, 400, 50);
        ctx.font = "12px monospace";
        ctx.fillStyle = "#b89d6a";
        ctx.textAlign = "center";
        ctx.fillText(recoveryMessageRef.current, VIEW_W/2, 88);
        ctx.globalAlpha = 1;
      }

      floatingTextsRef.current.forEach(ft => {
        const alpha = ft.life / 60;
        ctx.globalAlpha = alpha;
        if (ft.text) {
          ctx.font = "bold 11px monospace";
          ctx.fillStyle = ft.color;
          ctx.textAlign = "center";
          ctx.fillText(ft.text, ft.x - cam.x, ft.y - cam.y);
        }
        if (ft.size) {
          ctx.fillStyle = ft.color;
          ctx.fillRect(ft.x - cam.x - ft.size/2, ft.y - cam.y - ft.size/2, ft.size, ft.size);
        }
      });
      ctx.globalAlpha = 1;

      const toEZ = Math.hypot(EZ_CENTER_X - p.x, EZ_CENTER_Y - p.y);
      if (toEZ > VIEW_W/3) {
        const aToEZ = Math.atan2(EZ_CENTER_Y - p.y, EZ_CENTER_X - p.x);
        const indX = VIEW_W/2 + Math.cos(aToEZ)*280, indY = VIEW_H/2 + Math.sin(aToEZ)*200;
        const ezP = 0.5 + Math.sin(Date.now()*0.005)*0.3;
        ctx.globalAlpha = ezP;
        ctx.fillStyle = "#5aa06a";
        ctx.beginPath();
        ctx.moveTo(indX + Math.cos(aToEZ)*12, indY + Math.sin(aToEZ)*12);
        ctx.lineTo(indX + Math.cos(aToEZ+2.5)*8, indY + Math.sin(aToEZ+2.5)*8);
        ctx.lineTo(indX + Math.cos(aToEZ-2.5)*8, indY + Math.sin(aToEZ-2.5)*8);
        ctx.closePath();
        ctx.fill();
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("EXTRACT", indX, indY - 16);
        ctx.fillStyle = "#5aa06a80";
        ctx.font = "11px monospace";
        ctx.fillText(`${Math.floor(toEZ/TILE)}m`, indX, indY + 24);
        ctx.globalAlpha = 1;
      }

      miniCtx.fillStyle = "#0a0a0c";
      miniCtx.fillRect(0, 0, 140, 100);
      const msx = 140/MAP_W, msy = 100/MAP_H;
      for (let ty = 0; ty < MAP_H; ty++) for (let tx = 0; tx < MAP_W; tx++) {
        if (g.fog[ty][tx] === 0) continue;
        const tile = g.map[ty][tx];
        miniCtx.fillStyle = tile===0?"#141410":tile===1?"#2a2520":tile===2?"#252530":tile===3?"#1a2a18":tile===4?"#2a4a30":tile===5?"#1a1510":"#1c1a12";
        miniCtx.fillRect(tx*msx, ty*msy, Math.ceil(msx), Math.ceil(msy));
      }

      g.loot.forEach(item => {
        if (item.collected) return;
        const itx = Math.floor(item.x/TILE), ity = Math.floor(item.y/TILE);
        const revealActive = g.xenoflora.some(xf => xf.typeIndex===0 && xf.effect==="reveal" && xf.triggerTimer>0);
        if (!revealActive && (!g.fog[ity] || g.fog[ity][itx]===0)) return;
        miniCtx.fillStyle = revealActive && (!g.fog[ity] || g.fog[ity][itx]===0) ? "#6a6a9a" : item.type.color;
        miniCtx.fillRect(item.x/TILE*msx - 0.5, item.y/TILE*msy - 0.5, 2, 2);
      });

      g.xenoflora.forEach(xf => {
        if (!xf.alive) return;
        const xtx = Math.floor(xf.x/TILE), xty = Math.floor(xf.y/TILE);
        if (!g.fog[xty] || g.fog[xty][xtx]===0) return;
        miniCtx.fillStyle = xf.type.glowColor + "80";
        miniCtx.fillRect(xf.x/TILE*msx - 0.5, xf.y/TILE*msy - 0.5, 2, 2);
      });

      g.enemies.forEach(en => {
        if (en.health <= 0) return;
        if (Math.hypot(p.x - en.x, p.y - en.y) < 250) {
          miniCtx.fillStyle = en.eyeColor;
          miniCtx.fillRect(en.x/TILE*msx - 1, en.y/TILE*msy - 1, 2, 2);
        }
      });

      if (ezDiscoveredRef.current) {
        const ezMX = (MAP_W-9)*msx, ezMY = (MAP_H-7)*msy, ezMW = 8*msx, ezMH = 6*msy;
        const ezP2 = 0.4 + Math.sin(Date.now()*0.003)*0.2;
        miniCtx.strokeStyle = `rgba(90,160,100,${ezP2})`;
        miniCtx.lineWidth = 1;
        miniCtx.strokeRect(ezMX, ezMY, ezMW, ezMH);
        miniCtx.fillStyle = "rgba(90,160,100,0.12)";
        miniCtx.fillRect(ezMX, ezMY, ezMW, ezMH);
      }

      miniCtx.fillStyle = "#e0d8c0";
      miniCtx.fillRect(p.x/TILE*msx - 1.5, p.y/TILE*msy - 1.5, 3, 3);
      miniCtx.strokeStyle = "rgba(200,192,176,0.2)";
      miniCtx.lineWidth = 0.5;
      miniCtx.strokeRect(cam.x/WORLD_W*140, cam.y/WORLD_H*100, VIEW_W/WORLD_W*140, VIEW_H/WORLD_H*100);
    }

    function loop() {
      if (!running) return; // Stop loop if unmounting
      update();
      render();
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);

    return () => {
      running = false; // Stop the loop
      cancelAnimationFrame(animId);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [endRun]);

  const healthPct = hudData.health;
  const healthColor = healthPct > 60 ? "#4a7a4a" : healthPct > 30 ? "#8b7a3a" : "#8b3a3a";
  const invSlots = [];
  for (let i = 0; i < hudData.maxInv; i++) {
    const item = hudData.inventory[i];
    invSlots.push(
      <div key={i} style={{
        width: 20,
        height: 20,
        border: `1px solid ${item ? item.color+"60" : "#2a2520"}`,
        background: item ? item.color+"15" : "transparent",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: i > 0 ? 3 : 0,
      }}>
        {item && (
          <div style={{
            width: 10,
            height: 10,
            background: item.color,
            opacity: knownItemsRef.current.has(item.id) ? 1 : 0.4,
          }}/>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: "#0a0a0c",
      width: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    }}>
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute",
          top: 8,
          left: 8,
          right: 8,
          display: "flex",
          justifyContent: "space-between",
          pointerEvents: "none",
          zIndex: 10,
        }}>
          <div style={{
            background: "rgba(10,10,12,0.85)",
            border: "1px solid #2a2520",
            padding: "6px 12px",
            fontFamily: "monospace",
            fontSize: 13,
          }}>
            <div style={{
              color: "#665e50",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}>Vitals</div>
            <div style={{
              width: 130,
              height: 7,
              background: "#1a1816",
              marginTop: 4,
              border: "1px solid #2a2520",
            }}>
              <div style={{
                height: "100%",
                width: `${healthPct}%`,
                background: healthColor,
                transition: "width 0.3s",
              }}/>
            </div>
            <div style={{ color: "#665e50", fontSize: 11 }}>{hudData.status}</div>
          </div>
          <div style={{
            background: "rgba(10,10,12,0.85)",
            border: "1px solid #2a2520",
            padding: "6px 12px",
            fontFamily: "monospace",
            fontSize: 13,
          }}>
            <div style={{
              color: "#665e50",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              marginBottom: 4,
            }}>Salvage {hudData.inventory.length}/{hudData.maxInv}</div>
            <div style={{ display: "flex" }}>{invSlots}</div>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          width={960}
          height={640}
          style={{
            border: "1px solid #2a2520",
            cursor: "crosshair",
            display: "block",
            maxWidth: "100%",
            maxHeight: "calc(100vh - 40px)",
          }}
        />
        <div style={{
          position: "absolute",
          bottom: 8,
          right: 8,
          pointerEvents: "none",
          zIndex: 10,
        }}>
          <canvas
            ref={miniRef}
            width={140}
            height={100}
            style={{
              border: "1px solid #2a2520",
              background: "rgba(10,10,12,0.8)",
            }}
          />
        </div>
      </div>
      <div style={{
        fontFamily: "monospace",
        fontSize: 12,
        color: "#3a3530",
        letterSpacing: 0.5,
        marginTop: 4,
      }}>
        WASD move · SHIFT sprint · CLICK attack · E recover body · approach items to salvage · reach extraction ▣
      </div>
    </div>
  );
}
