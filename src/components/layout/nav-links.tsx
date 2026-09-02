import Link from "next/link";

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
  return (
    <ul className={className}>
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="text-sm font-medium text-ink hover:text-accent"
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
