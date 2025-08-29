## BrowserBot

**BrowserBot** is an **AI-powered browser automation tool** that allows you to interact with any website programmatically using natural language prompts. It leverages a combination of **Puppeteer** for browser control and **OpenAI's GPT models** to dynamically generate navigation and interaction scripts based on the page content.

-----

## Features

  * **Universal Web Automation:** Navigate, fill forms, click buttons, and perform customized actions on any website using plain language prompts.
  * **AI-Powered Logic:** Uses **GPT-4o** to analyze webpage DOM and user instructions to generate tailored JavaScript instructions dynamically.
  * **Serverless & Scalable:** Designed to run using serverless functions on platforms like **Vercel**, utilizing **Browserless.io** for Chromium headless execution to avoid dependency issues.
  * **Flexible Prompting Interface:** Simple front-end for entering target URL and detailed task prompt with optional screenshot inclusion.
  * **Robust Error Handling:** Safe execution wrappers and JSON response enforcement ensure reliability even with complex navigation and site-specific variations.
  * **Multi-Step Interaction:** Supports steps including page navigation, form filling, submission, and post-submit verification with screenshots.

-----

## Setup Instructions

### Clone the Repository

```bash
git clone <your-repo-url>
cd BrowserBot
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a **.env.local** file with the following keys:

```text
OPENAI_API_KEY=your_openai_api_key
BROWSERLESS_TOKEN=your_browserless_token_optional
```

  * **OPENAI\_API\_KEY:** Your OpenAI API key (required).
  * **BROWSERLESS\_TOKEN:** (Optional) **Browserless.io** token to run headless Chromium remotely.

### Run Locally

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

-----

## Usage

1.  Enter the target website URL.
2.  Provide a detailed natural language prompt instructing the bot what to do.
3.  Optionally include screenshot capture after completion.
4.  Click **Run BrowserBot** to execute.

### Usage Tips

  * Write detailed, stepwise instructions in the prompt.
  * Mention all required clicks, navigations, and form field values explicitly.
  * Specify wait conditions if the page is dynamic or a single-page app.

-----

## Deployment

  * Deploy on **Vercel** or similar serverless platforms.
  * Add the environment variables in your deployment settings.
  * **Browserless.io** is recommended to handle headless Chrome in serverless.

-----

## How it Works

1.  The API route launches or connects to a headless **Chromium** instance.
2.  It navigates to the target URL.
3.  Captures DOM snapshot and optional screenshot.
4.  Sends context along with user prompt to **OpenAI GPT-4o**.
5.  Parses the returned JS instructions safely.
6.  Runs the instructions in the browser context.
7.  Waits for navigation or specified wait conditions.
8.  Takes final screenshots and returns results.

-----

## License

**MIT License**
