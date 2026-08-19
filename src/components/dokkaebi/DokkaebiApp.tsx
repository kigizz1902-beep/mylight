"use client";

import { useDokkaebiApp } from "@/hooks/use-dokkaebi-app";
import { color, space, text } from "@/lib/design";
import { glassScrim } from "@/lib/glass";
import {
  fmt,
  fmtCompact,
  getBrightnessPreferenceSentence,
  getWeatherSummarySentence,
  gwa,
  moodFor,
  neun,
  nextStageFor,
  ord,
  stageFor,
  stageProgress,
} from "@/lib/dokkaebi";
import { RainBackground } from "@/components/ui/rain";
import { TestTool } from "@/components/dokkaebi/TestTool";
import { RoomScene } from "@/components/dokkaebi/RoomScene";
import { BottomNav } from "@/components/dokkaebi/BottomNav";
import { FirstMeet } from "@/components/dokkaebi/screens/FirstMeet";
import { NightHome, type WeekPoint } from "@/components/dokkaebi/screens/NightHome";
import { TonightRecord } from "@/components/dokkaebi/screens/TonightRecord";
import { HistoryLog } from "@/components/dokkaebi/screens/HistoryLog";
import { SettingsScreen } from "@/components/dokkaebi/screens/SettingsScreen";

/** No real light/hardware integration yet — see src/lib/light-controller.ts. */
const OUTPUT_MODE_LABEL = "가상 출력";
/** Kept on in production too — the deployed link doubles as the demo rig. */
const SHOW_TEST_PANEL = true;

/** §13.4 — the memory card covers the last seven nights. */
const WEEK_LENGTH = 7;

const SCENE_COPY: Record<string, [string, string]> = {
  discover: ["장면 1–2 · 비 오는 밤의 입구", "바깥의 비와 앱 속 세계가 같은 밤을 공유합니다. 공예 오브제는 아직 어둠 속 형태로만 남아 있습니다."],
  wake: ["장면 3 · 비를 피해 온 존재", "비는 날씨 정보가 아니라, 불씨가 이 공간을 찾아온 그날의 사정입니다."],
  name: ["장면 4–5 · 불씨 깨우기와 이름", "앱 속 불씨와 실제 공간의 빛이 같은 존재임을 이해하게 합니다."],
  record: ["장면 9 · 첫 번째 밤의 기록", "도깨비불은 어둠으로 돌아갔지만, 함께 보낸 밤은 관계의 시간으로 남습니다."],
  log: ["축적 확인 · 공백기 방어", "변화가 없어 보이는 기간에도 함께한 밤과 시간은 줄지 않고 쌓입니다."],
  settings: ["사용자 통제", "세계관보다 사용자의 선택과 수면이 먼저입니다."],
};

