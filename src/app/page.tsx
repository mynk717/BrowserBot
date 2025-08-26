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
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

    return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center pt-24 px-4">
      <h1 className="text-3xl font-bold mb-10">BrowserBot Demo</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white shadow-md rounded-lg p-6 flex flex-col gap-4"
      >
        <label className="text-sm font-medium">Target URL</label>
        <input
          className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />

        <label className="text-sm font-medium">Prompt</label>
        <textarea
          className="border rounded-md p-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />

        <button
          className="mt-2 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Running…' : 'Run BrowserBot'}
        </button>
      </form>

      {error && (
        <p className="mt-6 text-red-600 font-medium">{error}</p>
      )}

      {response && (
        <pre className="mt-6 w-full max-w-3xl overflow-x-auto bg-gray-200 rounded-lg p-4 text-sm">
{JSON.stringify(response, null, 2)}
        </pre>
      )}
    </main>
  );

}
