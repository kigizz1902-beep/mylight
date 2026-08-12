import type { GlowTone } from "@/lib/design";

export interface Stage {
  at: number;
  key: string;
  label: string;
  wake: string;
  desc: string;
}

export const STAGES: Stage[] = [
  { at: 1, key: "meet", label: "첫 만남", wake: "2.6s", desc: "이름 없는 불에서 고유한 존재가 되었습니다" },
  { at: 3, key: "familiar", label: "익숙해짐", wake: "2.0s", desc: "켜질 때 빛이 안정되는 속도가 조금 빨라졌습니다" },
  { at: 7, key: "memory", label: "기억 시작", wake: "1.6s", desc: "자주 쓰는 밝기에 가까운 결로 깨어납니다 · 첫 성격 단서" },
  { at: 30, key: "character", label: "성격 형성", wake: "1.2s", desc: "켜짐과 취침 응답의 결이 달라졌습니다" },
  { at: 100, key: "dokkaebi", label: "도깨비가 깃듦", wake: "0.9s", desc: "고유한 깨어남 패턴이 생겼습니다" },
];

export function stageFor(nights: number): Stage {
  const reached = STAGES.filter((s) => nights >= s.at);
  return reached[reached.length - 1] ?? STAGES[0];
}

/** The stage after the current one, or `null` once 도깨비가 깃듦 is reached. */
export function nextStageFor(nights: number): Stage | null {
  return STAGES.find((s) => s.at > nights) ?? null;
}

/**
 * How far this many nights has travelled between the current stage and the next,
 * as 0–1. Feeds the growth card's ring (§7.3C) — a real measurement, so the ring
 * never draws a fake arc (§11 "데이터가 없는 상태를 가짜 그래프로 채우지 않는다").
 * Returns 1 at the final stage.
 */
export function stageProgress(nights: number): number {
  const from = stageFor(nights);
  const to = nextStageFor(nights);
  if (!to) return 1;
  const span = to.at - from.at;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (nights - from.at) / span));
}

/**
 * 디자인.md §14 — the 도깨비불's state, as the document defines it: a tag, a
 * sentence, a flame brightness and a movement, all changing together. MUST 07
 * means `headline` is what a screen shows first and the numbers come after it.
 *
 * The document's two remaining rows have no counterpart in this prototype and
 * are deliberately absent rather than faked: `함께 이동` needs presence tracking
 * the app doesn't have, and `오류·연결 끊김` needs a real bridge that can drop
 * (see src/lib/light-controller.ts).
 */
export type MoodKey = "searching" | "awake" | "winding" | "asleep" | "growth";

export interface Mood {
  key: MoodKey;
  /** §10.4 status tag copy. */
  tag: string;
  /** §14 문구 — the state sentence, shown before any value. */
  headline: string;
  /** §14 불꽃 밝기, 0–1. */
  intensity: number;
  /** §14 움직임. */
  motion: "none" | "breathe" | "slowing" | "swell";
  /** §14 카드 색 — which hue this state is allowed to tint its card with. */
  tone: GlowTone;
}

interface MoodInput {
  nights: number;
  isOn: boolean;
  brightness: number;
  bedtimeAck: boolean;
  /** True while a stage change is being announced, so the flame swells once. */
  celebrating?: boolean;
}

export function moodFor({ nights, isOn, brightness, bedtimeAck, celebrating = false }: MoodInput): Mood {
  // `isOn` is checked before the night count, because the flame is already lit
  // during the naming step while `nights` is still 0 — being unnamed doesn't make
  // it 연결 전 once it has woken.
  if (!isOn) {
    return nights === 0
      ? {
          key: "searching",
          tag: "아직 만나기 전",
          headline: "아직 서로를 찾는 중이에요",
          intensity: 0.15,
          motion: "none",
          tone: "rain",
        }
      : {
          key: "asleep",
          tag: "잠듦",
          headline: "불씨만 남겨두었어요",
          intensity: 0.08,
          motion: "none",
          tone: "amber",
        };
  }

  if (celebrating) {
    return {
      key: "growth",
      tag: "기억이 자라는 중",
      headline: "새로운 온기를 기억했어요",
      intensity: 0.85,
      motion: "swell",
      tone: "lilac",
    };
  }

  // The bedtime signal is the brightness being taken all the way down (FR: 가장
  //낮게 내리면 한 번 대답한다), so 잠들 준비 is a brightness state, not a mode.
  if (bedtimeAck || brightness <= 12) {
    return {
      key: "winding",
      tag: "잠들 준비",
      headline: "오늘의 빛을 접고 있어요",
      intensity: 0.28,
      motion: "slowing",
      tone: "amber",
    };
  }

  return {
    key: "awake",
    tag: "곁에 있음",
    headline: "조용히 깨어 있어요",
    // §10.5 — "밝기 변경 중에는 도깨비불 오브젝트도 동시에 반응해야 한다", so while
    // awake the brightness drives the flame rather than a fixed value. The curve is
    // centred on §14's 70% figure, which lands at roughly the app's default brightness.
    intensity: 0.34 + (brightness / 100) * 0.44,
    motion: "breathe",
    tone: "amber",
  };
}

/** True when a Korean syllable ends in a final consonant (종성), so 과/이 (not 와/가) should follow. */
export function hasJong(word: string): boolean {
  const char = (word || "").trim().slice(-1);
  const code = char.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return true;
  return (code - 0xac00) % 28 !== 0;
}

export const gwa = (word: string) => word + (hasJong(word) ? "과" : "와");
export const iga = (word: string) => word + (hasJong(word) ? "이" : "가");

export const ord = (n: number) => (n === 1 ? "첫 번째" : `${n}번째`);

export const fmt = (minutes: number) =>
  minutes >= 60 ? `${Math.floor(minutes / 60)}시간 ${minutes % 60}분` : `${minutes}분`;

/**
 * The same duration for a 큰 숫자 slot (§9.2), matching the document's own
 * `2h 14m` example in §13.3. The Korean form is 6–8 characters wide and wraps
 * inside a one-column bento card at 32px; this one doesn't.
 */
export const fmtCompact = (minutes: number) =>
  minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;

export interface NightSession {
  id: string;
  no: number;
  title: string;
  minutes: number;
  minBrightness: number;
  ack: boolean;
}

export interface ChangeEntry {
  id: string;
  desc: string;
  meta: string;
}
