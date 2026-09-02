import { iniciales } from "@/lib/domain/formatters";

export function AvatarIniciales({
  nombre,
  apellido,
}: {
  nombre: string;
  apellido: string;
}) {
  return (
    <span
      aria-hidden
      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft font-serif text-lg text-accent"
    >
      {iniciales(nombre, apellido)}
    </span>
  );
}
