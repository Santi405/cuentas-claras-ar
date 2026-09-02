import type { Paginated } from "./types";

export const PAGE_SIZE_MAX = 100;

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): Paginated<T> {
  const size = Math.min(Math.max(1, pageSize), PAGE_SIZE_MAX);
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / size);
  const safePage =
    total === 0 ? 1 : Math.min(Math.max(1, page), Math.max(1, totalPages));
  const start = (safePage - 1) * size;
  return {
    data: items.slice(start, start + size),
    meta: {
      page: safePage,
      pageSize: size,
      total,
      totalPages,
    },
  };
}
