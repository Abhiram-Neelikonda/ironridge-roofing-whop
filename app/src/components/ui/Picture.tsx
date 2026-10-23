/**
 * Responsive <picture> for the optimized assets produced by `scripts/optimize-images.mjs`.
 * For every source we emit WebP at several widths plus a JPG fallback, into
 * /public/images/. The manifest (generated alongside) records which widths exist.
 */
import manifest from "../../assets/image-manifest.json";

type ImgName = keyof typeof manifest;

export function Picture({
  name,
  alt,
  sizes = "100vw",
  className,
  imgClassName,
  priority = false,
}: {
  name: string;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const entry = (manifest as Record<string, { widths: number[]; jpg: number }>)[name as ImgName];

  // Fallback if the image hasn't been optimized yet: reference a single webp.
  if (!entry) {
    return (
      <img
        className={imgClassName}
        src={`/images/${name}-1600.webp`}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  const webpSrcset = entry.widths.map((w) => `/images/${name}-${w}.webp ${w}w`).join(", ");

  return (
    <picture className={className}>
      <source type="image/webp" srcSet={webpSrcset} sizes={sizes} />
      <img
        className={imgClassName}
        src={`/images/${name}-${entry.jpg}.jpg`}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...(priority ? { fetchPriority: "high" as const } : {})}
      />
    </picture>
  );
}
