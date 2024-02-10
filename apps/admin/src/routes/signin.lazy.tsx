import { Button } from "@/components/ui/button";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/signin")({
  component: SignIn,
});

function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col">
      <h1 className="text-2xl font-semibold">Sign In</h1>
      <div className="mt-8">
        <Button>Sign in with Google</Button>
      </div>
    </div>
  );
}
