import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Phone, Mail, LogOut, Loader2 } from "lucide-react";
import { CommercialNavbar as Navbar } from "@/components/CommercialNavbar";
import { Footer } from "@/components/Footer";
import { CommercialAuthDialog as LoginDialog } from "@/components/CommercialAuthDialog";
import { LocationDialog } from "@/components/LocationDialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/context/LocationContext";
import {
  clearCustomerSession,
  CustomerUser,
  getStoredCustomerUser,
  updateCustomerProfile,
} from "@/lib/api";
import { toast } from "sonner";

const Account = () => {
  const navigate = useNavigate();
  const { selected } = useLocation();

  const [loginOpen, setLoginOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getStoredCustomerUser();

    if (!user) {
      navigate("/");
      return;
    }

    setCustomer(user);
    setFullName(user.full_name || "");
    setEmail(user.email || "");
  }, [navigate]);

  const saveProfile = async () => {
    try {
      setSaving(true);

      const updated = await updateCustomerProfile({
        full_name: fullName.trim(),
        email: email.trim(),
        customer_type: "commercial",
      });

      setCustomer(updated);

      window.dispatchEvent(new Event("customer-auth-changed"));

      toast.success("Profile updated", {
        description: "Your account information has been saved.",
      });
    } catch (error) {
      toast.error("Failed to update profile", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    clearCustomerSession();
    window.dispatchEvent(new Event("customer-auth-changed"));
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        address={selected ? `${selected.name}, ${selected.city}` : null}
        onOpenLocation={() => setLocationOpen(true)}
        onOpenLogin={() => setLoginOpen(true)}
      />

      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-4xl text-primary mb-2">
              My Account
            </h1>
            <p className="text-muted-foreground">
              Manage your profile information for faster checkout.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-gradient-card p-6 md:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="size-14 rounded-full bg-primary text-primary-foreground grid place-items-center">
                <User className="size-7" />
              </div>

              <div>
                <h2 className="font-display text-2xl text-primary">
                  {customer.full_name || "Complete your profile"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  +{customer.mobile}
                </p>
              </div>
            </div>

            <div className="grid gap-5">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Full name
                </label>
                <div className="mt-2 flex items-center rounded-xl border border-input bg-secondary/40 focus-within:border-primary/40 focus-within:bg-background transition-colors">
                  <User className="ml-4 size-4 text-muted-foreground" />
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="flex-1 bg-transparent px-4 py-3 outline-none text-base"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Mobile number
                </label>
                <div className="mt-2 flex items-center rounded-xl border border-input bg-muted px-4 py-3">
                  <Phone className="mr-3 size-4 text-muted-foreground" />
                  <span className="text-base">+{customer.mobile}</span>
                  <span className="ml-auto text-xs text-gold-deep">
                    Verified
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Email
                </label>
                <div className="mt-2 flex items-center rounded-xl border border-input bg-secondary/40 focus-within:border-primary/40 focus-within:bg-background transition-colors">
                  <Mail className="ml-4 size-4 text-muted-foreground" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    type="email"
                    className="flex-1 bg-transparent px-4 py-3 outline-none text-base"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <Button asChild variant="outline">
  <Link to="/orders">My Orders</Link>
</Button>
                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="h-12 rounded-xl bg-primary hover:bg-primary/90"
                >
                  {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Save Profile
                </Button>

                <Button
                  variant="outline"
                  onClick={logout}
                  className="h-12 rounded-xl gap-2"
                >
                  
                  <LogOut className="size-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
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

export default Account;