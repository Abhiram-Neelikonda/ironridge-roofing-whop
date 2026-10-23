/**
 * Creates the Whop product + 3 plans this site sells, then writes
 * src/config/plans.json so checkout uses real ids.
 *
 *   WHOP_API_KEY=whop_xxx WHOP_ACCOUNT_ID=biz_xxx npm run setup:whop
 *
 * Idempotent-ish: it always creates fresh plans, so run it once. Re-running
 * makes new plans — delete old ones in the dashboard if you re-run.
 *
 * ⚠️ Whop money amounts are whole currency units (dollars): 149 = $149.
 *    (Payment Elements use cents; these REST calls use dollars.)
 *
 * If the plan payload shape has drifted, this script prints the error and you
 * can instead create the 3 plans in the dashboard and paste their ids +
 * the product id into src/config/plans.json. Nothing else needs to change.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/config/site.ts";

const API = process.env.WHOP_API_ORIGIN ?? "https://api.whop.com";
const KEY = process.env.WHOP_API_KEY;
const ACCOUNT = process.env.WHOP_ACCOUNT_ID ?? site.brand.accountId;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../src/config/plans.json");

if (!KEY) {
  console.error("Set WHOP_API_KEY (create one under Developer in your Whop dashboard).");
  process.exit(1);
}

async function api<T>(pathname: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}/api/v1${pathname}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`POST ${pathname} → ${res.status}: ${text}`);
  }
  return JSON.parse(text) as T;
}

async function main() {
  console.log(`Creating product + plans on account ${ACCOUNT}…`);

  // 1) Product (access pass)
  const product = await api<{ id: string }>("/products", {
    account_id: ACCOUNT,
    title: site.brand.name,
    description: `${site.brand.tagline} — inspections, replacements, and repairs.`,
    visibility: "visible",
  });
  console.log(`✓ product ${product.id}`);

  // 2) Plans — one per offering, amounts in DOLLARS
  const planIds: Record<string, string> = {};
  for (const key of ["inspection", "deposit", "flatRate"] as const) {
    const p = site.plans[key];
    const plan = await api<{ id: string }>("/plans", {
      product_id: product.id,
      plan_type: "one_time",
      release_method: "buy_now",
      visibility: key === "deposit" ? "hidden" : "visible",
      base_currency: p.currency,
      initial_price: p.priceCents / 100, // dollars
      internal_notes: `${p.name} (${p.eyebrow})`,
    });
    planIds[key] = plan.id;
    console.log(`✓ plan ${key} → ${plan.id} ($${p.priceCents / 100})`);
  }

  const out = {
    productId: product.id,
    inspection: planIds.inspection,
    deposit: planIds.deposit,
    flatRate: planIds.flatRate,
  };
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nWrote ${path.relative(process.cwd(), OUT)}`);
  console.log("Next: set your biz_ id as site.brand.accountId in src/config/site.ts, then `whop apps deploy`.");
}

main().catch((e) => {
  console.error("\n✗ Setup failed:\n", (e as Error).message);
  console.error(
    "\nFallback: create a product and 3 one-time plans ($149, $500, $399) in the Whop dashboard,\n" +
      "then paste their plan_… ids and the prod_… id into src/config/plans.json.",
  );
  process.exit(1);
});
