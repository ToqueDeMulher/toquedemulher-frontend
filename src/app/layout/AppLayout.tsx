import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/shared/layout/Header";
import { Footer } from "@/shared/layout/Footer";
import { PageNavigation } from "@/shared/layout/PageNavigation";
import { PageSkeleton } from "@/shared/layout/PageSkeleton";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { Toaster } from "@/shared/ui/sonner";

export function AppLayout() {
  const location = useLocation();
  const [isRouteLoading, setIsRouteLoading] = useState(true);

  useEffect(() => {
    setIsRouteLoading(true);
    const timeoutId = window.setTimeout(() => {
      setIsRouteLoading(false);
    }, 240);

    return () => window.clearTimeout(timeoutId);
  }, [location.key]);

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow-lg"
      >
        Pular para o conteúdo principal
      </a>

      <Header />

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <PageNavigation />
        {isRouteLoading ? <PageSkeleton /> : <Outlet />}
      </main>

      <CartDrawer />
      <Footer />

      <Toaster position="top-right" richColors />
    </div>
  );
}
