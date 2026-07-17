# Leaf 2 Forest

高中回忆录与同学录。当前数据后端已完整迁移至 **Supabase**。

## 数据架构

| 形态 | 位置 |
|---|---|
| Postgres 表：`classmates`、`recordings` | Supabase project `lugszrtwvninbduskick` |
| 存储桶：`recordings`（原子化音频）、`images`（图床 / 头像） | 同上 |

两张表都启用了 `updated_at` 自动维护触发器；uuid 由 `gen_random_uuid()` 生成。

### `classmates`
姓名、头像路径（`images` 桶）、性别、出生日期、城市、QQ/微信/电话、工作单位 / 行业、本硕博院校 + 专业、简介。

### `recordings`
日期 + 具体时间、标题、描述、转写、背景、地点、`audio_path`（`recordings` 桶）、`classmates uuid[]`。

## 环境变量

`.env.local` 至少包含：
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```
兼容旧的 `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `sb_publishable_*` / `sb_secret_*` 字面量，见 `lib/env.ts`。

`SUPABASE_SERVICE_ROLE_KEY` **只能**在服务端使用（`lib/db/supabase.ts: getSupabaseAdmin()`）。

## 本地开发

```bash
pnpm install
pnpm dev
```

访问：
- `http://localhost:3000/` — 录音列表
- `http://localhost:3000/admin` — 数据后台
- `http://localhost:3000/admin/recordings` / `/admin/classmates` — 列表与新增

## 把本地音频灌进 Supabase

`data/recordings/` 下已经有 200 多个 .wav 历史文件。一次性的灌入脚本：

```bash
# 试运行（不真上传，只读列表）
node scripts/seed-recordings.mjs --dry-run --limit=5

# 正式跑（全量：上传到 recordings 桶 + 插入 recordings 行）
node scripts/seed-recordings.mjs
```

脚本是**幂等**的（以 storage 对象名为键跳过），但 DB 行不会去重；如需重灌，先 `truncate` recordings。

## 主要路由

| 路径 | 类型 | 说明 |
|---|---|---|
| `/` | RSC | 录音列表 |
| `/recordings/[id]` | RSC | 录音详情 + 同学信息 |
| `/admin` | RSC | 后台首页 |
| `/admin/recordings` | RSC | 录音管理列表 |
| `/admin/recordings/new` | RSC + Client Form | 新增录音 |
| `/admin/recordings/[id]/edit` | RSC | 查看/编辑录音（当前只读） |
| `/admin/classmates` | RSC | 同学管理列表 |
| `/admin/classmates/new` | RSC + Client Form | 新增同学 |
| `/admin/classmates/[id]/edit` | RSC | 查看/编辑同学（当前只读） |

| API | Method | Body |
|---|---|---|
| `/api/recordings` | GET / POST | JSON（POST: title/date/audio_path/classmates…） |
| `/api/recordings/[id]` | GET / PUT / DELETE | JSON 部分字段 |
| `/api/recordings/upload` | POST | multipart `file` |
| `/api/classmates` | GET / POST | JSON |
| `/api/classmates/[id]` | GET / PUT / DELETE | JSON |
| `/api/images/upload` | POST | multipart `file` |
| `/api/storage/list?bucket=recordings\|images` | GET | — |
| `/api/storage/delete` | DELETE | `{ bucket, names: string[] }` |
| `/api/health` | GET | — |

## 迁移背景（备忘）

- 旧的 MongoDB (`leaf-to-forest` 库) 与 Vercel Blob 已全部移除，依赖从 `package.json` 删除。
- `lib/db/{mongodb,models,utils}.ts`、`lib/blob.ts`、`app/api/{test,seed,upload,files,delete}/*`、`app/api/admin/collections/*`、`app/blob-demo`、`components/{FileUpload,FileManager}.tsx`、`app/admin/collections/*` 全部删除。
- 历史 `participants: string[]` / `tags: string[]` 字段被新模型替代：同学用 `classmates uuid[]`，标签暂未启用。
