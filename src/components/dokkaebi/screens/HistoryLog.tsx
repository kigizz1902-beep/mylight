import type { CSSProperties } from "react";
import { ArrowLeft } from "lucide-react";

import { glassPanel, glassPill } from "@/lib/glass";

/**
 * Stat columns bottom-align their values via space-between so the three different
 * value font sizes line up without per-column padding nudges.
 */
const STAT_COLUMN: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: 5,
};

const STAT_LABEL: CSSProperties = { fontSize: 11.5, color: "#6b6053", whiteSpace: "nowrap" };

const STAT_VALUE: CSSProperties = { color: "#e5d6c0", whiteSpace: "nowrap" };

const TAB_BUTTON: CSSProperties = {
  minHeight: 44,
  padding: "9px 16px",
  fontSize: 13,
  fontFamily: "'Noto Sans KR',sans-serif",
  cursor: "pointer",
};

interface SessionRow {
  title: string;
  meta: string;
  duration: string;
  open: () => void;
}

interface ChangeRow {
  desc: string;
  meta: string;
}

interface HistoryLogProps {
  nights: number;
  totalTimeText: string;
  stageLabel: string;
  logTab: "nights" | "changes";
  showDetail: boolean;
  sessions: SessionRow[];
  changes: ChangeRow[];
  detailTitle: string;
  detailMeta: string;
  detailDuration: string;
  detailMin: string;
  detailAck: string;
  tabNights: () => void;
  tabChanges: () => void;
  goLog: () => void;
}

export function HistoryLog({
  nights,
  totalTimeText,
  stageLabel,
  logTab,
  showDetail,
  sessions,
  changes,
  detailTitle,
  detailMeta,
  detailDuration,
  detailMin,
  detailAck,
  tabNights,
  tabChanges,
  goLog,
}: HistoryLogProps) {
  const showNightsTab = !showDetail && logTab === "nights";
  const showChangesTab = !showDetail && logTab === "changes";

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
      {!showDetail && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "22px 26px 0", minHeight: 0 }}>
          <p style={{ margin: "12px 0 16px", fontFamily: "'Gowun Batang',serif", fontSize: 22, color: "#e2d3bd" }}>기록</p>
          <div
            style={{
              display: "flex",
              gap: 18,
              marginBottom: 16,
              ...glassPanel({ radius: 18, padding: "16px 18px" }),
            }}
          >
            <div style={STAT_COLUMN}>
              <span style={STAT_LABEL}>함께한 밤</span>
              <span style={{ ...STAT_VALUE, fontSize: 19, fontVariantNumeric: "tabular-nums" }}>{nights}</span>
            </div>
            <div style={{ ...STAT_COLUMN, flex: 1.4 }}>
              <span style={STAT_LABEL}>누적 시간</span>
              <span style={{ ...STAT_VALUE, fontSize: 16 }}>{totalTimeText}</span>
            </div>
            <div style={STAT_COLUMN}>
              <span style={STAT_LABEL}>성장 단계</span>
              <span style={{ ...STAT_VALUE, fontSize: 14 }}>{stageLabel}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button
              onClick={tabNights}
              aria-pressed={logTab === "nights"}
              style={{ ...TAB_BUTTON, ...glassPill(logTab === "nights") }}
            >
              밤 목록
            </button>
            <button
              onClick={tabChanges}
              aria-pressed={logTab === "changes"}
              style={{ ...TAB_BUTTON, ...glassPill(logTab === "changes") }}
            >
              변화 이력
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingBottom: 16 }}>
            {showNightsTab &&
              sessions.map((s, i) => (
                <button
                  key={i}
                  onClick={s.open}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    fontFamily: "'Noto Sans KR',sans-serif",
                    ...glassPanel({ radius: 14, padding: "15px 16px" }),
                  }}
                >
                  <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 14, color: "#d9cab4" }}>{s.title}</span>
                    <span style={{ fontSize: 11.5, color: "#655b4e" }}>{s.meta}</span>
                  </span>
                  <span style={{ fontSize: 12.5, color: "#8a7c6a" }}>{s.duration}</span>
                </button>
              ))}
            {showChangesTab &&
              changes.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    ...glassPanel({ radius: 14, padding: "15px 16px" }),
                  }}
                >
                  <span
                    style={{ width: 6, height: 6, marginTop: 7, borderRadius: "50%", background: "#c8894a", flex: "none", display: "block" }}
                  />
                  <span style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <span style={{ fontSize: 13.5, color: "#d9cab4" }}>{c.desc}</span>
                    <span style={{ fontSize: 11.5, color: "#655b4e" }}>{c.meta}</span>
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {showDetail && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "22px 26px 0" }}>
          <button
            onClick={goLog}
            style={{
              alignSelf: "flex-start",
              display: "flex",
              alignItems: "center",
              gap: 6,
              minHeight: 44,
              padding: "8px 12px 8px 0",
              border: "none",
              background: "transparent",
              color: "#9a8b78",
              fontSize: 13,
              fontFamily: "'Noto Sans KR',sans-serif",
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={15} strokeWidth={1.75} aria-hidden />
            기록
          </button>
          <p style={{ margin: "22px 0 6px", fontFamily: "'Gowun Batang',serif", fontSize: 24, color: "#e4d5bf" }}>
            {detailTitle}
          </p>
          {detailMeta && <p style={{ margin: "0 0 20px", fontSize: 12.5, color: "#7d7264" }}>{detailMeta}</p>}
          <div style={{ height: detailMeta ? 6 : 26 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                ...glassPanel({ radius: 14, padding: "15px 16px" }),
              }}
            >
              <span style={{ fontSize: 13, color: "#8f8474" }}>함께 머문 시간</span>
              <span style={{ fontSize: 13, color: "#ddcdb6" }}>{detailDuration}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                ...glassPanel({ radius: 14, padding: "15px 16px" }),
              }}
            >
              <span style={{ fontSize: 13, color: "#8f8474" }}>가장 낮춘 밝기</span>
              <span style={{ fontSize: 13, color: "#ddcdb6" }}>{detailMin}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                ...glassPanel({ radius: 14, padding: "15px 16px" }),
              }}
            >
              <span style={{ fontSize: 13, color: "#8f8474" }}>취침 신호</span>
              <span style={{ fontSize: 13, color: "#ddcdb6" }}>{detailAck}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
