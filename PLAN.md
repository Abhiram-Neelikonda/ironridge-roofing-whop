# Plan: Whop roofing website template

A website template for a US roofing company, built on Whop Websites and deployed with the Whop CLI. The template exists to pitch real roofers, so it has to show the full high-ticket money flow on Whop:

**Estimate request (Lead) → $149 inspection or $500 deposit (Payment Elements + card saved on file) → job done → final balance billed with the Invoices API.**

API details and doc links are in [docs/whop-api-notes.md](docs/whop-api-notes.md).

---

## 0. Things the brief gets slightly wrong (check these first)

What I found in the current Whop docs (API version `2026-10-15`) that changes the plan:

| # | What the brief says | What the docs say | What we do |
|---|---|---|---|
| 1 | Site lives on a **whop.app** URL | `whop apps deploy` gives you a **`<name>.whop.site`** address | Deploy, then use whatever URL the CLI prints. If the judges insist on `whop.app`, ask in the bounty channel. |
| 2 | "Test/sandbox checkout must complete" | Whop has a sandbox (`sandbox.whop.com`), but **Elements in sandbox is "not available yet"** | Day 1: test `environment="sandbox"`. If it still fails, fall back to a **hidden $1 test plan in production**, pay with a real card, then refund it (see §8). |
| 3 | `CheckoutElement` + `BrandingElement` | `BrandingElement` is documented inside `<Payments>`. `<Checkout>` "composes the payments elements inside" | Day 1 spike: confirm `<BrandingElement/>` can be mounted inside `<Checkout>`. If not, use `<Payments>` + `<PaymentElement/>` + `<BrandingElement/>` for card entry. |
| 4 | Apple Pay / Google Pay just work | `ExpressCheckoutElement` buttons **stay hidden** unless the page's domain is a verified **payment method domain** | Register the deployed domain with `whop payment-method-domains create` right after the first deploy. |
| 5 | CLI does everything | The CLI has **no sandbox mode**: every command runs in production | Create the plans in production but keep them unlisted/hidden. Products for the demo company only. |
| 6 | Server can call any API | The app's injected key **can't move money** (payouts/transfers). Invoices and leads need the `lead:manage` / invoice permissions | Test both calls on Day 1. If we hit scope errors, store our own API key with `whop apps secrets set`. |

---

## 1. Tech stack (what Whop gives us)

- **Framework:** React 19 + Vite, scaffolded by `whop apps init` (TanStack Start). The `whop()` Vite plugin builds `dist/client` (static) and `dist/server` (server routes).
- **Hosting:** Whop runs the build. Server-side `fetch` calls to `${WHOP_API_ORIGIN}/api/v1/...` are signed with the app's API key automatically, so the key never sits in our code.
- **Payments:** `@whop/elements-react` + `@whop/elements` (≥ 1.9.0).
- **Tracking:** the Whop Pixel loads automatically on Whop-hosted sites. `window.whop.track()` is ready before our code runs.
- **Data store:** none. Whop is the record of truth: leads, payments, setup intents, members and invoices all live on the Whop account. That keeps the template easy to copy.

---

## 2. Folder layout (target)

