export default function Loading() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-10"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-12 w-1/2 bg-line" />
      <div className="mt-8 h-48 bg-line" />
      <span className="sr-only">Cargando perfil</span>
    </div>
  );
}
