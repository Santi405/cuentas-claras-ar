export type SectionNavItem = {
  id: string;
  label: string;
};

export function SectionNav({ items }: { items: readonly SectionNavItem[] }) {
  return (
    <nav
      aria-label="En esta página"
      className="mt-8 border border-line bg-paper-raised p-4"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        En esta página
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-accent underline underline-offset-2"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