```
whop-roofing-template/
├── PLAN.md                     ← this file
├── docs/
│   ├── whop-api-notes.md       ← API research + request bodies
│   ├── recording-script.md     ← 3–5 min video shot list (Phase 7)
│   └── submission.md           ← URL, repo link, features paragraph (Phase 7)
└── app/                        ← created by `whop apps init`
    ├── whop.app.json
    ├── vite.config.ts
    ├── scripts/
    │   └── setup-whop.ts       ← creates the product + 3 plans from config, writes IDs
    └── src/
        ├── config/
        │   ├── site.ts         ← ★ THE ONLY FILE TO EDIT PER CLIENT (name, phone, colors,
        │   │                      services, cities, reviews, financing copy, prices)
        │   └── plans.json      ← plan IDs written by setup-whop.ts
        ├── lib/
        │   ├── track.ts        ← wraps whop.track(): adds event_id + debug log
        │   └── whop-api.ts     ← server helper for WHOP_API_ORIGIN fetches
        ├── components/
        │   ├── sections/       ← Hero, Services, Process, ServiceArea, Financing,
        │   │                      Reviews, EstimateForm, Contact, Footer
        │   └── checkout/       ← CheckoutPanel (Checkout + Express + Branding),
        │                          SaveCardStep (setup-mode checkout)
        └── routes/
            ├── index.tsx                    ← one-page marketing site
            ├── book.$plan.tsx               ← /book/inspection | /book/deposit | /book/<flat-rate>
            ├── checkout.return.tsx          ← returnUrl landing (checks ?status=)
            ├── thank-you.tsx
            ├── admin.tsx                    ← "Bill final balance" (protected)
            ├── api.leads.ts                 ← POST → Whop Leads API
            ├── api.setup-session.ts         ← POST → setup-mode checkout configuration
            ├── api.setup-intent.$id.ts      ← GET → member + saved payment method
            └── api.invoices.ts              ← POST → Whop Invoices API (admin only)
```

**Template rule:** components never contain company copy or prices. They read everything from `src/config/site.ts`. Changing the company name, services, cities or prices means editing that file and re-running `npm run setup:whop`. No component changes.

---

## 3. Whop resources to create

Created by `scripts/setup-whop.ts` (with the CLI/API), all under one product such as "IronRidge Roofing & Exteriors Services". Brand: see `ironridge_brand_identity_guide.pdf` and `IronRidge Roofing Homepage Mockup.png`.

| Plan | Price | Type | Purpose |
|---|---|---|---|
| Roof Inspection | **$149** | one-time | Bookable straight from the site. Credited to the job. |
| Project Deposit | **$500** | one-time | Locks the install date. The card is saved for the final balance. |
| Flat-rate: Leak Repair (up to 100 sq ft) | **$399** | one-time | Fixed-price service, no estimate needed. |

Also:
- A **setup-mode checkout configuration**, created per buyer on the server (`mode: "setup"`, `account_id`, `currency: "usd"`, `metadata.job_ref`).
- A **payment method domain** for the deployed site (needed for Apple Pay / Google Pay).
- Optional: a **webhook** (`payment.succeeded`, `setup_intent.succeeded`) that logs to `whop apps logs`. That gives proof in the video and follows Whop's advice to fulfill from webhooks.

---

## 4. The money flow (core of the pitch)

```
 Visitor                      Site (Whop Websites)                     Whop
 ───────                      ────────────────────                     ────
 Fills "Request an Estimate" ─► POST /api/leads ──────────────────────► Lead created (lead_…)
                                whop.track("estimate_requested")
 Clicks "Book inspection" ────► /book/inspection
                                <Checkout plan=inspection> + Express + Branding
                                ──────────────────────────────────────► Payment ($149)
 Accepts quote, pays deposit ─► /book/deposit
                                whop.track("deposit_started")
                                <Checkout plan=deposit> + Express + Branding
                                ──────────────────────────────────────► Payment ($500)
                                ↓ onComplete(result: "payment")
                                Step 2 "Save card for final balance"
                                POST /api/setup-session ──────────────► checkout config (ch_…, mode=setup)
                                <Checkout checkoutConfiguration=ch_…> + Branding
                                ──────────────────────────────────────► Setup intent (sint_…) → payment method (pmt_…)
 ── job gets done ──
 Roofer opens /admin ─────────► picks the customer's setup intent, enters the final amount
                                POST /api/invoices
                                  A) collection_method=charge_automatically
                                     + member_id + payment_method_id ─► Invoice charged to the saved card
                                  B) collection_method=send_invoice
                                     + email + due_date ──────────────► Invoice emailed, customer pays on Whop
```

