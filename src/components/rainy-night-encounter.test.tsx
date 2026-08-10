import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { RainyNightEncounter } from "@/components/rainy-night-encounter";

describe("RainyNightEncounter", () => {
  it("advances exactly one stage per click, up to stage 5, then stops", async () => {
    const onAwaken = vi.fn().mockResolvedValue(undefined);
    const onStageChange = vi.fn();

    render(<RainyNightEncounter onAwaken={onAwaken} onStageChange={onStageChange} />);

    const surface = screen.getByTestId("encounter-surface");

    expect(screen.getByText("젖은 표면 아래 작은 기척이 있어요.")).toBeInTheDocument();
    expect(screen.getByText("00 / 05")).toBeInTheDocument();

    const expectedCopy = [
      "나를 깨워줘.",
      "너는 누구야?",
      "비를 피해 왔어.",
      "조금만 더 가까이.",
      "찾았다.",
    ];

    for (const [index, copy] of expectedCopy.entries()) {
      fireEvent.click(surface);
      expect(screen.getByText(copy)).toBeInTheDocument();
      expect(screen.getByText(`0${index + 1} / 05`)).toBeInTheDocument();
    }

    expect(screen.getByText("비를 피해 작은 불씨가 찾아왔어요.")).toBeInTheDocument();
    expect(onStageChange).toHaveBeenCalledTimes(5);
    expect(onStageChange).toHaveBeenNthCalledWith(5, 5);

    await waitFor(() => expect(onAwaken).toHaveBeenCalledTimes(1));

    // Further clicks at stage 5 must not change state or call onAwaken again.
    fireEvent.click(surface);
    fireEvent.click(surface);
    expect(screen.getByText("05 / 05")).toBeInTheDocument();
    expect(onStageChange).toHaveBeenCalledTimes(5);
    await waitFor(() => expect(onAwaken).toHaveBeenCalledTimes(1));
  });

  it("does not skip or double-count stages under rapid repeated clicks", () => {
    render(<RainyNightEncounter />);
    const surface = screen.getByTestId("encounter-surface");

    fireEvent.click(surface);
    fireEvent.click(surface);
    fireEvent.click(surface);

    expect(screen.getByText("03 / 05")).toBeInTheDocument();
    expect(screen.getByText("비를 피해 왔어.")).toBeInTheDocument();
  });

  it("progresses via Enter and Space keys", async () => {
    const onAwaken = vi.fn().mockResolvedValue(undefined);
    render(<RainyNightEncounter onAwaken={onAwaken} />);
    const surface = screen.getByTestId("encounter-surface");

    fireEvent.keyDown(surface, { key: "Enter" });
    fireEvent.keyDown(surface, { key: " " });
    fireEvent.keyDown(surface, { key: "Enter" });
    fireEvent.keyDown(surface, { key: " " });
    fireEvent.keyDown(surface, { key: "Enter" });

    expect(screen.getByText("찾았다.")).toBeInTheDocument();
    expect(screen.getByText("05 / 05")).toBeInTheDocument();
    await waitFor(() => expect(onAwaken).toHaveBeenCalledTimes(1));
  });

  it("ignores keys other than Enter/Space", () => {
    render(<RainyNightEncounter />);
    const surface = screen.getByTestId("encounter-surface");

    fireEvent.keyDown(surface, { key: "Tab" });
    fireEvent.keyDown(surface, { key: "Escape" });

    expect(screen.getByText("00 / 05")).toBeInTheDocument();
  });

  it("shows a retryable error state when onAwaken fails, and succeeds on retry", async () => {
    const onAwaken = vi.fn().mockRejectedValueOnce(new Error("light offline")).mockResolvedValueOnce(undefined);

    render(<RainyNightEncounter onAwaken={onAwaken} />);
    const surface = screen.getByTestId("encounter-surface");

    for (let i = 0; i < 5; i += 1) fireEvent.click(surface);

    await waitFor(() => expect(screen.getByText("빛을 켜지 못했어요.")).toBeInTheDocument());
    expect(onAwaken).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    await waitFor(() => expect(screen.queryByText("빛을 켜지 못했어요.")).not.toBeInTheDocument());
    expect(onAwaken).toHaveBeenCalledTimes(2);
  });

  it("calls onStageChange and onReset appropriately when reset is used", () => {
    const onReset = vi.fn();
    render(<RainyNightEncounter onReset={onReset} showResetButton />);
    const surface = screen.getByTestId("encounter-surface");

    for (let i = 0; i < 5; i += 1) fireEvent.click(surface);
    expect(screen.getByText("찾았다.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "처음부터 다시 보기" }));

    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.getByText("젖은 표면 아래 작은 기척이 있어요.")).toBeInTheDocument();
    expect(screen.getByText("00 / 05")).toBeInTheDocument();
  });
});
