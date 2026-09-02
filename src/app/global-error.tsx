"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es-AR">
      <body
        style={{
          margin: 0,
          background: "#f4f1ea",
          color: "#1c1917",
          fontFamily:
            'ui-sans-serif, system-ui, sans-serif',
          padding: "4rem 1rem",
        }}
      >
        <main style={{ maxWidth: "36rem", margin: "0 auto" }}>
          <h1 style={{ fontFamily: "Georgia, ui-serif, serif", fontSize: "2rem" }}>
            Error del sitio
          </h1>
          <p>No se pudo mostrar DDJJ Congreso.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              minHeight: "44px",
              background: "#1f4d47",
              color: "#fffcf6",
              border: 0,
              padding: "0.5rem 1rem",
            }}
          >
            Reintentar
          </button>
          {error.digest ? (
            <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#57534e" }}>
              Ref. {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
