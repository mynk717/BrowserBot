export const runtime = 'nodejs';
export const memory = 1024;
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';  // ← ONLY puppeteer-core

type AgentBody = { url: string; includeScreenshot?: boolean };

export async function POST(req: NextRequest) {
  let browser: any = null;
  let shotFilled: string | undefined;
  let shotSubmitted: string | undefined;

  try {
    const { url, includeScreenshot = false } = (await req.json()) as AgentBody;
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Use puppeteer with @sparticuz/chromium (no Playwright imports)
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      defaultViewport: { width: 1280, height: 720 }
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Navigate and fill form
    const signUpLinkSelector = 'a[href*="signup"]';
    await page.waitForSelector(signUpLinkSelector, { timeout: 10000 });
    await page.click(signUpLinkSelector);
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });

    await page.waitForSelector('input[placeholder*="full name"]', { timeout: 10000 });
    await page.type('input[placeholder*="full name"]', 'John Doe');
    await page.type('input[placeholder*="email address"]', 'testuser@example.com');  
    await page.type('input[placeholder*="password"]', 'Test@1234');

    if (includeScreenshot) {
      shotFilled = (await page.screenshot({ fullPage: true })).toString('base64');
    }

    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    if (includeScreenshot) {
      shotSubmitted = (await page.screenshot({ fullPage: true })).toString('base64');
    }

    await browser.close();

    return NextResponse.json({
      message: 'Agent navigated, filled form, and submitted successfully.',
      screenshotFilled: shotFilled,
      screenshotSubmitted: shotSubmitted,
      status: 'success'
    });

  } catch (err: unknown) {
    const error = err as Error;
    if (browser) await browser.close();
    return NextResponse.json(
      { error: error.message || 'Unknown error', status: 'failed' },
      { status: 500 }
    );
  }
}
