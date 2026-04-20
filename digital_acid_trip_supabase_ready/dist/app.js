
const defaultCityEvents = [
  { id: crypto.randomUUID(), day: "Po", time: "09:00", title: "Ritual Sync", energy: 54 },
  { id: crypto.randomUUID(), day: "Út", time: "10:00", title: "Neon Review", energy: 78 },
  { id: crypto.randomUUID(), day: "St", time: "14:00", title: "Chaos Sprint", energy: 64 },
  { id: crypto.randomUUID(), day: "Čt", time: "11:30", title: "Pulse Jam", energy: 82 },
  { id: crypto.randomUUID(), day: "Pá", time: "16:00", title: "Glitch Demo", energy: 92 },
  { id: crypto.randomUUID(), day: "So", time: "19:00", title: "Afterwave", energy: 70 },
  { id: crypto.randomUUID(), day: "Ne", time: "12:00", title: "Cooldown", energy: 48 }
];

const defaultTodos = [
  { id: crypto.randomUUID(), title: "Zkontrolovat build pro storage bucket", priority: "high", done: false },
  { id: crypto.randomUUID(), title: "Doplnit Supabase URL + key", priority: "medium", done: false },
  { id: crypto.randomUUID(), title: "Přehodit workspace na vlastní název", priority: "low", done: false },
  { id: crypto.randomUUID(), title: "Otestovat push/pull sync", priority: "high", done: true }
];

const defaultMixerEvents = [
  { id: crypto.randomUUID(), label: "Kickoff", level: 48 },
  { id: crypto.randomUUID(), label: "Focus", level: 80 },
  { id: crypto.randomUUID(), label: "Sync", level: 68 },
  { id: crypto.randomUUID(), label: "Review", level: 54 },
  { id: crypto.randomUUID(), label: "Build", level: 92 },
  { id: crypto.randomUUID(), label: "Cooldown", level: 36 }
];

const STORAGE_KEYS = {
  appState: "acid-trip-supabase-ready-state",
  cloudConfig: "acid-trip-supabase-ready-cloud"
};

const state = {
  pulse: true,
  hyper: false,
  bpm: 128,
  chaos: 72,
  signal: 93,
  cityEvents: structuredClone(defaultCityEvents),
  mixerEvents: structuredClone(defaultMixerEvents),
  todos: structuredClone(defaultTodos),
  mouse: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 },
  smoothedMouse: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 },
  cloud: {
    url: "",
    key: "",
    workspace: "acid-lab",
    autosync: false,
    client: null,
    enabled: false,
    lastSyncAt: null,
    pendingPush: null
  }
};

const calendarCity = document.getElementById("calendarCity");
const todoList = document.getElementById("todoList");
const todoTemplate = document.getElementById("todoTemplate");
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const priorityInput = document.getElementById("priorityInput");
const togglePulseButton = document.getElementById("togglePulse");
const toggleHyperButton = document.getElementById("toggleHyper");
const shuffleButton = document.getElementById("shuffleScene");
const mixerTimeline = document.getElementById("mixerTimeline");
const mixerLevel = document.getElementById("mixerLevel");
const signalReadout = document.getElementById("signalReadout");
const chaosReadout = document.getElementById("chaosReadout");
const syncReadout = document.getElementById("syncReadout");
const chaosDrive = document.getElementById("chaosDrive");
const bpmDrive = document.getElementById("bpmDrive");
const spectrumBars = document.getElementById("spectrumBars");
const connectionBadge = document.getElementById("connectionBadge");
const syncStatus = document.getElementById("syncStatus");
const supabaseUrlInput = document.getElementById("supabaseUrl");
const supabaseKeyInput = document.getElementById("supabaseKey");
const workspaceInput = document.getElementById("workspaceInput");
const toggleAutosyncButton = document.getElementById("toggleAutosync");
const connectCloudButton = document.getElementById("connectCloud");
const pushCloudButton = document.getElementById("pushCloud");
const pullCloudButton = document.getElementById("pullCloud");
const disconnectCloudButton = document.getElementById("disconnectCloud");

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function loadLocalState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.appState);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed.todos)) state.todos = parsed.todos;
    if (Array.isArray(parsed.cityEvents)) state.cityEvents = parsed.cityEvents;
    if (Array.isArray(parsed.mixerEvents)) state.mixerEvents = parsed.mixerEvents;
    if (typeof parsed.pulse === "boolean") state.pulse = parsed.pulse;
    if (typeof parsed.hyper === "boolean") state.hyper = parsed.hyper;
    if (typeof parsed.bpm === "number") state.bpm = clamp(parsed.bpm, 96, 168);
    if (typeof parsed.chaos === "number") state.chaos = clamp(parsed.chaos, 20, 100);
    if (typeof parsed.signal === "number") state.signal = clamp(parsed.signal, 65, 99);
  } catch (error) {
    console.warn("Nepovedlo se načíst lokální stav", error);
  }
}

