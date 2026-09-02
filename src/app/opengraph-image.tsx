import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

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
          justifyContent: "center",
          background: "#f4f1ea",
          color: "#1c1917",
          padding: 80,
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase" }}>
          Congreso de la Nación
        </div>
        <div style={{ fontSize: 72, marginTop: 16, fontWeight: 600 }}>{SITE_NAME}</div>
        <div style={{ fontSize: 28, marginTop: 24, color: "#57534e" }}>
          Declaraciones juradas patrimoniales de diputados y senadores
        </div>
      </div>
    ),
    { ...size },
  );
}
