import { useState } from "react";
import { site } from "../../config/site";
import { Icon } from "../ui/Icon";
import { ServiceAreaMap } from "./ServiceAreaMap";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Proof() {
  const [active, setActive] = useState(0);
  const reviews = site.reviews;
  const r = reviews[active];
  const area = site.serviceArea;

  return (
    <section className="section" id="reviews">
      <div className="container">
        <div className="proof__grid">
          {/* Reviews */}
          <div>
            <p className="eyebrow">What homeowners say</p>
            <h2 className="section-title">Trusted by homeowners across Tennessee</h2>
            <div className="review-card" style={{ marginTop: "1.8rem" }}>
              <div className="review-stars" aria-label={`${r.stars} out of 5 stars`}>
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Icon key={i} name="star" size={18} />
                ))}
              </div>
              <blockquote className="review-quote">“{r.quote}”</blockquote>
              <div className="review-author">
                <span className="review-avatar">{initials(r.name)}</span>
                <div>
                  <p className="review-name">{r.name}</p>
                  <p className="review-loc">{r.location}</p>
                </div>
              </div>
              <div className="review-dots" role="tablist" aria-label="Choose a review">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    data-active={i === active}
                    aria-label={`Review ${i + 1}`}
                    aria-selected={i === active}
                    role="tab"
                    onClick={() => setActive(i)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Service area */}
          <div id="service-area">
            <p className="eyebrow">{area.heading}</p>
            <h2 className="section-title" style={{ fontSize: "clamp(1.6rem,3vw,2.3rem)" }}>
              {area.subtitle}
            </h2>
            <div className="area-card" style={{ marginTop: "1.5rem" }}>
              <ServiceAreaMap />
              <ul className="area-list">
                {area.cities.map((c) => (
                  <li key={c}>
                    <Icon name="map-pin" />
                    {c}
                  </li>
                ))}
                <li style={{ color: "var(--color-muted)" }}>
                  <Icon name="map-pin" />
                  {area.note}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
