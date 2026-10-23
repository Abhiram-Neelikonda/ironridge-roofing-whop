import { createFileRoute } from "@tanstack/react-router";
import { whopFetch, json, accountId } from "../lib/whop-api";
import { adminAuthed } from "../lib/auth";

interface SetupIntent {
  id: string;
  status?: string;
  created_at?: string;
  member?: { id?: string; user?: { name?: string; email?: string } };
  payment_method?: { id?: string; card?: { brand?: string; last4?: string } };
  metadata?: Record<string, string>;
}

/**
 * GET /api/setup-intents → recent successful setup intents (saved cards on file),
 * used by /admin to pick the customer whose final balance is being billed.
 */
export const Route = createFileRoute("/api/setup-intents")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await adminAuthed(request))) return json({ error: "Unauthorized.", data: [] }, 401);
        const res = await whopFetch<{ data?: SetupIntent[] }>(
          `/setup_intents?company_id=${accountId()}&per=25`,
          { method: "GET" },
        );
        if (!res.ok) {
          return json({ error: res.error ?? "Could not load saved cards.", data: [] }, res.status || 502);
        }
        const list = res.data?.data ?? [];
        // Only those with a usable saved payment method.
        const usable = list
          .filter((s) => s.payment_method?.id && s.member?.id)
          .map((s) => ({
            id: s.id,
            created_at: s.created_at,
            memberId: s.member?.id,
            name: s.member?.user?.name,
            email: s.member?.user?.email,
            paymentMethodId: s.payment_method?.id,
            card: s.payment_method?.card
              ? `${s.payment_method.card.brand ?? "card"} •••• ${s.payment_method.card.last4 ?? ""}`
              : undefined,
            jobRef: s.metadata?.job_ref,
          }));
        return json({ data: usable }, 200);
      },
    },
  },
});
