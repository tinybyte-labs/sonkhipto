import {
  createFileRoute,
  getRouteApi,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { trpc } from "@/utils/trpc";
import { useToast } from "@/components/ui/use-toast";
import { GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { z } from "zod";
import { flushSync } from "react-dom";
import { UserRole } from "@acme/db";

const signInSearchSchema = z.object({ redirect: z.string().catch("/") });

export const Route = createFileRoute("/signin")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: SignIn,
  validateSearch: signInSearchSchema,
});

const routeApi = getRouteApi("/signin");

const allowedRoles: UserRole[] = ["ADMIN", "WRITER"];

function SignIn() {
  const { toast } = useToast();
  const { onSignIn } = useAuth();
  const search = routeApi.useSearch();
  const navigate = useNavigate();

  const signInWithGoogleMut = trpc.auth.signInWithGoogle.useMutation({
    onSuccess: (data) => {
      if (!allowedRoles.includes(data.user.role)) {
        toast({ title: "You don't have access to admin panel" });
        return;
      }
      toast({ title: "Log in success!" });
      flushSync(() => {
        onSignIn(data.accessToken, data.user);
      });
      navigate({ to: search.redirect });
    },
    onError: (error) => {
      toast({
        title: "Failed to sign in with Google",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-2">
      <h3>Sign In</h3>
      {signInWithGoogleMut.isPending ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <GoogleLogin
          onSuccess={(cred) => {
            if (!cred.credential) {
              toast({
                title: "Failed to sign in with Google",
                variant: "destructive",
              });
              return;
            }
            signInWithGoogleMut.mutate({ idToken: cred.credential });
          }}
          onError={() => {
            toast({
              title: "Failed to sign in with Google",
              variant: "destructive",
            });
          }}
        />
      )}
    </div>
  );
}
