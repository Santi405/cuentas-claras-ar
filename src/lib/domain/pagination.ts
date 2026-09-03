import type { Paginated } from "./types";

export const PAGE_SIZE_MAX = 100;

export function paginationWindow(page: number, pageSize: number, total: number) {
  const size = Math.min(Math.max(1, pageSize), PAGE_SIZE_MAX);
  const totalPages = total === 0 ? 0 : Math.ceil(total / size);
  const safePage =
    total === 0 ? 1 : Math.min(Math.max(1, page), Math.max(1, totalPages));
  return {
    page: safePage,
    pageSize: size,
    total,
    totalPages,
    offset: (safePage - 1) * size,
  };
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): Paginated<T> {
  const window = paginationWindow(page, pageSize, items.length);
  return {
    data: items.slice(window.offset, window.offset + window.pageSize),
    meta: {
      page: window.page,
      pageSize: window.pageSize,
      total: window.total,
      totalPages: window.totalPages,
    },
  };
}
