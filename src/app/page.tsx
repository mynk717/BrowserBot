'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('https://ui.chaicode.com');
  const [prompt, setPrompt] = useState('Locate the auth form and fill test data');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
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
      const json = await res.json();
      setResponse(json);
    } catch (err: unknown) {
    const error = err as Error;
    setError(error.message);
  } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center gap-6 p-10">
      <h1 className="text-2xl font-semibold">BrowserBot Demo</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <input
          className="border p-2 rounded"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Target URL"
        />
        <textarea
          className="border p-2 rounded"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Prompt"
          rows={3}
        />
        <button
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Running…' : 'Run BrowserBot'}
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      {response && (
        <pre className="w-full max-w-3xl overflow-x-auto bg-gray-100 p-4 rounded text-sm">
{JSON.stringify(response, null, 2)}
        </pre>
      )}
    </main>
  );
}
