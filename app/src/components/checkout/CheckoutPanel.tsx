import { useEffect, useRef, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import {
  WhopElements,
  Checkout,
  CheckoutElement,
  ExpressCheckoutElement,
  Payments,
  BrandingElement,
} from "@whop/elements-react";
import { loadWhop } from "@whop/elements";
import { site, type PlanKey } from "../../config/site";
import plans from "../../config/plans.json";
import { Icon } from "../ui/Icon";
import { track, sessionId } from "../../lib/track";

const PLAN_ID: Record<PlanKey, string> = {
  inspection: plans.inspection,
  deposit: plans.deposit,
  flatRate: plans.flatRate,
  demo: plans.demo,
};

// Sandbox is opt-in via env; docs note Elements sandbox is not GA yet, so prod is default.
const ENV = (import.meta.env.VITE_WHOP_ENV as "production" | "sandbox") || "production";

function looksReal(id: string | undefined) {
  return !!id && !id.includes("XX:") && !id.includes("XXXX");
}

/**
 * The one checkout surface used by every booking page.
 *   - ExpressCheckoutElement  → Apple Pay / Google Pay (needs a verified domain)
 *   - CheckoutElement         → full Whop checkout (methods, promo, financing/BNPL)
 *   - BrandingElement         → required Whop merchant-of-record notice
 * No custom card fields: everything runs inside Whop's iframes.
 */
export function CheckoutPanel({ planKey }: { planKey: PlanKey }) {
  const planId = PLAN_ID[planKey];
  const accountId = site.brand.accountId;
  const configured = looksReal(planId) && looksReal(accountId);
  const returnUrl =
    typeof window !== "undefined" ? `${window.location.origin}/checkout/return` : undefined;
  const jobRef = `${planKey}-${sessionId()}`;

  // Pixel: fire the appropriate "started" event once when the panel mounts.
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (planKey === "deposit") {
      track(site.tracking.depositStarted, {
        event_id: jobRef,
        value: site.plans.deposit.priceCents / 100,
        currency: "USD",
      });
    } else {
      track(`${planKey}_started`, {
        event_id: jobRef,
        value: site.plans[planKey].priceCents / 100,
        currency: "USD",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!configured) {
    return <PreviewPlaceholder planKey={planKey} />;
  }

  return (
    <ClientOnly fallback={<LoadingBlock />}>
      <div className="checkout-panel">
        <WhopElements elements={loadWhop()} environment={ENV}>
          {/* Express wallets — own Checkout handle (shares a slot with CheckoutElement) */}
          <Checkout
            plan={planId}
            metadata={{ job_ref: jobRef }}
            returnUrl={returnUrl}
          >
            <ExpressCheckoutElement />
          </Checkout>

          <div className="checkout-panel__divider">or pay with card</div>

          {/* Full checkout surface — methods, promo codes, financing/BNPL, pay */}
          <Checkout
            plan={planId}
            metadata={{ job_ref: jobRef }}
            returnUrl={returnUrl}
            onComplete={(p) => {
              if (p.result === "payment") {
                track("purchase_confirmed", { event_id: p.paymentId });
              }
            }}
          >
            <CheckoutElement />
          </Checkout>

          {/* Required merchant-of-record notice (Whop is merchant of record) */}
          <Payments accountId={accountId} plan={planId}>
            <BrandingElement />
          </Payments>
        </WhopElements>
      </div>
    </ClientOnly>
  );
}

function LoadingBlock() {
  return (
    <div className="checkout-panel">
      <div className="notice">Loading secure checkout…</div>
    </div>
  );
}

/** Shown in local dev / before Whop is connected. Keeps the page complete for
 *  design QA and makes the "connect Whop" step obvious. */
function PreviewPlaceholder({ planKey }: { planKey: PlanKey }) {
  const [note, setNote] = useState(false);
  return (
    <div className="checkout-panel">
      <button className="btn btn--primary btn--block btn--lg" onClick={() => setNote(true)} type="button">
        <Icon name="credit-card" /> Apple Pay / Google Pay
      </button>
      <div className="checkout-panel__divider">or pay with card</div>
      <div
        style={{
          border: "1px dashed var(--color-border)",
          borderRadius: 12,
          padding: "1.4rem",
          display: "grid",
          gap: "0.7rem",
          background: "var(--color-background)",
        }}
      >
        <div style={{ height: 44, background: "var(--color-surface)", borderRadius: 8, border: "1px solid var(--color-border)" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem" }}>
          <div style={{ height: 44, background: "var(--color-surface)", borderRadius: 8, border: "1px solid var(--color-border)" }} />
          <div style={{ height: 44, background: "var(--color-surface)", borderRadius: 8, border: "1px solid var(--color-border)" }} />
        </div>
        <button className="btn btn--primary btn--block" onClick={() => setNote(true)} type="button">
          Pay {site.plans[planKey].name}
        </button>
      </div>
      <p style={{ fontSize: "0.78rem", color: "var(--color-muted)", marginTop: "0.9rem", textAlign: "center" }}>
        Secured by <strong>Whop</strong> — Whop is the merchant of record.
      </p>
      {note && (
        <div className="notice notice--warn" style={{ marginTop: "1rem" }}>
          Live checkout loads here once the site is deployed on Whop with your{" "}
          <span className="mono">biz_</span> account id and real plan ids (run{" "}
          <span className="mono">npm run setup:whop</span>). This preview shows the layout only.
        </div>
      )}
    </div>
  );
}
