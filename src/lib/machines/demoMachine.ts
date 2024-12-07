import { setup, assign, assertEvent } from "xstate";
import { syntheticStudentActor } from '../actors/syntheticStudentActor';
import { SYNTHETIC_STUDENT_SYSTEM_MESSAGE } from '../store/demoStore';

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
    isLoadingSynthetic: boolean;
    syntheticResponses?: Array<{
      name: string;
      response: string;
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

export const mergeSortMilestones: Milestone[] = [
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

const getRandomLevel = (levels: number[]) => 
  levels[Math.floor(Math.random() * levels.length)];

const generateStudentTraits = () => {
  // Define possible levels for each trait
  const correctnessLevels = [1, 3];
  const concisenessLevels = [1, 2, 3];
  const typingPersonalityLevels = [1, 2, 3];
  const attentionLevels = [1, 2, 3];
  const comprehensionLevels = [2, 3]; // Only 2 and 3 for comprehension

  // Generate random levels
  const traits = {
    correctness: getRandomLevel(correctnessLevels),
    conciseness: getRandomLevel(concisenessLevels),
    typingPersonality: getRandomLevel(typingPersonalityLevels),
    attention: getRandomLevel(attentionLevels),
    comprehension: getRandomLevel(comprehensionLevels),
  };

  // Randomly select one trait to be dominant
  const allTraits = ['correctness', 'conciseness', 'typingPersonality', 'attention', 'comprehension'] as const;
  const dominantTrait = allTraits[Math.floor(Math.random() * allTraits.length)];

  return { ...traits, dominantTrait };
};

const formatTraits = (traits: ReturnType<typeof generateStudentTraits>) => `
- correctness: Level ${traits.correctness}
- conciseness: Level ${traits.conciseness}
- typingPersonality: Level ${traits.typingPersonality}
- attention: Level ${traits.attention}
- comprehension: Level ${traits.comprehension}
- dominantTrait: ${traits.dominantTrait}`;

export const demoMachine = setup({
  types: {
    context: {} as DemoContext,
    events: {} as DemoEvent,
    input: {} as unknown as void,
  },
  guards: {},
  delays: {},
  actors: {
    syntheticStudentActor,
  },
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
        streamingMessage: "",
        isLoadingSynthetic: false,
        syntheticResponses: undefined,
      })
    }),
    startLoadingSynthetic: assign({
      mergeSort: ({ context }) => {
        const currentMergeSort = context.mergeSort ?? {
          currentStep: 0,
          selectedResponses: [],
          milestones: mergeSortMilestones,
          messages: [],
          isStreaming: false,
          streamingMessage: "",
          isLoadingSynthetic: false,
        };
        
        return {
          ...currentMergeSort,
          isLoadingSynthetic: true,
        };
      }
    }),
    finishLoadingSynthetic: assign({
      mergeSort: ({ context }) => {
        const currentMergeSort = context.mergeSort ?? {
          currentStep: 0,
          selectedResponses: [],
          milestones: mergeSortMilestones,
          messages: [],
          isStreaming: false,
          streamingMessage: "",
          isLoadingSynthetic: false,
        };
        
        return {
          ...currentMergeSort,
          isLoadingSynthetic: false,
        };
      }
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
        streamingMessage: "",
        isLoadingSynthetic: false,
      };

      const existingMessages = currentMergeSort.messages ?? [];

      if (!currentMergeSort.isStreaming) {
        return {
          mergeSort: {
            ...currentMergeSort,
            messages: event.messages
          }
        };
      }

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
    })),
    prepareSyntheticStudentMessages: ({ context }) => {
      const chatMessages = context.mergeSort?.messages ?? [];
      
      // Create the initial system message
      const systemMessage = {
        role: "system" as const,
        content: SYNTHETIC_STUDENT_SYSTEM_MESSAGE + "\n\nNOTE: Previous student responses in this conversation were randomly selected from multiple synthetic student options. Do not let those choices influence your response generation.",
      };
      
      // Filter out any system messages from the chat history
      const chatHistory = chatMessages.filter(msg => msg.role !== "system");
      
      return {
        systemMessage: systemMessage.content,
        messages: [systemMessage, ...chatHistory]
      };
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
    mergeSort: {
      currentStep: 0,
      selectedResponses: [],
      milestones: mergeSortMilestones,
      messages: [],
      isStreaming: false,
      streamingMessage: "",
      isLoadingSynthetic: false,
      syntheticResponses: undefined,
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
      entry: "initializeMergeSort",
      after: {
        100: {
          target: "mergeSort",
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
      initial: "initializing",
      states: {
        initializing: {
          entry: "initializeMergeSort",
          always: "idle"
        },
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
              target: "preparingResponses",
              actions: "finishStreaming"
            }
          }
        },
        preparingResponses: {
          entry: "startLoadingSynthetic",
          invoke: {
            id: 'syntheticStudentResponses',
            src: 'syntheticStudentActor',
            input: ({ context }) => {
              const messages = context.mergeSort?.messages ?? [];
              const lastTutorMessage = messages
                .filter(msg => msg.role === "assistant")
                .pop()?.content ?? "";

              // Generate three different sets of traits
              const traits = [
                generateStudentTraits(),
                generateStudentTraits(),
                generateStudentTraits()
              ];

              // Create three separate requests
              const requests = traits.map(trait => ({
                systemMessage: SYNTHETIC_STUDENT_SYSTEM_MESSAGE,
                messages: [{
                  role: "user",
                  content: `Generate a response as if you are a synthetic student with the following traits:

${formatTraits(trait)}

The question is: ${lastTutorMessage}

Previous conversation:
${messages.map(msg => `${msg.persona}: ${msg.content}`).join('\n')}

Note: Generate only one response matching these traits. Include a name for the student that matches their traits.`
                }]
              }));

              return { requests };
            },
            onDone: {
              target: "idle",
              actions: [
                assign({
                  mergeSort: ({ context, event }) => {
                    // Ensure we have valid responses
                    const responses = Array.isArray(event.output) ? event.output : [];
                    const validResponses = responses
                      .filter(r => r?.name && r?.response)
                      .map(r => ({
                        name: r.name,
                        response: r.response
                      }));

                    if (validResponses.length === 0) {
                      console.error('No valid responses received:', event.output);
                    }

                    return {
                      ...context.mergeSort!,
                      syntheticResponses: validResponses,
                      isLoadingSynthetic: false,
                    };
                  }
                }),
              ],
            },
            onError: {
              target: "idle",
              actions: [
                ({ event }) => {
                  console.error('Failed to generate synthetic responses:', event.error);
                },
                assign({
                  mergeSort: ({ context }) => ({
                    ...context.mergeSort!,
                    isLoadingSynthetic: false,
                  }),
                }),
              ],
            },
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
