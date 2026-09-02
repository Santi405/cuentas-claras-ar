export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugifyNombre(apellido: string, nombre: string): string {
  return slugify(`${apellido} ${nombre}`);
}

export function slugifyDistrito(distrito: string): string {
  return slugify(distrito);
}

export function sameDistrito(
  nombre: string | null | undefined,
  param: string,
): boolean {
  if (!nombre) return false;
  return slugifyDistrito(nombre) === slugifyDistrito(param);
}

export function withSlugSuffix(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  const slug = `${base}-${n}`;
  used.add(slug);
  return slug;
}

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
