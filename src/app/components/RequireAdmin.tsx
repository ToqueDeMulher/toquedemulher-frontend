import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/contexts/auth-context";
import { routes } from "@/shared/lib/routes";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return (
      <Navigate
        to={routes.login}
        state={{ from: location }}
        replace
      />
    );
  }

  if (!isAdmin) {
    return (
      <Navigate
        to={routes.login}
        state={{ from: location, reason: "admin-only" }}
        replace
      />
    );
  }

  return <>{children}</>;
}
