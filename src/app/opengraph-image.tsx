import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f1117",
          color: "#e2e8f0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 96, marginBottom: 24 }}>⚽</div>
        <div style={{ fontSize: 64, fontWeight: 700, display: "flex" }}>DrillPitch</div>
        <div style={{ fontSize: 32, color: "#94a3b8", marginTop: 12, display: "flex" }}>
          AI Coaching Assistant for Session Planning &amp; Match Prep
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 22,
            color: "#3b82f6",
            border: "1px solid #2e3350",
            borderRadius: 20,
            padding: "8px 20px",
            display: "flex",
          }}
        >
          drillpitch.com
        </div>
      </div>
    ),
    { ...size }
  );
}
