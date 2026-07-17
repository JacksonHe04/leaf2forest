import { cn } from "@/lib/utils";
import { LeafMotif } from "./LeafMotif";

/**
 * SectionTitle — eyebrow + serif title + gold rule.
 * Standard section opener across the site (CLAUDE.md §6.2: all
 * visual variables centralized).
 */
export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  withRule = true,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  withRule?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="display-heading text-3xl sm:text-4xl text-ink">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "font-serif text-ink-soft leading-7",
            align === "center" ? "max-w-2xl" : "max-w-2xl"
          )}
        >
          {description}
        </p>
      )}
      {withRule && (
        <div
          className={cn(
            "mt-2 flex items-center gap-2 text-gold",
            align === "center" && "justify-center"
          )}
        >
          <LeafMotif variant="mark" className="h-4 w-4" />
          <span className="h-px w-16 bg-gradient-to-r from-gold to-transparent" />
        </div>
      )}
    </div>
  );
}
