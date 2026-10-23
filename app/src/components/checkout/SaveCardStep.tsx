import { useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { WhopElements, Checkout, CheckoutElement, Payments, BrandingElement } from "@whop/elements-react";
import { loadWhop } from "@whop/elements";
import { site } from "../../config/site";
import { Icon } from "../ui/Icon";
import { track, sessionId } from "../../lib/track";

const ENV = (import.meta.env.VITE_WHOP_ENV as "production" | "sandbox") || "production";

/**
 * Step 2 of the deposit flow: save a card on file via a **setup-mode checkout
 * configuration** (no charge). The server creates the `ch_` config; the element
 * stores the card and returns a setup intent (`sint_…`). The final balance is
 * later billed to this card through the Invoices API (see /admin).
 */
export function SaveCardStep({ jobRef }: { jobRef?: string }) {
  const accountId = site.brand.accountId;
  const configured = accountId && !accountId.includes("XXXX");
  const [config, setConfig] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "saved" | "error">("idle");
  const [savedCard, setSavedCard] = useState<string>("");
  const [error, setError] = useState("");

  async function begin() {
    setStatus("loading");
    try {
      const res = await fetch("/api/setup-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ job_ref: jobRef ?? `deposit-${sessionId()}` }),
      });
      const body = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !body.id) throw new Error(body.error || "Could not start secure card setup.");
      setConfig(body.id);
      setStatus("ready");
    } catch (e) {
      setError((e as Error).message);
      setStatus("error");
    }
  }

  if (!configured) {
    return (
      <div className="notice" style={{ marginTop: "1rem" }}>
        <strong>Save a card for your final balance.</strong> After the deposit, this step uses a Whop
        setup intent to securely store a card (no charge). It activates once the site is connected to
        your Whop account.
      </div>
    );
  }

  if (status === "saved") {
    return (
      <div className="notice notice--ok" style={{ marginTop: "1rem" }}>
        <Icon name="check" size={16} style={{ verticalAlign: "-3px" }} /> Card saved securely
        {savedCard ? ` (${savedCard})` : ""}. Your final balance will be billed to this card when the work
        is complete — with your authorization.
      </div>
    );
  }

  if (status === "idle" || status === "loading" || status === "error") {
    return (
      <div style={{ marginTop: "1rem" }}>
        <button className="btn btn--secondary btn--block" onClick={begin} disabled={status === "loading"} type="button">
          {status === "loading" ? "Preparing…" : "Save a card for the final balance"}
        </button>
        {status === "error" && <div className="notice notice--err" style={{ marginTop: "0.8rem" }}>{error}</div>}
      </div>
    );
  }

  // status === "ready" with a setup-mode checkout configuration
  return (
    <ClientOnly fallback={<div className="notice" style={{ marginTop: "1rem" }}>Loading…</div>}>
      <div className="checkout-panel" style={{ marginTop: "1rem" }}>
        <WhopElements elements={loadWhop()} environment={ENV}>
          <Checkout
            checkoutConfiguration={config!}
            onComplete={(p) => {
              if (p.result === "setup") {
                setSavedCard("");
                setStatus("saved");
                track("card_saved", { event_id: p.setupIntentId });
              }
            }}
          >
            <CheckoutElement />
          </Checkout>
          <Payments accountId={accountId} mode="setup" currency="usd">
            <BrandingElement />
          </Payments>
        </WhopElements>
      </div>
    </ClientOnly>
  );
}
