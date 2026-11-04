"use client";

/**
 * Welcome! This is the chat panel you will edit for the workshop!
 *
 * During the workshop you'll connect it to a real agent: swap the
 * local `useState` for `useChat` from the AI SDK, point the form
 * at `sendMessage`, and render each message's `parts` inside
 * `<ConversationContent>`.
 *
 * Workshop docs: https://agent-foundations-certification.vercel.app/docs/chat-agent
 */
import { useChat } from "@ai-sdk/react";
import { WorkflowChatTransport } from "@ai-sdk/workflow/client";
import { useMemo, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import type { ShoppingAgentUIMessage } from "@/lib/agent";
import { AgentProductCard } from "./agent-product-card";
import { AgentProductList } from "./agent-product-list";

export function AgentChat() {
  const [input, setInput] = useState("");
  const activeRunId = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem("active-workflow-run-id") ?? undefined;
  }, []);

  const { messages, error, sendMessage, status } = useChat<ShoppingAgentUIMessage>({
    resume: Boolean(activeRunId),
    transport: new WorkflowChatTransport({
      api: "/api/chat",
      onChatSendMessage: (response) => {
        const runId = response.headers.get("x-workflow-run-id");
        if (runId) localStorage.setItem("active-workflow-run-id", runId);
      },
      onChatEnd: () => localStorage.removeItem("active-workflow-run-id"),
      prepareReconnectToStreamRequest: ({ api, ...rest }) => {
        const runId = localStorage.getItem("active-workflow-run-id");
        if (!runId) throw new Error("No active workflow run ID found");
        return { ...rest, api: `/api/chat/${encodeURIComponent(runId)}/stream` };
      },
    }),
  });
  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text.trim() || isBusy) return;
    void sendMessage({ text: message.text });
    setInput("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Conversation className="flex-1">
        <ConversationContent>
          {messages.map((message) =>
            message.parts.map((part, index) => {
              switch (part.type) {
                case "text":
                  return (
                    <Message key={`${message.id}-${index}`} from={message.role}>
                      <MessageContent>
                        <MessageResponse>{part.text}</MessageResponse>
                      </MessageContent>
                    </Message>
                  );
                case "tool-searchProducts":
                  return (
                    <AgentProductList
                      key={`${message.id}-${index}`}
                      invocation={part}
                    />
                  );
                case "tool-getProductDetails":
                  return (
                    <AgentProductCard
                      key={`${message.id}-${index}`}
                      invocation={part}
                    />
                  );
                default:
                  return null;
              }
            }),
          )}
          {error ? <div role="alert">{error.message}</div> : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t p-3">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder="Ask the agent"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit status={status} disabled={!input.trim() || isBusy} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
