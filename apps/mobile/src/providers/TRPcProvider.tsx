import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { httpBatchLink } from "@trpc/react-query";
import superjson from "superjson";
import { API_URL } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export let token: string | undefined = undefined;

export const setToken = (tk: string) => {
  token = tk;
};

export default function TRPcProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 1000 * 60 * 5, // 1 hour
          },
        },
      })
  );
  const [asyncStoragePersister] = useState(() =>
    createAsyncStoragePersister({
      storage: AsyncStorage,
    })
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${API_URL}/trpc`,
          transformer: superjson,
          headers(opts) {
            return {
              authorization: token ? `Bearer ${token}` : undefined,
            };
          },
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <PersistQueryClientProvider
        persistOptions={{ persister: asyncStoragePersister }}
        client={queryClient}
      >
        {children}
      </PersistQueryClientProvider>
    </trpc.Provider>
  );
}
