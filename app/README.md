# IronRidge Roofing — Whop Websites template

A production-ready, reusable website template for a US roofing company, built on
**Whop Websites** (React + Vite / TanStack Start) and deployed to a `*.whop.site`
address with the Whop CLI. It demonstrates the full high-ticket flow:

**Estimate request (Lead) → $149 inspection / $500 deposit (Payment Elements, card on file) → final balance (Invoices API).**

## What's implemented (Whop features)

- **Whop Websites hosting** — scaffolded for `whop apps deploy`; server routes call the Whop REST API through the platform's signed outbound proxy (`WHOP_API_ORIGIN`), so the API key never touches the client.
- **Payment Elements, checkout entirely on Whop** — `ExpressCheckoutElement` (Apple Pay / Google Pay), `CheckoutElement` (full checkout with promo codes + financing/BNPL), and the required `BrandingElement` merchant-of-record notice. No custom card fields. (`src/components/checkout/CheckoutPanel.tsx`)
- **Three real plans** — a **$149** inspection, a **$500** project deposit, and a **$399** flat-rate leak repair, created from `src/config/site.ts` by `npm run setup:whop`.
- **Leads API** — the "Request an Estimate" form creates a Lead (`src/routes/api.leads.ts`).
- **Card on file → final invoice** — after the deposit, a **setup-mode checkout configuration** saves a card (setup intent); `/admin` bills the final balance via the **Invoices API**, either auto-charging the saved card or emailing the invoice (`src/routes/api.setup-session.ts`, `api.setup-intents.ts`, `api.invoices.ts`).
- **Custom pixel events** via `whop.track` with `event_id` dedupe: `estimate_requested`, `service_viewed`, `deposit_started` (plus `inspection_started`, `card_saved`). Page views + checkout events are automatic. (`src/lib/track.ts`)

## Run locally

```bash
npm install
npm run images     # optimize /assets/images → public/images (needs the source photos)
npm run dev        # http://localhost:5173
```

Elements and the Whop API calls only work once the site is connected to a Whop
account (see below). Locally, checkout shows a layout preview and the Leads/Invoices
calls are unauthenticated — that's expected.

## Deploy to Whop

```bash
# 1. Install + sign in (production; the CLI has no sandbox)
curl -fsSL https://whop.com/install.sh | sh
whop login && whop quickstart

# 2. Register + link this app (run from the app/ folder)
whop apps init --app_type website --name "IronRidge Roofing" --domain ironridge-roofing
#   …or link an app you already created: whop apps init --app app_xxx

# 3. Create the product + 3 plans, then set your account id
WHOP_API_KEY=whop_xxx WHOP_ACCOUNT_ID=biz_xxx npm run setup:whop
#   then set site.brand.accountId = your biz_… in src/config/site.ts

# 4. Secrets + deploy
whop apps secrets set --secret ADMIN_TOKEN=your-long-random-string
whop apps deploy

# 5. Enable Apple Pay / Google Pay on your live domain
whop payment-method-domains create   # register the deployed domain
```

Verify after deploy: complete a Payment Elements checkout, submit the estimate
form (a Lead appears in the dashboard), save a card on the deposit page, bill a
balance from `/admin`, and check events in the Whop **Pixel** dashboard
(append `?debug=1` to any page to log events to the console on camera).

## Re-skin for a new roofer (no structural changes)

Everything a client needs to change lives in **`src/config/site.ts`**:
company name, phone/email, brand colors, services, service area, reviews,
financing copy, and the three plan prices. Then:

```bash
# 1. drop new photos in ../assets/images (match the names in site.ts) and:
npm run images
# 2. recreate the plans at the new prices:
npm run setup:whop
# 3. deploy:
whop apps deploy
```

No component, route, or style file needs editing to change branding or pricing.

## Project map

```
src/
  config/site.ts         ← the only file to edit per client
  config/plans.json      ← written by setup:whop (real plan ids)
  lib/track.ts           ← whop.track wrapper (event_id + ?debug=1)
  lib/whop-api.ts        ← server fetch via WHOP_API_ORIGIN
  components/            ← Header, sections/*, checkout/*, ui/*
  routes/
    index.tsx            ← one-page marketing site
    book.$plan.tsx       ← /book/inspection | /book/deposit | /book/flatRate
    checkout.return.tsx  ← Payment Elements returnUrl
    admin.tsx            ← bill the final balance (Invoices API)
    api.leads.ts · api.setup-session.ts · api.setup-intents.ts · api.invoices.ts
```
