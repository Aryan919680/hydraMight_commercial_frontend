import { Apple, Facebook, Instagram, Linkedin, Play, Twitter, AtSign } from "lucide-react";
import logo from "@/assets/logo-hydramight.png";

const StoreButton = ({
  icon: Icon,
  small,
  big,
}: {
  icon: typeof Apple;
  small: string;
  big: string;
}) => (
  <a
    href="#"
    className="inline-flex items-center gap-2.5 rounded-xl bg-foreground text-background px-3.5 py-2 hover:opacity-90 transition-opacity"
  >
    <Icon className="size-5" />
    <span className="text-left leading-tight">
      <span className="block text-[9px] uppercase tracking-widest opacity-80">{small}</span>
      <span className="block text-sm font-semibold">{big}</span>
    </span>
  </a>
);

const SocialIcon = ({ icon: Icon, label }: { icon: typeof Apple; label: string }) => (
  <a
    href="#"
    aria-label={label}
    className="size-9 rounded-full bg-foreground text-background grid place-items-center hover:bg-primary transition-colors"
  >
    <Icon className="size-4" />
  </a>
);

export const Footer = () => (
  <footer className="border-t border-border bg-gradient-card">
    <div className="container py-12 grid md:grid-cols-4 gap-8">
      <div>
        <div className="mb-4">
          <img src={logo} alt="HydraMight logo" className="h-24 w-auto object-contain" />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Plant-powered cleaning essentials, designed for the modern home.
        </p>
      </div>
      {[
        { t: "Shop", l: ["All products", "Bestsellers", "Refills", "Gift sets"] },
        { t: "Company", l: ["Our story", "Sustainability", "Press", "Careers"] },
        { t: "Help", l: ["Contact", "Shipping", "Returns", "FAQ"] },
      ].map((c) => (
        <div key={c.t}>
          <div className="text-xs uppercase tracking-widest text-gold-deep mb-3">{c.t}</div>
          <ul className="space-y-2">
            {c.l.map((i) => (
              <li key={i}>
                <a href="#" className="text-sm text-foreground/80 hover:text-primary">{i}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="border-t border-border bg-secondary/40">
      <div className="container py-5 flex flex-wrap items-center justify-between gap-5">
        <span className="text-xs text-muted-foreground">
          © HydraMight Home Pvt. Ltd., {new Date().getFullYear()}
        </span>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-foreground/80 mr-1">Download App</span>
          <StoreButton icon={Apple} small="Download on the" big="App Store" />
          <StoreButton icon={Play} small="GET IT ON" big="Google Play" />
        </div>

        <div className="flex items-center gap-2">
          <SocialIcon icon={Facebook} label="Facebook" />
          <SocialIcon icon={Twitter} label="Twitter / X" />
          <SocialIcon icon={Instagram} label="Instagram" />
          <SocialIcon icon={Linkedin} label="LinkedIn" />
          <SocialIcon icon={AtSign} label="Threads" />
        </div>
      </div>

      <div className="container pb-6">
        <p className="text-[11px] leading-relaxed text-muted-foreground max-w-5xl">
          "HydraMight" is owned & managed by "HydraMight Home Pvt. Ltd." and is not related,
          linked or interconnected in any manner or nature with any other brand of similar name.
          All product images, logos and trademarks shown on this website are the property of
          their respective owners.
        </p>
      </div>
    </div>
  </footer>
);

