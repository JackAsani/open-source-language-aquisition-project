console.log("hi");

let startTime = null;
let endTime = null;
let isLooping = false;

let speed = 1.0;

const DEFAULT_BUFFER = 3.0;

let video = null;

// ================= TIMELINE =================

let pixelsPerSecond = 120;

const MIN_ZOOM = 40;
const MAX_ZOOM = 600;

let timelineInner = null;
let loopRegion = null;
let playheadTime = null;

// drag state
let isDraggingLoop = false;
let dragStartTime = null;
let isScrubbing = false;

// ================= VIDEO =================

function getVideo() {
  return document.querySelector("video");
}

function getCurrentTime() {
  return video?.currentTime || 0;
}

function getDuration() {
  return video?.duration || 0;
}

// ================= LOOP =================

function setLoopFromCurrent() {
  const t = getCurrentTime();

  startTime = t;
  endTime = t + DEFAULT_BUFFER;

  isLooping = true;

  updateUI();
}

function toggleLoop() {
  if (!video) return;

  if (!isLooping) {
    setLoopFromCurrent();
  } else {
    isLooping = false;
    startTime = null;
    endTime = null;
  }

  updateUI();
}

function loopCheck() {
  if (!video || !isLooping) return;
  if (startTime === null || endTime === null) return;

  if (video.currentTime >= endTime) {
    video.currentTime = startTime;
    video.play();
  }
}

// ================= SPEED =================

function setSpeed(val) {
  speed = Math.max(0.25, Math.min(3, val));

  if (video) video.playbackRate = speed;

  updateUI();
}

// ================= TIME =================

function formatTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function parseTime(str) {
  const [min, sec] = str.split(":");
  return parseInt(min) * 60 + parseFloat(sec);
}

// ================= SHIFT =================

function shiftStart(delta) {
  if (startTime === null) return;

  startTime = Math.max(0, Math.min(endTime - 0.1, startTime + delta));
  updateUI();
}

function shiftEnd(delta) {
  if (endTime === null) return;

  endTime = Math.max(startTime + 0.1, endTime + delta);
  updateUI();
}

// ================= UI =================

function createUI() {
  const container = document.createElement("div");

  container.id = "parrot-mirror-ui";

  container.innerHTML = `
  <div class="pm-header">
    <div class="pm-title">PARROT MIRROR</div>

    <div class="pm-controls">
      <button id="pm-loop" class="pm-main-btn">LOOP</button>
      <button id="pm-zoom-out" class="pm-icon-btn">−</button>
      <button id="pm-zoom-in" class="pm-icon-btn">+</button>
    </div>
  </div>

  <div class="pm-timeline-wrapper">

    <div class="pm-played-overlay"></div>

    <div class="pm-center-line"></div>

    <div id="pm-timeline-inner">

      <div id="pm-loop-region"></div>

      <div id="pm-ticks"></div>

    </div>
  </div>

  <div class="pm-bottom">

    <div class="pm-time-group">
      <span>START</span>
      <input id="pm-start" />
      <button id="pm-s-start">−</button>
      <button id="pm-s-start-plus">+</button>
    </div>

    <div class="pm-time-group">
      <span>END</span>
      <input id="pm-end" />
      <button id="pm-s-end">−</button>
      <button id="pm-s-end-plus">+</button>
    </div>

    <div class="pm-speed">
      <button id="pm-slow">−</button>
      <span id="pm-speed">1.00x</span>
      <button id="pm-fast">+</button>
    </div>

  </div>

  <div class="pm-current-time" id="pm-current-time">
    00:00
  </div>
  `;

  return container;
}

// ================= TIMELINE =================

function renderTimeline() {
  if (!video || !timelineInner) return;

  const current = getCurrentTime();
  const duration = getDuration();

  const width = duration * pixelsPerSecond;
  timelineInner.style.width = `${width}px`;

  const wrapper =
    document.querySelector(".pm-timeline-wrapper");

  const wrapperWidth = wrapper?.offsetWidth || 0;

  const offset =
    wrapperWidth / 2 - current * pixelsPerSecond;

  timelineInner.style.transform =
    `translateX(${offset}px)`;

  // loop region
  if (loopRegion && startTime !== null && endTime !== null) {
    loopRegion.style.display = "block";
    loopRegion.style.left = `${startTime * pixelsPerSecond}px`;
    loopRegion.style.width = `${(endTime - startTime) * pixelsPerSecond}px`;
  } else if (loopRegion) {
    loopRegion.style.display = "none";
  }

  // played overlay (LEFT side)
  const played = document.querySelector(".pm-played-overlay");
  if (played) {
    played.style.width = `${current * pixelsPerSecond}px`;
  }

  if (playheadTime) {
    playheadTime.textContent = formatTime(current);
  }

  renderTicks(duration);
}

