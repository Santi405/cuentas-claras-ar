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
      <body className="bg-[#f4f1ea] px-4 py-16 text-[#1c1917]">
        <h1 style={{ fontFamily: "serif", fontSize: "2rem" }}>Error del sitio</h1>
        <p>No se pudo mostrar DDJJ Congreso.</p>
        <button type="button" onClick={reset}>
          Reintentar
        </button>
        {error.digest ? <p>Ref. {error.digest}</p> : null}
      </body>
    </html>
  );
}
