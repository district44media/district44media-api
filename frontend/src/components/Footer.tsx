import { Link } from "react-router-dom";

const legalLinks = [
  { label: "Legal Notice", to: "/legal-notice" },
  { label: "Terms of Service", to: "/terms-of-service" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Billing Policy", to: "/billing-and-subscription-policy" },
  { label: "Cookies", to: "/cookies" },
];

const Footer = () => {
  return (
    <footer className="border-t border-border py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <h4
              className="text-sm font-semibold tracking-widest uppercase text-foreground mb-5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Legal
            </h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              className="text-sm font-semibold tracking-widest uppercase text-foreground mb-5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Company
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              D44 Veleta OÜ
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Registered in Estonia (EU)
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            © 2026 D44 Veleta OÜ — Digital Promotion &amp; Visibility Services
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