**Card-on-file choice.** The brief says "setup intent at deposit checkout." Two ways to build it:
- **A (recommended):** deposit payment first, then an inline "Save card for your final balance" step on the same page that uses a setup-mode checkout. Every piece of this is documented, and the deposit and the card-on-file step show up as two separate things in the video.
- **B (try in the spike):** one step with `<Payments mode="payment" setupFutureUsage="off_session">` to charge $500 and save the card at once. Smoother, but it needs our own server-side confirmation-token handling, which is less well documented. Only switch if the spike proves it works end to end.

**Invoice math (example):** quote $9,450 − $500 deposit − $149 inspection credit = **$8,801**. Sent as `line_items` (credits can be negative lines; the lines must add up to the plan price).

---

## 5. Site sections (one page, mobile-first)

1. **Header**: logo, phone (tap to call), "Get a Free Estimate" button.
2. **Hero**: headline, trust row (licensed & insured, years in business, star rating), two CTAs: *Request an Estimate* and *Book a $149 Inspection*.
3. **Services**: Repair, Replacement, Inspection, plus the flat-rate card with a "Book now" button. Each card fires `service_viewed` when it scrolls into view or opens (once per service per session).
4. **How it works**: Inspect → Deposit → Install → Final invoice. This is the pitch story told to the customer.
5. **Service area**: list of cities/ZIPs from config, a simple SVG/area graphic, and a ZIP checker.
6. **Financing callout**: "Pay over time with Klarna, Afterpay and more at checkout*". *Shown to approved merchants; Whop shows the options automatically. No custom financing code.
7. **Reviews / trust**: review cards from config, certification badges (placeholders), warranty blurb.
8. **Request an Estimate form**: name, email, phone, address/ZIP, service type, roof type, timeline, notes, consent checkbox. On success: `whop.track("estimate_requested", { event_id: lead.id })` and a thank-you state.
9. **Contact / footer**: phone, email, hours, license #, links to the booking pages.

Booking pages (`/book/:plan`) show a short summary card and the checkout panel. The panel stacks **ExpressCheckoutElement** (in its own `<Checkout>`, since it shares a slot with `CheckoutElement`), then "or pay with card", then **CheckoutElement**, then **BrandingElement**.

---

## 6. Custom pixel events

All go through `src/lib/track.ts`, which calls `window.whop.track(name, props)`, adds an `event_id` to prevent double counting, and logs to the console when `?debug=1` (handy on camera).

| Event | Fires when | Props |
|---|---|---|
| `estimate_requested` | Lead API returns success | `event_id: <lead id>`, `service` |
| `service_viewed` | A service card is ≥50% visible, or a service page opens | `event_id: <service>-<session>`, `service`, `value` |
| `deposit_started` | The deposit checkout mounts (`onReady`) or "Pay deposit" is clicked | `event_id: <session>`, `value: 500`, `currency: "USD"` |
| *(bonus)* `inspection_started` | The inspection checkout mounts | `value: 149` |
| *(bonus)* `card_saved` | Setup checkout `onComplete` with `result: "setup"` | `event_id: <setupIntentId>` |

Automatic (no code): page views, checkout views, purchases.
**How to check:** Whop dashboard → Pixel (event breakdown, about 1 minute delay) and Websites page. On camera, also show DevTools → Network filtered to the pixel endpoint and the `?debug=1` console log.

---

## 7. Phases and tasks

