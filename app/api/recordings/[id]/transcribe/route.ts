/**
 * POST /api/recordings/[id]/transcribe
 *
 * Streams audio transcription via OpenRouter Nemotron Omni model.
 * Returns SSE (text/event-stream) with incremental transcription text.
 *
 * Body: { prompt?: string }  — optional extra context for the model
 */
import { NextResponse } from 'next/server';
import { getRecordingByIdOrNum } from '@/lib/db/recordings';
import { getSupabaseAdmin } from '@/lib/db/supabase';
import { getPublicUrl, BUCKET_RECORDINGS } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: 'OPENROUTER_API_KEY 未配置' },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;
    const recording = await getRecordingByIdOrNum(id);
    if (!recording) {
      return NextResponse.json({ error: '录音未找到' }, { status: 404 });
    }

    // Download audio from Supabase Storage
    const supabase = getSupabaseAdmin();
    const { data: audioData, error: dlError } = await supabase.storage
      .from(BUCKET_RECORDINGS)
      .download(recording.audio_path);

    if (dlError || !audioData) {
      console.error('Failed to download audio:', dlError);
      return NextResponse.json(
        { error: '无法下载音频文件' },
        { status: 500 }
      );
    }

    // Convert to base64
    const arrayBuffer = await audioData.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Determine audio format from path
    const ext = recording.audio_path.split('.').pop()?.toLowerCase() ?? 'wav';
    const formatMap: Record<string, string> = {
      wav: 'wav',
      mp3: 'mp3',
      mpeg: 'mp3',
      ogg: 'ogg',
      webm: 'webm',
      flac: 'flac',
      m4a: 'm4a',
      mp4: 'mp4',
      aac: 'aac',
    };
    const audioFormat = formatMap[ext] ?? 'wav';

    // Read optional prompt from request body
    let extraPrompt = '';
    try {
      const body = await request.json();
      extraPrompt = body.prompt ?? '';
    } catch {
      // no body
    }

    const systemPrompt = `你是一个专业的音频转写助手。你的任务是将用户提供的音频内容准确地转录为文字。
请注意以下几点：
1. 这些录音来自高中班级（安徽省青阳中学2019级2班），内容可能包含课堂、活动、日常对话等
2. 请尽量准确地转录音频中的语音内容
3. 使用中文进行转录（如果音频是中文的话）
4. 保持原始的口语表达风格，不需要修改语法或措辞
5. 适当标注说话人切换（如能辨别的话）
6. 如果音频中有明显的非语音内容（如音乐、噪音），可以用方括号标注${extraPrompt ? `\n7. 额外要求：${extraPrompt}` : ''}`;

    // Call OpenRouter with streaming
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://leaf.inon.space',
        'X-Title': 'Leaf2Forest',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        stream: true,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请转写以下音频中的内容。',
              },
              {
                type: 'input_audio',
                input_audio: {
                  data: base64,
                  format: audioFormat,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return NextResponse.json(
        { error: `AI 模型调用失败 (${response.status})`, detail: errorText },
        { status: 502 }
      );
    }

    if (!response.body) {
      return NextResponse.json(
        { error: '模型未返回流式响应' },
        { status: 502 }
      );
    }

    // Pipe the SSE stream back to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: '转写服务异常' },
      { status: 500 }
    );
  }
}
