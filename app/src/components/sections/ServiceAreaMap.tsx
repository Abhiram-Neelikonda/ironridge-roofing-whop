/** Stylized service-area map. Not geographically exact — a calm brand graphic
 *  with pins. Re-theme via CSS vars; swap the region shape per client. */
export function ServiceAreaMap() {
  return (
    <svg className="area-map" viewBox="0 0 400 240" role="img" aria-label="Service area map">
      <rect width="400" height="240" fill="var(--color-background)" />
      {/* region blob */}
      <path
        d="M40 150 C 45 95, 110 70, 160 78 C 210 86, 235 60, 285 72 C 340 86, 372 120, 355 165 C 338 208, 270 215, 215 205 C 170 197, 120 220, 80 200 C 48 184, 36 172, 40 150 Z"
        fill="var(--color-accent)"
        fillOpacity="0.16"
        stroke="var(--color-accent)"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      {/* roads */}
      <path d="M70 150 L200 130 L320 150" fill="none" stroke="var(--color-border)" strokeWidth="2" />
      <path d="M200 90 L200 190" fill="none" stroke="var(--color-border)" strokeWidth="2" />
      {/* pins */}
      {[
        [200, 130, "Nashville"],
        [150, 160, "Franklin"],
        [235, 155, "Brentwood"],
        [285, 140, "Murfreesboro"],
        [120, 120, "Clarksville"],
      ].map(([x, y, label]) => (
        <g key={label as string}>
          <circle cx={x as number} cy={y as number} r="5" fill="var(--color-copper)" />
          <circle cx={x as number} cy={y as number} r="9" fill="var(--color-copper)" fillOpacity="0.25" />
        </g>
      ))}
    </svg>
  );
}
