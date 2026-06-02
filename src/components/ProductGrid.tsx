import { motion } from "framer-motion";
import { Plus, Loader2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { fetchProducts, type ApiProduct } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface Props {
  onPickLocation?: () => void;
}

export const ProductGrid = ({ onPickLocation }: Props) => {
  const { selected } = useLocation();
  const { addItem } = useCart();
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    fetchProducts(selected.id)
      .then(setItems)
      .catch((e) => setError(e.message ?? "Failed to load"))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <section className="container pb-20">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-gold-deep mb-2">The Collection</div>
          <h2 className="font-display text-4xl md:text-5xl text-primary">
            Crafted for everyday rituals
          </h2>
          {selected && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
              <MapPin className="size-3.5 text-gold" />
              Showing stock at <span className="font-medium text-primary">{selected.name}, {selected.city}</span>
            </p>
          )}
        </div>
      </div>

      {!selected && (
        <div className="rounded-3xl border border-dashed border-gold/40 bg-gradient-card p-10 text-center">
          <MapPin className="size-8 text-gold mx-auto mb-3" />
          <h3 className="font-display text-2xl text-primary mb-2">Pick a delivery hub</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Choose a warehouse to see what's available near you.
          </p>
          <Button onClick={onPickLocation} className="bg-primary hover:bg-primary/90">
            Choose location
          </Button>
        </div>
      )}

      {selected && loading && (
        <div className="py-20 grid place-items-center text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
        </div>
      )}

      {selected && error && (
        <div className="py-10 text-center text-destructive">{error}</div>
      )}

      {selected && !loading && !error && items.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          No products available at this location yet.
        </div>
      )}

      {selected && !loading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {items.map((p, i) => {
            const mrp = parseFloat(String(p.mrp));
            const sp = parseFloat(String(p.selling_price));
            const hasDiscount = mrp > sp;
            const discount = hasDiscount ? Math.round(((mrp - sp) / mrp) * 100) : 0;
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: Math.min(i, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex flex-col rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-soft transition-all overflow-hidden"
              >
                {/* discount badge */}
                {hasDiscount && (
                  <span className="absolute top-2 left-2 z-10 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-md shadow-sm">
                    {discount}% OFF
                  </span>
                )}

                <Link
  to={`/product/${p.id}`}
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
  to={`/product/${p.id}`}
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
                        <span className="text-[11px] text-muted-foreground line-through">₹{mrp}</span>
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
                          location_name: selected?.name,
                        });
                        toast.success(`${p.name} added to bag`, {
                          description: `${p.quantity_value} ${p.quantity_unit} · ₹${sp}`,
                        });
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