function loadCloudConfig() {
  const defaults = window.ACID_SUPABASE_CONFIG || {};
  let local = {};
  try {
    local = JSON.parse(localStorage.getItem(STORAGE_KEYS.cloudConfig) || "{}");
  } catch {}
  state.cloud.url = local.url || defaults.url || "";
  state.cloud.key = local.key || defaults.key || "";
  state.cloud.workspace = local.workspace || defaults.workspace || "acid-lab";
  state.cloud.autosync = Boolean(local.autosync || defaults.autosync || false);
}

function persistLocalState() {
  const payload = {
    pulse: state.pulse,
    hyper: state.hyper,
    bpm: state.bpm,
    chaos: state.chaos,
    signal: state.signal,
    todos: state.todos,
    cityEvents: state.cityEvents,
    mixerEvents: state.mixerEvents
  };
  localStorage.setItem(STORAGE_KEYS.appState, JSON.stringify(payload));
  queueAutosync();
}

function persistCloudConfig() {
  const payload = {
    url: state.cloud.url,
    key: state.cloud.key,
    workspace: state.cloud.workspace,
    autosync: state.cloud.autosync
  };
  localStorage.setItem(STORAGE_KEYS.cloudConfig, JSON.stringify(payload));
}

function serializeAppState() {
  return {
    pulse: state.pulse,
    hyper: state.hyper,
    bpm: state.bpm,
    chaos: state.chaos,
    signal: state.signal,
    todos: state.todos,
    cityEvents: state.cityEvents,
    mixerEvents: state.mixerEvents,
    updatedAt: new Date().toISOString()
  };
}

function applySerializedState(payload) {
  if (!payload || typeof payload !== "object") return;
  if (Array.isArray(payload.todos)) state.todos = payload.todos;
  if (Array.isArray(payload.cityEvents)) state.cityEvents = payload.cityEvents;
  if (Array.isArray(payload.mixerEvents)) state.mixerEvents = payload.mixerEvents;
  if (typeof payload.pulse === "boolean") state.pulse = payload.pulse;
  if (typeof payload.hyper === "boolean") state.hyper = payload.hyper;
  if (typeof payload.bpm === "number") state.bpm = clamp(payload.bpm, 96, 168);
  if (typeof payload.chaos === "number") state.chaos = clamp(payload.chaos, 20, 100);
  if (typeof payload.signal === "number") state.signal = clamp(payload.signal, 65, 99);
  document.body.classList.toggle("hyper", state.hyper);
  persistLocalState();
  syncInputsFromState();
  rerenderAll();
}

function updateCssVars() {
  document.documentElement.style.setProperty("--bpm", state.bpm);
  document.documentElement.style.setProperty("--beat", `${60 / state.bpm}s`);
  document.documentElement.style.setProperty("--chaos", state.chaos);
  document.documentElement.style.setProperty("--chaos-n", `${state.chaos / 100}`);
  chaosReadout.textContent = `${state.chaos}%`;
  signalReadout.textContent = `${state.signal}%`;
  syncReadout.textContent = state.cloud.enabled ? "CLOUD" : "LOCAL";
}

function randomEnergyLabel(priority, done) {
  if (done) return "echo done";
  if (priority === "high") return "hot signal";
  if (priority === "medium") return "mid pulse";
  return "soft drift";
}

