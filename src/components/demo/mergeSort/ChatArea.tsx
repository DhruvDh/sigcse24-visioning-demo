import { FC } from "react";
import { clsx } from "clsx";
import { Body, H4 } from "../../ui/Typography";

type Message = {
  id: number;
  role: "tutor" | "student";
  content: string;
  persona?: string;
};

// Temporary mock data - will be moved to state management
const mockMessages: Message[] = [
  {
    id: 1,
    role: "tutor",
    content: "Let's explore merge sort together. What do you already know about sorting algorithms?",
  },
];

type ResponseOption = {
  id: number;
  persona: string;
  content: string;
};

const mockResponses: ResponseOption[] = [
  {
    id: 1,
    persona: "Analytical Alex",
    content: "I know they're algorithms that arrange elements in a specific order, usually ascending or descending.",
  },
  {
    id: 2,
    persona: "Curious Charlie",
    content: "I've heard of bubble sort before - is merge sort similar?",
  },
  {
    id: 3,
    persona: "Practical Pat",
    content: "I've used sorting in my code before but never really thought about how it works internally.",
  },
];

export const ChatArea: FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {mockMessages.map((message) => (
          <div
            key={message.id}
            className={clsx(
              "mb-6 max-w-3xl",
              message.role === "tutor" ? "ml-0" : "ml-auto"
            )}
          >
            {message.persona && (
              <H4 className="text-primary mb-2">{message.persona}</H4>
            )}
            <div
              className={clsx(
                "p-4 rounded-lg",
                message.role === "tutor"
                  ? "bg-gray-100"
                  : "bg-primary/10"
              )}
            >
              <Body className="mb-0">{message.content}</Body>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 p-6">
        <div className="grid grid-cols-3 gap-4">
          {mockResponses.map((response) => (
            <button
              key={response.id}
              className={clsx(
                "p-4 rounded-lg text-left",
                "border border-gray-200",
                "hover:border-primary hover:bg-primary/5",
                "transition-colors duration-200"
              )}
            >
              <H4 className="text-primary mb-2">{response.persona}</H4>
              <Body className="mb-0">{response.content}</Body>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 