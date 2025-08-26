// src/app/error.tsx   (App Router convention)
'use client';

export default function GlobalError({ error }: { error: Error }) {
  return (
    <html>
      <body style={{ padding: 32, fontFamily: 'monospace', color: 'red' }}>
        <h1>💥 Browser error</h1>
        <pre>{error.message}</pre>
        <pre>{error.stack}</pre>
      </body>
    </html>
  );
}
