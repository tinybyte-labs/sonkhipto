"use client";

import type { UserRole } from "@acme/db";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

import SideBar from "./side-bar";

const allowedRoles: UserRole[] = ["ADMIN", "WRITER"];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, state, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (state === "unauthenticated") {
      const params = new URLSearchParams({ redirect: pathname });
      router.push(`/login?${params.toString()}`);
    }
  }, [pathname, router, state]);

  if (state === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  if (state === "unauthenticated") {
    return <p>Redirecting...</p>;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div>
        <p>You don't have access to admin panel.</p>
        <Button onClick={signOut}>Sign Out</Button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed left-0 top-0 bottom-0 w-64 border-r">
        <SideBar />
      </div>
      <div className="ml-64">{children}</div>
    </>
  );
}
