import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-serif text-3xl">No encontramos esa página</h1>
      <p className="mt-3 text-ink-muted">
        El recurso no existe o el enlace cambió. No es un error de los datos:
        esa dirección no corresponde a una página pública de este sitio.
      </p>
      <p className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
        <Link href="/" className="text-accent underline underline-offset-2">
          Volver al explorador
        </Link>
        <Link href="/metodologia" className="text-accent underline underline-offset-2">
          Ver metodología
        </Link>
      </p>
    </div>
  );
}
