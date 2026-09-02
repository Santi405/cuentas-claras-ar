import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-serif text-3xl">Legislador no encontrado</h1>
      <p className="mt-3 text-ink-muted">
        No hay una ficha con ese identificador público.
      </p>
      <p className="mt-6">
        <Link href="/" className="text-accent underline underline-offset-2">
          Volver al explorador
        </Link>
      </p>
    </div>
  );
}
