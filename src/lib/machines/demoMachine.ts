import { setup } from "xstate";

type Milestone = {
  id: string;
  text: string;
  description: string;
  isComplete: boolean;
};

type DemoContext = {
  name: string;
  responses: {
    teachLLMs: string;
    syntheticStudents: string;
  };
  mergeSort?: {
    currentStep: number;
    selectedResponses: Array<{
      persona: string;
      response: string;
    }>;
    milestones: Milestone[];
    systemMessage?: string;
    messages: Array<{
      id: number;
      role: "system" | "user" | "assistant";
      content: string;
      persona?: string;
    }>;
  };
};

type DemoEvent =
  | { type: "BEGIN" }
  | { 
      type: "SUBMIT_NAME"; 
      name: string;
      responses?: {
        teachLLMs: string;
        syntheticStudents: string;
      };
    }
  | { type: "SKIP_NAME" }
  | { type: "SUBMIT_TEACHING_RESPONSE"; response: string }
  | { type: "SUBMIT_SYNTHETIC_RESPONSE"; response: string }
  | { type: "CONTINUE" }
  | {
      type: "SELECT_RESPONSE";
      persona: string;
      response: string;
      milestoneId: string;
    }
  | {
      type: "UPDATE_OPTIONS";
      newOptions: Array<{ persona: string; response: string }>;
    }
  | {
      type: "UPDATE_SYSTEM_MESSAGE";
      systemMessage: string;
    }
  | {
      type: "UPDATE_MESSAGES";
      messages: Array<{
        id: number;
        role: "system" | "user" | "assistant";
        content: string;
        persona?: string;
      }>;
    }
  | { type: "CHECK_MILESTONES" };

const mergeSortMilestones: Milestone[] = [
  {
    id: 'inefficiency_discovery',
    text: 'Understanding Sorting Inefficiency',
    description: 'Recognizing how comparison-based sorting becomes impractical as input size grows',
    isComplete: false
  },
  {
    id: 'splitting_insight',
    text: 'Discovering Divide-and-Conquer',
    description: 'Understanding how breaking the problem into smaller parts can help reduce complexity',
    isComplete: false
  },
  {
    id: 'merging_development',
    text: 'Understanding Systematic Merging',
    description: 'Discovering how to systematically combine sorted sequences',
    isComplete: false
  },
  {
    id: 'recursive_pattern',
    text: 'Grasping Recursive Nature',
    description: 'Understanding how the same process applies at each level',
    isComplete: false
  },
  {
    id: 'efficiency_analysis',
    text: 'Comprehending Efficiency',
    description: 'Understanding why merge sort achieves O(n log n) complexity',
    isComplete: false
  }
];

// Add state type definition
type DemoStates = {
  welcome: {};
  nameInput: {};
  teachingQuestion: {};
  thankYouTeaching: {};
  syntheticQuestion: {};
  complete: {};
  mergeSort: {};
};

