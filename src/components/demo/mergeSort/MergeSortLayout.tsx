import { FC } from "react";
import { MilestonesPanel } from "./MilestonesPanel";
import { ChatArea } from "./ChatArea";

export const MergeSortLayout: FC = () => {
  return (
    <div className="flex h-screen">
      <aside className="w-[320px] border-r border-gray-200 bg-gray-50 p-4">
        <MilestonesPanel />
      </aside>
      <main className="flex-1 overflow-hidden">
        <ChatArea />
      </main>
    </div>
  );
};
