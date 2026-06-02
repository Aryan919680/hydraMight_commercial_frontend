import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Loader2, MapPin, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import {
  fetchCategories,
  fetchProducts,
  type ApiCategory,
  type ApiProduct,
} from "@/lib/api";

interface Props {
  onPickLocation?: () => void;
}

export const CategorySections = ({ onPickLocation }: Props) => {
  const { selected } = useLocation();
  const { addItem } = useCart();
  const [cats, setCats] = useState<ApiCategory[]>([]);
  const [productsByCat, setProductsByCat] = useState<Record<string, ApiProduct[]>>({});
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then((d) =>
        setCats(
          [...d].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        )
      )
      .catch(() => setCats([]))
      .finally(() => setLoadingCats(false));
  }, []);

  useEffect(() => {
    if (!selected || cats.length === 0) return;
    let cancelled = false;
    setLoadingProducts(true);
    Promise.all(
      cats.map((c) =>
        fetchProducts(selected.id, "household", {
          category_slug: c.slug,
          limit: 12,
        })
          .then((items): [string, ApiProduct[]] => [c.slug, items])
          .catch((): [string, ApiProduct[]] => [c.slug, []])
      )
    ).then((entries) => {
      if (cancelled) return;
      const map: Record<string, ApiProduct[]> = {};
      entries.forEach(([slug, items]) => (map[slug] = items));
      setProductsByCat(map);
      setLoadingProducts(false);
    });
    return () => {
      cancelled = true;
    };
  }, [selected, cats]);

  if (!selected) {
    return (
      <section className="container pb-10">
        <div className="rounded-3xl border border-dashed border-gold/40 bg-gradient-card p-10 text-center">
          <MapPin className="size-8 text-gold mx-auto mb-3" />
          <h3 className="font-display text-2xl text-primary mb-2">
            Pick a delivery hub
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            Choose a warehouse to see what's available near you.
          </p>
          <Button
            onClick={onPickLocation}
            className="bg-primary hover:bg-primary/90"
          >
            Choose location
          </Button>
        </div>
      </section>
    );
  }

  if (loadingCats) {
    return (
      <div className="container py-16 grid place-items-center text-muted-foreground">
        <Loader2 className="size-7 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container pb-20 space-y-14">
      {cats.map((c) => {
        const items = productsByCat[c.slug] ?? [];
        const isLoading = loadingProducts && items.length === 0;
        if (!isLoading && items.length === 0) return null;
        return (
          <section key={c.id}>
            <div className="flex items-end justify-between mb-5 gap-4">
              <div>
                {/* <div className="text-[11px] uppercase tracking-[0.25em] text-gold-deep mb-1">
                  Category
                </div> */}
                <h2 className="font-display text-2xl md:text-3xl text-primary">
                  {c.name}
                </h2>
              </div>
              <Link
                to={`/search?q=${encodeURIComponent(c.name)}`}
                className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                View all <ChevronRight className="size-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                ))}
              </div>
            ) : (
              <Carousel opts={{ align: "start", dragFree: true }} className="relative">
                <CarouselContent className="-ml-3">
                  {items.map((p) => {
                    const mrp = parseFloat(String(p.mrp));
                    const sp = parseFloat(String(p.selling_price));
                    const hasDiscount = mrp > sp;
                    const discount = hasDiscount
                      ? Math.round(((mrp - sp) / mrp) * 100)
                      : 0;
                    return (
                      <CarouselItem
                        key={p.id}
                        className="pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                      >
                        <article className="group relative flex flex-col h-full rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-soft transition-all overflow-hidden">
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
                              {p.brand}
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
                                <span className="font-display text-base text-primary">
                                  ₹{sp}
                                </span>
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
                                    quantity_value:
                                      p.quantity_value != null
                                        ? String(p.quantity_value)
                                        : null,
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
                                <Plus className="size-3.5 mr-0.5" /> ADD
                              </Button>
                            </div>
                          </div>
                        </article>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-4" />
                <CarouselNext className="hidden md:flex -right-4" />
              </Carousel>
            )}
          </section>
        );
      })}
    </div>
  );
};
