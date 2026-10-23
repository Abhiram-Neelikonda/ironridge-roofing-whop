import { createFileRoute } from "@tanstack/react-router";
import { json } from "../lib/whop-api";
import { insertEvent } from "../lib/db";

/**
 * POST /api/track-log → mirrors a whop.track custom event into our DB so the
 * /admin Pixels tab can show live counts. Fire-and-forget; always returns ok.
 */
export const Route = createFileRoute("/api/track-log")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const b = (await request.json()) as { event?: string; props?: unknown };
          const event = String(b.event ?? "").trim().slice(0, 64);
          if (event) await insertEvent(event, b.props ?? {});
        } catch {
          /* non-fatal */
        }
        return json({ ok: true }, 200);
      },
    },
  },
});
