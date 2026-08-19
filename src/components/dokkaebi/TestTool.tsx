import type { CSSProperties } from "react";

import { color, radius, space, text } from "@/lib/design";
import { glassButton } from "@/lib/glass";

interface TestToolProps {
  rainy: boolean;
  nextNight: () => void;
  jumpSeven: () => void;
  jumpThirty: () => void;
  toggleRain: () => void;
  reset: () => void;
}

/**
 * Time machine for jumping between nights. Rendered in production as well, since
 * the deployed link is how the piece gets demoed. Styled as the quietest thing on
 * the page — it is scaffolding, not part of the product, so it gets a dashed
 * border and no glow of any kind.
 */
const button: CSSProperties = {
  ...glassButton("ghost"),
  minHeight: 44,
  padding: `0 ${space[4]}`,
  borderRadius: radius.sm,
  fontSize: 12.5,
  fontWeight: 500,
};

export function TestTool({ rainy, nextNight, jumpSeven, jumpThirty, toggleRain, reset }: TestToolProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: space[2],
        padding: `${space[3]} ${space[4]}`,
        borderRadius: radius.sm,
        border: `1px dashed ${color.glassBorderSoft}`,
      }}
    >
      <span style={{ ...text.label, paddingRight: space[1] }}>DEV</span>
      <button type="button" onClick={nextNight} style={button}>
        다음 밤으로
      </button>
      <button type="button" onClick={jumpSeven} style={button}>
        7번째 밤
      </button>
      <button
        type="button"
        onClick={toggleRain}
        aria-pressed={rainy}
        style={{
          ...button,
          // Weather is the night's space, so the active state is cool, not warm.
          ...(rainy
            ? { borderColor: "rgba(72, 98, 117, 0.5)", color: color.textSecondary }
            : { color: color.textTertiary }),
        }}
      >
        비오는날
      </button>
      <button type="button" onClick={jumpThirty} style={button}>
        30번째 밤
      </button>
      <button type="button" onClick={reset} style={{ ...button, border: "none", color: color.textTertiary }}>
        초기화
      </button>
    </div>
  );
}
