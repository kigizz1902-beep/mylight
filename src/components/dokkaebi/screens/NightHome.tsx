import type { ChangeEvent, CSSProperties, ReactNode } from "react";

import { Flame } from "@/components/dokkaebi/Flame";
import { color, GUTTER, radius, space, text } from "@/lib/design";
import { glassButton, glassPanel, glassPill, innerGlow, statusDot, statusTag } from "@/lib/glass";
import type { Mood } from "@/lib/dokkaebi";

/** SCENE 4's four choices, in the storyboard's fixed order. */
const EMOTION_CHOICES = [
  "기분 좋은 일이 있었어",
  "조금 지쳤어",
  "마음이 복잡해",
  "그냥 조용히 있고 싶어",
] as const;

/**
 * SCENE 4 — "오늘은 어떤 마음으로 돌아왔어?" A small card under the flame, not a
 * blocking popup (스토리보드 6장 조건 1) — 조명 사용과 밝기 조절은 이 카드가 떠 있는
 * 동안에도 그대로 가능해야 하므로, Living Card 안에서 slider와 함께 렌더링된다.
 */
function EmotionQuestionCard({
  onAnswer,
  onSkip,
}: {
  onAnswer: (choice: string) => void;
  onSkip: () => void;
}) {
  return (
    <div
      style={{
        ...glassPanel({ tone: "nested", radius: radius.md, padding: space[3] }),
        width: "100%",
        marginTop: space[4],
        display: "flex",
        flexDirection: "column",
        gap: space[2],
        textAlign: "left",
      }}
    >
      <p style={text.body}>오늘은 어떤 마음으로 돌아왔어?</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: space[2] }}>
        {EMOTION_CHOICES.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => onAnswer(choice)}
            className="pressable"
            style={glassPill(false)}
          >
            {choice}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSkip}
        style={{
          ...text.meta,
          alignSelf: "flex-end",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        다음에 말할게
      </button>
    </div>
  );
}

/** SCENE 7's three choices, in the storyboard's fixed order. */
const FOLLOW_UP_CHOICES = ["조금 편해졌어", "아직 그대로야", "그냥 말없이 쉬고 싶어"] as const;

/**
 * SCENE 7 — "아까 지쳤다고 했지. 지금은 어때?" Only appears once the FR-04 bedtime
 * pulse has already played, and only if SCENE 4 was ever answered — this is the
 * moment the storyboard calls "관계가 되는 결정적 장면" (the first conversation
 * being remembered later the same night).
 */
function FollowUpQuestionCard({
  onAnswer,
  onSkip,
}: {
  onAnswer: (choice: string) => void;
  onSkip: () => void;
}) {
  return (
    <div
      style={{
        ...glassPanel({ tone: "nested", radius: radius.md, padding: space[3] }),
        width: "100%",
        marginTop: space[4],
        display: "flex",
        flexDirection: "column",
        gap: space[2],
        textAlign: "left",
      }}
    >
      <p style={text.body}>아까 지쳤다고 했지. 지금은 어때?</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: space[2] }}>
        {FOLLOW_UP_CHOICES.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => onAnswer(choice)}
            className="pressable"
            style={glassPill(false)}
          >
            {choice}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSkip}
        style={{
          ...text.meta,
          alignSelf: "flex-end",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        말없이 쉴게
      </button>
    </div>
  );
}

export interface WeekPoint {
  /** Night label, e.g. "12번째 밤" — names the highlighted point in text (§16.2). */
  label: string;
  minutes: number;
}

export interface GrowthView {
  /** 성장 단계 label, e.g. "기억 시작". */
  label: string;
  /** 0–1 toward the next stage. */
  progress: number;
  /** Nights remaining until the next stage, or null at the final stage. */
  nightsAway: number | null;
}

