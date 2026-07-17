"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Classmate } from "@/lib/db/types";
import { cn } from "@/lib/utils";

interface Props {
  classmate: Classmate;
  /** Image URL for the avatar; null when no avatar. */
  avatarUrl: string | null;
  index?: number;
}

/**
 * ClassmateCard — a single specimen-page entry in the Forest directory.
 *
 * Design intent: each classmate is a "leaf" pressed onto a paper card.
 * The card is intentionally light on data — just enough to recognize
 * someone at a glance. Full details live on /forest/[id].
 */
export function ClassmateCard({ classmate, avatarUrl, index = 0 }: Props) {
  const initials = classmate.name.slice(0, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.04, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={`/forest/${classmate.user_id}`}
        className={cn(
          "group block surface-paper rounded-md lift-paper overflow-hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        )}
      >
        {/* Top: avatar centered, like a specimen label */}
        <div className="flex flex-col items-center px-6 pt-7 pb-4">
          <div className="relative">
            <span
              className="absolute -inset-1.5 rounded-full bg-gold/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden="true"
            />
            <Avatar className="relative h-20 w-20 rounded-full border border-gold/30 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              {avatarUrl && (
                <AvatarImage src={avatarUrl} alt={classmate.name} />
              )}
              <AvatarFallback className="bg-paper-deep font-serif text-2xl text-forest">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <h3 className="mt-4 display-heading text-xl text-ink group-hover:text-forest transition-colors">
            {classmate.name}
          </h3>
          {classmate.bio && (
            <p className="mt-1.5 line-clamp-2 text-center font-serif text-xs leading-6 text-ink-faint">
              {classmate.bio}
            </p>
          )}
        </div>

        {/* Bottom: meta row, like a herbarium label */}
        <div className="border-t border-border/60 bg-paper-deep/30 px-6 py-3 space-y-1.5">
          {classmate.city && (
            <MetaLine icon={<MapPin className="h-3.5 w-3.5" />} text={classmate.city} />
          )}
          {(classmate.employer || classmate.industry) && (
            <MetaLine
              icon={<Briefcase className="h-3.5 w-3.5" />}
              text={
                [classmate.employer, classmate.industry]
                  .filter(Boolean)
                  .join(" · ") ?? ""
              }
            />
          )}
          {!classmate.city &&
            !classmate.employer &&
            !classmate.industry && (
              <MetaLine
                icon={<span className="text-gold">·</span>}
                text="资料待补充"
                faint
              />
            )}
        </div>
      </Link>
    </motion.div>
  );
}

function MetaLine({
  icon,
  text,
  faint,
}: {
  icon: React.ReactNode;
  text: string;
  faint?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 font-serif text-xs",
        faint ? "text-ink-faint italic" : "text-ink-soft"
      )}
    >
      <span className="text-forest">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}
