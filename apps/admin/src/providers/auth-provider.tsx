import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@acme/db";
import { trpc } from "@/utils/trpc";
import { setToken } from "./trpc-provider";

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
    async (accessToken, user) => {
      localStorage.setItem("access_token", accessToken);
      setUser(user);
    },
    [],
  );

  const signOut: AuthContextType["signOut"] = useCallback(async () => {
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
        console.log(error);
      } finally {
        setIsLoaded(true);
      }
    };

    setIsLoadCalled(true);
    load();
  }, [getCurrentUserMut, isLoadCalled]);

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  return (
    <AuthContext.Provider
      value={{
        ...(user
          ? { isAuthenticated: true, user }
          : { isAuthenticated: false, user: null }),
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
