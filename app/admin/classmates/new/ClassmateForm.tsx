'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const INPUTS = [
  'name',
  'gender',
  'birth_date',
  'city',
  'qq',
  'wechat',
  'phone',
  'employer',
  'industry',
  'bachelor_university',
  'bachelor_major',
  'master_university',
  'master_major',
  'doctor_university',
  'doctor_major',
  'bio',
] as const;

type InputKey = (typeof INPUTS)[number];

const LABELS: Record<InputKey, string> = {
  name: '姓名',
  gender: '性别',
  birth_date: '出生日期',
  city: '所在城市',
  qq: 'QQ',
  wechat: '微信号',
  phone: '电话',
  employer: '工作单位',
  industry: '行业',
  bachelor_university: '本科院校',
  bachelor_major: '本科专业',
  master_university: '硕士院校',
  master_major: '硕士专业',
  doctor_university: '博士院校',
  doctor_major: '博士专业',
  bio: '简介',
};

const TEXT_AREA: InputKey[] = ['bio'];

export default function NewClassmateForm() {
  const router = useRouter();
  const [values, setValues] = useState<Record<InputKey, string>>(
    Object.fromEntries(INPUTS.map((k) => [k, ''])) as Record<InputKey, string>
  );
  const [avatar, setAvatar] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: InputKey, v: string) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.name.trim()) {
      setError('姓名必填');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      let avatar_path: string | undefined;
      if (avatar) {
        const fd = new FormData();
        fd.append('file', avatar);
        const up = await fetch('/api/images/upload', { method: 'POST', body: fd });
        const upJson = await up.json();
        if (!upJson.success) throw new Error(upJson.error ?? '头像上传失败');
        avatar_path = upJson.data.path;
      }
      const payload: Record<string, string | null> = { name: values.name };
      for (const k of INPUTS) {
        if (k === 'name') continue;
        const v = values[k].trim();
        if (v) payload[k] = v;
      }
      if (avatar_path) payload.avatar_path = avatar_path;

      const res = await fetch('/api/classmates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status !== 'success') throw new Error('保存失败');
      router.push('/admin/classmates');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {INPUTS.map((k) => (
        <Field key={k} label={LABELS[k]}>
          {TEXT_AREA.includes(k) ? (
            <textarea
              rows={3}
              value={values[k]}
              onChange={(e) => set(k, e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          ) : k === 'gender' ? (
            <select
              value={values[k]}
              onChange={(e) => set(k, e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">未填</option>
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </select>
          ) : k === 'birth_date' ? (
            <input
              type="date"
              value={values[k]}
              onChange={(e) => set(k, e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          ) : (
            <input
              type={k === 'qq' || k === 'phone' ? 'tel' : 'text'}
              value={values[k]}
              onChange={(e) => set(k, e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          )}
        </Field>
      ))}
      <Field label="头像（可选，jpg/png/webp/gif）">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
        />
      </Field>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? '保存中…' : '保存'}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
