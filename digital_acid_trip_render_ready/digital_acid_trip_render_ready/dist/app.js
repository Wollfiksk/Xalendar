const defaultCityEvents = [
  { id: crypto.randomUUID(), day: "Po", time: "09:00", title: "Deploy Ritual", energy: 54 },
  { id: crypto.randomUUID(), day: "Út", time: "10:00", title: "Render Review", energy: 78 },
  { id: crypto.randomUUID(), day: "St", time: "14:00", title: "Chaos Sprint", energy: 64 },
  { id: crypto.randomUUID(), day: "Čt", time: "11:30", title: "Static Sync", energy: 82 },
  { id: crypto.randomUUID(), day: "Pá", time: "16:00", title: "Glitch Demo", energy: 92 },
  { id: crypto.randomUUID(), day: "So", time: "19:00", title: "Afterwave", energy: 70 },
  { id: crypto.randomUUID(), day: "Ne", time: "12:00", title: "Cooldown", energy: 48 }
];

const defaultTodos = [
  { id: crypto.randomUUID(), title: "Pushnout repo na GitHub", priority: "high", done: false },
  { id: crypto.randomUUID(), title: "Připojit repo do Render", priority: "medium", done: false },
  { id: crypto.randomUUID(), title: "Deploynout jako Static Site", priority: "low", done: false },
  { id: crypto.randomUUID(), title: "Otestovat onrender URL", priority: "high", done: true }
];

const defaultMixerEvents = [
  { id: crypto.randomUUID(), label: "Kickoff", level: 48 },
  { id: crypto.randomUUID(), label: "Focus", level: 80 },
  { id: crypto.randomUUID(), label: "Build", level: 68 },
  { id: crypto.randomUUID(), label: "Review", level: 54 },
  { id: crypto.randomUUID(), label: "Deploy", level: 92 },
  { id: crypto.randomUUID(), label: "Cooldown", level: 36 }
];

const defaultDeployConfig = {
  serviceName: "digital-acid-trip-planner",
  branch: "main",
  publishPath: "./dist",
  buildCommand: "npm run build:static"
};

const STORAGE_KEYS = {
  appState: "acid-trip-render-ready-state",
  deployConfig: "acid-trip-render-ready-deploy"
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
  deploy: structuredClone(defaultDeployConfig)
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
const renderServiceNameInput = document.getElementById("renderServiceName");
const renderBranchInput = document.getElementById("renderBranch");
const renderPublishPathInput = document.getElementById("renderPublishPath");
const renderBuildCommandInput = document.getElementById("renderBuildCommand");
const savePresetButton = document.getElementById("savePreset");
const copyRenderYamlButton = document.getElementById("copyRenderYaml");
const exportSnapshotButton = document.getElementById("exportSnapshot");
const importSnapshotButton = document.getElementById("importSnapshot");
const resetDemoButton = document.getElementById("resetDemo");
const importFileInput = document.getElementById("importFileInput");

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

function loadDeployConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.deployConfig);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    state.deploy.serviceName = parsed.serviceName || defaultDeployConfig.serviceName;
    state.deploy.branch = parsed.branch || defaultDeployConfig.branch;
    state.deploy.publishPath = parsed.publishPath || defaultDeployConfig.publishPath;
    state.deploy.buildCommand = parsed.buildCommand || defaultDeployConfig.buildCommand;
  } catch (error) {
    console.warn("Nepovedlo se načíst deploy preset", error);
  }
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
}

