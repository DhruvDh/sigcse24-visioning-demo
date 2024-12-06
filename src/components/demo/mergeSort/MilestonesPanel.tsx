import { FC } from "react";
import { H3, Subtle } from "../../ui/Typography";
import { clsx } from "clsx";

type Milestone = {
  id: number;
  text: string;
  isComplete: boolean;
};

// Temporary mock data - will be moved to state management
const mockMilestones: Milestone[] = [
  {
    id: 1,
    text: "Understanding the divide step",
    isComplete: false,
  },
  {
    id: 2,
    text: "Grasping recursive division",
    isComplete: false,
  },
  {
    id: 3,
    text: "Comprehending the merge process",
    isComplete: false,
  },
  {
    id: 4,
    text: "Analyzing time complexity",
    isComplete: false,
  },
];

export const MilestonesPanel: FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <H3 className="mb-6">Learning Milestones</H3>
        <div className="space-y-4">
          {mockMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className={clsx(
                "p-4 rounded-lg",
                "border border-gray-200",
                "transition-colors duration-200",
                milestone.isComplete
                  ? "bg-primary/10 border-primary/20"
                  : "bg-white"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    "w-5 h-5 rounded-full",
                    "border-2",
                    milestone.isComplete
                      ? "bg-primary border-primary"
                      : "border-gray-300"
                  )}
                />
                <span
                  className={clsx(
                    "font-medium",
                    milestone.isComplete && "text-primary"
                  )}
                >
                  {milestone.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <Subtle className="font-medium mb-2">Other Interpretations</Subtle>
        <p className="text-sm text-gray-600">
          See how different students approach these concepts.
        </p>
      </div>
    </div>
  );
}; 