import { FC, useState, useEffect } from "react";
import { clsx } from "clsx";
import { H4 } from "../../ui/Typography";
import { MarkdownContainer } from "../../ui/MarkdownContainer";
import { useLLMChat } from "../../../lib/hooks/useLLMChat";
import { useDemoStore } from "../../../lib/store/demoStore";
import { AnimatePresence } from "framer-motion";
import { MotionDiv } from "../../ui/Motion";
import {
  constructSystemMessage,
  fetchAndCache,
} from "../../../lib/utils/contentCache";
import { Spinner } from "../../ui/Spinner";
import { ErrorDialog } from '../../ui/ErrorDialog';

type DemoMessage = {
  id: number;
  role: "system" | "user" | "assistant";
  content: string;
  persona?: string;
};

type UpdateMessagesEvent = {
  type: "UPDATE_MESSAGES";
  messages: DemoMessage[];
};

interface OnboardingStep {
  id: number;
  title: string;
  content: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Here's an Interactive Demo",
    content:
      "Showcasing an instance of our interpretation of the questions for the future posed earlier.",
  },
  {
    id: 2,
    title: "How It Works",
    content:
      "This a conversational tutorial, with an LLM taught how to teach as a tutor. Instead of typing a response, you will choose one of many synthetic student responses we generate.",
  },
  {
    id: 3,
    title: "Why?",
    content:
      "We all have a picture of what types of students exist in our classroom. It would help to experience conversational tutoring as these types of students would experience it.",
  },
  {
    id: 4,
    title: "Ready to Begin",
    content: "Click on the student response below to start the demo.",
  },
];

const initialResponse = {
  id: 1,
  persona: "Ready Student",
  content: "I am ready, please begin",
};

const onboardingVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
} as const;

const GITHUB_BASE =
  "https://raw.githubusercontent.com/DhruvDh/mergesort-egui/refs/heads/main/src";

