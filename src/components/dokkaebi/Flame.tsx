import type { CSSProperties } from "react";

import type { Mood } from "@/lib/dokkaebi";

interface FlameProps {
  /** Width in px. §7.3A wants the flame at 35–45% of the Living Card's area. */
  size?: number;
  /** 0–1, per 디자인.md §14's 불꽃 밝기 column. */
  intensity: number;
  motion: Mood["motion"];
  /**
   * A one-off animation for the field — the bedtime acknowledgement's single dip.
   * Takes precedence over the `swell` motion's own field animation, which is safe
   * because a swell only happens on power-on and an acknowledgement only while
   * already lit.
   */
  animation?: string;
  style?: CSSProperties;
}

const MOTION_CLASS: Record<Mood["motion"], string> = {
  none: "",
  breathe: "flame--breathe",
  slowing: "flame--slowing",
  // The swell runs on the field so it doesn't fight the breath's transform.
  swell: "flame--breathe",
};

/**
 * The 도깨비불 (§8): a cream core inside an amber body inside a wide, blurred
 * halo. Not an icon — there is no outline, no 🔥, no bulb, and the silhouette is
 * asymmetric on both axes so it never reads as a circle or a teardrop (§8.1).
 *
 * All three light layers are drawn in CSS from the flame tokens; see the `.flame`
 * rules in globals.css. `intensity` is the state made visible — it drives the
 * body's opacity and the halo's strength together, which is what §14 means by
 * changing the light rather than only the text.
 */
export function Flame({ size = 82, intensity, motion, animation, style }: FlameProps) {
  return (
    <div
      aria-hidden
      className={`flame-field${motion === "swell" ? " flame-field--swell" : ""}`}
      style={
        {
          "--flame-size": `${size}px`,
          "--flame-intensity": intensity,
          ...(animation ? { animation } : null),
          ...style,
        } as CSSProperties
      }
    >
      <span className="flame-halo" />
      <span className={`flame ${MOTION_CLASS[motion]}`} />
    </div>
  );
}
