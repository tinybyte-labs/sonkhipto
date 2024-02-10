import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/react-query";
import { ReactNode, useState } from "react";
import superjson from "superjson";

import { API_URL } from "@/constants";
import { trpc } from "@/utils/trpc";

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
          },
        },
      }),
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${API_URL}/trpc`,
          transformer: superjson,
          headers() {
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
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
