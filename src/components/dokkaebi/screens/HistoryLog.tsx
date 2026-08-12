import type { CSSProperties } from "react";
import { ArrowLeft } from "lucide-react";

import { color, GUTTER, radius, space, text } from "@/lib/design";
import { glassPanel, glassPill, innerGlow } from "@/lib/glass";

/**
 * Stat columns bottom-align their values via space-between so the different value
 * font sizes line up without per-column padding nudges.
 */
const STAT_COLUMN: CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  gap: space[2],
};

const ROW: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: space[3],
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

/**
 * 기록 — the Memory screen (디자인.md §7.3B).
 *
 * Everything here is 밤 and 기억, so the whole screen is cool: deep blue on the
 * summary card, lilac on the growth entries (MUST 03), and no amber anywhere —
 * the living flame is not on this screen, so nothing on it may look alive.
 */
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
        color: color.textPrimary,
      }}
    >
      {!showDetail && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            padding: `max(${space[5]}, env(safe-area-inset-top)) ${GUTTER}px 0`,
          }}
        >
          <h1 style={{ ...text.screenTitle, flex: "none", marginBottom: space[5] }}>기록</h1>

          <section
            className="rise-in"
            style={{
              ...glassPanel({ radius: radius.lg, padding: space[5] }),
              flex: "none",
              display: "flex",
              gap: space[4],
              marginBottom: space[4],
            }}
          >
            <span aria-hidden style={innerGlow("blue", { strength: 0.16, corner: "top-right" })} />
            <div style={STAT_COLUMN}>
              <span style={text.label}>함께한 밤</span>
              <span style={{ ...text.cardTitle, fontVariantNumeric: "tabular-nums" }}>{nights}</span>
            </div>
            <div style={{ ...STAT_COLUMN, flex: 1.6 }}>
              <span style={text.label}>누적 시간</span>
              {/* §7.3B — the number is prominent but never glows. */}
              <span style={{ ...text.statusHeadline, fontVariantNumeric: "tabular-nums" }}>{totalTimeText}</span>
            </div>
            <div style={{ ...STAT_COLUMN, flex: 1.2 }}>
              <span style={text.label}>성장 단계</span>
              <span style={text.cardTitle}>{stageLabel}</span>
            </div>
          </section>

          <div style={{ flex: "none", display: "flex", gap: space[2], marginBottom: space[3] }}>
            <button
              type="button"
              onClick={tabNights}
              aria-pressed={logTab === "nights"}
              style={glassPill(logTab === "nights")}
            >
              밤 목록
            </button>
            <button
              type="button"
              onClick={tabChanges}
              aria-pressed={logTab === "changes"}
              style={glassPill(logTab === "changes")}
            >
              변화 이력
            </button>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: space[2],
              paddingBottom: space[5],
            }}
          >
            {showNightsTab && sessions.length === 0 && (
              <p style={{ ...text.meta, padding: `${space[4]} 0` }}>아직 기록된 밤이 없어요</p>
            )}
            {showNightsTab &&
              sessions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={s.open}
                  className="pressable"
                  style={{
                    ...glassPanel({ radius: radius.sm, padding: `${space[4]} ${space[4]}` }),
                    ...ROW,
                    width: "100%",
                    flex: "none",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ display: "flex", flexDirection: "column", gap: space[1] }}>
                    <span style={{ ...text.body, color: color.textPrimary, fontSize: 14 }}>{s.title}</span>
                    <span style={text.meta}>{s.meta}</span>
                  </span>
                  <span style={{ ...text.meta, color: color.textSecondary }}>{s.duration}</span>
                </button>
              ))}

            {showChangesTab && changes.length === 0 && (
              <p style={{ ...text.meta, padding: `${space[4]} 0` }}>아직 기록된 변화가 없어요</p>
            )}
            {showChangesTab &&
              changes.map((c, i) => (
                <div
                  key={i}
                  style={{
                    ...glassPanel({ radius: radius.sm, padding: `${space[4]} ${space[4]}` }),
                    flex: "none",
                    display: "flex",
                    gap: space[3],
                  }}
                >
                  {/* 성장 = 라일락 (MUST 03) — the one hue reserved for rare change. */}
                  <span
                    aria-hidden
                    style={{
                      width: 6,
                      height: 6,
                      marginTop: 7,
                      flex: "none",
                      borderRadius: "50%",
                      background: color.auroraViolet,
                    }}
                  />
                  <span style={{ display: "flex", flexDirection: "column", gap: space[1] }}>
                    <span style={{ ...text.body, color: color.textPrimary, fontSize: 14 }}>{c.desc}</span>
                    <span style={text.meta}>{c.meta}</span>
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {showDetail && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflowY: "auto",
            padding: `max(${space[5]}, env(safe-area-inset-top)) ${GUTTER}px ${space[6]}`,
          }}
        >
          <button
            type="button"
            onClick={goLog}
            style={{
              alignSelf: "flex-start",
              display: "flex",
              alignItems: "center",
              gap: space[1],
              minHeight: 44,
              padding: `0 ${space[3]} 0 0`,
              border: "none",
              background: "transparent",
              color: color.textTertiary,
              fontFamily: "var(--font-app)",
              fontSize: 13,
              fontWeight: 550,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
            기록
          </button>

          <h1 style={{ ...text.screenTitle, marginTop: space[4] }}>{detailTitle}</h1>
          {detailMeta && <p style={{ ...text.meta, marginTop: space[2] }}>{detailMeta}</p>}

          <div style={{ display: "flex", flexDirection: "column", gap: space[2], marginTop: space[6] }}>
            {[
              { label: "함께 머문 시간", value: detailDuration },
              { label: "가장 낮춘 밝기", value: detailMin },
              { label: "취침 신호", value: detailAck },
            ].map((row) => (
              <div
                key={row.label}
                style={{ ...glassPanel({ radius: radius.sm, padding: `${space[4]} ${space[4]}` }), ...ROW }}
              >
                <span style={text.label}>{row.label}</span>
                <span style={{ ...text.body, color: color.textPrimary, fontSize: 14 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
