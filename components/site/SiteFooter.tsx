"use client";

import Link from "next/link";
import { FOOTER_LINKS, FOOTER_LINKS_ADMIN, SITE } from "@/lib/site";
import { useAuth } from "@/lib/useAuth";
import { LeafMotif } from "./LeafMotif";

/**
 * SiteFooter — an archive colophon.
 *
 * Quiet, dated, and signed. No marketing, no newsletter signup,
 * no big CTA. Just the name, the year range, the school, and a
 * short list of links — like the imprint on the back of a book.
 *
 * Admin footer links (管理后台) are only shown when isAdmin is true.
 */
export function SiteFooter() {
  const { isAdmin } = useAuth();
  const year = new Date().getFullYear();
  const startYear = SITE.graduatingYear - 3; // 2019 入学
  const footerLinks = isAdmin
    ? [...FOOTER_LINKS, ...FOOTER_LINKS_ADMIN]
    : FOOTER_LINKS;

  return (
    <footer className="mt-24 border-t border-border/70 bg-paper-soft">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Colophon */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <LeafMotif variant="mark" className="h-6 w-6 text-forest" />
              <span className="display-heading text-xl text-ink">
                Leaf<span className="text-forest">2</span>Forest
              </span>
            </div>
            <p className="mt-4 max-w-sm font-serif text-sm leading-7 text-ink-soft">
              {SITE.description}
            </p>
            <p className="mt-4 text-xs text-ink-faint tracking-wide">
              {SITE.school} · {SITE.class}
            </p>
          </div>

          {/* Link groups */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="eyebrow mb-3">{group.title}</h3>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="font-serif text-sm text-ink-soft hover:text-forest transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom rule */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="font-serif text-xs text-ink-faint">
            © {startYear}–{year} · {SITE.name} · 长期保存，慢慢生长。
          </p>
          <p className="font-serif text-xs text-ink-faint italic">
            “从叶子到森林”
          </p>
        </div>
      </div>
    </footer>
  );
}
