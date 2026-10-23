import { createFileRoute } from "@tanstack/react-router";
import { whopFetch, accountId, json } from "../lib/whop-api";
import { sendThankYou } from "../lib/mail";
import plans from "../config/plans.json";

/**
 * POST /api/leads → turns an estimate-form submission into something the
 * business actually sees on their Whop account.
 *
 * How leads surface on Whop:
 *  1. Notification (primary): the server sends a Whop notification to the
 *     account's team with the lead's details — visible in the owner's Whop
 *     dashboard/notifications. This works for anonymous visitors because the
 *     hosting proxy signs the call with the APP key (notifications require an
 *     app credential).
 *  2. Leads REST API (optional): only when a Whop `user_id` is supplied (e.g. a
 *     logged-in Whop visitor), since that API ties a lead to a Whop user and has
 *     no email field.
 *  3. Pixel `lead` event (analytics): fired on the client, shows in the Pixel /
 *     Websites reporting for attribution.
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

        // Honeypot: silently accept bots without notifying anyone.
        if (form.company_website) return json({ ok: true, id: "ignored" }, 200);

        if (!form.name || !form.email) {
          return json({ error: "Name and email are required." }, 400);
        }

        const details = [
          `Service: ${form.service || "Roofing estimate"}`,
          form.phone && `📞 ${form.phone}`,
          `✉️ ${form.email}`,
          form.roof_type && `Roof: ${form.roof_type}`,
          form.timeline && `Timeline: ${form.timeline}`,
          form.notes && `“${form.notes}”`,
        ]
          .filter(Boolean)
          .join("  ·  ");

        // 1) Notify the business team — the lead lands in the Whop dashboard.
        // (Create takes `title` + `content`; it's returned as `subject`.)
        const notif = await whopFetch("/notifications", {
          method: "POST",
          body: JSON.stringify({
            account_id: accountId(),
            title: `New estimate request — ${form.name}`,
            subtitle: form.service || "Roofing estimate",
            content: details,
          }),
        });
        if (!notif.ok) {
          console.error(`[leads] notification failed: ${notif.status} ${notif.error}`);
        }

        // 2) Optional Leads API record when a Whop user is identified.
        let leadId: string | undefined;
        const userId = form.user_id?.trim();
        if (userId) {
          const res = await whopFetch<{ id?: string; lead?: { id?: string } }>("/leads", {
            method: "POST",
            body: JSON.stringify({
              account_id: accountId(),
              user_id: userId,
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
            }),
          });
          if (res.ok) leadId = res.data?.id ?? res.data?.lead?.id;
        }

        // 3) Thank-you email to the customer (no-op unless RESEND_API_KEY is set).
        const emailed = await sendThankYou(form.email, form.name, form.service);

        return json({ ok: true, id: leadId, notified: notif.ok, emailed }, 200);
      },
    },
  },
});