function renderCalendar() {
  calendarCity.innerHTML = "";
  state.cityEvents.forEach((event, index) => {
    const towerHeight = 90 + event.energy * 1.4 + state.chaos * 0.15;
    const wrapper = document.createElement("div");
    wrapper.className = "day-tower";
    const float = ((index % 4) + 1) / 4;
    wrapper.innerHTML = `
      <div class="tower" style="--tower-height:${towerHeight}px; --float:${float}">
        <div class="tower-face"></div>
        <div class="tower-side"></div>
        <div class="tower-top"></div>
        <div class="tower-core"></div>
        <div class="tower-satellite"></div>
      </div>
      <div class="day-label">
        <strong>${event.day}</strong>
        <span>${event.time} / ${event.title}</span>
      </div>
    `;
    wrapper.style.transform = `translateY(${(6 - (index % 3)) * 2}px)`;
    calendarCity.appendChild(wrapper);
  });
}

function renderTodos() {
  todoList.innerHTML = "";
  state.todos.forEach((todo, index) => {
    const fragment = todoTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".todo-card");
    const title = fragment.querySelector("h3");
    const copy = fragment.querySelector("p");
    const priority = fragment.querySelector(".todo-priority");
    const energy = fragment.querySelector(".todo-energy");
    const toggle = fragment.querySelector(".todo-toggle");

    card.classList.add(todo.priority);
    if (todo.done) card.classList.add("done");
    if (state.hyper && !todo.done) card.style.transform = `translateX(${index % 2 === 0 ? 0.5 : -0.5}px)`;
    title.textContent = todo.title;
    copy.textContent = todo.done ? "Dokončeno / echo fading out / signal dissolving" : `Priorita ${todo.priority.toUpperCase()} / chaos sync ${state.chaos}%`;
    priority.textContent = todo.priority;
    energy.textContent = randomEnergyLabel(todo.priority, todo.done);

    toggle.addEventListener("click", () => toggleTodo(todo.id, card));
    todoList.appendChild(fragment);
  });
}

function toggleTodo(id, cardEl) {
  const target = state.todos.find((todo) => todo.id === id);
  if (!target) return;
  target.done = !target.done;
  state.signal = clamp(state.signal + (target.done ? 2 : -2), 65, 99);
  updateCssVars();
  if (target.done && cardEl) {
    cardEl.classList.add("glitch");
    setTimeout(() => {
      renderTodos();
      persistLocalState();
    }, 720);
  } else {
    renderTodos();
    persistLocalState();
  }
}

function addTodo(event) {
  event.preventDefault();
  const title = todoInput.value.trim();
  if (!title) return;
  state.todos.unshift({
    id: crypto.randomUUID(),
    title,
    priority: priorityInput.value,
    done: false
  });
  state.signal = clamp(state.signal - 1, 65, 99);
  updateCssVars();
  persistLocalState();
  renderTodos();
  todoForm.reset();
}

function renderMixer() {
  mixerTimeline.innerHTML = "";
  const avg = Math.round(state.mixerEvents.reduce((sum, item) => sum + item.level, 0) / state.mixerEvents.length);
  mixerLevel.textContent = `${avg}%`;

  state.mixerEvents.forEach((item, index) => {
    const lane = document.createElement("div");
    lane.className = "mixer-lane";
    const spectrumMarkup = Array.from({ length: 6 }, (_, i) => `<span style="height:${20 + ((item.level + i * 7) % 60)}%; animation-delay:${i * 70}ms"></span>`).join("");

    lane.innerHTML = `
      <div class="mixer-bar-wrap">
        <div class="mixer-spectrum">${spectrumMarkup}</div>
        <div class="mixer-bar" style="height:${item.level}%">
          <div class="mixer-handle" style="bottom:calc(${item.level}% - 7px)"></div>
        </div>
      </div>
      <div class="mixer-label">${item.label}</div>
    `;

    lane.querySelector(".mixer-bar-wrap").addEventListener("click", (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const percent = clamp(((rect.bottom - event.clientY) / rect.height) * 100, 8, 98);
      state.mixerEvents[index].level = Math.round(percent);
      state.signal = clamp(Math.round((state.signal * 0.92) + percent * 0.08), 65, 99);
      updateCssVars();
      renderMixer();
      renderSpectrum();
      persistLocalState();
    });

    mixerTimeline.appendChild(lane);
  });
}

