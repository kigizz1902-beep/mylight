"use client";

import * as React from "react";
import Image from "next/image";
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
  /** SCENE 12-B — "water" tints the cast light cooler, before the app ever reveals why (스토리보드 6장 조건 7). */
  temperament?: "none" | "water";
  showAbout: boolean;
  openAbout: () => void;
  closeAbout: () => void;
}

/**
 * The room is a photograph now, not drawn geometry. It still has to obey MUST 03
 * (the room is cool, near-black space) and MUST 04 (warm light only where a
 * visible source explains it) — which is exactly why the lamp is *not* cut out of
 * the picture. Its spill on the wall, the fig leaves and the shelf is baked into
 * the pixels; erase the lamp and that spill becomes light with no source.
 *
 * So brightness is a cross-fade between two exposures of the same frame, and the
 * CSS layers on top only *add* to what the photograph already shows.
 */
const PHOTO_RATIO = 1600 / 1011;

/**
 * Geometry is expressed in percentages of the *photograph*, never of the pane, so
 * the rain stays inside the window and the glow stays on the lantern no matter how
 * much of the frame the crop throws away.
 *
 * Measured, not eyeballed: the lit lantern's blown-out paper occupies 155×259px at
 * (686, 332) in the 1600×1011 frame.
 */
const LANTERN = { x: 47.8, y: 45.6 };
const WINDOW_GLASS = { left: 73.5, top: 0, width: 26.5, height: 45.5 };

/**
 * Brightness cross-fades two exposures of the same frame, so the two files must be
 * pixel-identical everywhere except the lamp and its spill — same crop, same size,
 * edited in place rather than regenerated. Any drift between them shows up as the
 * whole room swimming while the slider moves.
 *
 * Until the lights-out frame lands, the lit one is graded down to stand in for it.
 * Switch `src` and set `filter` to "none" together, or the real photo is darkened
 * twice over.
 */
const OFF_PHOTO = {
  src: "/bed.webp",
  filter: "brightness(.40) saturate(.5) hue-rotate(-6deg) contrast(1.05)",
};

/** Two speeds, because a single rate reads as a moving texture rather than rain. */
const RAIN_LAYERS = [
  { duration: "1.9s", gap: 26, opacity: 0.5, streak: "rgba(150,180,205,.16)" },
  { duration: "1.4s", gap: 17, opacity: 0.35, streak: "rgba(150,180,205,.10)" },
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
  temperament = "none",
  showAbout,
  openAbout,
  closeAbout,
}: RoomSceneProps) {
  const isWater = temperament === "water";
  const haloGradient = isWater
    ? "radial-gradient(circle, rgba(140,178,196,.34), rgba(233,155,69,.16) 46%, transparent 66%)"
    : "radial-gradient(circle, rgba(233,155,69,.42), rgba(233,155,69,0) 62%)";
  const coreGradient = isWater
    ? `radial-gradient(circle at 50% 65%, ${color.flameCore}, rgba(114,150,168,.30) 55%, transparent 78%)`
    : `radial-gradient(circle at 50% 65%, ${color.flameCore}, rgba(233,155,69,.25) 70%, transparent)`;
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
        // cq units below measure this pane, so the photograph's cover maths never
        // has to guess at the viewport or at the 520px shell beside it.
        containerType: "size",
        background: color.night950,
      }}
    >
      {/* The photograph is pinned to its right edge, because the window is the one
        * element the scene cannot lose — rain, weather and SCENE 1–2 all read
        * through it. On a narrower screen the crop eats the left of the frame (bed
        * frame, wall lamp) instead, which costs the scene nothing. */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: 0,
          transform: "translateY(-50%)",
          width: `max(100cqw, ${(PHOTO_RATIO * 100).toFixed(2)}cqh)`,
          aspectRatio: "1600 / 1011",
        }}
      >
        <Image src={OFF_PHOTO.src} alt="" fill priority sizes="100vw" style={{ objectFit: "cover", filter: OFF_PHOTO.filter }} />

        {/* Dimming is a cross-fade between two exposures of the same frame rather
          * than a grey wash over one, so half-brightness still looks photographed. */}
        <Image
          src="/bed.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", opacity: glowOpacity, transition: "opacity .45s ease" }}
        />

        {/* Rain belongs to the glass, so it is clipped to the window rather than
          * drifting over the whole room. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: `${WINDOW_GLASS.left}%`,
            top: `${WINDOW_GLASS.top}%`,
            width: `${WINDOW_GLASS.width}%`,
            height: `${WINDOW_GLASS.height}%`,
            overflow: "hidden",
            opacity: rainOpacity,
            transition: "opacity .6s ease",
            pointerEvents: "none",
          }}
        >
          {RAIN_LAYERS.map((layer) => (
            <div
              key={layer.duration}
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `repeating-linear-gradient(100deg, ${layer.streak} 0 1px, transparent 1px ${layer.gap}px)`,
                animation: `rainfall ${layer.duration} linear infinite`,
                opacity: layer.opacity,
              }}
            />
          ))}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(72,98,117,.20), transparent 72%)" }} />
        </div>

        {/* The light the 도깨비불 casts. `screen` so these layers *add* to the
          * photograph's own light instead of painting a flat disc over it. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: `${LANTERN.x}%`,
            top: `${LANTERN.y}%`,
            width: "36%",
            aspectRatio: "1 / 1",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: haloGradient,
            opacity: glowOpacity,
            animation: glowAnim,
            transition: "background 1.4s ease, opacity .35s ease",
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: `${LANTERN.x}%`,
            top: `${LANTERN.y}%`,
            width: "11%",
            height: "26%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50% 50% 42% 42%",
            background: coreGradient,
            opacity: glowOpacity,
            animation: glowAnim,
            transition: "background 1.4s ease, opacity .35s ease",
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* The photograph is brighter than the drawn room it replaced, so the glass
        * panels need their ground darkened back down where they actually sit. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(92% 72% at 50% 54%, transparent, rgba(6,8,12,.5) 100%)," +
            "linear-gradient(180deg, rgba(6,8,12,.44), transparent 24%, transparent 68%, rgba(6,8,12,.52))",
        }}
      />

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
