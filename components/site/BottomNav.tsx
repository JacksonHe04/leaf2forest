"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TreePine, Mic, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BASE_ITEMS: BottomNavItem[] = [
  { label: "首页", href: "/", icon: Home },
  { label: "Forest", href: "/forest", icon: TreePine },
  { label: "Echoes", href: "/echoes", icon: Mic },
];

const LOGGED_IN_ITEM: BottomNavItem = {
  label: "我的叶子",
  href: "/mine",
  icon: User,
};

const LOGGED_OUT_ITEM: BottomNavItem = {
  label: "登录",
  href: "/login",
  icon: User,
};

export function BottomNav({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
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
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                active ? "text-forest" : "text-ink-faint hover:text-ink-soft"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-serif leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
