"use client";

export default function GlobalError({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl font-serif mb-4">Something went wrong!</h1>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-sans"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}