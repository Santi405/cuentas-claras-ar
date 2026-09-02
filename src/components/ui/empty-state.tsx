import type { ReactNode } from "react";

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-line bg-paper-raised px-6 py-12 text-center">
      <h2 className="font-serif text-xl text-ink">{title}</h2>
      {children ? <div className="mt-3 text-sm text-ink-muted">{children}</div> : null}
    </div>
  );
}
