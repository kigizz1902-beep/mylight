"use client";

import * as React from "react";
import { X } from "lucide-react";

import { color, radius, space, text } from "@/lib/design";
import { glassButton, glassPanel, glassScrim, innerGlow } from "@/lib/glass";

interface RoomSceneProps {
  rainOpacity: number;
  glowOpacity: number;
  glowAnim: string;
  outputModeLabel: string;
  roomStatus: string;
  sceneLabel: string;
  sceneNote: string;
  showAbout: boolean;
  openAbout: () => void;
  closeAbout: () => void;
}

/**
 * The room is *space*, so it is cool and near-black throughout (MUST 03): every
 * surface here is drawn from the night tokens, and the only warm colour in the
 * whole panel is the light the 도깨비불 casts. The two amber pane tints are that
 * same light reflected — a glow with a visible source, per MUST 04.
 */
const WINDOW_PANES = [
  { rainDuration: "1.9s", tint: "linear-gradient(160deg,rgba(72,98,117,.12),transparent 62%)" },
  { rainDuration: "2.3s", tint: "linear-gradient(160deg,rgba(72,98,117,.10),transparent 62%)" },
  { rainDuration: "2.1s", tint: "linear-gradient(20deg,rgba(233,155,69,.05),transparent 55%)" },
  { rainDuration: "1.7s", tint: "linear-gradient(20deg,rgba(233,155,69,.06),transparent 55%)" },
];

const ABOUT_CARDS = [
  {
    title: "불씨를 발견하고 이름을 짓습니다",
    body: "젖은 흙을 쓸어 기척을 찾고, 깨우면 실제 공간에 빛이 들어옵니다. 이름이 생기는 순간 조명은 나의 존재가 됩니다.",
  },
  {
    title: "조명 사용이 그대로 대화가 됩니다",
    body: "밝기를 가장 낮게 내리면 “이제 잘 거야”라는 신호가 되고, 도깨비불은 1초 안에 아주 짧게 한 번 대답합니다.",
  },
  {
    title: "밤이 쌓이면 결이 달라집니다",
    body: "첫 만남 · 3번째 밤 익숙해짐 · 7번째 밤 기억 시작 · 30번째 밤 성격 형성 · 100번째 밤 도깨비가 깃듦. 변화는 알림이 아니라 켜지는 순간에 먼저 발견됩니다.",
  },
  {
    title: "부재를 벌하지 않습니다",
    body: "연속 출석·알림·죽음·삐침이 없습니다. 며칠 쓰지 않아도 함께한 밤과 시간은 줄지 않습니다. 소등은 잔광 없이 즉시 끝납니다.",
  },
];

