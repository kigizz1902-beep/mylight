import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useDokkaebiApp } from "@/hooks/use-dokkaebi-app";
import { getBrightnessPreferenceSentence, getWeatherSummarySentence } from "@/lib/dokkaebi";

describe("useDokkaebiApp — emotion state", () => {
  it("remembers only the first ever emotion answer, but updates tonight's choice every time", () => {
    const { result } = renderHook(() => useDokkaebiApp());

    act(() => result.current.actions.answerEmotion("조금 지쳤어"));
    expect(result.current.state.firstEmotionAnswer).toBe("조금 지쳤어");
    expect(result.current.state.tonightEmotionChoice).toBe("조금 지쳤어");
    expect(result.current.state.emotionAskedTonight).toBe(true);

    act(() => result.current.actions.answerEmotion("기분 좋은 일이 있었어"));
    expect(result.current.state.firstEmotionAnswer).toBe("조금 지쳤어");
    expect(result.current.state.tonightEmotionChoice).toBe("기분 좋은 일이 있었어");
  });

  it("skipping the question marks it asked without recording an answer", () => {
    const { result } = renderHook(() => useDokkaebiApp());

    act(() => result.current.actions.skipEmotionQuestion());
    expect(result.current.state.emotionAskedTonight).toBe(true);
    expect(result.current.state.firstEmotionAnswer).toBeNull();
    expect(result.current.state.tonightEmotionChoice).toBeNull();
  });

  it("resets tonight's emotion state when a new session starts, but keeps the permanent memory", () => {
    const { result } = renderHook(() => useDokkaebiApp());

    act(() => result.current.actions.wake());
    act(() => result.current.actions.answerEmotion("조금 지쳤어"));
    act(() => result.current.actions.togglePower()); // ends the first night

    act(() => result.current.actions.togglePower()); // starts a new session
    expect(result.current.state.firstEmotionAnswer).toBe("조금 지쳤어");
    expect(result.current.state.tonightEmotionChoice).toBeNull();
    expect(result.current.state.emotionAskedTonight).toBe(false);
  });
});

describe("useDokkaebiApp — SCENE 7 bedtime follow-up", () => {
  function bottomOutBrightness() {
    return { target: { value: "2" } } as React.ChangeEvent<HTMLInputElement>;
  }

  it("only schedules the follow-up once SCENE 4 was ever answered", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDokkaebiApp());

    act(() => result.current.actions.wake());
    act(() => result.current.actions.onBrightness(bottomOutBrightness()));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.state.showFollowUp).toBe(false);

    vi.useRealTimers();
  });

  it("shows the follow-up a beat after the FR-04 pulse when SCENE 4 was answered", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDokkaebiApp());

    act(() => result.current.actions.wake());
    act(() => result.current.actions.answerEmotion("조금 지쳤어"));
    act(() => result.current.actions.onBrightness(bottomOutBrightness()));

    act(() => vi.advanceTimersByTime(900));
    expect(result.current.state.showFollowUp).toBe(false); // FR-04 pulse only, not yet the follow-up

    act(() => vi.advanceTimersByTime(900));
    expect(result.current.state.showFollowUp).toBe(true);

    vi.useRealTimers();
  });

  it("treats every follow-up answer as valid, with a glow only for '조금 편해졌어'", () => {
    const { result } = renderHook(() => useDokkaebiApp());

    act(() => result.current.actions.answerFollowUp("아직 그대로야"));
    expect(result.current.state.followUpAnswer).toBe("아직 그대로야");
    expect(result.current.state.showFollowUp).toBe(false);
    expect(result.current.state.followUpAsked).toBe(true);
    expect(result.current.state.followUpGlow).toBe(false);
  });

  it("flashes briefly for '조금 편해졌어' then settles", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDokkaebiApp());

    act(() => result.current.actions.answerFollowUp("조금 편해졌어"));
    expect(result.current.state.followUpGlow).toBe(true);

    act(() => vi.advanceTimersByTime(900));
    expect(result.current.state.followUpGlow).toBe(false);

    vi.useRealTimers();
  });

  it("skipping still marks the follow-up as asked without recording an answer", () => {
    const { result } = renderHook(() => useDokkaebiApp());

    act(() => result.current.actions.skipFollowUp());
    expect(result.current.state.followUpAsked).toBe(true);
    expect(result.current.state.followUpAnswer).toBeNull();
  });

  it("resets the follow-up session state on a new night but keeps the permanent memory", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDokkaebiApp());

    act(() => result.current.actions.wake());
    act(() => result.current.actions.answerEmotion("조금 지쳤어"));
    act(() => result.current.actions.onBrightness(bottomOutBrightness()));
    act(() => vi.advanceTimersByTime(1800));
    act(() => result.current.actions.answerFollowUp("조금 편해졌어"));
    act(() => result.current.actions.togglePower());

    act(() => result.current.actions.togglePower());
    expect(result.current.state.firstEmotionAnswer).toBe("조금 지쳤어");
    expect(result.current.state.followUpAnswer).toBeNull();
    expect(result.current.state.followUpAsked).toBe(false);
    expect(result.current.state.showFollowUp).toBe(false);

    vi.useRealTimers();
  });
});

