import { createFileRoute } from "@tanstack/react-router";
import { whopFetch, accountId, json } from "../lib/whop-api";
import plans from "../config/plans.json";

/**
 * POST /api/leads → Whop Leads API.
 * A website visitor isn't a Whop user, so their details go in `metadata`.
 * The hosting proxy signs this request with the app key (server-side only).
 */
export const Route = createFileRoute("/api/leads")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let form: Record<string, string> = {};
        try {
          form = (await request.json()) as Record<string, string>;
        } catch {
          return json({ error: "Invalid request body." }, 400);
        }

        // Honeypot: silently accept bots without creating a lead.
        if (form.company_website) return json({ id: "ignored" }, 200);

        if (!form.name || !form.email) {
          return json({ error: "Name and email are required." }, 400);
        }

        const body = {
          account_id: accountId(),
          product_id: plans.productId?.includes("XXXX") ? undefined : plans.productId,
          referrer: request.headers.get("referer") ?? undefined,
          metadata: {
            source: "estimate_form",
            name: form.name,
            email: form.email,
            phone: form.phone ?? "",
            service: form.service ?? "",
            roof_type: form.roof_type ?? "",
            timeline: form.timeline ?? "",
            notes: form.notes ?? "",
          },
        };

        const res = await whopFetch<{ id?: string; lead?: { id?: string } }>("/leads", {
          method: "POST",
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          return json({ error: res.error ?? "Could not submit your request." }, res.status || 502);
        }
        const id = res.data?.id ?? res.data?.lead?.id;
        return json({ ok: true, id }, 200);
      },
    },
  },
});
