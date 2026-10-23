import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import appCss from "../styles/app.css?url";
import { ThemeStyle } from "../components/ui/ThemeStyle";
import { site } from "../config/site";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${site.brand.name} — ${site.brand.tagline}` },
      {
        name: "description",
        content:
          "Premium roofing & exteriors in Middle Tennessee. Inspections, replacements, and repairs with transparent pricing — from estimate to final invoice.",
      },
      { name: "theme-color", content: site.theme.background },
      { property: "og:title", content: site.brand.name },
      { property: "og:description", content: site.brand.tagline },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <ThemeStyle />
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
