import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import promoHome from "@/assets/promo-home.jpg";
import promoKitchen from "@/assets/promo-kitchen.jpg";
import promoLaundry from "@/assets/promo-laundry.jpg";

const cards = [
  {
    title: "Home cleaners",
    subtitle: "Multipurpose & floor sprays",
    cta: "Shop now",
    image: promoHome,
    bg: "bg-[hsl(200_80%_88%)]",
    text: "text-[hsl(220_75%_18%)]",
  },
  {
    title: "Kitchen care",
    subtitle: "Dishwash & tile shine",
    cta: "Order now",
    image: promoKitchen,
    bg: "bg-[hsl(215_75%_30%)]",
    text: "text-[hsl(200_100%_96%)]",
  },
  {
    title: "Laundry essentials",
    subtitle: "Detergents & softeners",
    cta: "Explore",
    image: promoLaundry,
    bg: "bg-[hsl(195_90%_55%)]",
    text: "text-[hsl(220_75%_15%)]",
  },
];

export const PromoCards = () => {
  return (
    <section className="container pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {cards.map((c, i) => (
          <motion.button
            key={c.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative overflow-hidden rounded-3xl ${c.bg} ${c.text} text-left h-44 md:h-52 shadow-soft hover:shadow-elegant transition-all`}
          >
            <div className="relative z-10 p-5 md:p-6 max-w-[60%]">
              <h3 className="font-display text-xl md:text-2xl leading-tight mb-1.5">{c.title}</h3>
              <p className="text-sm opacity-80 mb-4">{c.subtitle}</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-background/90 text-foreground rounded-full px-3 py-1.5 group-hover:gap-2.5 transition-all">
                {c.cta} <ArrowRight className="size-3.5" />
              </span>
            </div>
            <img
              src={c.image}
              alt={c.title}
              loading="lazy"
              className="absolute right-0 bottom-0 h-full w-1/2 object-cover object-left group-hover:scale-105 transition-transform duration-700 ease-luxury"
            />
          </motion.button>
        ))}
      </div>
    </section>
  );
};
