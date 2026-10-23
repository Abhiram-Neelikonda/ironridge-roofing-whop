import { site } from "../../config/site";

/** Injects the brand palette from site.ts as CSS custom properties, so a new
 *  client only edits `theme` in site.ts to re-skin the whole site. */
export function ThemeStyle() {
  const t = site.theme;
  const css = `:root{
    --color-primary:${t.primary};
    --color-background:${t.background};
    --color-accent:${t.accent};
    --color-accent-hover:${t.accentHover};
    --color-copper:${t.copper};
    --color-surface:${t.surface};
    --color-text:${t.text};
    --color-muted:${t.muted};
    --color-border:${t.border};
  }`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
