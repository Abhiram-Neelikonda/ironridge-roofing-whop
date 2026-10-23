import { site } from "../../config/site";
import { Icon } from "../ui/Icon";
import { Picture } from "../ui/Picture";

export function Hero() {
  const h = site.hero;
  return (
    <section className="hero" id="top">
      <div className="container hero__inner">
        <div className="hero__content">
          <p className="hero__eyebrow">{h.eyebrow}</p>
          <h1 className="hero__title">
            {h.titleLines.map((line, i) => (
              <span key={i} style={{ display: "block" }}>
                {line}
              </span>
            ))}
          </h1>
          <p className="hero__subtitle">{h.subtitle}</p>
          <div className="hero__ctas">
            <a className="btn btn--primary btn--lg" href={h.primaryCta.href}>
              {h.primaryCta.label} <Icon name="arrow-right" />
            </a>
            <a className="btn btn--secondary btn--lg" href={h.secondaryCta.href}>
              {h.secondaryCta.label}
            </a>
          </div>
          <ul className="hero__trust">
            {h.trust.map((t) => (
              <li key={t.label} className="chip">
                <Icon name={t.icon} />
                {t.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero__media">
          <div className="hero__img hero__img--desktop">
            <Picture
              name="hero-desktop"
              alt="Premium home with a newly installed standing-seam metal roof"
              priority
              sizes="(min-width: 860px) 56vw, 100vw"
              imgClassName="hero__img-el"
            />
          </div>
          <div className="hero__img hero__img--mobile">
            <Picture
              name="hero-mobile"
              alt="Premium home with a newly installed standing-seam metal roof"
              priority
              sizes="100vw"
              imgClassName="hero__img-el"
            />
          </div>
          <a className="hero__video" href={site.hero.primaryCta.href} aria-label={h.videoLabel}>
            <span className="hero__video-play">
              <Icon name="play" size={16} />
            </span>
            <span>
              <span className="hero__video-label" style={{ display: "block" }}>
                {h.videoLabel}
              </span>
              <span className="hero__video-sub">{h.videoSub}</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
