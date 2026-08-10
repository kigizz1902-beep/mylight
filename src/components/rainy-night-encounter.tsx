"use client";

import * as React from "react";

import { SpotlightCard } from "@/components/ui/spotlight-card";
import { RainBackground } from "@/components/ui/rain";
import { cn } from "@/lib/utils";

export type EncounterStage = 0 | 1 | 2 | 3 | 4 | 5;

export interface RainyNightEncounterProps {
  locationLabel?: string;
  weatherCondition?: "rain" | "clear" | "cloudy" | "unknown";
  initialStage?: EncounterStage;
  onStageChange?: (stage: EncounterStage) => void;
  onAwaken?: () => void | Promise<void>;
  onReset?: () => void;
  /** Shows the small dev-only reset control. Defaults to hidden in production builds. */
  showResetButton?: boolean;
}

const STAGE_COPY: Record<EncounterStage, string> = {
  0: "젖은 표면 아래 작은 기척이 있어요.",
  1: "나를 깨워줘.",
  2: "너는 누구야?",
  3: "비를 피해 왔어.",
  4: "조금만 더 가까이.",
  5: "찾았다.",
};

const AWAKENED_LINE = "비를 피해 작은 불씨가 찾아왔어요.";

const WEATHER_LABEL: Record<NonNullable<RainyNightEncounterProps["weatherCondition"]>, string> = {
  rain: "비",
  clear: "맑음",
  cloudy: "흐림",
  unknown: "",
};

const CRACK_PATHS = [
  "M150,150 L140,119 L149,89 L132,54",
  "M150,150 L186,137 L217,149 L251,126",
  "M150,150 L119,176 L93,167 L57,193",
  "M150,150 L169,186 L157,217 L176,247",
];

type AwakenState = "idle" | "pending" | "error" | "done";

