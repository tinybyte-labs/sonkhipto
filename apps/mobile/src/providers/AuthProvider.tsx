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

export type AuthContextType = {
  user?: User | null;
  signInAnonymously: () => Promise<User>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const utils = trpc.useUtils();
  const userQuery = trpc.auth.currentUser.useQuery(undefined, { retry: false });

  const signInAnonymouslyMut = trpc.auth.signInAnonymously.useMutation();

  const signInAnonymously: AuthContextType["signInAnonymously"] =
    useCallback(async () => {
      const { accessToken, user } = await signInAnonymouslyMut.mutateAsync();
      await SecureStore.setItemAsync(
        STORAGE_KEYS.SECURE_ACCESS_TOKEN,
        accessToken,
      );
      setToken(accessToken);
      utils.auth.currentUser.setData(undefined, user);
      return user;
    }, [signInAnonymouslyMut, utils.auth.currentUser]);

  useEffect(() => {
    const init = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync(
          STORAGE_KEYS.SECURE_ACCESS_TOKEN,
        );
        if (accessToken) {
          setToken(accessToken);
          await utils.auth.currentUser.refetch();
        }
      } catch (error: any) {
        console.log(error);
      } finally {
        setIsLoaded(true);
      }
    };
    init();
  }, [utils.auth.currentUser]);

  if (!isLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user: userQuery.data, signInAnonymously }}>
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
