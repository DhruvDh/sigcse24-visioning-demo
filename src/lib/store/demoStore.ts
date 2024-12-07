import { create } from "zustand";
import { createActor, StateFrom, EventFromLogic } from "xstate";
import { demoMachine } from "../machines/demoMachine";
import { fetchAndCache } from "../utils/contentCache";

type DemoMachineState = StateFrom<typeof demoMachine>;
type DemoEvent = EventFromLogic<typeof demoMachine>;

interface DemoStore {
  state: DemoMachineState;
  send: (event: DemoEvent) => void;
  llmInstructions: string | null;
  lessonContent: string | null;
  systemMessage: string | null;
  isContentLoading: boolean;
  loadContent: () => Promise<void>;
  updateMilestone: (milestoneId: string) => void;
}

const GITHUB_BASE = "https://raw.githubusercontent.com/DhruvDh/mergesort-egui/refs/heads/main/src";

export const useDemoStore = create<DemoStore>((set) => {
  const actor = createActor(demoMachine, {
    systemId: 'demo-system'
  });

  actor.subscribe((state) => {
    set((store) => ({ ...store, state }));
  });

  actor.start();

  const constructSystemMessage = (instructions: string, lesson: string): string => {
    return String.raw`${instructions}`.replace('{{LESSON_CONTENT}}', String.raw`${lesson}`);
  };

  return {
    state: actor.getSnapshot(),
    send: (event) => actor.send(event),
    llmInstructions: null,
    lessonContent: null,
    systemMessage: null,
    isContentLoading: false,
    loadContent: async () => {
      set({ isContentLoading: true });
      
      try {
        const [instructions, lesson] = await Promise.all([
          fetchAndCache(
            `${GITHUB_BASE}/mergesort-instructions.md`,
            'llmInstructions'
          ),
          fetchAndCache(
            `${GITHUB_BASE}/mergesort-lesson.md`,
            'lessonContent'
          )
        ]);

        const rawInstructions = String.raw`${instructions}`;
        const rawLesson = String.raw`${lesson}`;
        
        const systemMessage = constructSystemMessage(rawInstructions, rawLesson);

        set({
          llmInstructions: rawInstructions,
          lessonContent: rawLesson,
          systemMessage,
          isContentLoading: false
        });
      } catch (error) {
        console.error('Error loading content:', error);
        set({ isContentLoading: false });
      }
    },
    updateMilestone: (milestoneId: string) => {
      set(state => {
        const mergeSort = state.state.context.mergeSort;
        if (!mergeSort) return state;

        const updatedMilestones = mergeSort.milestones.map(milestone => 
          milestone.id === milestoneId 
            ? { ...milestone, isComplete: true }
            : milestone
        );

        return {
          ...state,
          state: {
            ...state.state,
            context: {
              ...state.state.context,
              mergeSort: {
                ...mergeSort,
                milestones: updatedMilestones
              }
            }
          }
        };
      });
    }
  };
});
