import { setup } from "xstate";

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
    milestones: Array<{
      id: number;
      text: string;
      isComplete: boolean;
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
      milestoneId: number;
    }
  | {
      type: "UPDATE_OPTIONS";
      newOptions: Array<{ persona: string; response: string }>;
    };

export const demoMachine = setup({
  types: {
    context: {} as DemoContext,
    events: {} as DemoEvent,
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
        milestones: [
          { id: 1, text: "Understanding the divide step", isComplete: false },
          { id: 2, text: "Understanding the merge step", isComplete: false },
          { id: 3, text: "Grasping recursive nature", isComplete: false },
          { id: 4, text: "Analyzing time complexity", isComplete: false },
        ],
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
    updateMilestones: ({ context }, event: { milestoneId: number }) => {
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
      },
    },
  },
});

export type DemoMachineState = ReturnType<typeof demoMachine.transition>;
