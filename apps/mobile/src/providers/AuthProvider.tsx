import { User } from "@acme/db";
import * as SecureStore from "expo-secure-store";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { setToken } from "./TRPcProvider";

import { STORAGE_KEYS } from "@/constants/storage-keys";
import { trpc } from "@/utils/trpc";

export type AuthContextType = (
  | {
      isAuthenticated: false;
      user: null;
    }
  | {
      isAuthenticated: true;
      user: User;
    }
) & {
  signInAnonymously: () => Promise<User>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadCalled, setIsLoadCalled] = useState(false);
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  const getCurrentUserMut = trpc.auth.getCurrentUser.useMutation();
  const signInAnonymouslyMut = trpc.auth.signInAnonymously.useMutation();

  const signInAnonymously: AuthContextType["signInAnonymously"] =
    useCallback(async () => {
      const { accessToken, user } = await signInAnonymouslyMut.mutateAsync();
      await SecureStore.setItemAsync(
        STORAGE_KEYS.SECURE_ACCESS_TOKEN,
        accessToken,
      );
      setToken(accessToken);
      setUser(user);
      return user;
    }, [signInAnonymouslyMut]);

  const signOut: AuthContextType["signOut"] = useCallback(async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.SECURE_ACCESS_TOKEN);
    setUser(null);
    setToken("");
  }, []);

  useEffect(() => {
    if (isLoadCalled) return;

    const load = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync(
          STORAGE_KEYS.SECURE_ACCESS_TOKEN,
        );
        if (accessToken) {
          setToken(accessToken);
          const user = await getCurrentUserMut.mutateAsync();
          setUser(user);
        }
      } catch (error: any) {
        console.log(error);
      } finally {
        setIsLoaded(true);
      }
    };

    setIsLoadCalled(true);
    load();
  }, [getCurrentUserMut, isLoadCalled]);

  if (!isLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        ...(user
          ? { isAuthenticated: true, user }
          : { isAuthenticated: false, user: null }),
        signInAnonymously,
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
