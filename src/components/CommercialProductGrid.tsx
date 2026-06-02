import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Loader2, MapPin, PackageCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import { fetchProducts, type ApiProduct } from "@/lib/api";

interface Props {
  onSignup: () => void;
  onLogin: () => void;
  onPickLocation?: () => void;
}

export const CommercialProductGrid = ({ onSignup, onLogin, onPickLocation }: Props) => {
  const { selected } = useLocation();
  const { addItem } = useCart();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) {
      setProducts([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await fetchProducts(selected.id, "commercial", { limit: 60 });
        if (!cancelled) setProducts(items);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load commercial products");
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  return (
    <section className="container pb-20">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-gold-deep mb-2">Commercial Products</div>
          <h2 className="font-display text-4xl md:text-5xl text-primary">Built for daily business use</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Products shown here are filtered for commercial channel.
            {selected ? ` Stock source: ${selected.name}, ${selected.city}.` : " Select a delivery hub to view price and stock."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onLogin} className="rounded-full">Login</Button>
          <Button onClick={onSignup} className="rounded-full bg-primary hover:bg-primary/90">Request Access</Button>
        </div>
      </div>

      {!selected && (
        <div className="rounded-3xl border border-dashed border-gold/40 bg-gradient-card p-10 text-center">
          <MapPin className="size-8 text-gold mx-auto mb-3" />
          <h3 className="font-display text-2xl text-primary mb-2">Select business delivery location</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-xl mx-auto">
            Location is required because commercial price and stock are mapped by service location.
          </p>
          <Button onClick={onPickLocation} className="bg-primary hover:bg-primary/90 rounded-full">Choose location</Button>
        </div>
      )}

      {selected && loading && (
        <div className="py-20 grid place-items-center text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
        </div>
      )}

      {selected && !loading && error && (
        <div className="rounded-3xl border border-dashed border-gold/40 bg-gradient-card p-10 text-center">
          <Building2 className="size-8 text-gold mx-auto mb-3" />
          <h3 className="font-display text-2xl text-primary mb-2">Commercial products are not available yet</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-xl mx-auto">{error}</p>
          <Button onClick={onPickLocation} variant="outline" className="rounded-full mr-2">Change location</Button>
          <Button onClick={onSignup} className="bg-primary hover:bg-primary/90 rounded-full">Request business account</Button>
        </div>
      )}

      {selected && !loading && !error && products.length === 0 && (
        <div className="rounded-3xl border border-dashed border-gold/40 bg-gradient-card p-10 text-center">
          <PackageCheck className="size-8 text-gold mx-auto mb-3" />
          <h3 className="font-display text-2xl text-primary mb-2">No commercial products found</h3>
          <p className="text-sm text-muted-foreground mb-5">Add products with commercial channel in admin to show them here.</p>
          <Button onClick={onSignup} className="bg-primary hover:bg-primary/90 rounded-full">Request business access</Button>
        </div>
      )}

      {selected && !loading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {products.map((p, i) => {
            const mrp = parseFloat(String(p.mrp || 0));
            const sp = parseFloat(String(p.selling_price || 0));
            const hasDiscount = mrp > sp && sp > 0;
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
                {hasDiscount && (
                  <span className="absolute top-2 left-2 z-10 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-md shadow-sm">{discount}% OFF</span>
                )}

                <Link to={`/product/${p.slug}`} className="relative block aspect-square bg-secondary/40 overflow-hidden">
                  {p.primary_image ? (
                    <img src={p.primary_image} alt={p.name} loading="lazy" className="size-full object-contain p-3 group-hover:scale-105 transition-transform duration-500 ease-luxury" />
                  ) : (
                    <div className="size-full bg-gradient-emerald" />
                  )}
                </Link>

                <div className="flex flex-col flex-1 p-3 gap-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.brand || "HydraMight"} · {p.category_name}</div>
                  <Link to={`/product/${p.slug}`} className="font-medium text-sm leading-snug text-foreground line-clamp-2 min-h-[2.5rem] hover:text-primary">{p.name}</Link>
                  <div className="text-xs text-muted-foreground">{p.quantity_value} {p.quantity_unit}</div>
                  <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                    <div className="flex flex-col leading-tight">
                      {sp > 0 ? <span className="font-display text-base text-primary">₹{sp}</span> : <span className="font-display text-base text-primary">Business price</span>}
                      {hasDiscount && <span className="text-[11px] text-muted-foreground line-through">₹{mrp}</span>}
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
                          location_id: p.location_id || p.service_location_id || selected.id,
                          location_name: selected.name,
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
