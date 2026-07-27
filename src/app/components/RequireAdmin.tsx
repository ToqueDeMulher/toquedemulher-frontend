import { Navigate, useLocation } from "react-router-dom";
import { routes } from "@/app/router/paths";
import { useAuth } from "@/features/auth/context/auth-context";

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
