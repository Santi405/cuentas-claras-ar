import { isMockMode } from "@/lib/data/mode";

export function DemoBanner() {
  if (!isMockMode()) return null;

  return (
    <div
      role="status"
      className="border-b border-warning/30 bg-warning-bg px-4 py-2 text-center text-sm text-warning"
    >
      <strong className="font-medium">Datos de demostración.</strong> Personas y
      montos ficticios. No corresponden a funcionarios reales.
    </div>
  );
}
