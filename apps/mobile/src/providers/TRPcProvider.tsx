import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { httpBatchLink } from "@trpc/react-query";
import superjson from "superjson";

export default function TRPcProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      // change the ip address to whatever address the Metro server is running on
      // if you're using a Simulator 'localhost' should work fine
      links: [
        httpBatchLink({
          url: "http://localhost:8080/trpc",
          transformer: superjson,
          headers(opts) {
            return {
              authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJhZjk5ZGZlLTY3ZmItNDk5Zi05MjIwLWUwNWU3ZTYwZGQ1YyIsIm5hbWUiOm51bGwsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzA3MjM2NjYyfQ.c3UjvalgjgisQlsqbLc8dvueFLLS1tF3fCen7ahHVTA`,
            };
          },
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
