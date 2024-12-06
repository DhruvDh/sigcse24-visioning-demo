import { useState } from "react";
import { H1, BodyLarge } from "../ui/Typography";
import { useDemoStore } from "../../lib/store/demoStore";
import { clsx } from "clsx";
import { MotionDiv, containerAnimation, itemAnimation } from "../ui/Motion";

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

export const Introduction = () => {
  const [name, setName] = useState("");
  const [teachingResponse, setTeachingResponse] = useState("");
  const [syntheticResponse, setSyntheticResponse] = useState("");
  const { state, send } = useDemoStore();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleContinue();
    }
  };

  const renderPromptSection = () => {
    if (state.matches("nameInput")) {
      return (
        <>
          <BodyLarge className="text-foreground max-w-3xl mb-8">
            First, would you like to introduce yourself?
          </BodyLarge>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your name..."
            className={clsx(
              "w-full px-8 py-5 text-xl mb-12",
              "border-2 border-primary rounded-lg",
              "font-sans placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "transition-all duration-200",
              "bg-background"
            )}
          />
        </>
      );
    }

    if (state.matches("teachingQuestion")) {
      return (
        <>
          <BodyLarge className="text-foreground max-w-3xl mb-8">
            <span className="text-primary font-medium">
              Hi, {state.context.name}!
            </span>
            <br />
            How do you interpret the idea of &ldquo;Teaching LLMs how to
            Teach&rdquo;?
          </BodyLarge>
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
        </>
      );
    }

    if (state.matches("thankYouTeaching")) {
      return (
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-center py-16"
        >
          <BodyLarge className="text-center">
            <span className="text-primary font-medium text-2xl">
              Thank you for sharing your thoughts!
            </span>
          </BodyLarge>
        </MotionDiv>
      );
    }

    if (state.matches("syntheticQuestion")) {
      return (
        <>
          <BodyLarge className="text-foreground max-w-3xl mb-8">
            <span className="text-primary font-medium">
              Hi, {state.context.name}!
            </span>
            <br />
            How do you interpret the idea of &ldquo;Synthetic Students&rdquo;?
            How do you envision &ldquo;Synthetic Students&rdquo; being used for
            research?
          </BodyLarge>
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
        </>
      );
    }

    return null;
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
    });
  };

  const handleSubmitTeaching = () => {
    send({
      type: "SUBMIT_TEACHING_RESPONSE",
      response: teachingResponse,
    });
  };

  const handleSubmitSynthetic = () => {
    send({
      type: "SUBMIT_SYNTHETIC_RESPONSE",
      response: syntheticResponse,
    });
  };

  const handleSkip = () => {
    if (state.matches("nameInput")) {
      send({ type: "SKIP_NAME" });
    } else if (state.matches("teachingQuestion")) {
      send({
        type: "SUBMIT_TEACHING_RESPONSE",
        response: "",
      });
    } else if (state.matches("syntheticQuestion")) {
      send({
        type: "SUBMIT_SYNTHETIC_RESPONSE",
        response: "",
      });
    }
  };

  const handleContinue = () => {
    if (state.matches("nameInput")) {
      handleSubmitName();
    } else if (state.matches("teachingQuestion")) {
      handleSubmitTeaching();
    } else if (state.matches("syntheticQuestion")) {
      handleSubmitSynthetic();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <MotionDiv
        className="w-full max-w-4xl mx-auto p-8 md:p-12 lg:p-16"
        {...containerAnimation}
      >
        <MotionDiv
          {...itemAnimation}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <H1 className="text-8xl md:text-9xl lg:text-[10rem] mb-4 font-serif tracking-tight">
            Welcome!
          </H1>
        </MotionDiv>

        <MotionDiv
          {...itemAnimation}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="text-2xl md:text-3xl mb-12">
            <span className="text-muted italic font-sans">
              To a concise visioning activity.
            </span>
          </div>
        </MotionDiv>

        <MotionDiv
          {...itemAnimation}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <BodyLarge className="text-foreground max-w-3xl mb-16">
            We encourage and invite interpretations of two questions for the
            future.
          </BodyLarge>
        </MotionDiv>

        <MotionDiv
          className="mt-8 flex justify-end"
          {...itemAnimation}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {state.matches("welcome") ? (
            <button
              onClick={handleBegin}
              className={clsx(
                "px-10 py-5 rounded-lg",
                "font-sans font-medium text-xl",
                "bg-primary text-primary-foreground",
                "transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "flex items-center"
              )}
            >
              Begin Demo
              <ArrowIcon />
            </button>
          ) : (
            <div className="w-full">
              {renderPromptSection()}
              <div className="flex justify-end items-center gap-4">
                <button
                  onClick={handleSkip}
                  className={clsx(
                    "px-10 py-5 rounded-lg",
                    "font-sans font-medium text-xl",
                    "bg-gray-100 text-muted",
                    "hover:bg-gray-200",
                    "transition-colors duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2",
                    "flex items-center"
                  )}
                >
                  Skip
                  <SadFaceIcon />
                </button>
                <button
                  onClick={handleContinue}
                  className={clsx(
                    "px-10 py-5 rounded-lg",
                    "font-sans font-medium text-xl",
                    "bg-primary text-primary-foreground",
                    "transition-colors duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "flex items-center"
                  )}
                >
                  Continue
                  <ArrowIcon />
                </button>
              </div>
            </div>
          )}
        </MotionDiv>
      </MotionDiv>
    </div>
  );
};
