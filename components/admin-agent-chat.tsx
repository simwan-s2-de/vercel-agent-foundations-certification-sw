"use client";

/**
 * Welcome! This is the chat panel you will edit for the workshop!
 *
 * During the workshop you'll connect it to a real agent: swap the
 * local `useState` for `useChat` from the AI SDK, point the form
 * at `sendMessage`, and render each message's `parts` inside
 * `<ConversationContent>`.
 *
 * Workshop docs: https://agent-foundations-certification.vercel.app/docs/admin-chat-agent
 */
import { useChat } from "@ai-sdk/react";
import { WorkflowChatTransport } from "@ai-sdk/workflow/client";
import { SquareTerminal } from "lucide-react";
import { useState } from "react";
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
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

const SUGGESTIONS = [
  "Show me low-stock items",
  "What were yesterday's top sellers?",
  "Summarize this week's revenue",
];

export function AdminAgentChat() {
  const [input, setInput] = useState("");
  const { messages, error, sendMessage, status } = useChat({
    transport: new WorkflowChatTransport({ api: "/api/admin/chat" }),
  });
  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text.trim() || isBusy) return;
    void sendMessage({ text: message.text });
    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isBusy) return;
    void sendMessage({ text: suggestion });
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
                case "tool-bash": {
                  const commandInput = part.input as
                    | { command?: string }
                    | undefined;
                  const output = part.output as
                    | { stdout?: string; stderr?: string }
                    | undefined;
                  const isRunning =
                    part.state === "input-streaming" ||
                    part.state === "input-available";
                  const terminalLabel =
                    part.state === "output-error" ? "Failed" : "Terminal";
                  return (
                    <div
                      key={`${message.id}-${index}`}
                      className="my-2 min-w-0 max-w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 font-mono text-sm"
                    >
                      <div className="flex items-center gap-2 border-b border-neutral-800 bg-neutral-800/50 px-3 py-2 text-neutral-400">
                        <SquareTerminal className="size-4 shrink-0" aria-hidden="true" />
                        <span className="text-xs">
                          {isRunning ? "Running..." : terminalLabel}
                        </span>
                      </div>
                      <div className="px-3 py-2">
                        <pre className="whitespace-pre-wrap font-semibold text-neutral-100 [overflow-wrap:anywhere]">
                          $ {commandInput?.command}
                        </pre>
                        {part.state === "output-available" && output && (
                          <div className="mt-1 text-neutral-300">
                            {output.stdout && (
                              <pre className="whitespace-pre-wrap [overflow-wrap:anywhere]">
                                {output.stdout}
                              </pre>
                            )}
                            {output.stderr && (
                              <pre className="whitespace-pre-wrap text-red-400 [overflow-wrap:anywhere]">
                                {output.stderr}
                              </pre>
                            )}
                          </div>
                        )}
                        {part.state === "output-error" && (
                          <pre role="alert" className="mt-1 whitespace-pre-wrap text-red-400 [overflow-wrap:anywhere]">
                            {part.errorText}
                          </pre>
                        )}
                        {isRunning && (
                          <div className="mt-1 flex items-center gap-1 text-neutral-500">
                            <span className="h-4 w-2 animate-pulse bg-current" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                default:
                  return null;
              }
            }),
          )}
          {error ? <div role="alert">{error.message}</div> : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="flex flex-col gap-3 border-t p-3">
        <Suggestions>
          {SUGGESTIONS.map((s) => (
            <Suggestion
              key={s}
              suggestion={s}
              onClick={handleSuggestionClick}
              disabled={isBusy}
            />
          ))}
        </Suggestions>
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder="Ask the admin agent…"
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
