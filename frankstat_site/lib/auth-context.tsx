"use client";
import { createContext, useContext, useEffect, useState } from "react";

type AuthUser = { id: string; fullName: string; email: string } | null;

const AuthContext = createContext<{
  user: AuthUser;
  logout: () => void;
  loading: boolean;
}>({ user: null, logout: () => {}, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hit a lightweight /api/auth/me endpoint that reads the cookie server-side
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data?.user ?? null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);