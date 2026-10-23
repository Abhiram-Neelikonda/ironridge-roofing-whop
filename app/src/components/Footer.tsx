import { site } from "../config/site";
import { Logo } from "./ui/Logo";
import { Icon } from "./ui/Icon";

export function Footer() {
  const c = site.contact;
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__about">
            <Logo light />
            <p>{site.brand.tagline}</p>
          </div>

          <div className="footer__col">
            <h4>Quick Links</h4>
            {site.footer.quickLinks.map((l) => (
              <a key={l.label} href={l.href.startsWith("#") ? `/${l.href}` : l.href}>
                {l.label}
              </a>
            ))}
          </div>

          <div className="footer__col">
            <h4>Services</h4>
            {site.footer.serviceLinks.map((l) => (
              <span key={l} style={{ display: "block" }}>
                {l}
              </span>
            ))}
          </div>

          <div className="footer__col">
            <h4>Contact</h4>
            <a className="footer__contact-item" href={c.phoneHref}>
              <Icon name="phone" /> {c.phone}
            </a>
            <a className="footer__contact-item" href={`mailto:${c.email}`}>
              <Icon name="mail" /> {c.email}
            </a>
            <span className="footer__contact-item">
              <Icon name="map-pin" /> {c.cityState}
            </span>
            <span className="footer__contact-item">
              <Icon name="clock" /> {c.hours}
            </span>
            <div className="footer__social">
              {c.social.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label}>
                  <Icon name={s.icon} size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer__bar">
          <span>
            © {new Date().getFullYear()} {site.brand.name}. {c.license}
          </span>
          <span className="footer__bar-links">
            {site.footer.legalLinks.map((l) => (
              <a key={l.label} href={l.href}>
                {l.label}
              </a>
            ))}
            <span className="footer__whop">
              Built with <strong>Whop</strong>
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
