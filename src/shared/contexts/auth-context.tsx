import { createContext, useContext, useMemo, useState } from "react";

type AuthContextValue = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (asAdmin?: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const value = useMemo(
    () => ({
      isLoggedIn,
      isAdmin,
      login: (asAdmin = false) => {
        setIsLoggedIn(true);
        setIsAdmin(asAdmin);
      },
      logout: () => {
        setIsLoggedIn(false);
        setIsAdmin(false);
      },
    }),
    [isLoggedIn, isAdmin]
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
