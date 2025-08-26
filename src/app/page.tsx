'use client';

import { useState } from 'react';

type AgentResponse = {
  aiResponse?: string;
  screenshot?: string;
  error?: string;
  status: 'success' | 'failed';
};

export default function Home() {
  const [url, setUrl] = useState('https://ui.chaicode.com');
  const [prompt, setPrompt] = useState('Locate the auth form and fill test data');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, prompt })
      });
      const json: AgentResponse = await res.json();
      setResponse(json);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <h1 className="text-4xl font-bold mb-10 tracking-tight">BrowserBot Demo</h1>

      {/* card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white shadow-xl rounded-xl p-8 flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Target URL</label>
          <input
            className="border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Prompt</label>
          <textarea
            rows={3}
            className="border rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
        </div>

        <button
          className="bg-indigo-600 text-white font-medium py-3 rounded-md hover:bg-indigo-700 active:scale-95 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Running …' : 'Run BrowserBot'}
        </button>
      </form>

      {/* result */}
      {error && (
        <p className="mt-6 text-red-600 font-semibold">{error}</p>
      )}

      {response && (
        <pre className="mt-6 w-full max-w-3xl bg-gray-900 text-green-300 rounded-xl p-6 overflow-x-auto text-sm whitespace-pre-wrap">
{JSON.stringify(response, null, 2)}
        </pre>
      )}
    </main>
  );
}
