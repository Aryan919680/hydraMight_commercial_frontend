import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CommercialNavbar as Navbar } from "@/components/CommercialNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationDialog } from "@/components/LocationDialog";
import { CommercialAuthDialog as LoginDialog } from "@/components/CommercialAuthDialog";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { searchProducts, type ApiProduct, type ApiPagination } from "@/lib/api";

const Search = () => {
  const [params] = useSearchParams();
  const q = params.get("q")?.trim() ?? "";
  const { selected } = useLocation();
  const { addItem } = useCart();

  const [items, setItems] = useState<ApiProduct[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!q || !selected) {
      setItems([]);
      setPagination(null);
      return;
    }
    setLoading(true);
    setError(null);
    searchProducts(q, selected.id, "commercial", { limit: 40 })
      .then(({ products, pagination }) => {
        setItems(products);
        setPagination(pagination);
      })
      .catch((e) => setError(e.message ?? "Failed to search"))
      .finally(() => setLoading(false));
  }, [q, selected]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        address={selected ? `${selected.name}, ${selected.city}` : null}
        onOpenLocation={() => setLocationOpen(true)}
        onOpenLogin={() => setLoginOpen(true)}
      />
      <main className="flex-1 container py-6 md:py-10">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Search results</div>
          <h1 className="font-display text-2xl md:text-3xl">
            {q ? <>Results for "<span className="text-primary">{q}</span>"</> : "Search products"}
          </h1>
          {pagination && !loading && (
            <div className="text-sm text-muted-foreground mt-1">
              {pagination.total} {pagination.total === 1 ? "product" : "products"} found
            </div>
          )}
        </div>

        {!selected && (
          <div className="py-16 text-center">
            <p className="text-muted-foreground mb-4">Set your location to search products.</p>
            <Button onClick={() => setLocationOpen(true)}>Choose location</Button>
          </div>
        )}

        {selected && loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border overflow-hidden">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && !loading && error && (
          <div className="py-16 text-center text-destructive">{error}</div>
        )}

        {selected && !loading && !error && q && items.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            No products found for "{q}".
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
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03 }}
                  className="group relative flex flex-col rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-soft transition-all overflow-hidden"
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
                        className="size-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
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
                          toast.success(`${p.name} added to bag`);
                        }}
                        className="h-8 px-3 rounded-lg border-primary/30 text-primary font-semibold hover:bg-primary hover:text-primary-foreground"
                      >
                        ADD
                      </Button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
      <LocationDialog open={locationOpen} onOpenChange={setLocationOpen} />
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} onLoggedIn={() => {}} />
    </div>
  );
};

export default Search;
