import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { ApiProduct } from "@/lib/api";

interface Props {
  product: ApiProduct;
}

export const ProductGallery = ({ product }: Props) => {
  const images = useMemo(() => {
    const list = (product.images ?? [])
      .slice()
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((i) => i.image_url);
    if (list.length === 0 && product.primary_image) list.push(product.primary_image);
    return list;
  }, [product]);

  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const current = images[active];
  const next = () => setActive((i) => (i + 1) % images.length);
  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);

  if (!current) {
    return <div className="rounded-3xl bg-gradient-card aspect-square" />;
  }

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      {/* thumbnails */}
      {images.length > 1 && (
        <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-visible scrollbar-none">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative shrink-0 size-16 md:size-20 rounded-2xl overflow-hidden border-2 transition-all ${
                i === active
                  ? "border-primary shadow-soft"
                  : "border-border hover:border-gold/50"
              }`}
            >
              <img src={src} alt="" className="size-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* main image */}
      <div className="relative flex-1 rounded-3xl overflow-hidden bg-gradient-card border border-border aspect-square group">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={current}
            alt={product.name}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setZoom(true)}
            className="absolute inset-0 size-full object-contain p-6 md:p-10 cursor-zoom-in"
          />
        </AnimatePresence>

        {/* featured badge */}
        {product.is_featured && (
          <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}

        {/* zoom hint */}
        <button
          onClick={() => setZoom(true)}
          aria-label="Zoom"
          className="absolute top-4 right-4 size-9 rounded-full bg-background/90 backdrop-blur grid place-items-center hover:bg-gold hover:text-primary transition-colors shadow-soft"
        >
          <ZoomIn className="size-4" />
        </button>

        {/* arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-background/90 backdrop-blur grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity shadow-soft hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-background/90 backdrop-blur grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity shadow-soft hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* dot indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-primary" : "w-1.5 bg-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* lightbox */}
      {zoom && (
        <div
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-50 bg-foreground/90 backdrop-blur-sm grid place-items-center p-6 cursor-zoom-out"
        >
          <img
            src={current}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl"
          />
        </div>
      )}
    </div>
  );
};
