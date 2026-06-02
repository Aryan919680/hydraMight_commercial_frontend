import { motion } from "framer-motion";
import { ArrowRight, Building2, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import banner from "@/assets/banner-hero.jpg";

interface Props {
  onSignup: () => void;
  onLogin: () => void;
}

export const CommercialHero = ({ onSignup, onLogin }: Props) => {
  return (
    <section className="container pt-4 md:pt-6 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl bg-gradient-hero text-primary-foreground shadow-elegant"
      >
        <div className="grid md:grid-cols-2 items-center">
          <div className="relative z-10 p-6 md:p-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-[11px] uppercase tracking-[0.22em] mb-5">
              <Building2 className="size-3 text-gold" /> Commercial cleaning supply
            </div>
            <h1 className="font-display text-3xl md:text-5xl leading-[1.05] mb-3">
              Bulk hygiene products<br />
              <span className="gold-text-gradient italic">for your business.</span>
            </h1>
            <p className="text-primary-foreground/80 text-sm md:text-base mb-5 max-w-md">
              Browse commercial-grade phenyl, floor cleaners, dishwash liquids and hygiene essentials for offices, shops, hotels and institutions.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={onSignup} size="default" className="rounded-full bg-gold text-primary hover:bg-gold-soft h-11 px-6 shadow-gold">
                Request Business Access <ArrowRight className="size-4" />
              </Button>
              <Button onClick={onLogin} size="default" variant="ghost" className="rounded-full text-primary-foreground hover:bg-primary-foreground/10 h-11 px-5 border border-primary-foreground/20">
                Login
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-7 text-xs text-primary-foreground/75">
              <div className="flex items-center gap-2"><PackageCheck className="size-4 text-gold" /> Bulk packs</div>
              <div className="flex items-center gap-2"><Truck className="size-4 text-gold" /> Business delivery</div>
              <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-gold" /> Approved accounts</div>
            </div>
          </div>

          <div className="relative h-56 md:h-[360px]">
            <img src={banner} alt="Commercial cleaning supplies" width={1600} height={900} className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/10 to-transparent md:from-primary/40 md:via-transparent" />
          </div>
        </div>

        <div className="absolute -top-32 -left-32 size-[28rem] rounded-full border border-gold/10 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-[18rem] rounded-full border border-gold/10 pointer-events-none" />
      </motion.div>
    </section>
  );
};
