/**
 * POST /api/recordings/[id]/transcribe
 *
 * Transcribes audio via Volcengine (豆包) ASR API.
 * Two-step flow: submit audio URL → poll for result → stream text via SSE.
 *
 * Body: {} (no parameters needed)
 */
import { NextResponse } from 'next/server';
import { getRecordingByIdOrNum } from '@/lib/db/recordings';
import { getPublicUrl, BUCKET_RECORDINGS } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const VOLC_API_KEY = process.env.VOLC_ASR_API_KEY;
const VOLC_RESOURCE_ID = process.env.VOLC_ASR_RESOURCE_ID ?? 'volc.seedasr.auc';
const VOLC_SUBMIT_URL = 'https://openspeech.bytedance.com/api/v3/auc/bigmodel/submit';
const VOLC_QUERY_URL = 'https://openspeech.bytedance.com/api/v3/auc/bigmodel/query';

/** Detect audio format from file path extension. */
function detectFormat(audioPath: string): string {
  const ext = audioPath.split('.').pop()?.toLowerCase() ?? 'mp3';
  const map: Record<string, string> = {
    wav: 'wav', mp3: 'mp3', mpeg: 'mp3', ogg: 'ogg',
    webm: 'webm', flac: 'flac', m4a: 'm4a', mp4: 'mp4', aac: 'aac',
  };
  return map[ext] ?? 'mp3';
}

/** Sleep helper. */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build an SSE chunk that sends incremental text to the client.
 * The client parses `data: {"text":"..."}` and appends to the textarea.
 */
function sseText(text: string): string {
  return `data: ${JSON.stringify({ text })}\n\n`;
}

function sseDone(): string {
  return `data: [DONE]\n\n`;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!VOLC_API_KEY) {
    return NextResponse.json(
      { error: 'VOLC_ASR_API_KEY 未配置' },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;
    const recording = await getRecordingByIdOrNum(id);
    if (!recording) {
      return NextResponse.json({ error: '录音未找到' }, { status: 404 });
    }

    const audioUrl = getPublicUrl(BUCKET_RECORDINGS, recording.audio_path);
    const audioFormat = detectFormat(recording.audio_path);
    const requestId = crypto.randomUUID();

    // Step 1: Submit audio to Volcengine ASR
    const submitRes = await fetch(VOLC_SUBMIT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': VOLC_API_KEY,
        'X-Api-Resource-Id': VOLC_RESOURCE_ID,
        'X-Api-Request-Id': requestId,
        'X-Api-Sequence': '-1',
      },
      body: JSON.stringify({
        user: { uid: 'Leaf2Forest' },
        audio: {
          url: audioUrl,
          format: audioFormat,
          codec: 'raw',
          rate: 16000,
          bits: 16,
          channel: 1,
        },
        request: {
          model_name: 'bigmodel',
          enable_itn: true,
          enable_punc: true,
          enable_ddc: false,
          enable_speaker_info: false,
          enable_channel_split: false,
          show_utterances: false,
          vad_segment: false,
          sensitive_words_filter: '',
        },
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      console.error('Volcengine submit failed:', submitRes.status, errText);
      return NextResponse.json(
        { error: `语音识别提交失败 (${submitRes.status})` },
        { status: 502 }
      );
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial "processing" status
          controller.enqueue(
            encoder.encode(sseText(''))
          );

          // Step 2: Poll for result
          let fullText = '';
          const maxAttempts = 30; // 30 × 1.5s = 45s max

          for (let i = 0; i < maxAttempts; i++) {
            await sleep(1500);

            const queryRes = await fetch(VOLC_QUERY_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': VOLC_API_KEY,
                'X-Api-Resource-Id': VOLC_RESOURCE_ID,
                'X-Api-Request-Id': requestId,
              },
              body: JSON.stringify({}),
            });

            if (!queryRes.ok) {
              console.error('Volcengine query failed:', queryRes.status);
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ error: '查询结果失败' })}\n\n`)
              );
              break;
            }

            const queryData = await queryRes.json();
            const statusMsg = queryRes.headers.get('x-api-message') ?? '';

            if (statusMsg.includes('Processing')) {
              // Still processing, send a dot to show progress
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ progress: '.' })}\n\n`)
              );
              continue;
            }

            // Got result
            fullText = queryData.result?.text ?? '';

            if (!fullText) {
              controller.enqueue(
                encoder.encode(sseText('（未能识别出文字内容）'))
              );
              break;
            }

            // Stream text character by character for the "typing" effect
            // Group by ~3 chars for a natural feel
            const chunkSize = 3;
            for (let j = 0; j < fullText.length; j += chunkSize) {
              const chunk = fullText.slice(0, j + chunkSize);
              controller.enqueue(encoder.encode(sseText(chunk)));
              await sleep(30); // 30ms between chunks for visible typing
            }

            break;
          }

          controller.enqueue(encoder.encode(sseDone()));
          controller.close();
        } catch (err) {
          console.error('SSE stream error:', err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: '转写流异常' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
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
