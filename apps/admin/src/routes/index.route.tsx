import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { flushSync } from "react-dom";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context, location }) => {
    console.log(context.auth);
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/signin",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: Index,
});

function Index() {
  const navigate = useNavigate({ from: "/" });
  const { signOut } = useAuth();

  const handleSignOut = useCallback(() => {
    flushSync(() => {
      signOut();
    });
    navigate({ to: "/" });
  }, [navigate, signOut]);

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <Button onClick={handleSignOut}>Sign Out</Button>
    </div>
  );
}
