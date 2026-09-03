export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

const API_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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
  code: string,
  message: string,
  details?: unknown,
) {
  const body: ApiErrorBody = { error: { code, message, details } };
  return Response.json(body, {
    status,
    headers: {
      ...API_HEADERS,
    },
  });
}

export function optionsOk() {
  return new Response(null, {
    status: 204,
    headers: {
      ...API_HEADERS,
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
