import { createContext, useContext, useMemo, useState } from "react";
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  REFRESH_TOKEN_KEY,
} from "@/shared/api/api-client";

export type AuthRole = "customer" | "admin";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
};

type AuthContextValue = {
  user: AuthUser | null;
  role: AuthRole | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (params: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  });

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isLoggedIn: user !== null,
      isAdmin: user?.role === "admin",
      login: ({ user: nextUser, accessToken, refreshToken }: {
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }) => {
        window.localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
        window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      },
      logout: () => {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
        window.localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.localStorage.removeItem(AUTH_USER_KEY);
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
