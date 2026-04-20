const dayNames = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
const cityEvents = [
  { day: "Pondělí", title: "Creative Sync", time: "09:00", energy: 72 },
  { day: "Úterý", title: "Client Ritual", time: "10:00", energy: 88 },
  { day: "Středa", title: "Deep Work", time: "13:00", energy: 54 },
  { day: "Čtvrtek", title: "Visual Sprint", time: "15:00", energy: 95 },
  { day: "Pátek", title: "Review Rave", time: "11:00", energy: 78 },
  { day: "Sobota", title: "Offline Reset", time: "17:00", energy: 34 },
  { day: "Neděle", title: "Dream Mapping", time: "19:00", energy: 62 }
];

const initialTodos = [
  { id: crypto.randomUUID(), title: "Doladit visual moodboard", priority: "high", done: false },
  { id: crypto.randomUUID(), title: "Poslat pitch klientovi", priority: "medium", done: false },
  { id: crypto.randomUUID(), title: "Připravit Tuesday 10:00 flow", priority: "high", done: false },
  { id: crypto.randomUUID(), title: "Vyčistit backlog", priority: "low", done: true }
];

const mixerEvents = [
  { label: "Kickoff", level: 48 },
  { label: "Focus", level: 80 },
  { label: "Sync", level: 68 },
  { label: "Review", level: 54 },
  { label: "Build", level: 92 },
  { label: "Cooldown", level: 36 }
];

const state = {
  pulse: true,
  hyper: false,
  bpm: 128,
  chaos: 72,
  todos: loadTodos(),
  mouse: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 },
  smoothedMouse: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 },
  signal: 93
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
const chaosDrive = document.getElementById("chaosDrive");
const bpmDrive = document.getElementById("bpmDrive");
const spectrumBars = document.getElementById("spectrumBars");

function loadTodos() {
  const stored = localStorage.getItem("acid-trip-ultra-todos");
  if (!stored) return initialTodos;
  try {
    return JSON.parse(stored);
  } catch {
    return initialTodos;
  }
}

function saveTodos() {
  localStorage.setItem("acid-trip-ultra-todos", JSON.stringify(state.todos));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateCssVars() {
  document.documentElement.style.setProperty("--bpm", state.bpm);
  document.documentElement.style.setProperty("--beat", `${60 / state.bpm}s`);
  document.documentElement.style.setProperty("--chaos", state.chaos);
  document.documentElement.style.setProperty("--chaos-n", `${state.chaos / 100}`);
  chaosReadout.textContent = `${state.chaos}%`;
  signalReadout.textContent = `${state.signal}%`;
}

function randomEnergyLabel(priority, done) {
  if (done) return "echo done";
  if (priority === "high") return "hot signal";
  if (priority === "medium") return "mid pulse";
  return "soft drift";
}

function renderCalendar() {
  calendarCity.innerHTML = "";
  cityEvents.forEach((event, index) => {
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

    const intensity = clamp(58 + (state.chaos * 0.25) + (todo.priority === "high" ? 22 : todo.priority === "medium" ? 10 : -8) - (todo.done ? 28 : 0), 18, 99);

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
      saveTodos();
    }, 720);
  } else {
    renderTodos();
    saveTodos();
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
  saveTodos();
  renderTodos();
  todoForm.reset();
}

function renderMixer() {
  mixerTimeline.innerHTML = "";
  const avg = Math.round(mixerEvents.reduce((sum, item) => sum + item.level, 0) / mixerEvents.length);
  mixerLevel.textContent = `${avg}%`;

  mixerEvents.forEach((item, index) => {
    const lane = document.createElement("div");
    lane.className = "mixer-lane";
    const spectrumMarkup = Array.from({ length: 6 }, (_, i) => `<span style="height:${20 + ((item.level + i * 7) % 60)}% ; animation-delay:${i * 70}ms"></span>`).join("");

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
      mixerEvents[index].level = Math.round(percent);
      state.signal = clamp(Math.round((state.signal * 0.92) + percent * 0.08), 65, 99);
      updateCssVars();
      renderMixer();
      renderSpectrum();
    });

    mixerTimeline.appendChild(lane);
  });
}

function renderSpectrum() {
  spectrumBars.innerHTML = "";
  const bars = 20;
  for (let i = 0; i < bars; i += 1) {
    const bar = document.createElement("span");
    const source = mixerEvents[i % mixerEvents.length].level;
    const height = clamp(14 + ((source + state.chaos + i * 9) % 78), 14, 96);
    bar.style.height = `${height}px`;
    bar.style.animationDelay = `${i * 55}ms`;
    spectrumBars.appendChild(bar);
  }
}

function shuffleScene() {
  cityEvents.forEach((event) => {
    event.energy = clamp(event.energy + Math.round((Math.random() - 0.5) * (22 + state.chaos * 0.32)), 24, 99);
  });
  mixerEvents.forEach((item) => {
    item.level = clamp(item.level + Math.round((Math.random() - 0.5) * (26 + state.chaos * 0.28)), 10, 98);
  });
  state.signal = clamp(70 + Math.round(Math.random() * 28), 65, 99);
  renderCalendar();
  renderMixer();
  renderSpectrum();
  updateCssVars();
}

