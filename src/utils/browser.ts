import puppeteer, { Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

type Ctx = { browser: Browser };

export async function createBrowserContext(): Promise<Ctx> {
  const token = process.env.BROWSERLESS_TOKEN;
  if (token) {
    const ws = `wss://production-sfo.browserless.io?token=${token}`;
    const browser = await puppeteer.connect({ browserWSEndpoint: ws });
    return { browser };
  }
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
    defaultViewport: { width: 1280, height: 720 },
  });
  return { browser };
}
