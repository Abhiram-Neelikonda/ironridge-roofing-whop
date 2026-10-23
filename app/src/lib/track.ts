/**
 * Thin wrapper around the Whop Pixel (`window.whop.track`).
 *
 * The pixel is injected automatically on whop.site/whop.app, and `window.whop`
 * exists before our code runs. We add:
 *   - an `event_id` so a retry / refresh / double-mount counts once
 *   - a console log when `?debug=1` is in the URL, so events are easy to show
 *     on camera during the demo.
 *
 * Automatic events (page views, checkout views, purchases) need no code.
 */

type TrackProps = Record<string, string | number | boolean | undefined> & {
  event_id?: string;
  value?: number;
  currency?: string;
};

declare global {
  interface Window {
    whop?: { track: (event: string, props?: Record<string, unknown>) => void };
  }
}

function debugOn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).has("debug");
  } catch {
    return false;
  }
}

/** Fire a custom pixel event. Safe to call during SSR (no-ops on the server). */
export function track(event: string, props: TrackProps = {}): void {
  if (typeof window === "undefined") return;
  const clean = Object.fromEntries(
    Object.entries(props).filter(([, v]) => v !== undefined && v !== ""),
  );
  try {
    window.whop?.track(event, clean);
  } catch (err) {
    if (debugOn()) console.warn("[whop.track] failed", err);
  }
  // Mirror the event into our DB so /admin can show live counts (fire-and-forget).
  try {
    void fetch("/api/track-log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event, props: clean }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
  if (debugOn()) {
    // eslint-disable-next-line no-console
    console.log(`%c[whop.track] ${event}`, "color:#315C4C;font-weight:700", clean);
  }
}

/** Stable-ish id for dedupe within a browser session. */
export function sessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const KEY = "ir_sid";
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "nosession";
  }
}
