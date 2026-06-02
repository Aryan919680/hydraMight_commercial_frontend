import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchLocations, type ApiLocation } from "@/lib/api";

type Ctx = {
  locations: ApiLocation[];
  loading: boolean;
  error: string | null;
  selected: ApiLocation | null;
  setSelected: (loc: ApiLocation) => void;
  refresh: () => void;
};

const LocationContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "HydraMight:selected-location";

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [locations, setLocations] = useState<ApiLocation[]>([]);
  const [selected, setSelectedState] = useState<ApiLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchLocations()
      .then((data) => {
        setLocations(data);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const found = data.find((l) => l.id === stored);
          if (found) setSelectedState(found);
        }
      })
      .catch((e) => setError(e.message ?? "Failed to load locations"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setSelected = (loc: ApiLocation) => {
    setSelectedState(loc);
    localStorage.setItem(STORAGE_KEY, loc.id);
  };

  return (
    <LocationContext.Provider
      value={{ locations, loading, error, selected, setSelected, refresh: load }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
};
