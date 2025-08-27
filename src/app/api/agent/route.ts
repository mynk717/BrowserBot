/* ------------------------------------------------------------------
   app/api/agent/route.ts
   ------------------------------------------------------------------ */
export const runtime     = 'nodejs';
export const memory      = 1024;
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

type AgentBody = {
  url: string;
  prompt: string;
  includeScreenshot?: boolean;
};

export async function POST(req: NextRequest) {
  let browser: Awaited<ReturnType<import('playwright-core').BrowserType['launch']>> | null = null;
  let screenshotBase64: string | undefined;

  try {
    /* ---------- 1. read body ---------- */
    const { url, prompt, includeScreenshot = false } =
      (await req.json()) as AgentBody;
    if (!url || !prompt) {
      return NextResponse.json({ error: 'url and prompt required' }, { status: 400 });
    }

    /* ---------- 2. browse + screenshot ---------- */
    const { chromium } = await import('playwright-core');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });

    if (includeScreenshot) {
      const buf = await page.screenshot({ fullPage: true });
      screenshotBase64 = buf.toString('base64');
    }

    /* ---------- 3. OpenAI call ---------- */
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: `You are an AI assistant. Current instruction: "${prompt}"`,
      },
    ];

    /* ❶ vision input now goes into tool_choice */
    const reply = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1_000,
      
    } as any);                      // ❷ cast: until types catch up

    /* ---------- 4. respond ---------- */
    return NextResponse.json(
      {
        aiResponse: reply.choices[0]?.message?.content ?? '',
        screenshot: screenshotBase64,   // undefined unless requested
        status: 'success',
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: (err as Error).message || 'unknown error',
        screenshot: screenshotBase64,
        status: 'failed',
      },
      { status: 500 },
    );
  } finally {
    if (browser) await browser.close();
  }
}
