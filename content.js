console.log('hi')
let startTime = null;
let endTime = null;
let isLooping = false;

let speed = 1.0;

const DEFAULT_BUFFER = 3.0; // seconds
let video = null;

// -------------------- INIT --------------------

function getVideo() {
  return document.querySelector("video");
}

function getCurrentTime() {
  return video?.currentTime || 0;
}

// -------------------- LOOP ENGINE --------------------

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
    console.log("breakLoop");
    isLooping = false;
    startTime = null;
    endTime = null;
    updateUI();
  }
}

function loopCheck() {
  if (!video || !isLooping || startTime === null || endTime === null) return;

  if (video.currentTime >= endTime) {
    video.currentTime = startTime;
    video.play();
  }
}

// -------------------- SEEK HANDLING --------------------

function attachSeekBreak() {
  video.addEventListener("seeked", () => {
    if (!isLooping) return;

    isLooping = false;
    startTime = null;
    endTime = null;
    updateUI();
  });
}

// -------------------- SPEED CONTROL --------------------

function setSpeed(val) {
  speed = Math.max(0.25, Math.min(3, val));
  if (video) video.playbackRate = speed;
  updateUI();
}

// -------------------- UI --------------------

function createUI() {
  const container = document.createElement("div");
  container.id = "parrot-mirror-ui";

  container.innerHTML = `
  <div class="pm-row">
    <span>Start:</span>
    <input id="pm-start" placeholder="MM:SS.mmm" />
    <button id="pm-s-start">-</button>
    <button id="pm-s-start-plus">+</button>
  </div>

  <div class="pm-row">
    <span>End:</span>
    <input id="pm-end" placeholder="MM:SS.mmm" />
    <button id="pm-s-end">-</button>
    <button id="pm-s-end-plus">+</button>
  </div>

  <div class="pm-row">
    <button id="pm-loop">LOOP</button>
  </div>

  <div class="pm-row">
    <button id="pm-slow">-</button>
    <span id="pm-speed">1.00x</span>
    <button id="pm-fast">+</button>
  </div>
`;

  return container;
}

function updateUI() {
  const startEl = document.getElementById("pm-start");
  const endEl = document.getElementById("pm-end");
  const speedEl = document.getElementById("pm-speed");

  if (startEl && startTime !== null)
    startEl.value = formatTime(startTime);

  if (endEl && endTime !== null)
    endEl.value = formatTime(endTime);

  if (speedEl)
    speedEl.textContent = speed.toFixed(2) + "x";
}

// -------------------- TIME FORMAT --------------------

function formatTime(t) {
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(3).padStart(6, "0");
  return `${String(m).padStart(2, "0")}:${s}`;
}

function parseTime(str) {
  const [min, sec] = str.split(":");
  return parseInt(min) * 60 + parseFloat(sec);
}

// -------------------- EVENT HOOKS --------------------

function bindUIEvents(container) {
    const loopBtn = container.querySelector("#pm-loop");
    const startInput = container.querySelector("#pm-start");
    const endInput = container.querySelector("#pm-end");
    const slowBtn = container.querySelector("#pm-slow");
    const fastBtn = container.querySelector("#pm-fast");
  
    loopBtn.onclick = toggleLoop;
  
    startInput.onchange = () => {
      startTime = parseTime(startInput.value);
    };
  
    endInput.onchange = () => {
      endTime = parseTime(endInput.value);
    };
  
    slowBtn.onclick = () => setSpeed(speed - 0.05);
    fastBtn.onclick = () => setSpeed(speed + 0.05);
  
    // -------------------- NEW BUTTONS --------------------
  
    container.querySelector("#pm-s-start").onclick = () => shiftStart(-0.25);
    container.querySelector("#pm-s-start-plus").onclick = () => shiftStart(0.25);
  
    container.querySelector("#pm-s-end").onclick = () => shiftEnd(-0.25);
    container.querySelector("#pm-s-end-plus").onclick = () => shiftEnd(0.25);
  }

// -------------------- KEYBOARD SHORTCUTS --------------------

function bindShortcuts() {
  document.addEventListener("keydown", (e) => {
    if (!video) return;

    if (e.altKey && e.key === "l") toggleLoop();

    if (e.altKey && e.key === "s") {
      startTime = getCurrentTime();
      updateUI();
    }

    if (e.altKey && e.key === "e") {
      endTime = getCurrentTime();
      updateUI();
    }

    if (e.altKey && e.key === ",") setSpeed(speed - 0.05);

    if (e.altKey && e.key === ".") setSpeed(speed + 0.05);
  });
}

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

// -------------------- INIT LOOP --------------------

function init() {
  const observer = new MutationObserver(() => {
    const newVideo = getVideo();
    if (newVideo && newVideo !== video) {
      video = newVideo;
      video.playbackRate = speed;

    //   attachSeekBreak();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  setInterval(loopCheck, 50);

  bindShortcuts();
}

// -------------------- INJECT UI --------------------

function injectUI() {
  const target = document.querySelector("#below");

  if (!target || document.getElementById("parrot-mirror-ui")) return;

  const ui = createUI();
  target.prepend(ui);

  bindUIEvents(ui);
  updateUI();
}

setInterval(injectUI, 1000);

init();