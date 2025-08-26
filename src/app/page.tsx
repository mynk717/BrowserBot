'use client';

import { useState } from 'react';
import Image from 'next/image';

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
    const [prompt, setPrompt] = useState('Locate the authentication form automatically, fill in the necessary details, and click the submit button.');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<ApiResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const res = await fetch('/api/agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url, prompt }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Something went wrong');
            }

            const data: ApiResponse = await res.json();
            setResponse(data);
            console.log('Agent Response:', data);

        } catch (err: any) {
            setError(err.message);
            console.error('Frontend Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 text-blue-700">
                    🤖 BrowserBot AI Agent
                </h1>

                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="mb-4">
                        <label htmlFor="url" className="block text-gray-700 text-sm font-bold mb-2">
                            Target URL:
                        </label>
                        <input
                            type="url"
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="e.g., https://ui.chaicode.com"
                            required
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label htmlFor="prompt" className="block text-gray-700 text-sm font-bold mb-2">
                            Agent Instruction:
                        </label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24 resize-vertical"
                            placeholder="Describe what you want the bot to do..."
                            required
                        />
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Running Agent...
                                </span>
                            ) : (
                                '🚀 Run BrowserBot'
                            )}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8" role="alert">
                        <div className="flex">
                            <div className="py-1">
                                <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                                </svg>
                            </div>
                            <div>
                                <p className="font-bold">Error occurred!</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {response && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Agent Results</h2>
                            <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                                response.status === 'success' 
                                    ? 'bg-green-100 text-green-800' 
                                    : response.status === 'partial_success'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {response.status === 'success' ? '✅ Success' : 
                                 response.status === 'partial_success' ? '⚠️ Partial Success' : 
                                 '❌ Failed'}
                            </span>
                        </div>

                        {/* AI Analysis */}
                        {response.aiResponse && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                <h3 className="text-lg font-semibold mb-2 text-blue-800">
                                    🧠 AI Analysis & Plan
                                </h3>
                                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                    {response.aiResponse}
                                </p>
                            </div>
                        )}

                        {/* Execution Log */}
                        {response.executionLog && response.executionLog.length > 0 && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                    📋 Execution Log
                                </h3>
                                <div className="space-y-2 font-mono text-sm">
                                    {response.executionLog.map((log: string, index: number) => (
                                        <div 
                                            key={index} 
                                            className={`p-2 rounded ${
                                                log.includes('❌') || log.includes('Failed') 
                                                    ? 'bg-red-100 text-red-700' 
                                                    : 'bg-green-100 text-green-700'
                                            }`}
                                        >
                                            {log}
                                        </div>
                                    ))}
                                </div>
                                {response.actionsExecuted && (
                                    <p className="mt-3 text-sm text-gray-600">
                                        Total actions executed: {response.actionsExecuted}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Success Analysis */}
                        {response.successAnalysis && (
                            <div className="mb-6 p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                                <h3 className="text-lg font-semibold mb-2 text-emerald-800">
                                    🎯 AI Success Analysis
                                </h3>
                                <p className="text-gray-800">{response.successAnalysis}</p>
                            </div>
                        )}

                        {/* Screenshots */}
                        <div className="space-y-6">
                            {/* Initial Screenshot */}
                            {(response.screenshot || response.initialScreenshot) && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                        📸 Initial Page Screenshot
                                    </h3>
                                    <div className="border rounded-lg overflow-hidden shadow-sm">
                                        <Image
                                            src={`data:image/jpeg;base64,${response.screenshot || response.initialScreenshot}`}
                                            alt="Initial page screenshot"
                                            width={800}
                                            height={600}
                                            className="w-full h-auto"
                                            style={{ maxHeight: '500px', objectFit: 'contain' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Intermediate Screenshots */}
                            {response.intermediateScreenshots && response.intermediateScreenshots.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                        🎬 Action Progress Screenshots
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {response.intermediateScreenshots.map((screenshot: string, index: number) => (
                                            <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
                                                <div className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600">
                                                    After action {index + 1}
                                                </div>
                                                <Image
                                                    src={`data:image/jpeg;base64,${screenshot}`}
                                                    alt={`Screenshot after action ${index + 1}`}
                                                    width={400}
                                                    height={300}
                                                    className="w-full h-auto"
                                                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Final Screenshot */}
                            {response.finalScreenshot && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                        🏁 Final Result Screenshot
                                    </h3>
                                    <div className="border rounded-lg overflow-hidden shadow-sm">
                                        <Image
                                            src={`data:image/jpeg;base64,${response.finalScreenshot}`}
                                            alt="Final page screenshot"
                                            width={800}
                                            height={600}
                                            className="w-full h-auto"
                                            style={{ maxHeight: '500px', objectFit: 'contain' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
