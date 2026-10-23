import { site } from "../../config/site";

/** Custom geometric roofline emblem + wordmark (brand guide §03).
 *  One color, works in reverse on dark via the `light` variant, clear at small sizes. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={light ? "logo logo--light" : "logo"}>
      <svg className="logo__mark" viewBox="0 0 40 40" aria-hidden="true">
        {/* ridge / roofline */}
        <path d="M4 25 20 11l16 14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 25 20 16l11 9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        {/* copper peak accent */}
        <path className="peak" d="M20 7.5l3.2 3.1h-6.4z" />
      </svg>
      <span className="logo__text">
        <span className="logo__name">{site.brand.shortName}</span>
        <span className="logo__sub">Roofing &amp; Exteriors</span>
      </span>
    </span>
  );
}
