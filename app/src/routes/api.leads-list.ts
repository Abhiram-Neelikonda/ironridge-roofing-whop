import { createFileRoute } from "@tanstack/react-router";
import { json } from "../lib/whop-api";
import { listLeads, dbConfigured } from "../lib/db";

/**
 * GET /api/leads-list → recent leads from our Neon database. Admin-token
 * protected. Used by the Leads tab of /admin.
 */
export const Route = createFileRoute("/api/leads-list")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const adminToken = process.env.ADMIN_TOKEN;
        if (adminToken && request.headers.get("x-admin-token") !== adminToken) {
          return json({ error: "Unauthorized.", data: [] }, 401);
        }
        if (!dbConfigured()) {
          return json(
            { data: [], note: "No database configured — set DATABASE_URL. Leads also appear in Marketing → Leads." },
            200,
          );
        }

        const rows = await listLeads(50);
        const data = rows.map((l) => {
          const details = [
            l.service && `Service: ${l.service}`,
            l.phone && `📞 ${l.phone}`,
            l.email && `✉️ ${l.email}`,
            l.roof_type && `Roof: ${l.roof_type}`,
            l.timeline && `Timeline: ${l.timeline}`,
            l.notes && `“${l.notes}”`,
          ]
            .filter(Boolean)
            .join("  ·  ");
          return { id: l.id, name: l.name || "Lead", details, createdAt: l.created_at };
        });
        return json(
          { data, note: data.length ? undefined : "No leads yet — submit the estimate form to see one here." },
          200,
        );
      },
    },
  },
});
