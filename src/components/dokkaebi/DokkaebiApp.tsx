"use client";

import { useDokkaebiApp } from "@/hooks/use-dokkaebi-app";
import { glassChrome, glassPill } from "@/lib/glass";
import { fmt, gwa, ord, stageFor } from "@/lib/dokkaebi";
import { RainBackground } from "@/components/ui/rain";
import { TestTool } from "@/components/dokkaebi/TestTool";
import { RoomScene } from "@/components/dokkaebi/RoomScene";
import { FirstMeet } from "@/components/dokkaebi/screens/FirstMeet";
import { NightHome } from "@/components/dokkaebi/screens/NightHome";
import { TonightRecord } from "@/components/dokkaebi/screens/TonightRecord";
import { HistoryLog } from "@/components/dokkaebi/screens/HistoryLog";
import { SettingsScreen } from "@/components/dokkaebi/screens/SettingsScreen";

/** No real light/hardware integration yet — see src/lib/light-controller.ts. */
const OUTPUT_MODE_LABEL = "가상 출력";
const SHOW_TEST_PANEL = process.env.NODE_ENV !== "production";

const SCENE_COPY: Record<string, [string, string]> = {
  discover: ["장면 1–2 · 비 오는 밤의 입구", "바깥의 비와 앱 속 세계가 같은 밤을 공유합니다. 공예 오브제는 아직 어둠 속 형태로만 남아 있습니다."],
  wake: ["장면 3 · 비를 피해 온 존재", "비는 날씨 정보가 아니라, 불씨가 이 공간을 찾아온 그날의 사정입니다."],
  name: ["장면 4–5 · 불씨 깨우기와 이름", "앱 속 불씨와 실제 공간의 빛이 같은 존재임을 이해하게 합니다."],
  record: ["장면 9 · 첫 번째 밤의 기록", "도깨비불은 어둠으로 돌아갔지만, 함께 보낸 밤은 관계의 시간으로 남습니다."],
  log: ["축적 확인 · 공백기 방어", "변화가 없어 보이는 기간에도 함께한 밤과 시간은 줄지 않고 쌓입니다."],
  settings: ["사용자 통제", "세계관보다 사용자의 선택과 수면이 먼저입니다."],
};

const NAV_BUTTON_STYLE = {
  flex: 1,
  // 44px floor keeps the bottom nav within the platform touch-target minimum.
  minHeight: 44,
  padding: "12px 0",
  fontSize: 12.5,
  fontFamily: "'Noto Sans KR',sans-serif",
  cursor: "pointer",
} as const;

