import { Building2, MapPin, ShoppingBag, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { SearchBox } from "@/components/SearchBox";
import { CustomerUser, getStoredCustomerUser } from "@/lib/api";
import logo from "@/assets/logo-hydramight.png";

interface Props {
  address?: string | null;
  onOpenLocation?: () => void;
  onLogin?: () => void;
  onOpenLogin?: () => void;
  onSignup?: () => void;
}

export const CommercialNavbar = ({
  address,
  onOpenLocation,
  onLogin,
  onOpenLogin,
  onSignup,
}: Props) => {
  const { count } = useCart();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerUser | null>(null);

  useEffect(() => {
    const loadCustomer = () => setCustomer(getStoredCustomerUser());
    loadCustomer();
    window.addEventListener("customer-auth-changed", loadCustomer);
    window.addEventListener("storage", loadCustomer);
    return () => {
      window.removeEventListener("customer-auth-changed", loadCustomer);
      window.removeEventListener("storage", loadCustomer);
    };
  }, []);

  const displayName =
    customer?.full_name?.trim() || customer?.email || customer?.mobile || "Account";

  const handleAccountClick = () => {
    if (customer) navigate("/account");
    else (onOpenLogin || onLogin)?.();
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border/60">
      <div className="container flex items-center gap-4 h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="HydraMight commercial home">
          <img src={logo} alt="HydraMight logo" className="h-24 w-auto object-contain drop-shadow-sm" />
        </Link>

        <button
          onClick={onOpenLocation}
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full hover:bg-secondary transition-colors group max-w-xs"
        >
          <MapPin className="size-4 text-gold shrink-0" />
          <div className="text-left min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Business delivery hub</div>
            <div className="text-sm font-medium truncate">{address ?? "Set delivery location"}</div>
          </div>
        </button>

        <div className="hidden lg:flex flex-1 max-w-xl">
          <SearchBox onPickLocation={onOpenLocation} />
        </div>

        <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/70">
          <Building2 className="size-4 text-gold" />
          <span className="text-sm font-medium">Commercial Portal</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenLocation}>
            <MapPin className="size-5" />
          </Button>

          {!customer && onSignup && (
            <Button variant="outline" onClick={onSignup} className="hidden sm:inline-flex rounded-full">
              Request Access
            </Button>
          )}

          <Button variant="ghost" onClick={handleAccountClick} className="gap-2">
            <User className="size-4" />
            <span className="hidden sm:inline max-w-[130px] truncate">{customer ? displayName : "Login"}</span>
          </Button>

          <Button asChild variant="default" size="icon" className="bg-primary hover:bg-primary/90 relative">
            <Link to="/bag" aria-label={`Bag with ${count} item${count === 1 ? "" : "s"}`}>
              <ShoppingBag className="size-4" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 size-5 grid place-items-center text-[10px] font-semibold rounded-full bg-gold text-primary">
                  {count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      <div className="lg:hidden container pb-3">
        <SearchBox onPickLocation={onOpenLocation} />
      </div>
    </header>
  );
};
