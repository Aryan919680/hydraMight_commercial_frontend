import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import { fetchRecommendations, type ApiProduct } from "@/lib/api";

interface Props {
  slug: string;
  locationId: string;
  locationName?: string;
}

export const RecommendedSlider = ({ slug, locationId, locationName }: Props) => {
  const { addItem } = useCart();
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug || !locationId) return;
    setLoading(true);
    fetchRecommendations(slug, locationId, "commercial")
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [slug, locationId]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  if (!loading && items.length === 0) return null;

  return (
    <section className="mt-20">
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-gold-deep mb-2">
            You may also like
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-primary">
            Recommended for you
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scrollBy(-1)}
            className="size-10 grid place-items-center rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="size-10 grid place-items-center rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-3 md:gap-4 overflow-hidden pb-2 -mx-4 px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-[44%] sm:w-[30%] md:w-[24%] lg:w-[19%] rounded-2xl bg-card border border-border overflow-hidden"
            >
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-8 w-14 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={scrollerRef}
          className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((p, i) => {
            const mrp = parseFloat(String(p.mrp));
            const sp = parseFloat(String(p.selling_price));
            const hasDiscount = mrp > sp;
            const discount = hasDiscount ? Math.round(((mrp - sp) / mrp) * 100) : 0;
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.04 }}
                className="snap-start shrink-0 w-[44%] sm:w-[30%] md:w-[24%] lg:w-[19%] group relative flex flex-col rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-soft transition-all overflow-hidden"
              >
                {hasDiscount && (
                  <span className="absolute top-2 left-2 z-10 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-md shadow-sm">
                    {discount}% OFF
                  </span>
                )}
                <Link
                  to={`/product/${p.slug}`}
                  className="relative block aspect-square bg-secondary/40 overflow-hidden"
                >
                  {p.primary_image ? (
                    <img
                      src={p.primary_image}
                      alt={p.name}
                      loading="lazy"
                      className="size-full object-contain p-3 group-hover:scale-105 transition-transform duration-500 ease-luxury"
                    />
                  ) : (
                    <div className="size-full bg-gradient-emerald" />
                  )}
                </Link>
                <div className="flex flex-col flex-1 p-3 gap-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {p.brand} · {p.category_name}
                  </div>
                  <Link
                    to={`/product/${p.slug}`}
                    className="font-medium text-sm leading-snug text-foreground line-clamp-2 min-h-[2.5rem] hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {p.quantity_value} {p.quantity_unit}
                  </div>
                  <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                    <div className="flex flex-col leading-tight">
                      <span className="font-display text-base text-primary">₹{sp}</span>
                      {hasDiscount && (
                        <span className="text-[11px] text-muted-foreground line-through">
                          ₹{mrp}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        addItem({
                          id: p.id,
                          slug: p.slug,
                          name: p.name,
                          brand: p.brand,
                          image: p.primary_image,
                          quantity_value: p.quantity_value != null ? String(p.quantity_value) : null,
                          quantity_unit: p.quantity_unit,
                          price: sp,
                          mrp,
                          location_id: p.location_id,
                          location_name: locationName,
                        });
                        toast.success(`${p.name} added to bag`);
                      }}
                      className="h-8 px-3 rounded-lg border-primary/30 text-primary font-semibold hover:bg-primary hover:text-primary-foreground"
                    >
                      <Plus className="size-3.5 mr-0.5" /> ADD
                    </Button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
};
