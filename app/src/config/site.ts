/**
 * ============================================================================
 *  THE ONLY FILE YOU EDIT TO RE-SKIN THIS TEMPLATE FOR A NEW ROOFER.
 * ============================================================================
 *  Swap the company name, contact details, colors, services, pricing, service
 *  area, reviews and copy here. Nothing in `components/`, `routes/` or `lib/`
 *  contains business-specific text — it all reads from this object.
 *
 *  After changing prices or plan names, re-run `npm run setup:whop` to create
 *  the matching Whop plans and refresh `src/config/plans.json`.
 * ============================================================================
 */

export type ServiceKey = "inspection" | "replacement" | "repair";
export type PlanKey = "inspection" | "deposit" | "flatRate";

export interface SiteConfig {
  brand: {
    name: string;
    shortName: string;
    tagline: string;
    /** Whop business id (biz_…). Used by Payment Elements (accountId). */
    accountId: string;
    /** whop.site subdomain this app deploys to. */
    domain: string;
  };
  contact: {
    phone: string;
    phoneHref: string;
    email: string;
    cityState: string;
    hours: string;
    license: string;
    social: { label: string; href: string; icon: "instagram" | "facebook" | "twitter" }[];
  };
  /** Brand palette — mirrors the IronRidge brand guide. Change to re-theme. */
  theme: {
    primary: string;
    background: string;
    accent: string;
    accentHover: string;
    copper: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
  };
  hero: {
    eyebrow: string;
    titleLines: string[];
    subtitle: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    trust: { icon: IconName; label: string }[];
    videoLabel: string;
    videoSub: string;
  };
  services: {
    key: ServiceKey;
    icon: IconName;
    title: string;
    description: string;
    priceLabel: string;
    cta: { label: string; href: string };
    image: string;
  }[];
  process: { icon: IconName; title: string; description: string }[];
  projects: { image: string; title: string; location: string }[];
  financing: {
    title: string;
    body: string;
    providers: string[];
    points: { icon: IconName; label: string }[];
    disclaimer: string;
    cta: { label: string; href: string };
  };
  reviews: { quote: string; name: string; location: string; stars: number }[];
  serviceArea: {
    heading: string;
    subtitle: string;
    cities: string[];
    note: string;
  };
  /** The three real Whop plans. `priceCents` drives the setup script + display. */
  plans: Record<
    PlanKey,
    {
      eyebrow: string;
      name: string;
      priceCents: number;
      currency: string;
      cadence: string;
      features: string[];
      cta: string;
      /** Shown on the booking page so buyers know what they're paying for. */
      summary: string;
      /** For deposit only: offer to save a card for the final balance. */
      saveCardForBalance?: boolean;
    }
  >;
  estimateForm: {
    heading: string;
    subtitle: string;
    assurances: { icon: IconName; label: string }[];
    serviceOptions: string[];
    roofTypeOptions: string[];
    timelineOptions: string[];
  };
  footer: {
    quickLinks: { label: string; href: string }[];
    serviceLinks: string[];
    legalLinks: { label: string; href: string }[];
  };
  /** Pixel copy — the custom events are fired in code; names live here so a new
   *  client can rename them without touching logic. */
  tracking: {
    estimateRequested: string;
    serviceViewed: string;
    depositStarted: string;
  };
}

export type IconName =
  | "shield"
  | "award"
  | "users"
  | "search"
  | "home"
  | "wrench"
  | "clipboard"
  | "calendar"
  | "check"
  | "arrow-right"
  | "phone"
  | "mail"
  | "map-pin"
  | "credit-card"
  | "layers"
  | "lock"
  | "zap"
  | "percent"
  | "star"
  | "play"
  | "instagram"
  | "facebook"
  | "twitter"
  | "clock"
  | "file-text";

// US dollar amounts in whole dollars, converted to cents in one place.
const USD = (dollars: number) => Math.round(dollars * 100);