### Phase 0 — Setup and risk spike (Day 1, ~3 h)
- [ ] Install the CLI: `brew install whopio/tap/whop` (or `npm i -g @whop/cli`), then `whop login` and `whop quickstart` to pick the business.
- [ ] Make a sandbox account at `sandbox.whop.com` and create a sandbox API key.
- [ ] `cd whop-roofing-template && whop apps init --app_type website --name "IronRidge Roofing" --domain ironridge-roofing`, then rename the created folder to `app/`.
- [ ] `npm i @whop/elements-react @whop/elements` and confirm React 19.
- [ ] **Spike page** to answer risks 2, 3, 4 and 6:
  - `<Checkout plan>` with `<CheckoutElement/>` and `<BrandingElement/>`: does it render? Try `environment="sandbox"`.
  - Setup-mode checkout configuration → `onComplete` returns `setupIntentId`.
  - Server route: `POST /leads` with the injected key. Lead appears?
  - Server route: draft invoice (`save_as_draft: true`). Scope OK?
- [ ] `whop apps deploy`, note the live URL, then `whop payment-method-domains create` for that domain.
- **Exit:** a written answer to each risk in §0, and a live URL.

### Phase 1 — Config and Whop resources (~2 h)
- [ ] Write `src/config/site.ts` (typed `SiteConfig`: brand, contact, theme colors, services[], flatRate, serviceArea[], reviews[], financing copy, plans{inspection, deposit, flatRate} with name/price/description).
- [ ] Write `scripts/setup-whop.ts`: creates or updates the product and 3 plans from config (idempotent; looks them up by name or metadata first), writes `src/config/plans.json`.
- [ ] Run it and confirm the 3 plans exist in the dashboard.

### Phase 2 — Marketing site UI (~5 h)
- [ ] Design tokens from config (CSS variables), font pair, original illustrations/photos (no theme cloning).
- [ ] Build the sections in §5, mobile-first. Test at 375 px, 768 px and 1280 px.
- [ ] Accessibility basics: labels, focus states, contrast, `prefers-reduced-motion`.
- [ ] SEO basics: title/meta from config, LocalBusiness/RoofingContractor JSON-LD.

### Phase 3 — Estimate form → Leads API (~2 h)
- [ ] `POST /api/leads`: validate (zod), honeypot field, then `fetch(${WHOP_API_ORIGIN}/api/v1/leads)` with `account_id: WHOP_ACCOUNT_ID`, `product_id`, `referrer`, and `metadata` holding all form fields.
- [ ] Client: loading, success and error states. Fire `estimate_requested` on success.
- [ ] Check the lead in the Whop dashboard.

### Phase 4 — Checkout with Payment Elements (~4 h)
- [ ] `CheckoutPanel` component: `WhopElements` → `Checkout` (Express) + `Checkout` (`CheckoutElement`) + `BrandingElement`, `appearance` from theme, `returnUrl` = `/checkout/return`, `metadata.job_ref`.
- [ ] `/book/inspection`, `/book/deposit`, `/book/<flat-rate>` all use the same component with a different plan key.
- [ ] `/checkout/return`: read `?status=` and show success, failed or canceled.
- [ ] Fire `deposit_started` (and the bonus events).
- [ ] Complete a test checkout (sandbox if available, otherwise the fallback in §8).

### Phase 5 — Card on file + final invoice (~4 h)
- [ ] After the deposit `onComplete`, call `POST /api/setup-session`, which creates a `mode: "setup"` checkout configuration. Mount `<Checkout checkoutConfiguration=ch_…>` + Branding.
- [ ] `GET /api/setup-intent/:id` returns member id, card brand/last4 and payment method id.
- [ ] `/admin` page (protected by an `ADMIN_TOKEN` app secret): list recent setup intents (`GET /setup-intents`), job form (quote total, deposit credit, inspection credit, then line items), two buttons:
  - **Charge card on file**: `collection_method: "charge_automatically"`, `member_id`, `payment_method_id`.
  - **Email invoice**: `collection_method: "send_invoice"`, `email_address`, `customer_name`, `due_date`.
- [ ] Show the invoice result (id, status, link). Check it in Dashboard → Invoices.

