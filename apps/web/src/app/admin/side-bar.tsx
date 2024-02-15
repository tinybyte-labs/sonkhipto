import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { LayoutDashboard, ListIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function SideBar() {
  const { signOut } = useAuth();
  const pathname = usePathname();

  const links = [
    {
      icon: <LayoutDashboard />,
      label: "Dashboard",
      href: "",
      exactMatch: true,
    },
    {
      icon: <ListIcon />,
      label: "Posts",
      href: "/posts",
    },
    {
      icon: <UsersIcon />,
      label: "Users",
      href: "/users",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-card">
      <div className="p-4 flex items-center">
        <Link href="/admin" className="text-lg font-bold">
          {APP_NAME}
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1 px-2">
          {links.map((item) => {
            const href = `/admin${item.href}`;
            console.log(href);
            const isActive = item.exactMatch
              ? href === pathname
              : pathname.startsWith(href);
            return (
              <Button
                key={href}
                variant="ghost"
                className={cn(
                  "text-left justify-start text-muted-foreground pl-2 gap-4",
                  {
                    "bg-secondary text-foreground": isActive,
                  },
                )}
                asChild
              >
                <Link href={href}>
                  {item.icon}
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        <Button onClick={signOut} variant="outline">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
