import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocationProvider } from "@/context/LocationContext";
import { CartProvider } from "@/context/CartContext";
import CommercialIndex from "./pages/CommercialIndex.tsx";
import Product from "./pages/Product.tsx";
import Bag from "./pages/Bag.tsx";
import Search from "./pages/Search.tsx";
import NotFound from "./pages/NotFound.tsx";
import ScrollToTop from "./components/ScrollToTop";
import Account from "./pages/Account.tsx";
import Orders from "@/pages/Orders";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LocationProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<CommercialIndex />} />
              <Route path="/product/:slug" element={<Product />} />
              <Route path="/bag" element={<Bag />} />
              <Route path="/account" element={<Account />} />
              <Route path="/search" element={<Search />} />
              <Route path="/orders" element={<Orders />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </LocationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
