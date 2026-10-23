import { site } from "../../config/site";
import { Icon } from "../ui/Icon";
import { Picture } from "../ui/Picture";

export function Financing() {
  const f = site.financing;
  return (
    <section className="section financing" id="financing">
      <div className="financing__bg" aria-hidden="true">
        <Picture name="financing" alt="" sizes="100vw" />
      </div>
      <div className="container">
        <div className="financing__grid">
          <div>
            <p className="eyebrow" style={{ color: "rgba(255,255,255,0.72)" }}>
              Pay your way
            </p>
            <h2 className="section-title">{f.title}</h2>
            <p className="financing__body">{f.body}</p>
            <a className="btn btn--primary btn--lg" href={f.cta.href}>
              {f.cta.label} <Icon name="arrow-right" />
            </a>
            <p className="financing__disclaimer">{f.disclaimer}</p>
          </div>
          <ul className="financing__points">
            {f.points.map((p) => (
              <li className="financing__point" key={p.label}>
                <span className="icon-wrap">
                  <Icon name={p.icon} />
                </span>
                {p.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
