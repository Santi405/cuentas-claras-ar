"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Explorador" },
  { href: "/metodologia", label: "Metodología" },
  { href: "/datos", label: "Datos" },
];

export function NavLinks({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <ul className={className}>
      {links.map((link) => {
        const current = pathname === link.href;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={
                current
                  ? "text-sm font-medium text-accent"
                  : "text-sm font-medium text-ink hover:text-accent"
              }
              aria-current={current ? "page" : undefined}
              onClick={onNavigate}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