interface NightHomeProps {
  nightLabel: string;
  greeting: string;
  mood: Mood;
  /** Flame brightness 0–1 — the mood's value, or a wake-in ramp. */
  flameAnimation?: string;
  /**
   * The 보조 문장 under the state sentence, e.g. "불이와 2시간 14분을 함께했어요".
   * Built by the container so the Korean particle logic stays with the domain
   * helpers in lib/dokkaebi.ts rather than in a view.
   */
  togetherSentence: string;
  /** Compact duration for the 큰 숫자 slot, e.g. "2h 14m". */
  togetherCompact: string;
  nights: number;
  growth: GrowthView;
  /** Up to 7 nights, oldest first. Empty until the first night is recorded. */
  week: WeekPoint[];
  brightness: number;
  isOn: boolean;
  ackHint: string;
  togglePower: () => void;
  onBrightness: (e: ChangeEvent<HTMLInputElement>) => void;
  openLog: () => void;
  /** SCENE 4 — shown only while unasked this session; a skip keeps the light usable. */
  showEmotionQuestion: boolean;
  onAnswerEmotion: (choice: string) => void;
  onSkipEmotionQuestion: () => void;
  /** SCENE 7 — shown a beat after the FR-04 bedtime pulse, only if SCENE 4 was ever answered. */
  showFollowUpQuestion: boolean;
  onAnswerFollowUp: (choice: string) => void;
  onSkipFollowUp: () => void;
  /** SCENE 12 — "water" after night 30 gives the app-side flame its wavier silhouette. */
  flameTemperament?: "none" | "water";
  /**
   * SCENE 12-C's two independent sentences, once the app-side reveal has
   * played (null beforehand, and null again if there's nothing to say yet).
   */
  temperament: { weatherSentence: string; brightnessSentence: string | null; closingLine: string } | null;
}

/** §15.2 — 40–70ms between cards, and never more than a handful in sequence. */
function riseIn(index: number): CSSProperties {
  return { animationDelay: `${index * 60}ms` };
}

/** §7.4 — 작은 라벨 → 핵심 값 → 보조 설명, in that order, in every card. */
function CardLabel({ children }: { children: ReactNode }) {
  return <p style={text.label}>{children}</p>;
}

/**
 * 성장 ring (§7.3C). Indigo track, lilac arc — and the lilac only becomes vivid
 * at a stage boundary, so it marks a rare change rather than decorating the card.
 * Deliberately not a star, gem or level badge (§7.3C).
 */
function GrowthRing({ progress, vivid }: { progress: number; vivid: boolean }) {
  const r = 15;
  const circumference = 2 * Math.PI * r;

  return (
    <svg width={38} height={38} viewBox="0 0 38 38" aria-hidden style={{ flex: "none" }}>
      <circle cx={19} cy={19} r={r} fill="none" stroke={color.auroraIndigo} strokeWidth={2} opacity={0.5} />
      <circle
        cx={19}
        cy={19}
        r={r}
        fill="none"
        stroke={color.auroraViolet}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
        opacity={vivid ? 1 : 0.62}
        transform="rotate(-90 19 19)"
      />
      {/* The ember at the arc's head — the only warm point in this card. */}
      <circle cx={19} cy={4} r={2} fill={color.flameCream} opacity={progress > 0 ? 0.9 : 0.25} />
    </svg>
  );
}

/**
 * 이번 주의 밤 (§13.4). A thin trace through seven light points, with only the
 * longest night lit amber (§11). No axes, no gridlines, and no trace at all
 * before there is data to draw — §11 forbids filling an empty state with a fake
 * graph.
 */
function WeekTrace({ week }: { week: WeekPoint[] }) {
  const longest = week.reduce<WeekPoint | null>(
    (best, point) => (best === null || point.minutes > best.minutes ? point : best),
    null,
  );
  const peak = longest?.minutes ?? 0;

  const points = week.map((point, i) => ({
    ...point,
    x: week.length === 1 ? 50 : 6 + (i * 88) / (week.length - 1),
    // Higher up = longer night. Floors at 24 so a very short night still shows.
    y: peak > 0 ? 26 - (point.minutes / peak) * 19 : 26,
    isPeak: point === longest,
  }));

  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden style={{ width: "100%", height: 44 }}>
      {points.length > 1 && (
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={color.rainBlue}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.4}
          vectorEffect="non-scaling-stroke"
        />
      )}
      {points.map((p) => (
        <g key={p.label}>
          {p.isPeak && <circle cx={p.x} cy={p.y} r={4.6} fill={color.flameAmber} opacity={0.2} />}
          <circle
            cx={p.x}
            cy={p.y}
            r={p.isPeak ? 2.4 : 1.7}
            fill={p.isPeak ? color.flameCream : color.rainBlue}
            opacity={p.isPeak ? 1 : 0.55}
          />
        </g>
      ))}
    </svg>
  );
}

