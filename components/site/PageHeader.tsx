import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LeafMotif } from "./LeafMotif";

/**
 * PageHeader — standard inner-page masthead.
 *
 * Renders an optional breadcrumb, eyebrow, large display title,
 * supporting subtitle, and an optional actions slot on the right.
 * Used by Forest, Echoes, Leaf, Admin, and form pages so every
 * interior page opens with the same silhouette.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  breadcrumb,
  actions,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-10", className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav
          aria-label="breadcrumb"
          className="mb-4 flex flex-wrap items-center gap-1.5 text-xs font-serif text-ink-faint"
        >
          {breadcrumb.map((item, i) => {
            const last = i === breadcrumb.length - 1;
            return (
              <span key={i} className="flex items-center gap-1.5">
                {item.href && !last ? (
                  <Link
                    href={item.href}
                    className="hover:text-forest transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={last ? "text-ink-soft" : ""}>
                    {item.label}
                  </span>
                )}
                {!last && <span className="text-gold">/</span>}
              </span>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1 className="display-heading text-4xl sm:text-5xl text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="font-serif text-ink-soft leading-7 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-wrap">{actions}</div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3 text-gold">
        <span className="h-px flex-1 bg-gradient-to-r from-gold via-gold/60 to-transparent" />
        <LeafMotif variant="mark" className="h-4 w-4" />
      </div>
    </header>
  );
}
