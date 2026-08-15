import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { NightHome } from "@/components/dokkaebi/screens/NightHome";
import { moodFor } from "@/lib/dokkaebi";

function baseProps(overrides: Partial<React.ComponentProps<typeof NightHome>> = {}) {
  const mood = moodFor({ nights: 1, isOn: true, brightness: 45, bedtimeAck: false });
  return {
    nightLabel: "첫 번째 밤",
    greeting: "비가 오는 밤이에요",
    mood,
    togetherSentence: "이 밤을 시작했어요",
    togetherCompact: "0m",
    nights: 1,
    growth: { label: "첫 만남", progress: 0, nightsAway: 2 },
    week: [],
    brightness: 45,
    isOn: true,
    ackHint: "",
    togglePower: vi.fn(),
    onBrightness: vi.fn(),
    openLog: vi.fn(),
    showEmotionQuestion: true,
    onAnswerEmotion: vi.fn(),
    onSkipEmotionQuestion: vi.fn(),
    showFollowUpQuestion: false,
    onAnswerFollowUp: vi.fn(),
    onSkipFollowUp: vi.fn(),
    temperament: null,
    ...overrides,
  };
}

describe("NightHome — SCENE 4 emotion question card", () => {
  it("shows the question and doesn't block the brightness slider", () => {
    render(<NightHome {...baseProps()} />);
    expect(screen.getByText("오늘은 어떤 마음으로 돌아왔어?")).toBeInTheDocument();
    expect(screen.getByLabelText("밝기")).toBeInTheDocument();
  });

  it("calls onAnswerEmotion with the chosen line", () => {
    const onAnswerEmotion = vi.fn();
    render(<NightHome {...baseProps({ onAnswerEmotion })} />);
    fireEvent.click(screen.getByText("조금 지쳤어"));
    expect(onAnswerEmotion).toHaveBeenCalledWith("조금 지쳤어");
  });

  it("calls onSkipEmotionQuestion and never blocks skipping", () => {
    const onSkipEmotionQuestion = vi.fn();
    render(<NightHome {...baseProps({ onSkipEmotionQuestion })} />);
    fireEvent.click(screen.getByText("다음에 말할게"));
    expect(onSkipEmotionQuestion).toHaveBeenCalledTimes(1);
  });

  it("hides the card once the question has been asked this session", () => {
    render(<NightHome {...baseProps({ showEmotionQuestion: false })} />);
    expect(screen.queryByText("오늘은 어떤 마음으로 돌아왔어?")).not.toBeInTheDocument();
  });

  it("shows the SCENE 7 follow-up and calls onAnswerFollowUp with the chosen line", () => {
    const onAnswerFollowUp = vi.fn();
    render(
      <NightHome
        {...baseProps({ showEmotionQuestion: false, showFollowUpQuestion: true, onAnswerFollowUp })}
      />,
    );
    expect(screen.getByText("아까 지쳤다고 했지. 지금은 어때?")).toBeInTheDocument();
    fireEvent.click(screen.getByText("조금 편해졌어"));
    expect(onAnswerFollowUp).toHaveBeenCalledWith("조금 편해졌어");
  });

  it("reflects the SCENE 7 recall reply in the state sentence", () => {
    const mood = moodFor({
      nights: 1,
      isOn: true,
      brightness: 3,
      bedtimeAck: true,
      followUpAnswered: true,
    });
    render(<NightHome {...baseProps({ mood, showEmotionQuestion: false })} />);
    expect(screen.getByText("그럼 오늘은 이 빛으로 함께 있을게")).toBeInTheDocument();
  });

  it("shows both independent SCENE 12-C sentences once revealed", () => {
    render(
      <NightHome
        {...baseProps({
          temperament: {
            weatherSentence: "함께한 30번의 밤 중 14번, 비가 내렸어요.",
            brightnessSentence: "그리고 당신은 대부분의 밤, 낮은 빛에 오래 머물렀어요.",
            closingLine: "모루는 비를 오래 머금은 불이 되었습니다.",
          },
        })}
      />,
    );
    expect(screen.getByText("함께한 30번의 밤 중 14번, 비가 내렸어요.")).toBeInTheDocument();
    expect(
      screen.getByText("그리고 당신은 대부분의 밤, 낮은 빛에 오래 머물렀어요."),
    ).toBeInTheDocument();
    expect(screen.getByText("모루는 비를 오래 머금은 불이 되었습니다.")).toBeInTheDocument();
  });

  it("shows nothing extra before the temperament has been revealed", () => {
    render(<NightHome {...baseProps({ temperament: null })} />);
    expect(screen.queryByText("불씨의 기질")).not.toBeInTheDocument();
  });

  it("reflects the SCENE 5 resting reply in the state sentence", () => {
    const mood = moodFor({
      nights: 1,
      isOn: true,
      brightness: 45,
      bedtimeAck: false,
      tonightEmotionChoice: "조금 지쳤어",
    });
    render(<NightHome {...baseProps({ mood, showEmotionQuestion: false })} />);
    expect(screen.getByText("오늘은 천천히 곁에 있을게")).toBeInTheDocument();
  });
});
