import { FC } from "react";
import { H3, H4, Subtle } from "../../ui/Typography";
import { clsx } from "clsx";
import { useDemoStore } from "../../../lib/store/demoStore";

export const MilestonesPanel: FC = () => {
  const milestones = useDemoStore(state => state.state.context.mergeSort?.milestones ?? []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <H3 className="mb-6">Learning Progress</H3>
        <div className="space-y-3">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className={clsx(
                "p-3 rounded-lg",
                "border border-gray-200",
                "transition-colors duration-200",
                milestone.isComplete
                  ? "bg-primary/10 border-primary/20"
                  : "bg-white"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={clsx(
                    "w-4 h-4 rounded-full mt-1",
                    "border-2",
                    milestone.isComplete
                      ? "bg-primary border-primary"
                      : "border-gray-300"
                  )}
                />
                <div className="flex-1">
                  <Subtle
                    className={clsx(
                      "font-medium text-sm",
                      milestone.isComplete && "text-primary"
                    )}
                  >
                    {milestone.isComplete 
                      ? milestone.text
                      : `Milestone ${String.fromCharCode(65 + index)}`}
                  </Subtle>
                  {milestone.isComplete && (
                    <>
                      <p className="text-sm text-gray-600 mt-1">
                        {milestone.description}
                      </p>
                      <div className="text-xs text-primary/80 mt-2">
                        ✓ Understanding verified
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 