const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");

overlay.addEventListener("pointerdown", (event) => {
  const targetId = event.target?.id;
  if (targetId === "start") {
    state.screen = "base";
    state.message = "House online. Ready to deploy.";
  }
  if (targetId === "deploy") startNewExpedition();
  if (targetId === "back") {
    state.screen = "base";
    state.message = "Mission complete.";
  }
});

const WORLD = { width: 1800, height: 1200 };
const EXTRACT = { x: 1680, y: 1050, w: 90, h: 90 };

const keys = new Set();
window.addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

const state = {
  screen: "title",
  camera: { x: 0, y: 0 },
  player: null,
  hazards: [],
  salvage: [],
  mission: null,
  runStartMs: 0,
  activeOperativeId: 1,
  carriedValue: 0,
  carryingCorpsePayload: false,
  message: "",
  summary: null,
  house: {
    generation: 3,
    recoveredKnowledge: 0,
    remoteTransferUnlocked: false,
    unlocks: ["Frontier Charts", "Crude Med Gel"],
  },
  corpse: null,
};

function fmt(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function corpseTimeRemainingMs() {
  if (!state.corpse || !state.corpse.timerStartedAt) return 0;
  const elapsed = Date.now() - state.corpse.timerStartedAt;
  return Math.max(0, state.corpse.decayDurationMs - elapsed);
}

function corpseRecoveryFactor() {
  if (!state.corpse) return 0;
  return Math.max(0.15, corpseTimeRemainingMs() / state.corpse.decayDurationMs);
}

function makeHazards() {
  const hazards = [];
  for (let i = 0; i < 10; i += 1) {
    hazards.push({
      x: 250 + Math.random() * 1300,
      y: 220 + Math.random() * 820,
      r: 38 + Math.random() * 22,
    });
  }
  return hazards;
}

function makeSalvage() {
  const list = [];
  for (let i = 0; i < 8; i += 1) {
    list.push({
      x: 180 + Math.random() * 1450,
      y: 160 + Math.random() * 910,
      value: 1 + Math.floor(Math.random() * 3),
      picked: false,
    });
  }
  return list;
}

function startRun() {
  state.screen = "run";
  state.player = { x: 120, y: 120, hp: 100, speed: 170 };
  state.camera.x = 0;
  state.camera.y = 0;
  state.hazards = makeHazards();
  state.salvage = makeSalvage();
  state.carriedValue = 0;
  state.carryingCorpsePayload = false;
  state.runStartMs = Date.now();
  state.message = state.mission?.isRecovery
    ? "Mission: retrieve corpse payload and extract."
    : "Mission: gather salvage and extract.";
}

function startNewExpedition() {
  state.mission = { isRecovery: Boolean(state.corpse) };
  startRun();
}

function finalizeRun(status, note) {
  const runSeconds = (Date.now() - state.runStartMs) / 1000;
  state.summary = {
    status,
    note,
    runSeconds,
    carriedValue: state.carriedValue,
    corpseRecovered: state.mission?.isRecovery && state.carryingCorpsePayload,
  };
  state.screen = "debrief";
}

function onPlayerDeath() {
  const distToExtract = Math.hypot(state.player.x - EXTRACT.x, state.player.y - EXTRACT.y);
  const corpseRecord = {
    x: state.player.x,
    y: state.player.y,
    baseValue: 4 + state.carriedValue,
    timerStartedAt: Date.now(),
    decayDurationMs: 300000 + distToExtract * 180,
    retrieved: false,
  };
  state.corpse = corpseRecord;
  state.screen = "base";
  state.message = "Operative lost. Recovery timer active.";
}

function update(dt) {
  if (state.screen !== "run") return;

  const sprint = keys.has("shift") ? 1.4 : 1;
  const speed = state.player.speed * sprint;
  if (keys.has("w")) state.player.y -= speed * dt;
  if (keys.has("s")) state.player.y += speed * dt;
  if (keys.has("a")) state.player.x -= speed * dt;
  if (keys.has("d")) state.player.x += speed * dt;

  state.player.x = Math.max(16, Math.min(WORLD.width - 16, state.player.x));
  state.player.y = Math.max(16, Math.min(WORLD.height - 16, state.player.y));

  for (const hazard of state.hazards) {
    const d = Math.hypot(state.player.x - hazard.x, state.player.y - hazard.y);
    if (d < hazard.r + 10) {
      state.player.hp -= 18 * dt;
    }
  }

  for (const item of state.salvage) {
    if (item.picked) continue;
    if (Math.hypot(state.player.x - item.x, state.player.y - item.y) < 18) {
      item.picked = true;
      state.carriedValue += item.value;
    }
  }

  if (state.mission?.isRecovery && state.corpse && !state.carryingCorpsePayload) {
    const d = Math.hypot(state.player.x - state.corpse.x, state.player.y - state.corpse.y);
    if (d < 20) {
      state.carryingCorpsePayload = true;
      state.message = `Corpse payload secured (${Math.round(corpseRecoveryFactor() * 100)}% integrity). Extract now.`;
    }
  }

  const inExtract =
    state.player.x > EXTRACT.x &&
    state.player.x < EXTRACT.x + EXTRACT.w &&
    state.player.y > EXTRACT.y &&
    state.player.y < EXTRACT.y + EXTRACT.h;

  if (inExtract) {
    if (state.mission?.isRecovery && !state.carryingCorpsePayload) {
      state.message = "Extraction denied: corpse payload missing.";
    } else {
      if (state.mission?.isRecovery && state.corpse) {
        const recoveredKnowledge = Math.round(state.corpse.baseValue * corpseRecoveryFactor());
        state.house.recoveredKnowledge += recoveredKnowledge;
        state.corpse = null;
        finalizeRun("EXTRACTED", `Recovery success. Inherited knowledge +${recoveredKnowledge}.`);
      } else {
        state.house.recoveredKnowledge += state.carriedValue;
        finalizeRun("EXTRACTED", `Salvage returned: +${state.carriedValue} knowledge.`);
      }
    }
  }

  if (state.player.hp <= 0) onPlayerDeath();

  state.camera.x = Math.max(0, Math.min(WORLD.width - canvas.width, state.player.x - canvas.width / 2));
  state.camera.y = Math.max(0, Math.min(WORLD.height - canvas.height, state.player.y - canvas.height / 2));
}

function drawWorld() {
  ctx.fillStyle = "#101b14";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cam = state.camera;

  for (let y = 0; y < WORLD.height; y += 64) {
    for (let x = 0; x < WORLD.width; x += 64) {
      const c = ((x + y) / 64) % 2 === 0 ? "#132219" : "#0f1b14";
      ctx.fillStyle = c;
      ctx.fillRect(x - cam.x, y - cam.y, 64, 64);
    }
  }

  for (const hz of state.hazards) {
    ctx.fillStyle = "rgba(155,78,78,0.4)";
    ctx.beginPath();
    ctx.arc(hz.x - cam.x, hz.y - cam.y, hz.r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const item of state.salvage) {
    if (item.picked) continue;
    ctx.fillStyle = "#7fd5cc";
    ctx.fillRect(item.x - cam.x - 4, item.y - cam.y - 4, 8, 8);
  }

  if (state.corpse) {
    ctx.fillStyle = "#c48f4c";
    ctx.beginPath();
    ctx.arc(state.corpse.x - cam.x, state.corpse.y - cam.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "#6ab36f";
  ctx.lineWidth = 2;
  ctx.strokeRect(EXTRACT.x - cam.x, EXTRACT.y - cam.y, EXTRACT.w, EXTRACT.h);

  if (state.player) {
    ctx.fillStyle = "#dce7dc";
    ctx.fillRect(state.player.x - cam.x - 6, state.player.y - cam.y - 6, 12, 12);
  }
}

let lastOverlayHtml = "";

function setOverlay(html) {
  if (html === lastOverlayHtml) return;
  overlay.innerHTML = html;
  lastOverlayHtml = html;
}

function renderUI() {
  if (state.screen === "title") {
    setOverlay(`
      <div class="center">
        <div class="panel menu">
          <h1>REMNANTS</h1>
          <p>v0.3a prototype — base + corpse recovery loop</p>
          <div class="actions"><button id="start">Deploy</button></div>
        </div>
      </div>
    `);
    return;
  }

  if (state.screen === "base") {
    const corpse = state.corpse;
    const remaining = corpse ? fmt(corpseTimeRemainingMs() / 1000) : "—";
    const integrity = corpse ? `${Math.round(corpseRecoveryFactor() * 100)}%` : "—";
    setOverlay(`
      <div class="center">
        <div class="panel menu" style="text-align:left; width:560px;">
          <h2>House Base <span class="badge">Generation ${state.house.generation}</span></h2>
          <p>${state.message}</p>
          <div class="stat-grid">
            <div><div class="label">Recovered Knowledge</div><div class="value">${state.house.recoveredKnowledge}</div></div>
            <div><div class="label">Active Recovery</div><div class="value ${corpse ? "warn" : "good"}">${corpse ? "YES" : "NONE"}</div></div>
            <div><div class="label">Corpse Timer</div><div class="value ${corpse ? "danger" : ""}">${remaining}</div></div>
            <div><div class="label">Payload Integrity</div><div class="value">${integrity}</div></div>
          </div>
          <ul>
            <li>Recovery requires reaching corpse and extracting back to base.</li>
            <li>Decay timer starts in base and ticks in real-time.</li>
            <li>WASD move, Shift sprint, avoid red hazard zones.</li>
          </ul>
          <div class="actions"><button id="deploy">${corpse ? "Start Recovery Run" : "Start Expedition"}</button></div>
        </div>
      </div>
    `);
    return;
  }

  if (state.screen === "debrief") {
    setOverlay(`
      <div class="center">
        <div class="panel menu" style="text-align:left; width:520px;">
          <h2>${state.summary.status}</h2>
          <p>${state.summary.note}</p>
          <div class="stat-grid">
            <div><div class="label">Run Time</div><div class="value">${fmt(state.summary.runSeconds)}</div></div>
            <div><div class="label">Salvage Carried</div><div class="value">${state.summary.carriedValue}</div></div>
            <div><div class="label">Corpse Recovered</div><div class="value">${state.summary.corpseRecovered ? "YES" : "NO"}</div></div>
            <div><div class="label">House Knowledge</div><div class="value">${state.house.recoveredKnowledge}</div></div>
          </div>
          <div class="actions"><button id="back">Return to Base</button></div>
        </div>
      </div>
    `);
    return;
  }

  const corpseText =
    state.mission?.isRecovery && state.corpse
      ? `Corpse integrity: ${Math.round(corpseRecoveryFactor() * 100)}%`
      : "No recovery payload";

  setOverlay(`
    <div class="panel">
      <div class="label">Vitals</div>
      <div class="value ${state.player.hp < 35 ? "danger" : ""}">${Math.max(0, Math.round(state.player.hp))}%</div>
      <div class="label" style="margin-top:6px;">Carried Salvage</div>
      <div class="value">${state.carriedValue}</div>
      <div class="label" style="margin-top:6px;">Objective</div>
      <div>${state.message}</div>
    </div>
    <div class="panel" style="text-align:right;">
      <div class="label">Mission</div>
      <div class="value">${state.mission?.isRecovery ? "Recovery" : "Expedition"}</div>
      <div class="label" style="margin-top:6px;">${corpseText}</div>
      <div class="label" style="margin-top:6px;">Extract</div>
      <div class="value">(${Math.round(EXTRACT.x - state.player.x)}, ${Math.round(EXTRACT.y - state.player.y)})</div>
    </div>
  `);
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  if (state.screen === "run") drawWorld();
  else {
    ctx.fillStyle = "#040607";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  renderUI();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
