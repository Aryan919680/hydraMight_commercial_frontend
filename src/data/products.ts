import multipurpose from "@/assets/product-multipurpose.jpg";
import tile from "@/assets/product-tile.jpg";
import dishwash from "@/assets/product-dishwash.jpg";
import glass from "@/assets/product-glass.jpg";
import laundry from "@/assets/product-laundry.jpg";
import bathroom from "@/assets/product-bathroom.jpg";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  size: string;
  span?: "tall" | "wide" | "large";
};

export const products: Product[] = [
  {
    id: "p1",
    name: "Multipurpose Cleaner",
    tagline: "One bottle. Every surface.",
    price: 349,
    oldPrice: 449,
    image: multipurpose,
    badge: "Bestseller",
    size: "750 ml",
    span: "large",
  },
  {
    id: "p2",
    name: "Tile & Floor Cleaner",
    tagline: "Streak-free shine for every tile.",
    price: 299,
    image: tile,
    size: "1 L",
    span: "tall",
  },
  {
    id: "p3",
    name: "Dishwash Liquid",
    tagline: "Cuts grease. Loves hands.",
    price: 199,
    oldPrice: 249,
    image: dishwash,
    size: "500 ml",
  },
  {
    id: "p4",
    name: "Glass & Mirror",
    tagline: "Crystal-clear, no residue.",
    price: 229,
    image: glass,
    badge: "New",
    size: "500 ml",
    span: "wide",
  },
  {
    id: "p5",
    name: "Laundry Detergent",
    tagline: "Plant-based deep clean.",
    price: 499,
    image: laundry,
    size: "1.2 L",
  },
  {
    id: "p6",
    name: "Bathroom Cleaner",
    tagline: "Limescale, defeated.",
    price: 279,
    image: bathroom,
    size: "750 ml",
  },
];
