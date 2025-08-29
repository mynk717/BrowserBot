/*
  Advanced route.ts for a smarter BrowserBot.
  This version will:
  1. Navigate to the homepage.
  2. Find and click the "Sign Up" link to get to the form.
  3. Identify form fields using robust, semantic selectors (not just IDs).
  4. Fill the form and proceed as before.
*/
export const runtime = 'nodejs';
export const memory = 1024;
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

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

    // Launch the browser
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
      defaultViewport: { width: 1280, height: 720 }
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // --- Start of Smarter Automation ---

    // 1. **Navigate to the Sign Up form automatically.**
    // We'll look for a link that contains the text "Sign Up" and click it.
    // This is more robust than hard-coding the URL.
    console.log('Searching for the "Sign Up" link...');
    // 1. **Navigate to the Sign Up form automatically using a standard CSS selector.**
// This looks for any link `<a>` that has a `href` attribute containing "signup".
console.log('Searching for a link to the sign-up page...');
const signUpLinkSelector = 'a[href*="signup"]';
await page.waitForSelector(signUpLinkSelector, { timeout: 10000 });
await page.click(signUpLinkSelector);
console.log('Clicked sign-up link. Waiting for navigation...');

    console.log('Clicked "Sign Up" link. Waiting for navigation...');

    // Wait for the URL to change to the sign-up page or for a form element to appear
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    console.log('Navigated to the sign-up page.');

    // 2. **Fill the form using robust, semantic selectors.**
    // Instead of relying on `id`, we'll look for inputs with `placeholder` text or `name` attributes.
    // This is much more likely to work across different websites.
    console.log('Filling the form...');
    await page.waitForSelector('input[placeholder*="full name"]', { timeout: 10000 });
    await page.type('input[placeholder*="full name"]', 'John Doe');

    await page.waitForSelector('input[placeholder*="email address"]', { timeout: 5000 });
    await page.type('input[placeholder*="email address"]', 'testuser@example.com');

    await page.waitForSelector('input[placeholder*="password"]', { timeout: 5000 });
    await page.type('input[placeholder*="password"]', 'Test@1234');

    // 3. Take the "before submit" screenshot
    if (includeScreenshot) {
      shotFilled = (await page.screenshot({ fullPage: true })).toString('base64');
    }

    // 4. Click the submit button
    await page.click('button[type="submit"]');

    // Wait for 2 seconds
    await page.waitForTimeout(2000);

    // 5. Take the "after submit" screenshot
    if (includeScreenshot) {
      shotSubmitted = (await page.screenshot({ fullPage: true })).toString('base64');
    }

    // --- End of Smarter Automation ---

    await browser.close();

    return NextResponse.json({
      message: 'Agent navigated to sign-up, filled form, and submitted.',
      screenshotFilled: shotFilled,
      screenshotSubmitted: shotSubmitted,
      status: 'success'
    });

  } catch (err: unknown) {
    const error = err as Error;
    console.error('An error occurred:', error); // Log the full error for debugging
    if (browser) await browser.close();
    return NextResponse.json(
      { error: error.message || 'Unknown error', status: 'failed' },
      { status: 500 }
    );
  }
}
