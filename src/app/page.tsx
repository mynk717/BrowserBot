'use client';

import { useState } from 'react';

type AgentResponse = {
  aiResponse?: string;
  screenshot?: string;
  error?: string;
  status: 'success' | 'failed';
};

export default function Home() {
  const [url,       setUrl]      = useState('https://ui.chaicode.com');
  const [prompt,    setPrompt]   = useState('Locate the auth form and fill test data');
  const [withShot,  setWithShot] = useState(true);
  const [loading,   setLoading]  = useState(false);
  const [response,  setResponse] = useState<AgentResponse | null>(null);
  const [error,     setError]    = useState<string | null>(null);
  const [tipsOpen,  setTipsOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      /* ── call the API route ─────────────────────────────── */
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, prompt, includeScreenshot: withShot }),
      });

      const text = await res.text();
      if (!res.headers.get('content-type')?.includes('application/json')) {
        throw new Error('API returned non-JSON response');
      }
      const json: AgentResponse = JSON.parse(text);

      if (!res.ok) throw new Error(json.error || 'Request failed');
      setResponse(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-white to-gray-700 px-4 py-12">
      <h1 className="text-4xl font-extrabold mb-10 bg-gradient-to-r from-black via-yellow-400 to-orange-500 bg-clip-text text-transparent">
        BrowserBot
      </h1>
{/* ── Prompt-tips accordion ───────────────────────────── */}
      <button
        onClick={() => setTipsOpen(!tipsOpen)}
        className="mb-4 text-sm text-indigo-700 underline"
      >
        {tipsOpen ? 'Hide prompt tips ▲' : 'Show prompt tips ▼'}
      </button>
      {tipsOpen && (
        <div className="w-full max-w-xl bg-white shadow rounded-md p-4 mb-6 text-sm text-gray-800">
          <p className="font-semibold mb-1">Write detailed, step-by-step prompts:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Mention menu clicks or buttons in order.</li>
            <li>Include wait conditions (e.g. “wait until URL contains /contact”).</li>
            <li>Specify exact field values to type.</li>
            <li>End with what proof you need (e.g. a screenshot).</li>
          </ul>
          <p className="mt-2 italic">
            Example: “Open Contact from header ▸ fill form ▸ submit ▸ screenshot
            confirmation banner.”
          </p>
        </div>
      )}
      {/* card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white shadow-xl rounded-xl p-8 flex flex-col gap-6"
      >
        {/* URL */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Target URL</label>
          <input
            className="border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </div>

        {/* Prompt */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Prompt</label>
          <textarea
            rows={3}
            className="border rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
        </div>

        {/* Screenshot toggle */}
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={withShot}
            onChange={e => setWithShot(e.target.checked)}
          />
          Include screenshot
        </label>

        <button
          className="bg-indigo-600 text-white font-medium py-3 rounded-md hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Running …' : 'Run BrowserBot'}
        </button>
      </form>

      {/* error */}
      {error && <p className="mt-6 text-red-600 font-semibold">{error}</p>}

      {/* AI reply */}
      {response?.aiResponse && (
        <div className="mt-8 w-full max-w-3xl bg-white rounded-xl p-6 shadow">
          <h2 className="text-lg font-semibold mb-2">AI response</h2>
          <p className="whitespace-pre-wrap">{response.aiResponse}</p>
        </div>
      )}

      {/* screenshot */}
      {response?.screenshot && (
        <div className="mt-8 w-full max-w-3xl">
          <h2 className="text-lg font-semibold mb-2 text-white">Screenshot</h2>
          <img
            src={`data:image/png;base64,${response.screenshot}`}
            alt="BrowserBot screenshot"
            className="w-full rounded shadow"
          />
        </div>
      )}
    </main>
  );
}
