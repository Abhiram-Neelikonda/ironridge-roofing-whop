import { useEffect, useState } from "react";
import { site } from "../config/site";
import { Logo } from "./ui/Logo";
import { Icon } from "./ui/Icon";

const NAV = [
  { label: "Home", href: "/#top" },
  { label: "Services", href: "/#services" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Our Work", href: "/#projects" },
  { label: "Service Area", href: "/#service-area" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Contact", href: "/#estimate" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="header" data-scrolled={scrolled}>
      <div className="container header__inner">
        <a href="/#top" aria-label={site.brand.name}>
          <Logo />
        </a>
        <nav className="header__nav" aria-label="Primary">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <span className="header__spacer" />
        <a className="header__phone" href={site.contact.phoneHref}>
          <Icon name="phone" />
          {site.contact.phone}
        </a>
        <a className="btn btn--primary header__cta" href="/#estimate">
          Request an Estimate <Icon name="arrow-right" />
        </a>
        <button
          className="header__menu-btn"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
          <a className="btn btn--primary" href="/#estimate" onClick={() => setOpen(false)}>
            Request an Estimate <Icon name="arrow-right" />
          </a>
        </nav>
      )}
    </header>
  );
}
