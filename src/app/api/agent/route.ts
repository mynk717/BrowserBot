import { NextRequest, NextResponse } from 'next/server';
import { createBrowserContext } from '@/utils/browser';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const memory = 1024;
export const maxDuration = 60;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { url, prompt, includeScreenshot = false } = await req.json();

  if (!url || !prompt) {
    return NextResponse.json(
      { status: 'failed', error: 'url & prompt are required' },
      { status: 400 },
    );
  }

  const { browser } = await createBrowserContext();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });

    const dom = await page.content();
    const shot = includeScreenshot
      ? await page.screenshot({ encoding: 'base64' })
      : undefined;

    /* ── LLM prompt ── */
    const system = `You are an autonomous browser agent.
Return strict JSON: {"js":"<code>","explanation":"<text>"}`;
    const user = `DOM:\n${dom.slice(0, 20000)}\n${shot ? 'SCREENSHOT:' + shot.slice(0, 100) + '…' : ''}\nTASK: "${prompt}"`;
const userPrompt = `
DOM:
${dom.slice(0, 20_000)}              /* truncated to keep prompt small */
${shot ? `SCREENSHOT_BASE64:${shot.slice(0, 100)}…` : ''}
TASK: "${prompt}"
`;
    /* ── 3️⃣ ask GPT-4o what JS to run ───────────────────────── */
const chat = await openai.chat.completions.create({
  model: 'gpt-4o',
  response_format: { type: 'json_object' },   // ← forces valid JSON
  messages: [
    {
      role: 'system',
      content:
        'You are an autonomous browser agent. ' +
        'Return ONLY valid JSON shaped exactly as ' +
        '{"js":"<code>","explanation":"<text>"} — no extra keys, no prose.',
    },
    { role: 'user', content: userPrompt },
  ],
  temperature: 0.2,
});


    let plan: any = {};
    try {
      plan = JSON.parse(chat.choices[0].message.content || '{}');
    } catch {
      return NextResponse.json(
        { status: 'failed', error: 'LLM response was not JSON' },
        { status: 500 },
      );
    }
    if (!plan.js) {
      return NextResponse.json(
        { status: 'failed', error: 'LLM response missing "js"' },
        { status: 500 },
      );
    }

    /* ── execute GPT’s script safely ──────────────────────────── */
await page.evaluate(`
  try {
    ${plan.js}
  } catch (err) {
    console.error('GPT script error:', err?.message);
  }
`);
await Promise.all([
  page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15_000 }).catch(() => {}),
  page.evaluate(`
    try {
      ${plan.js}
    } catch (err) {
      console.error('GPT script error:', err?.message);
    }
  `),
]);


    const finalShot = includeScreenshot
      ? await page.screenshot({ encoding: 'base64' })
      : undefined;

    return NextResponse.json({
      status: 'success',
      aiResponse: plan.explanation || 'Executed GPT instructions',
      screenshot: finalShot,
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'failed', error: err.message },
      { status: 500 },
    );
  } finally {
    await browser.close();
  }
}