/**
 * 오늘 — the main screen (디자인.md §13).
 *
 * Reading order is fixed by §1.3: the living 도깨비불 first, then tonight's time
 * and the state sentence, then growth and history, and nothing technical at all.
 * The Living Card is the screen's only bright glow (MUST 02), so the bento cards
 * below it stay black glass, and the quiet action at the bottom only becomes a
 * primary button when the flame is out and it is the one lit thing left.
 */
export function NightHome({
  nightLabel,
  greeting,
  mood,
  flameAnimation,
  togetherSentence,
  togetherCompact,
  nights,
  growth,
  week,
  brightness,
  isOn,
  ackHint,
  togglePower,
  onBrightness,
  openLog,
  showEmotionQuestion,
  onAnswerEmotion,
  onSkipEmotionQuestion,
  showFollowUpQuestion,
  onAnswerFollowUp,
  onSkipFollowUp,
  flameTemperament = "none",
  temperament,
}: NightHomeProps) {
  const longestNight = week.reduce<WeekPoint | null>(
    (best, point) => (best === null || point.minutes > best.minutes ? point : best),
    null,
  );

  return (
    <div
      style={{
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        color: color.textPrimary,
      }}
    >
      {/* §13.1 Header — about 56px, a short greeting on the left. There is no icon
          button on the right: the only two the document suggests are 알림, which
          this product deliberately doesn't have, and 설정, which the bottom nav
          already owns (§18.5 — don't repeat what an existing surface carries). */}
      <header
        style={{
          flex: "none",
          minHeight: 56,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 3,
          padding: `max(${space[5]}, env(safe-area-inset-top)) ${GUTTER}px 0`,
        }}
      >
        <p style={text.label}>{nightLabel}</p>
        <p style={text.cardTitle}>{greeting}</p>
      </header>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: space[3],
          padding: `${space[5]} ${GUTTER}px ${space[6]}`,
        }}
      >
        {/* ── §13.2 Living Card — the one bright card on the screen ───────── */}
        <section
          className="rise-in"
          style={{
            ...glassPanel({ radius: radius.xl, tone: "living", padding: space[5] }),
            ...riseIn(0),
            flex: "none",
            minHeight: 284,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <span aria-hidden style={innerGlow(mood.tone, { strength: isOn ? 0.2 : 0.08, corner: "bottom" })} />

          <span style={{ ...statusTag(mood.tone), alignSelf: "center" }}>
            <span aria-hidden style={statusDot(mood.tone)} />
            {mood.tag}
          </span>

          <div style={{ flex: 1, display: "grid", placeItems: "center", minHeight: 148 }}>
            <Flame
              size={82}
              intensity={mood.intensity}
              motion={mood.motion}
              animation={flameAnimation}
              temperament={flameTemperament}
            />
          </div>

          {/* MUST 07 — the state sentence comes before any number. */}
          <p style={text.statusHeadline}>{mood.headline}</p>
          <p style={{ ...text.body, marginTop: space[2] }}>{togetherSentence}</p>

          {isOn && showEmotionQuestion && (
            <EmotionQuestionCard onAnswer={onAnswerEmotion} onSkip={onSkipEmotionQuestion} />
          )}

          {isOn && (
            <div style={{ width: "100%", marginTop: space[5] }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 2,
                }}
              >
                {/* `--text-tertiary` measures 4.31:1 against `--glass-strong` —
                    just under WCAG AA — and the Living Card is the only surface
                    that light. These two labels step up to `--text-secondary`
                    (9.67:1) rather than introducing an off-token grey (§16.2). */}
                <label htmlFor="brightness-slider" style={{ ...text.label, color: color.textSecondary }}>
                  밝기
                </label>
                <span style={{ ...text.meta, color: color.textSecondary }}>{brightness}</span>
              </div>
              <input
                id="brightness-slider"
                className="ember-slider"
                type="range"
                min={0}
                max={100}
                value={brightness}
                onChange={onBrightness}
                style={{ "--pct": `${brightness}%` } as CSSProperties}
              />
            </div>
          )}

          {isOn && showFollowUpQuestion && (
            <FollowUpQuestionCard onAnswer={onAnswerFollowUp} onSkip={onSkipFollowUp} />
          )}
        </section>

        {/* ── §13.3 Bento Row 1 — two one-column cards ───────────────────── */}
        <div style={{ flex: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: space[3] }}>
          <section
            className="rise-in"
            style={{
              ...glassPanel({ radius: radius.lg, padding: space[4] }),
              ...riseIn(1),
              display: "flex",
              flexDirection: "column",
              gap: space[2],
            }}
          >
            <CardLabel>함께한 시간</CardLabel>
            <p style={text.bigNumber}>{togetherCompact}</p>
            <p style={text.meta}>함께한 밤 {nights}일</p>
          </section>

          <section
            className="rise-in"
            style={{
              ...glassPanel({ radius: radius.lg, padding: space[4] }),
              ...riseIn(2),
              display: "flex",
              flexDirection: "column",
              gap: space[2],
            }}
          >
            <span aria-hidden style={innerGlow("indigo", { strength: 0.16, corner: "top-right" })} />
            <CardLabel>불씨의 성장</CardLabel>
            <p style={text.cardTitle}>{growth.label}</p>
            <div style={{ display: "flex", alignItems: "center", gap: space[2], marginTop: "auto" }}>
              <GrowthRing progress={growth.progress} vivid={mood.key === "growth"} />
              <span style={text.meta}>
                {growth.nightsAway === null ? "마지막 결" : `다음 결까지 ${growth.nightsAway}밤`}
              </span>
            </div>
          </section>
        </div>

        {/* ── §13.4 Memory Card — full width, taps through to 기록 ────────── */}
        <button
          type="button"
          onClick={openLog}
          className="rise-in pressable"
          style={{
            ...glassPanel({ radius: radius.lg, padding: space[5] }),
            ...riseIn(3),
            flex: "none",
            display: "flex",
            flexDirection: "column",
            gap: space[2],
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <span aria-hidden style={innerGlow("blue", { strength: 0.14, corner: "top-right" })} />
          <span style={text.cardTitle}>이번 주의 밤</span>
          {week.length > 0 ? (
            <>
              <WeekTrace week={week} />
              <span style={text.meta}>
                가장 오래 머문 밤 · {longestNight?.label ?? ""}
              </span>
            </>
          ) : (
            <span style={{ ...text.meta, paddingTop: space[2] }}>아직 기록된 밤이 없어요</span>
          )}
        </button>

        {/* ── SCENE 12-C — the two independent 기질 sentences, once revealed ──── */}
        {temperament && (
          <section
            className="rise-in"
            style={{
              ...glassPanel({ radius: radius.lg, padding: space[5] }),
              flex: "none",
              display: "flex",
              flexDirection: "column",
              gap: space[2],
            }}
          >
            <span aria-hidden style={innerGlow("rain", { strength: 0.16, corner: "top-right" })} />
            <CardLabel>불씨의 기질</CardLabel>
            <p style={text.body}>{temperament.weatherSentence}</p>
            {temperament.brightnessSentence && <p style={text.body}>{temperament.brightnessSentence}</p>}
            <p style={{ ...text.cardTitle, marginTop: space[1] }}>{temperament.closingLine}</p>
          </section>
        )}

        {/* ── §13.5 Quiet Action — exactly one, and only warm when nothing else is ── */}
        <button
          type="button"
          onClick={togglePower}
          className="rise-in pressable"
          style={{
            ...glassButton(isOn ? "ghost" : "primary"),
            ...riseIn(4),
            flex: "none",
            width: "100%",
          }}
        >
          {isOn ? "오늘의 빛을 접기" : "도깨비불 부르기"}
        </button>

        <p
          aria-live="polite"
          style={{ ...text.meta, minHeight: 18, textAlign: "center", color: color.textTertiary }}
        >
          {ackHint}
        </p>
      </div>
    </div>
  );
}
