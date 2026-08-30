"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "../lib/api";
import { User } from "../lib/types";
import LoadingDetective from "./LoadingDetective";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; demo_code?: string }>;
  resetPassword: (email: string, code: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await api.me();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
        api.setToken(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (loading) return;
    const isAuthPage = pathname === "/auth";
    if (!user && !isAuthPage) {
      router.push("/auth");
    } else if (user && isAuthPage) {
      router.push("/");
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    const res = await api.login({ email, password });
    setUser(res.user);
    api.setToken(res.token, rememberMe);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.register({ name, email, password });
    setUser(res.user);
    api.setToken(res.token, false);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      api.setToken(null);
      router.push("/auth");
    }
  };

  const forgotPassword = async (email: string) => {
    return await api.forgotPassword(email);
  };

  const resetPassword = async (email: string, code: string, password: string) => {
    await api.resetPassword({ email, code, password });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-noir-900">
        <LoadingDetective label="Verifying security clearance..." />
      </div>
    );
  }

  // Prevent flash of protected page content while redirecting unauthenticated users
  const isAuthPage = pathname === "/auth";
  if (!user && !isAuthPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-noir-900">
        <LoadingDetective label="Redirecting to headquarters..." />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
