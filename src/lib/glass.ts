import type { CSSProperties } from "react";

import { color, font, glowHue, radius, type GlowTone } from "@/lib/design";

/**
 * Surface recipes for the Aurora Glassmorphism + Glow Bento UI (디자인.md §7, §10).
 *
 * The important constraint is not "make it glassy" but the two rules that keep
 * the screen quiet: a card is a *dark* surface with light trapped inside it
 * (§7 intro), and only one card per screen carries the bright glow (MUST 02).
 * So the default panel here is deliberately low-contrast, and anything warmer
 * has to be asked for explicitly.
 */

const BLUR = "blur(22px) saturate(115%)";
const BLUR_STRONG = "blur(28px) saturate(120%)";

/**
 * §7.3 card roles. The difference between them is contrast, not decoration:
 * - `living` is the one bright card (MUST 02) — the 도깨비불 itself.
 * - `bento` is the ordinary black-glass card everything else uses.
 * - `quiet` is the System Card (§7.3E): the darkest surface, no glow.
 * - `nested` is a card inside a card (§7.2): background contrast only, no shadow.
 */
export type PanelTone = "living" | "bento" | "quiet" | "nested";

interface GlassPanelOptions {
  radius?: string;
  padding?: CSSProperties["padding"];
  tone?: PanelTone;
}

export function glassPanel({
  radius: r = radius.lg,
  padding,
  tone = "bento",
}: GlassPanelOptions = {}): CSSProperties {
  const base: CSSProperties = {
    // Only emit `padding` when given — an explicit `undefined` would clobber a
    // padding set alongside the spread at the call site.
    ...(padding === undefined ? null : { padding }),
    position: "relative",
    overflow: "hidden",
    borderRadius: r,
  };

  if (tone === "nested") {
    return {
      ...base,
      border: `1px solid ${color.glassBorderSoft}`,
      background: "var(--glass-soft)",
    };
  }

  if (tone === "quiet") {
    return {
      ...base,
      border: `1px solid ${color.glassBorderSoft}`,
      background: "var(--glass-medium)",
      boxShadow: "var(--shadow-card)",
      backdropFilter: BLUR,
      WebkitBackdropFilter: BLUR,
    };
  }

  if (tone === "living") {
    return {
      ...base,
      border: `1px solid ${color.glassBorder}`,
      background: `linear-gradient(145deg, rgba(255,255,255,0.06), transparent 38%), var(--glass-strong)`,
      boxShadow: "var(--shadow-inset), var(--shadow-card)",
      backdropFilter: BLUR_STRONG,
      WebkitBackdropFilter: BLUR_STRONG,
    };
  }

  return {
    ...base,
    border: `1px solid ${color.glassBorderSoft}`,
    background: `linear-gradient(145deg, rgba(255,255,255,0.045), transparent 38%), var(--glass-medium)`,
    boxShadow: "var(--shadow-inset), var(--shadow-card)",
    backdropFilter: BLUR,
    WebkitBackdropFilter: BLUR,
  };
}

/**
 * The coloured glow inside a card (§7.2: "컬러 글로우는 가상 요소로 카드 안쪽에
 * 가둔다"). Inline styles can't reach `::before`, so this styles a real
 * `aria-hidden` child instead — same effect, same containment via the parent's
 * `overflow: hidden`.
 *
 * Sized and faded so the visible glow stays well under 30% of the card (§7.2),
 * and anchored to one corner so it reads as light arriving from a direction
 * rather than a wash over the whole surface (MUST 04).
 */
export function innerGlow(
  tone: GlowTone,
  { strength = 0.18, corner = "top-left" }: { strength?: number; corner?: "top-left" | "top-right" | "bottom" } = {},
): CSSProperties {
  const anchor =
    corner === "top-right"
      ? { top: "-30%", right: "-20%" }
      : corner === "bottom"
        ? { bottom: "-40%", left: "18%" }
        : { top: "-32%", left: "-18%" };

  return {
    position: "absolute",
    width: "62%",
    aspectRatio: "1",
    ...anchor,
    borderRadius: "50%",
    background: `radial-gradient(circle, rgba(${glowHue[tone]}, ${strength}), transparent 66%)`,
    filter: "blur(26px)",
    pointerEvents: "none",
  };
}

