import { createFileRoute, notFound } from "@tanstack/react-router";
import { site, type PlanKey } from "../config/site";
import { Logo } from "../components/ui/Logo";
import { Icon } from "../components/ui/Icon";
import { Footer } from "../components/Footer";
import { CheckoutPanel } from "../components/checkout/CheckoutPanel";
import { SaveCardStep } from "../components/checkout/SaveCardStep";
import { money } from "../lib/format";

const VALID: PlanKey[] = ["inspection", "deposit", "flatRate"];

export const Route = createFileRoute("/book/$plan")({
  loader: ({ params }) => {
    if (!VALID.includes(params.plan as PlanKey)) throw notFound();
    return { plan: params.plan as PlanKey };
  },
  component: BookPage,
});

function BookPage() {
  const { plan } = Route.useLoaderData();
  const p = site.plans[plan];

  return (
    <div className="subpage">
      <MiniHeader />
      <main className="subpage__main">
        <div className="container">
          <a className="back-link" href="/#pricing">
            <Icon name="arrow-right" size={16} style={{ transform: "rotate(180deg)" }} /> Back to plans
          </a>
          <div className="booking__grid">
            {/* summary */}
            <aside>
              <div className="summary-card">
                <span className="plan-card__eyebrow">{p.eyebrow}</span>
                <h1 className="plan-card__name" style={{ fontSize: "1.5rem", marginTop: "0.3rem" }}>
                  {p.name}
                </h1>
                <div className="summary-card__price">
                  {money(p.priceCents, p.currency)} <span>/ {p.cadence}</span>
                </div>
                <p style={{ color: "var(--color-muted)", fontSize: "0.94rem" }}>{p.summary}</p>
                <ul className="summary-card__features">
                  {p.features.map((f) => (
                    <li key={f}>
                      <Icon name="check" size={18} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* checkout */}
            <section>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>Secure checkout</h2>
              <p style={{ color: "var(--color-muted)", fontSize: "0.92rem", marginBottom: "1.2rem" }}>
                Pay securely with Apple Pay, Google Pay, card, or financing — all processed by Whop.
              </p>
              <CheckoutPanel planKey={plan} />

              {p.saveCardForBalance && (
                <div style={{ marginTop: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.1rem" }}>Final balance</h3>
                  <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
                    Optionally store a card now so the remaining balance can be billed when your project is
                    complete. You authorize the final charge — nothing is charged today beyond the deposit.
                  </p>
                  <SaveCardStep jobRef={`deposit`} />
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function MiniHeader() {
  return (
    <header className="header" data-scrolled="true">
      <div className="container header__inner">
        <a href="/#top" aria-label={site.brand.name}>
          <Logo />
        </a>
        <span className="header__spacer" />
        <a className="header__phone" href={site.contact.phoneHref} style={{ display: "inline-flex" }}>
          <Icon name="phone" /> {site.contact.phone}
        </a>
      </div>
    </header>
  );
}
