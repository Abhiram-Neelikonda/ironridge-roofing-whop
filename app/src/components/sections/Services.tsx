import { useEffect, useRef } from "react";
import { site } from "../../config/site";
import { Icon } from "../ui/Icon";
import { Picture } from "../ui/Picture";
import { track, sessionId } from "../../lib/track";

export function Services() {
  const fired = useRef<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  // Fire `service_viewed` once per service per session when a card is ≥50% visible.
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const sid = sessionId();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const key = (e.target as HTMLElement).dataset.service!;
          if (e.isIntersecting && !fired.current.has(key)) {
            fired.current.add(key);
            track(site.tracking.serviceViewed, {
              event_id: `${key}-${sid}`,
              service: key,
            });
          }
        }
      },
      { threshold: 0.5 },
    );
    root.querySelectorAll<HTMLElement>("[data-service]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="section services" id="services">
      <div className="container">
        <p className="eyebrow">Our Services</p>
        <h2 className="section-title">Expert care for every kind of roof</h2>
        <div className="grid services__grid" ref={ref}>
          {site.services.map((s) => (
            <article className="card service-card" data-service={s.key} key={s.key}>
              <div className="service-card__img">
                <Picture name={s.image} alt={s.title} sizes="(min-width:720px) 33vw, 100vw" />
              </div>
              <div className="service-card__body">
                <div className="service-card__head">
                  <span className="service-card__icon">
                    <Icon name={s.icon} size={20} />
                  </span>
                  <h3 className="service-card__title">{s.title}</h3>
                </div>
                <p className="service-card__desc">{s.description}</p>
                <div className="service-card__foot">
                  <span className="service-card__price">{s.priceLabel}</span>
                  <a className="service-card__go" href={s.cta.href} aria-label={s.cta.label}>
                    <Icon name="arrow-right" size={18} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
