import type { ChangeEvent } from "react";

import { glassButton, glassInput, glassPanel, glassPill } from "@/lib/glass";

interface SettingsScreenProps {
  nameDraft: string;
  onNameInput: (e: ChangeEvent<HTMLInputElement>) => void;
  renameSave: () => void;
  outputModeLabel: string;
  connectionLabel: string;
}

export function SettingsScreen({
  nameDraft,
  onNameInput,
  renameSave,
  outputModeLabel,
  connectionLabel,
}: SettingsScreenProps) {
  return (
    <div
      style={{
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        padding: "22px 26px 0",
        background: "#0c0a09",
        color: "#e6dccd",
        fontFamily: "'Noto Sans KR',system-ui,sans-serif",
      }}
    >
      <p style={{ margin: "12px 0 18px", fontFamily: "'Gowun Batang',serif", fontSize: 22, color: "#e2d3bd" }}>설정</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={glassPanel({ radius: 16, padding: "16px 18px" })}>
          <label htmlFor="rename-input" style={{ display: "block", margin: "0 0 10px", fontSize: 11.5, color: "#7d7264" }}>
            이름
          </label>
          <input
            id="rename-input"
            value={nameDraft}
            onChange={onNameInput}
            style={{
              width: "100%",
              boxSizing: "border-box",
              // 44px floor: mobile text inputs must stay tappable.
              minHeight: 44,
              padding: "12px 14px",
              fontSize: 15,
              fontFamily: "'Noto Sans KR',sans-serif",
              ...glassInput(),
            }}
          />
          <button
            onClick={renameSave}
            disabled={!nameDraft.trim()}
            style={{
              marginTop: 10,
              minHeight: 44,
              padding: "11px 16px",
              fontSize: 13,
              fontFamily: "'Noto Sans KR',sans-serif",
              ...glassButton("ghost"),
              ...(nameDraft.trim() ? null : { opacity: 0.45, cursor: "not-allowed" }),
            }}
          >
            이름 변경
          </button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            ...glassPanel({ radius: 16, padding: "17px 18px" }),
          }}
        >
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13.5, color: "#d9cbb6" }}>출력 모드</span>
            <span style={{ fontSize: 11.5, color: "#7d7264" }}>FR-09 · 같은 엔진, 출력만 교체</span>
          </span>
          <span style={{ fontSize: 12.5, padding: "6px 12px", ...glassPill(true) }}>{outputModeLabel}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            ...glassPanel({ radius: 16, padding: "17px 18px" }),
          }}
        >
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13.5, color: "#d9cbb6" }}>연결 상태</span>
            <span style={{ fontSize: 11.5, color: "#7d7264" }}>FR-10 · 연결이 끊겨도 일반 조명으로 사용</span>
          </span>
          <span style={{ fontSize: 12.5, color: "#8fa07c" }}>{connectionLabel}</span>
        </div>
      </div>
      <p style={{ margin: "22px 0 0", fontSize: 11.5, lineHeight: 1.8, color: "#71675a" }}>
        알림·출석·색상 편집은 제공하지 않습니다.
        <br />
        사용하지 않는 기간에도 기록은 줄지 않습니다.
      </p>
    </div>
  );
}