export function RainyNightEncounter({
  locationLabel = "서울",
  weatherCondition = "rain",
  initialStage = 0,
  onStageChange,
  onAwaken,
  onReset,
  showResetButton = process.env.NODE_ENV !== "production",
}: RainyNightEncounterProps) {
  const [stage, setStage] = React.useState<EncounterStage>(initialStage);
  const [awakenState, setAwakenState] = React.useState<AwakenState>("idle");

  const hasTriggeredAwakenRef = React.useRef(false);
  // Tracks the last stage actually reported, so a duplicate effect run (e.g. React
  // Strict Mode's dev-only double-invoke) can never announce the same stage twice.
  const reportedStageRef = React.useRef<EncounterStage | null>(null);

  const isRaining = weatherCondition === "rain";
  const weatherLabel = WEATHER_LABEL[weatherCondition];

  React.useEffect(() => {
    const previous = reportedStageRef.current;
    reportedStageRef.current = stage;
    if (previous === null || previous === stage) return;
    onStageChange?.(stage);
  }, [stage, onStageChange]);

  const runAwaken = React.useCallback(async () => {
    if (!onAwaken) {
      setAwakenState("done");
      return;
    }
    setAwakenState("pending");
    try {
      await onAwaken();
      setAwakenState("done");
    } catch {
      setAwakenState("error");
    }
  }, [onAwaken]);

  React.useEffect(() => {
    if (stage !== 5 || hasTriggeredAwakenRef.current) return;
    hasTriggeredAwakenRef.current = true;
    void runAwaken();
  }, [stage, runAwaken]);

  const advance = React.useCallback(() => {
    // Functional update: each click event maps to exactly one +1, regardless of
    // how quickly clicks arrive, and never skips past 5.
    setStage((prev) => (prev >= 5 ? prev : ((prev + 1) as EncounterStage)));
  }, []);

  const handleClick = React.useCallback(() => {
    advance();
  }, [advance]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.repeat) return;
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        advance();
      }
    },
    [advance],
  );

  const handleReset = React.useCallback(() => {
    hasTriggeredAwakenRef.current = false;
    setAwakenState("idle");
    setStage(0);
    onReset?.();
  }, [onReset]);

  const revealedCracks = Math.min(stage, CRACK_PATHS.length);
  const isConverging = stage >= 4;
  const isAwake = stage >= 5;

  const crackStroke = isAwake ? "#e0a25c" : isConverging ? "#9a6a37" : "#5b3a22";
  const crackOpacity = isAwake ? 0.95 : isConverging ? 0.6 : 0.42;

  const scene = (
    <div className="relative flex h-full w-full flex-col items-center justify-between px-4 py-6 sm:px-8 sm:py-8">
      <header className="flex w-full max-w-2xl items-baseline justify-between text-[13px] tracking-wide text-stone-400 sm:text-sm">
        <span>비 오는 첫 번째 밤</span>
        <span>
          {locationLabel}
          {weatherLabel ? ` · ${weatherLabel}` : ""}
        </span>
      </header>

      <div className="flex flex-1 items-center justify-center py-4">
        <SpotlightCard
          role="button"
          tabIndex={0}
          ariaLabel={isAwake ? "깨어난 불씨" : "젖은 표면, 눌러서 다가가기"}
          glowColor="orange"
          customSize
          dataTestId="encounter-surface"
          width="min(28rem, 88vw)"
          height="min(34rem, 62svh)"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className="cursor-pointer select-none outline-offset-4"
        >
          <div className="relative h-full w-full">
            {/* wet clay / dark ceramic surface */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "#211c18",
                backgroundImage: [
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
                  "radial-gradient(circle at 22% 28%, rgba(120,100,80,0.16), transparent 42%)",
                  "radial-gradient(circle at 74% 62%, rgba(0,0,0,0.35), transparent 48%)",
                  "radial-gradient(circle at 40% 82%, rgba(90,70,55,0.14), transparent 38%)",
                  "radial-gradient(circle at 85% 20%, rgba(0,0,0,0.28), transparent 40%)",
                ].join(", "),
                backgroundSize: "3px 3px, auto, auto, auto, auto",
              }}
            />

            <svg
              viewBox="0 0 300 300"
              className="absolute inset-0 h-full w-full"
              aria-hidden
              style={{ filter: isAwake ? "drop-shadow(0 0 6px rgba(224,162,92,0.55))" : "none" }}
            >
              {CRACK_PATHS.map((d, index) => (
                <path
                  key={d}
                  d={d}
                  fill="none"
                  stroke={crackStroke}
                  strokeWidth={isAwake ? 1.6 : 1.1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  style={{
                    opacity: index < revealedCracks ? crackOpacity : 0,
                    strokeDasharray: 1,
                    strokeDashoffset: index < revealedCracks ? 0 : 1,
                    transition: "stroke-dashoffset 900ms ease-out, opacity 900ms ease-out, stroke 700ms ease-out",
                  }}
                />
              ))}
            </svg>

            {isConverging && (
              <div
                aria-hidden
                className={cn(
                  "absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl",
                  !isAwake && "animate-pulse",
                )}
                style={{
                  background:
                    "radial-gradient(circle, rgba(224,162,92,0.35), transparent 70%)",
                }}
              />
            )}

            {isAwake && (
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ animation: "ember-settle 1100ms ease-out both" }}
              >
                <div
                  className="relative h-10 w-10"
                  style={{ animation: "ember-flicker 3400ms ease-in-out 1100ms infinite" }}
                >
                  <div
                    className="absolute inset-0 rounded-full blur-md"
                    style={{ background: "radial-gradient(circle, rgba(224,162,92,0.65), transparent 72%)" }}
                  />
                  <div
                    className="absolute inset-[6px]"
                    style={{
                      borderRadius: "58% 42% 55% 45% / 48% 58% 42% 52%",
                      background:
                        "radial-gradient(circle at 45% 40%, #fff4d8 0%, #f0b25c 38%, #a5622a 72%, transparent 100%)",
                      boxShadow: "0 0 18px 4px rgba(224,162,92,0.45)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </SpotlightCard>
      </div>

      <footer className="flex w-full max-w-2xl flex-col items-center gap-3 text-center">
        <p aria-live="polite" className="min-h-6 text-[15px] font-medium text-stone-200 sm:text-base">
          {STAGE_COPY[stage]}
        </p>
        {isAwake && <p className="text-xs text-stone-400 sm:text-sm">{AWAKENED_LINE}</p>}

        {awakenState === "error" && (
          <div className="flex items-center gap-2 text-xs text-amber-300/90">
            <span>빛을 켜지 못했어요.</span>
            <button
              type="button"
              onClick={() => void runAwaken()}
              className="rounded-full border border-amber-300/40 px-2.5 py-1 text-amber-200 hover:bg-amber-300/10"
            >
              다시 시도
            </button>
          </div>
        )}

        <span className="text-[11px] tracking-[0.2em] text-stone-500">
          {String(stage).padStart(2, "0")} / 05
        </span>

        {showResetButton && isAwake && (
          <button
            type="button"
            onClick={handleReset}
            className="mt-1 text-[11px] text-stone-500 underline decoration-dotted underline-offset-2 hover:text-stone-300"
          >
            처음부터 다시 보기
          </button>
        )}
      </footer>
    </div>
  );

  return (
    <div className="h-[100svh] w-full overflow-hidden bg-[#0b0908]">
      {isRaining ? (
        <RainBackground intensity={0.55} lightningEnabled reducedMotion={false}>
          {scene}
        </RainBackground>
      ) : (
        scene
      )}
    </div>
  );
}
