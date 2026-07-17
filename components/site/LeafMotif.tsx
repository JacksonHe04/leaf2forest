import { cn } from "@/lib/utils";

/**
 * A single pressed-leaf SVG, used as a decorative mark throughout
 * the site. Drawn in the Forest palette so it sits quietly on paper.
 *
 * Variants:
 *  - "mark"   : small inline mark (default, 24px)
 *  - "sprig"  : a small branch with two leaves, for section openers
 *  - "frame"  : a larger ornament for hero areas
 */
export function LeafMotif({
  variant = "mark",
  className,
}: {
  variant?: "mark" | "sprig" | "frame";
  className?: string;
}) {
  if (variant === "sprig") {
    return (
      <svg
        viewBox="0 0 80 32"
        className={cn("text-forest", className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden="true"
      >
        <path d="M40 28 L40 6" strokeLinecap="round" />
        <path
          d="M40 14 C 32 12, 26 8, 22 4 C 28 6, 34 9, 40 14 Z"
          fill="currentColor"
          fillOpacity="0.18"
        />
        <path
          d="M40 18 C 48 16, 54 12, 58 8 C 52 10, 46 13, 40 18 Z"
          fill="currentColor"
          fillOpacity="0.18"
        />
        <circle cx="40" cy="28" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  if (variant === "frame") {
    return (
      <svg
        viewBox="0 0 120 40"
        className={cn("text-gold", className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden="true"
      >
        <line x1="0" y1="20" x2="42" y2="20" strokeLinecap="round" />
        <line x1="78" y1="20" x2="120" y2="20" strokeLinecap="round" />
        <path
          d="M60 8 C 54 10, 50 14, 48 20 C 50 26, 54 30, 60 32 C 66 30, 70 26, 72 20 C 70 14, 66 10, 60 8 Z"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <path d="M60 8 L60 32" strokeOpacity="0.5" />
        <circle cx="48" cy="20" r="1.2" fill="currentColor" />
        <circle cx="72" cy="20" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  // default: mark
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("text-forest", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <path
        d="M12 2 C 7 5, 4 9, 4 14 C 4 18, 7 21, 12 22 C 17 21, 20 18, 20 14 C 20 9, 17 5, 12 2 Z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      <path d="M12 2 L12 22" strokeOpacity="0.5" />
    </svg>
  );
}
