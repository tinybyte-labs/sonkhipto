"use client";

import type { User } from "@acme/db";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { trpc } from "@/utils/trpc";

import { setToken } from "./trpc-provider";

export type AuthContextType = (
  | {
      state: "loading";
      user: null;
    }
  | {
      state: "unauthenticated";
      user: null;
    }
  | {
      state: "authenticated";
      user: User;
    }
) & {
  onSignIn: (accessToken: string, user: User) => void;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadCalled, setIsLoadCalled] = useState(false);
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  const getCurrentUserMut = trpc.auth.getCurrentUser.useMutation();

  const onSignIn: AuthContextType["onSignIn"] = useCallback(
    (accessToken, user) => {
      localStorage.setItem("access_token", accessToken);
      setUser(user);
    },
    [],
  );

  const signOut: AuthContextType["signOut"] = useCallback(() => {
    localStorage.clear();
    setToken("");
    setUser(null);
  }, []);

  useEffect(() => {
    if (isLoadCalled) return;
    const load = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          setToken(token);
          const user = await getCurrentUserMut.mutateAsync();
          setUser(user);
        }
      } catch (error: unknown) {
        /* empty */
      } finally {
        setIsLoaded(true);
      }
    };

    setIsLoadCalled(true);
    void load();
  }, [getCurrentUserMut, isLoadCalled]);

  return (
    <AuthContext.Provider
      value={{
        ...(!isLoaded
          ? { state: "loading", user: null }
          : user
            ? { state: "authenticated", user }
            : { state: "unauthenticated", user: null }),
        onSignIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must use insdie AuthProvider");
  }
  return context;
};
