import { createFileRoute } from "@tanstack/react-router";
import { whopFetch, accountId, json } from "../lib/whop-api";
import { adminAuthed } from "../lib/auth";
import plans from "../config/plans.json";

/**
 * POST /api/invoices → Whop Invoices API, used by /admin to bill the final balance.
 *
 *   mode "charge"  → collection_method: charge_automatically (charge the saved card)
 *   mode "send"    → collection_method: send_invoice (email the customer to pay on Whop)
 *
 * ⚠️ Whop money amounts are in whole currency units (dollars), e.g. 8801 = $8,801.
 * Protected by the ADMIN_TOKEN app secret when it is set.
 */
interface LineItem {
  label: string;
  amount: number; // dollars; may be negative for credits
}
interface InvoiceInput {
  mode: "charge" | "send";
  memberId?: string;
  paymentMethodId?: string;
  email?: string;
  customerName?: string;
  lineItems: LineItem[];
}

export const Route = createFileRoute("/api/invoices")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await adminAuthed(request))) return json({ error: "Unauthorized." }, 401);

        let input: InvoiceInput;
        try {
          input = (await request.json()) as InvoiceInput;
        } catch {
          return json({ error: "Invalid request body." }, 400);
        }

        const items = (input.lineItems ?? []).filter((l) => l.label && Number.isFinite(l.amount));
        const total = items.reduce((sum, l) => sum + l.amount, 0);
        if (items.length === 0 || total <= 0) {
          return json({ error: "Add at least one line item with a positive total." }, 400);
        }

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (input.mode === "send" ? 14 : 1));

        const base: Record<string, unknown> = {
          account_id: accountId(),
          due_date: dueDate.toISOString(),
          plan: { initial_price: total, currency: "usd", plan_type: "one_time" },
          line_items: items.map((l) => ({ label: l.label, unit_price: l.amount, quantity: 1 })),
        };
        if (!plans.productId?.includes("XXXX")) base.product_id = plans.productId;

        if (input.mode === "charge") {
          if (!input.memberId || !input.paymentMethodId) {
            return json({ error: "A saved card (member + payment method) is required to auto-charge." }, 400);
          }
          base.collection_method = "charge_automatically";
          base.member_id = input.memberId;
          base.payment_method_id = input.paymentMethodId;
        } else {
          if (!input.email || !input.customerName) {
            return json({ error: "Customer name and email are required to send an invoice." }, 400);
          }
          base.collection_method = "send_invoice";
          base.email_address = input.email;
          base.customer_name = input.customerName;
        }

        const res = await whopFetch<{ id?: string; status?: string; hosted_url?: string }>("/invoices", {
          method: "POST",
          body: JSON.stringify(base),
        });

        if (!res.ok) {
          return json({ error: res.error ?? "Could not create the invoice." }, res.status || 502);
        }
        return json(
          { ok: true, id: res.data?.id, status: res.data?.status, url: res.data?.hosted_url, total },
          200,
        );
      },
    },
  },
});
