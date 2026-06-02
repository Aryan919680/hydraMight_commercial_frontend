import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import banner from "@/assets/banner-hero.jpg";

export const Hero = () => {
  return (
    <section className="container pt-4 md:pt-6 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl bg-gradient-hero text-primary-foreground shadow-elegant"
      >
        <div className="grid md:grid-cols-2 items-center">
          <div className="relative z-10 p-6 md:p-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-[11px] uppercase tracking-[0.22em] mb-5">
              <Sparkles className="size-3 text-gold" /> Sparkling clean essentials
            </div>
            <h1 className="font-display text-3xl md:text-5xl leading-[1.05] mb-3">
              Stock up on<br />
              <span className="gold-text-gradient italic">spotless living.</span>
            </h1>
            <p className="text-primary-foreground/80 text-sm md:text-base mb-5 max-w-md">
              Premium multipurpose, kitchen, glass and laundry care — formulated
              to leave every surface gleaming.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="default" className="rounded-full bg-gold text-primary hover:bg-gold-soft h-11 px-6 shadow-gold">
                Shop Now <ArrowRight className="size-4" />
              </Button>
              <Button size="default" variant="ghost" className="rounded-full text-primary-foreground hover:bg-primary-foreground/10 h-11 px-5 border border-primary-foreground/20">
                Explore range
              </Button>
            </div>
            <div className="flex items-center gap-5 mt-6 text-xs text-primary-foreground/70">
              <div><div className="font-display text-xl text-primary-foreground">4.9★</div><div className="uppercase tracking-widest mt-0.5">12k reviews</div></div>
              <div className="h-8 w-px bg-primary-foreground/20" />
              <div><div className="font-display text-xl text-primary-foreground">100%</div><div className="uppercase tracking-widest mt-0.5">Plant-based</div></div>
              <div className="h-8 w-px bg-primary-foreground/20 hidden sm:block" />
              <div className="hidden sm:block"><div className="font-display text-xl text-primary-foreground">Free</div><div className="uppercase tracking-widest mt-0.5">Ship over ₹499</div></div>
            </div>
          </div>

          <div className="relative h-56 md:h-[360px]">
            <img
              src={banner}
              alt="Premium cleaning product collection"
              width={1600}
              height={900}
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/10 to-transparent md:from-primary/40 md:via-transparent" />
          </div>
        </div>

        {/* decorative rings */}
        <div className="absolute -top-32 -left-32 size-[28rem] rounded-full border border-gold/10 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-[18rem] rounded-full border border-gold/10 pointer-events-none" />
      </motion.div>
    </section>
  );
};
