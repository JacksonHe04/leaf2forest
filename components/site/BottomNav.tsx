"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TreePine, Mic, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/useAuth";

interface BottomNavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BASE_ITEMS: BottomNavItem[] = [
  { href: "/", icon: Home },
  { href: "/forest", icon: TreePine },
  { href: "/echoes", icon: Mic },
];

const LOGGED_IN_ITEM: BottomNavItem = {
  href: "/mine",
  icon: User,
};

const LOGGED_OUT_ITEM: BottomNavItem = {
  href: "/login",
  icon: User,
};

export function BottomNav() {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const items = [
    ...BASE_ITEMS,
    isLoggedIn ? LOGGED_IN_ITEM : LOGGED_OUT_ITEM,
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 inset-x-0 z-40",
        "bg-paper/95 backdrop-blur-md border-t border-border/70",
        "safe-bottom"
      )}
    >
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center flex-1 h-full transition-colors",
                active ? "text-forest" : "text-ink-faint hover:text-ink-soft"
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