function renderSpectrum() {
  spectrumBars.innerHTML = "";
  const bars = 24;
  for (let i = 0; i < bars; i += 1) {
    const bar = document.createElement("span");
    const source = state.mixerEvents[i % state.mixerEvents.length].level;
    const height = clamp(14 + ((source + state.chaos + i * 9) % 78), 14, 96);
    bar.style.height = `${height}px`;
    bar.style.animationDelay = `${i * 55}ms`;
    spectrumBars.appendChild(bar);
  }
}

function shuffleScene() {
  state.cityEvents = state.cityEvents.map((event) => ({
    ...event,
    energy: clamp(event.energy + Math.round((Math.random() - 0.5) * (22 + state.chaos * 0.32)), 24, 99)
  }));
  state.mixerEvents = state.mixerEvents.map((item) => ({
    ...item,
    level: clamp(item.level + Math.round((Math.random() - 0.5) * (26 + state.chaos * 0.28)), 10, 98)
  }));
  state.signal = clamp(70 + Math.round(Math.random() * 28), 65, 99);
  renderCalendar();
  renderMixer();
  renderSpectrum();
  updateCssVars();
  persistLocalState();
}

function togglePulse() {
  state.pulse = !state.pulse;
  togglePulseButton.textContent = `${state.bpm} BPM ${state.pulse ? "ON" : "OFF"}`;
  renderTodos();
  persistLocalState();
}

function toggleHyper() {
  state.hyper = !state.hyper;
  document.body.classList.toggle("hyper", state.hyper);
  toggleHyperButton.textContent = state.hyper ? "HYPERGLITCH ON" : "HYPERGLITCH OFF";
  if (state.hyper) state.signal = clamp(state.signal + 3, 65, 99);
  updateCssVars();
  renderTodos();
  persistLocalState();
}

function createReactiveSignals() {
  setInterval(() => {
    const drift = (Math.random() - 0.5) * (state.hyper ? 8 : 4);
    state.signal = clamp(Math.round(state.signal + drift), 65, 99);
    updateCssVars();
  }, 900);
}

function bindControls() {
  togglePulseButton.addEventListener("click", togglePulse);
  toggleHyperButton.addEventListener("click", toggleHyper);
  shuffleButton.addEventListener("click", shuffleScene);
  todoForm.addEventListener("submit", addTodo);

  chaosDrive.addEventListener("input", (event) => {
    state.chaos = Number(event.target.value);
    updateCssVars();
    renderCalendar();
    renderTodos();
    renderSpectrum();
    persistLocalState();
  });

  bpmDrive.addEventListener("input", (event) => {
    state.bpm = Number(event.target.value);
    togglePulseButton.textContent = `${state.bpm} BPM ${state.pulse ? "ON" : "OFF"}`;
    updateCssVars();
    renderTodos();
    persistLocalState();
  });

  window.addEventListener("pointermove", (event) => {
    state.mouse.x = event.clientX;
    state.mouse.y = event.clientY;
  });

  supabaseUrlInput.addEventListener("input", handleCloudConfigChange);
  supabaseKeyInput.addEventListener("input", handleCloudConfigChange);
  workspaceInput.addEventListener("input", handleCloudConfigChange);
  toggleAutosyncButton.addEventListener("click", () => {
    state.cloud.autosync = !state.cloud.autosync;
    persistCloudConfig();
    renderCloudState();
  });
  connectCloudButton.addEventListener("click", connectCloud);
  pushCloudButton.addEventListener("click", pushCloudState);
  pullCloudButton.addEventListener("click", pullCloudState);
  disconnectCloudButton.addEventListener("click", disconnectCloud);
}

function handleCloudConfigChange() {
  state.cloud.url = supabaseUrlInput.value.trim();
  state.cloud.key = supabaseKeyInput.value.trim();
  state.cloud.workspace = workspaceInput.value.trim() || "acid-lab";
  persistCloudConfig();
  renderCloudState();
}

