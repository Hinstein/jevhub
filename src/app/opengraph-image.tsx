import { ImageResponse } from "next/og";

export const alt = "JevHub: learn Jev, try real apps, and build with it";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#07110f",
          color: "#edf8f4",
          padding: "72px 82px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#6ee7b7",
              color: "#052019",
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            JH
          </div>
          JevHub
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              maxWidth: 950,
              fontSize: 72,
              lineHeight: 1.02,
              letterSpacing: "-3px",
              fontWeight: 800,
            }}
          >
            Learn Jev. Try real apps. Build with it.
          </div>
          <div
            style={{
              maxWidth: 900,
              fontSize: 28,
              lineHeight: 1.4,
              color: "#9db8af",
            }}
          >
            Independent guides, cost tools, decision templates, and a curated
            Jev ecosystem directory.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: 22,
            color: "#6ee7b7",
          }}
        >
          <span>Guides</span>
          <span>•</span>
          <span>Calculator</span>
          <span>•</span>
          <span>Templates</span>
          <span>•</span>
          <span>Ecosystem</span>
        </div>
      </div>
    ),
    size,
  );
}
