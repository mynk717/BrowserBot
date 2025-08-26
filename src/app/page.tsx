'use client';

import { useState } from 'react';
import Image from 'next/image';

// ---------- API response shape ----------
interface ApiResponse {
  aiResponse?: string;
  screenshot?: string;
  initialScreenshot?: string;
  finalScreenshot?: string;
  intermediateScreenshots?: string[];
  executionLog?: string[];
  successAnalysis?: string;
  status: 'success' | 'failed' | 'partial_success';
  actionsExecuted?: number;
  error?: string;
}

export default function Home() {
  const [url, setUrl] = useState('https://ui.chaicode.com');
  const [prompt, setPrompt] = useState(
    'Locate the authentication form automatically, fill in the necessary details, and click the submit button.',
  );
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ---------------- form submit ----------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, prompt }),
      });

      if (!res.ok) {
        const { error: msg } = (await res.json()) as { error?: string };
        throw new Error(msg || 'Request failed');
      }

      const data = (await res.json()) as ApiResponse;  // ✅ typed
      setResponse(data);
      console.log('Agent Response:', data);
    } catch (error) {
      const err = error as Error;                      // ✅ no-explicit-any
      setError(err.message);
      console.error('Frontend Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // -------------- JSX below (unchanged) -------------
  return (
    /* … your existing JSX … */
    <div />
  );
}