function syncInputsFromState() {
  supabaseUrlInput.value = state.cloud.url;
  supabaseKeyInput.value = state.cloud.key;
  workspaceInput.value = state.cloud.workspace;
  chaosDrive.value = String(state.chaos);
  bpmDrive.value = String(state.bpm);
  togglePulseButton.textContent = `${state.bpm} BPM ${state.pulse ? "ON" : "OFF"}`;
  toggleHyperButton.textContent = state.hyper ? "HYPERGLITCH ON" : "HYPERGLITCH OFF";
}

function renderCloudState(statusText) {
  toggleAutosyncButton.textContent = state.cloud.autosync ? "AUTO SYNC ON" : "AUTO SYNC OFF";
  if (statusText) syncStatus.textContent = statusText;

  if (state.cloud.enabled) {
    connectionBadge.textContent = `CONNECTED / ${state.cloud.workspace}`;
    connectionBadge.className = "live-badge connected";
    syncReadout.textContent = "CLOUD";
  } else if (state.cloud.url && state.cloud.key) {
    connectionBadge.textContent = `READY / ${state.cloud.workspace}`;
    connectionBadge.className = "live-badge warning";
    syncReadout.textContent = "ARMED";
  } else {
    connectionBadge.textContent = "OFFLINE SAFE";
    connectionBadge.className = "live-badge";
    syncReadout.textContent = "LOCAL";
  }
}

async function connectCloud() {
  try {
    if (!state.cloud.url || !state.cloud.key) {
      renderCloudState("Doplň Project URL a publishable/anon key.");
      return;
    }
    if (!window.supabase?.createClient) {
      renderCloudState("Supabase klient se nenačetl. Zkontroluj připojení k internetu nebo CDN script.");
      return;
    }
    state.cloud.client = window.supabase.createClient(state.cloud.url, state.cloud.key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    state.cloud.enabled = true;
    persistCloudConfig();
    renderCloudState("Cloud připojen. Zkouším načíst workspace…");
    await ensureRemoteRowExists();
    await pullCloudState();
  } catch (error) {
    console.error(error);
    state.cloud.enabled = false;
    renderCloudState(`Připojení selhalo: ${error.message}`);
    connectionBadge.className = "live-badge error";
  }
  updateCssVars();
}

async function ensureRemoteRowExists() {
  const client = state.cloud.client;
  if (!client) return;
  const { data, error } = await client
    .from("acid_planner_state")
    .select("workspace")
    .eq("workspace", state.cloud.workspace)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const insertResult = await client
      .from("acid_planner_state")
      .insert({ workspace: state.cloud.workspace, state: serializeAppState() });
    if (insertResult.error) throw insertResult.error;
  }
}

async function pushCloudState() {
  if (!state.cloud.enabled || !state.cloud.client) {
    renderCloudState("Nejdřív klikni na Připojit cloud.");
    return;
  }
  const { error } = await state.cloud.client
    .from("acid_planner_state")
    .upsert({
      workspace: state.cloud.workspace,
      state: serializeAppState(),
      updated_at: new Date().toISOString()
    }, { onConflict: "workspace" });

  if (error) {
    console.error(error);
    renderCloudState(`Push selhal: ${error.message}`);
    connectionBadge.className = "live-badge error";
    return;
  }

  state.cloud.lastSyncAt = new Date().toISOString();
  renderCloudState(`Push hotový. Workspace ${state.cloud.workspace} uložen do cloudu.`);
}

async function pullCloudState() {
  if (!state.cloud.enabled || !state.cloud.client) {
    renderCloudState("Nejdřív klikni na Připojit cloud.");
    return;
  }
  const { data, error } = await state.cloud.client
    .from("acid_planner_state")
    .select("state, updated_at")
    .eq("workspace", state.cloud.workspace)
    .maybeSingle();

  if (error) {
    console.error(error);
    renderCloudState(`Pull selhal: ${error.message}`);
    connectionBadge.className = "live-badge error";
    return;
  }

  if (data?.state) {
    applySerializedState(data.state);
    state.cloud.lastSyncAt = data.updated_at || new Date().toISOString();
    renderCloudState(`Pull hotový. Načten workspace ${state.cloud.workspace}.`);
  } else {
    renderCloudState(`Workspace ${state.cloud.workspace} je zatím prázdný. Lokální stav zůstává.`);
  }
}

