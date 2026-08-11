import { glassButton, glassPanel } from "@/lib/glass";

interface TonightRecordProps {
  lastTitle: string;
  lastDuration: string;
  goLog: () => void;
  goHome: () => void;
}

export function TonightRecord({ lastTitle, lastDuration, goLog, goHome }: TonightRecordProps) {
  return (
    <div
      style={{
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 26,
        gap: 16,
        background: "#0c0a09",
        color: "#e6dccd",
        fontFamily: "'Noto Sans KR',system-ui,sans-serif",
      }}
    >
      <div
        style={{
          animation: "fadeUp .7s ease both",
          ...glassPanel({ radius: 22, padding: "26px 24px", elevated: true }),
        }}
      >
        <p style={{ margin: "0 0 18px", fontSize: 11.5, letterSpacing: "0.14em", color: "#6b6053" }}>오늘 밤의 기록</p>
        <p style={{ margin: "0 0 10px", fontFamily: "'Gowun Batang',serif", fontSize: 23, color: "#e4d5bf" }}>
          {lastTitle}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: "#9a8b78" }}>함께 머문 시간 {lastDuration}</p>
      </div>
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.7, color: "#5f564b" }}>불은 꺼졌지만 함께 보낸 시간은 남습니다.</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={goLog}
          style={{
            flex: 1,
            minHeight: 44,
            padding: 15,
            fontSize: 14,
            fontFamily: "'Noto Sans KR',sans-serif",
            ...glassButton("primary"),
          }}
        >
          기록 보기
        </button>
        <button
          onClick={goHome}
          style={{
            flex: 1,
            minHeight: 44,
            padding: 15,
            fontSize: 14,
            fontFamily: "'Noto Sans KR',sans-serif",
            ...glassButton("ghost"),
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