export function DokkaebiApp() {
  const { state, actions } = useDokkaebiApp();

  const stage = stageFor(state.nights);
  const on = state.isOn;
  const glowOpacity = on ? 0.18 + (state.brightness / 100) * 0.82 : 0;
  const detail = state.sessions.find((x) => x.id === state.detailId);

  const isFirstMeet = state.screen === "discover" || state.screen === "wake" || state.screen === "name";
  const isHome = state.screen === "home";
  const isRecord = state.screen === "record";
  const isLogSection = state.screen === "log";
  const isSettings = state.screen === "settings";
  const showNav = isHome || isLogSection || isSettings;

  const stageLabel = stage.label;
  const totalTimeText = fmt(state.totalMinutes);
  const powerLabel = on ? "켜짐" : "꺼짐";
  const toggleJustify: "flex-end" | "flex-start" = on ? "flex-end" : "flex-start";

  const homeScene: [string, string] = on
    ? ["장면 6–7 · 나의 밤에 머물기", "요구하지 않고 곁에 머뭅니다. 밝기를 가장 낮게 내리면 한 번만, 아주 짧게 대답합니다."]
    : ["장면 8 · 동트기 전 작별", "지연도 잔광도 소리도 없이 즉시 어둠으로 돌아갑니다."];
  const [sceneLabel, sceneNote] = state.screen === "home" ? homeScene : SCENE_COPY[state.screen] ?? homeScene;

  const roomStatus =
    (state.rainy ? "비 오는 밤 · " : "맑은 밤 · ") +
    (on ? `${stageLabel} · 밝기 ${state.brightness}` : state.nights ? "오브제 실루엣만 남음" : "어둠 속 형태만 보임");

  const glowAnim = state.waking ? state.wakeAnimation : state.acking ? "ackPulse .9s ease-in-out" : "none";

  const sessionRows = state.sessions.map((x) => ({
    title: x.title,
    duration: fmt(x.minutes),
    meta: x.ack ? "취침 신호에 대답함" : "취침 신호 없음",
    open: () => actions.openDetail(x.id),
  }));

  const navHomeStyle = { ...NAV_BUTTON_STYLE, ...glassPill(state.screen === "home") };
  const navLogStyle = { ...NAV_BUTTON_STYLE, ...glassPill(state.screen === "log") };
  const navSetStyle = { ...NAV_BUTTON_STYLE, ...glassPill(state.screen === "settings") };

  const screenWrapperStyle = { flex: 1, minHeight: 0, position: "relative", display: "flex", flexDirection: "column" } as const;
  // Column direction so the screen stretches to the phone's full width. With the default
  // row direction each screen sized to its own content, which left-skewed every card and
  // button on the short-text screens (home, 기록, 첫 만남).
  const screenLayerStyle = { position: "absolute", inset: 0, display: "flex", flexDirection: "column" } as const;

  const screens = (
    <>
      {isFirstMeet && (
        <div style={screenWrapperStyle}>
          <div style={screenLayerStyle}>
            <FirstMeet
              step={state.screen as "discover" | "wake" | "name"}
              revealed={state.revealed}
              soilOpacity={1 - state.revealed}
              hintOpacity={state.revealed > 0.15 ? 0 : 0.8}
              nameDraft={state.nameDraft}
              onTap={actions.onTap}
              wake={actions.wake}
              onNameInput={actions.onNameInput}
              saveName={actions.saveName}
            />
          </div>
        </div>
      )}

      {isHome && (
        <div style={screenWrapperStyle}>
          <div style={screenLayerStyle}>
            <NightHome
              nightTitle={`${gwa(state.name)} 보내는 ${ord(state.nights)} 밤`}
              stageLabel={stageLabel}
              totalTimeText={totalTimeText}
              brightness={state.brightness}
              appEmberOpacity={on ? 1 : 0.22}
              isOn={on}
              powerLabel={powerLabel}
              powerSub={on ? "안정된 빛으로 머무는 중" : "탭하면 이 밤을 엽니다"}
              ackHint={!on ? "" : state.bedtimeAck ? "짧게 대답했습니다" : "가장 낮게 내리면 한 번 대답합니다"}
              toggleBg={on ? "#3b2a18" : "#151110"}
              toggleJustify={toggleJustify}
              sliderOpacity={on ? 1 : 0.4}
              sliderDisabled={!on}
              togglePower={actions.togglePower}
              onBrightness={actions.onBrightness}
            />
          </div>
        </div>
      )}

      {isRecord && (
        <div style={screenWrapperStyle}>
          <div style={screenLayerStyle}>
            <TonightRecord
              lastTitle={state.sessions[0]?.title ?? ""}
              lastDuration={state.sessions[0] ? fmt(state.sessions[0].minutes) : ""}
              goLog={actions.goLog}
              goHome={actions.goHome}
            />
          </div>
        </div>
      )}

      {isLogSection && (
        <div style={screenWrapperStyle}>
          <div style={screenLayerStyle}>
            <HistoryLog
              nights={state.nights}
              totalTimeText={totalTimeText}
              stageLabel={stageLabel}
              logTab={state.logTab}
              showDetail={!!state.detailId}
              sessions={sessionRows}
              changes={state.changes}
              detailTitle={detail ? detail.title : ""}
              // Generated nights are titled "N번째 밤" already — don't echo it as the subtitle.
              detailMeta={detail && detail.title !== `${ord(detail.no)} 밤` ? `${ord(detail.no)} 밤` : ""}
              detailDuration={detail ? fmt(detail.minutes) : ""}
              detailMin={detail ? `${detail.minBrightness}` : ""}
              detailAck={detail ? (detail.ack ? "한 번 대답함" : "없음") : ""}
              tabNights={() => actions.setLogTab("nights")}
              tabChanges={() => actions.setLogTab("changes")}
              goLog={actions.goLog}
            />
          </div>
        </div>
      )}

      {isSettings && (
        <div style={screenWrapperStyle}>
          <div style={screenLayerStyle}>
            <SettingsScreen
              nameDraft={state.nameDraft}
              onNameInput={actions.onNameInput}
              renameSave={actions.renameSave}
              outputModeLabel={OUTPUT_MODE_LABEL}
              connectionLabel="연결됨"
            />
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="dokkaebi-app" style={{ display: "flex", minHeight: "100vh", background: "#080706" }}>
      <div
        style={{
          width: 520,
          flex: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          padding: "34px 0 28px",
          borderRight: "1px solid #17130f",
          background: "linear-gradient(180deg,#0b0a08,#080706)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, letterSpacing: "0.16em", color: "#6a5f52" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8894a", display: "block" }} />
          <span>앱 — 관계를 이해하는 창구</span>
        </div>

        <div
          style={{
            position: "relative",
            width: 392,
            height: 794,
            borderRadius: 46,
            border: "1px solid #221c16",
            background: "#0c0a09",
            boxShadow: "0 40px 90px rgba(0,0,0,.7), inset 0 0 0 6px #0a0908",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 26px 4px",
              fontSize: 12,
              color: "#7b6f60",
              flex: "none",
            }}
          >
            <span>{state.clock}</span>
            <span style={{ letterSpacing: "0.1em" }}>•••  ▮</span>
          </div>

          <div style={{ flex: 1, minHeight: 0, position: "relative", display: "flex", flexDirection: "column" }}>
            {state.rainy ? (
              <RainBackground
                intensity={0.3}
                dropSize={{ min: 14, max: 34 }}
                angle={8}
                lightningEnabled
                lightningFrequency={0.6}
                className="flex flex-1 flex-col"
              >
                {screens}
              </RainBackground>
            ) : (
              screens
            )}
          </div>

          {showNav && (
            <nav
              aria-label="주요 화면"
              style={{ flex: "none", display: "flex", gap: 8, padding: "10px 20px 22px", ...glassChrome() }}
            >
              <button
                onClick={actions.goHome}
                aria-current={state.screen === "home" ? "page" : undefined}
                style={navHomeStyle}
              >
                오늘 밤
              </button>
              <button
                onClick={actions.goLog}
                aria-current={state.screen === "log" ? "page" : undefined}
                style={navLogStyle}
              >
                기록
              </button>
              <button
                onClick={actions.goSettings}
                aria-current={state.screen === "settings" ? "page" : undefined}
                style={navSetStyle}
              >
                설정
              </button>
            </nav>
          )}
        </div>

        {SHOW_TEST_PANEL && (
          <TestTool
            rainBg={state.rainy ? "#1b1a18" : "#141110"}
            rainFg={state.rainy ? "#a9c0d0" : "#7d7365"}
            rainBorder={state.rainy ? "#2f3a42" : "#2a221a"}
            nextNight={actions.nextNight}
            jumpSeven={actions.jumpSeven}
            jumpThirty={actions.jumpThirty}
            toggleRain={actions.toggleRain}
            reset={actions.reset}
          />
        )}
      </div>

      <RoomScene
        rainOpacity={state.rainy ? 1 : 0}
        glowOpacity={glowOpacity}
        glowAnim={glowAnim}
        outputModeLabel={OUTPUT_MODE_LABEL}
        roomStatus={roomStatus}
        sceneLabel={sceneLabel}
        sceneNote={sceneNote}
        showAbout={state.showAbout}
        openAbout={actions.openAbout}
        closeAbout={actions.closeAbout}
      />
    </div>
  );
}
