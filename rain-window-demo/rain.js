const CONFIG = {
  // 아래 네 값을 바꾸면 비의 인상이 달라진다.
  streakCount: 74,
  beadCount: 16,
  wind: 24,
  minSpeed: 250,
  maxSpeed: 510,
  minLength: 10,
  maxLength: 34,
  minOpacity: 0.08,
  maxOpacity: 0.28,
};

const scene = document.querySelector("#scene");
const canvas = document.querySelector("#rain-canvas");
const lampButton = document.querySelector("#lamp-button");
const rainButton = document.querySelector("#rain-button");
const context = canvas.getContext("2d", { alpha: true });
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let width = 0;
let height = 0;
let previousTime = 0;
let animationId = 0;
let rainPaused = false;
let streaks = [];
let beads = [];

const random = (min, max) => Math.random() * (max - min) + min;

function makeStreak(initial = false) {
  const depth = random(0.45, 1);
  return {
    x: random(-width * 0.08, width),
    y: initial ? random(-height * 0.15, height) : random(-height * 0.35, -12),
    depth,
    speed: random(CONFIG.minSpeed, CONFIG.maxSpeed) * depth,
    length: random(CONFIG.minLength, CONFIG.maxLength) * depth,
    opacity: random(CONFIG.minOpacity, CONFIG.maxOpacity) * depth,
    lineWidth: random(0.45, 1.15) * depth,
  };
}

function makeBead(initial = false) {
  return {
    x: random(4, Math.max(5, width - 4)),
    y: initial ? random(0, height) : random(-height * 0.2, -4),
    radius: random(0.7, 1.8),
    speed: random(7, 20),
    opacity: random(0.12, 0.3),
    trail: random(8, 28),
    wobble: random(0.7, 1.8),
    phase: random(0, Math.PI * 2),
  };
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  width = Math.max(1, bounds.width);
  height = Math.max(1, bounds.height);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  streaks = Array.from({ length: CONFIG.streakCount }, () => makeStreak(true));
  beads = Array.from({ length: CONFIG.beadCount }, () => makeBead(true));
}

function drawStreak(drop, delta) {
  drop.y += drop.speed * delta;
  drop.x += CONFIG.wind * drop.depth * delta;

  if (drop.y - drop.length > height || drop.x > width + 12) {
    Object.assign(drop, makeStreak(false));
  }

  const endX = drop.x - CONFIG.wind * 0.035 * drop.depth;
  const gradient = context.createLinearGradient(drop.x, drop.y - drop.length, endX, drop.y);
  gradient.addColorStop(0, `rgba(190, 220, 245, 0)`);
  gradient.addColorStop(0.5, `rgba(190, 220, 245, ${drop.opacity})`);
  gradient.addColorStop(1, `rgba(225, 238, 250, ${drop.opacity * 0.45})`);

  context.beginPath();
  context.moveTo(drop.x, drop.y - drop.length);
  context.lineTo(endX, drop.y);
  context.strokeStyle = gradient;
  context.lineWidth = drop.lineWidth;
  context.lineCap = "round";
  context.stroke();
}

function drawBead(bead, delta, time) {
  bead.y += bead.speed * delta;
  const wobbleX = Math.sin(time * 0.0014 + bead.phase) * bead.wobble;

  if (bead.y - bead.trail > height) {
    Object.assign(bead, makeBead(false));
  }

  const gradient = context.createLinearGradient(bead.x, bead.y - bead.trail, bead.x, bead.y);
  gradient.addColorStop(0, "rgba(175, 210, 238, 0)");
  gradient.addColorStop(1, `rgba(205, 230, 248, ${bead.opacity * 0.55})`);

  context.beginPath();
  context.moveTo(bead.x, bead.y - bead.trail);
  context.quadraticCurveTo(bead.x + wobbleX, bead.y - bead.trail * 0.4, bead.x, bead.y);
  context.strokeStyle = gradient;
  context.lineWidth = bead.radius * 0.7;
  context.stroke();

  context.beginPath();
  context.arc(bead.x, bead.y, bead.radius, 0, Math.PI * 2);
  context.fillStyle = `rgba(215, 235, 250, ${bead.opacity})`;
  context.fill();
}

function render(time) {
  const delta = Math.min((time - previousTime) / 1000 || 0, 0.033);
  previousTime = time;
  context.clearRect(0, 0, width, height);

  if (!rainPaused) {
    for (const drop of streaks) drawStreak(drop, delta);
    for (const bead of beads) drawBead(bead, delta, time);
  }

  animationId = requestAnimationFrame(render);
}

function startAnimation() {
  cancelAnimationFrame(animationId);
  previousTime = performance.now();

  if (reduceMotion.matches) {
    context.clearRect(0, 0, width, height);
    for (const bead of beads) drawBead(bead, 0, previousTime);
    return;
  }

  animationId = requestAnimationFrame(render);
}

lampButton.addEventListener("click", () => {
  const isOff = scene.classList.toggle("is-lamp-off");
  lampButton.textContent = isOff ? "조명 켜기" : "조명 끄기";
});

rainButton.addEventListener("click", () => {
  rainPaused = !rainPaused;
  scene.classList.toggle("is-rain-paused", rainPaused);
  rainButton.textContent = rainPaused ? "비 내리기" : "비 멈추기";
});

const resizeObserver = new ResizeObserver(() => {
  resizeCanvas();
  startAnimation();
});

resizeObserver.observe(canvas);
reduceMotion.addEventListener("change", startAnimation);
