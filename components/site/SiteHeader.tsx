"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_ITEMS_ADMIN, SITE } from "@/lib/site";
import { LeafMotif } from "./LeafMotif";

/**
 * SiteHeader — slim top navigation in the archive style.
 *
 * Layout:
 *  - Left: Leaf2Forest wordmark (leaf motif + serif name)
 *  - Right: primary nav items (desktop only)
 *
 * Mobile navigation is handled by the BottomNav component.
 * Admin nav items (管理) are only shown when isAdmin is true.
 */
export function SiteHeader({
  isAdmin = false,
  isLoggedIn = false,
}: {
  isAdmin?: boolean;
  isLoggedIn?: boolean;
}) {
  const baseItems = isLoggedIn
    ? NAV_ITEMS
    : NAV_ITEMS.map((item) =>
        item.href === "/mine"
          ? { ...item, label: "登录", href: "/login", description: "登录后维护个人资料" }
          : item
      );
  const navItems = isAdmin ? [...baseItems, ...NAV_ITEMS_ADMIN] : baseItems;
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        "bg-paper/85 backdrop-blur-md",
        "border-b border-border/70"
      )}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Wordmark */}
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label={`${SITE.name} 首页`}
          >
            <LeafMotif
              variant="mark"
              className="h-6 w-6 text-forest transition-transform duration-500 group-hover:rotate-[-8deg]"
            />
            <span className="flex flex-col leading-none">
              <span className="display-heading text-lg text-ink">
                Leaf<span className="text-forest">2</span>Forest
              </span>
              <span className="mt-0.5 text-[10px] tracking-[0.18em] text-ink-faint uppercase font-serif">
                {SITE.tagline}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3 py-2 text-sm font-serif transition-colors duration-200",
                    active
                      ? "text-forest"
                      : "text-ink-soft hover:text-forest"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute left-3 right-3 -bottom-0.5 h-px bg-gold transition-opacity duration-300",
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
