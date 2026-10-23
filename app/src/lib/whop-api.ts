/**
 * Server-side Whop REST helper.
 *
 * On Whop hosting, server `fetch` calls to WHOP_API_ORIGIN are signed with the
 * app's API key automatically (see docs: Websites → Hosting). The key never
 * reaches our code. Locally (`vite dev` without the Whop runtime) these calls
 * are unauthenticated and will fail — that's expected; deploy to test them.
 */

const API_ORIGIN = process.env.WHOP_API_ORIGIN ?? "https://api.whop.com";
const ACCOUNT_ID = process.env.WHOP_ACCOUNT_ID ?? "";

export function apiOrigin() {
  return API_ORIGIN;
}

export function accountId() {
  return ACCOUNT_ID;
}

export interface WhopResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

/** POST/GET the Whop API v1. The hosting proxy injects the app key on the server. */
export async function whopFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<WhopResult<T>> {
  const url = `${API_ORIGIN}/api/v1${path}`;
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        ...(init.headers ?? {}),
      },
    });
    const text = await res.text();
    const data = text ? safeJson(text) : undefined;
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error:
          (data as { message?: string })?.message ??
          `Whop API ${res.status}`,
        data: data as T,
      };
    }
    return { ok: true, status: res.status, data: data as T };
  } catch (err) {
    return { ok: false, status: 0, error: (err as Error).message };
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/** Standard JSON Response helper for server route handlers. */
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
