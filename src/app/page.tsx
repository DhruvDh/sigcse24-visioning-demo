"use client";

import { useEffect } from "react";
import { Introduction } from "../components/demo/Introduction";
import { Complete } from "../components/demo/mergeSort/Complete";
import { MergeSortLayout } from "../components/demo/mergeSort/MergeSortLayout";
import { useDemoStore } from "../lib/store/demoStore";

// Define the state schema type that matches your machine's states
type DemoStateValue = {
  welcome: object;
  nameInput: object;
  teachingQuestion: object;
  thankYouTeaching: object;
  syntheticQuestion: object;
  complete: object;
  mergeSort: { active: object };
};

// Simplified state value type for matching
type StateValue = keyof DemoStateValue;

export default function Home() {
  const { state, loadContent, isContentLoading } = useDemoStore();

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  console.log('Current state:', state.value);
  console.log('Current context:', state.context);

  // Helper function to determine which component to render
  const renderContent = () => {
    if (isContentLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin text-4xl">⟳</div>
        </div>
      );
    }

    // Type-safe state matching that handles compound states
    const matches = (value: StateValue): boolean => {
      if (typeof state.value === 'string') {
        return state.value === value;
      }
      // Handle compound states
      return value in state.value;
    };

    console.log('Matches mergeSort:', matches("mergeSort"));

    // States handled by Introduction component
    if (
      matches("welcome") ||
      matches("nameInput") ||
      matches("teachingQuestion") ||
      matches("thankYouTeaching") ||
      matches("syntheticQuestion")
    ) {
      return <Introduction />;
    }

    // Complete state
    if (matches("complete")) {
      return <Complete />;
    }

    // MergeSort state
    if (matches("mergeSort")) {
      return <MergeSortLayout />;
    }

    // Fallback
    return <Introduction />;
  };

  return <main className="min-h-screen bg-white">{renderContent()}</main>;
}
