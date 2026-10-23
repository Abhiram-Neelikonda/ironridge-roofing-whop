import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Icon } from "../components/ui/Icon";
import { site } from "../config/site";

type Search = { status?: string; payment?: string; setup?: string };

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    status: typeof s.status === "string" ? s.status : undefined,
    payment: typeof s.payment === "string" ? s.payment : undefined,
    setup: typeof s.setup === "string" ? s.setup : undefined,
  }),
  component: ReturnPage,
});

function ReturnPage() {
  const { status, payment, setup } = useSearch({ from: "/checkout/return" });
  const ok = status === "succeeded" || (!status && (payment || setup));
  const canceled = status === "canceled";

  return (
    <div className="status-page">
      <div className="status-card">
        <span className={`status-icon ${ok ? "status-icon--ok" : "status-icon--err"}`}>
          <Icon name={ok ? "check" : "wrench"} size={30} />
        </span>
        {ok ? (
          <>
            <h1>You're all set</h1>
            <p style={{ color: "var(--color-muted)", marginTop: "0.6rem" }}>
              {setup
                ? "Your card is saved securely for your final balance."
                : "Your payment went through. A confirmation is on its way, and our team will be in touch to schedule."}
            </p>
            {(payment || setup) && (
              <p className="mono" style={{ marginTop: "1rem", color: "var(--color-muted)", fontSize: "0.8rem" }}>
                Ref: {payment || setup}
              </p>
            )}
          </>
        ) : (
          <>
            <h1>{canceled ? "Checkout canceled" : "Payment not completed"}</h1>
            <p style={{ color: "var(--color-muted)", marginTop: "0.6rem" }}>
              No charge was made. You can try again, or call us at{" "}
              <a href={site.contact.phoneHref} style={{ color: "var(--color-accent)", fontWeight: 600 }}>
                {site.contact.phone}
              </a>
              .
            </p>
          </>
        )}
        <a className="btn btn--primary" href="/" style={{ marginTop: "1.6rem" }}>
          Back to home
        </a>
      </div>
    </div>
  );
}
