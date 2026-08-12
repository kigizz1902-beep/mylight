import type { CSSProperties } from "react";

/**
 * TypeScript handles for the design tokens registered in `src/app/globals.css`
 * (디자인.md §5) plus the type scale from §9.2.
 *
 * The screens are written with inline styles, so without this they would each
 * spell out `var(--text-tertiary)` by hand — and one typo silently falls back to
 * the browser default rather than failing. The CSS file stays the single source
 * of truth for the *values*; this file only names them.
 *
 * §0 rule 4: no screen invents its own colour, shadow or radius. If something
 * here is missing, the token belongs in globals.css first.
 */

export const color = {
  night950: "var(--night-950)",
  night900: "var(--night-900)",
  night850: "var(--night-850)",
  night800: "var(--night-800)",

  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textTertiary: "var(--text-tertiary)",

  flameCore: "var(--flame-core)",
  flameCream: "var(--flame-cream)",
  flameAmber: "var(--flame-amber)",
  flameDeep: "var(--flame-deep)",
  flameEmber: "var(--flame-ember)",

  auroraBlue: "var(--aurora-blue)",
  auroraIndigo: "var(--aurora-indigo)",
  auroraViolet: "var(--aurora-violet)",
  rainBlue: "var(--rain-blue)",

  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--error)",

  glassBorder: "var(--glass-border)",
  glassBorderSoft: "var(--glass-border-soft)",
} as const;

/**
 * Glow hues as raw RGB triples, so opacity can be varied per use (§7.2 keeps a
 * card's colour glow to a fraction of its surface, which needs the alpha to be
 * chosen at the call site rather than baked into a solid token).
 *
 * MUST 03 assigns each hue a meaning: warm is life, cool is space, lilac is
 * growth. Nothing else may be tinted.
 */
export const glowHue = {
  amber: "233, 155, 69",
  cream: "249, 220, 160",
  blue: "49, 90, 135",
  indigo: "52, 59, 120",
  lilac: "105, 85, 138",
  rain: "72, 98, 117",
  success: "116, 165, 143",
} as const;

export type GlowTone = keyof typeof glowHue;

export const radius = {
  xl: "var(--radius-xl)",
  lg: "var(--radius-lg)",
  md: "var(--radius-md)",
  sm: "var(--radius-sm)",
  pill: "var(--radius-pill)",
} as const;

export const space = {
  1: "var(--space-1)",
  2: "var(--space-2)",
  3: "var(--space-3)",
  4: "var(--space-4)",
  5: "var(--space-5)",
  6: "var(--space-6)",
  8: "var(--space-8)",
  10: "var(--space-10)",
} as const;

export const motion = {
  easeSoft: "var(--ease-soft)",
  easeBreathe: "var(--ease-breathe)",
  fast: "var(--duration-fast)",
  normal: "var(--duration-normal)",
  slow: "var(--duration-slow)",
} as const;

export const font = {
  app: "var(--font-app)",
} as const;

/**
 * §9.2 type scale. Every text node in the app should pick one of these rather
 * than setting an ad-hoc size, which is what kept the previous screens drifting
 * between 11.5px, 12.5px and 13.5px for the same kind of label.
 *
 * §9.3: one largest text per screen, and body copy stays left-aligned outside
 * the flame card.
 */
export const text = {
  /** 화면 제목 — one per screen. */
  screenTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.25,
    fontWeight: 650,
    letterSpacing: "-0.01em",
    color: color.textPrimary,
  },
  /** 핵심 상태 — the sentence that says how the 도깨비불 is, before any number. */
  statusHeadline: {
    margin: 0,
    fontSize: 24,
    lineHeight: 1.35,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: color.textPrimary,
  },
  /** 큰 숫자 — 32–40px; tabular so a changing value never reflows its row. */
  bigNumber: {
    margin: 0,
    fontSize: 32,
    lineHeight: 1.05,
    fontWeight: 620,
    letterSpacing: "-0.01em",
    color: color.textPrimary,
    fontVariantNumeric: "tabular-nums",
  },
  cardTitle: {
    margin: 0,
    fontSize: 17,
    lineHeight: 1.4,
    fontWeight: 600,
    color: color.textPrimary,
  },
  body: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.6,
    fontWeight: 400,
    color: color.textSecondary,
  },
  /** 작은 라벨 — the quiet line above a value. */
  label: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.4,
    fontWeight: 550,
    color: color.textTertiary,
  },
  /** 보조 수치 — never `--text-disabled`, which fails contrast (§16.2). */
  meta: {
    margin: 0,
    fontSize: 12.5,
    lineHeight: 1.4,
    fontWeight: 450,
    color: color.textTertiary,
    fontVariantNumeric: "tabular-nums",
  },
} satisfies Record<string, CSSProperties>;

/**
 * §4.2 — the app shell's horizontal gutter. 20px by default, 16px at 360px and
 * below. The phone frame in this prototype is fixed at 392px wide, so the
 * narrow case only applies to the real viewport.
 */
export const GUTTER = 20;

/** §4.1 — desktop app shell max width. */
export const SHELL_MAX_WIDTH = 520;
