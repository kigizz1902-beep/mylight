"use client";

import * as React from "react";
import Image from "next/image";
import { X } from "lucide-react";

import { RainWindow } from "@/components/dokkaebi/RainWindow";
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
 * So brightness is a cross-fade between two exposures of the same frame: the lamp
 * goes out in the photograph itself, spill and all, and nothing is drawn on top
 * pretending to be light.
 */
const PHOTO = { width: 2800, height: 2160, ratio: 2800 / 2160 };

/** The same frame, lit and unlit. Order matters: `off` is the plate, `on` fades in over it. */
const PHOTO_OFF = "/re/bed_2800x2160_light_off.webp";
const PHOTO_ON = "/re/bed_2800x2160_light_on.webp";

/**
 * Percentage of the *photograph*, not the pane, so the glow stays on the lantern
 * however much of the frame the crop throws away.
 *
 * Read off a 5% grid laid over the lit frame: the paper body runs x 41.5–53.5%,
 * y 32.5–54%, and the wire legs carry on to y 57.5%. `core` is the paper only —
 * stretch it past 54% and the light starts coming out of the legs and the shelf.
 */
const LANTERN = { x: 47.5, y: 43.25 };
const CORE = { width: 12, height: 21.5 };
const HALO_WIDTH = 32;

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
      {/* Pinned to its right edge so the window survives the crop on a narrower
        * screen — the weather has to read through it — and the left of the frame
        * goes instead. */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: 0,
          transform: "translateY(-50%)",
          width: `max(100cqw, ${(PHOTO.ratio * 100).toFixed(2)}cqh)`,
          aspectRatio: `${PHOTO.width} / ${PHOTO.height}`,
        }}
      >
        <Image src={PHOTO_OFF} alt="" fill priority sizes="100vw" style={{ objectFit: "cover" }} />

        {/* Dimming is a cross-fade between the two exposures rather than a grey wash
          * over one, so half-brightness still looks photographed. */}
        <Image
          src={PHOTO_ON}
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", opacity: glowOpacity, transition: "opacity .45s ease" }}
        />

        <RainWindow opacity={rainOpacity} />

        {/* The light the 도깨비불 casts. `screen` so these layers *add* to the
          * photograph's own light instead of painting a flat disc over it. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: `${LANTERN.x}%`,
            top: `${LANTERN.y}%`,
            width: `${HALO_WIDTH}%`,
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
            width: `${CORE.width}%`,
            height: `${CORE.height}%`,
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
          left: space[6],
          top: space[6],
          maxWidth: "min(320px, calc(100% - 48px))",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: space[2],
          textAlign: "left",
        }}
      >
        <span style={text.label}>나의 방 · {outputModeLabel}</span>
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
                왼쪽은 휴대폰 앱, 오른쪽은 나의 방입니다. 실제 전구·서버·날짜 없이 시간을 압축해,{" "}
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