describe("useDokkaebiApp — SCENE 9 accumulation cut", () => {
  it("shows the note during a multi-night jump, and clears it once revealed", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDokkaebiApp());

    act(() => result.current.actions.nextNight()); // a single night never montages
    expect(result.current.state.showAccumulationNote).toBe(false);

    act(() => result.current.actions.jumpSeven());
    expect(result.current.state.showAccumulationNote).toBe(true);
    expect(result.current.state.nights).toBe(1); // nothing revealed yet

    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.state.showAccumulationNote).toBe(false);
    expect(result.current.state.nights).toBe(7);

    vi.useRealTimers();
  });
});

describe("useDokkaebiApp — SCENE 10 night 7 settling", () => {
  it("settles brightness toward the recorded preference once the swell finishes", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDokkaebiApp());

    act(() => result.current.actions.jumpSeven());
    act(() => vi.advanceTimersByTime(3000)); // accumulation beat
    act(() => vi.advanceTimersByTime(3300)); // the 2x swell window (wakeMs)

    expect(result.current.state.waking).toBe(false);
    expect(result.current.state.brightness).toBeLessThan(35); // isLowBrightnessNight majority

    vi.useRealTimers();
  });
});

describe("useDokkaebiApp — SCENE 12-B/12-C night 30 two-stage reveal", () => {
  it("dims the app during the room-first beat, then reveals it", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDokkaebiApp());

    act(() => result.current.actions.jumpThirty());
    act(() => vi.advanceTimersByTime(3000)); // accumulation beat

    expect(result.current.state.nights).toBe(30);
    expect(result.current.state.appDimmed).toBe(true);

    act(() => vi.advanceTimersByTime(1600 + 2200)); // wakeMs + the app-reveal delay
    expect(result.current.state.appDimmed).toBe(false);

    vi.useRealTimers();
  });
});

describe("useDokkaebiApp — SCENE 12 data (weather + brightness preference)", () => {
  it("jumpThirty leaves enough session history for both independent SCENE 12-C sentences", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDokkaebiApp());

    act(() => result.current.actions.jumpThirty());
    act(() => vi.advanceTimersByTime(3000)); // SCENE 9's accumulation beat before the reveal

    expect(result.current.state.sessions).toHaveLength(30);
    expect(getWeatherSummarySentence(result.current.state.sessions)).toBe(
      "함께한 30번의 밤 중 14번, 비가 내렸어요.",
    );
    expect(getBrightnessPreferenceSentence(result.current.state.sessions)).toBe(
      "그리고 당신은 대부분의 밤, 낮은 빛에 오래 머물렀어요.",
    );

    vi.useRealTimers();
  });
});
