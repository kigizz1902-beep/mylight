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
