import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Building2, LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  CommercialSignupPayload,
  loginCommercialCustomer,
  saveCustomerSession,
  submitCommercialSignupRequest,
} from "@/lib/api";

interface Props {
  open: boolean;
  mode?: "login" | "signup";
  onOpenChange: (open: boolean) => void;
  onLoggedIn: () => void;
}

const initialSignup: CommercialSignupPayload = {
  business_name: "",
  contact_person: "",
  gst_number: "",
  email: "",
  phone: "",
  address_line1: "",
  city: "",
  state: "",
  pincode: "",
};

export const CommercialAuthDialog = ({
  open,
  mode = "login",
  onOpenChange,
  onLoggedIn,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(mode);
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState<CommercialSignupPayload>(initialSignup);

  useEffect(() => {
    if (open) setActiveTab(mode);
  }, [open, mode]);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setLoginForm({ email: "", password: "" });
      setSignupForm(initialSignup);
    }
  }, [open]);

  const updateSignup = (field: keyof CommercialSignupPayload, value: string) => {
    setSignupForm((current) => ({ ...current, [field]: value }));
  };

  const handleSignup = async () => {
    if (!signupForm.business_name.trim()) return toast.error("Enter business name");
    if (!signupForm.contact_person.trim()) return toast.error("Enter contact person name");
    if (!signupForm.gst_number.trim()) return toast.error("Enter GST number");
    if (!signupForm.email.trim()) return toast.error("Enter email address");
    if (!signupForm.phone.trim()) return toast.error("Enter phone number");
    if (!signupForm.address_line1.trim()) return toast.error("Enter business address");

    try {
      setLoading(true);
      await submitCommercialSignupRequest(signupForm);
      toast.success("Signup request submitted", {
        description: "Admin will review and approve your commercial account.",
      });
      setActiveTab("login");
    } catch (error) {
      toast.error("Could not submit request", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.email.trim()) return toast.error("Enter your email");
    if (!loginForm.password.trim()) return toast.error("Enter your password");

    try {
      setLoading(true);
      const response = await loginCommercialCustomer(loginForm);
      saveCustomerSession(response);
      window.dispatchEvent(new Event("customer-auth-changed"));
      onLoggedIn();
      onOpenChange(false);
      toast.success("Welcome back", {
        description: "Your commercial account is ready.",
      });
    } catch (error) {
      toast.error("Login failed", {
        description:
          error instanceof Error
            ? error.message
            : "Please check your email and password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-2xl border-gold/20 rounded-3xl">
        <div className="relative bg-gradient-hero text-primary-foreground p-7 pb-9">
          <div className="absolute -top-16 -right-16 size-48 rounded-full border border-gold/20" />
          <div className="absolute -top-10 -right-10 size-32 rounded-full border border-gold/10" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-[11px] uppercase tracking-[0.22em] mb-4">
              <Building2 className="size-3 text-gold" /> Commercial access
            </div>
            <h2 className="font-display text-3xl mb-1">HydraMight for Business</h2>
            <p className="text-sm text-primary-foreground/70 max-w-xl">
              Request access for your business or sign in after admin approval.
            </p>
          </div>
        </div>

        <div className="p-6 md:p-7 bg-background">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
            <TabsList className="grid grid-cols-2 w-full rounded-xl h-11">
              <TabsTrigger value="login" className="rounded-lg">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg">Request Signup</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Email address
                </label>
                <Input
                  type="email"
                  placeholder="purchase@business.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="mt-2 h-12 rounded-xl"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="ContactFirstName@123"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="mt-2 h-12 rounded-xl"
                />
              </div>

              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 gap-2"
              >
                {loading ? "Signing in..." : "Login to commercial account"}
                <ArrowRight className="size-4" />
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <LockKeyhole className="size-3.5 text-gold" />
                Login is enabled only after admin approval.
              </div>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Business name</label>
                  <Input className="mt-2 h-11 rounded-xl" value={signupForm.business_name} onChange={(e) => updateSignup("business_name", e.target.value)} placeholder="ABC Enterprises" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Contact person</label>
                  <Input className="mt-2 h-11 rounded-xl" value={signupForm.contact_person} onChange={(e) => updateSignup("contact_person", e.target.value)} placeholder="Raj Sharma" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">GST number</label>
                  <Input className="mt-2 h-11 rounded-xl uppercase" value={signupForm.gst_number} onChange={(e) => updateSignup("gst_number", e.target.value.toUpperCase())} placeholder="07ABCDE1234F1Z5" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
                  <Input type="email" className="mt-2 h-11 rounded-xl" value={signupForm.email} onChange={(e) => updateSignup("email", e.target.value)} placeholder="orders@business.com" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Phone</label>
                  <Input className="mt-2 h-11 rounded-xl" value={signupForm.phone} onChange={(e) => updateSignup("phone", e.target.value.replace(/[^0-9+ -]/g, ""))} placeholder="98765 43210" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Pincode</label>
                  <Input className="mt-2 h-11 rounded-xl" value={signupForm.pincode} onChange={(e) => updateSignup("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="110001" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">City</label>
                  <Input className="mt-2 h-11 rounded-xl" value={signupForm.city} onChange={(e) => updateSignup("city", e.target.value)} placeholder="New Delhi" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">State</label>
                  <Input className="mt-2 h-11 rounded-xl" value={signupForm.state} onChange={(e) => updateSignup("state", e.target.value)} placeholder="Delhi" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">Business address</label>
                  <Textarea className="mt-2 rounded-xl min-h-[88px]" value={signupForm.address_line1} onChange={(e) => updateSignup("address_line1", e.target.value)} placeholder="Shop/office, area, landmark" />
                </div>
              </div>

              <Button
                onClick={handleSignup}
                disabled={loading}
                className="w-full mt-5 h-12 rounded-xl bg-primary hover:bg-primary/90 gap-2"
              >
                {loading ? "Submitting..." : "Submit signup request"}
                <ArrowRight className="size-4" />
              </Button>

              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-gold" />
                After approval, default password can be ContactFirstName@123 as per backend rule.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
