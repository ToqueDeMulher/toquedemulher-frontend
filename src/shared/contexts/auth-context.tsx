import { createContext, useContext, useMemo, useState } from "react";

export type AuthRole = "customer" | "admin";

export type AuthUser = {
  name: string;
  email: string;
  role: AuthRole;
};

type AuthContextValue = {
  user: AuthUser | null;
  role: AuthRole | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isLoggedIn: user !== null,
      isAdmin: user?.role === "admin",
      login: (nextUser: AuthUser) => {
        setUser(nextUser);
      },
      logout: () => {
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
