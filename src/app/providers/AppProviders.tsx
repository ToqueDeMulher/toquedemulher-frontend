import { AuthProvider } from "@/shared/contexts/auth-context";
import { CartProvider } from "@/shared/contexts/cart-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
