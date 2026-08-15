"use client";

import * as React from "react";
import type { ChangeEvent } from "react";

import { hasJong, isLowBrightnessNight, isRainyNight, ord, preferredBrightness, stageFor } from "@/lib/dokkaebi";
import type { ChangeEntry, NightSession } from "@/lib/dokkaebi";

/** SCENE 6 구현 메모 — brightness at/under this reads as "낮은 빛에 머묾" for SCENE 12's preference sentence. */
const LOW_BRIGHTNESS_THRESHOLD = 35;

export type ScreenName = "discover" | "wake" | "name" | "home" | "record" | "log" | "settings";

interface DokkaebiState {
  screen: ScreenName;
  revealed: number;
  name: string;
  nameDraft: string;
  nights: number;
  totalMinutes: number;
  isOn: boolean;
  brightness: number;
  bedtimeAck: boolean;
  sessions: NightSession[];
  changes: ChangeEntry[];
  logTab: "nights" | "changes";
  detailId: string | null;
  startedAt: number | null;
  waking: boolean;
  // The animation `waking` should play — real power-on uses the growth-stage wakePattern;
  // the test tool's night-jump/rain-toggle buttons use a single, explicitly-timed blink.
  wakeAnimation: string;
  acking: boolean;
  clock: string;
  rainy: boolean;
  showAbout: boolean;
  /** The very first ever answer to the SCENE 4 emotion question — remembered permanently for the SCENE 7 recall question. */
  firstEmotionAnswer: string | null;
  /** This session's emotion-question answer, or null if unasked/skipped. Resets every time the light is turned on. */
  tonightEmotionChoice: string | null;
  /** Whether the emotion question card has been shown (answered or dismissed) this session, so it doesn't reappear. */
  emotionAskedTonight: boolean;
  /** Answer to the SCENE 7 "아까 지쳤다고 했지. 지금은 어때?" follow-up, or null if unasked/skipped. */
  followUpAnswer: string | null;
  /** Whether the follow-up card is currently visible — appears a beat after the FR-04 bedtime pulse, never at the same instant, so the two responses read as separate. */
  showFollowUp: boolean;
  /** Whether the follow-up has been shown (answered or skipped) this session, so it never reappears. */
  followUpAsked: boolean;
  /** One-off brightening flash for "조금 편해졌어" before the light settles back to sleep dim. */
  followUpGlow: boolean;
  /** The last brightness the user settled on during ordinary living (i.e. before the bedtime dip) — SCENE 12's preference sentence reads from this, not the forced sleep minimum. */
  livingBrightnessSample: number;
  /** SCENE 9's accumulation cut — visible for a beat while a multi-night jump has recorded nights but not yet revealed anything. */
  showAccumulationNote: boolean;
  /** SCENE 12-B — while true, the app panel stays dark so the room's light is seen first (스토리보드 6장 조건 7). */
  appDimmed: boolean;
}

const INITIAL_STATE: DokkaebiState = {
  screen: "discover",
  revealed: 0,
  name: "",
  nameDraft: "",
  nights: 0,
  totalMinutes: 0,
  isOn: false,
  brightness: 45,
  bedtimeAck: false,
  sessions: [],
  changes: [],
  logTab: "nights",
  detailId: null,
  startedAt: null,
  waking: false,
  wakeAnimation: "",
  acking: false,
  clock: "23:14",
  rainy: true,
  showAbout: false,
  firstEmotionAnswer: null,
  tonightEmotionChoice: null,
  emotionAskedTonight: false,
  followUpAnswer: null,
  showFollowUp: false,
  followUpAsked: false,
  followUpGlow: false,
  livingBrightnessSample: 45,
  showAccumulationNote: false,
  appDimmed: false,
};

