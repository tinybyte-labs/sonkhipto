import { AuthContextType } from "@/providers/auth-provider";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

export type RouterContext = {
  auth: AuthContextType;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});
