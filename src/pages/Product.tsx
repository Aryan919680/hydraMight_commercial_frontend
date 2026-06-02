import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  Loader2,
  Plus,
  Minus,
} from "lucide-react";
import { CommercialNavbar as Navbar } from "@/components/CommercialNavbar";
import { Footer } from "@/components/Footer";
import { ProductGallery } from "@/components/ProductGallery";
import { RecommendedSlider } from "@/components/RecommendedSlider";
import { CommercialAuthDialog as LoginDialog } from "@/components/CommercialAuthDialog";
import { LocationDialog } from "@/components/LocationDialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { fetchProduct, type ApiProduct } from "@/lib/api";
import { toast } from "sonner";

const Product = () => {
  const { slug = "" } = useParams();
  const { selected } = useLocation();
  const { addItem } = useCart();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const [loginOpen, setLoginOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  useEffect(() => {
    if (!selected) {
      setProduct(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setProduct(null);
    setQty(1);

    fetchProduct(slug, selected.id, "commercial")
      .then((p) => {
        setProduct(p);

        if (!p) {
          setError("Product not available at this location");
        }
      })
      .catch((e) => {
        setError(e?.message || "Failed to load product");
      })
      .finally(() => setLoading(false));
  }, [slug, selected]);

  const mrp = product ? Number(product.mrp || 0) : 0;
  const sp = product ? Number(product.selling_price || 0) : 0;
  const availableStock = Number(product?.available_stock || 0);
  const discount = mrp > sp ? Math.round(((mrp - sp) / mrp) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        address={selected ? `${selected.name}, ${selected.city}` : null}
        onOpenLocation={() => setLocationOpen(true)}
        onOpenLogin={() => setLoginOpen(true)}
      />

      <main className="flex-1 container py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="size-4" /> Back to collection
        </Link>

        {!selected && (
          <div className="rounded-3xl border border-dashed border-gold/40 bg-gradient-card p-10 text-center">
            <MapPin className="size-8 text-gold mx-auto mb-3" />

            <h3 className="font-display text-2xl text-primary mb-2">
              Select a delivery hub
            </h3>

            <p className="text-sm text-muted-foreground mb-5">
              We need a location to confirm price & stock for this product.
            </p>

            <Button
              onClick={() => setLocationOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              Choose location
            </Button>
          </div>
        )}

        {selected && loading && (
          <div className="py-32 grid place-items-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {selected && !loading && error && (
          <div className="py-20 text-center">
            <div className="font-display text-2xl text-primary mb-2">
              {error}
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Try choosing a different warehouse.
            </p>

            <Button onClick={() => setLocationOpen(true)}>
              Change location
            </Button>
          </div>
        )}

        {selected && product && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="grid md:grid-cols-2 gap-10 lg:gap-16"
          >
            <ProductGallery product={product} />

            <div className="flex flex-col">
              <div className="text-xs uppercase tracking-[0.25em] text-gold-deep mb-2">
                {product.category_name} · {product.brand}
              </div>

              <h1 className="font-display text-4xl md:text-5xl text-primary leading-tight mb-3">
                {product.name}
              </h1>

              <p className="text-muted-foreground mb-6">
                {product.short_description || product.description}
              </p>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-4xl text-primary">
                  ₹{sp}
                </span>

                {discount > 0 && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{mrp}
                    </span>

                    <span className="text-sm font-medium text-gold-deep">
                      {discount}% off
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-6">
                <span className="px-3 py-1.5 rounded-full bg-secondary">
                  {product.quantity_value} {product.quantity_unit}
                </span>

                {product.weight && (
                  <span className="px-3 py-1.5 rounded-full bg-secondary">
                    {product.weight} g
                  </span>
                )}

                <span
                  className={`px-3 py-1.5 rounded-full ${
                    availableStock > 0
                      ? "bg-gold/15 text-gold-deep"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {availableStock > 0
                    ? `${availableStock} in stock`
                    : "Out of stock"}
                </span>
              </div>

              <div className="rounded-2xl border border-gold/30 bg-gradient-card p-5 mb-6">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold-deep mb-3">
                  <Package className="size-3.5" /> Ships from
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-xl text-primary">
                      {selected.name}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {selected.city}, {selected.state} — {selected.pincode}
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                      Delivery radius: {selected.radius_km} km
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setLocationOpen(true)}
                  >
                    Change
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-border rounded-full">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="size-10 grid place-items-center hover:bg-secondary rounded-l-full"
                  >
                    <Minus className="size-4" />
                  </button>

                  <span className="w-10 text-center font-medium">{qty}</span>

                  <button
                    onClick={() =>
                      setQty((q) => Math.min(availableStock || 1, q + 1))
                    }
                    className="size-10 grid place-items-center hover:bg-secondary rounded-r-full"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                <Button
                  className="flex-1 h-12 rounded-full bg-primary hover:bg-primary/90"
                  disabled={availableStock <= 0}
                  onClick={() => {
                    addItem(
                      {
                        id: product.id,
                        slug: product.slug,
                        name: product.name,
                        brand: product.brand,
                        image: product.primary_image,
                        quantity_value: product.quantity_value != null ? String(product.quantity_value) : null,
                        quantity_unit: product.quantity_unit,
                        price: sp,
                        mrp,
                        location_id:
                          product.location_id ||
                          product.service_location_id ||
                          selected.id,
                        location_name: selected.name,
                      },
                      qty,
                    );

                    toast.success(`${product.name} × ${qty} added to bag`, {
                      description: `From ${selected.name}, ${selected.city}`,
                    });
                  }}
                >
                  Add to bag · ₹{(sp * qty).toFixed(0)}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50">
                  <Truck className="size-4 text-gold" /> Fast local delivery
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50">
                  <ShieldCheck className="size-4 text-gold" /> Authentic & safe
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selected && product && (
          <RecommendedSlider
            slug={product.slug}
            locationId={selected.id}
            locationName={selected.name}
          />
        )}
      </main>

      <Footer />

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onLoggedIn={() => {}}
      />

      <LocationDialog open={locationOpen} onOpenChange={setLocationOpen} />
    </div>
  );
};

export default Product;