/**
 * Leaf2Forest site configuration.
 * Single source of truth for navigation, branding, and metadata.
 */

export const SITE = {
  name: "Leaf2Forest",
  chineseName: "叶与林",
  tagline: "青阳中学 2019 级 2 班 · 数字档案馆",
  description:
    "记录每一位同学现在在哪里、正在做什么，以及那段共同的高中岁月里留下的声音。",
  graduatingYear: 2022,
  school: "安徽省青阳中学",
  class: "2019 级 2 班",
} as const;

export interface NavItem {
  label: string;
  href: string;
  /** Brief description used in mobile nav and tooltips. */
  description?: string;
}

/**
 * Primary navigation — surfaced in header (CLAUDE.md §5 信息架构).
 * Order matters; this is the canonical sequence.
 * Admin-only items are in NAV_ITEMS_ADMIN.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "首页", href: "/", description: "档案馆入口" },
  { label: "Forest", href: "/forest", description: "同学档案 · 一片森林" },
  { label: "Echoes", href: "/echoes", description: "声音档案 · 高中时期的回声" },
  { label: "我的叶子", href: "/mine", description: "登录后维护个人资料" },
];

/**
 * Admin-only navigation items — only shown to users with is_admin=true.
 */
export const NAV_ITEMS_ADMIN: NavItem[] = [
  { label: "管理", href: "/admin", description: "管理员后台" },
];

/**
 * Footer link groups — kept minimal so the footer stays an archive
 * colophon rather than a marketing site map.
 */
export const FOOTER_LINKS: { title: string; items: NavItem[] }[] = [
  {
    title: "档案馆",
    items: [
      { label: "Forest · 同学档案", href: "/forest" },
      { label: "Echoes · 声音档案", href: "/echoes" },
    ],
  },
  {
    title: "成员",
    items: [
      { label: "登录", href: "/login" },
      { label: "我的叶子", href: "/mine" },
    ],
  },
];

/**
 * Admin-only footer links — only shown to users with is_admin=true.
 */
export const FOOTER_LINKS_ADMIN: { title: string; items: NavItem[] }[] = [
  {
    title: "维护",
    items: [{ label: "管理后台", href: "/admin" }],
  },
];
