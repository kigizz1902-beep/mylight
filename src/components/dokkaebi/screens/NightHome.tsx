import type { ChangeEvent, CSSProperties } from "react";

import { glassPanel } from "@/lib/glass";

interface NightHomeProps {
  nightTitle: string;
  stageLabel: string;
  totalTimeText: string;
  brightness: number;
  appEmberOpacity: number;
  isOn: boolean;
  powerLabel: string;
  powerSub: string;
  ackHint: string;
  toggleBg: string;
  toggleJustify: "flex-start" | "flex-end";
  sliderOpacity: number;
  sliderDisabled: boolean;
  togglePower: () => void;
  onBrightness: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function NightHome({
  nightTitle,
  stageLabel,
  totalTimeText,
  brightness,
  appEmberOpacity,
  isOn,
  powerLabel,
  powerSub,
  ackHint,
  toggleBg,
  toggleJustify,
  sliderOpacity,
  sliderDisabled,
  togglePower,
  onBrightness,
}: NightHomeProps) {
  return (
    <div
      style={{
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        padding: "22px 26px 0",
        minHeight: 0,
        background: "#0c0a09",
        color: "#e6dccd",
        fontFamily: "'Noto Sans KR',system-ui,sans-serif",
      }}
    >
      <p style={{ margin: "14px 0 2px", fontFamily: "'Gowun Batang',serif", fontSize: 22, color: "#e2d3bd" }}>
        {nightTitle}
      </p>
      <p style={{ margin: 0, fontSize: 12.5, color: "#6b6053" }}>
        {stageLabel} · 누적 {totalTimeText}
      </p>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 180 }}>
        <div
          style={{
            position: "relative",
            width: 150,
            height: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(232,168,96,.14),transparent 68%)",
            opacity: appEmberOpacity,
          }}
        >
          <div
            style={{
              width: 20,
              height: 26,
              borderRadius: "50% 50% 45% 45%",
              background: "#f2be82",
              boxShadow: "0 0 44px rgba(240,184,120,.7)",
              animation: "emberBreath 5s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          ...glassPanel({ radius: 18, padding: "16px 18px" }),
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontSize: 14, color: "#d9cbb6" }}>{powerLabel}</span>
          <span style={{ fontSize: 11.5, color: "#6b6053" }}>{powerSub}</span>
        </div>
        {/* Transparent 44px-tall hit area around the 34px visual pill (touch-target minimum). */}
        <button
          onClick={togglePower}
          role="switch"
          aria-checked={isOn}
          aria-label="도깨비불 전원"
          style={{
            border: "none",
            background: "transparent",
            padding: "5px 0",
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              width: 62,
              height: 34,
              borderRadius: 20,
              border: "1px solid rgba(255,222,176,0.16)",
              background: toggleBg,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: toggleJustify,
              transition: "background .18s ease, justify-content .18s ease",
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                margin: "0 3px",
                borderRadius: "50%",
                background: "#e8c395",
                boxShadow: "0 0 10px rgba(240,184,120,.5)",
                display: "block",
              }}
            />
          </span>
        </button>
      </div>

      <div style={{ opacity: sliderOpacity, ...glassPanel({ radius: 18, padding: 18 }) }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b6053", marginBottom: 10 }}>
          <label htmlFor="brightness-slider">밝기</label>
          {/* Tabular figures so the row doesn't shift width while dragging. */}
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{brightness}</span>
        </div>
        <input
          id="brightness-slider"
          className="ember-slider"
          type="range"
          min={0}
          max={100}
          value={brightness}
          onChange={onBrightness}
          disabled={sliderDisabled}
          style={{ "--pct": `${brightness}%` } as CSSProperties}
        />
      </div>

      <div
        style={{
          flex: "none",
          height: 26,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11.5,
          color: "#5a5147",
        }}
      >
        {ackHint}
      </div>
    </div>
  );
}
