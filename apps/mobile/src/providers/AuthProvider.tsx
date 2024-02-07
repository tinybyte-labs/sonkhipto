import { User } from "@acme/db";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { trpc } from "@/utils/trpc";
import { setToken } from "./TRPcProvider";

export type AuthContextType = {
  user?: User | null;
  signInAnonymously: () => Promise<User>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const utils = trpc.useUtils();
  const userQuery = trpc.auth.currentUser.useQuery();

  const signInAnonymouslyMut = trpc.auth.signInAnonymously.useMutation();

  const signInAnonymously: AuthContextType["signInAnonymously"] =
    useCallback(async () => {
      const { accessToken, user } = await signInAnonymouslyMut.mutateAsync();
      await SecureStore.setItemAsync(
        STORAGE_KEYS.SECURE_ACCESS_TOKEN,
        accessToken
      );
      setToken(accessToken);
      utils.auth.currentUser.setData(undefined, user);
      return user;
    }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync(
          STORAGE_KEYS.SECURE_ACCESS_TOKEN
        );
        if (accessToken) {
          console.log("GOT ACCESS TOKEN");
          setToken(accessToken);
          await userQuery.refetch();
        }
      } catch (error: any) {
        console.log(error);
      } finally {
        setIsLoaded(true);
      }
    };
    init();
  }, []);

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
