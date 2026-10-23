import { createFileRoute } from "@tanstack/react-router";
import { whopFetch, accountId, json } from "../lib/whop-api";

interface Notification {
  id: string;
  subject?: string;
  content?: string;
  created_at?: string;
}

/**
 * GET /api/leads-list → recent estimate-request leads, read back from the Whop
 * notifications the form handler posts (subject "New estimate request — …").
 * Used by the Leads tab of /admin. Admin-token protected.
 */
export const Route = createFileRoute("/api/leads-list")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const adminToken = process.env.ADMIN_TOKEN;
        if (adminToken && request.headers.get("x-admin-token") !== adminToken) {
          return json({ error: "Unauthorized.", data: [] }, 401);
        }

        const res = await whopFetch<{ data?: Notification[] }>(
          `/notifications?account_id=${accountId()}&per=30`,
          { method: "GET" },
        );
        if (!res.ok) {
          return json(
            { data: [], note: "Lead notifications aren't readable here — see Marketing → Leads in your dashboard." },
            200,
          );
        }
        const leads = (res.data?.data ?? [])
          .filter((n) => (n.subject ?? "").toLowerCase().startsWith("new estimate request"))
          .map((n) => ({
            id: n.id,
            name: (n.subject ?? "").replace(/^New estimate request —\s*/i, "") || "Lead",
            details: n.content ?? "",
            createdAt: n.created_at,
          }));
        return json({ data: leads }, 200);
      },
    },
  },
});
