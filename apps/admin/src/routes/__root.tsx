import AuthProvider from "@/providers/auth-provider";
import TRPcProvider from "@/providers/trpc-provider";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <TRPcProvider>
      <AuthProvider>
        <Outlet />
        <TanStackRouterDevtools />
      </AuthProvider>
    </TRPcProvider>
  ),
});
