import { useEffect, useRef, useState } from "react";
import { Search, Loader2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { searchProducts, type ApiProduct } from "@/lib/api";
import { useLocation } from "@/context/LocationContext";

interface SearchBoxProps {
  onPickLocation?: () => void;
  className?: string;
}

export const SearchBox = ({ onPickLocation, className }: SearchBoxProps) => {
  const { selected } = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      setLoading(false);
      return;
    }
    if (!selected) return;
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const { products } = await searchProducts(term, selected.id, "commercial", { limit: 8 });
        if (!ctrl.signal.aborted) {
          setResults(products);
          setOpen(true);
        }
      } catch {
        if (!ctrl.signal.aborted) setResults([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [q, selected]);

  const handleFocus = () => {
    if (!selected && onPickLocation) onPickLocation();
    if (results.length > 0) setOpen(true);
  };

  const formatPrice = (v: string | number | null | undefined) => {
    if (v === null || v === undefined) return "";
    const n = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(n) ? "" : `₹${n.toFixed(0)}`;
  };

  return (
    <div ref={wrapRef} className={`relative w-full ${className ?? ""}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={handleFocus}
        onKeyDown={(e) => {
          if (e.key === "Enter" && q.trim()) {
            setOpen(false);
            navigate(`/search?q=${encodeURIComponent(q.trim())}`);
          }
        }}
        placeholder={selected ? "Search eco cleaners, kits, refills…" : "Set location to search…"}
        className="w-full bg-secondary/60 border border-transparent focus:border-primary/30 focus:bg-background rounded-full pl-11 pr-10 h-11 text-sm outline-none transition-all"
      />
      {q && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQ("");
            setResults([]);
            setOpen(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:bg-secondary"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
        </button>
      )}

      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-50 max-h-[28rem] overflow-y-auto">
          {loading && results.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No products found for "{q}"
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/product/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-3 hover:bg-secondary/60 transition-colors"
                  >
                    <div className="size-12 rounded-lg bg-secondary shrink-0 overflow-hidden">
                      {p.primary_image && (
                        <img
                          src={p.primary_image}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-1">{p.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {p.category_name}
                        {p.quantity_value ? ` · ${p.quantity_value}${p.quantity_unit ?? ""}` : ""}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold">{formatPrice(p.selling_price)}</div>
                      {p.mrp && p.selling_price && Number(p.mrp) > Number(p.selling_price) && (
                        <div className="text-[11px] text-muted-foreground line-through">
                          {formatPrice(p.mrp)}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
