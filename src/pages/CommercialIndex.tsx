import { useState } from "react";
import { CommercialAuthDialog } from "@/components/CommercialAuthDialog";
import { CommercialHero } from "@/components/CommercialHero";
import { CommercialNavbar } from "@/components/CommercialNavbar";
import { CommercialProductGrid } from "@/components/CommercialProductGrid";
import { Footer } from "@/components/Footer";
import { LocationDialog } from "@/components/LocationDialog";
import { useLocation } from "@/context/LocationContext";

const CommercialIndex = () => {
  const { selected } = useLocation();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [locationOpen, setLocationOpen] = useState(false);

  const openLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };

  const openSignup = () => {
    setAuthMode("signup");
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CommercialNavbar
        address={selected ? `${selected.name}, ${selected.city}` : null}
        onOpenLocation={() => setLocationOpen(true)}
        onLogin={openLogin}
        onSignup={openSignup}
      />
      <main className="flex-1">
        <CommercialHero onLogin={openLogin} onSignup={openSignup} />
        <div id="products">
          <CommercialProductGrid onLogin={openLogin} onSignup={openSignup} onPickLocation={() => setLocationOpen(true)} />
        </div>
      </main>
      <Footer />
      <CommercialAuthDialog open={authOpen} mode={authMode} onOpenChange={setAuthOpen} onLoggedIn={() => undefined} />
      <LocationDialog open={locationOpen} onOpenChange={setLocationOpen} />
    </div>
  );
};

export default CommercialIndex;
