"use client";

import { useEffect } from "react";
import { Introduction } from "../components/demo/Introduction";
import { Complete } from "../components/demo/mergeSort/Complete";
import { MergeSortLayout } from "../components/demo/mergeSort/MergeSortLayout";
import { useDemoStore } from "../lib/store/demoStore";
import type { StateValue as XStateValue } from "xstate";

// Add type for state values
type StateValue =
  | "welcome"
  | "nameInput"
  | "teachingQuestion"
  | "thankYouTeaching"
  | "syntheticQuestion"
  | "complete"
  | "mergeSort";

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

    // Properly typed state matching
    const matches = (value: StateValue) =>
      state.matches(value);

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