// ================= TICKS =================

let lastZoom = null;
let lastDuration = null;

function renderTicks(duration) {
  const ticks = document.getElementById("pm-ticks");
  if (!ticks) return;

  if (lastZoom === pixelsPerSecond && lastDuration === duration) return;

  lastZoom = pixelsPerSecond;
  lastDuration = duration;

  ticks.innerHTML = "";

  const interval = 1;

  for (let t = 0; t < duration; t += interval) {
    const tick = document.createElement("div");

    tick.className = "pm-tick";
    tick.style.left = `${t * pixelsPerSecond}px`;

    tick.innerHTML = `
      <div class="pm-tick-line"></div>
      <div class="pm-tick-label">${formatTime(t)}</div>
    `;

    ticks.appendChild(tick);
  }
}

// ================= TIME CONVERT =================

function screenXToTime(clientX) {
  const wrapper = document.querySelector(".pm-timeline-wrapper");
  const rect = wrapper.getBoundingClientRect();

  const current = getCurrentTime();

  const centerX = rect.width / 2;

  const deltaPx = clientX - rect.left - centerX;

  const deltaTime = deltaPx / pixelsPerSecond;

  return Math.max(0, current + deltaTime);
}

// ================= UPDATE =================

function updateUI() {
  const startEl = document.getElementById("pm-start");
  const endEl = document.getElementById("pm-end");
  const speedEl = document.getElementById("pm-speed");
  const loopBtn = document.getElementById("pm-loop");

  if (startEl && startTime !== null) {
    startEl.value = formatTime(startTime);
  }

  if (endEl && endTime !== null) {
    endEl.value = formatTime(endTime);
  }

  if (speedEl) speedEl.textContent = speed.toFixed(2) + "x";

  if (loopBtn) {
    loopBtn.classList.toggle("active", isLooping);
  }

  renderTimeline();
}

// ================= EVENTS =================

function bindUIEvents(container) {
  const loopBtn = container.querySelector("#pm-loop");

  const wrapper = container.querySelector(".pm-timeline-wrapper");

  loopBtn.onclick = toggleLoop;

  // ================= DRAG SELECT =================

  wrapper.addEventListener("mousedown", (e) => {
    if (!video) return;
  
    e.preventDefault();
  
    // 🚨 HARD FREEZE EVERYTHING OUTSIDE UI
    document.body.style.pointerEvents = "none";
    wrapper.style.pointerEvents = "auto";
  
    isScrubbing = true;
    isDraggingLoop = true;
  
    const t = screenXToTime(e.clientX);
  
    dragStartTime = t;
  
    startTime = t;
    endTime = t;
  
    isLooping = true;
  
    // 🧊 HARD PAUSE (prevents YouTube resume race)
    video.pause();
    video.currentTime = video.currentTime;
  
    updateUI();
  }, true);

  window.addEventListener("mousemove", (e) => {
    if (!isDraggingLoop) return;

    const t = screenXToTime(e.clientX);

    startTime = Math.min(dragStartTime, t);
    endTime = Math.max(dragStartTime, t);

    updateUI();
  });

window.addEventListener("mouseup", () => {
  if (!isDraggingLoop) return;

  isDraggingLoop = false;
  isScrubbing = false;

  document.body.style.pointerEvents = "";

  if (endTime - startTime < 0.1) {
    endTime = startTime + 0.1;
  }

  video.currentTime = startTime;
  video.play();

  isLooping = true;

  updateUI();
});
}

// ================= LOOP ENGINE =================

function loopCheck() {
  if (!video || !isLooping) return;
  if (startTime === null || endTime === null) return;

  if (video.currentTime >= endTime) {
    video.currentTime = startTime;
    video.play();
  }
}

// ================= INIT =================

function init() {
  const observer = new MutationObserver(() => {
    const newVideo = getVideo();
    if (newVideo && newVideo !== video) {
      video = newVideo;
      video.playbackRate = speed;
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  setInterval(loopCheck, 50);

  requestAnimationFrame(function loop() {
    if (!isScrubbing) renderTimeline();
    requestAnimationFrame(loop);
  });
}

// ================= INJECT =================

function injectUI() {
  const target = document.querySelector("#below");

  if (!target || document.getElementById("parrot-mirror-ui")) return;

  const ui = createUI();
  target.prepend(ui);

  timelineInner = document.getElementById("pm-timeline-inner");
  loopRegion = document.getElementById("pm-loop-region");
  playheadTime = document.getElementById("pm-current-time");

  bindUIEvents(ui);
  renderTicks(getDuration());
  updateUI();
}

setInterval(injectUI, 1000);

init();