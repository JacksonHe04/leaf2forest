import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { getClassmate, getClassmateByUserId } from "@/lib/db/classmates";
import { listRecordings } from "@/lib/db/recordings";
import { getPublicUrl, BUCKET_IMAGES } from "@/lib/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/site/PageHeader";
import { PageTransition } from "@/components/site/PageTransition";
import { LeafMotif } from "@/components/site/LeafMotif";
import RecordingCard from "@/components/features/RecordingCard";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = (await getClassmateByUserId(id)) ?? (await getClassmate(id));
  if (!c) return { title: "未找到同学" };
  return {
    title: `${c.name} · 同学档案`,
    description: c.bio ?? `${c.name} 的同学档案`,
  };
}

export default async function ClassmateProfilePage({ params }: Props) {
  const { id } = await params;
  const c = (await getClassmateByUserId(id)) ?? (await getClassmate(id));
  if (!c) notFound();

  const avatarUrl = c.avatar_path
    ? getPublicUrl(BUCKET_IMAGES, c.avatar_path)
    : null;

  // Recordings this classmate appears in.
  const recordings = await listRecordings({ classmateId: c.id });
  const initials = c.name.slice(0, 1);

  const educationRows: { label: string; university: string | null; major: string | null }[] = [
    { label: "本科", university: c.bachelor_university, major: c.bachelor_major },
    { label: "硕士", university: c.master_university, major: c.master_major },
    { label: "博士", university: c.doctor_university, major: c.doctor_major },
  ].filter((r) => r.university || r.major) as typeof educationRows;

  const contactRows: { label: string; value: string | null; icon: React.ReactNode }[] = [
    { label: "QQ", value: c.qq, icon: <MessageCircle className="h-4 w-4" /> },
    { label: "微信", value: c.wechat, icon: <MessageCircle className="h-4 w-4" /> },
    { label: "电话", value: c.phone, icon: <Phone className="h-4 w-4" /> },
  ].filter((r) => r.value) as typeof contactRows;

  const genderLabel =
    c.gender === "male"
      ? "男"
      : c.gender === "female"
      ? "女"
      : c.gender === "other"
      ? "其他"
      : null;

  return (
    <main className="mx-auto max-w-5xl px-5 sm:px-8 py-12">
      <PageHeader
        eyebrow="Leaf · 一片叶子"
        title={
          <span className="flex items-baseline gap-3 flex-wrap">
            {c.name}
            {genderLabel && (
              <span className="font-serif text-base text-ink-faint">
                · {genderLabel}
              </span>
            )}
          </span>
        }
        subtitle={c.bio ?? "尚未填写个人介绍。"}
        breadcrumb={[
          { label: "首页", href: "/" },
          { label: "Forest", href: "/forest" },
          { label: c.name },
        ]}
      />

      <PageTransition>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: portrait + meta */}
          <aside className="md:col-span-1">
            <div className="surface-paper rounded-md p-6 text-center">
              <div className="relative inline-block">
                <span
                  className="absolute -inset-2 rounded-full bg-gold/10"
                  aria-hidden="true"
                />
                <Avatar className="relative h-32 w-32 rounded-full border-2 border-gold/30 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={c.name} />}
                  <AvatarFallback className="bg-paper-deep font-serif text-4xl text-forest">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <h2 className="mt-5 display-heading text-2xl text-ink">{c.name}</h2>
              {c.birth_date && (
                <p className="mt-1 font-serif text-xs text-ink-faint">
                  生于 {c.birth_date}
                </p>
              )}

              <div className="mt-5 flex justify-center">
                <LeafMotif variant="mark" className="h-5 w-5 text-gold/60" />
              </div>

              <dl className="mt-5 space-y-2.5 text-left">
                {c.city && (
                  <MetaRow icon={<MapPin className="h-4 w-4" />} label="所在城市" value={c.city} />
                )}
                {c.employer && (
                  <MetaRow icon={<Briefcase className="h-4 w-4" />} label="工作单位" value={c.employer} />
                )}
                {c.industry && (
                  <MetaRow icon={<Briefcase className="h-4 w-4" />} label="所属行业" value={c.industry} />
                )}
                {!c.city && !c.employer && !c.industry && (
                  <p className="text-center font-serif text-xs italic text-ink-faint">
                    基本资料待补充
                  </p>
                )}
              </dl>
            </div>
          </aside>

          {/* Right: detailed panels */}
          <section className="md:col-span-2 space-y-6">
            {/* Bio */}
            {c.bio && (
              <Panel title="个人介绍" icon={<UserIcon className="h-4 w-4" />}>
                <p className="prose-archive whitespace-pre-wrap">{c.bio}</p>
              </Panel>
            )}

            {/* Education */}
            {educationRows.length > 0 && (
              <Panel title="教育经历" icon={<GraduationCap className="h-4 w-4" />}>
                <ul className="space-y-3">
                  {educationRows.map((row) => (
                    <li
                      key={row.label}
                      className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-l-2 border-gold/40 pl-4"
                    >
                      <span className="font-serif text-xs tracking-wider uppercase text-gold w-12 shrink-0">
                        {row.label}
                      </span>
                      <div className="flex-1">
                        <div className="font-serif text-ink">
                          {row.university ?? "—"}
                        </div>
                        {row.major && (
                          <div className="font-serif text-sm text-ink-soft">
                            {row.major}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            {/* Contact */}
            {contactRows.length > 0 && (
              <Panel title="联系方式" icon={<MessageCircle className="h-4 w-4" />}>
                <p className="mb-4 font-serif text-xs italic text-ink-faint">
                  以下联系方式仅用于同学之间重新连接，请勿外传。
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {contactRows.map((row) => (
                    <li
                      key={row.label}
                      className="rounded-md border border-border bg-paper-deep/30 px-4 py-3"
                    >
                      <div className="flex items-center gap-2 text-forest">
                        {row.icon}
                        <span className="font-serif text-xs tracking-wider uppercase">
                          {row.label}
                        </span>
                      </div>
                      <div className="mt-1 font-serif text-sm text-ink break-all">
                        {row.value}
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            {/* Recordings */}
            {recordings.length > 0 && (
              <Panel
                title={`出现在 ${recordings.length} 段录音中`}
                icon={<Calendar className="h-4 w-4" />}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recordings.slice(0, 6).map((r, i) => (
                    <RecordingCard
                      key={r.id}
                      recording={r}
                      classmates={[c]}
                      sizeBytes={null}
                      variant="row"
                      index={i}
                    />
                  ))}
                </div>
                {recordings.length > 6 && (
                  <p className="mt-4 font-serif text-xs text-ink-faint">
                    仅显示前 6 段。完整列表见{" "}
                    <Link
                      href={`/echoes?classmate=${c.id}`}
                      className="link-archive"
                    >
                      Echoes 声音档案
                    </Link>
                    。
                  </p>
                )}
              </Panel>
            )}

            {recordings.length === 0 &&
              !c.bio &&
              educationRows.length === 0 &&
              contactRows.length === 0 && (
                <div className="surface-paper rounded-md p-10 text-center">
                  <LeafMotif variant="sprig" className="mx-auto h-8 w-24 text-forest/40" />
                  <p className="mt-5 font-serif text-ink-soft">
                    这片叶子还没有写下任何内容。
                  </p>
                  <p className="mt-1 font-serif text-sm text-ink-faint">
                    登录后可在「我的叶子」中维护资料。
                  </p>
                </div>
              )}
          </section>
        </div>
      </PageTransition>
    </main>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-forest">{icon}</span>
      <div className="flex-1 min-w-0">
        <dt className="font-serif text-[10px] tracking-wider uppercase text-ink-faint">
          {label}
        </dt>
        <dd className="font-serif text-sm text-ink truncate">{value}</dd>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-paper rounded-md p-6">
      <h3 className="flex items-center gap-2 display-heading text-lg text-ink">
        <span className="text-forest">{icon}</span>
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