### Phase 6 — Polish and QA (~3 h)
- [ ] Run Lighthouse on mobile; aim for ≥ 90 on Performance, Accessibility and SEO.
- [ ] Test on a real phone: Apple Pay in Safari, Google Pay in Chrome.
- [ ] Check every event shows up in the Pixel dashboard.
- [ ] Error paths: declined card, closed wallet sheet, lead API failure.
- [ ] Prove it's a template: duplicate `site.ts` as a second fake company (e.g. "Bluebonnet Roofing, Austin TX"), rebuild, and confirm nothing else changes. Screenshot both.

### Phase 7 — Ship the submission (~3 h)
- [ ] GitHub repo: README (setup, `site.ts` swap guide, `npm run setup:whop`, deploy, env/secrets), MIT license, screenshots.
- [ ] `docs/recording-script.md`, then record 3–5 minutes (see §9).
- [ ] `docs/submission.md`: live URL, repo URL, video link, features paragraph (draft in §10).

**Total:** about 26 hours of focused work, or 3–4 days.

---

## 8. Test checkout strategy

1. **Best case:** Elements works with `environment="sandbox"` and a sandbox API key + sandbox `biz_`. Use Whop's sandbox test cards. Keep a `WHOP_ENV=sandbox|production` switch in config.
2. **Fallback:** in production, create a hidden **$1 "Test Checkout"** plan (or a 99%-off promo code on the inspection plan). Complete it with a real card through the same `CheckoutPanel` (Branding visible), then refund it in the dashboard. This is still a real Payment Elements checkout, so it meets the requirement, and the video shows the receipt.
3. Never put real card details into anything except Whop's own element iframes.

---

## 9. Recording shot list (3–5 min)

1. **0:00–0:30** Live `*.whop.site` URL on desktop, quick scroll through the sections, then resize to mobile.
2. **0:30–1:10** Fill the estimate form, show the success state, then Whop dashboard → **Leads** showing the new lead and its metadata.
3. **1:10–2:20** Book the deposit: Express buttons visible, CheckoutElement, **BrandingElement** visible, pay, success, then the "Save card" step completes (setup intent).
4. **2:20–3:20** `/admin`: enter the final amount with deposit/inspection credits, **Charge card on file**, then Dashboard → **Invoices** shows the paid invoice. Mention the "Email invoice" option.
5. **3:20–4:10** Pixel proof: `?debug=1` console + Network tab, then Whop **Pixel dashboard** showing `estimate_requested`, `service_viewed`, `deposit_started`.
6. **4:10–4:40** Template proof: show `site.ts` and the second-company screenshot.

---

## 10. Draft "Whop features implemented" paragraph

> Built on Whop Websites (React + Vite via `whop apps init`, deployed with `whop apps deploy` to a Whop-hosted URL), with server routes that call the Whop REST API through the platform's signed outbound proxy. Products and three one-time plans (a $149 inspection, a $500 project deposit, and a $399 flat-rate leak repair) are created from a single config file by a setup script. Checkout runs entirely on Whop Payment Elements (`CheckoutElement`, `ExpressCheckoutElement` for Apple Pay/Google Pay with a registered payment method domain, and the required `BrandingElement`), so Whop's BNPL and financing methods show up automatically for approved merchants. The "Request an Estimate" form creates Leads through the Leads API. After the deposit, a setup-mode checkout configuration saves the buyer's card as a setup intent, and the final balance is billed through the Invoices API, either charged automatically to the stored payment method or emailed for manual payment. Custom Whop Pixel events (`estimate_requested`, `service_viewed`, `deposit_started`, plus `card_saved`) fire through `whop.track` with `event_id` deduplication, alongside the automatic page-view and checkout tracking.

---

## 11. Open decisions

- **Company name and region for the demo:** IronRidge Roofing & Exteriors, Middle Tennessee (Nashville), from the brand guide. Change in `site.ts`.
- **Flat-rate service:** Roof Leak Repair at $399 (set by the brand guide).
- **Card-on-file approach:** A (two steps, recommended) or B (single step). Decided by the Phase 0 spike.
