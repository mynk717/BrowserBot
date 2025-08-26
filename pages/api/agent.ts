import type { NextApiRequest, NextApiResponse } from 'next';
import { chromium } from 'playwright';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt, targetUrl } = req.body;

  if (!prompt || !targetUrl) {
    return res.status(400).json({ error: 'prompt and targetUrl required' });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(targetUrl);

    // Take screenshot as base64
    const screenshotBuffer = await page.screenshot({ type: 'png' });
const screenshotBase64 = screenshotBuffer.toString('base64');


    // Call OpenAI Chat Completion with prompt and screenshot
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an AI that helps fill out forms by analyzing webpage screenshots.',
        },
        {
          role: 'user',
          content: `Analyze this base64 screenshot and suggest steps to locate the form fields and submit button: ${screenshotBase64}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const aiMessage = completion.choices[0]?.message?.content;

    // TODO: parse AI response and implement Playwright actions for filling form based on AI instructions

    await browser.close();

    return res.status(200).json({
      message: 'Agent ran successfully',
      aiResponse: aiMessage,
    });
  } catch (error: any) {
    await browser.close();
    return res.status(500).json({ error: error?.message || 'Unknown error' });
  }
}