function persistDeployConfig() {
  localStorage.setItem(STORAGE_KEYS.deployConfig, JSON.stringify(state.deploy));
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
    deploy: state.deploy,
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
  if (payload.deploy && typeof payload.deploy === "object") {
    state.deploy.serviceName = payload.deploy.serviceName || defaultDeployConfig.serviceName;
    state.deploy.branch = payload.deploy.branch || defaultDeployConfig.branch;
    state.deploy.publishPath = payload.deploy.publishPath || defaultDeployConfig.publishPath;
    state.deploy.buildCommand = payload.deploy.buildCommand || defaultDeployConfig.buildCommand;
  }
  document.body.classList.toggle("hyper", state.hyper);
  persistDeployConfig();
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
  syncReadout.textContent = "READY";
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
    copy.textContent = todo.done ? "Dokončeno / echo fading out / signal dissolving" : `Priorita ${todo.priority.toUpperCase()} / deploy ready ${state.deploy.publishPath}`;
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

function handleDeployConfigChange() {
  state.deploy.serviceName = (renderServiceNameInput.value.trim() || defaultDeployConfig.serviceName)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || defaultDeployConfig.serviceName;
  state.deploy.branch = renderBranchInput.value.trim() || defaultDeployConfig.branch;
  state.deploy.publishPath = renderPublishPathInput.value.trim() || defaultDeployConfig.publishPath;
  state.deploy.buildCommand = renderBuildCommandInput.value.trim() || defaultDeployConfig.buildCommand;
}

function syncInputsFromState() {
  renderServiceNameInput.value = state.deploy.serviceName;
  renderBranchInput.value = state.deploy.branch;
  renderPublishPathInput.value = state.deploy.publishPath;
  renderBuildCommandInput.value = state.deploy.buildCommand;
  chaosDrive.value = String(state.chaos);
  bpmDrive.value = String(state.bpm);
  togglePulseButton.textContent = `${state.bpm} BPM ${state.pulse ? "ON" : "OFF"}`;
  toggleHyperButton.textContent = state.hyper ? "HYPERGLITCH ON" : "HYPERGLITCH OFF";
}

function renderDeployState(statusText) {
  if (statusText) syncStatus.textContent = statusText;
  connectionBadge.textContent = `STATIC READY / ${state.deploy.serviceName}`;
  connectionBadge.className = "live-badge connected";
  syncReadout.textContent = "READY";
}

function buildRenderYaml() {
  const cfg = state.deploy;
  return `services:\n  - type: web\n    name: ${cfg.serviceName}\n    runtime: static\n    branch: ${cfg.branch}\n    buildCommand: ${cfg.buildCommand}\n    staticPublishPath: ${cfg.publishPath}\n    previews:\n      generation: automatic\n    headers:\n      - path: /*\n        name: X-Frame-Options\n        value: sameorigin\n      - path: /*\n        name: Cache-Control\n        value: public, max-age=0, must-revalidate\n`;
}

function savePreset() {
  handleDeployConfigChange();
  persistDeployConfig();
  syncInputsFromState();
  renderDeployState(`Preset uložen. Render služba: ${state.deploy.serviceName} / branch ${state.deploy.branch}.`);
}

async function copyRenderYaml() {
  handleDeployConfigChange();
  persistDeployConfig();
  const yaml = buildRenderYaml();
  try {
    await navigator.clipboard.writeText(yaml);
    renderDeployState("render.yaml zkopírovaný do schránky.");
  } catch (error) {
    downloadTextFile(`render-${state.deploy.serviceName}.yaml`, yaml, "text/yaml");
    renderDeployState("Clipboard nevyšel, tak jsem ti stáhl render.yaml jako soubor.");
  }
}

function downloadTextFile(filename, content, mimeType = "text/plain") {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportSnapshot() {
  handleDeployConfigChange();
  persistDeployConfig();
  persistLocalState();
  const payload = JSON.stringify(serializeAppState(), null, 2);
  downloadTextFile(`${state.deploy.serviceName}-snapshot.json`, payload, "application/json");
  renderDeployState("Snapshot exportnutý jako JSON.");
}

function importSnapshot() {
  importFileInput.click();
}

function handleImportedFile(event) {
  const [file] = event.target.files || [];
  if (!file) return;
  file.text()
    .then((text) => JSON.parse(text))
    .then((payload) => {
      applySerializedState(payload);
      renderDeployState("Snapshot importnutý. Chaos obnoven.");
    })
    .catch((error) => {
      console.error(error);
      renderDeployState(`Import selhal: ${error.message}`);
      connectionBadge.className = "live-badge error";
    })
    .finally(() => {
      importFileInput.value = "";
    });
}

function resetDemo() {
  state.pulse = true;
  state.hyper = false;
  state.bpm = 128;
  state.chaos = 72;
  state.signal = 93;
  state.cityEvents = structuredClone(defaultCityEvents);
  state.mixerEvents = structuredClone(defaultMixerEvents);
  state.todos = structuredClone(defaultTodos);
  state.deploy = structuredClone(defaultDeployConfig);
  document.body.classList.remove("hyper");
  persistLocalState();
  persistDeployConfig();
  syncInputsFromState();
  rerenderAll();
  renderDeployState("Demo resetnuté do Render-ready defaultu.");
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

  renderServiceNameInput.addEventListener("input", handleDeployConfigChange);
  renderBranchInput.addEventListener("input", handleDeployConfigChange);
  renderPublishPathInput.addEventListener("input", handleDeployConfigChange);
  renderBuildCommandInput.addEventListener("input", handleDeployConfigChange);
  savePresetButton.addEventListener("click", savePreset);
  copyRenderYamlButton.addEventListener("click", copyRenderYaml);
  exportSnapshotButton.addEventListener("click", exportSnapshot);
  importSnapshotButton.addEventListener("click", importSnapshot);
  resetDemoButton.addEventListener("click", resetDemo);
  importFileInput.addEventListener("change", handleImportedFile);
}

function rerenderAll() {
  updateCssVars();
  renderCalendar();
  renderTodos();
  renderMixer();
  renderSpectrum();
  renderDeployState();
}

function init() {
  loadLocalState();
  loadDeployConfig();
  document.body.classList.toggle("hyper", state.hyper);
  syncInputsFromState();
  bindControls();
  rerenderAll();
  createReactiveSignals();
  renderDeployState("Projekt je připravený na Render Static Site deploy.");
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
