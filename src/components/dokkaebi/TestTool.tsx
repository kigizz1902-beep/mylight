import type { CSSProperties } from "react";

import { glassButton } from "@/lib/glass";

interface TestToolProps {
  rainBg: string;
  rainFg: string;
  rainBorder: string;
  nextNight: () => void;
  jumpSeven: () => void;
  jumpThirty: () => void;
  toggleRain: () => void;
  reset: () => void;
}

const baseButton: CSSProperties = {
  padding: "9px 14px",
  fontSize: 12.5,
  fontFamily: "'Noto Sans KR',sans-serif",
  ...glassButton("ghost"),
};

export function TestTool({
  rainBg,
  rainFg,
  rainBorder,
  nextNight,
  jumpSeven,
  jumpThirty,
  toggleRain,
  reset,
}: TestToolProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        borderRadius: 14,
        border: "1px dashed #2b2319",
        background: "#0c0a09",
        fontFamily: "'Noto Sans KR',system-ui,sans-serif",
      }}
    >
      <button onClick={nextNight} style={baseButton}>
        다음 밤으로
      </button>
      <button onClick={jumpSeven} style={baseButton}>
        7번째 밤
      </button>
      <button
        onClick={toggleRain}
        style={{ ...baseButton, border: `1px solid ${rainBorder}`, background: rainBg, color: rainFg }}
      >
        비오는날
      </button>
      <button onClick={jumpThirty} style={baseButton}>
        30번째 밤
      </button>
      <button onClick={reset} style={{ ...baseButton, border: "none", color: "#7d7365" }}>
        초기화
      </button>
    </div>
  );
}
