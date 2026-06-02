import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { fetchCategories, type ApiCategory } from "@/lib/api";
import { Button } from "@/components/ui/button";

const useVisibleCount = () => {
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setVisibleCount(1);
      } else if (width < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(4);
      }
    };

    update();

    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  return visibleCount;
};

export const CategoryGrid = () => {
  const [cats, setCats] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const visibleCount = useVisibleCount();

  useEffect(() => {
    fetchCategories()
      .then((d) =>
        setCats(
          [...d]
            .filter((c) => c.slug !== "aa")
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        )
      )
      .catch((e) => setError(e.message ?? "Failed to load categories"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (cats.length === 0) return;

    setActiveIndex((prev) => {
      if (prev >= cats.length) return 0;
      return prev;
    });
  }, [cats.length]);

  const visibleCategories = useMemo(() => {
    if (cats.length === 0) return [];

    const count = Math.min(visibleCount, cats.length);

    return Array.from({ length: count }, (_, i) => {
      const index = (activeIndex + i) % cats.length;
      return cats[index];
    });
  }, [cats, activeIndex, visibleCount]);

  useEffect(() => {
    if (paused || cats.length <= visibleCount) return;

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cats.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [paused, cats.length, visibleCount]);

  const goNext = () => {
    if (cats.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % cats.length);
  };

  const goPrev = () => {
    if (cats.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + cats.length) % cats.length);
  };

  return (
    <section className="relative overflow-hidden py-12 md:py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" />
      <div className="absolute -top-24 -right-24 size-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute -bottom-28 -left-24 size-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative">
        <div className="mb-7 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-gold-deep mb-2">
              Shop by category
            </div>

            <h2 className="font-display text-3xl md:text-5xl text-primary leading-tight">
              Browse our categories
            </h2>

            <p className="mt-3 max-w-2xl text-sm md:text-base text-muted-foreground">
              Explore cleaning essentials for home, hygiene, laundry, kitchen,
              glass, tools and commercial spaces.
            </p>
          </div>

          {!loading && !error && cats.length > visibleCount && (
            <div className="hidden md:flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={goPrev}
                className="rounded-full bg-background/80 backdrop-blur"
              >
                <ArrowLeft className="size-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={goNext}
                className="rounded-full bg-background/80 backdrop-blur"
              >
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {loading && (
          <div className="py-14 grid place-items-center text-muted-foreground">
            <Loader2 className="size-7 animate-spin" />
          </div>
        )}

        {error && (
          <div className="py-8 text-center text-destructive">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div
              className="relative"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeIndex}-${visibleCount}`}
                  initial={{ opacity: 0, x: 70 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -70 }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
                >
                  {visibleCategories.map((c, i) => (
                    <CategoryCard
                      key={`${activeIndex}-${c.id}`}
                      category={c}
                      index={i}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              {cats.length > visibleCount && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={goPrev}
                    className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/85 backdrop-blur"
                  >
                    <ArrowLeft className="size-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={goNext}
                    className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/85 backdrop-blur"
                  >
                    <ArrowRight className="size-4" />
                  </Button>
                </>
              )}
            </div>

            {cats.length > visibleCount && (
              <div className="mt-7 flex items-center justify-center gap-2">
                {cats.map((c, index) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === activeIndex
                        ? "w-8 bg-primary"
                        : "w-2 bg-primary/25 hover:bg-primary/50"
                    }`}
                    aria-label={`Go to ${c.name}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

const CategoryCard = ({
  category,
  index,
}: {
  category: ApiCategory;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        to={`/search?category_slug=${encodeURIComponent(
          category.slug
        )}&q=${encodeURIComponent(category.name)}`}
        className="group block"
      >
        <div className="relative h-[360px] overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-primary/30">
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              loading="lazy"
              className="absolute inset-0 size-full object-fit object-center transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-card">
              <span className="font-display text-6xl text-primary/25">
                {category.name.charAt(0)}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/25 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6">
            {/* <div className="mb-4 inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm transition-transform duration-500 group-hover:translate-x-1">
              <ArrowRight className="size-4" />
            </div> */}

            <h3 className="font-display text-3xl leading-tight text-white drop-shadow-sm">
              {category.name}
            </h3>

            {category.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/80">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};