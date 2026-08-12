import type { CSSProperties, ChangeEvent, KeyboardEvent } from "react";

import { Flame } from "@/components/dokkaebi/Flame";
import { color, GUTTER, radius, space, text } from "@/lib/design";
import { glassButton, glassInput, innerGlow, statusDot, statusTag } from "@/lib/glass";

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

const STEP_PADDING = `${space[6]} ${GUTTER}px ${space[6]}`;

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

/**
 * 장면 1–5, the first meeting (디자인.md §14 "연결 전" → "깨어 있음").
 *
 * The whole flow is one long 연결 전 state: the ember is at almost no brightness
 * and the surface stays blue-grey until the fifth tap, at which point the warm
 * light arrives. Nothing else on the screen is allowed to glow before it does
 * (MUST 02, MUST 03).
 */
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
  // MUST 03 — the crack only warms as the living thing gets closer to waking.
  const crackStroke = isAwake ? color.flameAmber : isConverging ? color.flameDeep : color.flameEmber;
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
        color: color.textPrimary,
      }}
    >
      {step === "discover" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: STEP_PADDING, minHeight: 0 }}>
          <div style={{ flex: "none", paddingBottom: space[5] }} aria-live="polite">
            {tapCount === 0 ? (
              <>
                <p style={text.statusHeadline}>
                  젖은 흙 아래
                  <br />
                  작은 기척이 있어요.
                </p>
                <p style={{ ...text.meta, marginTop: space[3] }}>다섯 번 두드려 깨워보세요</p>
              </>
            ) : (
              <p key={tapCount} style={{ ...text.statusHeadline, animation: "fadeUp .5s ease both" }}>
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
              minHeight: 0,
              borderRadius: radius.xl,
              overflow: "hidden",
              // The soil is the night's ground, not a warm surface (MUST 03).
              background: `radial-gradient(120% 80% at 50% 70%, ${color.night800}, ${color.night950} 70%)`,
              border: `1px solid ${color.glassBorderSoft}`,
              boxShadow: "var(--shadow-inset), var(--shadow-card)",
              cursor: "pointer",
              outlineOffset: 4,
            }}
          >
            {/* Wet-earth grain, plus the night's own blue ambience pooling at the
                bottom (§6.2) — without it the panel is a flat black rectangle and
                fails §17's "카드가 단순 회색 박스가 아니라" check. */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "repeating-linear-gradient(115deg,rgba(255,255,255,.025) 0 2px,transparent 2px 7px)",
                opacity: 0.7,
              }}
            />
            <div aria-hidden style={innerGlow("rain", { strength: 0.16, corner: "bottom" })} />

            {/* The ember itself: the only warm light in the scene, and invisible
                until the first tap. */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "62%",
                transform: "translate(-50%, -50%)",
                opacity: revealed,
                transition: `opacity ${240}ms var(--ease-soft)`,
              }}
            >
              <Flame size={30} intensity={0.2 + revealed * 0.6} motion={revealed > 0 ? "breathe" : "none"} />
            </div>

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
                filter: isAwake ? "drop-shadow(0 0 6px rgba(233, 155, 69, 0.5))" : "none",
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
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(180deg, ${color.night850}, ${color.night950})`,
                opacity: soilOpacity,
                pointerEvents: "none",
              }}
            />

            <span
              style={{
                position: "absolute",
                left: "50%",
                bottom: space[5],
                transform: "translateX(-50%)",
                opacity: hintOpacity,
                transition: `opacity ${300}ms var(--ease-soft)`,
                ...statusTag("rain"),
              }}
            >
              <span aria-hidden style={statusDot("rain")} />
              두드리기 {tapCount} / 5
            </span>
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
            padding: STEP_PADDING,
            minHeight: 0,
          }}
        >
          <div style={{ flex: 1, display: "grid", placeItems: "center", minHeight: 0 }}>
            <Flame size={76} intensity={0.66} motion="breathe" />
          </div>
          <p style={{ ...text.statusHeadline, animation: "fadeUp .8s ease both" }}>
            비를 피해
            <br />
            작은 불씨가 찾아왔어요.
          </p>
          <p style={{ ...text.meta, marginTop: space[3], marginBottom: space[6] }}>
            비가 내리는 밤 · 처음 만나는 밤
          </p>
          <button type="button" onClick={wake} style={{ ...glassButton("primary"), width: "100%" }}>
            불씨 깨우기
          </button>
        </div>
      )}

      {step === "name" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: STEP_PADDING,
            minHeight: 0,
          }}
        >
          <div style={{ flex: 1, display: "grid", placeItems: "center", minHeight: 0 }}>
            <Flame size={64} intensity={0.58} motion="breathe" />
          </div>
          <label htmlFor="first-name-input" style={{ ...text.statusHeadline, marginBottom: space[5] }}>
            이 불씨를 어떻게 부를까요?
          </label>
          <input
            id="first-name-input"
            value={nameDraft}
            onChange={onNameInput}
            placeholder="이름"
            autoComplete="off"
            style={{ ...glassInput(), width: "100%", boxSizing: "border-box", marginBottom: space[3] }}
          />
          <button type="button" onClick={saveName} style={{ ...glassButton("primary"), width: "100%" }}>
            저장
          </button>
        </div>
      )}
    </div>
  );
}
