import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Tag,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CommercialNavbar as Navbar } from "@/components/CommercialNavbar";
import { Footer } from "@/components/Footer";
import { CommercialAuthDialog as LoginDialog } from "@/components/CommercialAuthDialog";
import { LocationDialog } from "@/components/LocationDialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import {
  getCustomerToken,
  getStoredCustomerUser,
  placeSalesOrder,
} from "@/lib/api";

const Bag = () => {
  const navigate = useNavigate();

  const {
    items,
    subtotal,
    savings,
    setQty,
    removeItem,
    clear,
    count,
  } = useCart();

  const { selected } = useLocation();

  const [loginOpen, setLoginOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const deliveryFee = subtotal > 0 && subtotal < 499 ? 29 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    try {
      if (!selected) {
        toast.error("Please select delivery location first");
        setLocationOpen(true);
        return;
      }

      if (items.length === 0) {
        toast.error("Your bag is empty");
        return;
      }

      const token = getCustomerToken();

      if (!token) {
        toast.error("Please sign in to place order");
        setLoginOpen(true);
        return;
      }

      const customer = getStoredCustomerUser();

      setPlacingOrder(true);

      const response = await placeSalesOrder({
        service_location_id: selected.id,
        ecom_channel: "commercial",
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.qty,
        })),
        delivery_address: {
          full_name: customer?.full_name || "",
          mobile: customer?.mobile || "",
          address_line1: selected.name,
          city: selected.city,
          state: selected.state,
          pincode: selected.pincode,
        },
        remarks: "Commercial order from website",
      });

      clear();

      toast.success("Order placed successfully", {
        description: `Order ${response.order.order_number} created.`,
      });

      navigate("/orders");
    } catch (error) {
      toast.error("Failed to place order", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

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
          <ArrowLeft className="size-4" /> Continue shopping
        </Link>

        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-gold-deep mb-2">
              Your bag
            </div>

            <h1 className="font-display text-4xl md:text-5xl text-primary">
              {count > 0
                ? `${count} item${count > 1 ? "s" : ""} ready`
                : "Your bag is empty"}
            </h1>
          </div>

          {items.length > 0 && (
            <Button
              variant="ghost"
              onClick={clear}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" /> Clear bag
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gold/40 bg-gradient-card p-12 text-center">
            <ShoppingBag className="size-10 text-gold mx-auto mb-3" />

            <h3 className="font-display text-2xl text-primary mb-2">
              Nothing here yet
            </h3>

            <p className="text-sm text-muted-foreground mb-5">
              Add a few HydraMight essentials to get started.
            </p>

            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/">Browse the collection</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            <ul className="flex flex-col gap-3">
              {items.map((it, i) => (
                <motion.li
                  key={it.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="flex gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors"
                >
                  <Link
                    to={`/product/${it.id}`}
                    className="size-24 sm:size-28 rounded-xl bg-secondary/40 overflow-hidden shrink-0 grid place-items-center"
                  >
                    {it.image ? (
                      <img
                        src={it.image}
                        alt={it.name}
                        className="size-full object-contain p-2"
                      />
                    ) : (
                      <div className="size-full bg-gradient-emerald" />
                    )}
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col">
                    {it.brand && (
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {it.brand}
                      </div>
                    )}

                    <Link
                      to={`/product/${it.id}`}
                      className="font-medium text-sm sm:text-base text-foreground hover:text-primary line-clamp-2"
                    >
                      {it.name}
                    </Link>

                    {it.quantity_value && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {it.quantity_value} {it.quantity_unit}
                      </div>
                    )}

                    {it.location_name && (
                      <div className="text-[11px] text-muted-foreground mt-1">
                        From {it.location_name}
                      </div>
                    )}

                    <div className="mt-auto pt-3 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center border border-border rounded-full">
                        <button
                          onClick={() => setQty(it.id, it.qty - 1)}
                          className="size-9 grid place-items-center hover:bg-secondary rounded-l-full"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3.5" />
                        </button>

                        <span className="w-9 text-center text-sm font-medium">
                          {it.qty}
                        </span>

                        <button
                          onClick={() => setQty(it.id, it.qty + 1)}
                          className="size-9 grid place-items-center hover:bg-secondary rounded-r-full"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-display text-lg text-primary">
                            ₹{(it.price * it.qty).toFixed(0)}
                          </div>

                          {it.mrp > it.price && (
                            <div className="text-[11px] text-muted-foreground line-through">
                              ₹{(it.mrp * it.qty).toFixed(0)}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            removeItem(it.id);
                            toast.success(`${it.name} removed`);
                          }}
                          className="size-9 grid place-items-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          aria-label="Remove item"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>

            <aside className="lg:sticky lg:top-24 rounded-2xl border border-gold/30 bg-gradient-card p-6 flex flex-col gap-4">
              <div className="text-xs uppercase tracking-[0.25em] text-gold-deep">
                Order summary
              </div>

              {selected ? (
                <div className="rounded-xl bg-background/60 p-3 text-xs">
                  <div className="font-medium text-primary">Delivering to</div>
                  <div className="text-muted-foreground">
                    {selected.name}, {selected.city} - {selected.pincode}
                  </div>
                  <button
                    className="mt-1 text-gold-deep hover:underline"
                    onClick={() => setLocationOpen(true)}
                  >
                    Change location
                  </button>
                </div>
              ) : (
                <div className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                  Please select location before placing order.
                </div>
              )}

              <div className="flex flex-col gap-2 text-sm">
                <Row
                  label={`Subtotal (${count} item${count > 1 ? "s" : ""})`}
                  value={`₹${subtotal.toFixed(0)}`}
                />

                {savings > 0 && (
                  <Row
                    label={
                      <span className="flex items-center gap-1.5">
                        <Tag className="size-3.5 text-gold-deep" /> You save
                      </span>
                    }
                    value={`− ₹${savings.toFixed(0)}`}
                    accent
                  />
                )}

                <Row
                  label="Delivery"
                  value={deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  accent={deliveryFee === 0}
                />
              </div>

              <div className="h-px bg-border" />

              <div className="flex items-baseline justify-between">
                <span className="font-medium">Total</span>
                <span className="font-display text-2xl text-primary">
                  ₹{total.toFixed(0)}
                </span>
              </div>

              {deliveryFee > 0 && (
                <div className="text-[11px] text-muted-foreground -mt-2">
                  Add ₹{(499 - subtotal).toFixed(0)} more for free delivery.
                </div>
              )}

              <Button
                className="h-12 rounded-full bg-primary hover:bg-primary/90"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
              >
                {placingOrder && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {placingOrder ? "Placing order..." : "Place order"}
              </Button>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-background/60">
                  <Truck className="size-3.5 text-gold" /> Fast delivery
                </div>

                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-background/60">
                  <ShieldCheck className="size-3.5 text-gold" /> Secure checkout
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onLoggedIn={() => {
          window.dispatchEvent(new Event("customer-auth-changed"));
        }}
      />

      <LocationDialog open={locationOpen} onOpenChange={setLocationOpen} />
    </div>
  );
};

const Row = ({
  label,
  value,
  accent,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  accent?: boolean;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className={accent ? "text-gold-deep font-medium" : "text-foreground"}>
      {value}
    </span>
  </div>
);

export default Bag;