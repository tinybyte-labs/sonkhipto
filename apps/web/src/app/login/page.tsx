"use client";

import { trpc } from "@/utils/trpc";
import { useToast } from "@/components/ui/use-toast";
import { GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SignIn() {
  const { toast } = useToast();
  const { onSignIn, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  console.log(process.env.GOOGLE_CLIENT_ID);

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
    if (user) {
      const redirect = searchParams.get("redirect") ?? "/";
      router.replace(redirect);
    }
  }, [user]);

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
