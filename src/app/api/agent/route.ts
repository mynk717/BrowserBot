// src/app/api/agent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { chromium } from 'playwright';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    let browser = null;
    
    try {
        const { url, prompt } = await req.json();
        
        if (!url || !prompt) {
            return NextResponse.json({ error: 'URL and prompt are required' }, { status: 400 });
        }

        // Your existing Playwright + OpenAI logic here
        browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto(url);
        
        const screenshotBuffer = await page.screenshot({ fullPage: true });
        const screenshotBase64 = screenshotBuffer.toString('base64');

        // OpenAI Vision API call (your existing code)
        const messages = [/* your message structure */];
        const chatCompletion = await openai.chat.completions.create({
            model: 'gpt-4-vision-preview',
            messages,
            max_tokens: 1000,
        });

        await browser.close();

        return NextResponse.json({
            aiResponse: chatCompletion.choices[0]?.message?.content,
            screenshot: screenshotBase64,
            status: 'success'
        });

    } catch (error: any) {
        if (browser) await browser.close();
        return NextResponse.json({
            error: error.message || 'An unknown error occurred',
            status: 'failed'
        }, { status: 500 });
    }
}