export const ChatArea: FC = () => {
  const { state, send } = useDemoStore();
  const [llmInstructions, setLlmInstructions] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<string | null>(null);
  const messages = state.context.mergeSort?.messages ?? [];
  const [isTyping, setIsTyping] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [direction, setDirection] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { sendMessage } = useLLMChat({
    onMessage: (content) => {
      const existingMessages = state.context.mergeSort?.messages ?? [];
      
      if (existingMessages.length === 0 || !state.context.mergeSort?.isStreaming) {
        // Start new message
        send({ type: "START_STREAMING" });
        send({
          type: "UPDATE_MESSAGES",
          messages: [
            ...existingMessages,
            {
              id: Date.now(),
              role: "assistant",
              content,
              persona: "Tutor",
            },
          ],
        });
      } else {
        // Append to existing message
        send({
          type: "UPDATE_MESSAGES",
          messages: [
            ...existingMessages.slice(0, -1),
            {
              id: existingMessages[existingMessages.length - 1].id,
              role: "assistant",
              content: (state.context.mergeSort?.streamingMessage ?? "") + content,
              persona: "Tutor",
            },
          ],
        });
      }
    },
    onComplete: () => {
      setIsTyping(false);
      send({ type: "FINISH_STREAMING" });
      send({ type: "CHECK_MILESTONES" });
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setIsTyping(false);
      send({ type: "FINISH_STREAMING" });
    },
  });

  const handleStudentResponse = async (content: string) => {
    if (isTyping) return;
    setIsTyping(true);
    setError(null);

    if (!llmInstructions || !lessonContent) {
      setError("System message not set - please try refreshing the page");
      setIsTyping(false);
      return;
    }

    const updatedMessages: DemoMessage[] = [
      ...(messages ?? []),
      {
        id: Date.now(),
        role: "user",
        content,
        persona: "Student"
      }
    ];

    send({
      type: "UPDATE_MESSAGES",
      messages: updatedMessages
    } as UpdateMessagesEvent);

    // Then send to API
    const systemMessage = constructSystemMessage(
      llmInstructions,
      lessonContent
    );
    const messageToSend: { role: "system" | "user" | "assistant"; content: string }[] = [
      {
        role: "system",
        content: systemMessage,
      },
      ...updatedMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
    ];

    try {
      await sendMessage(messageToSend);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      console.error('Failed to send message:', error);
      setError(errorMessage);
      setIsTyping(false);
    }
  };

  // Load content when component mounts
  useEffect(() => {
    const loadContent = async () => {
      try {
        const [instructions, lesson] = await Promise.all([
          fetchAndCache(`${GITHUB_BASE}/llmInstructions.md`, "llmInstructions"),
          fetchAndCache(`${GITHUB_BASE}/lessonContent.md`, "lessonContent"),
        ]);

        setLlmInstructions(instructions);
        setLessonContent(lesson);

        if (instructions && lesson) {
          const systemMessage = constructSystemMessage(instructions, lesson);
          send({
            type: "UPDATE_SYSTEM_MESSAGE",
            systemMessage,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load content';
        console.error('Error loading content:', error);
        setError(errorMessage);
      }
    };

    loadContent();
  }, [send]);

  // Add effect to handle machine state changes
  useEffect(() => {
    if (state.value === "complete") {
      // Handle completion
      setShowOnboarding(false);
    }
  }, [state.value]);

  const handleOnboardingNavigation = (dir: "prev" | "next") => {
    setDirection(dir === "next" ? 1 : -1);
    setOnboardingStep((prev) =>
      dir === "next"
        ? Math.min(prev + 1, onboardingSteps.length)
        : Math.max(prev - 1, 1)
    );
  };

  const syntheticResponses = state.context.mergeSort?.syntheticResponses;
  const isLoadingSynthetic = state.context.mergeSort?.isLoadingSynthetic ?? false;

  const handleSyntheticResponse = (response: string) => {
    if (isTyping) return;
    handleStudentResponse(response);
  };

  return (
    <div className="h-full flex flex-col">
      <ErrorDialog 
        error={error}
        onClose={() => setError(null)}
      />
      <AnimatePresence mode="wait" custom={direction}>
        {showOnboarding ? (
          <MotionDiv
            className="flex-1 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="max-w-2xl mx-auto">
              <MotionDiv
                key={onboardingStep}
                custom={direction}
                variants={onboardingVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg p-8 shadow-lg"
              >
                <H4 className="mb-4">
                  {onboardingSteps[onboardingStep - 1].title}
                </H4>
                <p className="mb-8">
                  {onboardingSteps[onboardingStep - 1].content}
                </p>

                <div className="flex justify-between">
                  <button
                    onClick={() => handleOnboardingNavigation("prev")}
                    disabled={onboardingStep === 1}
                    className={clsx(
                      "px-4 py-2 rounded",
                      "transition-colors duration-200",
                      onboardingStep === 1
                        ? "bg-gray-100 text-gray-400"
                        : "bg-gray-200 hover:bg-gray-300"
                    )}
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowOnboarding(false)}
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      Skip
                    </button>

                    {onboardingStep < onboardingSteps.length ? (
                      <button
                        onClick={() => handleOnboardingNavigation("next")}
                        className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowOnboarding(false)}
                        className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
                      >
                        Start
                      </button>
                    )}
                  </div>
                </div>
              </MotionDiv>
            </div>
          </MotionDiv>
        ) : (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-6"
          >
            <AnimatePresence>
              {messages.map((message, index) => (
                <MotionDiv
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={clsx(
                    "mb-4 max-w-3xl",
                    message.role === "assistant" ? "ml-0" : "ml-auto"
                  )}
                >
                  <div className={clsx(
                    "flex flex-col gap-1",
                    message.role === "assistant" ? "items-start" : "items-end"
                  )}>
                    <span className={clsx(
                      "text-xs font-sans text-muted/70",
                      message.role === "assistant" ? "ml-2" : "mr-2"
                    )}>
                      {message.role === "assistant" ? "Tutor" : message.persona || "You"}
                    </span>
                    
                    <div className={clsx(
                      "max-w-[85%] rounded-2xl px-6 py-4",
                      message.role === "assistant" 
                        ? "bg-slate-50 border border-slate-200" 
                        : "bg-[#C56646]/10border border-[#C56646]/20",
                      index === messages.length - 1 && "animate-fade-in"
                    )}>
                      <MarkdownContainer 
                        content={message.content}
                        variant="message"
                        className={clsx(
                          message.role === "assistant" 
                            ? "prose-slate prose-p:font-serif" 
                            : [
                                "prose-p:font-serif",
                                "!text-gray-800",
                                "[&_p]:text-gray-800",
                                "[&_*]:text-gray-800",
                                "prose-code:bg-[#C56646]/5"
                              ],
                          "whitespace-pre-wrap",
                          "prose-p:mb-4 prose-p:last:mb-0"
                        )}
                      />
                    </div>
                  </div>
                </MotionDiv>
              ))}
            </AnimatePresence>
          </MotionDiv>
        )}
      </AnimatePresence>

      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-t border-gray-200 p-6"
      >
        <div className="grid grid-cols-1 gap-4">
          {isLoadingSynthetic ? (
            <div className="flex items-center justify-center p-8">
              <Spinner className="w-8 h-8 text-primary" />
              <span className="ml-3 text-primary font-medium">
                Generating student responses...
              </span>
            </div>
          ) : syntheticResponses ? (
            <div className="grid grid-cols-1 gap-4">
              {syntheticResponses.map((response, index) => (
                <button
                  key={index}
                  onClick={() => handleSyntheticResponse(response.response)}
                  className={clsx(
                    "p-4 rounded-lg text-left",
                    "border border-gray-200",
                    "hover:border-primary hover:bg-primary/5",
                    "transition-colors duration-200"
                  )}
                  disabled={isTyping}
                >
                  <H4 className="text-primary mb-2">{response.name}</H4>
                  <MarkdownContainer
                    content={response.response}
                    className="prose-p:mb-0 prose-p:text-base"
                  />
                </button>
              ))}
            </div>
          ) : messages.length === 0 && (
            <button
              onClick={() => {
                setShowOnboarding(false);
                handleStudentResponse(initialResponse.content);
              }}
              className={clsx(
                "p-4 rounded-lg text-left",
                "border border-gray-200",
                "hover:border-primary hover:bg-primary/5",
                "transition-colors duration-200"
              )}
              disabled={isTyping}
            >
              <H4 className="text-primary mb-2">{initialResponse.persona}</H4>
              <MarkdownContainer
                content={initialResponse.content}
                className="prose-p:mb-0 prose-p:text-base"
              />
            </button>
          )}
        </div>
      </MotionDiv>
    </div>
  );
};
