import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "../components/ui/Icon";
import { site } from "../config/site";

export const Route = createFileRoute("/thank-you")({ component: ThankYou });

function ThankYou() {
  return (
    <div className="status-page">
      <div className="status-card">
        <span className="status-icon status-icon--ok">
          <Icon name="check" size={30} />
        </span>
        <h1>Thank you</h1>
        <p style={{ color: "var(--color-muted)", marginTop: "0.6rem" }}>
          We've received your request. A {site.brand.shortName} specialist will reach out within 1 business day.
        </p>
        <a className="btn btn--primary" href="/" style={{ marginTop: "1.6rem" }}>Back to home</a>
      </div>
    </div>
  );
}
