export const API_ERROR_CODE = {
  INVALID_QUERY: "INVALID_QUERY",
  NOT_FOUND: "NOT_FOUND",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE];

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};

const API_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow",
} as const;

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: {
      ...API_HEADERS,
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      ...init?.headers,
    },
  });
}

export function jsonError(
  status: number,
  code: ApiErrorCode,
  message: string,
) {
  const body: ApiErrorBody = { error: { code, message } };
  return Response.json(body, {
    status,
    headers: {
      ...API_HEADERS,
    },
  });
}

export function invalidQuery(message: string) {
  return jsonError(400, API_ERROR_CODE.INVALID_QUERY, message);
}

export function notFound(message = "Legislador no encontrado") {
  return jsonError(404, API_ERROR_CODE.NOT_FOUND, message);
}
