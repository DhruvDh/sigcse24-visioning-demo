'use client';

import { useEffect } from 'react';
import { Introduction } from '../components/demo/Introduction';
import { Complete } from '../components/demo/mergeSort/Complete';
import { MergeSortLayout } from '../components/demo/mergeSort/MergeSortLayout';
import { useDemoStore } from '../lib/store/demoStore';

export default function Home() {
  const { state, loadContent, isContentLoading } = useDemoStore();

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Helper function to determine which component to render
  const renderContent = () => {
    if (isContentLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin text-4xl">⟳</div>
        </div>
      );
    }

    // States handled by Introduction component
    if (
      state.matches('welcome') ||
      state.matches('nameInput') ||
      state.matches('teachingQuestion') ||
      state.matches('thankYouTeaching') ||
      state.matches('syntheticQuestion')
    ) {
      return <Introduction />;
    }

    // Complete state
    if (state.matches('complete')) {
      return <Complete />;
    }

    // MergeSort state
    if (state.matches('mergeSort')) {
      return <MergeSortLayout />;
    }

    // Fallback
    return <Introduction />;
  };

  return (
    <main className="min-h-screen bg-white">
      {renderContent()}
    </main>
  );
}
