import { Navigate, useLocation } from "react-router-dom";
import { routes } from "@/app/router/paths";
import { useAuth } from "@/features/auth/context/auth-context";

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
