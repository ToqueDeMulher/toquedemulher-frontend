import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/shared/contexts/auth-context";
import { routes } from "@/shared/lib/routes";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
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

  return <>{children}</>;
}
