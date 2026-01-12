import { Link } from "react-router-dom";
import { Sparkles, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const productLinks = [
  { label: "Download App", href: "#" },
  { label: "Partner Studio", href: "/auth?role=merchant" },
  { label: "Creator Studio", href: "/auth?role=curator" },
];

const companyLinks = [
  { label: "About", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Contact", href: "#" },
];

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function StudioFooter() {
  return (
    <footer className="bg-slate-950 border-t border-white/10">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Column 1: Logo + Tagline */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-vibe">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-heading font-bold text-xl text-white">VibeCheck</span>
                <span className="block text-xs text-white/40 uppercase tracking-wider">Studio</span>
              </div>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed">
              Empowering Local Culture.
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="font-heading font-bold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="font-heading font-bold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Socials + Copyright */}
          <div>
            <h4 className="font-heading font-bold text-white mb-4">Connect</h4>
            <div className="flex items-center gap-3 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="text-xs text-white/30">
              © 2024 VibeCheck. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
