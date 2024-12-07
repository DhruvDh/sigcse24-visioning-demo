import { fetchEventSource } from "@microsoft/fetch-event-source";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface UseLLMChatOptions {
  onMessage?: (content: string) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export function useLLMChat(options: UseLLMChatOptions = {}) {
  const sendMessage = async (messages: Message[]) => {
    let content = "";
    let isFirstToken = true;

    try {
      await fetchEventSource("https://near-duck-52.deno.dev/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
        onmessage(event) {
          if (event.data === "[DONE]") {
            options.onComplete?.();
            return;
          }

          if (isFirstToken) {
            content = event.data;
            isFirstToken = false;
          } else {
            content += event.data;
          }
          options.onMessage?.(event.data);
        },
        onerror(error) {
          options.onError?.(error);
          throw error;
        },
      });

      return content;
    } catch (error) {
      options.onError?.(error as Error);
      throw error;
    }
  };

  return { sendMessage };
}
