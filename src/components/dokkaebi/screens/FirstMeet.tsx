import type { CSSProperties, ChangeEvent, KeyboardEvent } from "react";

import { glassButton, glassInput, glassPill } from "@/lib/glass";

// Per-tap whispers, matching the click sequence from the rainy-night prototype
// (온보딩/rainy-night-landing.tsx): 나를 깨워줘 → 너는 누구야 → ... → 찾았다.
const TAP_MESSAGES = ["나를 깨워줘.", "너는 누구야?", "비를 피해 왔어.", "조금만 더 가까이.", "찾았다."];

/**
 * Cracks radiating from the ember's anchor point (50%, 62%), one per tap.
 * Each is split into three parts so it fractures instead of reading as a drawn ray:
 * a short thick `root` at the ember, an irregular `main` that wanders outward, and
 * thin `branches` that fork off it. They're drawn in that order (see CRACK_TIMING),
 * so the split propagates away from the ember rather than appearing all at once.
 */
const CRACKS = [
  {
    root: "M150,150 L147,136 L152,124",
    main: "M152,124 L145,108 L149,93 L140,76 L143,58",
    branches: ["M149,93 L163,82 L167,67", "M145,108 L132,100 L125,86"],
  },
  {
    root: "M150,150 L164,153 L177,147",
    main: "M177,147 L192,152 L208,144 L224,150 L241,141",
    branches: ["M192,152 L201,167 L212,179", "M208,144 L216,130 L213,116"],
  },
  {
    root: "M150,150 L136,158 L123,155",
    main: "M123,155 L108,164 L92,158 L76,167 L59,163",
    branches: ["M108,164 L99,179 L87,190", "M123,155 L115,141 L103,133"],
  },
  {
    root: "M150,150 L156,164 L151,178",
    main: "M151,178 L159,193 L153,209 L162,225 L157,243",
    branches: ["M159,193 L174,201 L185,213", "M151,178 L136,184 L126,197"],
  },
];

/** Per-part draw delay and duration (ms) — root splits first, branches trail last. */
const CRACK_TIMING = {
  root: { delay: 0, duration: 260 },
  main: { delay: 140, duration: 460 },
  branch: { delay: 400, duration: 380 },
};

/** Expo-out: the split snaps open, then eases to a stop — how a crack actually travels. */
const CRACK_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

interface FirstMeetProps {
  step: "discover" | "wake" | "name";
  revealed: number;
  soilOpacity: number;
  hintOpacity: number;
  nameDraft: string;
  onTap: () => void;
  wake: () => void;
  onNameInput: (e: ChangeEvent<HTMLInputElement>) => void;
  saveName: () => void;
}

