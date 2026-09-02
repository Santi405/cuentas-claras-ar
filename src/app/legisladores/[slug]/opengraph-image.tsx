import { ImageResponse } from "next/og";
import { getLegisladorBySlug } from "@/lib/data/cached";
import { SITE_NAME } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const legislador = await getLegisladorBySlug(slug);
  const title = legislador?.persona.nombreCompleto ?? SITE_NAME;

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
        <div style={{ fontSize: 24, letterSpacing: 3, textTransform: "uppercase" }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 64, marginTop: 20, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 26, marginTop: 24, color: "#57534e" }}>
          Declaración jurada patrimonial · valores declarados, no de mercado
        </div>
      </div>
    ),
    { ...size },
  );
}
