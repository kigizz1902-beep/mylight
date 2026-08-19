"use client";

import * as React from "react";

/**
 * Rain on the glass, not over the room. The rect below is the inside of the window
 * in the 2800×2160 frame; it is a percentage of the *photograph*, so it holds
 * wherever the pane's crop lands.
 */
export const RAIN_WINDOW = { left: 78.35, top: 0, width: 18.9, height: 39.2 };

const CONFIG = {
  streakCount: 130,
  beadCount: 26,
  wind: 34,
  minSpeed: 340,
  maxSpeed: 700,
  minLength: 14,
  maxLength: 48,
  minOpacity: 0.12,
  maxOpacity: 0.4,
};

interface Streak {
  x: number;
  y: number;
  depth: number;
  speed: number;
  length: number;
  opacity: number;
  lineWidth: number;
}

interface Bead {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  trail: number;
  wobble: number;
  phase: number;
}

const random = (min: number, max: number) => Math.random() * (max - min) + min;

interface RainWindowProps {
  /** 0 hides the glass entirely; the canvas keeps its state so rain resumes mid-fall. */
  opacity: number;
}

export function RainWindow({ opacity }: RainWindowProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  // Read inside the frame loop so toggling the weather never restarts the effect
  // — a restart would reseed every drop and the rain would visibly jump.
  const activeRef = React.useRef(opacity > 0);
  activeRef.current = opacity > 0;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let width = 0;
    let height = 0;
    let previousTime = 0;
    let animationId = 0;
    let streaks: Streak[] = [];
    let beads: Bead[] = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const makeStreak = (initial: boolean): Streak => {
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
    };

    const makeBead = (initial: boolean): Bead => ({
      x: random(4, Math.max(5, width - 4)),
      y: initial ? random(0, height) : random(-height * 0.2, -4),
      radius: random(0.7, 1.8),
      speed: random(7, 20),
      opacity: random(0.12, 0.3),
      trail: random(8, 28),
      wobble: random(0.7, 1.8),
      phase: random(0, Math.PI * 2),
    });

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      streaks = Array.from({ length: CONFIG.streakCount }, () => makeStreak(true));
      beads = Array.from({ length: CONFIG.beadCount }, () => makeBead(true));
    };

    const drawStreak = (drop: Streak, delta: number) => {
      drop.y += drop.speed * delta;
      drop.x += CONFIG.wind * drop.depth * delta;
      if (drop.y - drop.length > height || drop.x > width + 12) Object.assign(drop, makeStreak(false));

      const endX = drop.x - CONFIG.wind * 0.035 * drop.depth;
      const gradient = context.createLinearGradient(drop.x, drop.y - drop.length, endX, drop.y);
      gradient.addColorStop(0, "rgba(190, 220, 245, 0)");
      gradient.addColorStop(0.5, `rgba(190, 220, 245, ${drop.opacity})`);
      gradient.addColorStop(1, `rgba(225, 238, 250, ${drop.opacity * 0.45})`);

      context.beginPath();
      context.moveTo(drop.x, drop.y - drop.length);
      context.lineTo(endX, drop.y);
      context.strokeStyle = gradient;
      context.lineWidth = drop.lineWidth;
      context.lineCap = "round";
      context.stroke();
    };

    const drawBead = (bead: Bead, delta: number, time: number) => {
      bead.y += bead.speed * delta;
      const wobbleX = Math.sin(time * 0.0014 + bead.phase) * bead.wobble;
      if (bead.y - bead.trail > height) Object.assign(bead, makeBead(false));

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
    };

    const render = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000 || 0, 0.033);
      previousTime = time;

      // Dry nights still cost a frame callback, but not a redraw — and the drops
      // keep their positions, so the weather can come back without a seam.
      if (activeRef.current) {
        context.clearRect(0, 0, width, height);
        for (const drop of streaks) drawStreak(drop, delta);
        for (const bead of beads) drawBead(bead, delta, time);
      }

      animationId = requestAnimationFrame(render);
    };

    const start = () => {
      cancelAnimationFrame(animationId);
      previousTime = performance.now();
      if (reduceMotion.matches) {
        context.clearRect(0, 0, width, height);
        for (const bead of beads) drawBead(bead, 0, previousTime);
        return;
      }
      animationId = requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(() => {
      resize();
      start();
    });
    observer.observe(canvas);
    reduceMotion.addEventListener("change", start);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      reduceMotion.removeEventListener("change", start);
    };
  }, []);

  // Feathered top and bottom so the streaks are not sliced off flat against the
  // window frame.
  const mask = "linear-gradient(to bottom, rgb(0 0 0 / 88%) 0%, #000 8%, #000 94%, rgb(0 0 0 / 72%) 100%)";

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: `${RAIN_WINDOW.left}%`,
        top: `${RAIN_WINDOW.top}%`,
        width: `${RAIN_WINDOW.width}%`,
        height: `${RAIN_WINDOW.height}%`,
        overflow: "hidden",
        pointerEvents: "none",
        WebkitMaskImage: mask,
        maskImage: mask,
        opacity,
        transition: "opacity 700ms ease",
      }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "blur(0.25px)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 30% 18%, rgb(170 205 235 / 6%), transparent 34%)," +
            "linear-gradient(110deg, transparent 35%, rgb(190 220 245 / 4%) 52%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