export const site: SiteConfig = {
  brand: {
    name: "IronRidge Roofing & Exteriors",
    shortName: "IronRidge",
    tagline: "Built to protect. Made to last.",
    // Whop business id for this account. Payment Elements use this as accountId.
    accountId: "biz_2KfraYgGWLEV6U",
    domain: "ironridge-roofing",
  },

  contact: {
    phone: "(615) 555-0187",
    phoneHref: "tel:+16155550187",
    email: "hello@ironridgeroofing.com",
    cityState: "Nashville, TN",
    hours: "Mon–Sat, 7:00am – 6:00pm",
    license: "TN Lic. #IR-000000 · Licensed & Insured",
    social: [
      { label: "Instagram", href: "#", icon: "instagram" },
      { label: "Facebook", href: "#", icon: "facebook" },
      { label: "Twitter", href: "#", icon: "twitter" },
    ],
  },

  theme: {
    primary: "#202A27",
    background: "#F4F0E7",
    accent: "#315C4C",
    accentHover: "#274a3d",
    copper: "#B8754B",
    surface: "#FFFFFF",
    text: "#303834",
    muted: "#777B73",
    border: "#DDD8CE",
  },

  hero: {
    eyebrow: "Tennessee's trusted roofing experts",
    titleLines: ["A stronger roof", "starts with a", "smarter decision."],
    subtitle:
      "From small repairs to full roof replacements, we deliver expert craftsmanship, transparent pricing, and a seamless experience from estimate to final invoice.",
    primaryCta: { label: "Request an Estimate", href: "#estimate" },
    secondaryCta: { label: "View Our Services", href: "#services" },
    trust: [
      { icon: "shield", label: "Licensed & Insured" },
      { icon: "award", label: "Industry-Leading Warranties" },
      { icon: "star", label: "5-Star Rated" },
    ],
    videoLabel: "See Our Work",
    videoSub: "Watch our 60s video",
  },

  services: [
    {
      key: "inspection",
      icon: "search",
      title: "Roof Inspections",
      description: "Detailed inspections to identify issues and give you a clear plan.",
      priceLabel: "From $149",
      cta: { label: "Book an Inspection", href: "/book/inspection" },
      image: "service-inspection",
    },
    {
      key: "replacement",
      icon: "home",
      title: "Roof Replacements",
      description: "High-quality materials, expert installation, and long-lasting protection.",
      priceLabel: "Get a Quote",
      cta: { label: "Get a Quote", href: "#estimate" },
      image: "service-replacement",
    },
    {
      key: "repair",
      icon: "wrench",
      title: "Roof Repairs",
      description: "Fast, reliable repairs for leaks, storm damage, and more.",
      priceLabel: "From $399",
      cta: { label: "Book a Repair", href: "/book/flatRate" },
      image: "service-repair",
    },
  ],

  process: [
    { icon: "clipboard", title: "Request an Estimate", description: "Tell us about your project in minutes." },
    { icon: "search", title: "Inspection & Quote", description: "We inspect and provide a detailed estimate." },
    { icon: "calendar", title: "Secure Your Project", description: "Pay a deposit to lock in your schedule." },
    { icon: "check", title: "Final Invoice", description: "We complete the work and bill the remaining balance." },
  ],

  projects: [
    { image: "project-01", title: "Full Roof Replacement", location: "Franklin, TN" },
    { image: "project-02", title: "Architectural Shingle Re-Roof", location: "Brentwood, TN" },
    { image: "project-03", title: "Premium Metal Roof", location: "Nashville, TN" },
    { image: "project-04", title: "Storm Damage Restoration", location: "Murfreesboro, TN" },
    { image: "project-05", title: "Tile Roof Repair", location: "Columbia, TN" },
    { image: "project-06", title: "Gutter & Roof Service", location: "Gallatin, TN" },
  ],

  financing: {
    title: "Flexible Financing Options",
    body: "Get the roof you need now and pay over time with Klarna, Afterpay, Splitit and more — presented at checkout, powered by Whop.",
    providers: ["Klarna", "Afterpay", "Splitit", "Apple Pay", "Google Pay"],
    points: [
      { icon: "zap", label: "Fast approval at checkout" },
      { icon: "credit-card", label: "Multiple payment options" },
      { icon: "percent", label: "No hidden fees" },
      { icon: "lock", label: "Secure & trusted" },
    ],
    disclaimer:
      "Financing and buy-now-pay-later options are provided by third parties and shown at checkout to eligible customers. Approval and terms are determined by the provider, not by IronRidge.",
    cta: { label: "Book an Inspection", href: "/book/inspection" },
  },

  reviews: [
    {
      quote:
        "IronRidge made the entire process easy. The inspection was thorough, the team was professional, and the new roof looks incredible. Highly recommend!",
      name: "Sarah M.",
      location: "Franklin, TN",
      stars: 5,
    },
    {
      quote:
        "Clear pricing and no pressure. They explained every step, from the deposit to the final invoice, and finished ahead of schedule.",
      name: "David R.",
      location: "Brentwood, TN",
      stars: 5,
    },
    {
      quote:
        "After a bad storm they had a crew out fast, tarped the roof, and had it repaired that week. True professionals.",
      name: "Linda K.",
      location: "Nashville, TN",
      stars: 5,
    },
  ],

  serviceArea: {
    heading: "Our Service Area",
    subtitle: "Proudly serving Middle Tennessee and surrounding areas.",
    cities: [
      "Nashville",
      "Franklin",
      "Brentwood",
      "Murfreesboro",
      "Columbia",
      "Gallatin",
      "Lebanon",
      "Clarksville",
    ],
    note: "…and surrounding areas",
  },

  plans: {
    inspection: {
      eyebrow: "Inspection",
      name: "One-Time Roof Inspection",
      priceCents: USD(149),
      currency: "usd",
      cadence: "one-time",
      features: [
        "Comprehensive roof inspection",
        "Detailed report with photos",
        "Expert recommendations",
        "Credited toward your project",
      ],
      cta: "Book Inspection",
      summary:
        "A licensed inspector documents the condition of your roof and sends a written report with photos. The $149 fee is credited toward any project you book with us.",
    },
    deposit: {
      eyebrow: "Project Deposit",
      name: "Roof Project Deposit",
      priceCents: USD(500),
      currency: "usd",
      cadence: "one-time",
      features: [
        "Secures your project date",
        "Deducted from your final invoice",
        "Card saved securely for the balance",
        "Fully refundable if the project isn't approved",
      ],
      cta: "Pay Deposit",
      summary:
        "Reserve your installation date. Your $500 deposit is credited to the final invoice. With your consent, we securely save a card on file so the remaining balance can be billed when the work is complete.",
      saveCardForBalance: true,
    },
    flatRate: {
      eyebrow: "Flat-Rate Service",
      name: "Roof Leak Repair",
      priceCents: USD(399),
      currency: "usd",
      cadence: "one-time",
      features: [
        "Diagnose and repair an active leak",
        "Includes labor and standard materials",
        "Most residential roofs",
        "1-year workmanship warranty",
      ],
      cta: "Book Repair",
      summary:
        "A fixed-price visit to locate and repair a single active leak on most residential roofs, including labor and standard materials. Additional work is quoted and approved before it begins.",
    },
  },

  estimateForm: {
    heading: "Request a Free Estimate",
    subtitle: "Tell us about your project and we'll get back to you within 1 business day.",
    assurances: [
      { icon: "zap", label: "Fast Response" },
      { icon: "file-text", label: "Detailed Quotes" },
      { icon: "shield", label: "No Pressure" },
    ],
    serviceOptions: [
      "Roof Inspection",
      "Roof Replacement",
      "Roof Repair",
      "Storm Damage",
      "Gutter Installation",
      "Other / Not sure",
    ],
    roofTypeOptions: ["Asphalt Shingle", "Metal", "Tile", "Flat / Low-slope", "Not sure"],
    timelineOptions: ["As soon as possible", "Within 1 month", "1–3 months", "Just exploring"],
  },

  footer: {
    quickLinks: [
      { label: "Home", href: "#top" },
      { label: "Services", href: "#services" },
      { label: "Pricing", href: "#pricing" },
      { label: "Our Work", href: "#projects" },
      { label: "Service Area", href: "#service-area" },
      { label: "Contact", href: "#estimate" },
    ],
    serviceLinks: [
      "Roof Inspections",
      "Roof Replacements",
      "Roof Repairs",
      "Storm Damage",
      "Gutter Installation",
      "Exterior Services",
    ],
    legalLinks: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },

  tracking: {
    estimateRequested: "estimate_requested",
    serviceViewed: "service_viewed",
    depositStarted: "deposit_started",
  },
};
