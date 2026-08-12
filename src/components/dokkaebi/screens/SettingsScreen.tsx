import type { ChangeEvent } from "react";
import { Check } from "lucide-react";

import { color, GUTTER, radius, space, text } from "@/lib/design";
import { glassButton, glassInput, glassPanel, statusTag } from "@/lib/glass";

interface SettingsScreenProps {
  nameDraft: string;
  onNameInput: (e: ChangeEvent<HTMLInputElement>) => void;
  renameSave: () => void;
  outputModeLabel: string;
  connectionLabel: string;
}

/**
 * 설정 — System Cards (디자인.md §7.3E).
 *
 * The quietest screen in the app: the darkest surfaces, no coloured glow at all,
 * and nothing here may draw the eye ahead of 오늘 (§1.3 puts 메뉴·설정·기술 상태
 * last). The connection state is a tag with a dot *and* a word, since §16.2
 * forbids carrying state in colour alone.
 */
export function SettingsScreen({
  nameDraft,
  onNameInput,
  renameSave,
  outputModeLabel,
  connectionLabel,
}: SettingsScreenProps) {
  const canRename = nameDraft.trim().length > 0;

  return (
    <div
      style={{
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflowY: "auto",
        padding: `max(${space[5]}, env(safe-area-inset-top)) ${GUTTER}px ${space[6]}`,
        color: color.textPrimary,
      }}
    >
      <h1 style={{ ...text.screenTitle, flex: "none", marginBottom: space[5] }}>설정</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: space[2] }}>
        <section style={glassPanel({ radius: radius.md, padding: space[5], tone: "quiet" })}>
          <label htmlFor="rename-input" style={{ ...text.label, display: "block", marginBottom: space[3] }}>
            이름
          </label>
          <input
            id="rename-input"
            value={nameDraft}
            onChange={onNameInput}
            autoComplete="off"
            style={{ ...glassInput(), width: "100%", boxSizing: "border-box" }}
          />
          <button
            type="button"
            onClick={renameSave}
            disabled={!canRename}
            className="pressable"
            style={{
              ...glassButton("ghost"),
              marginTop: space[3],
              minHeight: 44,
              fontSize: 13,
              // §8 forms — a disabled control reads as disabled and does nothing.
              ...(canRename ? null : { opacity: 0.45, cursor: "not-allowed" }),
            }}
          >
            이름 변경
          </button>
        </section>

        {/* The tag sits on the title row rather than beside the whole block, so the
            explanatory line below gets the card's full width instead of being
            squeezed into a column narrow enough to break mid-word. */}
        <section
          style={{
            ...glassPanel({ radius: radius.md, padding: space[5], tone: "quiet" }),
            display: "flex",
            flexDirection: "column",
            gap: space[2],
          }}
        >
          <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: space[3] }}>
            <span style={{ ...text.body, color: color.textPrimary, fontSize: 14 }}>출력 모드</span>
            <span style={statusTag("rain")}>{outputModeLabel}</span>
          </span>
          <span style={text.meta}>FR-09 · 같은 엔진, 출력만 교체</span>
        </section>

        <section
          style={{
            ...glassPanel({ radius: radius.md, padding: space[5], tone: "quiet" }),
            display: "flex",
            flexDirection: "column",
            gap: space[2],
          }}
        >
          <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: space[3] }}>
            <span style={{ ...text.body, color: color.textPrimary, fontSize: 14 }}>연결 상태</span>
            <span style={statusTag("success")}>
              <Check size={13} strokeWidth={2} aria-hidden />
              {connectionLabel}
            </span>
          </span>
          <span style={text.meta}>FR-10 · 연결이 끊겨도 일반 조명으로 사용</span>
        </section>
      </div>

      <p style={{ ...text.meta, lineHeight: 1.8, marginTop: space[6] }}>
        알림·출석·색상 편집은 제공하지 않습니다.
        <br />
        사용하지 않는 기간에도 기록은 줄지 않습니다.
      </p>
    </div>
  );
}
