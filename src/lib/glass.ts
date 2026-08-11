import type { CSSProperties } from "react";

/**
 * Shared glassmorphism tokens for the Dokkaebi app screens.
 * Kept intentionally warm/near-black — the worksheet's tone constraint
 * ("화면이 방보다 밝아지면 안 된다") means glass panels stay translucent dark,
 * not the usual light-glass look. Amber stays the only accent hue.
 */

export const GLASS_HAIRLINE = "1px solid rgba(255,222,176,0.14)";
export const GLASS_HAIRLINE_SOFT = "1px solid rgba(255,222,176,0.08)";
export const GLASS_ACCENT_HAIRLINE = "1px solid rgba(240,184,120,0.35)";

const GLASS_BLUR = "blur(18px) saturate(150%)";
const GLASS_BLUR_STRONG = "blur(28px) saturate(160%)";

interface GlassPanelOptions {
  radius?: number;
  padding?: CSSProperties["padding"];
  elevated?: boolean;
}

export function glassPanel({ radius = 16, padding, elevated = false }: GlassPanelOptions = {}): CSSProperties {
  return {
    // Only emit `padding` when given — an explicit `undefined` would clobber a padding
    // set alongside the spread at the call site.
    ...(padding === undefined ? null : { padding }),
    borderRadius: radius,
    background: elevated
      ? "linear-gradient(135deg, rgba(255,241,222,0.10), rgba(255,241,222,0.03) 45%, rgba(255,241,222,0.02))"
      : "linear-gradient(135deg, rgba(255,241,222,0.06), rgba(255,241,222,0.02) 45%, rgba(255,241,222,0.015))",
    border: GLASS_HAIRLINE,
    boxShadow: elevated
      ? "inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 40px -16px rgba(0,0,0,0.65)"
      : "inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 26px -14px rgba(0,0,0,0.55)",
    backdropFilter: elevated ? GLASS_BLUR_STRONG : GLASS_BLUR,
    WebkitBackdropFilter: elevated ? GLASS_BLUR_STRONG : GLASS_BLUR,
  };
}

export function glassPill(active = false): CSSProperties {
  return {
    borderRadius: 999,
    border: active ? GLASS_ACCENT_HAIRLINE : GLASS_HAIRLINE_SOFT,
    background: active
      ? "linear-gradient(135deg, rgba(240,184,120,0.28), rgba(240,184,120,0.12))"
      : "linear-gradient(135deg, rgba(255,241,222,0.06), rgba(255,241,222,0.02))",
    color: active ? "#f3dcb3" : "#a89880",
    backdropFilter: GLASS_BLUR,
    WebkitBackdropFilter: GLASS_BLUR,
  };
}

export function glassInput(): CSSProperties {
  return {
    borderRadius: 12,
    border: GLASS_HAIRLINE_SOFT,
    background: "linear-gradient(135deg, rgba(255,241,222,0.05), rgba(255,241,222,0.015))",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.35)",
    backdropFilter: GLASS_BLUR,
    WebkitBackdropFilter: GLASS_BLUR,
    color: "#e8dcc8",
    // No `outline: none` — the focus ring is styled in globals.css instead, since an
    // inline outline would override it and leave keyboard users with no focus cue.
  };
}

export function glassButton(variant: "primary" | "ghost" = "ghost"): CSSProperties {
  if (variant === "primary") {
    return {
      borderRadius: 14,
      border: GLASS_ACCENT_HAIRLINE,
      background: "linear-gradient(180deg, rgba(240,184,120,0.30), rgba(200,137,74,0.14))",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 24px -10px rgba(200,137,74,0.35)",
      backdropFilter: GLASS_BLUR,
      WebkitBackdropFilter: GLASS_BLUR,
      color: "#fbe8c8",
      cursor: "pointer",
    };
  }
  return {
    borderRadius: 14,
    border: GLASS_HAIRLINE_SOFT,
    background: "linear-gradient(135deg, rgba(255,241,222,0.06), rgba(255,241,222,0.02))",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
    backdropFilter: GLASS_BLUR,
    WebkitBackdropFilter: GLASS_BLUR,
    color: "#d5bd9a",
    cursor: "pointer",
  };
}

export function glassScrim(): CSSProperties {
  return {
    background: "rgba(6,5,4,0.72)",
    backdropFilter: GLASS_BLUR_STRONG,
    WebkitBackdropFilter: GLASS_BLUR_STRONG,
  };
}

export function glassChrome(): CSSProperties {
  return {
    background: "linear-gradient(180deg, rgba(20,17,14,0.65), rgba(10,8,7,0.75))",
    backdropFilter: GLASS_BLUR,
    WebkitBackdropFilter: GLASS_BLUR,
    borderTop: GLASS_HAIRLINE_SOFT,
  };
}
