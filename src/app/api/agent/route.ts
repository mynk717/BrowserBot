export const runtime     = 'nodejs';
export const memory      = 1024;
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

type AgentBody = { url: string; prompt: string };

export async function POST(req: NextRequest) {
  let browser: Awaited<ReturnType<import('playwright-core').BrowserType['launch']>> | null = null;
  let screenshotBase64: string | null = null;

  try {
    const { url, prompt } = (await req.json()) as AgentBody;
    if (!url || !prompt) {
      return NextResponse.json({ error: 'URL and prompt are required' }, { status: 400 });
    }

    const { chromium } = await import('playwright-core');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    const buffer = await page.screenshot({ fullPage: true });
    screenshotBase64 = buffer.toString('base64');

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: `You are an AI assistant. Current instruction: "${prompt}"` },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${screenshotBase64}` } }
        ]
      }
    ];

    const reply = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1_000
    });

    await browser.close();

    return NextResponse.json({
      aiResponse: reply.choices[0]?.message?.content ?? '',
      screenshot: screenshotBase64,
      status: 'success'
    });
  } catch (err: unknown) {
    const error = err as Error;
    if (browser) await browser.close();
    return NextResponse.json(
      { error: error.message || 'Unknown error', initialScreenshot: screenshotBase64, status: 'failed' },
      { status: 500 }
    );
  }
}