/**
 * §10.4 status tag — "작고 조용한 캡슐". Height 26–30px, 11–12px text, and the
 * colour carried at 10–14% background / 16–20% border so it never competes with
 * the flame.
 */
export function statusTag(tone: GlowTone = "amber"): CSSProperties {
  const rgb = glowHue[tone];
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    minHeight: 28,
    padding: "0 10px",
    borderRadius: radius.pill,
    border: `1px solid rgba(${rgb}, 0.18)`,
    background: `rgba(${rgb}, 0.12)`,
    fontFamily: font.app,
    fontSize: 11.5,
    fontWeight: 550,
    letterSpacing: "-0.005em",
    whiteSpace: "nowrap",
    color: color.textSecondary,
  };
}

/** The small dot inside a status tag — §16.2 needs state carried by more than colour,
 *  so the tag always pairs this with a word. */
export function statusDot(tone: GlowTone = "amber"): CSSProperties {
  return {
    width: 6,
    height: 6,
    flex: "none",
    borderRadius: "50%",
    background: `rgb(${glowHue[tone]})`,
  };
}

/**
 * §10.1 Primary / §10.2 Secondary buttons.
 *
 * Primary is a dark amber *gradient*, not flat amber, and its outer glow stays
 * faint — a bright button would break MUST 02 whenever the flame is the subject.
 * Screens pass "ghost" while the flame is lit and "primary" when the button is
 * the only lit thing on screen.
 */
export function glassButton(variant: "primary" | "ghost" = "ghost"): CSSProperties {
  const shared: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    // §10.1 height 52px / §16.2 44px touch minimum.
    minHeight: 52,
    padding: "0 22px",
    borderRadius: radius.md,
    fontFamily: font.app,
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    cursor: "pointer",
  };

  if (variant === "primary") {
    return {
      ...shared,
      border: "1px solid rgba(255, 226, 174, 0.18)",
      color: "#fff5df",
      background: "linear-gradient(135deg, #b96d32, #8b4527)",
      boxShadow: "0 10px 28px rgba(169, 85, 36, 0.22), inset 0 1px 0 rgba(255,255,255,0.16)",
    };
  }

  return {
    ...shared,
    border: `1px solid ${color.glassBorder}`,
    color: color.textSecondary,
    background: "var(--glass-soft)",
    backdropFilter: BLUR,
    WebkitBackdropFilter: BLUR,
  };
}

/**
 * Segmented tab control inside a screen (밤 목록 / 변화 이력). Not the bottom
 * nav — §12 forbids wrapping the active tab there in a coloured capsule, but a
 * segmented control needs a visible selected surface to be usable at all.
 */
export function glassPill(active = false): CSSProperties {
  return {
    minHeight: 44,
    padding: "0 16px",
    borderRadius: radius.pill,
    border: `1px solid ${active ? "rgba(249, 220, 160, 0.22)" : color.glassBorderSoft}`,
    background: active ? "rgba(249, 220, 160, 0.10)" : "var(--glass-soft)",
    color: active ? color.flameCream : color.textTertiary,
    fontFamily: font.app,
    fontSize: 13,
    fontWeight: 550,
    cursor: "pointer",
  };
}

export function glassInput(): CSSProperties {
  return {
    // 44px floor: mobile text inputs must stay tappable (§16.2).
    minHeight: 48,
    padding: "0 16px",
    borderRadius: radius.sm,
    border: `1px solid ${color.glassBorder}`,
    background: "var(--glass-soft)",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.28)",
    fontFamily: font.app,
    // 16px avoids iOS auto-zoom on focus.
    fontSize: 16,
    color: color.textPrimary,
    // No `outline: none` — the focus ring is styled in globals.css, and an inline
    // outline here would override it and leave keyboard users with no focus cue.
  };
}

/** §16.2 / blur-means-dismissable: the scrim must isolate the dialog above it. */
export function glassScrim(): CSSProperties {
  return {
    background: "rgba(7, 8, 11, 0.74)",
    backdropFilter: BLUR_STRONG,
    WebkitBackdropFilter: BLUR_STRONG,
  };
}
