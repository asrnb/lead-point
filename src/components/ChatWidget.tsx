"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

const SESSION_STORAGE_KEY = "leadpilot_session_id";
const CAL_COM_LINK = process.env.NEXT_PUBLIC_CAL_COM_LINK;

function getOrCreateSessionId(): string {
  const existing = localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const fresh = crypto.randomUUID();
  localStorage.setItem(SESSION_STORAGE_KEY, fresh);
  return fresh;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [showHint, setShowHint] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) setShowHint(false);
  }, [isOpen]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ sessionId: sessionIdRef.current }),
      }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });
  const isBusy = status === "submitted" || status === "streaming";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed });
    setDraft("");
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex h-[min(28rem,80vh)] w-[min(22rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
          <div className="flex items-center justify-between border-b border-border bg-accent px-4 py-3">
            <span className="text-sm font-medium text-accent-foreground">
              Riverside Dental Clinic
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-accent-foreground/80 hover:text-accent-foreground"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <div className="max-w-[85%] whitespace-pre-wrap rounded-xl bg-background px-3 py-2 text-sm text-foreground">
              Hi! I&apos;m the Riverside Dental Clinic assistant. Ask me anything.
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-accent text-accent-foreground"
                    : "bg-background text-foreground"
                }`}
              >
                {message.parts.map((part, i) => {
                  if (part.type === "text") return <span key={i}>{part.text}</span>;
                  if (part.type === "tool-show_booking") {
                    return (
                      <div
                        key={i}
                        className="mt-2 overflow-hidden rounded-lg border border-border bg-surface"
                      >
                        {CAL_COM_LINK ? (
                          <iframe
                            src={CAL_COM_LINK}
                            className="h-96 w-full"
                            title="Book an appointment"
                          />
                        ) : (
                          <p className="p-2 text-xs text-foreground/60">
                            Booking widget isn&apos;t configured yet.
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ))}

            {status === "submitted" && (
              <div className="max-w-[85%] rounded-xl bg-background px-3 py-2 text-sm text-foreground">
                …
              </div>
            )}
            {status === "error" && (
              <div className="max-w-[85%] rounded-xl bg-background px-3 py-2 text-sm text-red-600">
                {error?.message || "Sorry, something went wrong. Please try again."}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about services, pricing, hours..."
              disabled={isBusy}
              className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isBusy}
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {!isOpen && showHint && (
        <div className="relative max-w-60 animate-[fade-slide-up_0.4s_ease-out] rounded-2xl rounded-br-sm border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-lg">
          <button
            type="button"
            onClick={() => setShowHint(false)}
            aria-label="Dismiss"
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-xs text-foreground/60 hover:bg-foreground/20"
          >
            ✕
          </button>
          👋 Have a question about services, pricing, or booking? Ask me anything!
        </div>
      )}

      <div className="relative">
        {!isOpen && (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-accent opacity-40" />
        )}
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground shadow-lg transition-transform hover:scale-105 hover:opacity-90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M4 4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3v3.5a.5.5 0 0 0 .8.4L13 18h7a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Z" />
          </svg>
          {isOpen ? "Close chat" : "Chat with us"}
        </button>
      </div>
    </div>
  );
}
