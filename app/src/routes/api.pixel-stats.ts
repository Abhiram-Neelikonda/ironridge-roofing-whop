import { createFileRoute } from "@tanstack/react-router";
import { json } from "../lib/whop-api";
import { adminAuthed } from "../lib/auth";
import { pixelStats, dbConfigured } from "../lib/db";

/**
 * GET /api/pixel-stats → event counts + recent events from our DB, for the
 * /admin Pixels tab. Admin-token protected.
 */
export const Route = createFileRoute("/api/pixel-stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await adminAuthed(request))) return json({ error: "Unauthorized.", counts: [], recent: [] }, 401);
        if (!dbConfigured()) {
          return json({ counts: [], recent: [], note: "No database configured." }, 200);
        }
        const stats = await pixelStats();
        return json(stats, 200);
      },
    },
  },
});