export function RoomScene({
  rainOpacity,
  glowOpacity,
  glowAnim,
  outputModeLabel,
  roomStatus,
  sceneLabel,
  sceneNote,
  showAbout,
  openAbout,
  closeAbout,
}: RoomSceneProps) {
  // Escape closes the overlay — previously the ✕ button was the only way out.
  React.useEffect(() => {
    if (!showAbout) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeAbout();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showAbout, closeAbout]);

  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        background: `radial-gradient(120% 90% at 62% 78%, ${color.night850}, ${color.night950} 70%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "6%",
          top: "7%",
          width: 300,
          height: 390,
          borderRadius: "8px 8px 4px 4px",
          background: color.night900,
          border: `1px solid ${color.glassBorderSoft}`,
          boxShadow: "var(--shadow-card), inset 0 0 0 1px rgba(255,255,255,.02)",
          padding: 14,
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: space[3],
        }}
      >
        {WINDOW_PANES.map((pane, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 3,
              background: `linear-gradient(180deg, ${color.night850}, ${color.night950})`,
              boxShadow: "inset 0 0 22px rgba(0,0,0,.7)",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "repeating-linear-gradient(102deg,rgba(120,150,175,.12) 0 1px,transparent 1px 24px)",
                animation: `rainfall ${pane.rainDuration} linear infinite`,
                opacity: rainOpacity,
                transition: "opacity .5s ease",
              }}
            />
            <div aria-hidden style={{ position: "absolute", inset: 0, background: pane.tint }} />
          </div>
        ))}
      </div>

      {/* Window sill */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "calc(6% - 14px)",
          top: "calc(7% + 390px)",
          width: 328,
          height: 12,
          borderRadius: 2,
          background: `linear-gradient(180deg, ${color.night800}, ${color.night900})`,
          boxShadow: "0 10px 24px rgba(0,0,0,.55)",
        }}
      />

      {/* Floor and table */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "34%",
          background: `linear-gradient(180deg, ${color.night900}, ${color.night950})`,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          bottom: "34%",
          width: 520,
          height: 14,
          marginLeft: -260,
          borderRadius: 3,
          background: color.night800,
        }}
      />

      {/* The craft object and the light it casts — the only warmth in the room. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "calc(34% + 14px)",
          marginLeft: -90,
          width: 180,
          height: 220,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: -40,
            width: 520,
            height: 420,
            left: "50%",
            marginLeft: -260,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(233,155,69,.42), rgba(233,155,69,0) 62%)",
            opacity: glowOpacity,
            animation: glowAnim,
            transition: "opacity .35s ease",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "relative",
            width: 120,
            height: 150,
            borderRadius: "60px 60px 26px 26px",
            background: `linear-gradient(180deg, ${color.night800}, ${color.night950})`,
            boxShadow: "inset 0 -20px 40px rgba(0,0,0,.6)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 56,
            width: 60,
            height: 80,
            borderRadius: "50% 50% 40% 40%",
            background: `radial-gradient(circle at 50% 65%, ${color.flameCore}, rgba(233,155,69,.25) 70%, transparent)`,
            opacity: glowOpacity,
            animation: glowAnim,
            transition: "opacity .35s ease",
          }}
        />
      </div>

      {/* System Card (§7.3E) — the technical readout, so the quietest surface here. */}
      <div
        style={{
          // glassPanel sets `position: relative` so innerGlow children have a
          // containing block, so it must be spread *before* this panel's own
          // absolute placement — not after, or it silently pins the card to the
          // top-left of the room.
          ...glassPanel({ radius: radius.md, padding: space[5], tone: "quiet" }),
          position: "absolute",
          right: space[6],
          top: space[6],
          maxWidth: "min(320px, calc(100% - 48px))",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: space[2],
          textAlign: "right",
        }}
      >
        <span style={text.label}>생활 공간 시뮬레이션 · {outputModeLabel}</span>
        <span style={{ ...text.meta, color: color.textSecondary }}>{roomStatus}</span>
        <button
          type="button"
          onClick={openAbout}
          className="pressable"
          style={{ ...glassButton("ghost"), marginTop: space[1], minHeight: 44, fontSize: 13 }}
        >
          더 알아보기
        </button>
      </div>

      {showAbout && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="반려 도깨비불 소개"
          // Clicking the scrim dismisses, matching the blur-means-dismissable convention.
          onClick={closeAbout}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 48,
            zIndex: 5,
            animation: "fadeUp .35s ease both",
            ...glassScrim(),
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 760,
              maxHeight: "100%",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: space[8],
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: space[6] }}>
              <div style={{ display: "flex", flexDirection: "column", gap: space[3] }}>
                <span style={text.label}>반려 도깨비불 · A버전 시나리오 프로토타입</span>
                {/* The one largest text in this dialog (§9.3). */}
                <p style={{ ...text.screenTitle, fontSize: 31, lineHeight: 1.4 }}>
                  오래 쓴 시간으로
                  <br />
                  도깨비가 되어가는 조명
                </p>
              </div>
              <button
                type="button"
                onClick={closeAbout}
                aria-label="닫기"
                className="pressable"
                style={{
                  ...glassButton("ghost"),
                  flex: "none",
                  width: 44,
                  height: 44,
                  minHeight: 44,
                  padding: 0,
                  borderRadius: "50%",
                  color: color.textSecondary,
                }}
              >
                <X size={17} strokeWidth={1.75} aria-hidden />
              </button>
            </div>

            <p style={{ ...text.body, fontSize: 15, lineHeight: 1.9 }}>
              집 안의 사물은 함께 보낸 시간을 기억하지 않습니다. 반려 도깨비불은 공예 조명 오브제와 앱이 결합된 반려형 테이블 조명으로, 별도의 돌봄 없이{" "}
              <span style={{ color: color.textPrimary }}>매일 하던 대로 빛을 켜고 낮추고 끄는 동안</span> 함께한 밤이 쌓이고, 그 시간이 도깨비의 성격과
              반응이 됩니다. 한국의 도깨비는 오래 쓴 물건에 깃들기에, 이 조명은 아직 도깨비가 아닌 채로 도착합니다.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: space[3] }}>
              {ABOUT_CARDS.map((item) => (
                <div
                  key={item.title}
                  style={{
                    ...glassPanel({ radius: radius.md, padding: space[5] }),
                    display: "flex",
                    flexDirection: "column",
                    gap: space[2],
                  }}
                >
                  <span style={text.cardTitle}>{item.title}</span>
                  <span style={{ ...text.body, fontSize: 13.5, lineHeight: 1.75 }}>{item.body}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                ...glassPanel({ radius: radius.md, padding: space[6] }),
                display: "flex",
                flexDirection: "column",
                gap: space[3],
              }}
            >
              <span aria-hidden style={innerGlow("blue", { strength: 0.14, corner: "top-right" })} />
              <span style={text.label}>지금 보고 있는 화면</span>
              <span style={{ ...text.body, fontSize: 13.5, lineHeight: 1.8 }}>
                왼쪽은 휴대폰 앱, 오른쪽은 생활 공간 시뮬레이션입니다. 실제 전구·서버·날짜 없이 시간을 압축해,{" "}
                <span style={{ color: color.textPrimary }}>앱 조작 → 공간의 빛 반응 → 시간의 축적</span>이 하나의 경험으로 이해되는지를 검증합니다.
              </span>
            </div>

            <button
              type="button"
              onClick={closeAbout}
              className="pressable"
              style={{ ...glassButton("primary"), alignSelf: "flex-start" }}
            >
              첫 번째 밤으로 돌아가기
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          left: 34,
          bottom: 28,
          maxWidth: 430,
          display: "flex",
          flexDirection: "column",
          gap: space[2],
        }}
      >
        <span style={text.label}>{sceneLabel}</span>
        <p style={{ ...text.body, fontSize: 14, lineHeight: 1.75 }}>{sceneNote}</p>
      </div>
    </div>
  );
}
