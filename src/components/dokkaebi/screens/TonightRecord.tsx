import { color, GUTTER, radius, space, text } from "@/lib/design";
import { glassButton, glassPanel, innerGlow } from "@/lib/glass";

interface TonightRecordProps {
  lastTitle: string;
  lastDuration: string;
  goLog: () => void;
  goHome: () => void;
}

/**
 * 장면 9 — the night just ended (디자인.md §7.3B Memory Card).
 *
 * The flame is out, so this screen has no living glow at all: the card carries a
 * deep blue glow instead, because what is left is a memory of the night rather
 * than the 도깨비불 itself (MUST 03). The number is large but does not shine
 * (§7.3B).
 */
export function TonightRecord({ lastTitle, lastDuration, goLog, goHome }: TonightRecordProps) {
  return (
    <div
      style={{
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: space[4],
        padding: `${space[6]} ${GUTTER}px`,
        color: color.textPrimary,
      }}
    >
      <section
        className="rise-in"
        style={{
          ...glassPanel({ radius: radius.xl, padding: space[6] }),
          display: "flex",
          flexDirection: "column",
          gap: space[2],
        }}
      >
        <span aria-hidden style={innerGlow("blue", { strength: 0.18, corner: "top-left" })} />
        <p style={text.label}>오늘 밤의 기록</p>
        <p style={{ ...text.statusHeadline, marginTop: space[2] }}>{lastTitle}</p>
        <p style={text.body}>함께 머문 시간 {lastDuration}</p>
      </section>

      <p style={{ ...text.meta, paddingLeft: space[1] }}>불은 꺼졌지만 함께 보낸 시간은 남습니다.</p>

      {/* §10 / §4 — one primary action, the other subordinate. */}
      <div style={{ display: "flex", gap: space[3] }}>
        <button type="button" onClick={goLog} className="pressable" style={{ ...glassButton("primary"), flex: 1 }}>
          기록 보기
        </button>
        <button type="button" onClick={goHome} className="pressable" style={{ ...glassButton("ghost"), flex: 1 }}>
          닫기
        </button>
      </div>
    </div>
  );
}
