import { Route, Routes } from "react-router-dom";
import { routes } from "@/shared/lib/routes";
import { AppLayout } from "@/app/layout/AppLayout";
import { RequireAuth } from "@/app/components/RequireAuth";
import { RequireAdmin } from "@/app/components/RequireAdmin";
import { HomePage } from "@/features/catalog/pages/HomePage";
import { CategoryPage } from "@/features/catalog/pages/CategoryPage";
import { ProductPage } from "@/features/catalog/pages/ProductPage";
import { CartPage } from "@/features/cart/pages/CartPage";
import { CheckoutPage } from "@/features/cart/pages/CheckoutPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProfilePage } from "@/features/auth/pages/ProfilePage";
import { HelpPage } from "@/features/institutional/pages/HelpPage";
import { AboutPage } from "@/features/institutional/pages/AboutPage";
import { InstitutionalPage } from "@/features/institutional/pages/InstitutionalPage";
import { ProductCreatePage } from "@/features/admin/pages/ProductCreatePage";
import { NotFoundPage } from "@/features/system/pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={routes.home} element={<HomePage />} />
        <Route path={routes.product()} element={<ProductPage />} />
        <Route path={routes.category()} element={<CategoryPage />} />
        <Route path={routes.cart} element={<CartPage />} />
        <Route
          path={routes.checkout}
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route path={routes.login} element={<LoginPage />} />
        <Route
          path={routes.profile}
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route path={routes.help} element={<HelpPage />} />
        <Route path={routes.about} element={<AboutPage />} />
        <Route path={routes.institutional()} element={<InstitutionalPage />} />
        <Route
          path={routes.productCreate}
          element={
            <RequireAdmin>
              <ProductCreatePage />
            </RequireAdmin>
          }
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
