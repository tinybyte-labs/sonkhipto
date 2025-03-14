"use client";

import { GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/auth-provider";
import { trpc } from "@/utils/trpc";

export default function LogIn({ redirect }: { redirect?: string }) {
  const { toast } = useToast();
  const { onSignIn, state } = useAuth();
  const router = useRouter();

  const signInWithGoogleMut = trpc.auth.signInWithGoogle.useMutation({
    onSuccess: (data) => {
      toast({ title: "Log in success!" });
      onSignIn(data.accessToken, data.user);
    },
    onError: (error) => {
      toast({
        title: "Failed to sign in with Google",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (state === "authenticated") {
      router.replace(redirect ?? "/");
    }
  }, [state, redirect, router]);

  if (state === "loading") {
    return <p>Loading...</p>;
  }

  if (state === "authenticated") {
    return <p>Redirecting...</p>;
  }

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
