import { ThemeProvider } from "@/app/providers/theme/theme-context";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { CartProvider } from "@/features/cart/context/cart-context";
import { CatalogProvider } from "@/features/catalog/context/catalog-context";
import { GamificationProvider } from "@/features/gamification/context/gamification-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GamificationProvider>
          <CatalogProvider><CartProvider>{children}</CartProvider></CatalogProvider>
        </GamificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
