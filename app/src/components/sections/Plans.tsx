import { site, type PlanKey } from "../../config/site";
import { Icon } from "../ui/Icon";
import { money } from "../../lib/format";
import { PaymentMethods } from "./PaymentMethods";

const ORDER: PlanKey[] = ["inspection", "deposit", "flatRate"];
const HREF: Record<PlanKey, string> = {
  inspection: "/book/inspection",
  deposit: "/book/deposit",
  flatRate: "/book/flatRate",
  demo: "/book/demo",
};

export function Plans() {
  return (
    <section className="section plans" id="pricing">
      <div className="container">
        <div className="plans__head">
          <div>
            <p className="eyebrow">Simple pricing. Secure checkout.</p>
            <h2 className="section-title">Popular Plans</h2>
          </div>
          <p className="plans__intro">
            Book an inspection, secure your project with a deposit, or choose a flat-rate service.
            Every payment is processed securely through Whop, with financing options available.
          </p>
        </div>

        <div className="grid plans__grid">
          {ORDER.map((key) => {
            const p = site.plans[key];
            return (
              <article className="plan-card" data-featured={key === "deposit"} key={key}>
                <span className="plan-card__eyebrow">{p.eyebrow}</span>
                <h3 className="plan-card__name">{p.name}</h3>
                <div className="plan-card__price">
                  {money(p.priceCents, p.currency)} <span>/ {p.cadence}</span>
                </div>
                <ul className="plan-card__features">
                  {p.features.map((f) => (
                    <li key={f}>
                      <Icon name="check" size={18} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a className="btn btn--primary btn--block" href={HREF[key]}>
                  {p.cta}
                </a>
              </article>
            );
          })}
        </div>

        <PaymentMethods />
      </div>
    </section>
  );
}
