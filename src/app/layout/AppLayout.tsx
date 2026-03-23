import { Outlet } from "react-router-dom";
import { Header } from "@/shared/layout/Header";
import { Footer } from "@/shared/layout/Footer";
import { Toaster } from "@/shared/ui/sonner";

export function AppLayout() {
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
        <Outlet />
      </main>

      <Footer />

      <Toaster position="top-right" richColors />
    </div>
  );
}
