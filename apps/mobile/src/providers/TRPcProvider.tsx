import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { httpBatchLink } from "@trpc/react-query";
import { ReactNode, useState } from "react";
import superjson from "superjson";

import { asyncStoragePersister, queryClient } from "@/utils/queryClient";
import { trpc } from "@/utils/trpc";

export let token: string | undefined = undefined;

export const setToken = (tk: string) => {
  token = tk;
};

export default function TRPcProvider({ children }: { children: ReactNode }) {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
          headers(opts) {
            return {
              authorization: token ? `Bearer ${token}` : undefined,
            };
          },
        }),
      ],
    }),
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
