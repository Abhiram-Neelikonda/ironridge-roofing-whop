# Submission — IronRidge Roofing (Whop Websites)

## Live site
**https://ironridge-roofing.whop.site**

Built on Whop Websites (React + Vite / TanStack Start on Cloudflare Workers),
deployed with the Whop CLI (`whop apps deploy`). Production build `apbu_pGOtrFCUSiR4r`.

Key pages for the demo:
- Home: https://ironridge-roofing.whop.site
- Book inspection ($149): https://ironridge-roofing.whop.site/book/inspection
- Book deposit ($500) + save card: https://ironridge-roofing.whop.site/book/deposit
- Book flat-rate repair ($399): https://ironridge-roofing.whop.site/book/flatRate
- Final invoicing (staff): https://ironridge-roofing.whop.site/admin
- Add `?debug=1` to any page to log pixel events to the console.

## Whop resources
| | id |
|---|---|
| App | `app_Xyp6dNS6xRxRtw` |
| Business | `biz_2KfraYgGWLEV6U` |
| Product | `prod_irB9xjoQ1Zh6z` |
| Inspection plan ($149) | `plan_Cxn6g48X57rzO` |
| Deposit plan ($500) | `plan_4yAhdnlpAPtGv` |
| Flat-rate repair ($399) | `plan_m6GBEABhtagpl` |

The `/admin` page is protected by the `ADMIN_TOKEN` app secret (set via
`whop apps secrets set` — not included here).

## Source code
The full template is in this repo (`whop-roofing-template/`). To submit as a zip
(excluding build + deps):

```bash
cd "whop-roofing-template"
zip -r ../ironridge-roofing-source.zip . -x "*/node_modules/*" "*/dist/*" "*/.output/*" "*.DS_Store"
```

Or push to GitHub:

```bash
cd "whop-roofing-template/app"
git add -A && git commit -m "IronRidge Roofing — Whop Websites template"
# then: gh repo create ... && git push
```

---

## Whop features implemented (one paragraph)

> IronRidge Roofing is built entirely on **Whop Websites** — a React + Vite / TanStack
> Start app scaffolded for Whop's Cloudflare Workers hosting and shipped with
> `whop apps deploy` to `ironridge-roofing.whop.site`. Its server routes call the
> **Whop REST API** through the platform's signed outbound proxy (`WHOP_API_ORIGIN`),
> so the API key never touches the client. Checkout runs **entirely on Whop Payment
> Elements** — `ExpressCheckoutElement` (Apple Pay + Google Pay), `CheckoutElement`
> (full checkout with promo codes and BNPL/financing), and the required
> `BrandingElement` merchant-of-record notice — with no custom card fields, so
> financing options surface automatically for eligible buyers. Three real one-time
> plans drive the high-ticket flow: a **$149 inspection**, a **$500 project deposit**,
> and a **$399 flat-rate leak repair** (created from a single config file). The
> "Request an Estimate" form captures leads with the Whop Pixel **`lead`** event
> (they appear in the dashboard's **Marketing → Leads**) and also posts a Whop
> **notification** with the full details to the business's team via the server-side
> API; after the deposit a
> **setup-mode checkout configuration** saves a card on file (setup intent), and the
> final balance is billed through the **Invoices API** — auto-charging the stored
> method or emailing the invoice from the `/admin` page. Three custom **`whop.track`**
> pixel events (`estimate_requested`, `service_viewed`, `deposit_started`, plus
> `inspection_started` and `card_saved`) fire with `event_id` dedupe, alongside Whop's
> automatic page-view and checkout tracking. The whole site re-skins from one config
> file (`src/config/site.ts`) — swap the company, services, and prices with no
> structural changes.

---

## Recording shot list (3–5 min)

**0:00–0:30 — The live site**
Open https://ironridge-roofing.whop.site on desktop. Scroll the full page (hero →
services → plans → process → projects → financing → reviews → estimate form). Resize
to a phone width to show it's responsive.

**0:30–1:15 — Estimate form → Lead**
Have two tabs ready: the live site, and the Whop dashboard on **Marketing → Leads**.
Fill out "Request a Free Estimate" with a recognizable name, submit, and show the
"Request received" success state. Switch to **Marketing → Leads** and refresh — the
new lead (name + email) appears. (The pixel takes ~1 min; if it's not there yet, point
to an earlier submission already in the list, then refresh.) Optionally click the 🔔
notification bell to show the same lead delivered as a notification with full details.

**1:15–2:20 — Payment Elements checkout**
Open `/book/deposit`. Show the **ExpressCheckoutElement** (Apple Pay / Google Pay),
the **CheckoutElement** ($500, USD), and the **BrandingElement** ("Powered by Whop,
merchant of record"). Complete a test payment. Show the success / return page.

**2:20–3:10 — Card on file + final invoice**
On the deposit page, use "Save a card for the final balance" (setup intent, no charge).
Then open `/admin`, enter the admin token, select the saved card, enter a quoted total,
apply the deposit/inspection credits, and **Charge card on file**. Cut to dashboard →
**Invoices** / **Payments** showing the invoice. Mention the "Send invoice" option too.

**3:10–4:10 — Pixel events**
Append `?debug=1` to the home page, open DevTools console, and scroll so
`service_viewed` fires; submit the form for `estimate_requested`; open a booking page
for `deposit_started`. Then show the Whop **Pixel dashboard** with the event breakdown.

**4:10–4:40 — Template reuse (optional)**
Open `src/config/site.ts` and show that company name, services, service area, reviews,
and the three plan prices all live in one file — the proof it's a reusable template.
