import Link from "next/link";

export function Pagination({
  page,
  pageSize,
  total,
  makeHref,
}: {
  page: number;
  pageSize: number;
  total: number;
  makeHref: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  return (
    <nav aria-label="Paginación" className="mt-6 flex items-center justify-between text-sm">
      <p className="text-ink-muted">
        Página {page} de {pages} · {total} resultados
      </p>
      <ul className="flex gap-2">
        {page > 1 ? (
          <li>
            <Link className="inline-flex min-h-11 items-center border border-line px-3 py-2 hover:bg-accent-soft" href={makeHref(page - 1)}>
              Anterior
            </Link>
          </li>
        ) : null}
        {page < pages ? (
          <li>
            <Link className="inline-flex min-h-11 items-center border border-line px-3 py-2 hover:bg-accent-soft" href={makeHref(page + 1)}>
              Siguiente
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
