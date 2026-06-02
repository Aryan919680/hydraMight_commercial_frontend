import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "@/context/LocationContext";
import type { ApiLocation } from "@/lib/api";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSet?: (address: string) => void;
}

// Haversine distance in km
const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const LocationDialog = ({ open, onOpenChange, onSet }: Props) => {
  const { locations, loading, error, selected, setSelected, refresh } = useLocation();
  const [detecting, setDetecting] = useState(false);

  const choose = (loc: ApiLocation) => {
    setSelected(loc);
    onSet?.(`${loc.name}, ${loc.city}`);
    toast.success("Location set", { description: `${loc.name} · ${loc.city}` });
    onOpenChange(false);
  };

  const detect = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported");
      return;
    }
    if (!locations.length) {
      toast.error("No service locations available");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Pick nearest serviceable location
        const ranked = locations
          .map((l) => ({
            loc: l,
            d: distanceKm(latitude, longitude, parseFloat(l.latitude), parseFloat(l.longitude)),
          }))
          .sort((a, b) => a.d - b.d);
        const best = ranked[0];
        const within = best && best.d <= parseFloat(best.loc.radius_km);
        if (within) {
          choose(best.loc);
          toast.success("Nearest serviceable warehouse selected", {
            description: `${best.loc.name} · ~${best.d.toFixed(1)} km`,
          });
        } else {
          toast.message("Outside delivery radius", {
            description: `Closest: ${best.loc.name} (${best.d.toFixed(1)} km away). Pick a warehouse manually.`,
          });
        }
        setDetecting(false);
      },
      (err) => {
        setDetecting(false);
        toast.error("Couldn't access location", { description: err.message });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-lg border-gold/20 rounded-3xl">
        <div className="p-7 pb-5 bg-gradient-card border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-11 rounded-2xl bg-gradient-emerald grid place-items-center">
              <MapPin className="size-5 text-gold" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-primary leading-tight">
                Choose your delivery hub
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Products & stock vary by warehouse.
              </p>
            </div>
          </div>
        </div>

        <div className="p-7 pt-5 bg-background space-y-5 max-h-[70vh] overflow-y-auto">
          <button
            onClick={detect}
            disabled={detecting || loading || !locations.length}
            className="w-full group relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-card p-4 text-left hover:border-gold transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="size-11 rounded-full bg-primary text-primary-foreground grid place-items-center shrink-0">
                {detecting ? <Loader2 className="size-5 animate-spin" /> : <Navigation className="size-5 text-gold" />}
              </div>
              <div className="flex-1">
                <div className="font-medium text-primary">Detect nearest warehouse</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {detecting ? "Locating…" : "Uses GPS to find serviceable hub"}
                </div>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="h-px bg-border flex-1" /> or pick a warehouse <div className="h-px bg-border flex-1" />
          </div>

          {loading && (
            <div className="py-8 grid place-items-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
              <AlertCircle className="size-4 text-destructive mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-destructive">Couldn't load locations</div>
                <div className="text-xs text-muted-foreground mt-0.5">{error}</div>
              </div>
              <Button size="sm" variant="outline" onClick={refresh}>Retry</Button>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-2">
              {locations.map((l) => {
                const isActive = selected?.id === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => choose(l)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-colors border ${
                      isActive
                        ? "border-gold bg-gold/10"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    <div className="size-10 rounded-lg bg-secondary grid place-items-center shrink-0">
                      <MapPin className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-primary">{l.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {l.city}, {l.state} · {l.pincode} · {l.radius_km} km radius
                      </div>
                    </div>
                    {isActive && <Check className="size-4 text-gold-deep shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
