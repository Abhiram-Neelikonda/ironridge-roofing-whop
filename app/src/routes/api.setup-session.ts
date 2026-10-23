import { createFileRoute } from "@tanstack/react-router";
import { whopFetch, accountId, json } from "../lib/whop-api";

/**
 * POST /api/setup-session → create a **setup-mode checkout configuration**.
 * Returns `{ id: "ch_…" }`, which the client mounts with
 * `<Checkout checkoutConfiguration={id}>` to save a card with no charge.
 * The buyer's method becomes a setup intent (`sint_…`) we can charge later.
 */
export const Route = createFileRoute("/api/setup-session")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let input: { job_ref?: string } = {};
        try {
          input = (await request.json()) as { job_ref?: string };
        } catch {
          /* body is optional */
        }

        const origin = new URL(request.url).origin;
        const body = {
          mode: "setup",
          account_id: accountId(),
          currency: "usd",
          redirect_url: `${origin}/checkout/return`,
          metadata: {
            purpose: "final_balance_card_on_file",
            job_ref: input.job_ref ?? "",
          },
        };

        const res = await whopFetch<{ id?: string }>("/checkout_configurations", {
          method: "POST",
          body: JSON.stringify(body),
        });

        if (!res.ok || !res.data?.id) {
          return json({ error: res.error ?? "Could not start secure card setup." }, res.status || 502);
        }
        return json({ id: res.data.id }, 200);
      },
    },
  },
});
