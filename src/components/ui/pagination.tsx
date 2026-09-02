import Link from "next/link";

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  makeHref,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
  makeHref: (page: number) => string;
}) {
  const pages =
    totalPages ?? (total === 0 ? 0 : Math.max(1, Math.ceil(total / pageSize)));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (total === 0) return null;

  return (
    <nav
      aria-label="Paginación de resultados"
      className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-ink-muted">
        Mostrando {from}–{to} de {total}
        {pages > 1 ? ` · Página ${page} de ${pages}` : null}
      </p>
      {pages > 1 ? (
        <ul className="flex flex-wrap items-center gap-2">
          {page > 1 ? (
            <li>
              <Link
                className="inline-flex min-h-11 items-center border border-line px-3 py-2 hover:bg-accent-soft"
                href={makeHref(page - 1)}
                rel="prev"
              >
                Anterior
              </Link>
            </li>
          ) : (
            <li>
              <span className="inline-flex min-h-11 items-center border border-transparent px-3 py-2 text-ink-muted">
                Anterior
              </span>
            </li>
          )}
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <li key={n}>
              {n === page ? (
                <span
                  aria-current="page"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center border border-ink bg-ink px-3 py-2 text-paper-raised"
                >
                  {n}
                </span>
              ) : (
                <Link
                  className="inline-flex min-h-11 min-w-11 items-center justify-center border border-line px-3 py-2 hover:bg-accent-soft"
                  href={makeHref(n)}
                  aria-label={`Ir a la página ${n}`}
                >
                  {n}
                </Link>
              )}
            </li>
          ))}
          {page < pages ? (
            <li>
              <Link
                className="inline-flex min-h-11 items-center border border-line px-3 py-2 hover:bg-accent-soft"
                href={makeHref(page + 1)}
                rel="next"
              >
                Siguiente
              </Link>
            </li>
          ) : (
            <li>
              <span className="inline-flex min-h-11 items-center border border-transparent px-3 py-2 text-ink-muted">
                Siguiente
              </span>
            </li>
          )}
        </ul>
      ) : null}
    </nav>
  );
}