function disconnectCloud() {
  state.cloud.enabled = false;
  state.cloud.client = null;
  renderCloudState("Cloud odpojen. App běží dál lokálně.");
  updateCssVars();
}

function queueAutosync() {
  if (!state.cloud.autosync || !state.cloud.enabled) return;
  clearTimeout(state.cloud.pendingPush);
  state.cloud.pendingPush = setTimeout(() => {
    pushCloudState();
  }, 700);
}

function rerenderAll() {
  updateCssVars();
  renderCalendar();
  renderTodos();
  renderMixer();
  renderSpectrum();
  renderCloudState();
}

function init() {
  loadLocalState();
  loadCloudConfig();
  document.body.classList.toggle("hyper", state.hyper);
  syncInputsFromState();
  bindControls();
  rerenderAll();
  createReactiveSignals();
  if (state.cloud.url && state.cloud.key) {
    renderCloudState("Supabase config nalezený. Klikni na Připojit cloud.");
  }
}

init();

const canvas = document.getElementById("liquid-bg");
const ctx = canvas.getContext("2d");
const blobs = Array.from({ length: 20 }, (_, index) => ({
  angle: Math.random() * Math.PI * 2,
  radius: 60 + Math.random() * 320,
  orbit: 24 + index * 9,
  speed: 0.0015 + Math.random() * 0.0045,
  size: 44 + Math.random() * 140,
  hue: [82, 276, 324, 28, 190][index % 5]
}));
const sparkles = Array.from({ length: 70 }, () => ({
  x: Math.random(),
  y: Math.random(),
  speed: 0.2 + Math.random() * 0.8,
  phase: Math.random() * Math.PI * 2,
  size: 0.6 + Math.random() * 2.2
}));

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawBackground(time) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  state.smoothedMouse.x += (state.mouse.x - state.smoothedMouse.x) * 0.045;
  state.smoothedMouse.y += (state.mouse.y - state.smoothedMouse.y) * 0.045;

  const gradient = ctx.createRadialGradient(
    state.smoothedMouse.x,
    state.smoothedMouse.y,
    20,
    window.innerWidth * 0.5,
    window.innerHeight * 0.55,
    Math.max(window.innerWidth, window.innerHeight) * 0.78
  );
  gradient.addColorStop(0, "rgba(255,83,219,0.17)");
  gradient.addColorStop(0.34, "rgba(70,236,255,0.12)");
  gradient.addColorStop(0.68, "rgba(203,255,62,0.08)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  blobs.forEach((blob, index) => {
    const a = time * blob.speed + blob.angle;
    const mx = (state.smoothedMouse.x / window.innerWidth - 0.5) * (12 + index);
    const my = (state.smoothedMouse.y / window.innerHeight - 0.5) * (14 + index);
    const x = window.innerWidth * 0.5 + Math.cos(a * 1.2) * blob.radius + mx;
    const y = window.innerHeight * 0.52 + Math.sin(a * 1.1) * blob.orbit * 7 + my;
    const g = ctx.createRadialGradient(x, y, blob.size * 0.1, x, y, blob.size);
    const alpha = 0.08 + (state.chaos / 100) * 0.07 + (state.hyper ? 0.03 : 0);
    g.addColorStop(0, `hsla(${blob.hue}, 100%, 68%, ${alpha + 0.06})`);
    g.addColorStop(0.45, `hsla(${blob.hue}, 96%, 58%, ${alpha})`);
    g.addColorStop(1, `hsla(${blob.hue}, 96%, 50%, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, blob.size, 0, Math.PI * 2);
    ctx.fill();
  });

  sparkles.forEach((sparkle, index) => {
    const x = ((sparkle.x * window.innerWidth) + time * 24 * sparkle.speed) % (window.innerWidth + 40) - 20;
    const y = sparkle.y * window.innerHeight + Math.sin(time * sparkle.speed + sparkle.phase) * 16;
    ctx.fillStyle = `rgba(255,255,255,${0.14 + ((index % 5) * 0.04)})`;
    ctx.beginPath();
    ctx.arc(x, y, sparkle.size + (state.hyper ? 0.5 : 0), 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame((nextTime) => drawBackground(nextTime * 0.001));
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
requestAnimationFrame((time) => drawBackground(time * 0.001));
