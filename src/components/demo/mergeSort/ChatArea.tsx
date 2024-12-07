import { FC } from "react";
import { clsx } from "clsx";
import { H4 } from "../../ui/Typography";
import { MarkdownContainer } from "../../ui/MarkdownContainer";

type Message = {
  id: number;
  role: "tutor" | "student";
  content: string;
  persona?: string;
};

const createMessage = (
  message: Omit<Message, "content"> & { content: string }
): Message => ({
  ...message,
  content: String.raw`${message.content}`,
});

// Temporary mock data - will be moved to state management
const mockMessages: Message[] = [
  createMessage({
    id: 1,
    role: "tutor",
    content: String.raw`
It's great that you're thinking about insertion sort! Let's explore how it works and then we'll dive into its worst-case complexity.

When you use insertion sort, you essentially build a sorted portion of the list one element at a time. You look at each number and find the right place for it in the already sorted part of the list. 

Let's take a closer look at how many comparisons and shifts you might need in the worst-case scenario. 

Imag
1. **First Element (5)**: No comparisons needed, it's the first element.
2. **Second Element (4)**: You compare it with 5. One comparison, and you shift 5 to the right.
3. **Third Element (3)**: You compare it with 5 (1 comparison), then with 4 (another comparison). You shift both 5 and 4 to the right. That's 2 comparisons.
4. **Fourth Element (2)**: You compare it with 5 (1), 4 (2), and 3 (3). You shift all three to the right. That's 3 comparisons.
5. **Fifth Element (1)**: You compare it with 5 (1), 4 (2), 3 (3), and 2 (4). You shift all four to the right. That's 4 comparisons.

Now, let's summarize the comparisons:

- For the first element: 0 comparisons
- For the second element: 1 comparison
- For the third element: 2 comparisons
- For the fourth element: 3 comparisons
- For the fifth element: 4 comparisons

If we add these up, we get:

\[
0 + 1 + 2 + 3 + 4 = 10 \text{ comparisons}
\]

In general, for a list of size \( n \), before?


\[
0 + 1 + 2 + ... + (n-1) = \frac{(n-1) \cdot n}{2}
\]

This sum simplifies to \( O(n^2) \) in big O notation, which means that as the size of the list grows, the time it takes to sort it grows quadratically.

So, in summary, the worst-case time complexity of insertion sort is \( O(n^2) \). 

Does this make sense? Would you like to explore how we might improve upon this sorting method?
    `,
  }),
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
    content:
      "I know they're algorithms that arrange elements in a specific order, usually ascending or descending.",
  },
  {
    id: 2,
    persona: "Curious Charlie",
    content: "I've heard of bubble sort before - is merge sort similar?",
  },
  {
    id: 3,
    persona: "Practical Pat",
    content:
      "I've used sorting in my code before but never really thought about how it works internally.",
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
                "rounded-lg",
                message.role === "tutor" ? "bg-gray-100" : "bg-primary/10"
              )}
            >
              <MarkdownContainer
                content={message.content}
                className={clsx(
                  "p-4",
                  // Override some prose styles for chat messages
                  "prose-p:mb-2 last:prose-p:mb-0",
                  "prose-headings:mb-2",
                  // Adjust text sizes for chat context
                  "prose-p:text-base",
                  "prose-headings:text-lg"
                )}
              />
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
                "hover:border-[#D97757] hover:bg-[#D97757]/5",
                "transition-colors duration-200"
              )}
            >
              <H4 className="text-[#D97757] mb-2">{response.persona}</H4>
              <MarkdownContainer
                content={response.content}
                className={clsx(
                  // Override some prose styles for response options
                  "prose-p:mb-0",
                  "prose-p:text-base",
                  // Disable link styles in buttons
                  "prose-a:no-underline"
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
