import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-paper-raised">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink">
          {SITE_NAME}
        </Link>
        <nav aria-label="Principal" className="hidden md:block">
          <NavLinks className="flex items-center gap-6" />
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
