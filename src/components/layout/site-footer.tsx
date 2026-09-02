import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-paper-raised">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-ink-muted md:flex-row md:justify-between">
        <p>
          {SITE_NAME} no es un sitio oficial. Los montos son valores declarados
          (generalmente fiscales), no de mercado.
        </p>
        <p>
          Fuente pública de referencia:{" "}
          <a
            className="underline decoration-line underline-offset-2 hover:text-accent"
            href="https://datos.jus.gob.ar/dataset/declaraciones-juradas-patrimoniales-integrales"
          >
            DJPI — datos.jus.gob.ar
          </a>
          .{" "}
          <Link href="/metodologia" className="underline decoration-line underline-offset-2 hover:text-accent">
            Metodología
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
