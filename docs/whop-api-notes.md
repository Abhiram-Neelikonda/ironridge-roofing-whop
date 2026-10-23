# Whop API notes (research, 2026-10-23)

Pulled from docs.whop.com (OpenAPI version `2026-10-15-1`). Check against the live docs if anything fails, because Whop changes fast.

## Hosts

| | Production | Sandbox |
|---|---|---|
| Dashboard | https://whop.com/dashboard | https://sandbox.whop.com |
| API | https://api.whop.com/api/v1 | https://sandbox-api.whop.com/api/v1 |

On Whop hosting, build URLs from `process.env.WHOP_API_ORIGIN`. Server-side fetches get the app key attached automatically. Send the header `x-whop-inject-key: none` to opt out.

Runtime env: `APP_ID`, `BUILD_ID`, `WHOP_API_ORIGIN`, `WHOP_ACCOUNT_ID` (`biz_…`), plus any secrets from `whop apps secrets set --secret KEY=value`.

## CLI cheatsheet

```bash
brew install whopio/tap/whop          # or: npm install -g @whop/cli  (Node ≥ 22)
whop login && whop quickstart
whop apps init --app_type website --name "IronRidge Roofing" --domain ironridge-roofing
whop apps dev                         # local, with hosted env injected
whop apps deploy                      # build + typecheck + upload + promote
whop apps deploy --preview            # upload only
whop apps builds promote abld_xxx     # promote / roll back
whop apps logs --level error --query "invoice"
whop apps secrets set --secret ADMIN_TOKEN=...
whop plans create --help
whop checkout-configurations create --plan_id plan_xxx
whop payment-method-domains create --help
whop setup-intents list
```
⚠️ The CLI has no sandbox or dry-run. Every command hits production.

## Elements (React)

```bash
npm install @whop/elements-react @whop/elements   # needs React ^19, use ≥ 1.9.0
```

```tsx
import { WhopElements, Checkout, CheckoutElement, ExpressCheckoutElement, BrandingElement,
         Payments, PaymentElement } from "@whop/elements-react";
import { loadWhop } from "@whop/elements";

const elements = loadWhop();

// Express wallets: their own <Checkout>, because Express and CheckoutElement share one entry slot
<WhopElements elements={elements} /* environment="sandbox" */>
  <Checkout plan={plans.deposit} returnUrl={`${origin}/checkout/return`} metadata={{ job_ref }}
            onComplete={(p) => /* p.result: "payment" | "setup" | "waitlist_entry" */ {}}>
    <ExpressCheckoutElement wallets={{ applePay: "auto", googlePay: "auto", payPal: "never" }} />
  </Checkout>

  <Checkout plan={plans.deposit} returnUrl={`${origin}/checkout/return`} metadata={{ job_ref }}>
    <CheckoutElement />
    <BrandingElement />  {/* ← spike: confirm this is allowed inside <Checkout> */}
  </Checkout>
</WhopElements>

// Fallback card form if Branding must live inside <Payments>:
<Payments accountId={bizId} plan={plans.deposit}>
  <PaymentElement />
  <BrandingElement />   {/* required: confirmation fails without it (BrandingRequiredError) */}
</Payments>
```

Key facts:
- `<Checkout>` needs one of `plan` (`plan_…`), `items`, or `checkoutConfiguration` (`ch_…`). Options are frozen after mount (`CHECKOUT_OPTIONS_FROZEN`). Remount to change them.
- `onComplete` fires once per mount, before the `returnUrl` redirect. `result: "setup"` includes `setupIntentId`.
- `returnUrl` gets `?payment=…&status=succeeded|failed|canceled`. Always check `status`.
- Fulfill from webhooks, not from `onComplete`, because a restored checkout can fire it again.
- Express wallets only show on a **verified payment method domain** (whop.com is pre-approved; our site domain must be registered).
- CSP needs `frame-src https://cdn.whop.com` and `connect-src https://api.whop.com` (or the sandbox API). The `contentSecurityPolicy()` helper returns the full set.
- Sandbox Elements: `<WhopElements environment="sandbox">`. Docs say this is **not available yet** (as of research date).

## Leads: `POST /leads`

Permissions: `lead:manage`, `member:email:read`, `access_pass:basic:read`, `member:basic:read`.

```ts
// src/routes/api.leads.ts (server)
const res = await fetch(`${process.env.WHOP_API_ORIGIN}/api/v1/leads`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    account_id: process.env.WHOP_ACCOUNT_ID,   // required, biz_…
    product_id: plans.productId,               // optional, prod_…
    referrer: request.headers.get("referer"),  // optional
    metadata: {                                // optional, any JSON
      source: "estimate_form", name, email, phone, address, zip,
      service, roof_type, timeline, notes,
    },
  }),
});
```
`user_id` is optional. A logged-out website visitor has no Whop user, so contact details go in `metadata`.

