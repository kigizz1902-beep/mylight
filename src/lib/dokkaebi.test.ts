import { describe, expect, it } from "vitest";

import {
  getBrightnessPreferenceSentence,
  getWeatherSummarySentence,
  isLowBrightnessNight,
  isRainyNight,
  moodFor,
  preferredBrightness,
  type NightSession,
} from "@/lib/dokkaebi";

function session(no: number, overrides: Partial<NightSession> = {}): NightSession {
  return {
    id: `n${no}`,
    no,
    title: `${no}번째 밤`,
    minutes: 100,
    minBrightness: 0,
    ack: true,
    rainy: false,
    lowBrightness: false,
    ...overrides,
  };
}

describe("moodFor — SCENE 5 resting response", () => {
  it("answers '조금 지쳤어' with a slower, lower resting mood", () => {
    const mood = moodFor({
      nights: 1,
      isOn: true,
      brightness: 45,
      bedtimeAck: false,
      tonightEmotionChoice: "조금 지쳤어",
    });
    expect(mood.key).toBe("resting");
    expect(mood.headline).toBe("오늘은 천천히 곁에 있을게");
    expect(mood.motion).toBe("slowing");
  });

  it("resting is dimmer than the ordinary awake mood at the same brightness", () => {
    const awake = moodFor({ nights: 1, isOn: true, brightness: 45, bedtimeAck: false });
    const resting = moodFor({
      nights: 1,
      isOn: true,
      brightness: 45,
      bedtimeAck: false,
      tonightEmotionChoice: "조금 지쳤어",
    });
    expect(resting.intensity).toBeLessThan(awake.intensity);
  });

  it("does not trigger resting for other emotion choices (MUST scope is 조금 지쳤어 only)", () => {
    const mood = moodFor({
      nights: 1,
      isOn: true,
      brightness: 45,
      bedtimeAck: false,
      tonightEmotionChoice: "기분 좋은 일이 있었어",
    });
    expect(mood.key).toBe("awake");
  });

  it("bedtime winding still wins over a resting choice once brightness bottoms out", () => {
    const mood = moodFor({
      nights: 1,
      isOn: true,
      brightness: 3,
      bedtimeAck: true,
      tonightEmotionChoice: "조금 지쳤어",
    });
    expect(mood.key).toBe("winding");
  });

  it("a stage-change celebration still wins over a resting choice", () => {
    const mood = moodFor({
      nights: 7,
      isOn: true,
      brightness: 45,
      bedtimeAck: false,
      celebrating: true,
      tonightEmotionChoice: "조금 지쳤어",
    });
    expect(mood.key).toBe("growth");
  });

  it("SCENE 10 — night 7's celebration stays warm amber, not the later lilac 성장 tone", () => {
    const mood = moodFor({ nights: 7, isOn: true, brightness: 45, bedtimeAck: false, celebrating: true });
    expect(mood.tone).toBe("amber");
    expect(mood.tag).toBe("곁에 있음");
    expect(mood.headline).toBe("당신 곁이 조금 익숙해졌어요");
  });

  it("other stage boundaries keep the lilac 성장 tone", () => {
    const mood = moodFor({ nights: 30, isOn: true, brightness: 45, bedtimeAck: false, celebrating: true });
    expect(mood.tone).toBe("lilac");
  });
});

describe("preferredBrightness — SCENE 10's settling value", () => {
  it("settles low when a majority of nights were low", () => {
    const sessions = [
      session(1, { lowBrightness: true }),
      session(2, { lowBrightness: true }),
      session(3, { lowBrightness: false }),
    ];
    expect(preferredBrightness(sessions)).toBeLessThan(35);
  });

  it("keeps the default when low nights are not a majority", () => {
    const sessions = [session(1, { lowBrightness: false }), session(2, { lowBrightness: false })];
    expect(preferredBrightness(sessions)).toBe(45);
  });

  it("defaults with no recorded nights", () => {
    expect(preferredBrightness([])).toBe(45);
  });
});

describe("SCENE 12-A/12-C — deterministic weather + brightness trail", () => {
  it("produces exactly 14 rainy nights out of the first 30 (스토리보드 12-C)", () => {
    const rainyCount = Array.from({ length: 30 }, (_, i) => i + 1).filter(isRainyNight).length;
    expect(rainyCount).toBe(14);
  });

  it("keeps low-brightness nights a majority of the first 30", () => {
    const lowCount = Array.from({ length: 30 }, (_, i) => i + 1).filter(isLowBrightnessNight).length;
    expect(lowCount).toBeGreaterThan(15);
  });
});

describe("getWeatherSummarySentence — independent of brightness (v6 변경사항 #4)", () => {
  it("counts rainy nights out of the total, regardless of brightness", () => {
    const sessions = [
      session(1, { rainy: true, lowBrightness: true }),
      session(2, { rainy: true, lowBrightness: false }),
      session(3, { rainy: false, lowBrightness: true }),
    ];
    expect(getWeatherSummarySentence(sessions)).toBe("함께한 3번의 밤 중 2번, 비가 내렸어요.");
  });

  it("handles no recorded nights", () => {
    expect(getWeatherSummarySentence([])).toBe("함께한 0번의 밤 중 0번, 비가 내렸어요.");
  });
});

describe("getBrightnessPreferenceSentence — independent of weather (v6 변경사항 #4)", () => {
  it("returns the low-brightness sentence when a majority of nights were low", () => {
    const sessions = [
      session(1, { lowBrightness: true, rainy: true }),
      session(2, { lowBrightness: true, rainy: false }),
      session(3, { lowBrightness: false, rainy: true }),
    ];
    expect(getBrightnessPreferenceSentence(sessions)).toBe(
      "그리고 당신은 대부분의 밤, 낮은 빛에 오래 머물렀어요.",
    );
  });

  it("returns null when low-brightness nights are not a majority (mid/high is SHOULD scope)", () => {
    const sessions = [
      session(1, { lowBrightness: false }),
      session(2, { lowBrightness: false }),
      session(3, { lowBrightness: true }),
    ];
    expect(getBrightnessPreferenceSentence(sessions)).toBeNull();
  });

  it("returns null with no recorded nights", () => {
    expect(getBrightnessPreferenceSentence([])).toBeNull();
  });
});
