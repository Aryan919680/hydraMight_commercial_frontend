import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PromoCards } from "@/components/PromoCards";
import { ProductGrid } from "@/components/ProductGrid";
import { CategoryGrid } from "@/components/CategoryGrid";
import { CategorySections } from "@/components/CategorySections";
import { LoginDialog } from "@/components/LoginDialog";
import { LocationDialog } from "@/components/LocationDialog";
import { Footer } from "@/components/Footer";
import { useLocation } from "@/context/LocationContext";

const Index = () => {
  const { selected } = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem("HydraMight:login-seen");
    if (!seen) {
      const t = setTimeout(() => {
        setLoginOpen(true);
        sessionStorage.setItem("HydraMight:login-seen", "1");
      }, 600);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        address={selected ? `${selected.name}, ${selected.city}` : null}
        onOpenLocation={() => setLocationOpen(true)}
        onOpenLogin={() => setLoginOpen(true)}
      />
      <main className="flex-1">
        <Hero />
        <PromoCards />
         <CategoryGrid />
        <CategorySections onPickLocation={() => setLocationOpen(true)} />
        <ProductGrid onPickLocation={() => setLocationOpen(true)} />
      </main>
      <Footer />

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onLoggedIn={(p) => {
          setPhone(p);
          if (!selected) setTimeout(() => setLocationOpen(true), 400);
        }}
      />
      <LocationDialog open={locationOpen} onOpenChange={setLocationOpen} />

      {phone && (
        <div className="sr-only" aria-live="polite">Signed in as {phone}</div>
      )}
    </div>
  );
};

export default Index;