export function useDokkaebiApp() {
  const [state, setState] = React.useState<DokkaebiState>(INITIAL_STATE);
  const timeoutsRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const schedule = (fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  };

  const startSession = () => {
    setState((s) => ({
      ...s,
      isOn: true,
      waking: true,
      wakeAnimation: `wakePattern ${stageFor(s.nights).wake} ease-out both`,
      bedtimeAck: false,
      startedAt: Date.now(),
      brightness: 45,
      tonightEmotionChoice: null,
      emotionAskedTonight: false,
      followUpAnswer: null,
      showFollowUp: false,
      followUpAsked: false,
      followUpGlow: false,
      livingBrightnessSample: 45,
      showAccumulationNote: false,
      appDimmed: false,
    }));
    schedule(() => setState((s) => ({ ...s, waking: false })), 2600);
  };

  // Five taps fully reveal the ember, matching the click-to-wake pattern in RainyNightEncounter.
  const TAP_STEP = 1 / 5;

  const onTap = () => {
    setState((s) => {
      if (s.revealed >= 1) return s;
      const next = Math.min(1, s.revealed + TAP_STEP);
      if (next >= 1) schedule(() => setState((s2) => ({ ...s2, screen: "wake" })), 700);
      return { ...s, revealed: next };
    });
  };

  const wake = () => {
    startSession();
    setState((s) => ({ ...s, screen: "name" }));
  };

  const saveName = () => {
    setState((s) => {
      const nm = s.nameDraft.trim() || "도깨비불";
      const changes: ChangeEntry[] = [
        { id: "c0", desc: `${nm}${hasJong(nm) ? "이라는" : "라는"} 이름이 생겼습니다`, meta: "첫 번째 밤 · 첫 만남" },
      ];
      return { ...s, name: nm, nameDraft: nm, nights: 1, changes, screen: "home" };
    });
  };

  const renameSave = () => {
    setState((s) => {
      const nm = s.nameDraft.trim();
      return nm ? { ...s, name: nm } : s;
    });
  };

  const onNameInput = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setState((s) => ({ ...s, nameDraft: value }));
  };

  // Only the very first ever answer is remembered permanently (for the SCENE 7
  // recall question); every answer updates tonight's choice, which drives the
  // SCENE 5 resting mood for the rest of this session.
  const answerEmotion = (choice: string) => {
    setState((s) => ({
      ...s,
      tonightEmotionChoice: choice,
      emotionAskedTonight: true,
      firstEmotionAnswer: s.firstEmotionAnswer ?? choice,
    }));
  };

  const skipEmotionQuestion = () => {
    setState((s) => ({ ...s, emotionAskedTonight: true }));
  };

  // SCENE 7's memory question: distinct from the FR-04 pulse, and staggered a
  // beat after it (스토리보드 주의: 두 반응이 하나로 뭉쳐 보이지 않게 간격을 둘 것).
  const FOLLOW_UP_DELAY_MS = 1800;

  const onBrightness = (e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setState((s) => {
      if (v <= 3 && !s.bedtimeAck && s.isOn) {
        schedule(() => setState((s2) => ({ ...s2, acking: false })), 900);
        if (s.firstEmotionAnswer && !s.followUpAsked) {
          schedule(() => setState((s2) => ({ ...s2, showFollowUp: true })), FOLLOW_UP_DELAY_MS);
        }
        return { ...s, brightness: v, bedtimeAck: true, acking: true };
      }
      // SCENE 6 — a value above the bedtime range is an ordinary living
      // adjustment, so it's what SCENE 12's preference sentence remembers
      // instead of the forced sleep minimum.
      return { ...s, brightness: v, livingBrightnessSample: v > 12 ? v : s.livingBrightnessSample };
    });
  };

  // Every choice is treated equally — none is a failure (스토리보드 SCENE 7 감정
  // 설계 원칙) — only "조금 편해졌어" gets the one-off warm flash back to sleep light.
  const answerFollowUp = (choice: string) => {
    setState((s) => ({ ...s, followUpAnswer: choice, showFollowUp: false, followUpAsked: true }));
    if (choice === "조금 편해졌어") {
      setState((s) => ({ ...s, followUpGlow: true }));
      schedule(() => setState((s2) => ({ ...s2, followUpGlow: false })), 900);
    }
  };

  const skipFollowUp = () => {
    setState((s) => ({ ...s, showFollowUp: false, followUpAsked: true }));
  };

  const togglePower = () => {
    if (!state.isOn) {
      startSession();
      return;
    }
    setState((s) => {
      const mins = Math.max(1, Math.round((Date.now() - (s.startedAt ?? Date.now())) / 1000));
      const session: NightSession = {
        id: "n" + s.nights,
        no: s.nights,
        title: s.nights === 1 ? "비가 내린 첫 번째 밤" : `${ord(s.nights)} 밤`,
        minutes: mins,
        minBrightness: s.bedtimeAck ? 0 : s.brightness,
        ack: s.bedtimeAck,
        rainy: s.rainy,
        lowBrightness: s.livingBrightnessSample <= LOW_BRIGHTNESS_THRESHOLD,
      };
      return {
        ...s,
        isOn: false,
        screen: "record",
        sessions: [session, ...s.sessions],
        totalMinutes: s.totalMinutes + mins,
      };
    });
  };

  // A single slow breath, not the multi-dip wakePattern — night jumps are a test-tool
  // convenience, not a real power-on, so one clear dip-and-rise reads better than
  // growth-stage timing that only differed by fractions of a second (1.6s vs 1.2s).
  // `linear` here defers to the per-keyframe easings that shape the breath.
  const breatheOn = (ms: number) => `ember-breathe-on ${ms}ms linear both`;

  // SCENE 9's accumulation cut — a multi-night jump holds here for a beat with
  // nothing changed yet (아직 달라진 건 없어요. 다만 쌓이고 있어요) before the reveal
  // below plays. Nights added one at a time (nextNight) skip the beat entirely —
  // there's nothing to compress.
  const ACCUMULATION_BEAT_MS = 3000;

  const advance = (to: number, wakeMs: number) => {
    const fromNights = state.nights;
    const isMontage = to - fromNights > 1;
    const crossesBoundary = stageFor(to).key !== stageFor(fromNights).key;
    const reachesNightSeven = crossesBoundary && stageFor(to).at === to && to === 7;
    const reachesNightThirty = crossesBoundary && stageFor(to).at === to && to === 30;

    const reveal = () => {
      setState((s) => {
        const before = stageFor(fromNights).key;
        let mins = s.totalMinutes;
        const added: NightSession[] = [];
        const extra: ChangeEntry[] = [];
        for (let n = fromNights + 1; n <= to; n += 1) {
          const d = 120 + ((n * 37) % 80);
          mins += d;
          added.push({
            id: "n" + n,
            no: n,
            title: `${ord(n)} 밤`,
            minutes: d,
            minBrightness: 0,
            ack: true,
            rainy: isRainyNight(n),
            lowBrightness: isLowBrightnessNight(n),
          });
          const st = stageFor(n);
          if (st.at === n && st.key !== before) {
            extra.push({ id: "c" + n, desc: st.desc, meta: `${n}번째 밤 · ${st.label}` });
          }
        }
        return {
          ...s,
          nights: to,
          totalMinutes: mins,
          sessions: [...added.reverse(), ...s.sessions],
          changes: [...extra.reverse(), ...s.changes],
          // Test-tool night jumps simulate nights already lived through, not a fresh
          // power-off — the light should read as on when landing on the home screen.
          isOn: true,
          waking: true,
          wakeAnimation: breatheOn(wakeMs),
          // SCENE 10/12 both want the flame's reaction seen immediately, not buried
          // behind the log — the log tab still records everything either way.
          screen: "home",
          detailId: null,
          logTab: extra.length ? "changes" : "nights",
          // Rain is the first night's one-time context (C3) — later nights default to clear
          // unless the test tool's "비오는날" toggle turns it back on.
          rainy: false,
          showAccumulationNote: false,
          // SCENE 12-B — the room's light already updates in this same render (it
          // reads straight off `nights`/`rainy`/`brightness`); dimming only the app
          // panel is what makes the room read as "first".
          appDimmed: reachesNightThirty,
        };
      });

      schedule(() => {
        setState((s) => ({
          ...s,
          waking: false,
          brightness: reachesNightSeven ? preferredBrightness(s.sessions) : s.brightness,
        }));
      }, wakeMs);

      if (reachesNightThirty) {
        schedule(() => setState((s) => ({ ...s, appDimmed: false })), wakeMs + 2200);
      }
    };

    if (isMontage) {
      setState((s) => ({ ...s, showAccumulationNote: true }));
      schedule(reveal, ACCUMULATION_BEAT_MS);
    } else {
      reveal();
    }
  };

  // The 7th-night swell plays twice (globals.css's flame-swell now runs a
  // 2-iteration animation) — wakeMs is stretched to match, so `waking` doesn't
  // flip false (and cut the swell short) mid-animation.
  const nextNight = () => advance(state.nights + 1, 2000);
  const jumpSeven = () => advance(Math.max(7, state.nights + 1), 3300);
  const jumpThirty = () => advance(Math.max(30, state.nights + 1), 1600);

  const reset = () =>
    setState((s) => ({
      ...s,
      screen: "discover",
      revealed: 0,
      name: "",
      nameDraft: "",
      nights: 0,
      totalMinutes: 0,
      isOn: false,
      brightness: 45,
      bedtimeAck: false,
      sessions: [],
      changes: [],
      detailId: null,
      logTab: "nights",
      rainy: true,
      firstEmotionAnswer: null,
      tonightEmotionChoice: null,
      emotionAskedTonight: false,
      followUpAnswer: null,
      showFollowUp: false,
      followUpAsked: false,
      followUpGlow: false,
      livingBrightnessSample: 45,
      showAccumulationNote: false,
      appDimmed: false,
    }));

  const goHome = () => setState((s) => ({ ...s, screen: "home" }));
  const goLog = () => setState((s) => ({ ...s, screen: "log", detailId: null }));
  const goSettings = () => setState((s) => ({ ...s, screen: "settings" }));
  const toggleRain = () => {
    // Only breathe if the ember is actually lit — toggling weather on a dark light has
    // nothing to animate.
    const shouldBreathe = state.isOn;
    setState((s) => ({
      ...s,
      rainy: !s.rainy,
      ...(shouldBreathe ? { waking: true, wakeAnimation: breatheOn(1000) } : null),
    }));
    if (shouldBreathe) schedule(() => setState((s) => ({ ...s, waking: false })), 1000);
  };
  const openAbout = () => setState((s) => ({ ...s, showAbout: true }));
  const closeAbout = () => setState((s) => ({ ...s, showAbout: false }));
  const setLogTab = (tab: "nights" | "changes") => setState((s) => ({ ...s, logTab: tab }));
  const openDetail = (id: string) => setState((s) => ({ ...s, detailId: id, screen: "log" }));

  return {
    state,
    actions: {
      onTap,
      wake,
      saveName,
      renameSave,
      onNameInput,
      onBrightness,
      answerEmotion,
      skipEmotionQuestion,
      answerFollowUp,
      skipFollowUp,
      togglePower,
      nextNight,
      jumpSeven,
      jumpThirty,
      reset,
      goHome,
      goLog,
      goSettings,
      toggleRain,
      openAbout,
      closeAbout,
      setLogTab,
      openDetail,
    },
  };
}
