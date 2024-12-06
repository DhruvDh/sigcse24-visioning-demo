import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-serif mb-4">404 - Page Not Found</h1>
        <p className="text-lg font-sans">The page you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    </div>
  );
} 