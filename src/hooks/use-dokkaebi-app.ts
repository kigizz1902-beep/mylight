"use client";

import * as React from "react";
import type { ChangeEvent } from "react";

import { hasJong, ord, stageFor } from "@/lib/dokkaebi";
import type { ChangeEntry, NightSession } from "@/lib/dokkaebi";

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

  const onBrightness = (e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setState((s) => {
      if (v <= 3 && !s.bedtimeAck && s.isOn) {
        schedule(() => setState((s2) => ({ ...s2, acking: false })), 900);
        return { ...s, brightness: v, bedtimeAck: true, acking: true };
      }
      return { ...s, brightness: v };
    });
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

  const advance = (to: number, wakeMs: number) => {
    setState((s) => {
      const before = stageFor(s.nights).key;
      let mins = s.totalMinutes;
      const added: NightSession[] = [];
      const extra: ChangeEntry[] = [];
      for (let n = s.nights + 1; n <= to; n += 1) {
        const d = 120 + ((n * 37) % 80);
        mins += d;
        added.push({ id: "n" + n, no: n, title: `${ord(n)} 밤`, minutes: d, minBrightness: 0, ack: true });
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
        // power-off — the light should read as on when you land on the log screen.
        isOn: true,
        waking: true,
        wakeAnimation: breatheOn(wakeMs),
        screen: "log",
        detailId: null,
        logTab: extra.length ? "changes" : "nights",
        // Rain is the first night's one-time context (C3) — later nights default to clear
        // unless the test tool's "비오는날" toggle turns it back on.
        rainy: false,
      };
    });
    schedule(() => setState((s) => ({ ...s, waking: false })), wakeMs);
  };

  const nextNight = () => advance(state.nights + 1, 2000);
  const jumpSeven = () => advance(Math.max(7, state.nights + 1), 2000);
  const jumpThirty = () => advance(Math.max(30, state.nights + 1), 1000);

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
