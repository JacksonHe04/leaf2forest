"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  GraduationCap,
  Briefcase,
  Mars,
  Venus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WeChatIcon, QQIcon } from "./SocialIcons";
import type { Classmate } from "@/lib/db/types";
import { cn } from "@/lib/utils";

interface Props {
  classmate: Classmate;
  /** Image URL for the avatar; null when no avatar. */
  avatarUrl: string | null;
}

/**
 * ClassmateCard — Forest directory specimen-page entry.
 *
 * Layout:
 *  ┌─────────────────────────────────────┐
 *  │ [avatar]   education (×3 max)       │
 *  │  name      bio                       │
 *  │            employer · industry       │
 *  ├─────────────────────────────────────┤
 *  │ 📍city    [contact icons]  [gender] │
 *  └─────────────────────────────────────┘
 *
 * All cards share a fixed height so the grid stays uniform
 * regardless of how much content each classmate has.
 */
export function ClassmateCard({ classmate, avatarUrl }: Props) {
  const initials = classmate.name.slice(0, 1);

  // Education entries — bachelor → master → doctor (ascending)
  const eduEntries: { school: string; major: string }[] = [];
  if (classmate.bachelor_university)
    eduEntries.push({
      school: classmate.bachelor_university,
      major: classmate.bachelor_major ?? "",
    });
  if (classmate.master_university)
    eduEntries.push({
      school: classmate.master_university,
      major: classmate.master_major ?? "",
    });
  if (classmate.doctor_university)
    eduEntries.push({
      school: classmate.doctor_university,
      major: classmate.doctor_major ?? "",
    });

  // Contact icons — only for non-empty fields
  const contacts: { icon: React.ReactNode; value: string }[] = [];
  if (classmate.phone)
    contacts.push({
      icon: <Phone className="h-3 w-3" />,
      value: classmate.phone,
    });
  if (classmate.wechat)
    contacts.push({
      icon: <WeChatIcon className="h-3.5 w-3.5" />,
      value: classmate.wechat,
    });
  if (classmate.qq)
    contacts.push({
      icon: <QQIcon className="h-3.5 w-3.5" />,
      value: classmate.qq,
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/forest/${classmate.user_id}`}
        className={cn(
          "group block surface-paper rounded-md lift-paper overflow-hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
          "h-[200px] flex flex-col"
        )}
      >
        {/* ── Top section: info area ── */}
        <div className="flex-1 grid grid-cols-[72px_1fr] gap-3 p-4">
          {/* Left: avatar + name */}
          <div className="flex flex-col items-center justify-center">
            <Avatar className="h-14 w-14 rounded-full border border-gold/30 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              {avatarUrl && (
                <AvatarImage src={avatarUrl} alt={classmate.name} />
              )}
              <AvatarFallback className="bg-paper-deep font-serif text-lg text-forest">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h3 className="mt-2 font-serif text-sm text-ink text-center leading-tight group-hover:text-forest transition-colors line-clamp-1">
              {classmate.name}
            </h3>
          </div>

          {/* Right: education, bio, work */}
          <div className="flex flex-col gap-1 min-w-0 justify-center">
            {eduEntries.map((edu) => (
              <div key={edu.school} className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-serif text-ink-soft">
                  <GraduationCap className="h-3 w-3 text-forest shrink-0" />
                  <span className="truncate">{edu.school}</span>
                </div>
                {edu.major && (
                  <p className="text-[11px] font-serif text-ink-faint truncate pl-[18px]">
                    {edu.major}
                  </p>
                )}
              </div>
            ))}

            <p className="text-xs font-serif text-ink-faint line-clamp-2 leading-5">
              {classmate.bio || "还没有自我介绍哦"}
            </p>

            {(classmate.employer || classmate.industry) && (
              <div className="flex items-center gap-1.5 text-xs font-serif text-ink-soft min-w-0">
                <Briefcase className="h-3 w-3 text-forest shrink-0" />
                <span className="truncate">
                  {[classmate.employer, classmate.industry]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom bar: city ··· contacts · gender ── */}
        <div className="border-t border-border/60 bg-paper-deep/30 px-4 py-2 flex items-center">
          {classmate.city && (
            <span className="flex items-center gap-1 text-xs font-serif text-ink-soft shrink-0">
              <MapPin className="h-3 w-3 text-forest" />
              <span className="truncate max-w-[5rem]">{classmate.city}</span>
            </span>
          )}

          <span className="ml-auto flex items-center gap-2">
            {contacts.length > 0 &&
              contacts.map((c, i) => (
                <span
                  key={i}
                  className="text-forest/70"
                  title={c.value}
                >
                  {c.icon}
                </span>
              ))}

            {classmate.gender &&
              (classmate.gender === "male" ? (
                <Mars className="h-3.5 w-3.5 text-forest/50" />
              ) : classmate.gender === "female" ? (
                <Venus className="h-3.5 w-3.5 text-forest/50" />
              ) : null)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
