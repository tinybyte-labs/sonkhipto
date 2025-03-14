import type { PublicUser } from "@acme/trpc/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TRPCError } from "@trpc/server";
import * as Linking from "expo-linking";
import * as Network from "expo-network";
import * as SecureStore from "expo-secure-store";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ActivityIndicator, Alert, View } from "react-native";

import { STORAGE_KEYS } from "@/constants/storage-keys";
import { trpc } from "@/utils/trpc";

import { setToken } from "./TRPcProvider";

export type AuthContextType = (
  | {
      isAuthenticated: false;
      user: null;
    }
  | {
      isAuthenticated: true;
      user: PublicUser;
    }
) & {
  signInAnonymously: () => Promise<PublicUser>;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadCalled, setIsLoadCalled] = useState(false);
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  const utils = trpc.useUtils();
  const signInAnonymouslyMut = trpc.auth.signInAnonymously.useMutation();

  const handleOnSignIn = useCallback(
    async (user: PublicUser, accessToken: string) => {
      setToken(accessToken);
      setUser(user);
      await SecureStore.setItemAsync(
        STORAGE_KEYS.SECURE_ACCESS_TOKEN,
        accessToken,
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(user),
      );
    },
    [],
  );

  const signInAnonymously: AuthContextType["signInAnonymously"] =
    useCallback(async () => {
      if (user) {
        return user;
      }
      const session = await signInAnonymouslyMut.mutateAsync();
      await handleOnSignIn(session.user, session.accessToken as string);
      return session.user;
    }, [handleOnSignIn, signInAnonymouslyMut, user]);

  const signOut: AuthContextType["signOut"] = useCallback(async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.SECURE_ACCESS_TOKEN);
    await AsyncStorage.clear();
    setUser(null);
    setToken("");
  }, []);

  const refetch = useCallback(async () => {
    try {
      const user = await utils.auth.currentUser.fetch();
      setUser(user);
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_USER,
        JSON.stringify(user),
      );
    } catch (error: unknown) {
      Alert.alert(
        `Error`,
        error instanceof TRPCError ? error.message : "Something went wrong!",
      );
    }
  }, [utils.auth.currentUser]);

  useEffect(() => {
    if (isLoadCalled) return;

    const load = async () => {
      const accessToken = await SecureStore.getItemAsync(
        STORAGE_KEYS.SECURE_ACCESS_TOKEN,
      );
      if (accessToken) {
        // Setting access token for tRPC
        setToken(accessToken);

        // Checking if we have a local user saved for offline or quick log in.
        const userStr = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (userStr) {
          const user = JSON.parse(userStr) as PublicUser;
          if (typeof user.id === "string") {
            setUser(user);
            setIsLoaded(true);
          }
        }

        // Check newtwork state
        const networkState = await Network.getNetworkStateAsync();

        // If we have a network then request the current user. If it throws error that means our access token is not valid and we should log out our user
        if (networkState.isInternetReachable) {
          try {
            const user = await utils.auth.currentUser.fetch();
            setUser(user);
            await AsyncStorage.setItem(
              STORAGE_KEYS.CURRENT_USER,
              JSON.stringify(user),
            );
          } catch (error: unknown) {
            Alert.alert(
              `Error`,
              error instanceof TRPCError
                ? error.message
                : "Something went wrong!",
              [
                {
                  style: "default",
                  text: "Retry",
                  onPress: () => {
                    void load();
                  },
                },
                {
                  style: "destructive",
                  text: "Sign Out",
                  onPress: () => {
                    void signOut();
                  },
                },
              ],
            );
          }
        } else {
          Alert.alert(
            "You are offline!",
            "Any news or data you see while offline might be outdated. Please check your internet connection.",
            [
              {
                style: "cancel",
                text: "Cancel",
              },
              {
                style: "default",
                text: "Settings",
                onPress: () => {
                  void Linking.openSettings();
                },
              },
            ],
          );
        }
      }
      setIsLoaded(true);
    };

    setIsLoadCalled(true);
    void load();
  }, [isLoadCalled, signOut, utils.auth.currentUser]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        ...(user
          ? { isAuthenticated: true, user }
          : { isAuthenticated: false, user: null }),
        signInAnonymously,
        signOut,
        refetch,
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
