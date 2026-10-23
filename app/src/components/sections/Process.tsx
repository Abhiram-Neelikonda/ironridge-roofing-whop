import { site } from "../../config/site";
import { Icon } from "../ui/Icon";

export function Process() {
  return (
    <section className="section process" id="process">
      <div className="container">
        <p className="eyebrow">From estimate to completion</p>
        <h2 className="section-title">Our Process</h2>
        <div className="process__grid">
          {site.process.map((step, i) => (
            <div className="process__step" key={step.title}>
              <span className="process__num">
                <Icon name={step.icon} />
              </span>
              <div>
                <p className="process__title">
                  {i + 1}. {step.title}
                </p>
                <p className="process__desc">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
