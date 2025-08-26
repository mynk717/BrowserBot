import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { chromium } from 'playwright';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
interface AgentBody { url: string; prompt: string }
export async function POST(req: NextRequest) {
    let browser = null;
    let screenshotBase64: string | null = null;

    try {
        const { url, prompt } = await req.json();

        if (!url || !prompt) {
            return NextResponse.json({ error: 'URL and prompt are required' }, { status: 400 });
        }

        browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto(url);

        const screenshotBuffer = await page.screenshot({ fullPage: true });
        screenshotBase64 = screenshotBuffer.toString('base64');

        // Properly typed messages array
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: 'user',
                content: [
                    { 
                        type: 'text', 
                        text: `You are an AI assistant designed to automate browser tasks. Based on the current webpage screenshot, and the user's instruction, tell me what actions to perform next. Focus on identifying form fields, their labels, and the submit button. Provide a clear, actionable plan. Current instruction: "${prompt}"` 
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
            max_tokens: 1000,
        });

        // Properly access the response with null checking
        const aiMessage = chatCompletion.choices[0]?.message?.content || '';

        await browser.close();

        return NextResponse.json({
            aiResponse: aiMessage,
            screenshot: screenshotBase64,
            status: 'success'
        });

    } catch (error: any) {
        console.error('Error in agent API:', error);
        if (browser) {
            await browser.close();
        }
        return NextResponse.json({
            error: error.message || 'An unknown error occurred',
            aiResponse: null,
            initialScreenshot: screenshotBase64,
            status: 'failed',
        }, { status: 500 });
    }
}
