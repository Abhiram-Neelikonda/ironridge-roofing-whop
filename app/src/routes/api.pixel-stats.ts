import { createFileRoute } from "@tanstack/react-router";
import { json } from "../lib/whop-api";
import { pixelStats, dbConfigured } from "../lib/db";

/**
 * GET /api/pixel-stats → event counts + recent events from our DB, for the
 * /admin Pixels tab. Admin-token protected.
 */
export const Route = createFileRoute("/api/pixel-stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const adminToken = process.env.ADMIN_TOKEN;
        if (adminToken && request.headers.get("x-admin-token") !== adminToken) {
          return json({ error: "Unauthorized.", counts: [], recent: [] }, 401);
        }
        if (!dbConfigured()) {
          return json({ counts: [], recent: [], note: "No database configured." }, 200);
        }
        const stats = await pixelStats();
        return json(stats, 200);
      },
    },
  },
});