export function FirstMeet({
  step,
  revealed,
  soilOpacity,
  hintOpacity,
  nameDraft,
  onTap,
  wake,
  onNameInput,
  saveName,
}: FirstMeetProps) {
  const tapCount = Math.round(revealed * 5);
  const isAwake = tapCount >= 5;
  const isConverging = tapCount >= 3;
  const revealedCracks = Math.min(tapCount, CRACKS.length);
  const crackStroke = isAwake ? "#e0a25c" : isConverging ? "#9a6a37" : "#5b3a22";
  const crackOpacity = isAwake ? 0.95 : isConverging ? 0.6 : 0.42;

  const handleTapKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.repeat) return;
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      onTap();
    }
  };
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        background: "#0c0a09",
        color: "#e6dccd",
        fontFamily: "'Noto Sans KR',system-ui,sans-serif",
      }}
    >
      {step === "discover" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 26px 26px" }}>
          <div style={{ padding: "26px 0 14px" }} aria-live="polite">
            {tapCount === 0 ? (
              <>
                <p style={{ margin: 0, fontFamily: "'Gowun Batang',serif", fontSize: 20, lineHeight: 1.6, color: "#cfc0ac" }}>
                  젖은 흙 아래
                  <br />
                  작은 기척이 있어요.
                </p>
                <p style={{ margin: "12px 0 0", fontSize: 12.5, color: "#6b6053" }}>다섯 번 두드려 깨워보세요</p>
              </>
            ) : (
              <p
                key={tapCount}
                style={{
                  margin: 0,
                  fontFamily: "'Gowun Batang',serif",
                  fontSize: 20,
                  lineHeight: 1.6,
                  color: "#cfc0ac",
                  animation: "fadeUp .5s ease both",
                }}
              >
                {TAP_MESSAGES[tapCount - 1]}
              </p>
            )}
          </div>
          <div
            role="button"
            tabIndex={0}
            aria-label={isAwake ? "깨어난 불씨" : `젖은 흙, 눌러서 불씨 깨우기. ${tapCount}단계`}
            onClick={onTap}
            onKeyDown={handleTapKeyDown}
            style={{
              position: "relative",
              flex: 1,
              borderRadius: 26,
              overflow: "hidden",
              background: "radial-gradient(120% 80% at 50% 70%,#1b1512,#0e0b0a 70%)",
              border: "1px solid rgba(255,222,176,0.10)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 18px 40px -20px rgba(0,0,0,0.7)",
              cursor: "pointer",
              outlineOffset: 4,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "repeating-linear-gradient(115deg,rgba(255,255,255,.02) 0 2px,transparent 2px 7px)",
                opacity: 0.6,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "62%",
                width: 120,
                height: 120,
                margin: "-60px 0 0 -60px",
                borderRadius: "50%",
                background: "radial-gradient(circle,rgba(232,168,96,.55),rgba(232,168,96,0) 65%)",
                opacity: revealed,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "62%",
                width: 14,
                height: 18,
                margin: "-9px 0 0 -7px",
                borderRadius: "50% 50% 45% 45%",
                background: "#f0b878",
                boxShadow: "0 0 22px rgba(240,184,120,.8)",
                opacity: revealed,
                animation: "emberBreath 4.5s ease-in-out infinite",
              }}
            />
            <svg
              viewBox="0 0 300 300"
              aria-hidden
              style={{
                position: "absolute",
                left: "50%",
                top: "62%",
                width: 260,
                height: 260,
                margin: "-130px 0 0 -130px",
                filter: isAwake ? "drop-shadow(0 0 6px rgba(224,162,92,0.5))" : "none",
              }}
            >
              {CRACKS.map((crack, index) => {
                const shown = index < revealedCracks;
                // Delays only apply while the crack is opening; on reset everything
                // fades back together instead of unwinding in sequence.
                const draw = (
                  { delay, duration }: { delay: number; duration: number },
                  opacity: number,
                ): CSSProperties => ({
                  opacity: shown ? opacity : 0,
                  strokeDasharray: 1,
                  strokeDashoffset: shown ? 0 : 1,
                  transition: [
                    `stroke-dashoffset ${duration}ms ${CRACK_EASING} ${shown ? delay : 0}ms`,
                    `opacity ${duration}ms ease-out ${shown ? delay : 0}ms`,
                    "stroke 400ms ease-out",
                  ].join(", "),
                });

                return (
                  <g key={index} fill="none" stroke={crackStroke} strokeLinecap="round" strokeLinejoin="round">
                    <path
                      d={crack.root}
                      pathLength={1}
                      strokeWidth={isAwake ? 2.6 : 2}
                      style={draw(CRACK_TIMING.root, crackOpacity)}
                    />
                    <path
                      d={crack.main}
                      pathLength={1}
                      strokeWidth={isAwake ? 1.5 : 1.2}
                      style={draw(CRACK_TIMING.main, crackOpacity)}
                    />
                    {crack.branches.map((d) => (
                      <path
                        key={d}
                        d={d}
                        pathLength={1}
                        strokeWidth={isAwake ? 0.95 : 0.8}
                        style={draw(CRACK_TIMING.branch, crackOpacity * 0.72)}
                      />
                    ))}
                  </g>
                );
              })}
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg,#151110,#0d0a09)",
                opacity: soilOpacity,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: 18,
                transform: "translateX(-50%)",
                padding: "6px 14px",
                whiteSpace: "nowrap",
                fontSize: 11.5,
                letterSpacing: "0.14em",
                opacity: hintOpacity,
                ...glassPill(),
              }}
            >
              TAP · {tapCount} / 5
            </div>
          </div>
        </div>
      )}

      {step === "wake" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: 26,
            background: "radial-gradient(80% 50% at 50% 45%,rgba(232,168,96,.09),transparent 70%)",
          }}
        >
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                position: "relative",
                width: 18,
                height: 24,
                borderRadius: "50% 50% 45% 45%",
                background: "#f2be82",
                boxShadow: "0 0 46px rgba(240,184,120,.75)",
                animation: "emberBreath 4.5s ease-in-out infinite",
              }}
            />
          </div>
          <p
            style={{
              margin: "0 0 6px",
              fontFamily: "'Gowun Batang',serif",
              fontSize: 21,
              lineHeight: 1.55,
              color: "#ddcdb6",
              animation: "fadeUp .8s ease both",
            }}
          >
            비를 피해
            <br />
            작은 불씨가 찾아왔어요.
          </p>
          <p style={{ margin: "0 0 22px", fontSize: 12.5, color: "#6b6053" }}>비가 내리는 밤 · 처음 만나는 밤</p>
          <button
            onClick={wake}
            style={{
              width: "100%",
              minHeight: 44,
              padding: 17,
              fontFamily: "'Noto Sans KR',sans-serif",
              fontSize: 15,
              letterSpacing: "0.02em",
              ...glassButton("primary"),
            }}
          >
            불씨 깨우기
          </button>
        </div>
      )}

      {step === "name" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 26 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                width: 16,
                height: 22,
                borderRadius: "50% 50% 45% 45%",
                background: "#f2be82",
                boxShadow: "0 0 40px rgba(240,184,120,.6)",
                animation: "emberBreath 4.5s ease-in-out infinite",
              }}
            />
          </div>
          <p style={{ margin: "0 0 20px", fontFamily: "'Gowun Batang',serif", fontSize: 21, color: "#ddcdb6" }}>
            이 불씨를 어떻게 부를까요?
          </p>
          <input
            value={nameDraft}
            onChange={onNameInput}
            placeholder="이름"
            style={{
              width: "100%",
              boxSizing: "border-box",
              minHeight: 44,
              padding: "16px 18px",
              fontSize: 16,
              fontFamily: "'Noto Sans KR',sans-serif",
              marginBottom: 12,
              ...glassInput(),
            }}
          />
          <button
            onClick={saveName}
            style={{
              width: "100%",
              minHeight: 44,
              padding: 17,
              fontSize: 15,
              fontFamily: "'Noto Sans KR',sans-serif",
              ...glassButton("primary"),
            }}
          >
            저장
          </button>
        </div>
      )}
    </div>
  );
}
