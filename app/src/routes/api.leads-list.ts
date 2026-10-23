import { createFileRoute } from "@tanstack/react-router";
import { whopFetch, json } from "../lib/whop-api";

interface Lead {
  id: string;
  created_at?: string;
  referrer?: string;
  metadata?: Record<string, string>;
  user?: { id?: string; name?: string; email?: string };
}

/**
 * GET /api/leads-list → recent leads from the Whop Leads API. Admin-token
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

        const res = await whopFetch<{ data?: Lead[] }>("/leads?first=30", { method: "GET" });
        if (!res.ok) {
          return json(
            {
              data: [],
              note: "Leads aren't listable via the API here — open Marketing → Leads in your Whop dashboard to see them.",
            },
            200,
          );
        }
        const leads = (res.data?.data ?? []).map((l) => {
          const m = l.metadata ?? {};
          const details = [
            m.service && `Service: ${m.service}`,
            (m.phone || "") && `📞 ${m.phone}`,
            (l.user?.email || m.email) && `✉️ ${l.user?.email || m.email}`,
            m.roof_type && `Roof: ${m.roof_type}`,
            m.timeline && `Timeline: ${m.timeline}`,
            m.notes && `“${m.notes}”`,
          ]
            .filter(Boolean)
            .join("  ·  ");
          return {
            id: l.id,
            name: l.user?.name || m.name || "Lead",
            details: details || l.referrer || "",
            createdAt: l.created_at,
          };
        });
        return json({ data: leads, note: leads.length ? undefined : "No leads via the API yet — your form leads also appear in Marketing → Leads." }, 200);
      },
    },
  },
});
