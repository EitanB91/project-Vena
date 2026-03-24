"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed + "\n");
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setValue("");
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter to send, Shift+Enter for newline
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
        return;
      }

      // Up arrow — navigate command history
      if (e.key === "ArrowUp" && !value.includes("\n")) {
        e.preventDefault();
        if (history.length === 0) return;
        const nextIndex =
          historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setValue(history[nextIndex]);
        return;
      }

      // Down arrow — navigate command history
      if (e.key === "ArrowDown" && !value.includes("\n")) {
        e.preventDefault();
        if (historyIndex === -1) return;
        const nextIndex = historyIndex + 1;
        if (nextIndex >= history.length) {
          setHistoryIndex(-1);
          setValue("");
        } else {
          setHistoryIndex(nextIndex);
          setValue(history[nextIndex]);
        }
      }
    },
    [handleSend, value, history, historyIndex],
  );

  return (
    <div className="flex items-end gap-2 rounded-lg border border-vena-border bg-vena-surface p-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setHistoryIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? "Connecting to PTY server..." : "Type a command and press Enter..."}
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm text-vena-text placeholder:text-vena-text-muted outline-none scrollbar-thin"
        style={{ maxHeight: 160 }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-vena-accent text-white transition-colors hover:bg-vena-accent-hover disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Send command"
      >
        <SendIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
