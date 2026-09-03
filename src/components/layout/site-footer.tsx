import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

const linkClass = "underline decoration-line underline-offset-2 hover:text-accent";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-paper-raised">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-ink-muted md:flex-row md:justify-between">
        <p>
          {SITE_NAME} no es un sitio oficial. Los montos son valores declarados,
          no de mercado.
        </p>
        <p>
          <Link href="/metodologia" className={linkClass}>
            Metodología
          </Link>
          {" · "}
          <Link href="/datos" className={linkClass}>
            Datos
          </Link>
        </p>
      </div>
    </footer>
  );
}