export function DokkaebiApp() {
  const { state, actions } = useDokkaebiApp();

  const stage = stageFor(state.nights);
  const nextStage = nextStageFor(state.nights);
  const on = state.isOn;
  const glowOpacity = on ? 0.18 + (state.brightness / 100) * 0.82 : 0;
  const detail = state.sessions.find((x) => x.id === state.detailId);

  const isFirstMeet = state.screen === "discover" || state.screen === "wake" || state.screen === "name";
  const isHome = state.screen === "home";
  const isRecord = state.screen === "record";
  const isLogSection = state.screen === "log";
  const isSettings = state.screen === "settings";
  const showNav = isHome || isLogSection || isSettings;

  const totalTimeText = fmt(state.totalMinutes);

  /**
   * A stage boundary reached on this very night is the 특별한 성장 state (§14) —
   * the flame swells once while the light is settling. Night 1 is excluded: the
   * first meeting has its own scene and shouldn't open with a growth message.
   */
  const celebrating = state.waking && state.nights > 1 && stage.at === state.nights;

  const mood = moodFor({
    nights: state.nights,
    isOn: on,
    brightness: state.brightness,
    bedtimeAck: state.bedtimeAck,
    celebrating,
    tonightEmotionChoice: state.tonightEmotionChoice,
    followUpAnswered: state.followUpAnswer !== null,
  });

  // SCENE 12 — the app-side flame reshapes once night 30 is reached; the room's
  // colour tint follows the same threshold (RoomScene below).
  const flameTemperament = state.nights >= 30 ? "water" : "none";
  const temperamentData =
    state.nights >= 30
      ? {
          weatherSentence: getWeatherSummarySentence(state.sessions),
          brightnessSentence: getBrightnessPreferenceSentence(state.sessions),
          closingLine: `${neun(state.name)} 비를 오래 머금은 불이 되었습니다.`,
        }
      : null;

  // §13.4 — the newest seven nights, oldest first so the trace reads left to right.
  const week: WeekPoint[] = state.sessions
    .slice(0, WEEK_LENGTH)
    .map((s) => ({ label: s.title, minutes: s.minutes }))
    .reverse();

  const homeScene: [string, string] = on
    ? ["장면 6–7 · 나의 밤에 머물기", "요구하지 않고 곁에 머뭅니다. 밝기를 가장 낮게 내리면 한 번만, 아주 짧게 대답합니다."]
    : ["장면 8 · 동트기 전 작별", "지연도 잔광도 소리도 없이 즉시 어둠으로 돌아갑니다."];
  const [sceneLabel, sceneNote] = state.screen === "home" ? homeScene : SCENE_COPY[state.screen] ?? homeScene;

  // The room panel narrates the state in the same words the app uses (§14).
  const roomStatus =
    (state.rainy ? "비 오는 밤 · " : "맑은 밤 · ") +
    (on ? `${mood.tag} · 밝기 ${state.brightness}` : state.nights ? "오브제 실루엣만 남음" : "어둠 속 형태만 보임");

  const glowAnim = state.waking ? state.wakeAnimation : state.acking ? "ackPulse .9s ease-in-out" : "none";

  const sessionRows = state.sessions.map((x) => ({
    title: x.title,
    duration: fmt(x.minutes),
    meta: x.ack ? "취침 신호에 대답함" : "취침 신호 없음",
    open: () => actions.openDetail(x.id),
  }));

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
              nightLabel={`${ord(state.nights)} 밤`}
              greeting={state.rainy ? "비가 오는 밤이에요" : "조용한 밤이에요"}
              mood={mood}
              // §15.1's breath is a class on the flame; this slot is only for the
              // one-off bedtime acknowledgement dip.
              flameAnimation={
                state.acking || state.followUpGlow ? "ackPulse .9s ease-in-out" : undefined
              }
              togetherSentence={
                state.nights === 0
                  ? "곧 첫 밤이 시작돼요"
                  : state.totalMinutes === 0
                    // Nothing has accumulated yet, and "0분을 함께했어요" reads as a
                    // failure rather than a beginning.
                    ? `${gwa(state.name)} 이 밤을 시작했어요`
                    : `${gwa(state.name)} ${totalTimeText}을 함께했어요`
              }
              togetherCompact={fmtCompact(state.totalMinutes)}
              nights={state.nights}
              growth={{
                label: stage.label,
                progress: stageProgress(state.nights),
                nightsAway: nextStage ? nextStage.at - state.nights : null,
              }}
              week={week}
              brightness={state.brightness}
              isOn={on}
              ackHint={!on ? "" : state.bedtimeAck ? "짧게 대답했습니다" : "가장 낮게 내리면 한 번 대답합니다"}
              togglePower={actions.togglePower}
              onBrightness={actions.onBrightness}
              openLog={actions.goLog}
              showEmotionQuestion={!state.emotionAskedTonight}
              onAnswerEmotion={actions.answerEmotion}
              onSkipEmotionQuestion={actions.skipEmotionQuestion}
              showFollowUpQuestion={state.showFollowUp}
              onAnswerFollowUp={actions.answerFollowUp}
              onSkipFollowUp={actions.skipFollowUp}
              flameTemperament={flameTemperament}
              temperament={temperamentData}
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
              stageLabel={stage.label}
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
    // The body carries the Night Space and Ambient Light layers (§3, §6.1), so the
    // shell stays transparent instead of painting its own flat black over them.
    <div className="dokkaebi-app" style={{ display: "flex", minHeight: "100dvh" }}>
      <div
        style={{
          // §4.1 — the app shell is 520px on desktop, with the room beside it.
          width: 520,
          flex: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: space[5],
          padding: "34px 0 28px",
          borderRight: `1px solid ${color.glassBorderSoft}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: space[2], ...text.label }}>
          <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: color.flameDeep }} />
          <span style={{ letterSpacing: "0.04em" }}>앱 — 관계를 이해하는 창구</span>
        </div>

        <div
          style={{
            position: "relative",
            width: 392,
            height: 794,
            // A device bezel, not a card: §MUST 06's 24–28px range governs cards, and
            // a phone body needs its own much larger corner to read as hardware.
            borderRadius: 46,
            border: `1px solid ${color.glassBorder}`,
            background: color.night950,
            // Black-only shadows, per §7.2 — depth without introducing a colour.
            boxShadow: "0 40px 90px rgba(0,0,0,.7), inset 0 0 0 6px rgba(0,0,0,.55)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: "none",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: `${space[4]} ${space[6]} 0`,
              ...text.meta,
            }}
          >
            <span>{state.clock}</span>
            <span aria-hidden style={{ letterSpacing: "0.1em" }}>•••  ▮</span>
          </div>

          <div style={{ flex: 1, minHeight: 0, position: "relative", display: "flex", flexDirection: "column" }}>
            {state.rainy ? (
              <RainBackground
                intensity={0.3}
                dropSize={{ min: 14, max: 34 }}
                angle={8}
                // §MUST 03 — the rain is the night's space, so it stays blue-grey.
                color="var(--rain-blue)"
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
            <BottomNav
              screen={state.screen}
              goHome={actions.goHome}
              goLog={actions.goLog}
              goSettings={actions.goSettings}
            />
          )}

          {/* SCENE 9's accumulation cut — nothing has changed yet, so the room and
              flame stay exactly as they were underneath this note. */}
          {state.showAccumulationNote && (
            <div
              aria-live="polite"
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: space[8],
                textAlign: "center",
                ...glassScrim(),
                animation: "fadeUp .35s ease both",
              }}
            >
              <p style={{ ...text.cardTitle, color: color.textSecondary }}>
                아직 달라진 건 없어요. 다만 쌓이고 있어요.
              </p>
            </div>
          )}

          {/* SCENE 12-B — the app stays dark for a beat so the room's light (already
              updated below) is what the user notices first (스토리보드 6장 조건 7). */}
          {state.appDimmed && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 6,
                background: color.night950,
                transition: "opacity 1.2s ease",
              }}
            />
          )}
        </div>

        {SHOW_TEST_PANEL && (
          <TestTool
            rainy={state.rainy}
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
        temperament={flameTemperament}
        showAbout={state.showAbout}
        openAbout={actions.openAbout}
        closeAbout={actions.closeAbout}
      />
    </div>
  );
}