function togglePulse() {
  state.pulse = !state.pulse;
  togglePulseButton.textContent = state.pulse ? `${state.bpm} BPM ON` : `${state.bpm} BPM OFF`;
  renderTodos();
}

function toggleHyper() {
  state.hyper = !state.hyper;
  document.body.classList.toggle("hyper", state.hyper);
  toggleHyperButton.textContent = state.hyper ? "HYPERGLITCH ON" : "HYPERGLITCH OFF";
  if (state.hyper) {
    state.signal = clamp(state.signal + 3, 65, 99);
  }
  updateCssVars();
  renderTodos();
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
  });

  bpmDrive.addEventListener("input", (event) => {
    state.bpm = Number(event.target.value);
    togglePulseButton.textContent = `${state.bpm} BPM ${state.pulse ? "ON" : "OFF"}`;
    updateCssVars();
    renderTodos();
  });

  window.addEventListener("pointermove", (event) => {
    state.mouse.x = event.clientX;
    state.mouse.y = event.clientY;
  });
}

function init() {
  updateCssVars();
  bindControls();
  renderCalendar();
  renderTodos();
  renderMixer();
  renderSpectrum();
  createReactiveSignals();
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
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function drawWaves(timestamp, w, h) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const lines = state.hyper ? 5 : 3;
  for (let i = 0; i < lines; i += 1) {
    const waveY = h * (0.14 + i * 0.18) + Math.sin(timestamp * 0.0012 + i * 1.6) * (16 + state.chaos * 0.05);
    ctx.strokeStyle = ["rgba(203,255,62,0.1)", "rgba(158,67,255,0.12)", "rgba(255,83,219,0.1)", "rgba(70,236,255,0.08)", "rgba(255,177,79,0.08)"][i];
    ctx.lineWidth = 18 - i * 2;
    ctx.beginPath();
    for (let x = -20; x <= w + 20; x += 20) {
      const y = waveY + Math.sin(x * 0.015 + timestamp * 0.0018 + i) * (16 + state.chaos * 0.03) + Math.cos(x * 0.007 + i * 3) * 12;
      if (x === -20) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawSparkles(timestamp, w, h) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  sparkles.forEach((s, index) => {
    const x = (s.x * w + Math.sin(timestamp * 0.0006 * s.speed + s.phase) * 22 + index) % w;
    const y = (s.y * h + Math.cos(timestamp * 0.0005 * s.speed + s.phase) * 20 + index * 0.4) % h;
    const alpha = 0.08 + ((Math.sin(timestamp * 0.003 * s.speed + s.phase) + 1) / 2) * 0.28;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, s.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function animate(timestamp) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);

  state.smoothedMouse.x += (state.mouse.x - state.smoothedMouse.x) * 0.045;
  state.smoothedMouse.y += (state.mouse.y - state.smoothedMouse.y) * 0.045;

  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "rgba(10, 18, 16, 0.2)");
  gradient.addColorStop(1, "rgba(44, 20, 26, 0.16)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  const pointerGlow = ctx.createRadialGradient(state.smoothedMouse.x, state.smoothedMouse.y, 0, state.smoothedMouse.x, state.smoothedMouse.y, 180 + state.chaos * 0.9);
  pointerGlow.addColorStop(0, "rgba(255,255,255,0.12)");
  pointerGlow.addColorStop(0.3, "rgba(70,236,255,0.08)");
  pointerGlow.addColorStop(1, "rgba(70,236,255,0)");
  ctx.fillStyle = pointerGlow;
  ctx.fillRect(0, 0, w, h);

  blobs.forEach((blob, index) => {
    blob.angle += blob.speed * (state.pulse ? state.bpm / 128 : 0.4) * (state.hyper ? 1.4 : 1);
    const x = state.smoothedMouse.x * 0.24 + w * 0.5 + Math.cos(blob.angle + index) * (blob.radius + Math.sin(timestamp * 0.0008 + index) * blob.orbit);
    const y = state.smoothedMouse.y * 0.12 + h * 0.42 + Math.sin(blob.angle * 1.18 + index) * (blob.radius * 0.52);
    const radial = ctx.createRadialGradient(x, y, 0, x, y, blob.size + state.chaos * 0.8);
    radial.addColorStop(0, `hsla(${blob.hue}, 98%, 64%, ${0.18 + state.chaos * 0.0015})`);
    radial.addColorStop(0.45, `hsla(${blob.hue}, 96%, 56%, 0.11)`);
    radial.addColorStop(1, `hsla(${blob.hue}, 95%, 50%, 0)`);
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(x, y, blob.size + Math.sin(timestamp * 0.001 + index) * 8, 0, Math.PI * 2);
    ctx.fill();
  });

  if (state.hyper) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = "rgba(255,83,219,0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 18; i += 1) {
      const y = (i / 18) * h + Math.sin(timestamp * 0.002 + i) * 6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + Math.cos(timestamp * 0.003 + i) * 12);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawWaves(timestamp, w, h);
  drawSparkles(timestamp, w, h);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
