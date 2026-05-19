const TOTAL_BARS = 28;
const DB_MIN = 30;
const DB_MAX = 100;
const THRESHOLD_LOUD = 75;
const THRESHOLD_WAAAY = 90;
const SMOOTHING = 0.85;
const SPL_OFFSET = 94;

const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start');
const screen = document.getElementById('screen');
const dbValue = document.getElementById('db-value');
const verdictFill = document.getElementById('verdict');
const verdictStroke = document.getElementById('verdict-stroke');
const meterBars = document.getElementById('meter-bars');

const VERDICTS = {
  'not-too-loud': 'not\ntoo loud',
  'too-loud': 'TOO\nLOUD',
  'waaaay': 'WAAAAY\nTOO\nLOUD',
};

for (let i = 0; i < TOTAL_BARS; i++) {
  const bar = document.createElement('div');
  bar.className = 'bar';
  meterBars.appendChild(bar);
}

let smoothedRms = 0;
let currentState = null;

async function start() {
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
  } catch (err) {
    alert('mic access is required. tap the button again and allow microphone access.');
    return;
  }

  startScreen.hidden = true;
  screen.hidden = false;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  if (ctx.state === 'suspended') await ctx.resume();

  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  const buf = new Float32Array(analyser.fftSize);

  function tick() {
    analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    const rms = Math.sqrt(sum / buf.length);
    smoothedRms = SMOOTHING * smoothedRms + (1 - SMOOTHING) * rms;

    const dbfs = 20 * Math.log10(smoothedRms + 1e-10);
    const db = Math.max(0, Math.min(120, dbfs + SPL_OFFSET));

    render(db);
    requestAnimationFrame(tick);
  }
  tick();
}

function render(db) {
  dbValue.textContent = Math.round(db);

  let state;
  if (db < THRESHOLD_LOUD) state = 'not-too-loud';
  else if (db < THRESHOLD_WAAAY) state = 'too-loud';
  else state = 'waaaay';

  if (state !== currentState) {
    currentState = state;
    screen.dataset.state = state;
    verdictFill.textContent = VERDICTS[state];
    verdictStroke.textContent = VERDICTS[state];
  }

  const ratio = (db - DB_MIN) / (DB_MAX - DB_MIN);
  const filled = Math.max(0, Math.min(TOTAL_BARS, Math.round(ratio * TOTAL_BARS)));
  const bars = meterBars.children;
  for (let i = 0; i < bars.length; i++) {
    const fromBottom = bars.length - 1 - i;
    bars[i].classList.toggle('filled', fromBottom < filled);
  }
}

startBtn.addEventListener('click', start);
