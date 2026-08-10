"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface RainBackgroundProps {
  intensity?: number;
  speed?: number;
  color?: string;
  angle?: number;
  dropSize?: {
    min: number;
    max: number;
  };
  lightningEnabled?: boolean;
  lightningFrequency?: number;
  thunderEnabled?: boolean;
  className?: string;
  reducedMotion?: boolean;
  children?: React.ReactNode;
}

interface Drop {
  leftPercent: number;
  heightPx: number;
  widthPx: number;
  durationS: number;
  delayS: number;
  opacity: number;
  mobileVisible: boolean;
}

/** Deterministic PRNG (mulberry32) — same seed always yields the same sequence, so
 *  server and client generate identical drop layouts and hydration never mismatches. */
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

const DESKTOP_DROP_CAP = 140;
const MOBILE_VISIBLE_RATIO = 0.45;
const SEED = 88172645;

function buildDrops(intensity: number, minSize: number, maxSize: number): Drop[] {
  const random = mulberry32(SEED);
  const count = Math.max(0, Math.round(DESKTOP_DROP_CAP * intensity));
  const mobileCount = Math.round(count * MOBILE_VISIBLE_RATIO);

  return Array.from({ length: count }, (_, index) => {
    const heightPx = minSize + random() * Math.max(0, maxSize - minSize);
    return {
      leftPercent: random() * 100,
      heightPx,
      widthPx: Math.max(1, heightPx / 60),
      durationS: 0.7 + random() * 0.9,
      delayS: random() * 6,
      opacity: 0.12 + random() * 0.28,
      mobileVisible: index < mobileCount,
    };
  });
}

/**
 * Full-screen rain + rare lightning layer. Renders `children` first, then an
 * absolutely-positioned, `pointer-events-none` rain layer on top, so every
 * click passes through to the content underneath.
 */
export function RainBackground({
  intensity = 0.6,
  speed = 1,
  color = "#8a97a8",
  angle = 8,
  dropSize = { min: 40, max: 110 },
  lightningEnabled = true,
  lightningFrequency = 1,
  thunderEnabled = false,
  className,
  reducedMotion = false,
  children,
}: RainBackgroundProps) {
  const osReducedMotion = React.useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [flash, setFlash] = React.useState(0);

  const effectiveReducedMotion = reducedMotion || osReducedMotion;

  const drops = React.useMemo(
    () => buildDrops(intensity, dropSize.min, dropSize.max),
    [intensity, dropSize.min, dropSize.max],
  );

  React.useEffect(() => {
    if (!lightningEnabled || effectiveReducedMotion || lightningFrequency <= 0) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let flashTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const minGapS = 8 / lightningFrequency;
    const maxGapS = 26 / lightningFrequency;

    const scheduleNext = () => {
      const gapMs = (minGapS + Math.random() * Math.max(0, maxGapS - minGapS)) * 1000;
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        setFlash(1);
        flashTimeoutId = setTimeout(() => {
          if (cancelled) return;
          setFlash(0);
          scheduleNext();
        }, 140 + Math.random() * 100);
      }, gapMs);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (flashTimeoutId) clearTimeout(flashTimeoutId);
    };
  }, [lightningEnabled, lightningFrequency, effectiveReducedMotion]);

  // Thunder audio is intentionally never implemented — silence is part of the scene's mood.
  void thunderEnabled;

  return (
    <div className={cn("relative h-full w-full", className)}>
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ transform: `rotate(${angle}deg) scale(1.15)` }}
      >
        {!effectiveReducedMotion &&
          drops.map((drop, index) => (
            <span
              key={index}
              className={cn(
                "absolute top-[-15%] rounded-full",
                !drop.mobileVisible && "hidden sm:block",
              )}
              style={{
                left: `${drop.leftPercent}%`,
                width: `${drop.widthPx}px`,
                height: `${drop.heightPx}px`,
                backgroundImage: `linear-gradient(to bottom, transparent, ${color})`,
                opacity: drop.opacity,
                animation: `rain-fall ${drop.durationS / speed}s linear ${drop.delayS}s infinite`,
              }}
            />
          ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-white transition-opacity duration-150"
        style={{ opacity: flash * 0.18 }}
      />
    </div>
  );
}
