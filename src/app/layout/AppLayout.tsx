import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "@/app/layout/components/Footer";
import { Header } from "@/app/layout/components/Header";
import { PageNavigation } from "@/app/layout/components/PageNavigation";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { Toaster } from "@/shared/ui/sonner";
export function AppLayout() {
 const location = useLocation();
 return <div className="min-h-screen flex flex-col">
  <a href="#main-content" className="store-skip">Pular para o conteúdo principal</a>
  <Header/>
  <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
   <PageNavigation/><div key={location.pathname} className="route-content"><Outlet/></div>
  </main>
  <CartDrawer/><Footer/><Toaster position="top-right" richColors/>
 </div>;
}