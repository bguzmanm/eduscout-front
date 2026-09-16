import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/site";

export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
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
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0F2440",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            backgroundColor: "#C4972A",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              backgroundColor: "#C4972A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
              color: "#0F2440",
            }}
          >
            E
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: 1 }}>
            {SITE_NAME}
          </div>
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: "#C4972A",
            textAlign: "center",
            marginBottom: 16,
            padding: "0 80px",
          }}
        >
          El portal laboral para la educación superior
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#E8E2DC",
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: 780,
            padding: "0 80px",
          }}
        >
          {SITE_DESCRIPTION}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            fontSize: 18,
            color: "#C4972A",
            letterSpacing: 4,
          }}
        >
          EDUSCOUT.CL
        </div>
      </div>
    ),
    size,
  );
}