import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { chromium } from 'playwright';

// ----------------- types -----------------
type AgentBody = { url: string; prompt: string };   // now used

export async function POST(req: NextRequest) {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  let screenshotBase64: string | null = null;

  try {
    // --- safely parse body -----------------
    const { url, prompt } = (await req.json()) as AgentBody;

    if (!url || !prompt) {
      return NextResponse.json(
        { error: 'URL and prompt are required' },
        { status: 400 },
      );
    }

    // --- main logic (unchanged) ------------
    browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const screenshotBuffer = await page.screenshot({ fullPage: true });
    screenshotBase64 = screenshotBuffer.toString('base64');

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are an AI assistant… Current instruction: "${prompt}"`,
          },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${screenshotBase64}` },
          },
        ],
      },
    ];

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages,
      max_tokens: 1_000,
    });

    const aiMessage = chatCompletion.choices[0]?.message?.content ?? '';

    await browser.close();

    return NextResponse.json({
      aiResponse: aiMessage,
      screenshot: screenshotBase64,
      status: 'success',
    });
  } catch (error) {
    const err = error as Error;                       // ✅ no-explicit-any
    console.error('Error in agent API:', err);

    if (browser) await browser.close();

    return NextResponse.json(
      {
        error: err.message || 'Unknown error',
        aiResponse: null,
        initialScreenshot: screenshotBase64,
        status: 'failed',
      },
      { status: 500 },
    );
  }
}
