import type { ReactNode } from "react";

export function StatusNotice({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="border border-warning/40 bg-warning-bg px-4 py-3 text-sm text-warning"
    >
      {children}
    </p>
  );
}
