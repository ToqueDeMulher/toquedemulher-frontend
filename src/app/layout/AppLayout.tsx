import { Outlet } from "react-router-dom";
import { Header } from "@/shared/layout/Header";
import { Footer } from "@/shared/layout/Footer";
import { Toaster } from "@/shared/ui/sonner";

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      <Toaster position="top-right" richColors />
    </div>
  );
}
