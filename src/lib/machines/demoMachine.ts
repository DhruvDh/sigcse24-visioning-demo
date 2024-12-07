import { setup, assign, assertEvent } from "xstate";

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
    messages: Message[];
    streamingMessage?: string;
    isStreaming: boolean;
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
  | { type: "UPDATE_SYSTEM_MESSAGE"; systemMessage: string }
  | { 
      type: "UPDATE_MESSAGES"; 
      messages: Message[];
    }
  | { type: "CHECK_MILESTONES" }
  | { type: "START_STREAMING" }
  | { type: "APPEND_TOKEN"; content: string }
  | { type: "FINISH_STREAMING" };

type Message = {
  id: number;
  role: "system" | "user" | "assistant";
  content: string;
  persona?: string;
};

const mergeSortMilestones: Milestone[] = [
  {
    id: "inefficiency_discovery",
    text: "Understanding Sorting Inefficiency",
    description:
      "Recognizing how comparison-based sorting becomes impractical as input size grows",
    isComplete: false,
  },
  {
    id: "splitting_insight",
    text: "Discovering Divide-and-Conquer",
    description:
      "Understanding how breaking the problem into smaller parts can help reduce complexity",
    isComplete: false,
  },
  {
    id: "merging_development",
    text: "Understanding Systematic Merging",
    description: "Discovering how to systematically combine sorted sequences",
    isComplete: false,
  },
  {
    id: "recursive_pattern",
    text: "Grasping Recursive Nature",
    description: "Understanding how the same process applies at each level",
    isComplete: false,
  },
  {
    id: "efficiency_analysis",
    text: "Comprehending Efficiency",
    description: "Understanding why merge sort achieves O(n log n) complexity",
    isComplete: false,
  },
];

