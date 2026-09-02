"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-serif text-3xl">Algo salió mal</h1>
      <p className="mt-3 text-ink-muted">
        No se pudo cargar esta página. Podés reintentar.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 min-h-11 bg-accent px-4 py-2 text-sm text-paper-raised hover:opacity-90"
      >
        Reintentar
      </button>
      {error.digest ? (
        <p className="mt-4 text-xs text-ink-muted">Ref. {error.digest}</p>
      ) : null}
    </div>
  );
}
