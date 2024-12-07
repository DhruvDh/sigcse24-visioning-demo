import { useState, useEffect } from "react";
import { H1, BodyLarge } from "../ui/Typography";
import { useDemoStore } from "../../lib/store/demoStore";
import { clsx } from "clsx";
import { MotionDiv, containerAnimation, itemAnimation } from "../ui/Motion";
import { AnimatePresence } from "framer-motion";

type DemoState =
  | "welcome"
  | "nameInput"
  | "teachingQuestion"
  | "thankYouTeaching"
  | "syntheticQuestion"
  | "complete"
  | "mergeSort";

const isDemoState = (state: string): state is DemoState => {
  return [
    "welcome",
    "nameInput",
    "teachingQuestion",
    "thankYouTeaching",
    "syntheticQuestion",
    "complete",
    "mergeSort",
  ].includes(state);
};

export const ArrowIcon = () => (
  <svg
    className="ml-2 inline-block"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.75 6.75L19.25 12L13.75 17.25"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 12H4.75"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SadFaceIcon = () => <span className="ml-2 inline-block text-lg">:(</span>;

type SubmitNameEvent = {
  type: "SUBMIT_NAME";
  name: string;
  responses?: {
    teachLLMs: string;
    syntheticStudents: string;
  };
};

type SubmitResponseEvent = {
  type: "SUBMIT_TEACHING_RESPONSE" | "SUBMIT_SYNTHETIC_RESPONSE";
  response: string;
};

export const Introduction = () => {
  const [name, setName] = useState("");
  const [teachingResponse, setTeachingResponse] = useState("");
  const [syntheticResponse, setSyntheticResponse] = useState("");
  const [previousSession, setPreviousSession] = useState<{
    name: string;
    responses: {
      teachLLMs: string;
      syntheticStudents: string;
    };
    timestamp: number;
  } | null>(null);
  const { state, send } = useDemoStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("previousResponses");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setPreviousSession(parsed);
        } else {
          localStorage.removeItem("previousResponses");
        }
      } catch (e) {
        console.error("Error parsing stored responses:", e);
        localStorage.removeItem("previousResponses");
      }
    }
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleContinue();
    }
  };

  const handleBegin = () => {
    send({ type: "BEGIN" });
  };

  const handleSubmitName = () => {
    let formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    if (formattedName.trim() === "") {
      formattedName = "Anon";
    }

    send({
      type: "SUBMIT_NAME",
      name: formattedName || "Anon",
    } as SubmitNameEvent);
  };

  const handleSubmitTeaching = () => {
    send({
      type: "SUBMIT_TEACHING_RESPONSE",
      response: teachingResponse,
    } as SubmitResponseEvent);
  };

  const handleSubmitSynthetic = () => {
    setIsSubmitting(true);
    send({
      type: "SUBMIT_SYNTHETIC_RESPONSE",
      response: syntheticResponse,
    });
  };

  const handleSkip = () => {
    const currentState =
      typeof state.value === "string"
        ? state.value
        : Object.keys(state.value)[0];

    if (!isDemoState(currentState)) return;

    switch (currentState) {
      case "nameInput":
        send({ type: "SKIP_NAME" });
        break;
      case "teachingQuestion":
        send({
          type: "SUBMIT_TEACHING_RESPONSE",
          response: "",
        });
        break;
      case "syntheticQuestion":
        setIsSubmitting(true);
        send({
          type: "SUBMIT_SYNTHETIC_RESPONSE",
          response: "",
        });
        break;
    }
  };

  const handleContinue = () => {
    const currentState =
      typeof state.value === "string"
        ? state.value
        : Object.keys(state.value)[0];

    if (!isDemoState(currentState)) return;

    switch (currentState) {
      case "nameInput":
        handleSubmitName();
        break;
      case "teachingQuestion":
        handleSubmitTeaching();
        break;
      case "syntheticQuestion":
        handleSubmitSynthetic();
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <MotionDiv
        className="w-full max-w-4xl mx-auto p-8 md:p-12 lg:p-16"
        {...containerAnimation}
      >
        <AnimatePresence mode="wait">
          {state.matches("welcome") && (
            <MotionDiv
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <H1 className="text-8xl md:text-9xl lg:text-[10rem] mb-4 font-serif tracking-tight text-[#1F2937]">
                Welcome!
              </H1>
              <div className="text-2xl md:text-3xl mb-12">
                <span className="text-slate-500 italic font-sans">
                  To a concise visioning activity.
                </span>
              </div>
              <BodyLarge className="text-foreground max-w-3xl mb-16">
                We encourage and invite interpretations of two questions for the
                future. Click &ldquo;Let&apos;s go!&rdquo; to begin.
              </BodyLarge>
            </MotionDiv>
          )}

          {state.matches("nameInput") && (
            <MotionDiv
              key="nameInput"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <H1 className="text-4xl md:text-5xl lg:text-6xl mb-8 font-serif">
                First, would you like to introduce yourself?
              </H1>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your name..."
                className={clsx(
                  "w-full max-w-lg px-8 py-5 text-xl mb-12",
                  "border-2 border-primary rounded-lg",
                  "font-serif placeholder-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "transition-all duration-200",
                  "bg-background"
                )}
              />
            </MotionDiv>
          )}

          {state.matches("greetingName") && state.context.name && (
            <MotionDiv
              key="greeting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <H1 className="text-4xl md:text-5xl lg:text-6xl mb-4 font-serif">
                Hi, {state.context.name}!
              </H1>
            </MotionDiv>
          )}

          {state.matches("teachingQuestion") && (
            <MotionDiv
              key="teaching"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <H1 className="text-4xl md:text-5xl lg:text-6xl mb-8 font-serif">
                &ldquo;Teaching LLMs how to Teach&rdquo; <br />
                <br />
                <span className="text-2xl md:text-3xl lg:text-4xl font-serif">
                  What is your interpretation of this?
                </span>
              </H1>
              <textarea
                value={teachingResponse}
                onChange={(e) => setTeachingResponse(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts..."
                className={clsx(
                  "w-full px-8 py-5 text-xl mb-12",
                  "border-2 border-primary rounded-lg",
                  "font-serif placeholder-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "transition-all duration-200",
                  "bg-background",
                  "min-h-[200px] resize-none"
                )}
              />
            </MotionDiv>
          )}

          {state.matches("thankYouTeaching") && (
            <MotionDiv
              key="thankYou"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <H1 className="text-4xl md:text-5xl lg:text-6xl mb-4 font-serif">
                Thank you for sharing your thoughts!
              </H1>
            </MotionDiv>
          )}

          {state.matches("syntheticQuestion") && (
            <MotionDiv
              key="synthetic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <H1 className="text-4xl md:text-5xl lg:text-6xl mb-8 font-serif">
                &ldquo;Synthetic Students&rdquo; <br />
                <br />
                <span className="text-2xl md:text-3xl lg:text-4xl font-serif">
                  What is your interpretation of this? How do you envision their
                  use?
                </span>
              </H1>
              <textarea
                value={syntheticResponse}
                onChange={(e) => setSyntheticResponse(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts..."
                className={clsx(
                  "w-full px-8 py-5 text-xl mb-12",
                  "border-2 border-primary rounded-lg",
                  "font-serif placeholder-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "transition-all duration-200",
                  "bg-background",
                  "min-h-[200px] resize-none"
                )}
              />
            </MotionDiv>
          )}

          {state.matches("complete") && (
            <MotionDiv
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <H1 className="text-4xl md:text-5xl lg:text-6xl mb-4 font-serif">
                Thank you for completing the activity!
              </H1>
            </MotionDiv>
          )}
        </AnimatePresence>

        <MotionDiv
          className="mt-8 flex justify-end"
          {...itemAnimation}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {state.value === "welcome" ? (
            <div className="flex items-center gap-4">
              {previousSession && (
                <button
                  onClick={() => {
                    send({
                      type: "SUBMIT_NAME",
                      name: previousSession.name,
                      responses: previousSession.responses,
                    });
                  }}
                  className={clsx(
                    "px-4 py-2 rounded",
                    "bg-gray-100 text-gray-600",
                    "hover:bg-gray-200",
                    "transition-colors duration-200"
                  )}
                >
                  Continue as {previousSession.name}
                </button>
              )}
              <button
                onClick={handleBegin}
                className={clsx(
                  "px-4 py-2 rounded",
                  "bg-primary text-white",
                  "hover:bg-primary/90",
                  "transition-colors duration-200",
                  "flex items-center"
                )}
              >
                Let&apos;s go! <ArrowIcon />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={handleSkip}
                className={clsx(
                  "px-4 py-2 rounded",
                  "bg-gray-100 text-gray-600",
                  "hover:bg-gray-200",
                  "transition-colors duration-200",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
                disabled={isSubmitting}
              >
                Skip {state.matches("nameInput") && <SadFaceIcon />}
              </button>
              <button
                onClick={handleContinue}
                className={clsx(
                  "px-4 py-2 rounded",
                  "bg-primary text-white",
                  "hover:bg-primary/90",
                  "transition-colors duration-200",
                  "flex items-center",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
                disabled={isSubmitting}
              >
                Continue <ArrowIcon />
              </button>
            </div>
          )}
        </MotionDiv>
      </MotionDiv>
    </div>
  );
};