## Checkout configuration (setup mode): `POST /checkout_configurations`

Variants: `mode: "payment"` + `plan_id`, `mode: "payment"` + inline `plan`, or **`mode: "setup"`**.

```ts
body: JSON.stringify({
  mode: "setup",
  account_id: process.env.WHOP_ACCOUNT_ID,  // "Only required in setup mode"
  currency: "usd",                          // defaults to USD in setup mode
  redirect_url: `${origin}/checkout/return`,
  metadata: { job_ref, purpose: "final_balance_card_on_file" },
})
// → { id: "ch_…", purchase_url, … } → <Checkout checkoutConfiguration={id}>
```

## Setup intents: `GET /setup-intents` and `GET /setup-intents/{id}`

Each setup intent (`sint_…`) has `member { id, user { email, name } }`, `payment_method { id: pmt_…, card { brand, last4 } }` (null until it succeeds), `checkout_configuration { id }`, `error_message`, `metadata`.

## Invoices: `POST /invoices`

| Field | Notes |
|---|---|
| `account_id` | biz_… |
| `collection_method` | `charge_automatically` (charge a stored method) or `send_invoice` (email the customer) |
| `member_id` | existing member (`mber_…`). If missing, give `email_address` + `customer_name` |
| `payment_method_id` | `pmt_…`, **required for charge_automatically** |
| `payment_token_id` | docs also mention `payt_…` for charge_automatically. **Test which one is accepted.** |
| `due_date` | ISO date, required unless `save_as_draft` |
| `automatically_finalizes_at` | scheduled auto-charge / auto-send |
| `product_id` or `product: { title }` | which product the invoice belongs to |
| `plan: { initial_price, currency, plan_type, … }` | price definition (**check whether units are dollars or cents**) |
| `line_items: [{ label, unit_price, quantity }]` | must add up to the plan price; negative lines allowed as credits |
| `save_as_draft` | handy for the Day 1 scope test |
| `charge_buyer_fee` | optional |

```ts
// Charge card on file
{
  account_id, collection_method: "charge_automatically",
  member_id, payment_method_id,
  due_date: new Date().toISOString(),
  product_id: plans.productId,
  plan: { initial_price: 8801, currency: "usd", plan_type: "one_time" },
  line_items: [
    { label: "Roof replacement – 24 sq architectural shingles", unit_price: 9450 },
    { label: "Less project deposit", unit_price: -500 },
    { label: "Less inspection credit", unit_price: -149 },
  ],
}
// Send for manual payment: swap to collection_method: "send_invoice",
// drop payment_method_id, add email_address + customer_name, due_date = +14 days.
```

## Pixel / whop.track

```js
whop.track("estimate_requested", { event_id: "lead_xxx", service: "replacement" });
whop.track("deposit_started", { event_id: sessionId, value: 500, currency: "USD" });
```
- Any non-standard name works as a custom event.
- Standard names: `lead`, `schedule`, `submit_application`, `contact`, `complete_registration`, `view_content`, `add_to_cart`.
- `event_id` dedupes on the (name, id) pair. Use a real id, not a constant.
- Automatic: page views, Whop checkout views, purchases/subscriptions/trials.
- Check in Dashboard → Pixel (about 1 minute delay) and Dashboard → Websites.

## Doc links
- Websites quickstart: https://docs.whop.com/developer/websites/quickstart
- Hosting: https://docs.whop.com/developer/websites/hosting
- Tracking: https://docs.whop.com/developer/websites/tracking
- Pixel: https://docs.whop.com/developer/ads/pixel
- Elements: https://docs.whop.com/elements
- Checkout element: https://docs.whop.com/elements/latest/checkout/overview
- Express checkout: https://docs.whop.com/elements/latest/checkout/expressCheckout
- Branding: https://docs.whop.com/elements/latest/payments/branding
- Payments (setup mode): https://docs.whop.com/elements/latest/payments/overview
- Sandbox: https://docs.whop.com/developer/guides/sandbox
- CLI: https://docs.whop.com/developer/cli
- API: leads/create-lead · invoices/create-invoice · checkout-configurations/create-checkout-configuration · setup-intents/list-setup-intents · plans/create-plan · payment-method-domains/create-payment-method-domain (all under https://docs.whop.com/api-reference/)
