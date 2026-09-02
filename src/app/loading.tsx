export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10" aria-busy="true">
      <div className="h-10 w-2/3 bg-line" />
      <div className="mt-4 h-20 bg-line" />
      <div className="mt-8 h-64 bg-line" />
      <span className="sr-only">Cargando</span>
    </div>
  );
}
