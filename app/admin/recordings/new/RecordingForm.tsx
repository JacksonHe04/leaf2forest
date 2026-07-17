'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClassmateOption {
  id: string;
  name: string;
}

interface Props {
  classmates: ClassmateOption[];
}

export default function NewRecordingForm({ classmates }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [background, setBackground] = useState('');
  const [transcription, setTranscription] = useState('');
  const [location, setLocation] = useState('');
  const [classmateIds, setClassmateIds] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleClassmate(id: string) {
    setClassmateIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!audioFile) {
      setError('请选择音频文件');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // 1. upload audio
      const fd = new FormData();
      fd.append('file', audioFile);
      const up = await fetch('/api/recordings/upload', { method: 'POST', body: fd });
      const upJson = await up.json();
      if (!upJson.success) throw new Error(upJson.error ?? '上传失败');

      // 2. create recording row
      const create = await fetch('/api/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          date,
          time: time || null,
          description: description || null,
          background: background || null,
          transcription: transcription || null,
          location: location || null,
          audio_path: upJson.data.path,
          classmates: classmateIds,
        }),
      });
      const createJson = await create.json();
      if (createJson.status !== 'success') throw new Error('保存失败');
      router.push('/admin/recordings');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <Field label="标题">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="日期">
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </Field>
        <Field label="时间（可选）">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </Field>
      </div>
      <Field label="背景">
        <textarea
          rows={3}
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </Field>
      <Field label="描述">
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </Field>
      <Field label="文字转录">
        <textarea
          rows={6}
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </Field>
      <Field label="地点（可选）">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </Field>
      <Field label="音频文件（.wav / .mp3 / .m4a）">
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
          required
        />
      </Field>
      <Field label="关联同学">
        <div className="border rounded px-3 py-2 max-h-48 overflow-y-auto space-y-1">
          {classmates.length === 0 && <p className="text-sm text-gray-500">还没有同学，先去同学页添加。</p>}
          {classmates.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={classmateIds.includes(c.id)}
                onChange={() => toggleClassmate(c.id)}
              />
              {c.name}
            </label>
          ))}
        </div>
      </Field>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? '保存中…' : '保存'}
        </button>
      </div>
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