export const demoMachine = setup({
  types: {
    context: {} as DemoContext,
    events: {} as DemoEvent,
    // Add states type
    states: {} as DemoStates,
  },
  actions: {
    setName: ({ context }, event: { name: string }) => {
      context.name = event.name;
    },
    setTeachingResponse: ({ context }, event: { response: string }) => {
      context.responses.teachLLMs = event.response;
    },
    setSyntheticResponse: ({ context }, event: { response: string }) => {
      context.responses.syntheticStudents = event.response;
    },
    initializeMergeSort: ({ context }) => {
      context.mergeSort = {
        currentStep: 0,
        selectedResponses: [],
        milestones: mergeSortMilestones,
        messages: [],
      };
    },
    addSelectedResponse: (
      { context },
      event: { persona: string; response: string }
    ) => {
      if (context.mergeSort) {
        context.mergeSort.selectedResponses.push({
          persona: event.persona,
          response: event.response,
        });
      }
    },
    updateMilestones: ({ context }, event: { milestoneId: string }) => {
      if (context.mergeSort) {
        const milestone = context.mergeSort.milestones.find(
          (m) => m.id === event.milestoneId
        );
        if (milestone) {
          milestone.isComplete = true;
        }
      }
    },
    sendResponsesToEndpoint: async ({ context }) => {
      const isEmptyResponses = 
        !context.responses.teachLLMs.trim() && 
        !context.responses.syntheticStudents.trim();
      
      if (isEmptyResponses || context.name === "Anon") {
        return;
      }

      try {
        const response = await fetch('https://near-duck-52.deno.dev/responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: context.name,
            responses: context.responses,
            timestamp: Date.now()
          })
        });

        if (!response.ok) {
          console.error('Failed to store responses:', await response.text());
        }
        
        if (context.name !== "Anon") {
          const storageData = {
            name: context.name,
            responses: context.responses,
            timestamp: Date.now()
          };
          localStorage.setItem('previousResponses', JSON.stringify(storageData));
          console.log('Stored in localStorage:', storageData);
        }
      } catch (error) {
        console.error('Error sending responses:', error);
      }
    },
    updateSystemMessage: ({ context }, { systemMessage }: { systemMessage: string }) => {
      if (context.mergeSort) {
        context.mergeSort.systemMessage = systemMessage;
      }
    },
    updateMessages: ({ context }, { messages }) => {
      if (context.mergeSort) {
        context.mergeSort.messages = messages;
      }
    },
    checkMilestones: ({ context }) => {
      if (!context.mergeSort) return;
      
      const lastMessage = context.mergeSort.messages[context.mergeSort.messages.length - 1];
      if (!lastMessage || lastMessage.role !== 'assistant') return;

      // Check for milestone markers
      const milestoneMatch = lastMessage.content.match(/MILESTONE\[([\w_]+)\]/);
      if (milestoneMatch) {
        const milestoneId = milestoneMatch[1];
        const milestone = context.mergeSort.milestones.find(m => m.id === milestoneId);
        if (milestone) {
          milestone.isComplete = true;
        }
      }
    }
  },
}).createMachine({
  id: "demo",
  initial: "welcome",
  context: {
    name: "",
    responses: {
      teachLLMs: "",
      syntheticStudents: "",
    },
  },
  states: {
    welcome: {
      on: {
        BEGIN: "nameInput",
        SUBMIT_NAME: {
          target: "quickContinue",
          actions: [
            {
              type: "setName",
              params: ({ event }) => ({ name: event.name }),
            },
          ],
        },
      },
    },
    quickContinue: {
      entry: [
        ({ context, event }) => {
          if (event.type === "SUBMIT_NAME" && event.responses) {
            context.responses = event.responses;
          }
        },
      ],
      after: {
        100: {
          target: "mergeSort",
          actions: [{ type: "initializeMergeSort" }]
        },
      },
    },
    nameInput: {
      on: {
        SUBMIT_NAME: {
          target: "teachingQuestion",
          actions: [
            {
              type: "setName",
              params: ({ event }) => ({ name: event.name }),
            },
          ],
        },
        SKIP_NAME: {
          target: "teachingQuestion",
          actions: [
            {
              type: "setName",
              params: () => ({ name: "Anon" }),
            },
          ],
        },
      },
    },
    teachingQuestion: {
      on: {
        SUBMIT_TEACHING_RESPONSE: {
          target: "thankYouTeaching",
          actions: [
            {
              type: "setTeachingResponse",
              params: ({ event }) => ({ response: event.response }),
            },
          ],
        },
      },
    },
    thankYouTeaching: {
      after: {
        1500: "syntheticQuestion",
      },
    },
    syntheticQuestion: {
      on: {
        SUBMIT_SYNTHETIC_RESPONSE: {
          target: "complete",
          actions: [
            {
              type: "setSyntheticResponse",
              params: ({ event }) => ({ response: event.response }),
            },
            { type: "sendResponsesToEndpoint" }
          ],
        },
      },
    },
    complete: {
      on: {
        CONTINUE: {
          target: "mergeSort",
          actions: [{ type: "initializeMergeSort" }],
        },
      },
    },
    mergeSort: {
      entry: [
        ({ context }) => {
          if (!context.mergeSort) {
            context.mergeSort = {
              currentStep: 0,
              selectedResponses: [],
              milestones: mergeSortMilestones,
              messages: [],
            };
          }
        }
      ],
      on: {
        SELECT_RESPONSE: {
          actions: [
            {
              type: "addSelectedResponse",
              params: ({ event }) => ({
                persona: event.persona,
                response: event.response,
              }),
            },
            {
              type: "updateMilestones",
              params: ({ event }) => ({
                milestoneId: event.milestoneId,
              }),
            },
          ],
        },
        UPDATE_OPTIONS: {
          // Handle updating available response options
        },
        UPDATE_SYSTEM_MESSAGE: {
          actions: [{ 
            type: "updateSystemMessage",
            params: ({ event }) => ({ systemMessage: event.systemMessage })
          }]
        },
        UPDATE_MESSAGES: {
          actions: [{ 
            type: "updateMessages",
            params: ({ event }) => ({ messages: event.messages })
          }]
        },
        CHECK_MILESTONES: {
          actions: "checkMilestones"
        }
      },
    },
  },
});

export type DemoMachineState = ReturnType<typeof demoMachine.transition>;
