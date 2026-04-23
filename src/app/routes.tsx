import { Navigate, Route, Routes } from "react-router-dom";
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
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { AdminLayout } from "@/features/admin/layout/AdminLayout";
import { HelpPage } from "@/features/institutional/pages/HelpPage";
import { AboutPage } from "@/features/institutional/pages/AboutPage";
import { InstitutionalPage } from "@/features/institutional/pages/InstitutionalPage";
import { ProductCreatePage } from "@/features/admin/pages/ProductCreatePage";
import { NotFoundPage } from "@/features/system/pages/NotFoundPage";
import { SearchResultsPage } from "@/features/catalog/pages/SearchResultsPage";
import { AddressPage } from "@/features/auth/pages/AddressPage";

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
          element={<Navigate to={routes.checkoutStep("address")} replace />}
        />
        <Route path={routes.checkoutStep()} element={<CheckoutPage />} />
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
        <Route path={routes.search()} element={<SearchResultsPage />} />
        <Route
          path={routes.addressCreate}
          element={
            <RequireAuth>
              <AddressPage />
            </RequireAuth>
          }
        />
      </Route>
      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route path={routes.adminDashboard} element={<AdminDashboardPage />} />
        <Route path={routes.productCreate} element={<ProductCreatePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