export const demoMachine = setup({
  types: {
    context: {} as DemoContext,
    events: {} as DemoEvent,
    input: {} as unknown as void,
  },
  guards: {},
  delays: {},
  actors: {},
  actions: {
    setName: assign(({ event }) => {
      assertEvent(event, "SUBMIT_NAME");
      return { name: event.name };
    }),
    setTeachingResponse: assign(({ context, event }) => {
      assertEvent(event, "SUBMIT_TEACHING_RESPONSE");
      return {
        responses: {
          ...context.responses,
          teachLLMs: event.response,
        },
      };
    }),
    setSyntheticResponse: assign(({ context, event }) => {
      assertEvent(event, "SUBMIT_SYNTHETIC_RESPONSE");
      return {
        responses: {
          ...context.responses,
          syntheticStudents: event.response,
        },
      };
    }),
    initializeMergeSort: assign({
      mergeSort: () => ({
        currentStep: 0,
        selectedResponses: [],
        milestones: mergeSortMilestones,
        messages: [],
        isStreaming: false,
        streamingMessage: ""
      })
    }),
    sendResponsesToEndpoint: ({ context }) => {
      const isEmptyResponses =
        !context.responses.teachLLMs.trim() &&
        !context.responses.syntheticStudents.trim();

      if (isEmptyResponses || context.name === "Anon") return;

      void fetch("https://near-duck-52.deno.dev/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: context.name,
          responses: context.responses,
          timestamp: Date.now(),
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            console.error("Failed to store responses:", await response.text());
          }

          if (context.name !== "Anon") {
            const storageData = {
              name: context.name,
              responses: context.responses,
              timestamp: Date.now(),
            };
            localStorage.setItem(
              "previousResponses",
              JSON.stringify(storageData)
            );
            console.log("Stored in localStorage:", storageData);
          }
        })
        .catch((error) => {
          console.error("Error sending responses:", error);
        });
    },
    updateMessages: assign(({ context, event }) => {
      if (event.type !== "UPDATE_MESSAGES") return {};
      
      const currentMergeSort = context.mergeSort ?? {
        currentStep: 0,
        selectedResponses: [],
        milestones: mergeSortMilestones,
        messages: [],
        isStreaming: false,
        streamingMessage: ""
      };

      if (!currentMergeSort.isStreaming) {
        return {
          mergeSort: {
            ...currentMergeSort,
            messages: event.messages
          }
        };
      }

      const existingMessages = currentMergeSort.messages;
      const lastMessage = existingMessages[existingMessages.length - 1];
      const newToken = event.messages[event.messages.length - 1]?.content ?? "";
      
      if (!lastMessage || lastMessage.role !== "assistant") {
        return {
          mergeSort: {
            ...currentMergeSort,
            streamingMessage: newToken,
            messages: [
              ...existingMessages,
              {
                id: Date.now(),
                role: "assistant" as const,
                content: newToken,
                persona: "Tutor"
              }
            ]
          }
        };
      }

      const newContent = (currentMergeSort.streamingMessage ?? "") + newToken;

      return {
        mergeSort: {
          ...currentMergeSort,
          streamingMessage: newContent,
          messages: [
            ...existingMessages.slice(0, -1),
            {
              id: lastMessage.id,
              role: "assistant" as const,
              content: newContent,
              persona: "Tutor"
            }
          ]
        }
      };
    }),
    startStreaming: assign(({ context }) => ({
     mergeSort: {
        ...context.mergeSort!,
        isStreaming: true,
        streamingMessage: ""
      }
    })),
    finishStreaming: assign(({ context }) => ({
     mergeSort: {
        ...context.mergeSort!,
        isStreaming: false,
        streamingMessage: ""
      }
    }))
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
    mergeSort: {
      currentStep: 0,
      selectedResponses: [],
      milestones: mergeSortMilestones,
      messages: [],
      isStreaming: false,
      streamingMessage: ""
    }
  },
  states: {
    welcome: {
      on: {
        BEGIN: "nameInput",
        SUBMIT_NAME: {
          target: "quickContinue",
          actions: [
            "setName",
            assign(({ event }) => {
              if (event.type !== "SUBMIT_NAME" || !event.responses) return {};
              return {
                responses: event.responses
              };
            })
          ]
        },
      },
    },
    quickContinue: {
      after: {
        100: {
          target: "mergeSort"
        },
      },
    },
    nameInput: {
      on: {
        SUBMIT_NAME: {
          target: "teachingQuestion",
          actions: "setName",
        },
        SKIP_NAME: {
          target: "teachingQuestion",
          actions: assign({ name: "Anon" }),
        },
      },
    },
    teachingQuestion: {
      on: {
        SUBMIT_TEACHING_RESPONSE: {
          target: "thankYouTeaching",
          actions: "setTeachingResponse",
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
          actions: ["setSyntheticResponse", "sendResponsesToEndpoint"],
        },
      },
    },
    complete: {
      on: {
        CONTINUE: {
          target: "mergeSort",
          actions: "initializeMergeSort",
        },
      },
    },
    mergeSort: {
      entry: "initializeMergeSort",
      initial: "idle",
      states: {
        idle: {
          on: {
            START_STREAMING: "streaming",
            UPDATE_MESSAGES: {
              actions: "updateMessages"
            }
          }
        },
        streaming: {
          entry: "startStreaming",
          on: {
            UPDATE_MESSAGES: {
              actions: "updateMessages"
            },
            FINISH_STREAMING: {
              target: "idle",
              actions: "finishStreaming"
            }
          }
        }
      },
      on: {
        SELECT_RESPONSE: {
          actions: assign(({ context, event }) => {
            assertEvent(event, "SELECT_RESPONSE");
            if (!context.mergeSort) return {};
            return {
              mergeSort: {
                ...context.mergeSort,
                selectedResponses: [
                  ...context.mergeSort.selectedResponses,
                  {
                    persona: event.persona,
                    response: event.response,
                  },
                ],
                milestones: context.mergeSort.milestones.map((m) =>
                  m.id === event.milestoneId ? { ...m, isComplete: true } : m
                ),
              },
            };
          }),
        },
        UPDATE_SYSTEM_MESSAGE: {
          actions: assign(({ context, event }) => {
            assertEvent(event, "UPDATE_SYSTEM_MESSAGE");
            if (!context.mergeSort) return {};
            return {
              mergeSort: {
                ...context.mergeSort,
                systemMessage: event.systemMessage,
              },
            };
          }),
        },
        UPDATE_MESSAGES: {
          actions: "updateMessages"
        },
        CHECK_MILESTONES: {
          actions: assign(({ context }) => {
            if (!context.mergeSort) return {};
            const messages = context.mergeSort.messages;
            const lastMessage = messages[messages.length - 1];

            if (!lastMessage || lastMessage.role !== "assistant") return {};

            const milestoneMatch = lastMessage.content.match(
              /MILESTONE\[([\w_]+)\]/
            );
            if (!milestoneMatch) return {};

            const milestoneId = milestoneMatch[1];
            return {
              mergeSort: {
                ...context.mergeSort,
                milestones: context.mergeSort.milestones.map((m) =>
                  m.id === milestoneId ? { ...m, isComplete: true } : m
                ),
              },
            };
          }),
        },
      },
    },
  },
});

export type DemoMachineState = ReturnType<typeof demoMachine.transition>;
