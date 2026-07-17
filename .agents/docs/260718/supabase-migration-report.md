# Supabase 迁移完成报告（260718）

## 结论
数据后端从 MongoDB + Vercel Blob 完整迁移至 Supabase（Postgres + Storage）。
- `pnpm build`：✅ 通过（TypeScript + 所有路由/页面）
- `pnpm dev` + 实际 HTTP 请求：✅ `/`、`/admin`、`/api/health`、`/api/classmates`、`/api/recordings`、`/api/storage/list` 全部 200
- `scripts/seed-recordings.mjs --limit=3`：✅ 三个 wav 已上传到 `recordings` 桶 + 三条 `recordings` 表行已写入，并能通过 `/api/recordings` 回查

## 关键设计点
1. **两表**：`classmates`（同学，含三阶段学历/专业/城市/性别/出生日期/QQ/微信/电话/工作单位/行业）+ `recordings`（date+time/title/description/transcription/background/location/audio_path/classmates uuid[]）
2. **两桶**：`recordings`（公开，原子化音频）+ `images`（公开，图床/头像）
3. **不用 RLS**：按你的指示"数据可公开"—— service role 直连更省事
4. **不用中间表**：录音直接 `classmates uuid[]`
5. **history 文件名日期解析**：从文件名末尾 8 位 `yyyymmdd` 推断；无法解析的 fallback 到今天

## 文件变更
**新增**：
- `lib/env.ts`（含 bare `.env.local` 行兼容）
- `lib/storage.ts`（替代 `lib/blob.ts`）
- `lib/db/{supabase,types,recordings,classmates}.ts`
- `app/api/classmates`、`app/api/recordings`、`app/api/health`、`app/api/storage/{list,delete}`、`app/api/images/upload`、`app/api/recordings/upload`
- `app/admin/{recordings,classmates}` + `[id]/edit` 路由 + `new` 表单
- `scripts/seed-recordings.mjs`
- `README.md`、`.env.example`

**删除**：
- `lib/blob.ts`、`lib/db/{mongodb,models,utils}.ts`、`lib/utils.ts`
- `app/api/{test,seed,upload,files,delete}/*`
- `app/api/admin/collections/*`、`app/admin/collections/*`
- `app/blob-demo/*`、`components/{FileUpload,FileManager}.tsx`
- 依赖：`mongodb`、`@vercel/blob`（保留/加：`@supabase/supabase-js@2.110.7`）

## 数据灌入
```bash
node scripts/seed-recordings.mjs               # 全量 214 个 wav
node scripts/seed-recordings.mjs --limit=5    # 试 5 个
node scripts/seed-recordings.mjs --dry-run    # 只读列表
```
脚本幂等（按 storage object name 跳过），DB 行不去重——重灌请先 `truncate` recordings。

## 已知/遗留
- `app/admin/{recordings,classmates}/[id]/edit`：当前是只读视图，inline 编辑表单留待后续
- `lib/env.ts` 的兼容代码只为兼容现有 `.env.local` 的裸值格式；建议下次改成像 `.env.example` 那样的 `KEY=value` 形式
- 数据公开桶未启用 RLS（按你的指示）
